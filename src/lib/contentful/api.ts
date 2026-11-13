/**
 * Reads blog posts from Contentful's Content Delivery API, or from a saved
 * sample of its answers.
 *
 * Which one is decided by the environment:
 *
 *   CONTENTFUL_FIXTURES                              a JSON file of sample answers (tests)
 *   CONTENTFUL_SPACE_ID + CONTENTFUL_ACCESS_TOKEN    the real space
 *   neither                                          no Contentful posts, except in a
 *                                                    production build, which fails
 *
 * A production build that silently went without Contentful would drop
 * posts from the live site, so it stops instead.
 */
import { readFileSync } from 'node:fs';
import { ContentError } from '../post-model.ts';
import { POST_TYPE, type EntriesResponse } from './types.ts';

export type ContentfulSource =
  | { kind: 'samples'; file: string }
  | { kind: 'api'; space: string; token: string; environment: string }
  | { kind: 'off' };

export type Env = Record<string, string | undefined>;

/** Works out where Contentful posts come from. Netlify sets CONTEXT. */
export function contentfulSource(env: Env): ContentfulSource {
  const value = (name: string) => env[name]?.trim() || undefined;
  const production = value('CONTEXT') === 'production';
  const file = value('CONTENTFUL_FIXTURES');
  const space = value('CONTENTFUL_SPACE_ID');
  const token = value('CONTENTFUL_ACCESS_TOKEN');

  if (file) {
    if (production) {
      throw new ContentError(
        'CONTENTFUL_FIXTURES is set in a production build. It shows sample posts and is only for tests. Remove it.',
      );
    }
    return { kind: 'samples', file };
  }
  if (space && token) {
    return { kind: 'api', space, token, environment: value('CONTENTFUL_ENVIRONMENT') ?? 'master' };
  }
  if (space || token) {
    const [have, lack] = space
      ? ['CONTENTFUL_SPACE_ID', 'CONTENTFUL_ACCESS_TOKEN']
      : ['CONTENTFUL_ACCESS_TOKEN', 'CONTENTFUL_SPACE_ID'];
    throw new ContentError(`${have} is set but ${lack} is not. Contentful needs both.`);
  }
  if (production) {
    throw new ContentError(
      'CONTENTFUL_SPACE_ID and CONTENTFUL_ACCESS_TOKEN are not set. A production build needs them: ' +
        'without them the posts written in Contentful would disappear from the site.',
    );
  }
  return { kind: 'off' };
}

export function readSamples(file: string): EntriesResponse[] {
  let parsed: unknown;
  try {
    parsed = JSON.parse(readFileSync(file, 'utf8'));
  } catch (error) {
    throw new ContentError(`CONTENTFUL_FIXTURES: ${file} could not be read (${(error as Error).message}).`);
  }
  return [asEntries(parsed, file)];
}

function asEntries(value: unknown, from: string): EntriesResponse {
  if (!value || typeof value !== 'object' || !Array.isArray((value as EntriesResponse).items)) {
    throw new ContentError(`${from} did not return a list of entries.`);
  }
  return value as EntriesResponse;
}

export interface FetchOptions {
  /** How many entries to ask for at a time. */
  pageSize?: number;
  fetch?: typeof fetch;
  /** Waits between attempts. Replaced in tests. */
  wait?: (ms: number) => Promise<void>;
}

const ATTEMPTS = 3;
/** The longest the build will wait when Contentful says it is being asked too often. */
const LONGEST_WAIT = 15_000;

/**
 * Every published blog post in the space, with the entries and assets the
 * posts link to. Unpublished entries are never returned by this API.
 */
export async function fetchEntries(
  source: Extract<ContentfulSource, { kind: 'api' }>,
  options: FetchOptions = {},
): Promise<EntriesResponse[]> {
  const request = options.fetch ?? fetch;
  const wait = options.wait ?? ((ms: number) => new Promise<void>((done) => setTimeout(done, ms)));
  const base =
    `https://cdn.contentful.com/spaces/${encodeURIComponent(source.space)}` +
    `/environments/${encodeURIComponent(source.environment)}/entries`;

  const fail = (problem: string) => new ContentError(`Contentful: ${problem}`);

  /** One page of entries, or the reason it could not be had. */
  async function page(skip: number, limit: number): Promise<EntriesResponse | 'too-big'> {
    const url = new URL(base);
    url.search = new URLSearchParams({
      content_type: POST_TYPE,
      // Also return what the posts link to, two levels deep: the pictures
      // and code blocks in a post, and anything those link to.
      include: '2',
      // A fixed order, so paging never skips or repeats an entry.
      order: 'sys.createdAt,sys.id',
      limit: String(limit),
      skip: String(skip),
    }).toString();

    let lastProblem = '';
    for (let attempt = 1; attempt <= ATTEMPTS; attempt += 1) {
      let response: Response;
      try {
        // The token goes in a header, so it never appears in an address or a log.
        response = await request(url, { headers: { Authorization: `Bearer ${source.token}` } });
      } catch (error) {
        lastProblem = `the request failed (${(error as Error).message})`;
        if (attempt < ATTEMPTS) await wait(attempt * 1000);
        continue;
      }
      if (response.ok) return asEntries(await response.json(), 'Contentful');

      const body = (await response.json().catch(() => null)) as {
        sys?: { id?: string };
        message?: string;
        details?: { errors?: { name?: string }[] };
      } | null;

      if (response.status === 429) {
        const seconds = Number(response.headers.get('X-Contentful-RateLimit-Reset') ?? 1);
        lastProblem = 'it is being asked too often (429)';
        if (attempt < ATTEMPTS) await wait(Math.min(LONGEST_WAIT, Math.max(1, seconds) * 1000));
        continue;
      }
      if (response.status >= 500) {
        lastProblem = `it answered with an error (${response.status})`;
        if (attempt < ATTEMPTS) await wait(attempt * 1000);
        continue;
      }
      if (response.status === 401) {
        throw fail(
          'it did not accept CONTENTFUL_ACCESS_TOKEN. Use a Content Delivery API token for this space.',
        );
      }
      if (response.status === 404) {
        throw fail(
          `it has no space "${source.space}" with an environment "${source.environment}" that this token can read.`,
        );
      }
      if (body?.details?.errors?.some((error) => error.name === 'unknownContentType')) {
        throw fail(`the space has no content type with the ID "${POST_TYPE}".`);
      }
      if (/response size too big/i.test(body?.message ?? '')) return 'too-big';
      throw fail(`it refused the request (${response.status}${body?.message ? `: ${body.message}` : ''}).`);
    }
    throw fail(`${lastProblem}, ${ATTEMPTS} times in a row.`);
  }

  const pages: EntriesResponse[] = [];
  let limit = options.pageSize ?? 100;
  let skip = 0;
  for (;;) {
    const result = await page(skip, limit);
    if (result === 'too-big') {
      // An answer may hold at most 7 MB. Ask for fewer posts at a time.
      if (limit === 1) throw fail('a single post is too big for it to return.');
      limit = Math.ceil(limit / 2);
      continue;
    }
    pages.push(result);
    skip += result.items.length;
    if (result.items.length === 0 || skip >= result.total) return pages;
  }
}
