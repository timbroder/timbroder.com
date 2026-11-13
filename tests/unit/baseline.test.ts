/**
 * Self-checks on the captured baseline.
 *
 * Later stages compare the new site against these files, so a broken or
 * half-captured baseline has to fail here first.
 */
import { describe, expect, it } from 'vitest';
import {
  loadFeed,
  loadLists,
  loadMeta,
  loadPages,
  loadSite,
  loadUrls,
} from '../lib/baseline.ts';
import {
  classifyPath,
  isListType,
  listRoot,
  toPath,
  withTrailingSlash,
} from '../lib/urls.ts';

const urls = loadUrls();
const pages = loadPages();
const lists = loadLists();
const feed = loadFeed();
const site = loadSite();
const meta = loadMeta();

const byUrl = new Map(pages.map((p) => [p.url, p]));
const posts = pages.filter((p) => p.type === 'post');
const postUrls = new Set(posts.map((p) => p.url));

/** Pages the live site serves without a canonical link. */
const NO_CANONICAL = new Set(['/404.html', '/using-typescript/']);

/**
 * Posts whose title is empty on the live site: one has an unquoted title
 * starting with "#", which YAML reads as a comment, and one has a blank title.
 * Matched by slug because the second post's URL changes every month.
 */
const UNTITLED = ['/heymamma-2/', '/games-i-was-addicted-to-in-2014/'];
const isUntitled = (url: string) => UNTITLED.some((slug) => url.endsWith(slug));

const text = (value: unknown) =>
  typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : '';

describe('baseline: URLs', () => {
  it('is a full capture', () => {
    expect(urls.length).toBeGreaterThanOrEqual(768);
    expect(posts.length).toBeGreaterThanOrEqual(518);
  });

  it('has no duplicates and is sorted', () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect([...urls].sort()).toEqual(urls);
  });

  it('has a page record for every sitemap URL, plus the 404 page', () => {
    const missing = urls.filter((u) => !byUrl.has(u));
    expect(missing).toEqual([]);
    expect(byUrl.has('/404.html')).toBe(true);
    expect(pages.length).toBe(urls.length + 1);
  });

  it('matches the counts in meta.json', () => {
    expect(meta.urls).toBe(urls.length);
    const counts: Record<string, number> = {};
    for (const u of urls) {
      const type = classifyPath(u);
      counts[type] = (counts[type] ?? 0) + 1;
    }
    expect(meta.counts).toEqual(counts);
    expect(meta.feedItems).toBe(feed.items.length);
  });

  it('only contains paths with a trailing slash', () => {
    expect(urls.filter((u) => !u.endsWith('/'))).toEqual([]);
  });
});

describe('baseline: every page', () => {
  it('has a title, a language and analytics', () => {
    expect(pages.filter((p) => !p.head.title).map((p) => p.url)).toEqual([]);
    expect(pages.filter((p) => p.head.lang !== 'en').map((p) => p.url)).toEqual(
      [],
    );
    expect(pages.filter((p) => !p.head.analytics).map((p) => p.url)).toEqual([]);
  });

  it('has a canonical link pointing at itself', () => {
    const wrong = pages.filter((p) => {
      if (NO_CANONICAL.has(p.url)) return p.head.canonical !== null;
      return toPath(p.head.canonical ?? '') !== p.url;
    });
    expect(wrong.map((p) => [p.url, p.head.canonical])).toEqual([]);
  });

  it('has the five navigation items and at most one highlighted', () => {
    const labels = ['Posts', 'Podcasts', 'Projects', 'Talks', 'About'];
    for (const p of pages) {
      expect(p.chrome.nav.map((n) => n.label), p.url).toEqual(labels);
      expect(p.chrome.footerLinks.map((n) => n.label), p.url).toEqual(labels);
      expect(
        p.chrome.nav.filter((n) => n.active).length,
        p.url,
      ).toBeLessThanOrEqual(1);
    }
  });

  it('has the copyright line', () => {
    for (const p of pages) {
      expect(p.chrome.footerText, p.url).toMatch(
        /^© 2007 - \d{4} Tim Broder\. All rights reserved\.$/,
      );
    }
  });

  it('advertises the feed', () => {
    for (const p of pages) {
      const feedLink = p.head.links.find(
        (l) => l.rel === 'alternate' && l.href === '/feed',
      );
      expect(feedLink, p.url).toBeDefined();
    }
  });
});

