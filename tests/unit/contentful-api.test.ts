/** Where Contentful posts come from, and how the API is asked for them. */
import { describe, expect, it } from 'vitest';
import {
  contentfulSource,
  fetchEntries,
  readSamples,
  type FetchOptions,
} from '../../src/lib/contentful/api.ts';
import { collect, type Entry, type EntriesResponse } from '../../src/lib/contentful/types.ts';
import { ContentError } from '../../src/lib/post-model.ts';

const SAMPLES = 'src/fixtures/contentful/entries.json';

describe('contentfulSource', () => {
  const keys = { CONTENTFUL_SPACE_ID: 'space', CONTENTFUL_ACCESS_TOKEN: 'token' };

  it('reads the real space when both settings are there', () => {
    expect(contentfulSource(keys)).toEqual({
      kind: 'api',
      space: 'space',
      token: 'token',
      environment: 'master',
    });
  });

  it('reads another environment when asked', () => {
    expect(contentfulSource({ ...keys, CONTENTFUL_ENVIRONMENT: 'staging' })).toMatchObject({
      environment: 'staging',
    });
  });

  it('prefers the samples when CONTENTFUL_FIXTURES is set', () => {
    expect(contentfulSource({ ...keys, CONTENTFUL_FIXTURES: SAMPLES })).toEqual({
      kind: 'samples',
      file: SAMPLES,
    });
  });

  it('is off without settings, outside production', () => {
    expect(contentfulSource({})).toEqual({ kind: 'off' });
    expect(contentfulSource({ CONTEXT: 'deploy-preview' })).toEqual({ kind: 'off' });
    expect(contentfulSource({ CONTENTFUL_SPACE_ID: '  ', CONTENTFUL_ACCESS_TOKEN: '' })).toEqual({
      kind: 'off',
    });
  });

  it('stops a production build that has no settings', () => {
    expect(() => contentfulSource({ CONTEXT: 'production' })).toThrow(ContentError);
    expect(() => contentfulSource({ CONTEXT: 'production' })).toThrow(/CONTENTFUL_SPACE_ID/);
  });

  it('stops a production build that would show the samples', () => {
    expect(() =>
      contentfulSource({ ...keys, CONTEXT: 'production', CONTENTFUL_FIXTURES: SAMPLES }),
    ).toThrow(/only for tests/);
  });

  it('stops any build that has one setting without the other', () => {
    expect(() => contentfulSource({ CONTENTFUL_SPACE_ID: 'space' })).toThrow(
      /CONTENTFUL_SPACE_ID is set but CONTENTFUL_ACCESS_TOKEN is not/,
    );
    expect(() => contentfulSource({ CONTENTFUL_ACCESS_TOKEN: 'token' })).toThrow(
      /CONTENTFUL_ACCESS_TOKEN is set but CONTENTFUL_SPACE_ID is not/,
    );
  });
});

describe('readSamples', () => {
  it('reads the saved answer', () => {
    const [page] = readSamples(SAMPLES);
    expect(page.items.length).toBe(page.total);
    expect(page.items.length).toBeGreaterThan(0);
  });

  it('says which file is wrong', () => {
    expect(() => readSamples('no/such/file.json')).toThrow(/no\/such\/file\.json could not be read/);
    expect(() => readSamples('package.json')).toThrow(/did not return a list of entries/);
  });
});

const entry = (id: string, type = 'blogPost'): Entry => ({
  sys: { id, type: 'Entry', contentType: { sys: { id: type } } },
  fields: {},
});

const answer = (body: unknown, status = 200, headers: Record<string, string> = {}) =>
  new Response(JSON.stringify(body), { status, headers });

const page = (ids: string[], total: number, includes?: EntriesResponse['includes']) =>
  answer({ total, skip: 0, limit: 100, items: ids.map((id) => entry(id)), includes });

/** A stand-in for the API: answers each request in turn and records what was asked. */
function fakeApi(answers: (Response | Error)[]) {
  const asked: { url: URL; authorization: string | null }[] = [];
  const waits: number[] = [];
  const options: FetchOptions = {
    fetch: (async (url: URL, init?: RequestInit) => {
      asked.push({ url, authorization: new Headers(init?.headers).get('Authorization') });
      const next = answers.shift();
      if (!next) throw new Error('The test asked for more than it prepared.');
      if (next instanceof Error) throw next;
      return next;
    }) as typeof fetch,
    wait: async (ms) => {
      waits.push(ms);
    },
  };
  return { asked, waits, options };
}

const source = { kind: 'api', space: 'my-space', token: 'secret-token', environment: 'master' } as const;

