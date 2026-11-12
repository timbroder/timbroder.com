/**
 * R7: pages look the same as on the live site.
 *
 * Each page is opened on the live site and on the new build in the same
 * browser, and the two screenshots are compared. Nothing is stored, so
 * there is no stale baseline, and both sides render with the same fonts.
 *
 * After cutover the live site is the new site, and this test is replaced by
 * stored screenshots. Set SKIP_LIVE=1 to skip it (for example offline).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const LIVE = (process.env.LIVE_URL ?? 'https://timbroder.com').replace(/\/$/, '');

/**
 * The share of pixels allowed to differ. Small differences are expected:
 * Tailwind 4 defines the same colours in a different notation, which can
 * move a channel by one. Set VISUAL_TOLERANCE=0 to see every difference.
 */
const TOLERANCE = Number(process.env.VISUAL_TOLERANCE ?? 0.01);

interface Sample {
  name: string;
  /** Path on both sites. */
  path: string;
  /** Path on the live site, when it differs. */
  livePath?: string;
  /**
   * Compare only this element. Without it, the whole page is compared,
   * or the top of it when `height` is set.
   */
  element?: string;
  /** Compare the page from the top down to this height. */
  height?: number;
  /** Compare the page from the top down to the first element matching this. */
  until?: string;
  /** Elements to cover on both sides, because they legitimately differ. */
  mask?: string[];
}

const samples: Sample[] = [
  // List pages are compared from the top: the live site puts every post on
  // every page, so the pages are far longer than the new ones.
  { name: 'home', path: '/', height: 1500 },
  { name: 'home-pagination', path: '/', element: 'nav[aria-label="Pagination"]' },
  { name: 'home-footer', path: '/', element: 'footer.mt-32' },
  { name: 'post', path: '/2016/06/github-file-and-link-tricks/' },
  { name: 'link-post', path: '/2019/09/small-wins/' },
  // Code blocks are allowed to differ, so this one stops above the first.
  // The live site wraps each code block in .gatsby-highlight.
  {
    name: 'post-with-code-top',
    path: '/2026/01/natural-scroll-applescript-tahoe/',
    until: '.gatsby-highlight, pre.astro-code',
  },
  { name: 'tag', path: '/tag/chrome/' },
  { name: 'category', path: '/category/crossfit/' },
  // The photo is the same picture compressed two ways.
  { name: 'about', path: '/about/', mask: ['img[alt="Profile picture"]'] },
  { name: 'markdown-page', path: '/projects/' },
  { name: 'not-found', path: '/404.html', livePath: '/this-page-does-not-exist/', element: 'main' },
];

async function capture(page: Page, url: string, sample: Sample): Promise<Buffer> {
  await page.goto(url, { waitUntil: 'networkidle' });
  await page.evaluate(() => document.fonts.ready);
  const mask = (sample.mask ?? []).map((selector) => page.locator(selector));
  const options = { animations: 'disabled', caret: 'hide', mask } as const;

  if (sample.element) {
    const element = page.locator(sample.element).first();
    await element.scrollIntoViewIfNeeded();
    return element.screenshot(options);
  }
  let height = sample.height;
  if (sample.until) {
    const box = await page.locator(sample.until).first().boundingBox();
    if (!box) throw new Error(`${url} has no element matching ${sample.until}`);
    height = Math.floor(box.y + (await page.evaluate(() => window.scrollY)));
  }
  if (height) {
    // `fullPage` lets the clip reach below the first screenful.
    const width = page.viewportSize()!.width;
    return page.screenshot({ ...options, fullPage: true, clip: { x: 0, y: 0, width, height } });
  }
  return page.screenshot({ ...options, fullPage: true });
}

test.describe('pages look the same as on the live site', () => {
  test.skip(Boolean(process.env.SKIP_LIVE), 'SKIP_LIVE is set');
  // The live site is on the network; give it a second chance.
  test.describe.configure({ retries: 2 });

  for (const sample of samples) {
    test(sample.name, async ({ page, context }, testInfo) => {
      const livePage = await context.newPage();
      const expected = await capture(livePage, `${LIVE}${sample.livePath ?? sample.path}`, sample);
      await livePage.close();

      // The live screenshot becomes the expected image for this run only.
      const name = ['live', `${sample.name}.png`];
      const file = testInfo.snapshotPath(...name);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, expected);

      const actual = await capture(page, sample.path, sample);
      expect(actual).toMatchSnapshot(name, { maxDiffPixelRatio: TOLERANCE });
    });
  }
});
