import { defineConfig } from '@playwright/test';

const PORT = 4321;

const DESKTOP = { browserName: 'chromium', viewport: { width: 1280, height: 900 } } as const;
const PHONE = { browserName: 'chromium', viewport: { width: 390, height: 844 } } as const;
const EVERY_PAGE = '**/every-page.spec.ts';

/**
 * Browser tests run against a local preview of the build (`npm run build`
 * first).
 *
 * Screenshots only compare reliably when they are taken on the same system,
 * because fonts render differently on macOS and Linux. The stored ones are
 * taken in CI, in a pinned Playwright container, and live under
 * __screenshots__/linux. Anything taken on another system goes to its own
 * folder, which git ignores.
 */
export default defineConfig({
  testDir: 'tests/browser',
  outputDir: 'test-results',
  snapshotPathTemplate:
    'tests/browser/__screenshots__/{platform}/{projectName}/{testFileName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['list'], ['html', { open: 'never' }]] : 'list',
  use: {
    baseURL: `http://localhost:${PORT}`,
    trace: 'retain-on-failure',
  },
  expect: {
    // Stored screenshots must match exactly: no pixel may be off by more
    // than a rounding error. The pinned container draws a page the same way
    // every time, so anything looser would only hide real changes (a change
    // of text colour moves well under 1% of the pixels).
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixels: 0, threshold: 0.05 },
  },
  projects: [
    { name: 'desktop', testIgnore: EVERY_PAGE, use: DESKTOP },
    { name: 'phone', testIgnore: EVERY_PAGE, use: PHONE },
    // Opening every page keeps every processor busy for a minute, and a
    // screenshot taken under that load once came out a few pixels different.
    // So these start only when the tests above have finished.
    {
      name: 'every-page-desktop',
      testMatch: EVERY_PAGE,
      use: DESKTOP,
      dependencies: ['desktop', 'phone'],
    },
    {
      name: 'every-page-phone',
      testMatch: EVERY_PAGE,
      use: PHONE,
      dependencies: ['desktop', 'phone'],
    },
  ],
  webServer: {
    command: `node scripts/serve-dist.ts ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
