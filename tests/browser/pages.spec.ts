/**
 * R7: each kind of page looks the way it should.
 *
 * Until this site replaced the Gatsby site, these pages were compared with
 * it directly. Now each is compared with a stored screenshot, taken in the
 * same pinned container as the story screenshots (see playwright.config.ts).
 *
 * Every page here is one that a new post does not change: single posts,
 * lists of old tags and categories, and the standalone pages. The home list
 * is left out on purpose, since its cards and its page count change with
 * every post; its parts are covered by the component stories.
 *
 * To accept a deliberate change of design: `npm run build`, then
 * `npm run test:browser:linux -- pages --update-snapshots`, and commit the
 * screenshots that changed.
 */
import { expect, test } from '@playwright/test';

interface Sample {
  name: string;
  path: string;
  /** Elements to cover, because how they are drawn can differ between builds. */
  mask?: string[];
}

const samples: Sample[] = [
  { name: 'post', path: '/2016/06/github-file-and-link-tricks/' },
  { name: 'link-post', path: '/2019/09/small-wins/' },
  { name: 'post-with-code', path: '/2026/01/natural-scroll-applescript-tahoe/' },
  { name: 'post-with-picture', path: '/2014/04/now/' },
  // A picture that is gone from the internet shows the placeholder.
  { name: 'post-with-placeholder', path: '/2009/12/share-google-reader-folders-with/' },
  { name: 'tag', path: '/tag/magento/' },
  { name: 'category', path: '/category/nutrition/' },
  // The photo is resized during the build, and two builds can compress it
  // a little differently.
  { name: 'about', path: '/about/', mask: ['img[alt="Profile picture"]'] },
  { name: 'markdown-page', path: '/projects/' },
  { name: 'not-found', path: '/404.html' },
];

/**
 * The copyright line shows the year of the build, so it is left out of the
 * picture. The Footer story shows it with a fixed year.
 */
const WITHOUT_THE_YEAR = 'footer p { visibility: hidden !important; }';

for (const sample of samples) {
  test(`page ${sample.name}`, async ({ page }) => {
    const response = await page.goto(sample.path);
    expect(response?.ok() || sample.path === '/404.html').toBe(true);
    await page.addStyleTag({ content: WITHOUT_THE_YEAR });
    await page.evaluate(() => document.fonts.ready);
    // Pictures further down a page load as it scrolls; wait for all of them.
    await page.evaluate(async () => {
      await Promise.all(
        Array.from(document.images, (image) => {
          image.loading = 'eager';
          if (image.complete) return null;
          return new Promise((done) => {
            image.addEventListener('load', done, { once: true });
            image.addEventListener('error', done, { once: true });
          });
        }),
      );
    });
    await expect(page).toHaveScreenshot(`${sample.name}.png`, {
      fullPage: true,
      mask: (sample.mask ?? []).map((selector) => page.locator(selector)),
    });
  });
}
