/**
 * The files a site has besides its pages: robots.txt, the web app manifest
 * and the icons. Part of R11 (what search engines and browsers are told
 * about the site).
 */
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { DIST, builtPages, exists, readHtml } from '../lib/dist.ts';

/** The size of a PNG file, read from its header, or null if it is not one. */
function pngSize(path: string): { width: number; height: number } | null {
  const data = readFileSync(join(DIST, path));
  if (data.length < 24 || data.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}
const pages = [...builtPages(), '/404.html'].filter((path) => !path.startsWith('/astrobook/'));

describe('robots.txt', () => {
  it('lets every page be indexed and names the sitemap', () => {
    expect(readHtml('/robots.txt')).toBe(
      'User-agent: *\nDisallow:\n\nSitemap: https://timbroder.com/sitemap-index.xml\n',
    );
  });

  it('names a sitemap that exists', () => {
    expect(exists('/sitemap-index.xml')).toBe(true);
  });
});

describe('the web app manifest', () => {
  const manifest = JSON.parse(readHtml('/manifest.webmanifest')) as {
    name: string;
    short_name: string;
    start_url: string;
    display: string;
    background_color: string;
    icons: { src: string; sizes: string; type: string }[];
  };

  it('carries the site\'s name', () => {
    expect(manifest.name).toBe('Tim Broder .com');
    expect(manifest.short_name).toBe('Tim Broder');
  });

  it('opens at the home page, in a plain window', () => {
    expect(manifest.start_url).toBe('/');
    expect(manifest.display).toBe('minimal-ui');
    expect(manifest.background_color).toBe('#ffffff');
  });

  it('lists icons that exist, at the sizes it says', () => {
    expect(manifest.icons.map((icon) => icon.sizes)).toEqual(['192x192', '512x512']);
    for (const icon of manifest.icons) {
      const size = pngSize(icon.src);
      expect(`${size?.width}x${size?.height}`, icon.src).toBe(icon.sizes);
      expect(icon.type).toBe('image/png');
    }
  });
});

describe('icons', () => {
  const iconLinks = (path: string) => {
    const $ = cheerio.load(readHtml(path));
    return $('link[rel="icon"], link[rel="apple-touch-icon"]')
      .toArray()
      .map((element) => $(element).attr('href') ?? '');
  };

  it('are linked from every page, and every linked file exists', () => {
    const wrong = pages.filter((path) => {
      const links = iconLinks(path);
      return links.length !== 3 || links.some((href) => !exists(href.split('?')[0]));
    });
    expect(wrong).toEqual([]);
  });

  it('have an address that changes when the picture does', () => {
    // A browser keeps a tab icon by its address. /favicon.ico was a blank
    // icon for years, and a browser that kept it would go on showing it.
    for (const href of iconLinks('/')) {
      const [file, fingerprint] = href.split('?v=');
      const hash = createHash('sha1').update(readFileSync(join(DIST, file))).digest('hex');
      expect(fingerprint, href).toBe(hash.slice(0, 8));
      expect(file).not.toBe('/favicon.ico');
    }
  });

  it('include a favicon.ico that is a real icon', () => {
    const icon = readFileSync(join(DIST, 'favicon.ico'));
    // An .ico file starts with 0, 1 (an icon), and the number of images in it.
    expect([icon.readUInt16LE(0), icon.readUInt16LE(2)]).toEqual([0, 1]);
    expect(icon.readUInt16LE(4)).toBeGreaterThan(0);
    expect(icon.length).toBeGreaterThan(1000);
  });

  it('include the picture link previews fall back on', () => {
    expect(pngSize('og-image.png')).toMatchObject({ width: 1200 });
  });
});
