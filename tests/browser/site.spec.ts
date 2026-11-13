/**
 * How the site behaves in a browser: navigation, pagination, the 404 page,
 * small screens (R7) and accessibility (R25).
 */
import { expect, test } from '@playwright/test';
import { seriousViolations } from './a11y.ts';
import { sidewaysScroll } from './layout.ts';

const PAGE_TYPES = {
  home: '/',
  'paged list': '/page/2/',
  post: '/2016/06/github-file-and-link-tricks/',
  'link post': '/2019/09/small-wins/',
  'post with code': '/2026/01/natural-scroll-applescript-tahoe/',
  tag: '/tag/chrome/',
  category: '/category/crossfit/',
  about: '/about/',
  'markdown page': '/projects/',
  'not found': '/404.html',
};

test.describe('navigation', () => {
  test('the header links go to each section and highlight it', async ({ page }) => {
    await page.goto('/');
    const nav = page.getByRole('navigation', { name: 'Main' });
    await expect(nav.getByRole('link', { name: 'Posts' })).toHaveAttribute('aria-current', 'page');

    await nav.getByRole('link', { name: 'About' }).click();
    await expect(page).toHaveURL(/\/about\/$/);
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'About' }),
    ).toHaveAttribute('aria-current', 'page');
  });

  test('a card opens its post, where "Posts" stays highlighted', async ({ page }) => {
    await page.goto('/');
    const first = page.locator('main article h2 a').first();
    const title = (await first.innerText()).trim();
    await first.click();
    await expect(page).toHaveURL(/\/\d{4}\/\d{2}\/[a-z0-9-]+\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
    await expect(
      page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Posts' }),
    ).toHaveAttribute('aria-current', 'page');
  });
});

test.describe('pagination', () => {
  test('Next and Previous move between pages', async ({ page }) => {
    await page.goto('/');
    const pagination = page.getByRole('navigation', { name: 'Pagination' });
    await expect(pagination.getByRole('link', { name: /Previous/ })).toHaveCount(0);

    await pagination.getByRole('link', { name: /Next/ }).click();
    await expect(page).toHaveURL(/\/page\/2\/$/);
    await expect(page.locator('main article')).toHaveCount(20);

    await page
      .getByRole('navigation', { name: 'Pagination' })
      .getByRole('link', { name: /Previous/ })
      .click();
    await expect(page).toHaveURL(/localhost:\d+\/$/);
  });

  test('each page shows different posts', async ({ page }) => {
    await page.goto('/');
    const first = await page.locator('main article h2').allInnerTexts();
    await page.goto('/page/2/');
    const second = await page.locator('main article h2').allInnerTexts();
    expect(first).toHaveLength(20);
    expect(second.filter((title) => first.includes(title))).toEqual([]);
  });

  test('a paged list highlights nothing in the header', async ({ page }) => {
    await page.goto('/page/2/');
    await expect(page.locator('nav[aria-label="Main"] [aria-current]')).toHaveCount(0);
  });
});

test.describe('link posts', () => {
  test('the "original article" link opens the article in a new tab', async ({ page }) => {
    await page.goto('/2019/09/small-wins/');
    const link = page.getByRole('link', { name: 'original article' });
    await expect(link).toHaveAttribute('href', 'https://davidhemphill.com/small-wins');
    await expect(link).toHaveAttribute('target', '_blank');
  });
});

test('an unknown URL shows the 404 page', async ({ page }) => {
  const response = await page.goto('/this-page-does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('404: Not Found');
});

for (const [name, path] of Object.entries(PAGE_TYPES)) {
  test(`${name}: fits the screen without scrolling sideways`, async ({ page }) => {
    await page.goto(path);
    expect(await sidewaysScroll(page)).toBeNull();
  });

  test(`${name}: has no serious accessibility problems`, async ({ page }) => {
    await page.goto(path);
    expect(await seriousViolations(page)).toEqual([]);
  });
}
