/**
 * R13: local images load.
 * R14: the old posts show no image from another host.
 * R15: an image that is gone shows the placeholder.
 */
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { livePages } from '../lib/live.ts';
import { builtPages, exists, newUrlOf, readHtml } from '../lib/dist.ts';
import { loadImageSources, PLACEHOLDER } from '../lib/image-sources.ts';

const pages = [...builtPages()].filter((path) => !path.startsWith('/astrobook/'));
const sources = loadImageSources();

/** Hosts an image may still come from: Contentful serves its own. */
const ALLOWED_HOSTS = /^(https?:)?\/\/(images|assets|downloads)\.ctfassets\.net\//;
const isRemote = (src: string) => /^(https?:)?\/\//.test(src);

/** Every <img> on a page, with where it is. */
function images(page: string): { src: string; inBody: boolean }[] {
  const $ = cheerio.load(readHtml(page));
  return $('img[src]')
    .toArray()
    .map((el) => ({
      src: $(el).attr('src') ?? '',
      inBody: $(el).parents('[itemprop="articleBody"]').length > 0,
    }));
}

const decoded = (src: string) => {
  const path = src.split(/[?#]/)[0];
  try {
    return decodeURIComponent(path);
  } catch {
    return path;
  }
};

describe('R13: local images load', () => {
  it('has a file for every local image on every page', () => {
    const missing: string[] = [];
    for (const page of pages) {
      for (const { src } of images(page)) {
        if (isRemote(src) || src.startsWith('data:')) continue;
        if (!exists(decoded(src))) missing.push(`${page} shows ${src}`);
      }
    }
    expect(missing).toEqual([]);
  });

  it('has the file for every image that was copied from another host', () => {
    const missing = sources
      .filter((source) => source.local && !exists(source.local))
      .map((source) => `${source.local} (was ${source.original})`);
    expect(missing).toEqual([]);
  });
});

describe('R14: the old posts show no image from another host', () => {
  // Every post that existed when the site moved. A post written since may
  // show a remote image; nothing stops that.
  const migrated = livePages()
    .filter((page) => page.post)
    .map((page) => newUrlOf(page.url))
    .filter((url): url is string => url !== null);

  it('covers the migrated posts', () => {
    expect(migrated.length).toBeGreaterThan(500);
  });

  it('finds no remote image in them', () => {
    const remote: string[] = [];
    for (const page of migrated) {
      for (const { src, inBody } of images(page)) {
        if (inBody && isRemote(src) && !ALLOWED_HOSTS.test(src)) remote.push(`${page} shows ${src}`);
      }
    }
    expect(remote).toEqual([]);
  });

  it('no longer shows any address recorded as copied, replaced or removed', () => {
    const old = new Set(sources.map((source) => source.original));
    const still: string[] = [];
    for (const page of pages) {
      for (const { src } of images(page)) if (old.has(src)) still.push(`${page} shows ${src}`);
    }
    expect(still).toEqual([]);
  });
});

describe('R15: an image that is gone shows the placeholder', () => {
  it('has the placeholder file', () => {
    expect(exists(PLACEHOLDER)).toBe(true);
  });

  it('shows the placeholder exactly as often as the record says images are gone', () => {
    const gone = sources.filter((source) => source.source === 'placeholder');
    expect(gone.every((source) => source.local === PLACEHOLDER)).toBe(true);
    const expected = gone.reduce((total, source) => total + source.uses, 0);

    let shown = 0;
    for (const page of pages) {
      shown += images(page).filter(({ src, inBody }) => inBody && src === PLACEHOLDER).length;
    }
    expect(shown).toBe(expected);
    expect(expected).toBeGreaterThan(0);
  });

  it('says where every other image came from', () => {
    for (const source of sources) {
      if (source.source === 'placeholder') continue;
      if (source.source === 'removed') {
        expect(source.local, source.original).toBeNull();
        expect(source.reason, source.original).toBeTruthy();
      } else {
        expect(source.local, source.original).toMatch(/^\/images\/remote\//);
        if (source.source === 'archive') {
          expect(source.archived, source.original).toMatch(/^https:\/\/web\.archive\.org\//);
        }
      }
    }
  });
});
