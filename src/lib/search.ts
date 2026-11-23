/**
 * The wording and the small decisions of the search page.
 *
 * The page's script runs in the browser, so nothing here may import code
 * that only runs during the build.
 */
import { formatDate } from './site.ts';

/** How many results are shown at first, and how many "Show more" adds. */
export const RESULTS_PER_PAGE = 10;

/** The search a page address asks for: "?q=small+wins" is "small wins". */
export function queryFrom(search: string): string {
  return (new URLSearchParams(search).get('q') ?? '').trim();
}

/** The address of a search, for the address bar. An empty search is the page itself. */
export function addressOf(query: string, path = '/search/'): string {
  return query === '' ? path : `${path}?${new URLSearchParams({ q: query })}`;
}

/** "12 posts match “redirects”." */
export function countLine(count: number, query: string): string {
  if (count === 0) return `No posts match “${query}”.`;
  return `${count} ${count === 1 ? 'post matches' : 'posts match'} “${query}”.`;
}

/** What the button under the results says, or null when every result is shown. */
export function moreLabel(shown: number, total: number): string | null {
  const left = total - shown;
  return left > 0 ? `Show ${Math.min(left, RESULTS_PER_PAGE)} more` : null;
}

/**
 * The line beside a result, as a post card has it: "November 11, 2026 in
 * Code". The space before "in" does not break, so the category never starts
 * a line of its own.
 */
export function resultWhen(isoDate: string | undefined, category?: string): string {
  const date = new Date(`${isoDate}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) return '';
  return `${formatDate(date)}${category ? `\u00a0in ${category}` : ''}`;
}

const plain = (text: string) => text.replace(/\s+/g, ' ').trim().replace(/[.…]+$/, '');

/**
 * True when the passage the index found is only the post's title again.
 * That is the case for a post with no words of its own: its title is all
 * the index has to read, and the result already shows it.
 */
export function isOnlyTheTitle(passage: string, title: string): boolean {
  return plain(passage) === plain(title);
}