describe('fetchEntries', () => {
  it('asks for blog posts with what they link to, and keeps the token out of the address', async () => {
    const api = fakeApi([page(['a'], 1)]);
    await fetchEntries(source, api.options);
    const { url, authorization } = api.asked[0];
    expect(url.origin + url.pathname).toBe(
      'https://cdn.contentful.com/spaces/my-space/environments/master/entries',
    );
    expect(url.searchParams.get('content_type')).toBe('blogPost');
    expect(url.searchParams.get('include')).toBe('2');
    expect(url.searchParams.get('order')).toBe('sys.createdAt,sys.id');
    expect(authorization).toBe('Bearer secret-token');
    expect(url.href).not.toContain('secret-token');
  });

  it('keeps asking until it has every post', async () => {
    const api = fakeApi([page(['a', 'b'], 5), page(['c', 'd'], 5), page(['e'], 5)]);
    const pages = await fetchEntries(source, { ...api.options, pageSize: 2 });
    expect(api.asked.map(({ url }) => url.searchParams.get('skip'))).toEqual(['0', '2', '4']);
    expect(collect(pages).posts.map((post) => post.sys.id)).toEqual(['a', 'b', 'c', 'd', 'e']);
  });

  it('returns nothing from a space with no posts', async () => {
    const api = fakeApi([page([], 0)]);
    expect(collect(await fetchEntries(source, api.options)).posts).toEqual([]);
    expect(api.asked.length).toBe(1);
  });

  it('tries again when Contentful is busy or fails', async () => {
    const api = fakeApi([
      answer({}, 429, { 'X-Contentful-RateLimit-Reset': '2' }),
      answer({}, 502),
      page(['a'], 1),
    ]);
    const pages = await fetchEntries(source, api.options);
    expect(collect(pages).posts.length).toBe(1);
    expect(api.waits).toEqual([2000, 2000]);
  });

  it('tries again when the request itself fails', async () => {
    const api = fakeApi([new Error('socket hang up'), page(['a'], 1)]);
    expect(collect(await fetchEntries(source, api.options)).posts.length).toBe(1);
  });

  it('gives up after three failures in a row', async () => {
    const api = fakeApi([answer({}, 503), answer({}, 503), answer({}, 503)]);
    await expect(fetchEntries(source, api.options)).rejects.toThrow(
      /Contentful: it answered with an error \(503\), 3 times in a row/,
    );
  });

  it('asks for fewer posts at a time when an answer would be too big', async () => {
    const tooBig = () =>
      answer({ sys: { id: 'BadRequest' }, message: 'Response size too big. Maximum allowed response size: 7340032B.' }, 400);
    const api = fakeApi([tooBig(), tooBig(), page(['a'], 1)]);
    await fetchEntries(source, { ...api.options, pageSize: 100 });
    expect(api.asked.map(({ url }) => url.searchParams.get('limit'))).toEqual(['100', '50', '25']);
  });

  it.each([
    [401, { sys: { id: 'AccessTokenInvalid' } }, /did not accept CONTENTFUL_ACCESS_TOKEN/],
    [404, { sys: { id: 'NotFound' } }, /has no space "my-space" with an environment "master"/],
    [
      400,
      { sys: { id: 'InvalidQuery' }, details: { errors: [{ name: 'unknownContentType', value: 'DOESNOTEXIST' }] } },
      /has no content type with the ID "blogPost"/,
    ],
    [400, { sys: { id: 'BadRequest' }, message: 'Something else.' }, /refused the request \(400: Something else\.\)/],
  ])('explains a %i', async (status, body, message) => {
    const api = fakeApi([answer(body, status)]);
    const failure = await fetchEntries(source, api.options).catch((error: Error) => error);
    expect(failure).toBeInstanceOf(ContentError);
    expect((failure as Error).message).toMatch(message);
    // One request: these are not worth trying again.
    expect(api.asked.length).toBe(1);
    expect((failure as Error).message).not.toContain('secret-token');
  });
});

describe('collect', () => {
  it('gathers posts, the entries they embed and their assets from every page', () => {
    const asset = (id: string) => ({ sys: { id, type: 'Asset' as const }, fields: {} });
    const content = collect([
      {
        total: 3,
        skip: 0,
        limit: 2,
        items: [entry('a'), entry('b')],
        includes: { Entry: [entry('code-1', 'codeBlock')], Asset: [asset('pic-1')] },
      },
      {
        total: 3,
        skip: 2,
        limit: 2,
        items: [entry('c')],
        includes: { Entry: [entry('code-1', 'codeBlock'), entry('a')], Asset: [asset('pic-2')] },
      },
    ]);
    expect(content.posts.map((post) => post.sys.id)).toEqual(['a', 'b', 'c']);
    expect([...content.entries.keys()].sort()).toEqual(['a', 'b', 'c', 'code-1']);
    expect([...content.assets.keys()].sort()).toEqual(['pic-1', 'pic-2']);
  });

  it('does not take an embedded entry for a post', () => {
    const content = collect([{ total: 1, skip: 0, limit: 100, items: [entry('code', 'codeBlock')] }]);
    expect(content.posts).toEqual([]);
  });
});
