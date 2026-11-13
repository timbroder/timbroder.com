/**
 * Dates and file names, read the way the site's addresses need them.
 *
 * A post lives at /YYYY/MM/slug/. These are the small rules behind the
 * YYYY/MM part and behind a slug taken from a file name. The file is named
 * for where the rules came from: the Gatsby site this one replaced, whose
 * addresses it keeps.
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
