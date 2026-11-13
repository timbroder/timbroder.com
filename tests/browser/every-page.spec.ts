/**
 * R7, R25: no page scrolls sideways, and no page has text too faint to read.
 *
 * These two problems come from what a post contains (a long web address, a
 * row of tags, a colour inside a code block), so a sample of pages misses
 * them. These tests open every built page.
 *
 * They run in projects of their own, after the other browser tests (see
 * playwright.config.ts). The component library is left out:
 * stories.spec.ts covers each story.
 */
import { expect, test, type BrowserContext, type Page } from '@playwright/test';
import { builtPages } from '../lib/dist.ts';
import { lowContrastText } from './a11y.ts';
import { sidewaysScroll } from './layout.ts';

const PAGES_AT_ONCE = 6;

const paths = [...builtPages(), '/404.html']
  .filter((path) => !path.startsWith('/astrobook/'))
  .sort();

// A trace of this many page loads is slow to record and too big to be useful.
test.use({ trace: 'off' });

/** Opens every page, a few at a time, and runs `check` on each. */
async function onEveryPage(
  context: BrowserContext,
  baseURL: string,
  check: (page: Page, path: string) => Promise<void>,
): Promise<void> {
  // Old posts embed files from servers that no longer answer. Nothing from
  // outside the build is needed to lay a page out, so it is not fetched.
  const own = new URL(baseURL).host;
  await context.route(
    (url) => url.host !== own,
    (route) => route.abort(),
  );

  const queue = [...paths];
  async function work(page: Page) {
    for (let path = queue.shift(); path !== undefined; path = queue.shift()) {
      await page.goto(encodeURI(path), { waitUntil: 'load' });
      await check(page, path);
    }
  }
  const pages = await Promise.all(Array.from({ length: PAGES_AT_ONCE }, () => context.newPage()));
  await Promise.all(pages.map(work));
}

test('no page scrolls sideways', async ({ context, baseURL }) => {
  test.setTimeout(5 * 60_000);
  const sideways: string[] = [];
  await onEveryPage(context, baseURL!, async (page, path) => {
    const scroll = await sidewaysScroll(page);
    if (scroll) sideways.push(`${path} ${scroll}`);
  });
  expect(sideways).toEqual([]);
});

test('no page has low-contrast text', async ({ context, baseURL, viewport }) => {
  // This is the slow one, and colours do not depend on the width of the
  // screen. The few elements that show only on a phone are on every list
  // page, which site.spec.ts checks at both widths.
  test.skip(viewport!.width < 1000, 'The desktop run covers every page.');
  test.setTimeout(15 * 60_000);

  const faint = new Map<string, { count: number; example: string }>();
  await onEveryPage(context, baseURL!, async (page, path) => {
    for (const { colours, html } of await lowContrastText(page)) {
      const seen = faint.get(colours) ?? { count: 0, example: `${path} ${html}` };
      seen.count += 1;
      faint.set(colours, seen);
    }
  });
  expect(
    [...faint].map(([colours, { count, example }]) => `${colours}: ${count} elements, e.g. ${example}`),
  ).toEqual([]);
});
