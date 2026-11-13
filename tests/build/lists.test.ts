/**
 * R5: every list shows the same posts in the same order as the live site.
 *
 * The live site puts a whole list on every one of its pages. The new site
 * splits it into pages of 20, so the pages are joined back together before
 * comparing.
 */
import { describe, expect, it } from 'vitest';
import { liveLists } from '../lib/live.ts';
import { asBrowserSends, builtPages, readList, resolveRedirect } from '../lib/dist.ts';
import { DROPPED_URLS, MERGED_SPELLINGS, isNewlyListed } from '../lib/expected.ts';
import { listRoot, pageNumber } from '../lib/urls.ts';

const lists = liveLists();
const built = builtPages();

/** The new URL of a post that the baseline lists at `url`. */
function newUrl(url: string): string {
  if (built.has(url)) return url;
  return resolveRedirect(asBrowserSends(url))?.to ?? url;
}

/** Baseline list roots with their page URLs in order. */
const roots = new Map<string, string[]>();
for (const url of Object.keys(lists.pages)) {
  if (url in DROPPED_URLS) continue;
  const root = listRoot(url);
  roots.set(root, [...(roots.get(root) ?? []), url]);
}
for (const pages of roots.values()) pages.sort((a, b) => pageNumber(a) - pageNumber(b));

interface Listed {
  url: string;
  /** The date shown on the card, for example "January 15, 2017". */
  day: string;
}

/** Every card on the new site's pages of a list, in order. */
function builtList(root: string): { pages: Listed[][]; all: Listed[] } {
  const pages: Listed[][] = [];
  let url: string | null = root;
  const seen = new Set<string>();
  while (url && !seen.has(url)) {
    seen.add(url);
    const list = readList(url);
    pages.push(list.cards.map((card) => ({ url: card.href, day: card.date ?? '' })));
    url = list.pagination?.next ?? null;
  }
  return { pages, all: pages.flat() };
}

/** The live site's list, with each post at its new URL. */
function baselineList(root: string): Listed[] {
  return lists.sequences[lists.pages[root].sequence].map((url) => ({
    url: newUrl(url),
    day: lists.cards[url].date ?? '',
  }));
}

/**
 * Posts grouped by day, in list order, with each day's posts sorted. Two
 * lists that differ only in the order of posts within a day come out equal.
 */
function byDay(list: Listed[]): [string, string[]][] {
  const days: [string, string[]][] = [];
  for (const { url, day } of list) {
    const last = days[days.length - 1];
    if (last && last[0] === day) last[1].push(url);
    else days.push([day, [url]]);
  }
  return days.map(([day, urls]) => [day, urls.sort()]);
}

describe('R5: lists show the same posts in the same order', () => {
  it('covers the home page, every tag and every category', () => {
    expect(roots.size).toBeGreaterThan(190);
    expect(roots.has('/')).toBe(true);
  });

  it('lists the same posts, in the same order, on every list', () => {
    const differing: { root: string; expected: unknown; actual: unknown }[] = [];
    for (const [root] of roots) {
      if (root in MERGED_SPELLINGS) continue;
      const expected = byDay(baselineList(root));
      // Three posts the live site never listed now appear; leave them out.
      const actual = byDay(builtList(root).all.filter(({ url }) => !isNewlyListed(url)));
      if (JSON.stringify(expected) !== JSON.stringify(actual)) {
        const at = expected.findIndex((day, i) => JSON.stringify(day) !== JSON.stringify(actual[i]));
        differing.push({ root, expected: expected[at], actual: actual[at] });
      }
    }
    expect(differing).toEqual([]);
  });

  it('adds posts, and loses none, where two spellings of a term now share a list', () => {
    for (const root of Object.keys(MERGED_SPELLINGS)) {
      const before = baselineList(root).map(({ url }) => url);
      const after = builtList(root).all.map(({ url }) => url);
      expect(after.length, root).toBeGreaterThan(before.length);
      expect(before.filter((url) => !after.includes(url)), root).toEqual([]);
    }
  });

  it('orders every list newest first', () => {
    for (const [root] of roots) {
      const times = builtList(root).all.map(({ day }) => Date.parse(`${day} UTC`));
      expect(times.every((t) => !Number.isNaN(t)), root).toBe(true);
      expect([...times].sort((a, b) => b - a), root).toEqual(times);
    }
  });

  it('puts at most 20 posts on a page, and fills every page but the last', () => {
    for (const [root] of roots) {
      const { pages } = builtList(root);
      pages.forEach((page, index) => {
        expect(page.length, `${root} page ${index + 1}`).toBeLessThanOrEqual(20);
        if (index < pages.length - 1) {
          expect(page.length, `${root} page ${index + 1}`).toBe(20);
        }
      });
    }
  });

  it('keeps every page URL the live site has', () => {
    const missing = [...roots.values()].flat().filter((url) => !built.has(url));
    expect(missing).toEqual([]);
  });

  it('links pages together in both directions', () => {
    for (const [root, pages] of roots) {
      const last = readList(pages[pages.length - 1]);
      if (pages.length > 1) {
        expect(readList(root).pagination?.next, root).toBe(pages[1]);
        expect(last.pagination?.prev, root).toBe(pages[pages.length - 2]);
      }
      expect(readList(root).pagination?.prev ?? null, root).toBeNull();
    }
  });

  it('shows the same headline on every list page', () => {
    const differing = Object.entries(lists.pages)
      .filter(([url]) => !(url in DROPPED_URLS))
      .filter(([url, page]) => readList(url).headline !== page.headline)
      .map(([url, page]) => [url, page.headline, readList(url).headline]);
    expect(differing).toEqual([]);
  });
});
