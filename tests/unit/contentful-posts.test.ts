/**
 * R17: Contentful entries become posts that follow the same rules as
 * markdown posts. The samples are the saved answer the test build uses.
 */
import { describe, expect, it } from 'vitest';
import { readSamples } from '../../src/lib/contentful/api.ts';
import { contentfulPosts } from '../../src/lib/contentful/posts.ts';
import { collect, type Asset, type Entry } from '../../src/lib/contentful/types.ts';
import { ContentError, finalizePosts, toPost, type Post } from '../../src/lib/post-model.ts';

const samples = () => collect(readSamples('src/fixtures/contentful/entries.json'));

async function samplePosts(): Promise<Map<string, Post>> {
  const { posts } = await contentfulPosts(samples());
  return new Map(posts.map((post) => [post.slug, post]));
}

const paragraph = (value: string) => ({
  nodeType: 'document',
  data: {},
  content: [
    { nodeType: 'paragraph', data: {}, content: [{ nodeType: 'text', value, marks: [], data: {} }] },
  ],
});

const entry = (id: string, fields: Record<string, unknown>): Entry => ({
  sys: { id, type: 'Entry', contentType: { sys: { id: 'blogPost' } } },
  fields: { title: 'A title', slug: 'a-slug', date: '2026-03-14', ...fields },
});

const content = (posts: Entry[], assets: Asset[] = []) => ({
  posts,
  entries: new Map(posts.map((post) => [post.sys.id, post])),
  assets: new Map(assets.map((asset) => [asset.sys.id, asset])),
});

const one = async (fields: Record<string, unknown>, assets: Asset[] = []) =>
  (await contentfulPosts(content([entry('e1', fields)], assets))).posts[0];

const problemsOf = async (posts: Entry[], assets: Asset[] = []) => {
  const error = await contentfulPosts(content(posts, assets)).catch((caught: Error) => caught);
  expect(error).toBeInstanceOf(ContentError);
  return (error as Error).message;
};

describe('the sample posts', () => {
  it('hides the draft and reports it', async () => {
    const { posts, drafts } = await contentfulPosts(samples());
    expect(drafts).toBe(1);
    expect(posts.map((post) => post.slug).sort()).toEqual([
      'sample-contentful-link-post',
      'sample-contentful-picture-and-code',
      'sample-contentful-post',
      'small-wins',
    ]);
    expect(posts.every((post) => post.source === 'contentful')).toBe(true);
  });

  it('turns an ordinary post into the same shape a markdown post has', async () => {
    const post = (await samplePosts()).get('sample-contentful-post')!;
    expect(post).toMatchObject({
      id: 'contentful:sample-post',
      title: 'A sample post written in Contentful',
      url: '/2026/03/sample-contentful-post/',
      category: 'Code',
      tags: ['Contentful samples', 'plain samples'],
      redirectFrom: [],
      description:
        'A sample post. It shows that a post written in Contentful appears on the site like any other.',
    });
    expect(post.date.toISOString()).toBe('2026-03-14T13:30:00.000Z');
    expect(post.link).toBeUndefined();
    expect(post.image).toBeUndefined();
    // A link to another entry points at that post's address on this site.
    expect(post.html).toContain('<a href="/2026/02/sample-contentful-link-post/">the sample link post</a>');
  });

  it('keeps the address of the article a link post is about', async () => {
    const post = (await samplePosts()).get('sample-contentful-link-post')!;
    expect(post.link).toBe('https://example.com/an-article-worth-reading');
    // No description of its own, so the summary is the start of its text.
    expect(post.description).toMatch(/^A link post points at an article somewhere else/);
  });

  it("uses the post's own share image", async () => {
    const post = (await samplePosts()).get('sample-contentful-picture-and-code')!;
    expect(post.image).toBe(
      'https://images.ctfassets.net/sample-space/sample-share-image/a1b2c3d4e5f60718293a4b5c6d7e8f90/share.png',
    );
  });

  it('renders the picture and the code blocks', async () => {
    const { html } = (await samplePosts()).get('sample-contentful-picture-and-code')!;
    expect(html).toContain(
      '<img src="https://images.ctfassets.net/sample-space/sample-picture/0f1e2d3c4b5a69788796a5b4c3d2e1f0/kettle.jpg?w=1600" ' +
        'alt="A kettle on the stove" width="1600" height="1600" loading="lazy">',
    );
    expect(html).toContain("<figcaption>The picture's description is shown as its caption.</figcaption>");
    expect(html).toContain('data-language="python"');
    expect(html).toContain('class="astro-code monokai-aa no-line-numbers"');
  });

  it('leaves code, captions and alt text out of the summary', async () => {
    const { description } = (await samplePosts()).get('sample-contentful-picture-and-code')!;
    expect(description).toMatch(/^Rich text can hold more than words\./);
    expect(description).not.toContain('wins =');
    expect(description).not.toContain('kettle');
    expect(description).not.toContain('caption');
  });

  it('loses to a markdown post with the same address', async () => {
    const { posts } = await contentfulPosts(samples());
    const markdown = toPost({
      id: '2019-09-07-small-wins',
      source: 'markdown',
      filePath: 'content/blog/2019-09-07-small-wins.md',
      title: 'Small Wins',
      date: new Date('2019-09-07T00:00:00Z'),
      html: '<p>Body</p>',
    });
    const merged = finalizePosts([...posts, markdown]);
    expect(merged.dropped.map((post) => post.id)).toEqual(['contentful:sample-clash']);
    expect(merged.posts.find((post) => post.url === '/2019/09/small-wins/')?.source).toBe('markdown');
    expect(merged.posts.length).toBe(4);
  });
});

