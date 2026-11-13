/**
 * R19, R20, R21: what ships with the pages.
 *
 * R19: Google Analytics is on every page of the site, once.
 * R20: the site's own pages carry no other JavaScript. The only scripts are
 * the one that starts Google Analytics and, on a post, the structured data
 * that describes it to search engines (which is data, not a program).
 * R21: the component library is public but kept out of search engines.
 */
import { readFileSync } from 'node:fs';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { ANALYTICS_ID, analyticsScript } from '../../src/lib/seo.ts';
import { builtPages, readHtml } from '../lib/dist.ts';

const all = [...builtPages(), '/404.html'];
const sitePages = all.filter((path) => !path.startsWith('/astrobook/'));
const libraryPages = all.filter((path) => path.startsWith('/astrobook/'));
const isPost = (path: string) => /^\/\d{4}\/\d{2}\/[^/]+\/$/.test(path);

/** The scripts of a page, apart from any a post's author wrote into the post long ago. */
function scriptsOf(path: string) {
  const $ = cheerio.load(readHtml(path));
  $('[itemprop="articleBody"] script').remove();
  return $('script')
    .toArray()
    .map((element) => ({
      type: $(element).attr('type') ?? null,
      src: $(element).attr('src') ?? null,
      inHead: $(element).parents('head').length > 0,
      text: $(element).text(),
    }));
}

describe('R19: Google Analytics', () => {
  it('is on every page of the site exactly once', () => {
    const wrong = sitePages.filter(
      (path) => scriptsOf(path).filter((script) => script.text.includes(ANALYTICS_ID)).length !== 1,
    );
    expect(wrong).toEqual([]);
    expect(sitePages.length).toBeGreaterThan(765);
  });

  it('is the script this site wrote, in the head', () => {
    const wrong = sitePages.filter((path) => {
      const [script] = scriptsOf(path).filter((candidate) => candidate.text.includes(ANALYTICS_ID));
      return script.text.trim() !== analyticsScript() || !script.inHead || script.type !== null;
    });
    expect(wrong).toEqual([]);
  });

  it('only loads Google\'s code on the real site', () => {
    const script = analyticsScript();
    // Everything it does is inside one check of the host name.
    expect(script).toMatch(/^if \(\["timbroder\.com","www\.timbroder\.com"\]\.indexOf\(location\.hostname\) !== -1\) \{\n/);
    expect(script.trimEnd().endsWith('}')).toBe(true);
    expect(script.match(/googletagmanager\.com/g)?.length).toBe(1);
  });

  it('is not on the component library', () => {
    expect(libraryPages.filter((path) => readHtml(path).includes(ANALYTICS_ID))).toEqual([]);
  });
});

describe('R20: no other JavaScript on the site\'s own pages', () => {
  it('has no script but analytics and, on a post, its structured data', () => {
    const wrong = sitePages.filter((path) => {
      const kinds = scriptsOf(path)
        .map((script) =>
          script.src
            ? `file ${script.src}`
            : script.type === 'application/ld+json'
              ? 'structured data'
              : script.text.includes(ANALYTICS_ID)
                ? 'analytics'
                : 'other',
        )
        .sort();
      const expected = isPost(path) ? ['analytics', 'structured data'] : ['analytics'];
      return JSON.stringify(kinds) !== JSON.stringify(expected);
    });
    expect(wrong).toEqual([]);
  });

  it('has structured data that is valid JSON and cannot end its own element', () => {
    const wrong = sitePages.filter(isPost).filter((path) => {
      const [data] = scriptsOf(path).filter((script) => script.type === 'application/ld+json');
      try {
        JSON.parse(data.text);
      } catch {
        return true;
      }
      return data.text.includes('<');
    });
    expect(wrong).toEqual([]);
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
