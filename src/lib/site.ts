/** The search page. The header shows it as an icon, the footer as a word. */
const SEARCH = { title: 'Search', href: '/search/' } as const;

/** Site-wide facts, in one place. */
export const SITE = {
  title: 'Tim Broder .com',
  description: 'Tim Broder is a creative technologist',
  url: 'https://timbroder.com',
  author: 'Tim Broder',
  since: 2007,
  feedTitle: 'TimBroder.com RSS Feed',
  /** A copy of the feed that older subscribers still use. */
  feedburner: 'https://feeds.feedburner.com/timbroder',
  /** Linked with rel="me" so Mastodon shows the site as verified. */
  mastodon: 'https://masto.ai/@timothybroder',
  nav: [
    { title: 'Posts', href: '/' },
    { title: 'Podcasts', href: '/podcasts/' },
    { title: 'Projects', href: '/projects/' },
    { title: 'Talks', href: '/talks/' },
    { title: 'About', href: '/about/' },
  ],
  search: SEARCH,
  /**
   * Shown in the footer after the navigation. The archive and the tag index
   * put every post and every tag page two clicks from any page of the site.
   */
  footerNav: [
    { title: 'Archive', href: '/archive/' },
    { title: 'Tags', href: '/tag/' },
    SEARCH,
  ],
} as const;

/** "November 11, 2026", in UTC so it does not depend on where the build runs. */
const DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  year: 'numeric',
  month: 'long',
  day: '2-digit',
  timeZone: 'UTC',
});

export function formatDate(date: Date): string {
  return DATE_FORMAT.format(date);
}

/** "Nov 11", in UTC, for lists where the year is given once above. */
const SHORT_DATE_FORMAT = new Intl.DateTimeFormat('en-US', {
  month: 'short',
  day: 'numeric',
  timeZone: 'UTC',
});

export function shortDate(date: Date): string {
  return SHORT_DATE_FORMAT.format(date);
}

/** "2026-11-11", in UTC. */
export function isoDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

/**
 * Which navigation item is highlighted on a page.
 *
 * "Posts" is highlighted on the home page and on every post (any path that
 * starts with a year), but not on paged lists, tags or categories. The
 * search icon is highlighted on the search page.
 */
export function activeNavHref(pathname: string): string | null {
  for (const item of [...SITE.nav, SITE.search]) {
    if (pathname === item.href) return item.href;
  }
  return /^\/\d{4}\//.test(pathname) ? '/' : null;
}