describe('dates and addresses', () => {
  it.each([
    // What Contentful stores for each of its three date formats.
    ['2026-03-14', '2026-03-14T00:00:00.000Z', '/2026/03/a-slug/'],
    ['2026-03-14T09:30', '2026-03-14T09:30:00.000Z', '/2026/03/a-slug/'],
    ['2026-03-14T09:30-04:00', '2026-03-14T13:30:00.000Z', '/2026/03/a-slug/'],
    // Late on the last evening of January in New York is already February
    // in UTC, and UTC decides the month, as it does for markdown posts.
    ['2026-01-31T23:30-05:00', '2026-02-01T04:30:00.000Z', '/2026/02/a-slug/'],
  ])('reads %s', async (date, iso, url) => {
    const post = await one({ date });
    expect(post.date.toISOString()).toBe(iso);
    expect(post.url).toBe(url);
  });
});

describe('optional fields', () => {
  it('treats empty fields as absent', async () => {
    const post = await one({ description: ' ', category: '', link: '', tags: null, ogImage: null, draft: null });
    expect(post).toMatchObject({ description: '', tags: [], html: '' });
    expect(post.category).toBeUndefined();
    expect(post.link).toBeUndefined();
    expect(post.image).toBeUndefined();
  });

  it('tidies tags', async () => {
    expect((await one({ tags: [' Swift ', '', 'iOS'] })).tags).toEqual(['Swift', 'iOS']);
  });

  it('prefers the description field to the start of the text', async () => {
    const content = paragraph('The text of the post.');
    expect((await one({ content })).description).toBe('The text of the post.');
    expect((await one({ content, description: 'Its own summary.' })).description).toBe('Its own summary.');
  });

  it('shows a post that says it is not a draft', async () => {
    expect(await one({ draft: false })).toBeDefined();
  });
});

describe('problems in an entry', () => {
  it('names the entry by title and ID', async () => {
    const message = await problemsOf([entry('5KsDBWseXY6QegucYAoacS', { slug: 'Not Clean' })]);
    expect(message).toMatch(/^Problems in Contentful:/);
    expect(message).toContain(
      'Contentful post "A title" (entry 5KsDBWseXY6QegucYAoacS) has the slug "Not Clean". ' +
        'A slug may only contain lowercase letters, digits and single hyphens.',
    );
  });

  it.each([
    [{ title: ' ' }, 'Contentful entry e1 has no title.'],
    [{ slug: undefined }, 'has no slug.'],
    [{ date: undefined }, 'has no date.'],
    [{ date: 'next Tuesday' }, 'has a date that cannot be read: "next Tuesday".'],
    [{ draft: 'yes' }, 'has a draft field that is neither on nor off.'],
    [{ link: 'example.com/article' }, 'has the link "example.com/article", which is not a full http(s) address.'],
    [{ tags: 'swift, ios' }, 'has tags that are not a list of words.'],
    [{ category: ['Code'] }, 'has a category that is not text.'],
    [{ content: 'plain text' }, 'has content that is not rich text.'],
    [
      { ogImage: { sys: { type: 'Link', linkType: 'Asset', id: 'gone' } } },
      'has a share image (ogImage) that is not published.',
    ],
  ])('reports %j', async (fields, problem) => {
    expect(await problemsOf([entry('e1', fields)])).toContain(problem);
  });

  it('refuses a share image that is not a picture', async () => {
    const pdf: Asset = {
      sys: { id: 'pdf', type: 'Asset' },
      fields: { file: { url: '//assets.ctfassets.net/s/pdf/h/a.pdf', contentType: 'application/pdf' } },
    };
    const fields = { ogImage: { sys: { type: 'Link', linkType: 'Asset', id: 'pdf' } } };
    expect(await problemsOf([entry('e1', fields)], [pdf])).toContain(
      'has a share image (ogImage) that is not a picture.',
    );
  });

  it('reports every problem in every entry at once', async () => {
    const message = await problemsOf([
      entry('e1', { title: '', slug: 'Bad Slug' }),
      entry('e2', { title: 'Second', link: 'nope', tags: 3 }),
      entry('e3', {}),
    ]);
    expect(message.split('\n  - ').length - 1).toBe(4);
    expect(message).toContain('Contentful entry e1 has no title.');
    expect(message).toContain('Contentful entry e1 has the slug "Bad Slug".');
    expect(message).toContain('Contentful post "Second" (entry e2) has the link "nope"');
    expect(message).toContain('Contentful post "Second" (entry e2) has tags that are not a list of words.');
  });

  it('does not check a draft', async () => {
    const { posts, drafts } = await contentfulPosts(
      content([entry('e1', { draft: true, slug: 'Not Finished', date: undefined })]),
    );
    expect(posts).toEqual([]);
    expect(drafts).toBe(1);
  });

  it('stops two Contentful posts from sharing an address', async () => {
    const { posts } = await contentfulPosts(content([entry('e1', {}), entry('e2', {})]));
    expect(() => finalizePosts(posts)).toThrow(
      /contentful:e2 and contentful:e1 both have the URL \/2026\/03\/a-slug\//,
    );
  });
});
