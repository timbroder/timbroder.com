/**
 * R9: the feed.
 *
 * A feed reader knows a post by its guid, so a guid must never change. The
 * guids the feed had when this site replaced the Gatsby site are checked in
 * tests/build/cutover.test.ts; the rule they follow is in src/lib/feed.ts.
 */
import * as cheerio from 'cheerio';
import sax from 'sax';
import { describe, expect, it } from 'vitest';
import { builtPages, exists, readHtml } from '../lib/dist.ts';
import { extractFeed } from '../lib/extract.ts';

const SITE = 'https://timbroder.com';
const xml = readHtml('/feed');
const feed = extractFeed(xml);

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

  it('has the title, description and link subscribers know it by', () => {
    expect(feed.title).toBe('TimBroder.com RSS Feed');
    expect(feed.description).toBe('Tim Broder is a creative technologist');
    expect(feed.link).toBe(SITE);
  });

  it('has one item for every post', () => {
    expect(feed.items.map((item) => new URL(item.link).pathname).sort()).toEqual([...posts].sort());
  });

  it('gives every item a guid of its own', () => {
    expect(new Set(feed.items.map((item) => item.guid)).size).toBe(feed.items.length);
    expect(feed.items.filter((item) => !item.guid.startsWith(`${SITE}/`))).toEqual([]);
  });

  it('gives every item the date its post shows', () => {
    const wrong = feed.items.filter((item) => {
      const html = readHtml(new URL(item.link).pathname);
      const day = cheerio.load(html)('main article header time').attr('datetime');
      return item.pubDate?.slice(0, 10) !== day;
    });
    expect(wrong.map((item) => item.link)).toEqual([]);
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
