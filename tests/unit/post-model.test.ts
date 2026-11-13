import { describe, expect, it } from 'vitest';
import {
  ContentError,
  categoryTerms,
  finalizePosts,
  localImages,
  pagePath,
  paginate,
  postSlug,
  sortPosts,
  tagTerms,
  termSlug,
  toPost,
  validatePosts,
  type PostInput,
} from '../../src/lib/post-model.ts';

const input = (over: Partial<PostInput> = {}): PostInput => ({
  id: 'a',
  source: 'markdown',
  filePath: 'content/blog/2019-09-07-small-wins.md',
  title: 'Small Wins',
  date: new Date('2019-09-07T00:00:00Z'),
  html: '<p>Body</p>',
  ...over,
});

describe('toPost', () => {
  it('builds the URL from the date and the file name', () => {
    const post = toPost(input());
    expect(post.slug).toBe('small-wins');
    expect(post.url).toBe('/2019/09/small-wins/');
    expect(post.tags).toEqual([]);
    expect(post.redirectFrom).toEqual([]);
  });

  it('prefers the slug from frontmatter', () => {
    expect(toPost(input({ slug: 'tiny-wins' })).url).toBe('/2019/09/tiny-wins/');
  });

  it('uses UTC for the month', () => {
    const post = toPost(input({ date: new Date('2015-07-31T23:30:00Z') }));
    expect(post.url).toBe('/2015/07/small-wins/');
  });

  it('rejects a post with no valid date', () => {
    expect(() => toPost(input({ date: new Date('nope') }))).toThrow(ContentError);
    expect(() => toPost(input({ date: undefined as unknown as Date }))).toThrow(
      /no valid date/,
    );
  });

  it('rejects a post with a blank title', () => {
    expect(() => toPost(input({ title: '  ' }))).toThrow(/no title/);
  });
});

describe('postSlug', () => {
  it('rejects an untidy slug from frontmatter', () => {
    expect(() => postSlug(input({ slug: 'Great-Series' }))).toThrow(
      /lowercase letters, digits and single hyphens/,
    );
  });

  it('rejects an untidy file name and says how to fix it', () => {
    expect(() =>
      postSlug(
        input({
          filePath: 'content/blog/2015-07-22-we-need-more-bad-ideas-|-manton-reece.md',
        }),
      ),
    ).toThrow(/Add a clean `slug:`/);
  });

  it('accepts an untidy file name when the frontmatter slug is clean', () => {
    expect(
      postSlug(
        input({
          filePath: 'content/blog/2015-07-22-we-need-more-bad-ideas-|-manton-reece.md',
          slug: 'we-need-more-bad-ideas-manton-reece',
        }),
      ),
    ).toBe('we-need-more-bad-ideas-manton-reece');
  });

  it('needs a slug when there is no file to take one from', () => {
    expect(() =>
      postSlug({ id: 'contentful-1', filePath: undefined, slug: undefined }),
    ).toThrow(/no slug/);
  });
});

describe('sortPosts', () => {
  it('puts the newest first and breaks ties by URL', () => {
    const posts = [
      toPost(input({ id: 'old', date: new Date('2010-01-01T00:00:00Z'), slug: 'old' })),
      toPost(input({ id: 'b', slug: 'b' })),
      toPost(input({ id: 'new', date: new Date('2026-01-01T00:00:00Z'), slug: 'new' })),
      toPost(input({ id: 'a', slug: 'a' })),
    ];
    expect(sortPosts(posts).map((p) => p.id)).toEqual(['new', 'a', 'b', 'old']);
  });
});

describe('validatePosts', () => {
  it('accepts posts with distinct URLs', () => {
    expect(() =>
      validatePosts([
        toPost(input({ id: 'a', slug: 'a' })),
        toPost(input({ id: 'b', slug: 'b', redirectFrom: ['/2019/09/B/'] })),
      ]),
    ).not.toThrow();
  });

  it('rejects two posts with the same URL', () => {
    expect(() =>
      validatePosts([toPost(input({ id: 'a' })), toPost(input({ id: 'b' }))]),
    ).toThrow(/a and b|b and a/);
  });

  it('rejects a redirect from a URL where another post lives', () => {
    expect(() =>
      validatePosts([
        toPost(input({ id: 'a', slug: 'a' })),
        toPost(input({ id: 'b', slug: 'b', redirectFrom: ['/2019/09/a/'] })),
      ]),
    ).toThrow(/lives at that URL/);
  });

  it('rejects a post that redirects to itself', () => {
    expect(() =>
      validatePosts([toPost(input({ slug: 'a', redirectFrom: ['/2019/09/a/'] }))]),
    ).toThrow(/to itself/);
  });

  it('rejects two posts claiming the same old URL', () => {
    expect(() =>
      validatePosts([
        toPost(input({ id: 'a', slug: 'a', redirectFrom: ['/2019/09/old/'] })),
        toPost(input({ id: 'b', slug: 'b', redirectFrom: ['/2019/09/old/'] })),
      ]),
    ).toThrow(/both redirect from/);
  });

  it('rejects a redirect that is not a path with slashes', () => {
    expect(() =>
      validatePosts([toPost(input({ redirectFrom: ['2019/09/old'] }))]),
    ).toThrow(/must start and end with/);
  });

  it('lists every problem at once', () => {
    try {
      validatePosts([
        toPost(input({ id: 'a' })),
        toPost(input({ id: 'b' })),
        toPost(input({ id: 'c', slug: 'c', redirectFrom: ['/2019/09/c/'] })),
      ]);
      expect.unreachable();
    } catch (err) {
      expect((err as Error).message.match(/^ {2}- /gm)).toHaveLength(2);
    }
  });
});

