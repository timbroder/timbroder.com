/**
 * The URL rules of the Gatsby site, kept as small pure functions.
 *
 * They are used to prove that every old URL is still reachable, and to
 * generate redirects for posts whose slug has been cleaned up.
 */

/**
 * Parse a frontmatter date as UTC.
 *
 * YAML only turns a value into a Date when it has seconds, so
 * "2015-07-22 10:25" arrives as a string. `new Date()` would read that as
 * local time, which can move a post into a different month depending on
 * where the build runs. Gatsby built on Netlify (UTC), so UTC is the rule.
 */
export function parseFrontmatterDate(value: unknown): Date | null {
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? null : value;
  }
  if (typeof value !== 'string') return null;
  const m = value
    .trim()
    .match(
      /^(\d{4})-(\d{2})-(\d{2})(?:[ T](\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?)?\s*(Z|[+-]\d{2}(?::?\d{2})?)?$/i,
    );
  if (!m) return null;
  const [, y, mo, d, h = '00', mi = '00', s = '00', zone] = m;
  let offsetMinutes = 0;
  if (zone && zone.toUpperCase() !== 'Z') {
    const sign = zone.startsWith('-') ? -1 : 1;
    const digits = zone.slice(1).replace(':', '');
    offsetMinutes =
      sign * (Number(digits.slice(0, 2)) * 60 + Number(digits.slice(2) || 0));
  }
  const utc =
    Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi), Number(s)) -
    offsetMinutes * 60_000;
  return Number.isNaN(utc) ? null : new Date(utc);
}

/** "2019/09" for a date, in UTC. */
export function yearMonth(date: Date): string {
  const year = date.getUTCFullYear();
  const month = String(date.getUTCMonth() + 1).padStart(2, '0');
  return `${year}/${month}`;
}

/** The file name without directories or extension. */
export function fileStem(filePath: string): string {
  const name = filePath.split('/').pop() ?? filePath;
  return name.replace(/\.(md|markdown)$/, '');
}

export interface LegacyPostInput {
  /** `slug:` from frontmatter, if any. */
  slug?: unknown;
  /** `date:` from frontmatter, if any. */
  date?: unknown;
  /** Path of the source file. */
  filePath: string;
}

/**
 * The path Gatsby gave a post: /YYYY/MM/slug/.
 *
 * The slug is `slug:` from frontmatter, or else the file name with every
 * YYYY-MM-DD- pattern removed. A post with no date was filed under the month
 * of the build, which is why `undatedMonth` has to be supplied for those.
 */
export function legacyPostPath(
  post: LegacyPostInput,
  undatedMonth?: string,
): string {
  const date = parseFrontmatterDate(post.date);
  const month = date ? yearMonth(date) : undatedMonth;
  if (!month) {
    throw new Error(`${post.filePath} has no date and no fallback month`);
  }
  const slug =
    typeof post.slug === 'string' && post.slug !== ''
      ? post.slug
      : fileStem(post.filePath).replace(/\d{4}-\d{2}-\d{2}-/g, '');
  return `/${month}/${slug}/`;
}

/** The path Gatsby gave a markdown page: its `path:`, with a trailing slash. */
export function legacyPagePath(path: string): string {
  const withSlash = path.endsWith('/') ? path : `${path}/`;
  return withSlash.startsWith('/') ? withSlash : `/${withSlash}`;
}
