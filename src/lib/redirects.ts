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

/**
 * Redirects that are not tied to one post.
 *
 * The two posts below had no date on the Gatsby site, so they were filed
 * under the month of the latest build and their URL changed every month.
 * The placeholders catch every month they have lived at. Netlify serves a
 * real page before it looks at redirects, so the posts' own URLs still work.
 */
export const FIXED_REDIRECTS: Redirect[] = [
  { from: '/using-typescript/', to: '/' },
  { from: '/:year/:month/fussy-coffee/', to: '/2015/07/fussy-coffee/' },
  {
    from: '/:year/:month/games-i-was-addicted-to-in-2014/',
    to: '/2015/03/games-i-was-addicted-to-in-2014/',
  },
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
    for (const from of post.redirectFrom) {
      for (const form of requestForms(from)) {
        // When only the capitals changed, the lowercase form of the old URL
        // is the new URL. A rule for it would point at itself.
        if (form === encodeURI(post.url) || form === fullyEncode(post.url)) continue;
        lines.push(`${form}  ${post.url}  301`);
      }
    }
  }
  for (const { from, to } of fixed) {
    lines.push(`${from}  ${to}  301`);
  }
  return `${lines.join('\n')}\n`;
}
