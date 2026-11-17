/**
 * R11: the tags in the head of every page.
 *
 * These are what a search result and a shared link are made from: the
 * title, the description, the canonical address, the Open Graph and Twitter
 * tags, the structured data on posts, and the links to the feed, the
 * manifest and Mastodon.
 *
 * The values are the ones the Gatsby site had; they were compared with it
 * page by page until the day this site replaced it. These tests hold the
 * rules those values follow, on whatever pages the build has.
 */
import { describe, expect, it } from 'vitest';
import { builtPages, readPage } from '../lib/dist.ts';
import type { HeadFacts } from '../lib/extract.ts';

const SITE = 'https://timbroder.com';
const SUFFIX = ' | Tim Broder .com';
const DEFAULT_IMAGE = `${SITE}/og-image.png`;
const FEED = { rel: 'alternate', href: '/feed', type: 'application/rss+xml', title: 'TimBroder.com RSS Feed' };
const FEEDBURNER = { ...FEED, href: 'https://feeds.feedburner.com/timbroder' };
const MANIFEST = { rel: 'manifest', href: '/manifest.webmanifest' };
const MASTODON = { rel: 'me', href: 'https://masto.ai/@timothybroder' };

const isPost = (url: string) => /^\/\d{4}\/\d{2}\/[^/]+\/$/.test(url);
const isHomeList = (url: string) => url === '/' || /^\/page\/\d+\/$/.test(url);

interface Page {
  url: string;
  head: HeadFacts;
}

const pages: Page[] = [...builtPages(), '/404.html']
  .filter((url) => !url.startsWith('/astrobook/'))
  .map((url) => ({ url, head: readPage(url).head }));

const failing = (test: (page: Page) => boolean) => pages.filter(test).map(({ url }) => url);

/** True when the head has exactly this link. Key order does not matter. */
const has = (head: HeadFacts, link: Record<string, string>) =>
  head.links.some(
    (candidate) =>
      Object.keys(candidate).length === Object.keys(link).length &&
      Object.entries(link).every(([key, value]) => (candidate as unknown as Record<string, string>)[key] === value),
  );

describe('R11: head tags', () => {
  it('covers every page of the site', () => {
    expect(pages.length).toBeGreaterThan(765);
  });

  it('gives every page a language and a title that ends with the site name', () => {
    expect(failing(({ head }) => head.lang !== 'en')).toEqual([]);
    expect(
      failing(({ head }) => !head.title?.endsWith(SUFFIX) || head.title.length <= SUFFIX.length),
    ).toEqual([]);
  });

  it('gives every page a description, on one line', () => {
    expect(
      failing(
        ({ head }) =>
          !head.description || head.description !== head.description.replace(/\s+/g, ' ').trim(),
      ),
    ).toEqual([]);
  });

  it('points the canonical address at the page itself', () => {
    expect(
      failing(({ url, head }) => head.canonical !== (url === '/404.html' ? null : `${SITE}${url}`)),
    ).toEqual([]);
  });

  it('repeats the title, description and address in the Open Graph and Twitter tags', () => {
    const wrong = failing(({ url, head }) => {
      const title = head.title!.slice(0, -SUFFIX.length);
      const image = head.og['og:image'];
      const og = {
        'og:title': title,
        'og:description': head.description,
        'og:type': 'website',
        ...(url === '/404.html' ? {} : { 'og:url': `${SITE}${url}` }),
        'og:image': image,
      };
      const twitter = {
        'twitter:card': 'summary_large_image',
        'twitter:title': title,
        'twitter:description': head.description,
        'twitter:image': image,
      };
      return JSON.stringify(og) !== JSON.stringify(head.og) || JSON.stringify(twitter) !== JSON.stringify(head.twitter);
    });
    expect(wrong).toEqual([]);
  });

  it("uses the site's picture for link previews, unless a post has its own", () => {
    // Only a post from Contentful can have one; tests/build/contentful.test.ts covers that.
    expect(
      failing(({ url, head }) => {
        const image = head.og['og:image'];
        return isPost(url) ? !/^https:\/\/\S+$/.test(image) : image !== DEFAULT_IMAGE;
      }),
    ).toEqual([]);
  });

  it('links every page to the feed and the manifest', () => {
    expect(failing(({ head }) => !has(head, FEED) || !has(head, MANIFEST))).toEqual([]);
  });

  it('links to Feedburner and Mastodon from the pages of the home list, and from no other', () => {
    expect(
      failing(
        ({ url, head }) =>
          has(head, FEEDBURNER) !== isHomeList(url) || has(head, MASTODON) !== isHomeList(url),
      ),
    ).toEqual([]);
  });

  it('has no head link beyond those and the ones between the pages of a list', () => {
    const known = [FEED, FEEDBURNER, MANIFEST, MASTODON];
    expect(
      failing(({ head }) =>
        head.links.some(
          (link) =>
            link.rel !== 'prev' &&
            link.rel !== 'next' &&
            !known.some((candidate) => candidate.rel === link.rel && candidate.href === link.href),
        ),
      ),
    ).toEqual([]);
  });

  it('describes every post to search engines, and nothing else', () => {
    const person = { '@type': 'Person', name: 'Tim Broder', url: SITE };
    const wrong = failing(({ url, head }) => {
      if (!isPost(url)) return head.jsonLd.length !== 0;
      const address = `${SITE}${url}`;
      const [data] = head.jsonLd as Record<string, unknown>[];
      const expected = {
        '@context': 'https://schema.org',
        '@type': 'Article',
        headline: head.title!.slice(0, -SUFFIX.length),
        // A post with no text has no summary of its own: its page falls back
        // on the site's description, and its structured data gives none.
        description: data?.description === '' ? '' : head.description,
        url: address,
        datePublished: readPage(url).post!.dateTime,
        author: person,
        publisher: person,
        image: head.og['og:image'],
        mainEntityOfPage: { '@type': 'WebPage', '@id': address },
      };
      return head.jsonLd.length !== 1 || JSON.stringify(expected) !== JSON.stringify(data);
    });
    expect(wrong).toEqual([]);
  });

  it('gives every post a date in its structured data', () => {
    expect(
      failing(
        ({ url, head }) =>
          isPost(url) &&
          !/^\d{4}-\d{2}-\d{2}$/.test(String((head.jsonLd[0] as Record<string, unknown>)?.datePublished)),
      ),
    ).toEqual([]);
  });
});
