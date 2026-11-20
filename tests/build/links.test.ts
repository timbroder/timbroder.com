/**
 * R16: every link from one page of the site to another goes somewhere.
 *
 * One kind of link cannot be judged here: a link to a post written in
 * Contentful, which this build has no page for. The smoke tests ask the
 * deployed site about those (tests/smoke/site.test.ts).
 */
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { builtPages, exists, readHtml } from '../lib/dist.ts';
import { checkLinks } from '../lib/links.ts';

const pages = [...builtPages()].filter((path) => !path.startsWith('/astrobook/'));

describe('R16: internal links', () => {
  it('finds a destination for every internal link', () => {
    // Keyed by the link as it is written, which is what to search the post for.
    const found: Record<string, string[]> = {};
    for (const { href, pages: from } of checkLinks().broken) {
      found[href] = [...(found[href] ?? []), ...from];
    }
    expect(found).toEqual({});
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
