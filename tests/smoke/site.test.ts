/**
 * Smoke tests against a deployed copy of the site.
 *
 * These cover what only exists on Netlify: redirects, headers and 404
 * handling. They run against a deploy preview in CI and against production
 * after cutover.
 *
 *   SMOKE_URL=https://deploy-preview-123--funny-meringue-5e00b8.netlify.app npm run test:smoke
 */
import { describe, expect, it } from 'vitest';

const BASE = process.env.SMOKE_URL?.replace(/\/$/, '');

async function get(path: string) {
  return fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'timbroder.com-smoke-test' },
  });
}

describe.skipIf(!BASE)('deployed site', () => {
  it('serves the home page', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('<h1');
  });

  it('serves the feed as RSS at /feed', async () => {
    const res = await get('/feed');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/rss+xml');
    expect(await res.text()).toContain('<rss');
  });

  it('adds a missing trailing slash with a redirect', async () => {
    const res = await get('/projects');
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get('location')!, BASE).pathname).toBe(
      '/projects/',
    );
  });

  it('returns 404 for an unknown URL', async () => {
    const res = await get('/this-page-does-not-exist/');
    expect(res.status).toBe(404);
  });
});