describe('local images', () => {
  const html =
    '<p><img src="/images/2012/08/solr1.png" alt=""> <img src=\'/images/a%20b.png?x=1\'>' +
    '<img src="https://example.com/c.png"><img src="//example.com/d.png"></p>';

  it('finds the images served from this site', () => {
    expect(localImages(html)).toEqual(['/images/2012/08/solr1.png', '/images/a b.png']);
  });

  it('rejects a post that shows an image with no file', () => {
    const post = toPost(input({ id: 'a', html }));
    expect(() =>
      validatePosts([post], { publicFileExists: (path) => path !== '/images/a b.png' }),
    ).toThrow(/a shows the image \/images\/a b\.png, but there is no file public\/images\/a b\.png/);
  });

  it('accepts a post whose images are all there', () => {
    const post = toPost(input({ id: 'a', html }));
    expect(() => validatePosts([post], { publicFileExists: () => true })).not.toThrow();
  });
});

describe('finalizePosts', () => {
  it('lets markdown win when Contentful has a post at the same URL', () => {
    const posts = finalizePosts([
      toPost(input({ id: 'cf', source: 'contentful', filePath: undefined, slug: 'small-wins' })),
      toPost(input({ id: 'md' })),
      toPost(input({ id: 'cf-only', source: 'contentful', filePath: undefined, slug: 'other' })),
    ]);
    expect(posts.map((p) => p.id).sort()).toEqual(['cf-only', 'md']);
  });
});

describe('termSlug', () => {
  it.each([
    ['Android', 'android'],
    ['CoreData', 'core-data'],
    ['twitter2gTalk', 'twitter-2-g-talk'],
    ['gpowered.net', 'gpowered-net'],
    ['Docs Spreadsheets', 'docs-spreadsheets'],
    ['HOWTO', 'howto'],
    ['iOS', 'i-os'],
    ['', ''],
  ])('%s becomes %s', (name, slug) => {
    expect(termSlug(name)).toBe(slug);
  });
});

describe('tagTerms and categoryTerms', () => {
  const posts = [
    toPost(input({ id: 'new', slug: 'new', date: new Date('2020-01-01T00:00:00Z'), tags: ['android', 'Swift'], category: 'Code' })),
    toPost(input({ id: 'old', slug: 'old', date: new Date('2010-01-01T00:00:00Z'), tags: ['Android', 'Android'], category: 'code' })),
    toPost(input({ id: 'none', slug: 'none', date: new Date('2015-01-01T00:00:00Z') })),
  ];

  it('groups spellings that share a slug, newest post first', () => {
    const android = tagTerms(posts).find((t) => t.slug === 'android')!;
    expect(android.posts.map((p) => p.id)).toEqual(['new', 'old']);
  });

  it('shows the name from the oldest post', () => {
    expect(tagTerms(posts).find((t) => t.slug === 'android')!.name).toBe('Android');
    expect(categoryTerms(posts)[0]).toMatchObject({ slug: 'code', name: 'code' });
  });

  it('lists a post once even if it repeats a tag', () => {
    expect(tagTerms(posts).find((t) => t.slug === 'android')!.posts).toHaveLength(2);
  });

  it('ignores posts with no category and tags with no slug', () => {
    expect(categoryTerms(posts)).toHaveLength(1);
    const empty = toPost(input({ id: 'e', slug: 'e', tags: ['', '!!!'] }));
    expect(tagTerms([empty])).toEqual([]);
  });
});

describe('paginate and pagePath', () => {
  it('splits into pages of 20 by default', () => {
    const pages = paginate(Array.from({ length: 45 }, (_, i) => i));
    expect(pages.map((p) => p.length)).toEqual([20, 20, 5]);
  });

  it('gives an empty list one empty page', () => {
    expect(paginate([])).toEqual([[]]);
  });

  it('builds page paths', () => {
    expect(pagePath('/', 1)).toBe('/');
    expect(pagePath('/', 3)).toBe('/page/3/');
    expect(pagePath('/tag/android/', 2)).toBe('/tag/android/page/2/');
  });
});
