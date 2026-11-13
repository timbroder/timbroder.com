/**
 * R11: the tags in the head of every page match the live site.
 *
 * These are what a search result and a shared link are made from: the
 * title, the description, the canonical address, the Open Graph and Twitter
 * tags, the structured data on posts, and the links to the feed, the
 * manifest, Mastodon and the neighbouring pages of a list.
 *
 * Intended differences are the ones in tests/lib/expected.ts: a post with a
 * new slug has a new address, a repaired post has its real title and date,
 * and a description follows the text of the post where that text changed.
 */
import { describe, expect, it } from 'vitest';
import { livePages } from '../lib/live.ts';
import { builtPages, newUrlOf, readPage } from '../lib/dist.ts';
import {
  MERGED_SPELLINGS,
  PAGE_DESCRIPTION_DIFFERS,
  SUMMARY_DIFFERS,
  isRepaired,
} from '../lib/expected.ts';
import { NOW_RENDERED, isRepairedBody } from '../lib/expected-content.ts';
import type { HeadFacts, PageFacts } from '../lib/extract.ts';

const SITE = 'https://timbroder.com';
const SUFFIX = ' | Tim Broder .com';
const built = builtPages();

interface Pair {
  live: PageFacts;
  /** The address the page has now. */
  url: string;
  now: HeadFacts;
}

/** Baseline pages that still exist, each with the head it has now. */
const pairs: Pair[] = livePages().flatMap((live) => {
  const url =
    live.url === '/404.html'
      ? live.url
      : live.type === 'post'
        ? newUrlOf(live.url)
        : built.has(live.url)
          ? live.url
          : null;
  return url ? [{ live, url, now: readPage(url).head }] : [];
});
const posts = pairs.filter(({ live }) => live.type === 'post');

/** A page whose summary is taken from text that is meant to differ. */
const summaryMayDiffer = ({ live, url }: Pair) =>
  SUMMARY_DIFFERS.includes(url) ||
  url in PAGE_DESCRIPTION_DIFFERS ||
  NOW_RENDERED.has(live.url) ||
  isRepairedBody(live.url) ||
  isRepaired(live.url);

const differing = (test: (pair: Pair) => boolean) => pairs.filter(test).map(({ url }) => url);

/** A description keeps the line breaks of the post on the live site. They mean nothing in a tag. */
const oneLine = (text: string | null | undefined) => (text ?? '').replace(/\s+/g, ' ').trim();

