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
import { CONTENTFUL_ON_LIVE } from '../lib/expected.ts';

const BASE = process.env.SMOKE_URL?.replace(/\/$/, '');

async function get(path: string) {
  return fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'timbroder.com-smoke-test' },
  });
}

// A deploy can take a few seconds to reach every Netlify server, so a
// failure is retried before it counts.
describe.skipIf(!BASE)('deployed site', { retry: 2 }, () => {
  it('serves the home page', async () => {
    const res = await get('/');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('text/html');
    expect(await res.text()).toContain('<h1');
  });

  // R10. Feed readers have both addresses.
  it.each(['/feed', '/feed/'])('serves the feed as RSS at %s', async (path) => {
    const res = await get(path);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/rss+xml');
    const xml = await res.text();
    expect(xml).toContain('<rss');
    expect(xml).toContain('<item>');
  });

  it('serves the web app manifest as a manifest', async () => {
    const res = await get('/manifest.webmanifest');
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/manifest+json');
    expect((await res.json()).name).toBe('Tim Broder .com');
  });

  it.each(['/favicon.ico', '/og-image.png', '/robots.txt', '/sitemap-index.xml'])(
    'serves %s',
    async (path) => {
      expect((await get(path)).status).toBe(200);
    },
  );

  it('adds a missing trailing slash with a redirect', async () => {
    const res = await get('/projects');
    expect(res.status).toBe(301);
    expect(new URL(res.headers.get('location')!, BASE).pathname).toBe(
      '/projects/',
    );
  });

  // R18. Only a build on Netlify has the Contentful settings, so this is
  // where the posts written in Contentful can be checked.
  describe('posts written in Contentful', () => {
    it('were read from the real space', async () => {
      const html = await (await get('/')).text();
      const status = html.match(/<meta name="build-contentful" content="([^"]*)"/)?.[1];
      const count = Number(status?.match(/^api: (\d+) posts?$/)?.[1]);
      expect(status, 'the build-contentful tag').toMatch(/^api: /);
      expect(count).toBeGreaterThanOrEqual(CONTENTFUL_ON_LIVE.length);
    });

    it.each(CONTENTFUL_ON_LIVE)('shows %s, on the home list too', async (path) => {
      const res = await get(path);
      expect(res.status).toBe(200);
      expect(await res.text()).toContain('itemprop="articleBody"');
      expect(await (await get('/')).text()).toContain(`href="${path}"`);
    });

    it.each(CONTENTFUL_ON_LIVE)('keeps the guid the live feed gives %s', async (path) => {
      const xml = await (await get('/feed')).text();
      expect(xml).toContain(`<guid isPermaLink="false">https://timbroder.com${path}</guid>`);
    });
  });

  // R26.
  it('returns 404 for an unknown URL, with the site\'s own page', async () => {
    const res = await get('/this-page-does-not-exist/');
    expect(res.status).toBe(404);
    const html = await res.text();
    expect(html).toContain('404: Not Found');
    expect(html).toContain('the sadness');
  });
});
