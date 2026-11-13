/**
 * The files a site has besides its pages: robots.txt, the web app manifest
 * and the icons. Part of R11 (what search engines and browsers are told
 * about the site).
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { loadSite } from '../lib/baseline.ts';
import { DIST, builtPages, exists, readHtml } from '../lib/dist.ts';

const live = loadSite();
const liveManifest = live.manifest as Record<string, unknown>;

/** The size of a PNG file, read from its header, or null if it is not one. */
function pngSize(path: string): { width: number; height: number } | null {
  const data = readFileSync(join(DIST, path));
  if (data.length < 24 || data.readUInt32BE(0) !== 0x89504e47) return null;
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}
const pages = [...builtPages(), '/404.html'].filter((path) => !path.startsWith('/astrobook/'));

describe('robots.txt', () => {
  it('is what the live site serves', () => {
    expect(readHtml('/robots.txt')).toBe(live.robots);
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

  it('carries the site\'s name, not the Gatsby starter\'s', () => {
    expect(liveManifest.name).toBe('Gatsby Starter Blog');
    expect(manifest.name).toBe('Tim Broder .com');
    expect(manifest.short_name).toBe('Tim Broder');
  });

  it('keeps the other settings of the live one', () => {
    expect(manifest.start_url).toBe(liveManifest.start_url);
    expect(manifest.display).toBe(liveManifest.display);
    expect(manifest.background_color).toBe(liveManifest.background_color);
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
  it('are linked from every page, and every linked file exists', () => {
    const wrong = pages.filter((path) => {
      const $ = cheerio.load(readHtml(path));
      const links = $('link[rel="icon"], link[rel="apple-touch-icon"], link[rel="manifest"]')
        .toArray()
        .map((element) => $(element).attr('href') ?? '');
      return links.length !== 4 || links.some((href) => !exists(href));
    });
    expect(wrong).toEqual([]);
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
