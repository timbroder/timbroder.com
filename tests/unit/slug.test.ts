import { describe, expect, it } from 'vitest';
import { cleanSlug, isCleanSlug } from '../../src/lib/slug.ts';

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

describe('cleanSlug', () => {
  it.each([
    ['we-need-more-bad-ideas-|-manton-reece', 'we-need-more-bad-ideas-manton-reece'],
    ['Great-Series-on-Errors-&-Their-Presentation', 'great-series-on-errors-and-their-presentation'],
    ['tektok-podcast---ep023---overly-connected', 'tektok-podcast-ep023-overly-connected'],
    ['apple-music-is-a-nightmare-and-i’m-done-with-it', 'apple-music-is-a-nightmare-and-im-done-with-it'],
    ["world's-best-whisky-is-being-sent-to-age-in-space", 'worlds-best-whisky-is-being-sent-to-age-in-space'],
    ['git-2.5,-including-multiple-worktrees', 'git-2-5-including-multiple-worktrees'],
    ['up-in-the-air:-meet-the-man', 'up-in-the-air-meet-the-man'],
    ['5-reasons-—-not-a-start-up-—-life-learning', '5-reasons-not-a-start-up-life-learning'],
    ['new-blog-address_23', 'new-blog-address-23'],
    ['can-pokémon-go-really-read-all-your-emails', 'can-pokemon-go-really-read-all-your-emails'],
    ['notification-organization (1)', 'notification-organization-1'],
    ['show-&-tell-cast---s02ep017', 'show-and-tell-cast-s02ep017'],
  ])('%s becomes %s', (input, expected) => {
    expect(cleanSlug(input)).toBe(expected);
  });

  it('leaves a clean slug alone', () => {
    expect(cleanSlug('kobo-audiobook-sync')).toBe('kobo-audiobook-sync');
  });

  it('always produces a clean slug', () => {
    for (const input of ['A  B', '--x--', '“quoted”', 'ünïcödé & more']) {
      expect(isCleanSlug(cleanSlug(input)), input).toBe(true);
    }
  });
});
