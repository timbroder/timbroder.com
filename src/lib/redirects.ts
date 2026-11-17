/**
 * Builds the Netlify _redirects file.
 *
 * Netlify compares a rule with the request exactly as it was sent, so one
 * old URL can need several rules (see "How Netlify matches redirects" in
 * MIGRATION_PLAN.md):
 *
 * - the form a browser sends, where "|" and non-ASCII characters are
 *   percent-encoded but "&", "," and "'" are not
 * - the fully percent-encoded form, for clients that encode everything
 * - both again in lowercase when the old URL has capitals, because Netlify
 *   has been sending visitors to the lowercase form
 *
 * Each old URL is also written with ".html" in place of its last slash.
 * Netlify itself sends "/a/b.html" to "/a/b/" when that page exists, so the
 * site has always answered both. Once a post moves, its old page is gone and
 * only a rule can answer for the ".html" form. Search Console had one of
 * these as "Not found (404)" within days of the cutover.
 */

export interface Redirect {
  from: string;
  to: string;
}

/** Percent-encode everything except unreserved characters and "/". */
export function fullyEncode(path: string): string {
  return path
    .split('/')
    .map((part) =>
      encodeURIComponent(part).replace(
        /[!'()*]/g,
        (c) => `%${c.charCodeAt(0).toString(16).toUpperCase()}`,
      ),
    )
    .join('/');
}

/** Every form of an old path that needs its own rule. */
export function requestForms(path: string): string[] {
  const cases = path === path.toLowerCase() ? [path] : [path, path.toLowerCase()];
  const forms = new Set<string>();
  for (const p of cases) {
    forms.add(encodeURI(p));
    forms.add(fullyEncode(p));
  }
  return [...forms];
}

/** "/2018/01/old-slug/" as "/2018/01/old-slug.html". */
export const htmlForm = (path: string) => path.replace(/\/$/, '.html');

/**
 * Redirects that are not tied to one post.
 *
 * The two posts below had no date on the Gatsby site, so they were filed
 * under the month of the latest build and their URL changed every month.
 * The placeholders catch every month they have lived at. Netlify serves a
 * real page before it looks at redirects, so the posts' own URLs still work.
 *
 * The last one was never an address of this site. Another site links to the
 * Kindle post with the end of the address cut off, and Search Console
 * reported the result as "Not found (404)".
 */
export const FIXED_REDIRECTS: Redirect[] = [
  { from: '/using-typescript/', to: '/' },
  { from: '/:year/:month/fussy-coffee/', to: '/2015/07/fussy-coffee/' },
  {
    from: '/:year/:month/games-i-was-addicted-to-in-2014/',
    to: '/2015/03/games-i-was-addicted-to-in-2014/',
  },
  { from: '/2011/01/getting-it-onto-the-', to: '/2011/01/getting-it-onto-the-kindle/' },
];

export function redirectsFile(
  posts: { url: string; redirectFrom: string[] }[],
  fixed: Redirect[] = FIXED_REDIRECTS,
): string {
  const lines: string[] = [
    '# Generated at build time from redirect_from in post frontmatter.',
    '# Do not edit; see src/lib/redirects.ts.',
  ];
  const sorted = [...posts].sort((a, b) => a.url.localeCompare(b.url));
  for (const post of sorted) {
    // When only the capitals changed, the lowercase form of the old URL is
    // the new URL. A rule for it would point at itself, and Netlify already
    // answers for the new URL's own ".html" form.
    const own = new Set(
      [post.url, htmlForm(post.url)].flatMap((path) => [encodeURI(path), fullyEncode(path)]),
    );
    for (const from of post.redirectFrom) {
      for (const old of [from, htmlForm(from)]) {
        for (const form of requestForms(old)) {
          if (own.has(form)) continue;
          lines.push(`${form}  ${post.url}  301`);
        }
      }
    }
  }
  for (const { from, to } of fixed) {
    lines.push(`${from}  ${to}  301`);
  }
  return `${lines.join('\n')}\n`;
}
