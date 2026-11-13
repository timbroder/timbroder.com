/** Guards the pieces of CI that have to agree with each other. */
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

const workflow = readFileSync('.github/workflows/ci.yml', 'utf8');
const lock = JSON.parse(readFileSync('package-lock.json', 'utf8')) as {
  packages: Record<string, { version: string }>;
};

describe('CI', () => {
  it('runs the browser tests in the image built for the installed Playwright', () => {
    // The image holds the browsers for exactly one Playwright version.
    const installed = lock.packages['node_modules/@playwright/test'].version;
    const image = workflow.match(/mcr\.microsoft\.com\/playwright:v([\d.]+)-/)?.[1];
    expect(image).toBe(installed);
  });

  it('makes every test job count towards the gate', () => {
    const needs = workflow.match(/gate:[\s\S]*?needs: \[([^\]]+)\]/)?.[1] ?? '';
    for (const job of ['changes', 'test', 'browser', 'smoke']) {
      expect(needs.split(',').map((j) => j.trim()), job).toContain(job);
    }
  });
});
