import { defineConfig } from '@playwright/test';

const PORT = 4321;

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
    toHaveScreenshot: { animations: 'disabled', caret: 'hide', maxDiffPixelRatio: 0.01 },
    toMatchSnapshot: { maxDiffPixelRatio: 0.01 },
  },
  projects: [
    {
      name: 'desktop',
      use: { browserName: 'chromium', viewport: { width: 1280, height: 900 } },
    },
    {
      name: 'phone',
      use: { browserName: 'chromium', viewport: { width: 390, height: 844 } },
    },
  ],
  webServer: {
    command: `node scripts/serve-dist.ts ${PORT}`,
    url: `http://localhost:${PORT}/`,
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
