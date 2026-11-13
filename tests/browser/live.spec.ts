/**
 * R7: pages look the same as on the live site.
 *
 * Each page is opened on the live site and on the new build in the same
 * browser, and the two screenshots are compared. Nothing is stored, so
 * there is no stale baseline, and both sides render with the same fonts.
 *
 * The new design differs from the live one on purpose in a few places (see
 * INTENDED_DIFFERENCES). The live page is given those same changes before
 * its screenshot is taken, so everything else still has to match.
 *
 * After cutover the live site is the new site, and this test is replaced by
 * stored screenshots. Set SKIP_LIVE=1 to skip it (for example offline).
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname } from 'node:path';
import { expect, test, type Page } from '@playwright/test';

const LIVE = (process.env.LIVE_URL ?? 'https://timbroder.com').replace(/\/$/, '');

/**
 * How different two screenshots may be.
 *
 * A pixel counts as different when its colour is off by more than
 * THRESHOLD (0 is identical, 1 is black against white). 0.1 lets through
 * the one thing that always differs: Tailwind 4 writes the same palette in
 * another notation, which moves a colour channel by a few steps. It still
 * catches one shade of grey swapped for the next.
 *
 * Up to MAX_DIFFERENT_PIXELS such pixels are allowed in a screenshot. The
 * live site (React) splits a line like the copyright notice into several
 * pieces of text, and letters next to a split sit a fraction of a pixel
 * apart: at most 22 pixels on the sampled pages. Changing the colour of a
 * single line of small text changes about 470.
 *
 * Set VISUAL_MAX_PIXELS=0 to see every difference.
 */
const THRESHOLD = 0.1;
const MAX_DIFFERENT_PIXELS = Number(process.env.VISUAL_MAX_PIXELS ?? 100);

/**
 * What the new design changes on purpose, written as styles for the live
 * site's own markup. Code blocks are the other intended difference; the
 * samples below stay clear of them.
 *
 * Only changes that show on a sampled page are here. The rest (long words
 * wrapping in posts, tags wrapping in a post's footer) change nothing on a
 * page that already fitted its screen, and leaving them out proves that.
 */
const INTENDED_DIFFERENCES = `
  /* Text that was too faint on white (below 4.5:1) is darker. */
  /* Dates, categories and the copyright line: zinc-400 to zinc-500. */
  .text-zinc-400 { color: #71717a !important; }
  /* "Read article" and the current page in the header: teal-500 to teal-700. */
  .text-teal-500 { color: #0f766e !important; }
  /* The line under the current page in the header, to match. */
  .via-teal-500\\/40 {
    background-image: linear-gradient(
      to right, rgb(15 118 110 / 0), rgb(15 118 110 / 0.4), rgb(15 118 110 / 0)
    ) !important;
  }
  /* Links in posts and pages: teal-500 to teal-700. */
  .prose {
    --tw-prose-links: #0f766e !important;
    --tw-prose-underline: rgb(15 118 110 / 0.2) !important;
  }

  /* A long word in a card (a web address) wraps instead of making the page
     scroll sideways. */
  main article h2, main article p { max-width: 100%; overflow-wrap: break-word; }
`;

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

async function capture(
  page: Page,
  url: string,
  sample: Sample,
  styles?: string,
): Promise<Buffer> {
  await page.goto(url, { waitUntil: 'networkidle' });
  if (styles) await page.addStyleTag({ content: styles });
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
      const expected = await capture(
        livePage,
        `${LIVE}${sample.livePath ?? sample.path}`,
        sample,
        INTENDED_DIFFERENCES,
      );
      await livePage.close();

      // The live screenshot becomes the expected image for this run only.
      const name = ['live', `${sample.name}.png`];
      const file = testInfo.snapshotPath(...name);
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, expected);

      const actual = await capture(page, sample.path, sample);
      expect(actual).toMatchSnapshot(name, {
        threshold: THRESHOLD,
        maxDiffPixels: MAX_DIFFERENT_PIXELS,
      });
    });
  }
});
