import { describe, expect, it } from 'vitest';
import { samplePosts } from '../../src/fixtures/posts.ts';
import { listDescription, listPages, neighbours, postsByYear } from '../../src/lib/lists.ts';
import { sortPosts, toPost, type Post } from '../../src/lib/post-model.ts';

/** `count` posts, newest first, titled "Post 1" (the newest) onwards. */
function posts(count: number, title = (n: number) => `Post ${n}`): Post[] {
  return sortPosts(
    Array.from({ length: count }, (_, i) =>
      toPost({
        id: `post-${i + 1}`,
        source: 'markdown',
        title: title(i + 1),
        date: new Date(Date.UTC(2020, 0, 1) - i * 86_400_000),
        slug: `post-${i + 1}`,
        html: '',
      }),
    ),
  );
}

describe('listPages', () => {
  it('tells every page how many posts the whole list has', () => {
    const pages = listPages('/tag/android/', posts(45));
    expect(pages.map((page) => page.total)).toEqual([45, 45, 45]);
    expect(pages.map((page) => page.posts.length)).toEqual([20, 20, 5]);
  });
});

describe('listDescription', () => {
  const describeList = (count: number, page = 1, title?: (n: number) => string) =>
    listDescription(listPages('/tag/android/', posts(count, title))[page - 1], 'tagged Android');

  it('names the only post of a list', () => {
    expect(describeList(1)).toBe('1 post tagged Android: “Post 1”.');
  });

  it('names every post of a short list', () => {
    expect(describeList(2)).toBe('2 posts tagged Android: “Post 1” and “Post 2”.');
    expect(describeList(3)).toBe('3 posts tagged Android: “Post 1”, “Post 2” and “Post 3”.');
  });

  it('names the first three posts of a longer list and counts the rest', () => {
    expect(describeList(14)).toBe('14 posts tagged Android: “Post 1”, “Post 2”, “Post 3” and 11 more.');
  });

  it('says which page it is after the first, and counts the rest of that page', () => {
    expect(describeList(45, 2)).toBe(
      'Page 2 of 3 of the 45 posts tagged Android: “Post 21”, “Post 22”, “Post 23” and 17 more.',
    );
    expect(describeList(45, 3)).toBe(
      'Page 3 of 3 of the 45 posts tagged Android: “Post 41”, “Post 42”, “Post 43” and 2 more.',
    );
  });

  it('stops naming posts when the titles are long, but always names one', () => {
    const long = (n: number) => `${'A very long title that goes on and on. '.repeat(3)}${n}`;
    expect(describeList(5, 1, long)).toBe(`5 posts tagged Android: “${long(1)}” and 4 more.`);
    const longer = (n: number) => `${'A very long title that goes on and on. '.repeat(6)}${n}`;
    expect(describeList(1, 1, longer)).toBe(`1 post tagged Android: “${longer(1)}”.`);
  });

  it('names nothing when the list is empty', () => {
    expect(describeList(0)).toBe('0 posts tagged Android.');
  });

  it('differs between two lists that hold the same post', () => {
    const [list] = listPages('/tag/x/', posts(1));
    expect(listDescription(list, 'tagged admob')).not.toBe(listDescription(list, 'tagged adwhirl'));
  });
});

describe('postsByYear', () => {
  it('groups posts under the year of their date, newest year and newest post first', () => {
    const years = postsByYear(sortPosts(samplePosts));
    expect(years.map(({ year }) => year)).toEqual([2026, 2025, 2019, 2018, 2014, 2010]);
    expect(years.flatMap(({ posts: inYear }) => inYear)).toEqual(sortPosts(samplePosts));
    for (const { year, posts: inYear } of years) {
      expect(inYear.every((post) => post.date.getUTCFullYear() === year)).toBe(true);
    }
  });

  it('uses the year in UTC, as post addresses do', () => {
    const [newYear] = posts(1);
    const lateOnNewYearsEve = { ...newYear, date: new Date('2019-12-31T23:30:00Z') };
    expect(postsByYear([lateOnNewYearsEve]).map(({ year }) => year)).toEqual([2019]);
  });

  it('has no years when there are no posts', () => {
    expect(postsByYear([])).toEqual([]);
  });
});

describe('neighbours', () => {
  const [first, second, third] = posts(3);

  it('finds the newer and the older post', () => {
    expect(neighbours([first, second, third], second)).toEqual({ newer: first, older: third });
  });

  it('has nothing newer than the newest post, and nothing older than the oldest', () => {
    expect(neighbours([first, second, third], first)).toEqual({ newer: null, older: second });
    expect(neighbours([first, second, third], third)).toEqual({ newer: second, older: null });
    expect(neighbours([first], first)).toEqual({ newer: null, older: null });
  });
});
