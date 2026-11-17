import { describe, expect, it } from 'vitest';
import { SITE, formatDate, isoDate, shortDate } from '../../src/lib/site.ts';

describe('dates', () => {
  // Half past eleven at night in New York is already the next day in UTC.
  const date = new Date('2026-11-12T04:30:00Z');

  it('are written in UTC, so they do not depend on where the build runs', () => {
    expect(formatDate(date)).toBe('November 12, 2026');
    expect(shortDate(date)).toBe('Nov 12');
    expect(isoDate(date)).toBe('2026-11-12');
  });

  it('show a single-digit day without a zero in the short form', () => {
    expect(shortDate(new Date('2019-09-07T00:00:00Z'))).toBe('Sep 7');
  });
});

describe('footer links', () => {
  it('lead to the archive and the tag index, with trailing slashes', () => {
    expect(SITE.footerNav.map((item) => item.href)).toEqual(['/archive/', '/tag/']);
  });
});
