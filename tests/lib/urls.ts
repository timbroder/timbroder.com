/**
 * URL helpers shared by the baseline capture and the tests.
 *
 * Paths are always stored decoded (so `’` and `|` are readable) and with a
 * leading slash.
 */

export type PageType =
  | 'home' // "/" and "/page/N/"
  | 'tag' // "/tag/x/" and "/tag/x/page/N/"
  | 'category' // "/category/x/" and "/category/x/page/N/"
  | 'post' // "/YYYY/MM/slug/"
  | 'about'
  | 'notfound'
  | 'page'; // markdown pages and anything else

export const LIST_TYPES: readonly PageType[] = ['home', 'tag', 'category'];

const POST = /^\/\d{4}\/\d{2}\/[^/]+\/?$/;

export function classifyPath(path: string): PageType {
  if (path === '/' || /^\/page\/\d+\/?$/.test(path)) return 'home';
  if (/^\/tag\/[^/]+(\/page\/\d+)?\/?$/.test(path)) return 'tag';
  if (/^\/category\/[^/]+(\/page\/\d+)?\/?$/.test(path)) return 'category';
  if (POST.test(path)) return 'post';
  if (path === '/about/') return 'about';
  if (path === '/404.html' || path === '/404/') return 'notfound';
  return 'page';
}

export function isListType(type: PageType): boolean {
  return LIST_TYPES.includes(type);
}

/** "/tag/android/page/2/" -> 2, "/tag/android/" -> 1 */
export function pageNumber(path: string): number {
  const m = path.match(/\/page\/(\d+)\/?$/);
  return m ? Number(m[1]) : 1;
}

/** "/tag/android/page/2/" -> "/tag/android/", "/page/3/" -> "/" */
export function listRoot(path: string): string {
  return path.replace(/page\/\d+\/?$/, '');
}

/** Decode a URL or path from the sitemap into a readable path. */
export function toPath(urlOrPath: string): string {
  const pathname = /^https?:\/\//.test(urlOrPath)
    ? new URL(urlOrPath).pathname
    : urlOrPath;
  try {
    return decodeURI(pathname);
  } catch {
    return pathname;
  }
}

/** Card links on the live site have no trailing slash; pages do. */
export function withTrailingSlash(path: string): string {
  return path.endsWith('/') ? path : `${path}/`;
}
