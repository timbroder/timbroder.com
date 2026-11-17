/**
 * Smoke tests against a deployed copy of the site.
 *
 * These cover what only exists on Netlify: redirects, headers, 404
 * handling and the posts written in Contentful. They run against a deploy
 * preview in CI. Run `npm run build` first: some of them compare the
 * deployed site with the local build.
 *
 *   SMOKE_URL=https://deploy-preview-123--funny-meringue-5e00b8.netlify.app npm run test:smoke
 */
import { describe, expect, it } from 'vitest';
import { builtPages } from '../lib/dist.ts';

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

  // R10. Feed readers have both addresses. The feed is a large file, and
  // just after a deploy Netlify can take twenty seconds to send it.
  it.each(['/feed', '/feed/'])('serves the feed as RSS at %s', { timeout: 60_000 }, async (path) => {
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
  // where the posts written in Contentful can be checked. They are the
  // posts the deployed site has and the local build of the same commit does
  // not; nobody has to list them.
  describe('posts written in Contentful', { timeout: 60_000 }, () => {
    const POST = /^\/\d{4}\/\d{2}\/[^/]+\/$/;

    async function fromContentful(): Promise<string[]> {
      const sitemap = await (await get('/sitemap-0.xml')).text();
      const deployed = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((match) =>
        decodeURI(new URL(match[1].replace(/&amp;/g, '&')).pathname),
      );
      return deployed.filter((path) => POST.test(path) && !builtPages().has(path));
    }

    it('were read from the real space, and all of them are published', async () => {
      const html = await (await get('/')).text();
      const status = html.match(/<meta name="build-contentful" content="([^"]*)"/)?.[1];
      expect(status, 'the build-contentful tag').toMatch(/^api: \d+ posts?$/);
      // If these differ, the local build is not of the commit that is deployed.
      expect((await fromContentful()).length).toBe(Number(status!.match(/\d+/)![0]));
    });

    it('have a page each', async () => {
      const wrong: string[] = [];
      for (const path of await fromContentful()) {
        const res = await get(encodeURI(path));
        if (res.status !== 200 || !(await res.text()).includes('itemprop="articleBody"')) {
          wrong.push(`${path}: ${res.status}`);
        }
      }
      expect(wrong).toEqual([]);
    });

    it('are in the feed, with the guid the Gatsby site gave a Contentful post', async () => {
      const xml = await (await get('/feed')).text();
      const missing = (await fromContentful()).filter(
        (path) => !xml.includes(`<guid isPermaLink="false">https://timbroder.com${path}</guid>`),
      );
      expect(missing).toEqual([]);
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
