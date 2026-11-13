/**
 * R9: the feed is unchanged for the people subscribed to it.
 *
 * A feed reader knows a post by its guid. If one changed, every subscriber
 * would see that post again as new, so every guid in the live feed has to
 * be in the new one.
 */
import * as cheerio from 'cheerio';
import sax from 'sax';
import { describe, expect, it } from 'vitest';
import { loadFeed } from '../lib/baseline.ts';
import { builtPages, exists, readHtml } from '../lib/dist.ts';
import { isNewlyListed } from '../lib/expected.ts';
import { extractFeed } from '../lib/extract.ts';

const SITE = 'https://timbroder.com';
const xml = readHtml('/feed');
const feed = extractFeed(xml);
const live = loadFeed();

const $ = cheerio.load(xml, { xml: true });
const contents = $('item')
  .toArray()
  .map((item) => ({
    link: $(item).children('link').text(),
    html: $(item).children('content\\:encoded').text(),
  }));

const posts = [...builtPages()].filter((path) => /^\/\d{4}\/\d{2}\/[^/]+\/$/.test(path));

describe('R9: the feed', () => {
  it('is well-formed XML', () => {
    const parser = sax.parser(true);
    const errors: string[] = [];
    parser.onerror = (error) => {
      errors.push(error.message.split('\n')[0]);
      parser.resume();
    };
    parser.write(xml).close();
    expect(errors).toEqual([]);
    expect(xml.startsWith('<?xml version="1.0" encoding="UTF-8"?>')).toBe(true);
  });

  it('has the same title, description and link as the live feed', () => {
    expect(feed.title).toBe(live.title);
    expect(feed.description).toBe(live.description);
    expect(feed.link).toBe(live.link);
  });

  it('has one item for every post', () => {
    expect(feed.items.map((item) => new URL(item.link).pathname).sort()).toEqual([...posts].sort());
  });

  it('keeps every guid of the live feed', () => {
    const guids = new Set(feed.items.map((item) => item.guid));
    expect(live.items.map((item) => item.guid).filter((guid) => !guids.has(guid))).toEqual([]);
    expect(guids.size).toBe(feed.items.length);
  });

  it('adds only the posts the live feed left out', () => {
    const known = new Set(live.items.map((item) => item.guid));
    const added = feed.items.filter((item) => !known.has(item.guid));
    expect(added.length).toBe(3);
    expect(added.filter((item) => !isNewlyListed(new URL(item.link).pathname))).toEqual([]);
  });

  it('keeps the date of every item', () => {
    const dates = new Map(feed.items.map((item) => [item.guid, item.pubDate]));
    expect(live.items.filter((item) => dates.get(item.guid) !== item.pubDate)).toEqual([]);
  });

  it('lists the newest post first', () => {
    const times = feed.items.map((item) => new Date(item.pubDate!).getTime());
    expect(times.every((time, i) => i === 0 || time <= times[i - 1])).toBe(true);
  });

  it('links every item to a page that exists, by its address with a trailing slash', () => {
    const broken = feed.items.filter((item) => {
      const url = new URL(item.link);
      return url.origin !== SITE || !builtPages().has(url.pathname);
    });
    expect(broken).toEqual([]);
  });

  it('carries the whole post in every item', () => {
    const different = contents.filter(({ link, html }) => {
      const page = cheerio.load(readHtml(new URL(link).pathname));
      const body = page('[itemprop="articleBody"]');
      const text = (value: string) => value.replace(/\s+/g, ' ').trim();
      return text(cheerio.load(html, null, false).text()) !== text(body.text());
    });
    expect(different.map(({ link }) => link)).toEqual([]);
  });

  it('has no address that only works on the site', () => {
    const relative: string[] = [];
    for (const { link, html } of contents) {
      const $content = cheerio.load(html, null, false);
      $content('[href], [src], [poster], [srcset]').each((_, element) => {
        for (const name of ['href', 'src', 'poster', 'srcset']) {
          const value = $content(element).attr(name);
          if (value === undefined) continue;
          for (const address of name === 'srcset' ? value.split(',').map((part) => part.trim().split(/\s+/)[0]) : [value]) {
            if (address !== '' && !/^(?:[a-z][a-z0-9+.-]*:|\/\/|#)/i.test(address.trim())) {
              relative.push(`${link} ${name}="${address}"`);
            }
          }
        }
      });
    }
    expect(relative).toEqual([]);
  });

  it('points at pictures and pages of this site that exist', () => {
    const missing: string[] = [];
    for (const { link, html } of contents) {
      const $content = cheerio.load(html, null, false);
      $content('img[src]').each((_, element) => {
        const src = $content(element).attr('src')!;
        if (!src.startsWith(`${SITE}/`)) return;
        const path = decodeURIComponent(new URL(src).pathname);
        if (!exists(path)) missing.push(`${link} ${src}`);
      });
    }
    expect(missing).toEqual([]);
  });
});
