# Checking in on Google Search Console

In November 2026 Google had about a third of this site indexed. [#145](https://github.com/timbroder/timbroder.com/pull/145) fixed what was broken and gave every post more ways to be found: an archive, a tag index, links between neighbouring posts, and a description of its own on every list page.

Google takes weeks to react. The first check-in worth doing is about a month after #145 was merged, and then every few months.

## What to export

Everything comes from [Search Console](https://search.google.com/search-console). Each export is a zip. Keep them: the next check-in compares against them.

1. **Indexing → Pages → Export.** The summary, with one count per reason.
2. **On the same page, "View data about indexed pages" → Export.** The indexed addresses.
3. **On the same page, each row under "Why pages aren't indexed" → Export.** One list per reason. Skip a reason whose count is 0.
4. **Performance → Search results, last 3 months → Export.**
5. **Links → External links → Top linked pages → Export.**

Also open **Manual actions** and **Security issues**. Both should say that no issues were detected.

## The baseline: 17 November 2026

The data behind it ends on 12 November 2026, the day before this site replaced the Gatsby site.

Addresses, as Search Console counts them:

| | Addresses |
|---|---|
| Indexed | 269 |
| Crawled - currently not indexed | 384 |
| Discovered - currently not indexed | 261 |
| Page with redirect | 113 |
| Duplicate, Google chose different canonical than user | 13 |
| Not found (404) | 11 |
| Duplicate without user-selected canonical | 4 |
| Alternate page with proper canonical tag | 2 |

Pages, once every address is matched to the page it belongs to:

| Kind of page | Indexed | Crawled, declined | Never crawled | Too new to tell |
|---|---|---|---|---|
| Posts (519) | 196 | 223 | 98 | 2 |
| Tag pages (189) | 18 | 63 | 100 | 8 |
| Category pages and paged lists (54) | 0 | 19 | 35 | 0 |
| Other pages (7) | 5 | 1 | 1 | 0 |

Eight posts had been shown in search since May 2026 and had since dropped out of the index:

- `/2014/08/restore-time-machine-backup-synology-nas/`
- `/2015/12/install-hashicorp-through-homebrew-cask/`
- `/2008/11/set-change-reset-mysql-root-password-on/`
- `/2012/09/ios-multiple-lines-of-text-in-a-uitableviewcell/`
- `/2012/08/hiding-fields-in-the-admin-based-on-permission/`
- `/2012/04/sync-side-loaded-content-between-your-kindle-and-other-devices/`
- `/2014/06/opening-sourcetree-from-the-command-line/`
- `/2007/07/howto-post-code/`

## Check-ins so far

Each check-in adds a row.

| Date | Pages indexed | Posts indexed | Tag pages indexed | Addresses indexed | Search clicks a month |
|---|---|---|---|---|---|
| 2026-11-17 | 219 | 196 of 519 | 18 of 189 | 269 | About 5 |

## How to read the numbers

- **Count pages, not addresses.** Google held several addresses for one post: with and without the trailing slash, and old slugs. The 269 indexed addresses were 219 pages, and 97 of them were forms that redirect. As Google drops those, "Indexed" can fall towards 219 with nothing having got worse.
- **A page is indexed if any form of its address is.** The forms are: with or without the trailing slash, with `www`, ending in `.html`, and any old slug in the post's `redirect_from`.
- **Some numbers should rise.** "Page with redirect" grows as Google rechecks old addresses. "Duplicate, Google chose different canonical than user" rises and then falls, while Google follows the redirects of the 85 posts that were given new slugs.
- **"Not found (404)" should fall to two or three.** A new address there is worth a look.
- **What a page says did not decide whether it was indexed.** Indexed, declined and never-crawled posts were alike in length, in how much of them was quoted, in year and in tags. So #145 changed the site's structure, and a check-in is the test of whether that worked.
- **Judge search traffic by clicks.** 70% of impressions were the home page, deep in the results, and most did not look like people. They fell by 95% between May and October 2026 while clicks stayed the same.

## The prompt

Give Claude this, with the paths of the exports filled in:

```
Check in on how Google is indexing timbroder.com.

Start with SEARCH_CONSOLE_CHECK_IN.md. It has
the baseline, the check-ins so far, what was changed and how to read the numbers.
The point of a check-in is to find out whether those changes worked, so I want an
honest comparison more than good news.

Today's exports from Search Console are below. Each is a zip of CSV files, and each
names its own report inside.

- Page indexing summary: <path>
- Indexed pages: <path>
- One list per "not indexed" reason: <paths>
- Performance on Search, last 3 months: <path>
- Top linked pages, external: <path>
- The exports from the last check-in, if I kept them: <paths>

Build the site first (npm run build), so that you know every page it has
(dist/sitemap-0.xml) and every old address that redirects (dist/_redirects).

Then tell me:

1. How many pages are indexed now, against the last check-in. Match every address to
   the page it belongs to before counting. Split the answer the way the baseline
   table does: posts, tag pages, category pages and paged lists, other pages.
2. What moved in each "not indexed" reason, and whether that file says to expect
   that move. Open anything new under "Not found (404)" on the live site.
3. Whether the eight posts named in that file are indexed again.
4. Search clicks a month, and which pages earned them.
5. Which pages were gained and which were lost, if I gave you the last exports.
6. Anything the numbers show that the file did not expect.

Say which findings you checked and which are your reading of the data. If you think
the site should change, say what and why, and wait for my answer before changing it.
When we are done, add a row to "Check-ins so far" in that file.
```
