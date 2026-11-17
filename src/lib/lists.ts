/**
 * Splits a list of posts into the pages of a paged list (home, a tag, a
 * category), with everything a list page needs to render and link itself.
 *
 * Also the other ways to a post: the archive, which groups every post by
 * year, and the newer and older post beside each one.
 */
import { pagePath, paginate, type Post } from './post-model.ts';

export interface ListPage {
  /** This page's path. */
  path: string;
  /** The first page of the list, for example "/tag/android/". */
  root: string;
  page: number;
  numPages: number;
  /** The posts on this page. */
  posts: Post[];
  /** How many posts the whole list has, over all its pages. */
  total: number;
  prev: string | null;
  next: string | null;
}

export function listPages(root: string, posts: Post[]): ListPage[] {
  const pages = paginate(posts);
  return pages.map((pagePosts, index) => {
    const page = index + 1;
    return {
      path: pagePath(root, page),
      root,
      page,
      numPages: pages.length,
      posts: pagePosts,
      total: posts.length,
      prev: page > 1 ? pagePath(root, page - 1) : null,
      next: page < pages.length ? pagePath(root, page + 1) : null,
    };
  });
}

/** "Tag: Android" on page 1, "Tag: Android - Page 2" after that. */
export function listTitle(base: string, page: number): string {
  return page > 1 ? `${base} - Page ${page}` : base;
}

/** A description names posts until it reaches about this many characters. */
const DESCRIPTION_LENGTH = 160;
const MOST_TITLES = 3;

/**
 * What a list page says about itself to search engines and in link
 * previews: how many posts the list has and the titles of the first few on
 * this page. `what` finishes "14 posts ...", for example "tagged Android".
 *
 * Every list page used to carry the site's description, so a search engine
 * saw some 250 pages that described themselves in the same five words.
 */
export function listDescription(list: ListPage, what: string): string {
  const posts = `${list.total} ${list.total === 1 ? 'post' : 'posts'} ${what}`;
  const opening = list.page > 1 ? `Page ${list.page} of ${list.numPages} of the ${posts}` : posts;

  const titles: string[] = [];
  let length = opening.length;
  for (const post of list.posts.slice(0, MOST_TITLES)) {
    const title = `“${post.title}”`;
    if (titles.length > 0 && length + title.length > DESCRIPTION_LENGTH) break;
    titles.push(title);
    length += title.length + 2;
  }

  // On the first page "more" counts the rest of the list; later it counts
  // the rest of the page, since the page number already says where it is.
  if (titles.length === 0) return `${opening}.`;
  const more = (list.page > 1 ? list.posts.length : list.total) - titles.length;
  const last = more > 0 ? `${more} more` : titles.pop()!;
  const named = titles.length > 0 ? `${titles.join(', ')} and ${last}` : last;
  return `${opening}: ${named}.`;
}

export interface YearOfPosts {
  year: number;
  /** In the order they were given. */
  posts: Post[];
}

/**
 * Posts grouped by the year of their date, in UTC as in their addresses.
 * Given posts newest first, the years come out newest first too.
 */
export function postsByYear(posts: Post[]): YearOfPosts[] {
  const years: YearOfPosts[] = [];
  for (const post of posts) {
    const year = post.date.getUTCFullYear();
    const current = years.at(-1);
    if (current?.year === year) current.posts.push(post);
    else years.push({ year, posts: [post] });
  }
  return years;
}

export interface Neighbours {
  newer: Post | null;
  older: Post | null;
}

/** The posts on either side of `post` in a list that is newest first. */
export function neighbours(posts: Post[], post: Post): Neighbours {
  const index = posts.indexOf(post);
  return {
    newer: index > 0 ? posts[index - 1] : null,
    older: index >= 0 && index < posts.length - 1 ? posts[index + 1] : null,
  };
}
