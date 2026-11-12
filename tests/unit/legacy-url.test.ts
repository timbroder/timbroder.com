import { describe, expect, it } from 'vitest';
import {
  fileStem,
  legacyPagePath,
  legacyPostPath,
  parseFrontmatterDate,
  yearMonth,
} from '../../src/lib/legacy-url.ts';

describe('parseFrontmatterDate', () => {
  it('passes a Date through', () => {
    const date = new Date('2007-07-19T03:07:00Z');
    expect(parseFrontmatterDate(date)).toBe(date);
  });

  it('reads a date without seconds as UTC, not local time', () => {
    // YAML leaves this form as a string. `new Date()` would use local time.
    expect(parseFrontmatterDate('2015-07-22 10:25')?.toISOString()).toBe(
      '2015-07-22T10:25:00.000Z',
    );
  });

  it('reads a bare date as UTC midnight', () => {
    expect(parseFrontmatterDate('2026-11-11')?.toISOString()).toBe(
      '2026-11-11T00:00:00.000Z',
    );
  });

  it('applies an explicit offset', () => {
    expect(
      parseFrontmatterDate('2015-03-10 14:03:30+00:00')?.toISOString(),
    ).toBe('2015-03-10T14:03:30.000Z');
    expect(
      parseFrontmatterDate('2015-12-31 22:00:00-05:00')?.toISOString(),
    ).toBe('2016-01-01T03:00:00.000Z');
  });

  it('returns null for anything else', () => {
    expect(parseFrontmatterDate(undefined)).toBeNull();
    expect(parseFrontmatterDate('next Tuesday')).toBeNull();
    expect(parseFrontmatterDate(new Date('nope'))).toBeNull();
  });
});

describe('yearMonth', () => {
  it('uses UTC, so a late-evening post stays in its month', () => {
    expect(yearMonth(new Date('2015-07-31T23:59:00Z'))).toBe('2015/07');
    expect(yearMonth(new Date('2015-08-01T00:00:00Z'))).toBe('2015/08');
  });
});

describe('fileStem', () => {
  it('drops the directory and the extension', () => {
    expect(fileStem('content/blog/2019-09-07-small-wins.md')).toBe(
      '2019-09-07-small-wins',
    );
    expect(fileStem('2007-07-15-begining.markdown')).toBe('2007-07-15-begining');
  });
});

describe('legacyPostPath', () => {
  it('uses the slug from frontmatter when there is one', () => {
    expect(
      legacyPostPath({
        slug: 'kobo-audiobook-sync',
        date: '2026-11-11',
        filePath: 'content/blog/2026-11-11-kobo-audiobook-sync.md',
      }),
    ).toBe('/2026/11/kobo-audiobook-sync/');
  });

  it('falls back to the file name, keeping its odd characters', () => {
    expect(
      legacyPostPath({
        date: '2015-07-22 10:25',
        filePath: 'content/blog/2015-07-22-we-need-more-bad-ideas-|-manton-reece.md',
      }),
    ).toBe('/2015/07/we-need-more-bad-ideas-|-manton-reece/');
    expect(
      legacyPostPath({
        date: '2016-04-26 10:25',
        filePath: 'content/blog/2016-04-26-Great-Series-on-Errors-&-Their-Presentation.md',
      }),
    ).toBe('/2016/04/Great-Series-on-Errors-&-Their-Presentation/');
  });

  it('takes the month from the date, not the file name', () => {
    expect(
      legacyPostPath({
        date: '2015-08-01 00:30',
        filePath: 'content/blog/2015-07-31-late-night.md',
      }),
    ).toBe('/2015/08/late-night/');
  });

  it('treats an empty slug as missing', () => {
    expect(
      legacyPostPath({
        slug: '',
        date: '2019-09-07',
        filePath: 'content/blog/2019-09-07-small-wins.md',
      }),
    ).toBe('/2019/09/small-wins/');
  });

  it('files an undated post under the fallback month', () => {
    const post = { filePath: 'content/blog/2015-07-19-fussy-coffee.md' };
    expect(legacyPostPath(post, '2026/11')).toBe('/2026/11/fussy-coffee/');
    expect(() => legacyPostPath(post)).toThrow(/no date/);
  });
});

describe('legacyPagePath', () => {
  it('adds the slashes Gatsby added', () => {
    expect(legacyPagePath('/projects')).toBe('/projects/');
    expect(legacyPagePath('/podcasts-i-listen-to/')).toBe(
      '/podcasts-i-listen-to/',
    );
    expect(legacyPagePath('apps')).toBe('/apps/');
  });
});
