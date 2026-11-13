/**
 * The live site's baseline, as far as the build in dist/ can match it.
 *
 * The live site has posts written in Contentful, and a build made without
 * the Contentful settings cannot have them: that is every build except
 * Netlify's. Those posts (CONTENTFUL_ON_LIVE) are left out here when the
 * build lacks them, together with the tag pages that only exist because of
 * them. A build that does have them is compared with everything.
 *
 * The smoke tests check those posts where they can exist, on the deployed
 * site, and use the whole baseline (tests/lib/baseline.ts).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import type { PageFacts } from './extract.ts';
import {
  loadFeed,
  loadLists,
  loadPages,
  loadUrls,
  type BaselineFeed,
  type BaselineLists,
} from './baseline.ts';
import { DIST } from './dist.ts';
import { CONTENTFUL_ON_LIVE } from './expected.ts';
import { pageNumber } from './urls.ts';

const POSTS_PER_PAGE = 20;

/** Contentful posts on the live site that this build does not have. */
export const NOT_IN_THIS_BUILD: string[] = CONTENTFUL_ON_LIVE.filter(
  (url) => !existsSync(join(DIST, url, 'index.html')),
);

const leftOut = new Set(NOT_IN_THIS_BUILD);

let lists: BaselineLists | undefined;
let goneListPages: Set<string> | undefined;

/** The lists without those posts, and the list pages that go with them. */
function prepare(): void {
  if (lists) return;
  const all = loadLists();
  if (leftOut.size === 0) {
    lists = all;
    goneListPages = new Set();
    return;
  }
  const sequences = all.sequences.map((sequence) => sequence.filter((url) => !leftOut.has(url)));
  const gone = new Set<string>();
  const pages: BaselineLists['pages'] = {};
  for (const [url, page] of Object.entries(all.pages)) {
    const before = all.sequences[page.sequence].length;
    const after = sequences[page.sequence].length;
    // A list that loses its last post goes, and so does a page of a list
    // that no longer has enough posts to fill it (20 to a page). A list
    // that showed none of these posts is left as it is, empty or not.
    const lost = after < before;
    if (lost && (after === 0 || pageNumber(url) > Math.ceil(after / POSTS_PER_PAGE))) gone.add(url);
    else pages[url] = page;
  }
  const cards = Object.fromEntries(Object.entries(all.cards).filter(([url]) => !leftOut.has(url)));
  lists = { ...all, pages, sequences, cards };
  goneListPages = gone;
}

const isLeftOut = (url: string) => {
  prepare();
  return leftOut.has(url) || goneListPages!.has(url);
};

/** List pages that exist on the live site only because of the posts left out. */
export function listPagesLeftOut(): string[] {
  prepare();
  return [...goneListPages!].sort();
}

export function liveUrls(): string[] {
  return loadUrls().filter((url) => !isLeftOut(url));
}

export function livePages(): PageFacts[] {
  return loadPages().filter((page) => !isLeftOut(page.url));
}

export function liveLists(): BaselineLists {
  prepare();
  return lists!;
}

export function liveFeed(): BaselineFeed {
  const feed = loadFeed();
  const path = (link: string) => {
    const { pathname } = new URL(link);
    return pathname.endsWith('/') ? pathname : `${pathname}/`;
  };
  return { ...feed, items: feed.items.filter((item) => !leftOut.has(path(item.link))) };
}

