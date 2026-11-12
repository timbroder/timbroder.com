/**
 * R1, R3, R4, R23: every live URL still works, redirects are sound, and
 * nothing unexpected is published.
 */
import { describe, expect, it } from 'vitest';
import { loadUrls } from '../lib/baseline.ts';
import {
  asBrowserSends,
  builtPages,
  loadRedirects,
  resolveRedirect,
} from '../lib/dist.ts';
import { ADDED_URL_PREFIXES, DROPPED_URLS } from '../lib/expected.ts';
import { classifyPath } from '../lib/urls.ts';

const baseline = loadUrls();
const built = builtPages();
const rules = loadRedirects();

/** Where a baseline URL ends up on the new site, or null. */
function destination(url: string): string | null {
  if (built.has(url)) return url;
  const rule = resolveRedirect(asBrowserSends(url));
  return rule && built.has(rule.to) ? rule.to : null;
}

describe('R1: every live URL still works', () => {
  it('serves or redirects every baseline URL', () => {
    const lost = baseline.filter((url) => !(url in DROPPED_URLS) && !destination(url));
    expect(lost).toEqual([]);
  });

  it('has dropped only the URLs listed as dropped', () => {
    for (const url of Object.keys(DROPPED_URLS)) {
      expect(baseline, `${url} is not in the baseline`).toContain(url);
      expect(destination(url), `${url} is listed as dropped but still works`).toBeNull();
    }
  });

  it('has added no pages beyond the new homes of old URLs', () => {
    const known = new Set(baseline.map(destination).filter(Boolean));
    const added = [...built].filter(
      (url) =>
        !known.has(url) &&
        !Object.keys(ADDED_URL_PREFIXES).some((prefix) => url.startsWith(prefix)),
    );
    expect(added).toEqual([]);
  });
});

describe('R4: tag and category URLs are unchanged', () => {
  it('builds every baseline tag and category page at the same URL', () => {
    const moved = baseline.filter((url) => {
      const type = classifyPath(url);
      return (type === 'tag' || type === 'category') && !built.has(url);
    });
    expect(moved).toEqual([]);
  });
});

describe('R3: redirects are sound', () => {
  it('has rules', () => {
    expect(rules.length).toBeGreaterThan(80);
  });

  it('sends every rule to a real page with a 301', () => {
    for (const rule of rules) {
      expect(built.has(rule.to), `${rule.from} -> ${rule.to}`).toBe(true);
      expect(rule.status, rule.from).toBe(301);
    }
  });

  it('has no chains: no target is itself redirected', () => {
    const chained = rules.filter((rule) => {
      const next = rules.find(
        (other) => !other.from.includes(':') && other.from === asBrowserSends(rule.to),
      );
      return Boolean(next);
    });
    expect(chained).toEqual([]);
  });

  it('has no rule shadowed by a real page', () => {
    // Netlify serves a page before it looks at redirects, so a rule whose
    // source is a page would never run.
    const shadowed = rules.filter(
      (rule) => !rule.from.includes(':') && built.has(decodeURI(rule.from)),
    );
    expect(shadowed).toEqual([]);
  });

  it('writes no rule twice', () => {
    const sources = rules.map((rule) => rule.from);
    expect(new Set(sources).size).toBe(sources.length);
  });
});

describe('R23: unpublished things stay unpublished', () => {
  it('builds no page for the draft', () => {
    const draft = [...built].filter((url) => url.includes('reading-getting-things-done'));
    expect(draft).toEqual([]);
  });

  it('builds no page for the three posts that have no file extension', () => {
    const unpublished = [...built].filter(
      (url) =>
        url.includes('can-pok') ||
        url.includes('should-i-become-a-product-manager') ||
        url.includes('ep035'),
    );
    expect(unpublished).toEqual([]);
  });

  it('redirects the Gatsby starter page instead of building it', () => {
    expect(built.has('/using-typescript/')).toBe(false);
    expect(resolveRedirect('/using-typescript/')?.to).toBe('/');
  });
});
