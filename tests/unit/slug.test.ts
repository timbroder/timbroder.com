import { describe, expect, it } from 'vitest';
import { isCleanSlug } from '../../src/lib/slug.ts';

describe('isCleanSlug', () => {
  it.each(['small-wins', 'kobo-audiobook-sync', 'git-2-5', 'a', '2014'])(
    'accepts %s',
    (slug) => {
      expect(isCleanSlug(slug)).toBe(true);
    },
  );

  it.each([
    'Great-Series',
    'a---b',
    'new-blog-address_23',
    'we-need-more-bad-ideas-|-manton-reece',
    "world's-best",
    'aren’t',
    '-leading',
    'trailing-',
    '',
  ])('rejects %s', (slug) => {
    expect(isCleanSlug(slug)).toBe(false);
  });
});