describe('baseline: posts', () => {
  it('has post facts and a heading for every post', () => {
    for (const p of posts) {
      expect(p.post, p.url).toBeDefined();
      if (!isUntitled(p.url)) expect(p.chrome.heading, p.url).toBeTruthy();
    }
    expect(posts.filter((p) => !p.chrome.heading).length).toBeLessThanOrEqual(
      UNTITLED.length,
    );
  });

  it('has one Article in structured data, matching the heading', () => {
    for (const p of posts) {
      expect(p.head.jsonLd.length, p.url).toBe(1);
      const article = p.head.jsonLd[0] as Record<string, unknown>;
      expect(article['@type'], p.url).toBe('Article');
      expect(text(article.headline), p.url).toBe(text(p.chrome.heading));
    }
  });

  it('highlights "Posts" in the navigation', () => {
    for (const p of posts) {
      expect(
        p.chrome.nav.find((n) => n.active)?.label,
        p.url,
      ).toBe('Posts');
    }
  });

  it('links tags and categories to their archive pages', () => {
    for (const p of posts) {
      for (const tag of p.post!.tags) {
        expect(urls, `${p.url} -> ${tag.href}`).toContain(tag.href);
      }
      const category = p.post!.category;
      if (category) {
        expect(urls, `${p.url} -> ${category.href}`).toContain(category.href);
      }
    }
  });
});

describe('baseline: lists', () => {
  const listPages = pages.filter((p) => isListType(p.type));

  it('has a list entry for every list page', () => {
    expect(Object.keys(lists.pages).sort()).toEqual(
      listPages.map((p) => p.url).sort(),
    );
    for (const [url, entry] of Object.entries(lists.pages)) {
      expect(lists.sequences[entry.sequence], url).toBeDefined();
    }
  });

  it('only lists posts that exist', () => {
    for (const sequence of lists.sequences) {
      for (const href of sequence) {
        expect(postUrls.has(href), href).toBe(true);
        expect(lists.cards[href], href).toBeDefined();
      }
    }
  });

  it('renders each card the same way on every list', () => {
    expect(lists.cardVariants).toEqual([]);
  });

  it('gives every card a title, a date and a call to action', () => {
    for (const [href, card] of Object.entries(lists.cards)) {
      expect(card.title, href).toBeTruthy();
      expect(card.date, href).toBeTruthy();
      expect(['Read article', 'Read commentary'], href).toContain(card.cta);
    }
  });

  it('says "Read commentary" exactly on link posts', () => {
    for (const [href, card] of Object.entries(lists.cards)) {
      const isLinkPost = Boolean(byUrl.get(href)?.post?.originalLink);
      expect(card.cta === 'Read commentary', href).toBe(isLinkPost);
    }
  });

  it('shows the same cards on every page of a list', () => {
    // A quirk of the live site: pagination links exist, but each page of a
    // list renders the whole list. See tests/baseline/README.md.
    const byRoot = new Map<string, Set<number>>();
    for (const [url, entry] of Object.entries(lists.pages)) {
      const root = listRoot(url);
      byRoot.set(root, (byRoot.get(root) ?? new Set()).add(entry.sequence));
    }
    const differing = [...byRoot].filter(([, ids]) => ids.size > 1);
    expect(differing.map(([root]) => root)).toEqual([]);
  });
});

describe('baseline: feed', () => {
  it('has unique guids that equal the item link', () => {
    const guids = feed.items.map((i) => i.guid);
    expect(new Set(guids).size).toBe(guids.length);
    expect(feed.items.filter((i) => i.guid !== i.link)).toEqual([]);
  });

  it('only contains posts that exist', () => {
    const unknown = feed.items
      .map((i) => withTrailingSlash(toPath(i.link)))
      .filter((path) => !postUrls.has(path));
    expect(unknown).toEqual([]);
  });

  it('is sorted newest first', () => {
    const dates = feed.items.map((i) => i.pubDate ?? '');
    expect([...dates].sort().reverse()).toEqual(dates);
  });
});

describe('baseline: site behaviour', () => {
  it('redirects to the trailing-slash, lowercase form', () => {
    expect(site.probes['/about']).toMatchObject({
      status: 301,
      location: '/about/',
    });
    expect(site.probes['/About/']).toMatchObject({
      status: 301,
      location: '/about/',
    });
  });

  it('returns 404 for unknown URLs and serves the feed', () => {
    expect(site.probes['/this-page-does-not-exist/'].status).toBe(404);
    expect(site.probes['/feed'].status).toBe(200);
    expect(site.probes['/feed/'].status).toBe(200);
  });

  it('points robots.txt at the sitemap', () => {
    expect(site.robots).toContain(
      'Sitemap: https://timbroder.com/sitemap-index.xml',
    );
  });
});
