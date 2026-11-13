/**
 * R17: a post written in Contentful works like a markdown post.
 *
 * The other build tests read dist/, which is built without Contentful posts
 * and compared with the live site. This one builds the site a second time,
 * into dist-samples/, with the saved sample answers standing in for the real
 * space (`npm run build:samples`), and reads that.
 *
 * The samples (src/fixtures/contentful/entries.json) are an ordinary post, a
 * link post, a draft, a post with a picture and code, and a post at the
 * address of a markdown post.
 */
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { beforeAll, describe, expect, it } from 'vitest';
import { builtPages, readPage } from '../lib/dist.ts';
import {
  extractFeed,
  extractPage,
  type CardFacts,
  type ListFacts,
  type PageFacts,
} from '../lib/extract.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const OUT = join(ROOT, 'dist-samples');

const POST = '/2026/03/sample-contentful-post/';
const LINK_POST = '/2026/02/sample-contentful-link-post/';
const RICH_POST = '/2026/01/sample-contentful-picture-and-code/';
const DRAFT = '/2026/04/sample-contentful-draft/';
const CLASH = '/2019/09/small-wins/';
const SAMPLES = [POST, LINK_POST, RICH_POST];
const SAMPLE_TAGS = [
  'contentful-samples',
  'plain-samples',
  'rich-text-samples',
  'hidden-samples',
  'clashing-samples',
];

/** Words that only the draft and the losing post contain. */
const HIDDEN = ['A sample draft that stays hidden', "at a markdown post's address", 'must not be shown'];

beforeAll(() => {
  try {
    execFileSync('npm', ['run', 'build:samples'], { cwd: ROOT, stdio: 'pipe' });
  } catch (error) {
    const { stdout, stderr } = error as { stdout?: Buffer; stderr?: Buffer };
    const output = `${stdout ?? ''}${stderr ?? ''}`.split('\n').slice(-30).join('\n');
    throw new Error(`The site did not build with the sample Contentful posts:\n${output}`);
  }
}, 180_000);

const file = (path: string) => join(OUT, path.endsWith('/') ? `${path}index.html` : path);
const built = (path: string) => existsSync(file(path));
const read = (path: string) => readFileSync(file(path), 'utf8');
const page = (url: string): PageFacts => extractPage(url, read(url));

/** Every card of a list, across its pages. */
function cards(root: string): CardFacts[] {
  const all: CardFacts[] = [];
  const seen = new Set<string>();
  let url: string | null = root;
  while (url && !seen.has(url)) {
    seen.add(url);
    const list: ListFacts = page(url).list!;
    all.push(...list.cards);
    url = list.pagination?.next ?? null;
  }
  return all;
}

function everyFile(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) everyFile(path, found);
    else if (/\.(html|xml|txt)$/.test(name) || name === 'feed') found.push(path);
  }
  return found;
}

