/**
 * What a post is, and the rules every post has to follow.
 *
 * Nothing here knows where a post came from. Markdown files and Contentful
 * entries are both turned into `Post`, and pages, lists and the feed only
 * ever see `Post`.
 *
 * These are plain functions with no Astro imports, so they can be unit
 * tested, and so the build fails with a clear message when content breaks a
 * rule.
 */
import { kebabCase } from 'lodash-es';
import { fileStem, yearMonth } from './legacy-url.ts';
import { isCleanSlug } from './slug.ts';

export const POSTS_PER_PAGE = 20;

export type PostSource = 'markdown' | 'contentful';

export interface Post {
  /** Unique across both sources. */
  id: string;
  source: PostSource;
  title: string;
  date: Date;
  slug: string;
  /** The post's path: /YYYY/MM/slug/ */
  url: string;
  /** Old paths that must redirect here. */
  redirectFrom: string[];
  /** For link posts, the article being commented on. */
  link?: string;
  tags: string[];
  category?: string;
  description?: string;
  /** The rendered body. */
  html: string;
}

export interface PostInput {
  id: string;
  source: PostSource;
  /** Source file, for markdown posts. Used for the slug and in error messages. */
  filePath?: string;
  title: string;
  date: Date;
  slug?: string;
  redirectFrom?: string[];
  link?: string;
  tags?: string[];
  category?: string;
  description?: string;
  html: string;
}

export class ContentError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ContentError';
  }
}

const describe = (input: { id: string; filePath?: string }) =>
  input.filePath ?? input.id;

/**
 * A post's slug: `slug:` from frontmatter, or else the file name without its
 * date. Either way it has to be clean, so untidy URLs cannot come back.
 */
export function postSlug(input: Pick<PostInput, 'id' | 'filePath' | 'slug'>): string {
  const slug =
    input.slug ??
    (input.filePath
      ? fileStem(input.filePath).replace(/^\d{4}-\d{2}-\d{2}-/, '')
      : undefined);
  if (!slug) {
    throw new ContentError(`${describe(input)} has no slug.`);
  }
  if (!isCleanSlug(slug)) {
    throw new ContentError(
      `${describe(input)} would get the slug "${slug}". Slugs may only contain ` +
        'lowercase letters, digits and single hyphens. Add a clean `slug:` to its frontmatter.',
    );
  }
  return slug;
}

export function postUrl(date: Date, slug: string): string {
  return `/${yearMonth(date)}/${slug}/`;
}

export function toPost(input: PostInput): Post {
  if (!(input.date instanceof Date) || Number.isNaN(input.date.getTime())) {
    throw new ContentError(`${describe(input)} has no valid date.`);
  }
  if (!input.title.trim()) {
    throw new ContentError(`${describe(input)} has no title.`);
  }
  const slug = postSlug(input);
  return {
    id: input.id,
    source: input.source,
    title: input.title,
    date: input.date,
    slug,
    url: postUrl(input.date, slug),
    redirectFrom: input.redirectFrom ?? [],
    link: input.link,
    tags: input.tags ?? [],
    category: input.category,
    description: input.description,
    html: input.html,
  };
}

/** Newest first. Posts with the same date are ordered by URL, so the order never changes between builds. */
export function sortPosts(posts: Post[]): Post[] {
  return [...posts].sort(
    (a, b) => b.date.getTime() - a.date.getTime() || a.url.localeCompare(b.url),
  );
}

/**
 * When a markdown post and a Contentful post have the same URL, the markdown
 * post wins. Returns the posts to keep and the ones that were dropped.
 */
export function preferMarkdown(posts: Post[]): { kept: Post[]; dropped: Post[] } {
  const markdownUrls = new Set(
    posts.filter((p) => p.source === 'markdown').map((p) => p.url),
  );
  const kept: Post[] = [];
  const dropped: Post[] = [];
  for (const post of posts) {
    if (post.source === 'contentful' && markdownUrls.has(post.url)) dropped.push(post);
    else kept.push(post);
  }
  return { kept, dropped };
}

/**
 * Checks that hold across all posts. Throws a ContentError listing every
 * problem, so one build shows everything that needs fixing.
 */
export function validatePosts(posts: Post[]): void {
  const problems: string[] = [];
  const urls = new Map<string, Post>();

  for (const post of posts) {
    const clash = urls.get(post.url);
    if (clash) {
      problems.push(`${post.id} and ${clash.id} both have the URL ${post.url}`);
    }
    urls.set(post.url, post);
  }

  const redirects = new Map<string, Post>();
  for (const post of posts) {
    for (const from of post.redirectFrom) {
      if (!from.startsWith('/') || !from.endsWith('/')) {
        problems.push(
          `${post.id} has redirect_from "${from}", which must start and end with "/"`,
        );
      }
      if (from === post.url) {
        problems.push(`${post.id} redirects ${from} to itself`);
      } else if (urls.has(from)) {
        problems.push(
          `${post.id} wants to redirect ${from}, but ${urls.get(from)!.id} lives at that URL`,
        );
      }
      const other = redirects.get(from);
      if (other && other !== post) {
        problems.push(`${post.id} and ${other.id} both redirect from ${from}`);
      }
      redirects.set(from, post);
    }
  }

  if (problems.length) {
    throw new ContentError(
      `Content problems:\n${problems.map((p) => `  - ${p}`).join('\n')}`,
    );
  }
}

/** Sort, resolve clashes between sources, and validate. */
export function finalizePosts(posts: Post[]): Post[] {
  const { kept } = preferMarkdown(posts);
  const sorted = sortPosts(kept);
  validatePosts(sorted);
  return sorted;
}

/**
 * The URL form of a tag or category name. This is lodash's kebabCase because
 * that is what the Gatsby site used, and it splits on capitals and digits:
 * "CoreData" becomes "core-data", "twitter2gTalk" becomes "twitter-2-g-talk".
 */
export function termSlug(name: string): string {
  return kebabCase(name);
}

export interface Term {
  slug: string;
  /** The display name, taken from the oldest post that uses the term. */
  name: string;
  /** Newest first. */
  posts: Post[];
}

/**
 * Group posts by tag or category. Names that differ only in case or
 * punctuation share a page, because they share a slug.
 */
export function groupByTerm(
  posts: Post[],
  termsOf: (post: Post) => string[],
): Term[] {
  const terms = new Map<string, Term>();
  // Oldest first, so the oldest spelling of a name is the one displayed.
  for (const post of [...sortPosts(posts)].reverse()) {
    const seen = new Set<string>();
    for (const name of termsOf(post)) {
      const slug = termSlug(name);
      if (!slug || seen.has(slug)) continue;
      seen.add(slug);
      const term = terms.get(slug) ?? { slug, name, posts: [] };
      term.posts.unshift(post);
      terms.set(slug, term);
    }
  }
  return [...terms.values()].sort((a, b) => a.slug.localeCompare(b.slug));
}

export const tagTerms = (posts: Post[]) => groupByTerm(posts, (p) => p.tags);
export const categoryTerms = (posts: Post[]) =>
  groupByTerm(posts, (p) => (p.category ? [p.category] : []));

/** Split a list into pages. An empty list still has one (empty) page. */
export function paginate<T>(items: T[], size = POSTS_PER_PAGE): T[][] {
  const pages: T[][] = [];
  for (let i = 0; i < items.length; i += size) pages.push(items.slice(i, i + size));
  return pages.length ? pages : [[]];
}

/** "/tag/android/" for page 1, "/tag/android/page/2/" after that. */
export function pagePath(root: string, page: number): string {
  return page <= 1 ? root : `${root}page/${page}/`;
}
