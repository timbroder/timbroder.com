/**
 * R3, R23: redirects are sound, and nothing unpublished is published.
 *
 * The redirects are the old addresses of posts whose slug was tidied up
 * (`redirect_from:` in their frontmatter) plus a short fixed list. Netlify
 * reads them from the _redirects file in the build.
 */
import { describe, expect, it } from 'vitest';
import { asBrowserSends, builtPages, loadRedirects, resolveRedirect } from '../lib/dist.ts';

const built = builtPages();
const rules = loadRedirects();

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