describe('R17: Contentful posts', () => {
  it('says in the page head that it shows the samples', () => {
    expect(read('/')).toContain('<meta name="build-contentful" content="samples: 3 posts">');
  });

  it('builds a page for each published post', () => {
    for (const url of SAMPLES) expect(built(url), url).toBe(true);
  });

  it('shows a post like a markdown post: title, date, tags and category', () => {
    const { head, post } = page(POST);
    expect(head.title).toBe('A sample post written in Contentful | Tim Broder .com');
    expect(head.description).toBe(
      'A sample post. It shows that a post written in Contentful appears on the site like any other.',
    );
    expect(head.canonical).toBe(`https://timbroder.com${POST}`);
    expect(post).toMatchObject({
      date: 'March 14, 2026',
      dateTime: '2026-03-14',
      tags: [
        { label: 'Contentful samples', href: '/tag/contentful-samples/' },
        { label: 'plain samples', href: '/tag/plain-samples/' },
      ],
      category: { label: 'Code', href: '/category/code/' },
      originalLink: null,
    });
    expect(post!.body.text).toMatch(/^This is a sample post\./);
    expect(post!.body.counts).toMatchObject({ lists: 1, blockquotes: 1 });
  });

  it('links from one Contentful post to another by its address here', () => {
    expect(page(POST).post!.body.links).toContain(LINK_POST);
    expect(built(LINK_POST)).toBe(true);
  });

  it('shows a link post like a markdown one', () => {
    const { post } = page(LINK_POST);
    expect(post!.originalLink).toBe('https://example.com/an-article-worth-reading');
    const card = cards('/').find(({ href }) => href === LINK_POST)!;
    expect(card.cta).toBe('Read commentary');
    expect(card.category).toBe('Commentary');
    // It has no description, so its summary is the start of its text.
    expect(card.description).toMatch(/^A link post points at an article somewhere else/);
  });

  it('lists the posts on the home page, in date order among the markdown posts', () => {
    const home = cards('/');
    const at = (url: string) => home.findIndex(({ href }) => href === url);
    for (const url of SAMPLES) expect(at(url), url).toBeGreaterThan(-1);
    expect(at(POST)).toBeLessThan(at(LINK_POST));
    expect(at(LINK_POST)).toBeLessThan(at(RICH_POST));

    // Newer posts above, older ones below: the markdown posts around them.
    const day = (card: CardFacts) => new Date(`${card.date} UTC`).getTime();
    expect(day(home[at(POST) - 1])).toBeGreaterThanOrEqual(day(home[at(POST)]));
    expect(day(home[at(RICH_POST) + 1])).toBeLessThanOrEqual(day(home[at(RICH_POST)]));
    expect(page(home[at(RICH_POST) + 1].href).post).toBeDefined();

    expect(home[at(POST)]).toMatchObject({
      title: 'A sample post written in Contentful',
      date: 'March 14, 2026',
      category: 'Code',
      cta: 'Read article',
    });
  });

  it('gives the posts tag and category pages', () => {
    // The samples' tags are their own: no markdown post has them.
    for (const tag of SAMPLE_TAGS) {
      expect(builtPages().has(`/tag/${tag}/`), `a markdown post uses the tag ${tag}`).toBe(false);
    }
    expect(cards('/tag/contentful-samples/').map(({ href }) => href)).toEqual(SAMPLES);
    expect(page('/tag/contentful-samples/').list!.headline).toBe('Tag: Contentful samples');
    expect(cards('/tag/plain-samples/').map(({ href }) => href)).toEqual([POST]);
    expect(cards('/tag/rich-text-samples/').map(({ href }) => href)).toEqual([RICH_POST]);

    // Categories they share with markdown posts.
    const inCategory = (slug: string) => cards(`/category/${slug}/`).map(({ href }) => href);
    expect(inCategory('code')).toEqual(expect.arrayContaining([POST, RICH_POST]));
    expect(inCategory('commentary')).toContain(LINK_POST);
    expect(inCategory('code').length).toBeGreaterThan(2);
  });

  it('puts the posts in the feed and the sitemap', () => {
    const feed = extractFeed(read('/feed'));
    const sitemap = read('/sitemap-0.xml');
    for (const url of SAMPLES) {
      const item = feed.items.find(({ link }) => link === `https://timbroder.com${url}`);
      expect(item, url).toBeDefined();
      expect(item!.contentLength).toBeGreaterThan(50);
      expect(item!.guid).toBe(`https://timbroder.com${url.replace(/\/$/, '')}`);
      expect(sitemap).toContain(`<loc>https://timbroder.com${url}</loc>`);
    }
    expect(feed.items.find(({ link }) => link.endsWith(POST))).toMatchObject({
      title: 'A sample post written in Contentful',
      pubDate: '2026-03-14T13:30:00.000Z',
    });
  });

  it('hides the draft everywhere', () => {
    expect(built(DRAFT)).toBe(false);
    expect(built('/tag/hidden-samples/')).toBe(false);
  });

  it('lets the markdown post keep an address that both have', () => {
    // The page is the markdown post, exactly as in the build without Contentful.
    const { post, head } = page(CLASH);
    const markdown = readPage(CLASH);
    expect(head.title).toBe(markdown.head.title);
    expect(post).toEqual(markdown.post);
    expect(built('/tag/clashing-samples/')).toBe(false);
    expect(cards('/').filter(({ href }) => href === CLASH).length).toBe(1);
    expect(extractFeed(read('/feed')).items.filter(({ link }) => link.endsWith(CLASH)).length).toBe(1);
  });

  it('shows nothing of the draft or of the post that lost its address, on any page', () => {
    const files = everyFile(OUT);
    expect(files.length).toBeGreaterThan(700);
    const leaks = files.filter((path) => {
      const text = readFileSync(path, 'utf8');
      return HIDDEN.some((words) => text.includes(words) || text.includes(words.replace(/'/g, '&#39;')));
    });
    expect(leaks).toEqual([]);
  });

  it('shows a picture from Contentful with its alt text, size and caption', () => {
    const html = read(RICH_POST);
    const { body } = page(RICH_POST).post!;
    expect(body.images).toEqual([
      {
        src: 'https://images.ctfassets.net/sample-space/sample-picture/0f1e2d3c4b5a69788796a5b4c3d2e1f0/kettle.jpg?w=1600',
        alt: 'A kettle on the stove',
      },
    ]);
    expect(html).toMatch(/<img [^>]*width="1600" height="1600"/);
    expect(html).toContain("<figcaption>The picture's description is shown as its caption.</figcaption>");
  });

  it("uses a post's own share image in link previews, and the site's for the rest", () => {
    const share =
      'https://images.ctfassets.net/sample-space/sample-share-image/a1b2c3d4e5f60718293a4b5c6d7e8f90/share.png';
    const rich = page(RICH_POST).head;
    expect(rich.og['og:image']).toBe(share);
    expect(rich.twitter['twitter:image']).toBe(share);
    expect((rich.jsonLd[0] as { image: string }).image).toBe(share);

    const plain = page(POST).head;
    expect(plain.og['og:image']).toBe('https://timbroder.com/og-image.png');
    expect((plain.jsonLd[0] as { image: string }).image).toBe('https://timbroder.com/og-image.png');
  });

  it('describes a Contentful post to search engines like any other', () => {
    expect(page(POST).head.jsonLd).toEqual([
      expect.objectContaining({
        '@type': 'Article',
        headline: 'A sample post written in Contentful',
        url: `https://timbroder.com${POST}`,
        datePublished: '2026-03-14',
      }),
    ]);
  });

  it('highlights code exactly as a markdown post does', () => {
    const { body } = page(RICH_POST).post!;
    expect(body.code).toEqual([
      'wins = ["small", "big"]\n\nfor win in wins:\n    print(f"A {win} win")',
      'npm run build && npm test',
    ]);

    const opening = (html: string, language: string) =>
      html.match(new RegExp(`<pre [^>]*data-language="${language}"[^>]*>`))?.[0];
    const fromContentful = opening(read(RICH_POST), 'python');
    // A markdown post with a Python code block, from the same build.
    const markdownPost = cards('/tag/python/')
      .map(({ href }) => read(href))
      .find((html) => opening(html, 'python'));
    expect(markdownPost, 'a markdown post with Python in it').toBeDefined();
    expect(fromContentful).toBe(opening(markdownPost!, 'python'));

    // The second block asked for no line numbers.
    expect(opening(read(RICH_POST), 'bash')).toContain('class="astro-code monokai-aa no-line-numbers"');
  });

  it('renders the rest of the rich text', () => {
    const { body } = page(RICH_POST).post!;
    expect(body.headings).toEqual([
      { level: 2, text: 'A picture' },
      { level: 2, text: 'Code' },
      { level: 3, text: 'The rest' },
    ]);
    expect(body.counts).toMatchObject({ tables: 1, lists: 1 });
    expect(body.text).toContain('A closing line with <angle brackets> & an ampersand, broken in two');
    expect(read(RICH_POST)).toContain('an ampersand,<br>broken in two');
  });
});
