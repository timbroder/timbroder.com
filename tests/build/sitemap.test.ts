/** R12: the sitemap lists exactly the pages that should be found. */
import { describe, expect, it } from 'vitest';
import { builtPages, readHtml } from '../lib/dist.ts';

const locs = (xml: string) =>
  [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);

const index = locs(readHtml('/sitemap-index.xml'));
const urls = index.flatMap((sitemap) => locs(readHtml(new URL(sitemap).pathname)));

describe('R12: sitemap', () => {
  it('keeps the file names the live site uses, so robots.txt stays valid', () => {
    expect(index).toEqual(['https://timbroder.com/sitemap-0.xml']);
    expect(readHtml('/robots.txt')).toContain(
      'Sitemap: https://timbroder.com/sitemap-index.xml',
    );
  });

  it('lists every built page except the component library', () => {
    const expected = [...builtPages()]
      .filter((path) => !path.startsWith('/astrobook/'))
      .map((path) => `https://timbroder.com${path}`)
      .sort();
    expect([...urls].sort()).toEqual(expected);
  });

  it('lists each URL once, with a trailing slash', () => {
    expect(new Set(urls).size).toBe(urls.length);
    expect(urls.filter((url) => !url.endsWith('/'))).toEqual([]);
  });

  it('leaves out the 404 page, the feed and the redirects file', () => {
    expect(urls.filter((url) => /404|\/feed|redirects/.test(url))).toEqual([]);
  });
});
