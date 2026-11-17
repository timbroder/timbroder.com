/**
 * Every post and every tag page can be found by following links.
 *
 * Search Console's report of 2026-11-17 had two thirds of the site as not
 * indexed, and nothing about a page's own content told the indexed pages
 * from the rest. What the site lacked was ways in. The home list linked
 * only to its next page, so the median post was six clicks from the home
 * page; one post in twenty was linked from another post; and every list
 * page described itself with the site's five words.
 *
 * So the site has an archive of every post and an index of every tag, both
 * linked from every page; each post links to the posts beside it; and each
 * list page says what is on it.
 *
 * Nothing here knows which posts exist.
 */
import * as cheerio from 'cheerio';
import { describe, expect, it } from 'vitest';
import { builtPages, readHtml, readList, readPage } from '../lib/dist.ts';
import { normalizeText } from '../lib/extract.ts';
import { classifyPath, isListType, listRoot, pageNumber } from '../lib/urls.ts';

const ARCHIVE = '/archive/';
const TAG_INDEX = '/tag/';
const SITE_DESCRIPTION = 'Tim Broder is a creative technologist';

const built = [...builtPages()].filter((url) => !url.startsWith('/astrobook/'));
const posts = built.filter((url) => classifyPath(url) === 'post');
const listPages = built.filter((url) => isListType(classifyPath(url)));
const tagPages = built.filter((url) => /^\/tag\/[^/]+\/$/.test(url));

/** The pages of a list, in order. */
const pagesOf = (root: string) =>
  listPages.filter((url) => listRoot(url) === root).sort((a, b) => pageNumber(a) - pageNumber(b));
const cardsOf = (root: string) => pagesOf(root).flatMap((url) => readList(url).cards);

/** Every post, newest first, as the home list has them. */
const newestFirst = cardsOf('/').map((card) => card.href);

const load = (url: string) => cheerio.load(readHtml(url));

describe('the archive', () => {
  const $ = load(ARCHIVE);
  const years = $('main section')
    .toArray()
    .map((section) => ({
      year: normalizeText($(section).find('h2').text()),
      entries: $(section)
        .find('li')
        .toArray()
        .map((item) => ({
          href: $(item).find('a').attr('href') ?? '',
          title: normalizeText($(item).find('a').text()),
          dateTime: $(item).find('time').attr('datetime') ?? null,
        })),
    }));
  const entries = years.flatMap((year) => year.entries);

  it('lists every post once, newest first', () => {
    expect(entries.length).toBeGreaterThan(500);
    expect(entries.map((entry) => entry.href)).toEqual(newestFirst);
  });

  it('puts every post under the year in its address, newest year first', () => {
    for (const { year, entries: inYear } of years) {
      expect(inYear.length, year).toBeGreaterThan(0);
      expect(inYear.filter((entry) => !entry.href.startsWith(`/${year}/`))).toEqual([]);
    }
    const order = years.map(({ year }) => Number(year));
    expect([...order].sort((a, b) => b - a)).toEqual(order);
    expect(new Set(order).size).toBe(order.length);
  });

  it('shows the title and the date of each post', () => {
    const wrong = entries.filter((entry) => {
      const page = readPage(entry.href);
      return entry.title !== page.chrome.heading || entry.dateTime !== page.post!.dateTime;
    });
    expect(wrong.map((entry) => entry.href)).toEqual([]);
  });
});

describe('the tag index', () => {
  const $ = load(TAG_INDEX);
  const tags = $('main li a')
    .toArray()
    .map((link) => ({
      href: $(link).attr('href') ?? '',
      count: Number($(link).children('span').last().text().replace(/\D+/g, '')),
    }));

  it('lists every tag page once, and nothing that is not one', () => {
    expect(tags.length).toBeGreaterThan(150);
    expect(tags.map((tag) => tag.href).sort()).toEqual([...tagPages].sort());
  });

  it('says how many posts each tag has', () => {
    expect(tags.filter((tag) => tag.count !== cardsOf(tag.href).length).map((tag) => tag.href)).toEqual([]);
  });
});

describe('the ways to a post', () => {
  it('links every page to the archive and the tag index', () => {
    const without = [...built, '/404.html'].filter((url) => {
      const footer = readPage(url).chrome.footerLinks.map((link) => link.href);
      return !footer.includes(ARCHIVE) || !footer.includes(TAG_INDEX);
    });
    expect(without).toEqual([]);
  });

  it('puts every post and every tag page within two clicks of the home page', () => {
    const linksOn = (url: string) =>
      new Set(
        load(url)('a[href]')
          .toArray()
          .map((link) => link.attribs.href),
      );
    const oneClick = linksOn('/');
    expect(oneClick.has(ARCHIVE) && oneClick.has(TAG_INDEX)).toBe(true);
    const twoClicks = new Set([...oneClick, ...linksOn(ARCHIVE), ...linksOn(TAG_INDEX)]);
    expect([...posts, ...tagPages].filter((url) => !twoClicks.has(url))).toEqual([]);
  });

  it('links each post to the newer and the older post beside it', () => {
    expect(new Set(newestFirst)).toEqual(new Set(posts));
    const wrong: string[] = [];
    newestFirst.forEach((url, index) => {
      const $ = load(url);
      const links = $('main nav[aria-label="Newer and older posts"] a')
        .toArray()
        .map((link) => ({ href: $(link).attr('href') ?? null, text: normalizeText($(link).text()) }));
      const to = (label: string) => links.find((link) => link.text.includes(label)) ?? null;
      const expected = { newer: newestFirst[index - 1] ?? null, older: newestFirst[index + 1] ?? null };
      for (const [label, target] of [['Newer', expected.newer], ['Older', expected.older]] as const) {
        const link = to(label);
        if ((link?.href ?? null) !== target) wrong.push(`${url}: ${label} is ${link?.href ?? 'missing'}`);
        // The link is named after the post it leads to.
        else if (link && !link.text.includes(readPage(target!).chrome.heading!)) wrong.push(`${url}: ${label} has the wrong title`);
      }
      if (links.length !== Object.values(expected).filter(Boolean).length) wrong.push(`${url}: extra links`);
    });
    expect(wrong).toEqual([]);
  });
});

describe('what a list page says about itself', () => {
  const described = [...listPages.filter((url) => url !== '/'), ARCHIVE, TAG_INDEX].map((url) => ({
    url,
    description: readPage(url).head.description ?? '',
  }));

  it("never falls back on the site's description, except on the home page", () => {
    expect(described.filter(({ description }) => !description || description === SITE_DESCRIPTION).map(({ url }) => url)).toEqual([]);
    expect(readPage('/').head.description).toBe(SITE_DESCRIPTION);
  });

  it('is different on every one of them', () => {
    const seen = new Map<string, string[]>();
    for (const { url, description } of described) seen.set(description, [...(seen.get(description) ?? []), url]);
    expect([...seen.values()].filter((urls) => urls.length > 1)).toEqual([]);
  });

  it('gives the number of posts in the list and names the first post on the page', () => {
    const wrong = listPages
      .filter((url) => url !== '/')
      .filter((url) => {
        const { description } = readPage(url).head;
        const total = cardsOf(listRoot(url)).length;
        const page = pageNumber(url);
        const opening = `${total} ${total === 1 ? 'post' : 'posts'} `;
        const start = page > 1 ? `Page ${page} of ${pagesOf(listRoot(url)).length} of the ${opening}` : opening;
        return !description?.startsWith(start) || !description.includes(`“${readList(url).cards[0].title}”`);
      });
    expect(wrong).toEqual([]);
  });
});
