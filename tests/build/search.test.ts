/**
 * Search: every post can be found, and nothing else is in the index.
 *
 * Pagefind makes the index from the built pages (astro.config.mjs). It
 * takes the pages that mark a body for it, and leaves out a page it finds
 * no words on. These tests read the build for both: what the pages offer
 * the index, and how many pages the index says it kept. Searching itself
 * happens in a browser, in tests/browser/search.spec.ts.
 *
 * Nothing here knows which posts exist.
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { hasWords } from '../../src/lib/search-index.ts';
import { DIST, builtPages, exists, readHtml, readPage } from '../lib/dist.ts';
import { classifyPath } from '../lib/urls.ts';

const SEARCH = '/search/';
const BODY = '[data-pagefind-body]';

const all = [...builtPages(), '/404.html'];
const sitePages = all.filter((url) => !url.startsWith('/astrobook/'));
const posts = sitePages.filter((url) => classifyPath(url) === 'post');
const load = (url: string) => cheerio.load(readHtml(url));

describe('the search index', () => {
  it('is part of the build', () => {
    expect(exists('/pagefind/pagefind.js')).toBe(true);
  });

  it('holds every post, and no other page', () => {
    const entry = JSON.parse(readFileSync(join(DIST, 'pagefind', 'pagefind-entry.json'), 'utf8')) as {
      languages: Record<string, { page_count: number }>;
    };
    const kept = Object.values(entry.languages).reduce((sum, { page_count }) => sum + page_count, 0);
    expect(posts.length).toBeGreaterThan(500);
    expect(kept).toBe(posts.length);
  });
});

describe('what the pages offer the index', () => {
  it('is the body of every post', () => {
    expect(posts.filter((url) => load(url)('[itemprop="articleBody"]').is(BODY) === false)).toEqual([]);
  });

  it('is nothing on any other page, the component library included', () => {
    const others = all.filter((url) => !posts.includes(url));
    expect(others.length).toBeGreaterThan(300);
    expect(others.filter((url) => load(url)(BODY).length > 0)).toEqual([]);
  });

  it('is the title too when a post has no words, and only then', () => {
    // The index would leave such a post out, and it could never be found.
    const wrong = posts.filter((url) => {
      const $ = load(url);
      const words = hasWords($('[itemprop="articleBody"]').html() ?? '');
      return $('main article > header').is(BODY) === words;
    });
    expect(wrong).toEqual([]);
  });

  it('never includes the date above the title', () => {
    const wrong = posts.filter((url) => load(url)('main article > header time').closest('[data-pagefind-ignore]').length !== 1);
    expect(wrong).toEqual([]);
  });

  it('comes with the date, category and tags a result shows or searches', () => {
    const wrong = posts.filter((url) => {
      const article = load(url)('main article');
      const { post } = readPage(url);
      return (
        article.attr('data-pagefind-meta') !== 'date[data-date], category[data-category], tags[data-tags]' ||
        article.attr('data-date') !== post!.dateTime ||
        (article.attr('data-category') ?? null) !== (post!.category?.label ?? null) ||
        (article.attr('data-tags') ?? '') !== post!.tags.map((tag) => tag.label).join(', ')
      );
    });
    expect(wrong).toEqual([]);
  });
});

describe('the search page', () => {
  const $ = load(SEARCH);

  it('has a search field that leads back to the page itself', () => {
    const form = $('main form[role="search"]');
    expect(form.attr('action')).toBe(SEARCH);
    expect(form.attr('method')).toBe('get');
    const field = form.find('input[type="search"]');
    expect(field.attr('name')).toBe('q');
    // The field has a name for someone who cannot see the icon.
    expect($(`label[for="${field.attr('id')}"]`).text().trim()).toBe('Search posts');
  });

  it('says how many posts it searches', () => {
    expect($('main header p').text()).toContain(`all ${posts.length} posts`);
    expect(readPage(SEARCH).head.description).toContain(`all ${posts.length} posts`);
  });

  it('has a place for the count, one empty result to copy, and a hidden "Show more"', () => {
    expect($('#search-status[role="status"]').text()).toBe('');
    expect($('#search-results').children().length).toBe(0);
    expect($('button#search-more').attr('hidden')).toBeDefined();
    const template = cheerio.load($('template#search-result').html() ?? '', null, false);
    expect(template('article').length).toBe(1);
    for (const part of ['link', 'title', 'when', 'passage']) {
      expect(template(`[data-search="${part}"]`).length, part).toBeGreaterThan(0);
    }
  });

  it('says what to do without JavaScript', () => {
    expect($('main noscript').text()).toContain('Every post is in the archive');
  });
});

describe('the way to the search page', () => {
  it('is in the header and the footer of every page', () => {
    const without = sitePages.filter((url) => {
      const $ = load(url);
      const header = $('nav[aria-label="Main"] a[href="/search/"]');
      const footer = $('footer a[href="/search/"]');
      // In the header it is an icon, so its name is there for screen readers.
      return header.length !== 1 || header.text().trim() !== 'Search' || footer.length !== 1;
    });
    expect(without).toEqual([]);
  });

  it('is highlighted on the search page, and nowhere else', () => {
    const highlighted = sitePages.filter(
      (url) => load(url)('nav[aria-label="Main"] a[href="/search/"]').attr('aria-current') === 'page',
    );
    expect(highlighted).toEqual([SEARCH]);
  });
});
