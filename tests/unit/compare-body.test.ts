import { describe, expect, it } from 'vitest';
import {
  compareBodies,
  joinWrappedLines,
  rawAddresses,
  sameOnceRendered,
  type ImageChanges,
} from '../lib/compare-body.ts';

const NO_IMAGE_CHANGES: ImageChanges = {
  removed: new Set(),
  removedLinks: new Set(),
  replaced: new Set(),
};

const body = (over: Partial<Parameters<typeof compareBodies>[0]> = {}) => ({
  text: 'One two.',
  headings: [],
  links: [],
  images: [],
  code: [],
  blocks: ['p|8|One two.'],
  counts: { iframes: 0, objects: 0, tables: 0, blockquotes: 0, lists: 0 },
  ...over,
});

describe('sameOnceRendered', () => {
  it('accepts a raw link that became its text', () => {
    expect(
      sameOnceRendered(
        'A podcast [here](http://google-code- updates.blogspot.com/a.html) from them.',
        'A podcast here from them.',
      ),
    ).toBe(true);
  });

  it('accepts a raw picture, and a linked picture, that became nothing', () => {
    expect(sameOnceRendered('Look: ![a chart](http://x.test/a b.png) Nice.', 'Look: Nice.')).toBe(true);
    expect(
      sameOnceRendered('Look: [![](http://x.test/a.png)](http://x.test/big a.png) Nice.', 'Look: Nice.'),
    ).toBe(true);
  });

  it('accepts raw markdown that is still raw', () => {
    const text = 'See [ http://x.test/a]( http://x.test/a) and [b](http://x.test/b c).';
    expect(sameOnceRendered(text, text)).toBe(true);
    expect(sameOnceRendered(text, 'See [ http://x.test/a]( http://x.test/a) and b.')).toBe(true);
  });

  it('does not take "me! [a link](...)" for a picture', () => {
    expect(sameOnceRendered("That's me! [We fix](http://x.test/we- fix): yes", "That's me! We fix: yes")).toBe(
      true,
    );
  });

  it('rejects any other change', () => {
    expect(sameOnceRendered('A [link](http://x.test/a b) here.', 'A link there.')).toBe(false);
    expect(sameOnceRendered('A [link](http://x.test/a b) here.', 'A link here. More.')).toBe(false);
    expect(sameOnceRendered('A link here.', 'A [link](http://x.test/a) here.')).toBe(false);
    expect(sameOnceRendered('Some words.', 'Some word.')).toBe(false);
  });
});

describe('rawAddresses', () => {
  it('finds the addresses of raw links and pictures, without spaces or titles', () => {
    expect(rawAddresses('a [b](http://x.test/a- b "A title") c ![](http://x.test/p.png)')).toEqual([
      'http://x.test/a-b',
      'http://x.test/p.png',
    ]);
  });
});

describe('joinWrappedLines', () => {
  it('moves a paragraph back into the list item it was wrapped out of', () => {
    const live = ['ul>li|20|Unread count is now ', 'p|18|me when I get back', 'ul>li|9|Next item'];
    const built = ['ul>li|39|Unread count is now ', 'ul>li|9|Next item'];
    expect(joinWrappedLines(live, built)).toEqual({ blocks: built, joined: 1 });
  });

  it('does the same for a quote', () => {
    const live = ['blockquote>p|78|I have learned that I am', 'p|8|to keep.', 'p|5|After'];
    const built = ['blockquote>p|87|I have learned that I am', 'p|5|After'];
    expect(joinWrappedLines(live, built)).toEqual({ blocks: built, joined: 1 });
  });

  it('leaves anything else alone', () => {
    // The lengths do not add up: text was lost or gained.
    const live = ['ul>li|20|Unread count is now ', 'p|18|me when I get back'];
    expect(joinWrappedLines(live, ['ul>li|45|Unread count is now ']).joined).toBe(0);
    // Two paragraphs are never joined.
    expect(joinWrappedLines(['p|3|One', 'p|3|Two'], ['p|7|One']).joined).toBe(0);
    // Identical lists pass through.
    expect(joinWrappedLines(live, live)).toEqual({ blocks: live, joined: 0 });
  });
});

