import { describe, expect, it } from 'vitest';
import { SITE, activeNavHref, formatDate, isoDate, shortDate } from '../../src/lib/site.ts';

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
  it('lead to the archive, the tag index and search, with trailing slashes', () => {
    expect(SITE.footerNav.map((item) => item.href)).toEqual(['/archive/', '/tag/', '/search/']);
  });
});

describe('the highlighted navigation item', () => {
  it('is the section a page belongs to', () => {
    expect(activeNavHref('/')).toBe('/');
    expect(activeNavHref('/about/')).toBe('/about/');
  });

  it('is "Posts" on a post, and nothing on a list, a tag or the archive', () => {
    expect(activeNavHref('/2019/09/small-wins/')).toBe('/');
    expect(activeNavHref('/page/2/')).toBeNull();
    expect(activeNavHref('/tag/chrome/')).toBeNull();
    expect(activeNavHref('/archive/')).toBeNull();
  });

  it('is search on the search page', () => {
    expect(activeNavHref('/search/')).toBe('/search/');
    // In the header it is the icon after the words, not one of them.
    expect(SITE.nav.map((item): string => item.href)).not.toContain(SITE.search.href);
  });
});
