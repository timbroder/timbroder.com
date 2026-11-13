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
 * Cards whose summary is cut a word earlier or later than on the live site,
 * though the post reads the same. The two parsers put a space more or less
 * between two blocks, and a summary is cut by counting characters.
 *
 * A summary may also differ wherever the post's own text is meant to
 * differ: see NOW_RENDERED and REPAIRED_BODIES in expected-content.ts.
 */
export const SUMMARY_DIFFERS = [
  '/2007/09/google-acquires-postini/',
  '/2007/10/google-overheard-in-office/',
  '/2008/09/i-just-won-50000000-gbp-from-google-uk/',
];

/**
 * Posts on the live site that are written in Contentful.
 *
 * A build without the Contentful settings cannot have them, and that is
 * every build except Netlify's: a local one, and the one CI tests. So the
 * comparison with the live site leaves these posts out when the build does
 * not have them, and the smoke tests check them where they can exist, on
 * the deployed site.
 */
export const CONTENTFUL_ON_LIVE = ['/2026/11/gatsby-on-autopilot-time-to-replatform/'];

/**
 * Markdown pages whose description differs from the live site. A page's
 * description is a summary of its text, like a card's.
 */
export const PAGE_DESCRIPTION_DIFFERS: Record<string, string> = {
  '/apps/':
    'The page shows an app icon, written as a reference-style picture. The live summary skipped ' +
    'pictures written that way. The new one includes its alt text, as it does for every other ' +
    'picture that was hosted elsewhere.',
};

/** The 404 page: the live site highlights "Posts" in the navigation there. */
export const NAV_HIGHLIGHT_DIFFERS = ['/404.html'];