describe('R11: head tags', () => {
  it('compares every page of the live site that still exists', () => {
    expect(pairs.length).toBeGreaterThan(765);
    expect(posts.length).toBeGreaterThanOrEqual(519);
  });

  it('keeps the language and the title', () => {
    expect(differing(({ live, now }) => live.head.lang !== now.lang)).toEqual([]);
    expect(
      differing((pair) => !isRepaired(pair.live.url) && pair.live.head.title !== pair.now.title),
    ).toEqual([]);
  });

  it('gives the repaired posts their real title', () => {
    const repaired = pairs.filter(({ live }) => isRepaired(live.url));
    expect(repaired.length).toBe(3);
    for (const { now } of repaired) {
      expect(now.title).toMatch(/^\S.+ \| Tim Broder \.com$/);
      expect(now.title).not.toMatch(/^null /);
    }
  });

  it('keeps the description, unless the text it is taken from is meant to differ', () => {
    expect(
      differing(
        (pair) => !summaryMayDiffer(pair) && oneLine(pair.live.head.description) !== pair.now.description,
      ),
    ).toEqual([]);
  });

  it('lists a page description as different only while it really is', () => {
    const stale = Object.keys(PAGE_DESCRIPTION_DIFFERS).filter((url) => {
      const pair = pairs.find((candidate) => candidate.url === url);
      return !pair || oneLine(pair.live.head.description) === pair.now.description;
    });
    expect(stale).toEqual([]);
  });

  it('writes every description on one line', () => {
    expect(differing(({ now }) => now.description !== oneLine(now.description))).toEqual([]);
  });

  it('never leaves a page without a description', () => {
    expect(differing(({ now }) => !now.description?.trim())).toEqual([]);
  });

  it('points the canonical address at the page itself', () => {
    expect(
      differing(({ url, now }) => now.canonical !== (url === '/404.html' ? null : `${SITE}${url}`)),
    ).toEqual([]);
    // The live site did the same, so this is no change.
    expect(
      pairs.filter(({ live }) => live.head.canonical !== null && live.head.canonical !== `${SITE}${live.url}`),
    ).toEqual([]);
  });

  it('has the same Open Graph and Twitter tags', () => {
    const wrong = differing(({ live, url, now }) => {
      const title = now.title!.slice(0, -SUFFIX.length);
      const expected = {
        og: {
          'og:title': title,
          'og:description': now.description,
          'og:type': live.head.og['og:type'],
          ...(url === '/404.html' ? {} : { 'og:url': `${SITE}${url}` }),
          'og:image': live.head.og['og:image'],
        },
        twitter: {
          'twitter:card': live.head.twitter['twitter:card'],
          'twitter:title': title,
          'twitter:description': now.description,
          'twitter:image': live.head.twitter['twitter:image'],
        },
      };
      return JSON.stringify(expected.og) !== JSON.stringify(now.og) ||
        JSON.stringify(expected.twitter) !== JSON.stringify(now.twitter);
    });
    expect(wrong).toEqual([]);
  });

  it('repeats the title and description in those tags as the live site did', () => {
    // On the live site the three were always the same text. A few titles
    // there end in a space, which the page title never showed.
    const odd = pairs.filter(
      ({ live }) =>
        !isRepaired(live.url) &&
        (`${live.head.og['og:title'].trim()}${SUFFIX}` !== live.head.title ||
          live.head.og['og:title'] !== live.head.twitter['twitter:title'] ||
          live.head.og['og:description'] !== live.head.description ||
          live.head.twitter['twitter:description'] !== live.head.description),
    );
    expect(odd.map(({ live }) => live.url)).toEqual([]);
  });

  it('has the same links to the feed, the manifest, Mastodon and neighbouring pages', () => {
    const wrong = differing(
      ({ live, url, now }) =>
        !(url in MERGED_SPELLINGS) && JSON.stringify(live.head.links) !== JSON.stringify(now.links),
    );
    expect(wrong).toEqual([]);
  });

  it('describes every post to search engines as the live site did', () => {
    const wrong = posts
      .filter(({ live, url, now }) => {
        const was = live.head.jsonLd[0] as Record<string, unknown>;
        const address = `${SITE}${url}`;
        const expected: Record<string, unknown> = {
          ...was,
          description: oneLine(was.description as string),
          url: address,
          mainEntityOfPage: { '@type': 'WebPage', '@id': address },
        };
        const is = { ...(now.jsonLd[0] as Record<string, unknown>) };
        if (isRepaired(live.url)) {
          // Its title and date were missing or wrong on the live site.
          for (const key of ['headline', 'datePublished', 'description']) {
            delete expected[key];
            delete is[key];
          }
        } else {
          expected.headline = String(was.headline).trim();
          if (summaryMayDiffer({ live, url, now })) {
            delete expected.description;
            delete is.description;
          }
        }
        return now.jsonLd.length !== 1 || JSON.stringify(expected) !== JSON.stringify(is);
      })
      .map(({ url }) => url);
    expect(wrong).toEqual([]);
  });

  it('gives a repaired post a headline and a date in its structured data', () => {
    for (const { now, live } of posts.filter(({ live }) => isRepaired(live.url))) {
      const data = now.jsonLd[0] as Record<string, unknown>;
      expect(data.headline, live.url).toBeTruthy();
      expect(data.datePublished, live.url).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });

  it('has structured data on posts only', () => {
    expect(differing(({ live, now }) => live.type !== 'post' && now.jsonLd.length > 0)).toEqual([]);
  });

  it('gives every page the same head whether or not the live site had it', () => {
    // Pages that are new (the three newly listed posts are not new pages).
    const others = [...built].filter(
      (url) => !url.startsWith('/astrobook/') && !pairs.some((pair) => pair.url === url),
    );
    for (const url of others) {
      const { head } = readPage(url);
      expect(head.canonical, url).toBe(`${SITE}${url}`);
      expect(head.og['og:url'], url).toBe(`${SITE}${url}`);
      expect(head.links.some((link) => link.href === '/feed'), url).toBe(true);
    }
  });
});
