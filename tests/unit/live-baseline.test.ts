/**
 * The baseline is compared with builds that have no Contentful posts, so
 * the Contentful posts on the live site are left out of it for them.
 */
import { describe, expect, it } from 'vitest';
import { loadFeed, loadLists, loadPages, loadUrls } from '../lib/baseline.ts';
import { CONTENTFUL_ON_LIVE } from '../lib/expected.ts';
import {
  NOT_IN_THIS_BUILD,
  listPagesLeftOut,
  liveFeed,
  liveLists,
  livePages,
  liveUrls,
} from '../lib/live.ts';

describe('posts on the live site that come from Contentful', () => {
  it('are pages of the live site', () => {
    const urls = loadUrls();
    for (const url of CONTENTFUL_ON_LIVE) expect(urls, url).toContain(url);
  });

  it('are in the live feed with a guid that ends in a slash, unlike a markdown post', () => {
    const { items } = loadFeed();
    for (const url of CONTENTFUL_ON_LIVE) {
      expect(items.map((item) => item.guid)).toContain(`https://timbroder.com${url}`);
    }
    const others = items.filter((item) => !CONTENTFUL_ON_LIVE.includes(`${new URL(item.guid).pathname}`));
    expect(others.filter((item) => item.guid.endsWith('/'))).toEqual([]);
  });
});

// These hold whether or not the build has the posts. When it has them,
// nothing is left out and the lists below are empty.
describe('the baseline a build is compared with', () => {
  const gone = new Set([...NOT_IN_THIS_BUILD, ...listPagesLeftOut()]);

  it('leaves out only Contentful posts and the list pages that existed for them', () => {
    expect(NOT_IN_THIS_BUILD.every((url) => CONTENTFUL_ON_LIVE.includes(url))).toBe(true);
    expect(loadUrls().filter((url) => !liveUrls().includes(url)).sort()).toEqual([...gone].sort());
    expect(loadPages().length - livePages().length).toBe(gone.size);
  });

  it('leaves out a list page only if every post on it was one of those', () => {
    const all = loadLists();
    for (const url of listPagesLeftOut()) {
      const posts = all.sequences[all.pages[url].sequence];
      const kept = posts.filter((post) => !NOT_IN_THIS_BUILD.includes(post));
      // Either the list is empty now, or it no longer fills this page.
      expect(kept.length === 0 || kept.length <= 20 * (Number(url.match(/\/page\/(\d+)\/$/)?.[1] ?? 1) - 1), url).toBe(true);
    }
  });

  it('keeps a list that never showed those posts, even an empty one', () => {
    // The live site has a tag page with no cards: its only post was unlisted.
    expect(loadLists().pages).toHaveProperty('/tag/apps/');
    expect(liveLists().pages).toHaveProperty('/tag/apps/');
  });

  it('takes the posts out of every list and out of the feed', () => {
    const lists = liveLists();
    for (const url of NOT_IN_THIS_BUILD) {
      expect(lists.sequences.some((sequence) => sequence.includes(url)), url).toBe(false);
      expect(lists.cards).not.toHaveProperty(url);
      expect(liveFeed().items.some((item) => item.link.includes(url)), url).toBe(false);
    }
    expect(loadFeed().items.length - liveFeed().items.length).toBe(NOT_IN_THIS_BUILD.length);
  });
});
