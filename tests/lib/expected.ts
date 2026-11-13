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

/**
 * Posts whose title, date, tags or link differ from the live site because
 * their frontmatter was broken there and is now fixed. Matched by the end of
 * the URL.
 */
export const REPAIRED_POSTS: Record<string, string> = {
  '/games-i-was-addicted-to-in-2014/':
    'Four spaces before the opening "---" meant none of its frontmatter was read. It now has its title, date, tag, category and link.',
  '/fussy-coffee/': 'It had no date. It now has the date from its file name.',
  '/heymamma-2/':
    'Its title starts with "#", which YAML read as a comment, so the live title is "null". The title is now quoted.',
};

export const isRepaired = (url: string) =>
  Object.keys(REPAIRED_POSTS).some((ending) => url.endsWith(ending));

/**
 * Posts with `link: None` in frontmatter. The live site treats "None" as a
 * URL: it shows an "original article" link to .../None/ and says "Read
 * commentary" on the card. They are ordinary posts now.
 */
export const NOT_LINK_POSTS = [
  '/2014/05/reordering-nsfetchedresultscontroller/',
  '/2014/09/the-rise-and-fall-of-communication-mediums/',
];

/**
 * Posts with an empty tag. The live site shows an empty pill linking to
 * /tag//. Empty tags are now ignored.
 */
export const HAD_EMPTY_TAGS = [
  '/2016/07/opening-iterm2-tabs-at-specific-directories/',
  '/2017/01/adding-smartspeed-to-any-audio-file/',
];

/**
 * Cards whose summary differs from the live site, because the post's body
 * renders differently. In most of them the live site shows raw markdown
 * ("[Facebook Connect](http://...)", "**queue") that is now rendered; in the
 * rest a few characters of difference move the point where the summary is
 * cut.
 *
 * TODO(stage 5): go through these with the body comparison and keep only the
 * ones that are improvements.
 */
export const SUMMARY_DIFFERS = [
  '/2007/09/google-acquires-postini/',
  '/2007/10/google-overheard-in-office/',
  '/2008/09/digg-and-facebook-heading-to-future-of/',
  '/2008/09/i-just-won-50000000-gbp-from-google-uk/',
  '/2009/11/online-advertising-moving-to-your-car/',
  '/2011/04/new-digg-reverse-paywall-coming/',
  '/2013/10/why-android-first-is-a-myth-steve-cheney-technology-business-strategy/',
  '/2013/11/weather-notifications-on-lifehacker/',
  '/2014/03/avspeechsynthesizers-queue-doesnt-work/',
  '/2015/01/equality-in-the-apple-blogging-scene/',
];

/** The 404 page: the live site highlights "Posts" in the navigation there. */
export const NAV_HIGHLIGHT_DIFFERS = ['/404.html'];
