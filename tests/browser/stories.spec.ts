/**
 * R8, R22: every story in the component library renders, matches its stored
 * screenshot and passes the accessibility checks.
 *
 * Stories are found in the build, so a new story is tested without being
 * listed here.
 */
import { existsSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';
import { seriousViolations } from './a11y.ts';

const STORIES_DIR = join(process.cwd(), 'dist', 'astrobook', 'stories');

/** Stories that are meant to render nothing. */
const EMPTY_STORIES = new Set(['pagination/single-page']);

function findStories(): string[] {
  if (!existsSync(STORIES_DIR)) {
    throw new Error('dist/astrobook is missing. Run `npm run build` first.');
  }
  return readdirSync(STORIES_DIR, { withFileTypes: true })
    .filter((component) => component.isDirectory())
    .flatMap((component) =>
      readdirSync(join(STORIES_DIR, component.name), { withFileTypes: true })
        .filter((story) => story.isDirectory())
        .map((story) => `${component.name}/${story.name}`),
    )
    .sort();
}

const stories = findStories();

test('the component library has stories', () => {
  expect(stories.length).toBeGreaterThan(30);
});

for (const story of stories) {
  test(`story ${story}`, async ({ page }) => {
    const errors: string[] = [];
    page.on('pageerror', (error) => errors.push(error.message));
    page.on('console', (message) => {
      if (message.type() === 'error') errors.push(message.text());
    });

    const response = await page.goto(`/astrobook/stories/${story}/`);
    expect(response?.status()).toBe(200);
    await page.evaluate(() => document.fonts.ready);

    const main = page.locator('main');

    if (EMPTY_STORIES.has(story)) {
      await expect(main.locator('*')).toHaveCount(0);
    } else {
      await expect(main.locator('*').first()).toBeVisible();
      await expect(main).toHaveScreenshot(`${story.replace('/', '-')}.png`);
      expect(await seriousViolations(page, 'main')).toEqual([]);
    }

    expect(errors).toEqual([]);
  });
}
