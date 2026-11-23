/**
 * Search, in a browser. It is the one part of the site that runs a script,
 * so it is the one part that only a browser can check.
 *
 * Nothing here knows which posts exist. What to search for is read from the
 * site itself (the title of the newest post), or is a word that most posts
 * of any site written in English have.
 */
import { expect, test, type Page } from '@playwright/test';
import { seriousViolations } from './a11y.ts';
import { sidewaysScroll } from './layout.ts';

const IN_MOST_POSTS = 'the';
/**
 * When no word starts with what was typed, Pagefind falls back on the
 * longest word that begins it: nonsense in ordinary letters can match "x"
 * or "q". No post has a word that starts with this letter.
 */
const MATCHES_NOTHING = 'ʘʘʘ';

const field = (page: Page) => page.getByRole('searchbox', { name: 'Search posts' });
const results = (page: Page) => page.locator('#search-results article');
const status = (page: Page) => page.getByRole('status');
const linksOf = (page: Page) =>
  results(page)
    .getByRole('link')
    .evaluateAll((links) => links.map((link) => link.getAttribute('href')));

test('the icon in the header opens the search page, ready to type in', async ({ page }) => {
  await page.goto('/about/');
  await page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Search' }).click();
  await expect(page).toHaveURL(/\/search\/$/);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Search');
  await expect(
    page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Search' }),
  ).toHaveAttribute('aria-current', 'page');
  await expect(field(page)).toBeFocused();
  await expect(results(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Show/ })).toBeHidden();
});

test('the newest post is found by its title, and the result opens it', async ({ page }) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });

  await page.goto('/');
  const newest = page.locator('main article h2 a').first();
  const title = (await newest.innerText()).trim();
  const href = (await newest.getAttribute('href'))!;

  await page.goto('/search/');
  await field(page).fill(title);
  await expect(status(page)).toHaveText(/^\d+ posts? match/);
  const result = results(page).locator(`a[href="${href}"]`);
  await expect(result).toHaveCount(1);
  await expect(result).toHaveText(title);

  await result.click();
  await expect(page).toHaveURL(new RegExp(`${href}$`));
  await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
  expect(errors).toEqual([]);
});

test('a search is kept in the address, and shown again when the page is opened there', async ({ page }) => {
  await page.goto('/search/');
  await field(page).fill(IN_MOST_POSTS);
  await expect(results(page).first()).toBeVisible();
  await expect(page).toHaveURL(new RegExp(`/search/\\?q=${IN_MOST_POSTS}$`));
  const found = await linksOf(page);

  await page.reload();
  await expect(field(page)).toHaveValue(IN_MOST_POSTS);
  await expect(results(page)).toHaveCount(found.length);
  expect(await linksOf(page)).toEqual(found);

  // An emptied field takes the results and the search in the address away.
  await field(page).fill('');
  await expect(results(page)).toHaveCount(0);
  await expect(status(page)).toHaveText('');
  await expect(page).toHaveURL(/\/search\/$/);
});

test('results come ten at a time', async ({ page }) => {
  await page.goto(`/search/?q=${IN_MOST_POSTS}`);
  await expect(results(page)).toHaveCount(10);
  const total = Number((await status(page).innerText()).match(/^\d+/)![0]);
  expect(total).toBeGreaterThan(20);

  await page.getByRole('button', { name: 'Show 10 more' }).click();
  await expect(results(page)).toHaveCount(20);
  // The keyboard carries on from the first of the new results.
  await expect(results(page).nth(10).getByRole('link')).toBeFocused();
  expect(new Set(await linksOf(page)).size).toBe(20);
});

test('a result shows its title, its date and the passage that matched', async ({ page }) => {
  await page.goto(`/search/?q=${IN_MOST_POSTS}`);
  await expect(results(page)).toHaveCount(10);
  // Each result has its date twice, laid out for a phone and for a desktop.
  await expect(results(page).locator('time:visible')).toHaveCount(10);
  for (const when of await results(page).locator('time:visible').allInnerTexts()) {
    expect(when.trim()).toMatch(/^[A-Z][a-z]+ \d{2}, \d{4}/);
  }
  for (const title of await results(page).getByRole('heading', { level: 2 }).allInnerTexts()) {
    expect(title.trim()).not.toBe('');
  }
  const marked = await results(page).locator('mark').allInnerTexts();
  expect(marked.length).toBeGreaterThan(0);
  expect(marked.filter((word) => !/the/i.test(word))).toEqual([]);
});

test('a search that matches nothing says so', async ({ page }) => {
  await page.goto('/search/');
  await field(page).fill(MATCHES_NOTHING);
  await expect(status(page)).toHaveText(`No posts match “${MATCHES_NOTHING}”.`);
  await expect(results(page)).toHaveCount(0);
  await expect(page.getByRole('button', { name: /^Show/ })).toBeHidden();
});

test('a page of results fits the screen and has no serious accessibility problems', async ({ page }) => {
  await page.goto(`/search/?q=${IN_MOST_POSTS}`);
  await expect(results(page)).toHaveCount(10);
  expect(await sidewaysScroll(page)).toBeNull();
  expect(await seriousViolations(page)).toEqual([]);
});

test.describe('without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  // The line that says search needs JavaScript is in a <noscript>, which
  // this browser does not draw when a test turns scripts off. The build
  // tests check that the line is there.
  test('the page still leads to every post, and searches nothing', async ({ page }) => {
    await page.goto('/search/');
    const main = page.getByRole('main');
    await expect(main.getByRole('link', { name: 'archive' })).toHaveAttribute('href', '/archive/');
    await expect(main.getByRole('link', { name: 'by tag' })).toHaveAttribute('href', '/tag/');

    // The field is a plain form: it leads to the same page with the search in its address.
    await field(page).fill(IN_MOST_POSTS);
    await field(page).press('Enter');
    await expect(page).toHaveURL(new RegExp(`/search/\\?q=${IN_MOST_POSTS}$`));
    await expect(results(page)).toHaveCount(0);
  });
});
