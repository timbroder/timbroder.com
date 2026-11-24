/**
 * The links from one page of the built site to another (R16).
 *
 * The build test checks them against dist/. Only a build on Netlify has the
 * Contentful settings, so dist/ has no page for a post written in Contentful
 * and cannot say whether a link to one is right. A link like that is left
 * for the smoke tests, which ask the deployed site.
 */
import * as cheerio from 'cheerio';
import { asBrowserSends, builtPages, exists, readHtml, resolveRedirect } from './dist.ts';
import { classifyPath } from './urls.ts';

/**
 * The path a link on `page` points at if it stays on this site, or null. Old
 * posts link to the site by its full address, with and without "www".
 *
 * A link with no scheme and no leading slash stays on the site too: a browser
 * reads `[Asana](asana.com)` on a post as a page inside that post's folder.
 * Search Console reported those as "Not found (404)".
 */
export function internalPath(href: string, page: string): string | null {
  const absolute = href.match(/^https?:\/\/(?:www\.)?timbroder\.com(\/.*)?$/i);
  if (absolute) return absolute[1] ?? '/';
  if (href.startsWith('//')) return null;
  if (href.startsWith('/')) return href;
  // Another site or scheme (https:, mailto:, tweetbot:), or a spot on this page.
  if (href === '' || /^[#?]|^[a-z][a-z0-9+.-]*:/i.test(href)) return null;
  return new URL(href, `https://timbroder.com${page}`).pathname;
}

/** A path without its "#spot" and "?query", readable where it can be. */
function decoded(href: string): string {
  const path = href.split('#')[0].split('?')[0];
  try {
    return decodeURI(path);
  } catch {
    // Leave a malformed escape as it is.
    return path;
  }
}

/** True when a link to this path reaches a page, a file or a redirect. */
function resolves(href: string): boolean {
  const path = href.split('#')[0].split('?')[0];
  if (path === '') return true;
  const readable = decoded(href);
  const withSlash = readable.endsWith('/') ? readable : `${readable}/`;
  return (
    exists(readable) ||
    exists(withSlash) ||
    resolveRedirect(path) !== null ||
    resolveRedirect(encodeURI(withSlash)) !== null
  );
}

/**
 * True when a link that goes nowhere in this build may still be right on the
 * deployed site: it has the address of a post, and this build left the
 * Contentful posts out. `contentful` is the build's own account of what it
 * read: "off", "samples: 3 posts" or "api: 2 posts".
 */
export function mayBeContentfulPost(path: string, contentful: string): boolean {
  return contentful === 'off' && classifyPath(decoded(path)) === 'post';
}

/** What this build read from Contentful, from the head of its home page. */
export function contentfulStatus(): string {
  return readHtml('/').match(/<meta name="build-contentful" content="([^"]*)"/)?.[1] ?? '';
}

export interface DeadEnd {
  /** The link as it is written, which is what to search the post for. */
  href: string;
  /** The request a browser sends for it. */
  request: string;
  /** The pages that have the link. */
  pages: string[];
}

export interface LinkCheck {
  /** Links that go nowhere. */
  broken: DeadEnd[];
  /** Links to a post this build has no page for, which only the deployed site can judge. */
  forDeployedSite: DeadEnd[];
}

let check: LinkCheck | undefined;

/** Follows every internal link of the built site, apart from the component library's. */
export function checkLinks(): LinkCheck {
  if (check) return check;
  const contentful = contentfulStatus();
  const deadEnds = new Map<string, DeadEnd & { path: string }>();
  for (const page of builtPages()) {
    if (page.startsWith('/astrobook/')) continue;
    const $ = cheerio.load(readHtml(page));
    $('a[href]').each((_, el) => {
      const href = $(el).attr('href') ?? '';
      const path = internalPath(href, page);
      if (path === null || resolves(path)) return;
      // A link with no leading slash points somewhere else on each page.
      const key = `${href}\n${path}`;
      const deadEnd = deadEnds.get(key) ?? {
        href,
        path,
        request: asBrowserSends(decoded(path)),
        pages: [],
      };
      deadEnd.pages.push(page);
      deadEnds.set(key, deadEnd);
    });
  }
  check = { broken: [], forDeployedSite: [] };
  for (const { path, ...deadEnd } of deadEnds.values()) {
    (mayBeContentfulPost(path, contentful) ? check.forDeployedSite : check.broken).push(deadEnd);
  }
  return check;
}
