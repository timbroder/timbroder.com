/**
 * R2: old URLs redirect on Netlify.
 *
 * The rules come from the build (dist/_redirects), so run `npm run build`
 * first. Every rule is requested exactly as written, which covers both the
 * form a browser sends and the fully percent-encoded form.
 */
import { describe, expect, it } from 'vitest';
import { asBrowserSends, builtPages, loadRedirects } from '../lib/dist.ts';
import { DROPPED_URLS } from '../lib/expected.ts';
import { NOT_IN_THIS_BUILD, listPagesLeftOut, liveUrls } from '../lib/live.ts';

const BASE = process.env.SMOKE_URL?.replace(/\/$/, '');

async function get(path: string) {
  return fetch(`${BASE}${path}`, {
    redirect: 'manual',
    headers: { 'user-agent': 'timbroder.com-smoke-test' },
  });
}

const target = (res: Response) =>
  decodeURI(new URL(res.headers.get('location') ?? '', BASE).pathname);

describe.skipIf(!BASE)('redirects on the deployed site', { retry: 2, timeout: 120_000 }, () => {
  it('answers every rule with a 301 to its target', async () => {
    const wrong: string[] = [];
    for (const rule of loadRedirects().filter((r) => !r.from.includes(':'))) {
      const res = await get(rule.from);
      if (res.status !== 301 || target(res) !== rule.to) {
        wrong.push(`${rule.from}: ${res.status} ${res.headers.get('location') ?? ''}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('redirects every old URL that is no longer a page, as a browser sends it', async () => {
    const built = builtPages();
    const moved = liveUrls().filter((url) => !built.has(url) && !(url in DROPPED_URLS));
    expect(moved.length).toBeGreaterThan(80);
    const wrong: string[] = [];
    for (const url of moved) {
      const res = await get(asBrowserSends(url));
      if (res.status !== 301 || !built.has(target(res))) {
        wrong.push(`${url}: ${res.status} ${res.headers.get('location') ?? ''}`);
      }
    }
    expect(wrong).toEqual([]);
  });

  it('serves the pages that only a build with Contentful has', async () => {
    // The local build is compared with the live site without these (see
    // tests/lib/live.ts). The deployed site is where they exist.
    const wrong: string[] = [];
    for (const url of [...NOT_IN_THIS_BUILD, ...listPagesLeftOut()]) {
      const res = await get(asBrowserSends(url));
      if (res.status !== 200) wrong.push(`${url}: ${res.status}`);
    }
    expect(wrong).toEqual([]);
  });

  it('catches the two posts that used to move every month, whatever the month', async () => {
    for (const path of ['/2026/11/fussy-coffee/', '/2024/03/fussy-coffee/']) {
      const res = await get(path);
      expect(res.status, path).toBe(301);
      expect(target(res), path).toBe('/2015/07/fussy-coffee/');
    }
    const games = await get('/2025/06/games-i-was-addicted-to-in-2014/');
    expect(games.status).toBe(301);
    expect(target(games)).toBe('/2015/03/games-i-was-addicted-to-in-2014/');
  });

  it('serves those two posts at their own URL without redirecting', async () => {
    for (const path of ['/2015/07/fussy-coffee/', '/2015/03/games-i-was-addicted-to-in-2014/']) {
      expect((await get(path)).status, path).toBe(200);
    }
  });

  it('serves the new URL of a redirected post', async () => {
    const rule = loadRedirects()[0];
    expect((await get(rule.to)).status).toBe(200);
  });
});
