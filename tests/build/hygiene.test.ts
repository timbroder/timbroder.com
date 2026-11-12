/**
 * R20, R21: what ships with the pages.
 *
 * R20: the site's own pages carry no JavaScript. (Stage 7 adds Google
 * Analytics and structured data, and this test will allow exactly those.)
 * R21: the component library is public but kept out of search engines.
 */
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { builtPages, readHtml } from '../lib/dist.ts';

const all = [...builtPages(), '/404.html'];
const sitePages = all.filter((path) => !path.startsWith('/astrobook/'));
const libraryPages = all.filter((path) => path.startsWith('/astrobook/'));

describe('R20: no JavaScript on the site\'s own pages', () => {
  it('has no script elements', () => {
    const withScripts = sitePages.filter((path) => {
      const $ = cheerio.load(readHtml(path));
      // Scripts inside a post body were written by the author, long ago.
      $('[itemprop="articleBody"] script').remove();
      return $('script').length > 0;
    });
    expect(withScripts).toEqual([]);
  });

  it('has no inline event handlers outside post bodies', () => {
    const withHandlers = sitePages.filter((path) => {
      const $ = cheerio.load(readHtml(path));
      $('[itemprop="articleBody"]').remove();
      return $('[onclick], [onload], [onerror]').length > 0;
    });
    expect(withHandlers).toEqual([]);
  });
});

describe('R21: the component library', () => {
  it('is built, with a page for every story', () => {
    expect(libraryPages).toContain('/astrobook/');
    expect(libraryPages.filter((path) => path.startsWith('/astrobook/stories/')).length).toBeGreaterThan(30);
  });

  it('asks search engines not to index any of its pages', () => {
    const indexable = libraryPages.filter((path) => {
      const $ = cheerio.load(readHtml(path));
      return !/noindex/.test($('meta[name="robots"]').attr('content') ?? '');
    });
    expect(indexable).toEqual([]);
  });

  it('carries the site stylesheet, so components look as they do on the site', () => {
    const $ = cheerio.load(readHtml('/astrobook/stories/post-card/article/'));
    expect($('link[rel="stylesheet"]').length).toBeGreaterThan(0);
    expect($('main article').length).toBe(1);
  });

  it('can be left out of a build', () => {
    // astro.config.mjs drops the integration when ASTROBOOK=off; this guards
    // the switch against being removed by accident.
    expect(readFileSync('astro.config.mjs', 'utf8')).toContain("process.env.ASTROBOOK === 'off'");
  });
});
