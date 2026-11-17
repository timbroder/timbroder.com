import { describe, expect, it } from 'vitest';
import {
  fileStem,
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
