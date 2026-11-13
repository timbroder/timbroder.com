/**
 * Loads the baseline captured from the live site (see tests/baseline/README.md).
 */
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import type { CardFacts, FeedFacts, ListFacts, PageFacts } from './extract.ts';
import type { PageType } from './urls.ts';

const DIR = join(dirname(fileURLToPath(import.meta.url)), '..', 'baseline');

const read = (name: string) => readFileSync(join(DIR, name), 'utf8');

export interface BaselineMeta {
  capturedAt: string;
  origin: string;
  mainSha: string | null;
  urls: number;
  counts: Partial<Record<PageType, number>>;
  feedItems: number;
}

export interface BaselineLists {
  /** One entry per list page. */
  pages: Record<
    string,
    {
      headline: string | null;
      pagination: ListFacts['pagination'];
      /** Index into `sequences`. */
      sequence: number;
    }
  >;
  /** Ordered post URLs. Pages that show the same cards share a sequence. */
  sequences: string[][];
  /** Card details, stored once per post URL. */
  cards: Record<string, CardFacts>;
  /** Cards that rendered differently on different list pages (expected: none). */
  cardVariants: { href: string; page: string; card: CardFacts }[];
}

export interface BaselineFeed extends FeedFacts {
  contentType: string | null;
  bytes: number;
}

export interface BaselineSite {
  probes: Record<
    string,
    { status: number; contentType: string | null; location: string | null }
  >;
  robots: string;
  manifest: Record<string, unknown> | null;
}

export function loadUrls(): string[] {
  return read('urls.txt').split('\n').filter(Boolean);
}

/** Every sitemap page plus the 404 page. List pages have no `list` here. */
export function loadPages(): PageFacts[] {
  return read('pages.jsonl')
    .split('\n')
    .filter(Boolean)
    .map((line) => JSON.parse(line) as PageFacts);
}

export function loadLists(): BaselineLists {
  return JSON.parse(read('lists.json')) as BaselineLists;
}

export function loadFeed(): BaselineFeed {
  return JSON.parse(read('feed.json')) as BaselineFeed;
}

export function loadSite(): BaselineSite {
  return JSON.parse(read('site.json')) as BaselineSite;
}

export function loadMeta(): BaselineMeta {
  return JSON.parse(read('meta.json')) as BaselineMeta;
}
