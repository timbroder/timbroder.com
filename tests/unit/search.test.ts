import { describe, expect, it } from 'vitest';
import {
  RESULTS_PER_PAGE,
  addressOf,
  countLine,
  isOnlyTheTitle,
  moreLabel,
  queryFrom,
  resultWhen,
} from '../../src/lib/search.ts';

describe('the search in a page address', () => {
  it('is read from ?q=, without the space around it', () => {
    expect(queryFrom('?q=redirects')).toBe('redirects');
    expect(queryFrom('?q=small+wins')).toBe('small wins');
    expect(queryFrom('?q=%20caf%C3%A9%20')).toBe('café');
  });

  it('is empty when the address has none', () => {
    expect(queryFrom('')).toBe('');
    expect(queryFrom('?page=2')).toBe('');
    expect(queryFrom('?q=')).toBe('');
  });

  it('is written back so that it reads the same', () => {
    for (const query of ['redirects', 'small wins', 'c++ & c#', 'café', '“quoted”', '100%']) {
      const address = addressOf(query);
      expect(address.startsWith('/search/?q=')).toBe(true);
      expect(queryFrom(address.slice('/search/'.length)), query).toBe(query);
    }
  });

  it('leaves the address bare when the search is empty', () => {
    expect(addressOf('')).toBe('/search/');
    expect(addressOf('', '/somewhere/')).toBe('/somewhere/');
  });
});

describe('the line that counts the results', () => {
  it('says how many posts match, and what was searched for', () => {
    expect(countLine(12, 'redirects')).toBe('12 posts match “redirects”.');
    expect(countLine(1, 'kobo')).toBe('1 post matches “kobo”.');
  });

  it('says so when none do', () => {
    expect(countLine(0, 'xyzzy')).toBe('No posts match “xyzzy”.');
  });
});

describe('the "Show more" button', () => {
  it('offers the next ten', () => {
    expect(RESULTS_PER_PAGE).toBe(10);
    expect(moreLabel(10, 27)).toBe('Show 10 more');
  });

  it('offers what is left when that is fewer', () => {
    expect(moreLabel(20, 27)).toBe('Show 7 more');
    expect(moreLabel(10, 11)).toBe('Show 1 more');
  });

  it('is not shown when every result is on the page', () => {
    expect(moreLabel(27, 27)).toBeNull();
    expect(moreLabel(3, 3)).toBeNull();
    expect(moreLabel(0, 0)).toBeNull();
  });
});

describe('the date and category beside a result', () => {
  it('are written as on a post card', () => {
    expect(resultWhen('2026-11-11', 'Code')).toBe('November 11, 2026 in Code');
  });

  it('leave the category out when the post has none', () => {
    expect(resultWhen('2019-09-07')).toBe('September 07, 2019');
    expect(resultWhen('2019-09-07', '')).toBe('September 07, 2019');
  });

  it('are empty when the index has no date for the post', () => {
    expect(resultWhen(undefined, 'Code')).toBe('');
    expect(resultWhen('not a date')).toBe('');
  });
});

describe('a passage that is only the title', () => {
  it('is what a post with no words of its own gives', () => {
    // Pagefind ends a block of text with a full stop.
    expect(isOnlyTheTitle('Then and Now.', 'Then and Now')).toBe(true);
    expect(isOnlyTheTitle('  Foxtrot   Android. ', 'Foxtrot Android')).toBe(true);
    expect(isOnlyTheTitle('Outtake from our engagement photo shoot.', 'Outtake from our engagement photo shoot.')).toBe(true);
  });

  it('is not a passage from the text of the post', () => {
    expect(isOnlyTheTitle('Then and now, a comic about meetings.', 'Then and Now')).toBe(false);
    expect(isOnlyTheTitle('', 'Then and Now')).toBe(false);
  });
});
