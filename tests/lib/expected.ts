/**
 * Every place the new site is meant to differ from the live Gatsby site.
 *
 * The build tests compare the new build with the baseline and allow these
 * differences and nothing else. Each one has a reason. See "Live-site quirks
 * and what the new site does" in MIGRATION_PLAN.md.
 */

/** Baseline URLs that are deliberately gone, with no redirect. */
export const DROPPED_URLS: Record<string, string> = {
  '/tag//':
    'Two posts have an empty tag, which the live site turned into a page titled "Tag: null". Empty tags are now ignored.',
};

/**
 * Posts that have a page on the live site but are missing from every list
 * and from the feed, because they lack `layout:` or `date:`. They are now
 * listed like any other post. Matched by the end of the URL, because two of
 * them had no date and so no fixed URL.
 */
export const NEWLY_LISTED = [
  '/best-apps-for-new-dads/',
  '/fussy-coffee/',
  '/games-i-was-addicted-to-in-2014/',
];

export const isNewlyListed = (url: string) =>
  NEWLY_LISTED.some((ending) => url.endsWith(ending));

/** Pages that exist on the new site and not on the live one. */
export const ADDED_URL_PREFIXES: Record<string, string> = {
  '/astrobook/': 'The component library.',
};

/**
 * Links inside post bodies that are known to be broken for now.
 *
 * TODO(stage 5): remove. They are broken on the live site too:
 * - /images/...: 20 posts point at image files that are not served yet.
 * - /wp-...: uploads from the WordPress days.
 * - ....html and ....html/...: links to this site's posts, and to their
 *   image attachment pages, in the form the WordPress site used.
 * - one link that was cut off mid-URL when the post was imported.
 */
export const KNOWN_BROKEN_LINKS: RegExp[] = [
  /^\/images\//,
  /^\/wp-/,
  /\.html(\/.*)?$/,
  /^\/2011\/01\/getting-it-onto-the-$/,
];

/**
 * Lists that now show more posts than on the live site.
 *
 * The live site counted a term's posts across every spelling ("jira" and
 * "Jira") but only showed the posts using the oldest spelling. The new site
 * shows them all.
 */
export const MERGED_SPELLINGS: Record<string, string> = {
  '/category/productivity/': '"productivity" and "Productivity"',
  '/tag/jira/': '"jira" and "Jira"',
};

/**
 * Posts published on the same day can swap places.
 *
 * The live site sorted dates as text, so on a shared day a post dated
 * "2017-01-15 09:18:00+00:00" came before one dated "2017-01-15 13:44". The
 * new site sorts by the actual time. The list tests therefore compare order
 * day by day, not post by post.
 */
export const SAME_DAY_ORDER_MAY_DIFFER = true;