describe('compareBodies', () => {
  it('finds nothing in two equal bodies', () => {
    expect(compareBodies(body(), body(), NO_IMAGE_CHANGES)).toEqual({
      nowRendered: false,
      wrappedLines: 0,
      problems: [],
    });
  });

  it('reports raw markdown that now renders, with its new link and picture', () => {
    const live = body({
      text: 'See [here](http://x.test/a- b) ![](http://x.test/p q.png) ok',
      blocks: ['p|58|See [here](http://x.test'],
    });
    const now = body({
      text: 'See here ok',
      links: ['http://x.test/a-b'],
      images: [{ src: '/images/remote/post/pq.png', alt: '' }],
      blocks: ['p|11|See here ok'],
    });
    expect(compareBodies(live, now, NO_IMAGE_CHANGES)).toEqual({
      nowRendered: true,
      wrappedLines: 0,
      problems: [],
    });
  });

  it('reports wrapped lines kept in place, and allows the list to be whole again', () => {
    const live = body({
      blocks: ['ul>li|3|One', 'p|3|two', 'ul>li|5|Three'],
      counts: { iframes: 0, objects: 0, tables: 0, blockquotes: 0, lists: 2 },
    });
    const now = body({
      blocks: ['ul>li|7|One', 'ul>li|5|Three'],
      counts: { iframes: 0, objects: 0, tables: 0, blockquotes: 0, lists: 1 },
    });
    expect(compareBodies(live, now, NO_IMAGE_CHANGES)).toEqual({
      nowRendered: false,
      wrappedLines: 1,
      problems: [],
    });
  });

  it('calls a paragraph swallowed by a list item a problem when the list did not ask for it', () => {
    const live = body({ blocks: ['ul>li|3|One', 'p|4|Cons', 'p|5|After'] });
    const now = body({ blocks: ['ul>li|9|One', 'p|5|After'] });
    expect(compareBodies(live, now, NO_IMAGE_CHANGES).problems.join()).toMatch(/paragraphs and lists differ/);
  });

  it('calls changed words, code, headings and embeds problems', () => {
    const problems = compareBodies(
      body(),
      body({
        text: 'One three.',
        code: ['x'],
        headings: [{ level: 2, text: 'New' }],
        counts: { iframes: 1, objects: 0, tables: 0, blockquotes: 0, lists: 0 },
      }),
      NO_IMAGE_CHANGES,
    ).problems.join('\n');
    expect(problems).toMatch(/text differs/);
    expect(problems).toMatch(/code differs/);
    expect(problems).toMatch(/headings differ/);
    expect(problems).toMatch(/iframes: 0 on the live site, 1 now/);
  });

  it('lets links to the old addresses of this site, and to full-size originals, go', () => {
    const live = body({
      links: ['http://timbroder.com/2011/01/post.html', '/static/abc/photo.jpg', 'http://x.test/kept'],
    });
    const now = body({ links: ['/2011/01/post/', 'http://x.test/kept'] });
    expect(compareBodies(live, now, NO_IMAGE_CHANGES).problems).toEqual([]);
  });

  it('calls any other lost or new link a problem', () => {
    const problems = compareBodies(
      body({ links: ['http://x.test/lost'] }),
      body({ links: ['http://x.test/new'] }),
      NO_IMAGE_CHANGES,
    ).problems.join('\n');
    expect(problems).toMatch(/links gone: \["http:\/\/x.test\/lost"\]/);
    expect(problems).toMatch(/links added: \["http:\/\/x.test\/new"\]/);
  });

  it('accounts for images that were removed, with the links around them', () => {
    const changes: ImageChanges = {
      removed: new Set(['https://feeds.test/~ff/a']),
      removedLinks: new Set(['https://feeds.test/~ff/a?click']),
      replaced: new Set(),
    };
    const live = body({
      images: [{ src: 'https://feeds.test/~ff/a', alt: '' }, { src: 'https://x.test/p.png', alt: '' }],
      links: ['https://feeds.test/~ff/a?click'],
    });
    const now = body({ images: [{ src: '/images/remote/post/p.png', alt: '' }] });
    expect(compareBodies(live, now, changes).problems).toEqual([]);
    expect(compareBodies(live, now, NO_IMAGE_CHANGES).problems.join('\n')).toMatch(/pictures: 1 now, expected 2/);
  });
});
