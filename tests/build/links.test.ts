/** R16: every link from one page of the site to another goes somewhere. */
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { builtPages, exists, readHtml, resolveRedirect } from '../lib/dist.ts';

const pages = [...builtPages()].filter((path) => !path.startsWith('/astrobook/'));

/**
 * The path a link on `page` points at if it stays on this site, or null. Old
 * posts link to the site by its full address, with and without "www".
 *
 * A link with no scheme and no leading slash stays on the site too: a browser
 * reads `[Asana](asana.com)` on a post as a page inside that post's folder.
 * Search Console reported those as "Not found (404)".
 */
function internalPath(href: string, page: string): string | null {
  const absolute = href.match(/^https?:\/\/(?:www\.)?timbroder\.com(\/.*)?$/i);
  if (absolute) return absolute[1] ?? '/';
  if (href.startsWith('//')) return null;
  if (href.startsWith('/')) return href;
  // Another site or scheme (https:, mailto:, tweetbot:), or a spot on this page.
  if (href === '' || /^[#?]|^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  return new URL(href, `https://timbroder.com${page}`).pathname;
}

/** True when a link to this path reaches a page, a file or a redirect. */
function resolves(href: string): boolean {
  const path = href.split('#')[0].split('?')[0];
  if (path === '') return true;
  let decoded = path;
  try {
    decoded = decodeURI(path);
  } catch {
    // Leave a malformed escape as it is.
  }
  const withSlash = decoded.endsWith('/') ? decoded : `${decoded}/`;
  return (
    exists(decoded) ||
    exists(withSlash) ||
    resolveRedirect(path) !== null ||
    resolveRedirect(encodeURI(withSlash)) !== null
  );
}

describe('R16: internal links', () => {
  it('finds a destination for every internal link', () => {
    // Keyed by the link as it is written, which is what to search the post for.
    const broken = new Map<string, string[]>();
    for (const page of pages) {
      const $ = cheerio.load(readHtml(page));
      $('a[href]').each((_, el) => {
        const href = $(el).attr('href') ?? '';
        const path = internalPath(href, page);
        if (path === null) return;
        if (!resolves(path)) broken.set(href, [...(broken.get(href) ?? []), page]);
      });
    }
    expect(Object.fromEntries(broken)).toEqual({});
  });

  it('links every card, tag and category to a page, not through a redirect', () => {
    // Links the templates write should be exact; only old links inside post
    // bodies are allowed to rely on a redirect.
    const indirect: string[] = [];
    for (const page of pages) {
      const $ = cheerio.load(readHtml(page));
      $('[itemprop="articleBody"]').remove();
      $('a[href^="/"]').each((_, el) => {
        const href = ($(el).attr('href') ?? '').split('#')[0];
        if (href.startsWith('//') || exists(href)) return;
        indirect.push(`${page} -> ${href}`);
      });
    }
    expect(indirect).toEqual([]);
  });
});
