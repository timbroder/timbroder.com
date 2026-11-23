/**
 * What the build needs to know about a post for the search index.
 *
 * The index itself is made by Pagefind once the pages are built (see
 * astro.config.mjs). It reads the body of each post, and from the page of a
 * post its title, date, category and tags.
 */
import * as cheerio from 'cheerio';

/** Markup that holds nothing a reader would search for. */
const NOT_TEXT = 'script, style, noscript, svg, form, label, nav, footer, iframe, template';

/**
 * True when a post has words of its own.
 *
 * Pagefind leaves a page with no words out of its index, so a post that is
 * only a picture or a video could never be found. The page of such a post
 * gives the index its title to read instead (see PostHeader).
 */
export function hasWords(html: string): boolean {
  const $ = cheerio.load(html, null, false);
  $(NOT_TEXT).remove();
  return /[\p{L}\p{N}]/u.test($.root().text());
}
