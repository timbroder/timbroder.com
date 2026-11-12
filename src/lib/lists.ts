/**
 * Splits a list of posts into the pages of a paged list (home, a tag, a
 * category), with everything a list page needs to render and link itself.
 */
import { pagePath, paginate, type Post } from './post-model.ts';

export interface ListPage {
  /** This page's path. */
  path: string;
  /** The first page of the list, for example "/tag/android/". */
  root: string;
  page: number;
  numPages: number;
  posts: Post[];
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
      prev: page > 1 ? pagePath(root, page - 1) : null,
      next: page < pages.length ? pagePath(root, page + 1) : null,
    };
  });
}

/** "Tag: Android" on page 1, "Tag: Android - Page 2" after that. */
export function listTitle(base: string, page: number): string {
  return page > 1 ? `${base} - Page ${page}` : base;
}
