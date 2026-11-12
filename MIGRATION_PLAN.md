# Gatsby to Astro migration plan

This plan replaces the earlier ones in #96, #97, #98, #118 and #120. It starts fresh: nothing is carried over from the earlier Astro attempt.

The site moves from Gatsby 5 to Astro 7 and keeps its look. Every stage adds automated tests, and the live Gatsby site is the reference those tests compare against.

Work lands as small PRs into the `astro` branch. `main` keeps serving Gatsby until one final cutover PR.

## Contents

1. [What the live site does today](#1-what-the-live-site-does-today)
2. [Decisions](#2-decisions)
3. [What the old plans got wrong](#3-what-the-old-plans-got-wrong)
4. [Technical decisions](#4-technical-decisions)
5. [Requirements and how each is tested](#5-requirements-and-how-each-is-tested)
6. [Test layers and CI](#6-test-layers-and-ci)
7. [Astrobook](#7-astrobook)
8. [Stages](#8-stages)
9. [Cutover and rollback](#9-cutover-and-rollback)
10. [Things to prove early](#10-things-to-prove-early)
11. [What I need from Tim](#11-what-i-need-from-tim)
12. [Out of scope](#12-out-of-scope)

## 1. What the live site does today

Checked against timbroder.com and this repo on 2026-11-12.

A new post went live later that day. The figures below are from the first check; the baseline committed in `tests/baseline/` (771 URLs, 519 posts) is the source of truth for counts.

### URLs

The live sitemap lists 768 URLs.

| Kind | Count | Pattern |
|---|---|---|
| Posts | 518 | `/YYYY/MM/slug/` |
| Home and its pages | 26 | `/`, `/page/2/` to `/page/26/` |
| Tags | 190 | `/tag/x/`, plus 2 paged (`/tag/x/page/2/`) |
| Categories | 27 | `/category/x/`, plus 17 paged |
| Markdown pages | 5 | `/apps/`, `/podcasts/`, `/podcasts-i-listen-to/`, `/projects/`, `/talks/` |
| About | 1 | `/about/` |
| Gatsby starter leftover | 1 | `/using-typescript/` |

- Netlify redirects a path without a trailing slash to the same path with one, and an uppercase path to its lowercase form.
- 394 post URLs come from `slug:` in frontmatter. The other 124 come from the filename.
- 83 post URLs are untidy: 57 contain punctuation, capitals or curly quotes, 25 contain triple hyphens, and 1 contains an underscore.
- Two posts have no `date:`, so Gatsby files them under the month of the latest build. Today they are at `/2026/11/fussy-coffee/` and `/2026/11/games-i-was-addicted-to-in-2014/`, and they move every month.
- Year and month in a post URL match UTC. Recomputing all 518 URLs from the files with UTC dates reproduces the live sitemap exactly.

### Content

- There are 519 post files (492 `.markdown`, 27 `.md`). One is a draft.
- Three more post files have no extension, so Gatsby has never published them.
- Contentful is wired in but supplies none of the 518 live posts.
- `link:` appears in 492 posts, but 334 are empty strings and 2 are the literal text `None`. About 155 are real link posts.
- Tag and category URLs use lodash `kebabCase`, which splits on capitals and digits: `/tag/core-data/`, `/tag/twitter-2-g-talk/`, `/tag/gpowered-net/`.
- About 20 posts contain raw HTML (`<div>`, `<script>`, `<object>`, `<iframe>`, `<table>`), and 8 contain leftover Liquid tags (`{% ... %}`).
- Code fences use inconsistent language names (`PHP`, `HTML`, `XML`, `C`) and a few typos (`swiftlet`, `bashalias`).
- 32 links in post bodies point at other posts on this site.

### Custom features

These are the behaviours built on top of the Gatsby starter. All of them carry over.

- **Link posts.** A post with a real `link:` shows "Check out the original article." above its body, linking to that URL in a new tab. Its card on list pages says "Read commentary"; other cards say "Read article". The card links to the post on this site, not to the external article.
- **Post cards.** Title, date, "in {category}", description and the call to action above.
- **Post pages.** Date, headline and body, then tag pills that link to tag pages and a "Category: X" link.
- **Headlines.** The home page shows the site title. Tag pages show "Tag: X" and category pages show "Category: X". Paged lists add "- Page N" to the page title.
- **Navigation.** Five items, in the header and the footer. "Posts" is highlighted on the home page and on every post, but not on paged lists, tag pages or category pages.
- **Footer.** "© 2007 - {current year} Tim Broder. All rights reserved."
- **Head links.** Every page advertises the RSS feed at `/feed`. The home page and its paged lists also carry the Mastodon verification link (`rel="me"`) and the Feedburner link. All paged lists carry `rel="prev"` and `rel="next"` links between pages.
- **About page.** Its own title and description, the tilted avatar and nine social links that open in a new tab.
- **404 page.** "404: Not Found", with the "the sadness" line.
- **AI attribution.** Two posts carry `ai_assisted: true` in frontmatter. No template reads it; the attribution line is in the post body.
- **`podcasts.py`.** A standalone script that turns an Overcast export into a markdown list. It is not part of the build.

Previous/next links between posts are not on the live site. The post template computes them and never renders them.

### Images

- 20 posts reference 45 images at `/images/...`. Those URLs return 404 on the live site, though nearly all the files are in the repo under `content/blog/images/`.
- 90 posts embed 198 distinct images from other hosts, mostly Flickr, Blogspot and old Google photo URLs.
- `content/blog/images/` already holds 287 files in 92 folders named after posts. They look like earlier downloads of those remote images that were never wired into the markdown.

### Feed, SEO and scripts

- The feed is at `/feed`. It has 515 items with full post content, is about 2 MB, and is served as `text/plain`.
- Feedburner (`feeds.feedburner.com/timbroder`) mirrors `/feed` and is current.
- Feed item links and guids have no trailing slash, for example `https://timbroder.com/2026/11/kobo-audiobook-sync`.
- The config redirects `/feed` to `/atom_feedburner.xml`, which returns 404. The redirect has no effect.
- Descriptions come from `description:` in frontmatter, or the first 512 characters of the post.
- Dates display as `MMMM DD, YYYY`.
- Google Analytics (GA4, `G-L8N53HMK1R`) is present on live pages.
- The current components have no client-side interactivity.

## 2. Decisions

Made with Tim on 2026-11-12.

| Topic | Decision |
|---|---|
| Framework | Astro 7, static output, hosted on Netlify |
| Contentful | Keep it and make it work. Markdown wins when both sources produce the same URL. |
| Contentful tests | Saved sample responses in the repo. One manual check against the real space before cutover. |
| Post URLs | Clean up all untidy slugs with one rule: lowercase letters, digits and single hyphens. Each old URL gets a 301 to the new one. |
| Feed | Stays at `/feed`, with full content of every post |
| Design | Match the live site. Code blocks move to Astro's built-in highlighter and are reviewed by eye. |
| Component library | Astrobook, built into the site and public at `/astrobook/` |
| CI | GitHub Actions runs the full suite when code changes. Changes that only touch content skip it. |
| Rollout | Staged PRs into the `astro` branch, then one cutover PR to `main` |
| Local images | Fix the 20 posts whose images 404 |
| Remote images | Download each one into the repo and point the post at the local copy. If it is gone, use a funny "missing image" placeholder. |
| Google Analytics | Keep |
| Previous/next links on posts | Not added. The live site never shows them, so nothing visible changes; the unused code goes away with Gatsby. |
| Three never-published posts | Leave unpublished |
| Docker files | Drop |

### Defaults I am assuming

Say so if any of these is wrong.

- The slug rule also changes `/2007/10/new-blog-address_23/` (underscore), making 83 posts rather than the 82 we discussed.
- The two undated posts are pinned to the dates in their filenames: `/2015/07/fussy-coffee/` and `/2015/03/games-i-was-addicted-to-in-2014/`.
- `/using-typescript/` is removed and redirects to `/`.
- The two posts with `link: None` stop showing a broken "original article" link.
- The web app manifest stays, with the name fixed to "Tim Broder .com" and the avatar as its icon. Today it says "Gatsby Starter Blog".
- Before using the placeholder for a dead remote image, I try the Internet Archive's copy.
- Legacy frontmatter fields (`wordpress_id`, `dsq_thread_id`, `author`, `comments`) stay in the old posts untouched.
- Lists are split into real pages of 20 posts. On the live site every page of a list shows the whole list (see below).
- The two posts with an empty title get one. `heymamma-2` gets the title already in its frontmatter, quoted so YAML reads it. `games-i-was-addicted-to-in-2014` gets "Games I Was Addicted To in 2014".
- Tags, categories, link posts and the five markdown pages all stay.
- The About page stays a hand-built page.

### Live-site quirks and what the new site does

The baseline capture in stage 1 found these. Each one becomes an expected difference in the tests.

| On the live site | On the new site |
|---|---|
| Every page of a list shows the whole list: `/page/2/` has the same 516 cards as `/`. Tag and category pages do the same. | Each page shows its own 20 posts. The page URLs and page counts stay the same. |
| Three posts are missing from every list and from the feed, though their pages exist. They lack `layout:` or `date:`. | They appear in lists and in the feed like any other post. |
| Two posts have an empty title; one page title reads "null". | Both get a title. |
| `/tag//` exists, titled "Tag: null", because two posts have an empty tag. | Empty tags are ignored and the page is gone. |
| `/tag/apps/` has no cards, because its only post is one of the three unlisted ones. | It shows that post. |
| The 404 page highlights "Posts" in the navigation. | Nothing is highlighted. |
| Some card descriptions show raw markdown where a post starts with an image. | Descriptions are plain text. |

## 3. What the old plans got wrong

- **#96 and #97** are questionnaires. They record no decisions.
- **#98** plans a Gatsby dependency upgrade, which the migration makes unnecessary.
- **#118** is a useful feature audit, but it was never checked against the live site:
  - It counts "about 25" markdown posts. There are 519.
  - It treats Contentful as an active source. Contentful supplies no live posts.
  - It has no URL inventory, so nothing could prove that URLs survived.
  - It misses the two posts whose URLs move every month.
  - It misses the 20 posts with broken images.
  - It does not record how tag URLs are built. A simpler slug function would have changed `/tag/core-data/` to `/tag/coredata/`.
  - It does not record that the feed carries full content, or that item guids must stay stable.
  - Its testing is manual spot checks.
  - It has no component library.

## 4. Technical decisions

Each one has a reason. Where a choice depends on something I have not run yet, section 10 lists it.

### Platform

1. **Astro 7 with static output and no adapter.** Nothing on the site needs a server. Astro 7 needs Node 22.23.4 or later, so `.nvmrc` moves up from 22.10.0.
2. **`trailingSlash: 'always'`.** This matches today's URLs.
3. **Components are plain `.astro` files with no client framework.** The current components have no interactivity, so pages ship no JavaScript apart from Google Analytics and structured data.
4. **Tailwind 4, loading the existing `tailwind.config.js` through `@config`.** This keeps the font scale and the typography settings as they are. The visual tests catch any change in Tailwind's defaults.

### Content model

5. **Content stays in `content/blog/` and `content/pages/`.** Astro's loader can read from there, though only `.md` files, so the `.markdown` files were renamed. This keeps history intact, lets new posts on `main` merge cleanly into `astro`, and makes "content only" easy to define for CI.
6. **One `Post` shape with two loaders behind it.** A markdown loader and a Contentful loader both produce `Post`. Pages, feeds and tests only see `Post`, so nothing downstream knows where a post came from.
7. **A strict schema for posts.** A post needs a title, a date and a clean slug. `link` is a valid URL or absent; empty strings and `None` become absent. Tags default to an empty list. `ai_assisted`, `ai_model` and the legacy fields are accepted and passed through.
8. **Descriptions follow today's rule:** `description:` from frontmatter, else the first 512 characters of text.

### URLs and redirects

9. **URL rules are small pure functions, using UTC.** That makes them easy to test against all 518 live URLs.
10. **Clean slugs live in frontmatter.** Each re-slugged post gets `slug: new-slug` and `redirect_from: [old URL]`. New posts must have a clean slug, so untidy URLs cannot come back.
11. **Slug cleanup goes through a review file.** A script writes `slug-cleanup.csv` with each old URL and proposed new slug. Tim edits it, and a second script applies it to the frontmatter.
12. **Redirects are a generated Netlify `_redirects` file.** The build collects every `redirect_from` plus a short fixed list, and writes each old URL in the forms Netlify needs (see section 10). Astro's own `redirects` setting is not used, because without an adapter it writes HTML refresh pages, not real 301s.
13. **The two formerly undated posts get a wildcard redirect.** `/:year/:month/fussy-coffee/` goes to `/2015/07/fussy-coffee/`, which covers every month they have lived at.
14. **Tag and category slugs use lodash `kebabCase` itself.** Reimplementing it would change URLs.
15. **Paged list URLs are built by hand as `/page/N/`.** Astro's `paginate()` would produce `/N/`.
16. **Links between posts are rewritten to the new URLs** when a target is re-slugged.

### Rendering

17. **The markdown processor is Sätteri, Astro 7's default.** Stage 2 ran it and the older remark pipeline over every post and compared the output to the live site. They tied, so the default stays. Smart punctuation is off, because the Gatsby site did not convert quotes or dashes.
18. **Code highlighting uses Shiki with the `monokai` theme and CSS line numbers.** This is the closest match to today's Prism Okaidia. Fence language names are fixed in the content.
19. **Images are served from stable URLs under `/images/`, not through Astro's image pipeline.** The feed carries full post HTML and needs image URLs that never change, and 20 posts already use this form. The cost is no automatic resizing; images are compressed once when they are added.
20. **Image files move to `public/images/`.** Downloaded remote images go in `public/images/remote/`. A file, `content/image-sources.json`, records each original URL, its local path and whether it came from the original host, the Internet Archive or the placeholder.

### Feed and SEO

21. **The feed is an endpoint at `/feed`**, with a Netlify header so it is served as RSS and not plain text.
22. **Feed guids never change.** A re-slugged post keeps its old URL as its guid and gets the new URL as its link. Otherwise every feed reader would show 83 old posts as new.
23. **The feed includes every published post.** That is 518, up from 515; the live feed drops posts that lack `layout:`.
24. **Sitemap file names stay `sitemap-index.xml` and `sitemap-0.xml`**, so `robots.txt` needs no change. `/astrobook/` and the 404 page are excluded.

### Contentful

25. **The loader reads saved samples when `CONTENTFUL_FIXTURES` is set**, and the real API otherwise.
26. **A production build fails if the Contentful credentials are missing.** A silent fallback would quietly drop posts.
27. **Rich text renders to HTML with the same code highlighter as markdown.** Images embedded in Contentful posts stay on Contentful's CDN; this is the one allowed exception to "no remote images".

### Build-time checks

28. **Every build validates content,** including Netlify builds triggered by a new post or by Contentful. The build fails on a bad schema, two posts with the same URL, a redirect whose target does not exist, or a local image reference with no file. Netlify then keeps the previous deploy live.

## 5. Requirements and how each is tested

"Baseline" means data captured from the live Gatsby site in stage 1. The layers are explained in section 6.

| # | Requirement | Test | Layer |
|---|---|---|---|
| R1 | Every live URL still works | Each baseline URL is either a built page or a redirect whose target is a built page. The one exception is `/tag//`. | Build output |
| R2 | Old URLs redirect | Every redirect returns 301 to the right place, tried both raw and percent-encoded: the 83 re-slugged posts, the two pinned posts and `/using-typescript/` | Deploy preview |
| R3 | No redirect chains or loops | Every redirect target is a real page, never another redirect | Build output |
| R4 | Tag and category URLs unchanged | Every baseline tag and category URL exists, apart from `/tag//`; unit tests cover `kebabCase` edge cases | Unit, build output |
| R5 | Lists show the same posts in the same order | For every list, its pages joined together equal the baseline's order for that list, and no page has more than 20 posts | Build output |
| R6 | Post content renders the same | For all 518 posts: body text, headings, link targets, and counts of images, code blocks and embeds equal the baseline | Build output |
| R7 | Pages look the same | Screenshots of each page type at desktop and phone width match live screenshots, with code blocks masked. List pages are compared from the top down to the first few cards, since the live ones are far longer. Page types: home, paged list, post, link post, post with an image, post with an embedded video, tag, category, About, markdown page, 404. | Browser |
| R8 | Code blocks look right | Astrobook stories for each language; reviewed by eye, then locked with screenshots | Browser |
| R9 | Feed is unchanged for subscribers | Valid RSS; one item per post; every baseline guid still present; full content in every item; no relative URLs | Build output |
| R10 | Feed is reachable | `/feed` and `/feed/` return 200 with an RSS content type | Deploy preview |
| R11 | SEO tags and head links unchanged | Title, description, canonical, Open Graph, Twitter, structured data, RSS links, the Mastodon `rel="me"` link and `rel="prev"`/`rel="next"` equal the baseline on every page | Build output |
| R12 | Sitemap is right | Its URLs equal the built pages, minus the 404 page and `/astrobook/` | Build output |
| R13 | Local images load | Every local image reference in the built HTML points at a file in the build | Build output, build check |
| R14 | No remote images remain | No `<img>` points at another host, except Contentful's CDN | Build output |
| R15 | Dead images use the placeholder | Placeholder count equals the "gone" count in `image-sources.json` | Build output |
| R16 | Internal links work | Every internal link resolves to a page, a file or a redirect | Build output |
| R17 | Contentful posts work | Sample responses produce pages, list entries, feed items and tags; a link post behaves like a markdown one; a post's own share image is used; a draft is hidden; markdown wins a URL clash | Unit, build output |
| R18 | Contentful works for real | A test post published in the real space shows up on a deploy preview | Manual |
| R19 | Google Analytics is on every page | The GA tag appears exactly once on every page outside `/astrobook/` | Build output |
| R20 | No other JavaScript ships | Pages outside `/astrobook/` contain no scripts beyond GA and structured data | Build output |
| R21 | Astrobook is public but not indexed | `/astrobook/` builds, has a `noindex` tag, and is absent from the sitemap | Build output |
| R22 | Every component state has a story that renders | Each story loads without error, matches its screenshot and passes accessibility checks | Browser |
| R23 | Unpublished things stay unpublished | No page, list entry or feed item for the draft or the three unpublished files; no page at `/using-typescript/` | Build output |
| R24 | Bad content cannot deploy | Unit tests feed the build checks a post with no date, a duplicate URL, an untidy slug and a missing image | Unit |
| R25 | Pages are accessible | No serious accessibility violations on each page type | Browser |
| R26 | Netlify behaviour is unchanged | Missing trailing slash redirects; unknown URL returns 404 with the custom page | Deploy preview |
| R27 | Link posts work as today | For every post: the "original article" link is present with the right URL exactly when the baseline has one, and its card says "Read commentary" or "Read article" as in the baseline | Build output |
| R28 | List pages carry the same details | On every list page: the headline, and each card's date, category, description and link, equal the baseline | Build output |
| R29 | Navigation and footer unchanged | On every page: the nav items, which one is highlighted, the footer links and the copyright line equal the baseline | Build output |
| R30 | Post details unchanged | On every post: the date, tag pills, tag links and category link equal the baseline | Build output |

### Differences from the baseline that are expected

Tests R6 and R11 allow these, and nothing else. They live in one file with a reason for each.

- Canonical URLs and links for the 83 re-slugged posts and the 2 pinned posts.
- Image sources, which become local.
- Code block markup.
- The broken "original article" link on the two `link: None` posts.
- Everything in "Live-site quirks and what the new site does" in section 2, which includes three extra feed items.

## 6. Test layers and CI

### Layers

1. **Build checks.** Run inside every build, on Netlify too. Described in decision 28.
2. **Unit tests (Vitest).** Pure functions: URL rules, slug cleaning, taxonomy slugs, link handling, dates, Contentful normalisation and merging, rich text rendering, feed guids, descriptions.
3. **Build output tests (Vitest).** Build the site with Contentful samples, then read `dist/` and compare it to the baseline. Most requirements are tested here because it is fast and covers every page, not a sample.
4. **Browser tests (Playwright).** Run against a local preview of the build: screenshots, Astrobook stories, navigation, pagination, accessibility.
5. **Deploy preview smoke tests.** Run against the Netlify deploy preview, the only place where redirects, headers and 404 handling are real. The same suite runs against production right after cutover.

### Baseline

Stage 1 captures the baseline from the live site with a script that can be rerun while Gatsby is still live:

- `urls.txt`: the 768 sitemap URLs.
- `pages.json`: for every page and the 404 page, its title, meta tags, head links, structured data, heading, highlighted nav item, footer text, body text, links, image sources and counts of code blocks and embeds. For posts it also records the date, tags, category and "original article" link.
- `lists.json`: for every list page, its headline and each card's title, date, category, description, link and call to action, in order.
- `feed.json`: every feed item's guid, link and title.

Screenshots of each page type at 1280 and 390 pixels wide are captured in stage 4, alongside the visual tests that use them.

The crawl is throttled and retries, because the live site occasionally returns a transient Netlify error.

### CI workflow

- **Trigger:** every pull request, and every push to `main` and `astro`.
- **`changes` job:** decides whether the change is content only. Content means files under `content/` and `public/images/`.
- **`test` job:** runs when code changed. Installs, runs unit tests, builds, runs build output tests, runs browser tests.
- **`gate` job:** always runs and passes when `test` passed or was skipped. This is the one check to mark as required, so a content-only PR goes green in seconds and never hangs.
- **`smoke` job:** waits for the Netlify deploy preview to serve the commit under test, then runs the smoke tests against it. Each page carries the commit hash in a meta tag so the job knows the right build is live.

### Screenshots

- Screenshots are taken in one pinned Playwright container in CI, never on a laptop. Fonts render differently on macOS and Linux, which would make every comparison fail.
- A manually started workflow updates the stored screenshots and commits them, so a deliberate visual change is one click.
- Until cutover, page screenshots are compared to the live site. After cutover they are compared to the new site's own stored screenshots.

## 7. Astrobook

Astrobook is a component playground for Astro. It renders `.astro` components directly, which Storybook cannot do without an experimental add-on.

### Setup

- Added as an Astro integration, mounted at `/astrobook/`, reading stories from `src/components/`.
- It loads the site's global stylesheet, so components look the same as on the site.
- A custom head component adds `noindex`. Google Analytics is not loaded there.
- An environment switch, `ASTROBOOK=off`, leaves it out of a build. This is a safety valve if it ever blocks a production deploy.

### What gets a story

Each story file sits next to its component, as `PostCard.stories.ts` beside `PostCard.astro`. Every component gets one story per meaningful state.

| Component | States |
|---|---|
| PostCard | Article; link post ("Read commentary"); no category; no description; very long title |
| Pagination | First page; middle page; last page; single page |
| Header | Each navigation item active |
| Footer | Default |
| Headline | Short; long |
| Prose | Headings, lists, quote, table, inline code, image, embedded video |
| CodeBlock | One per language in use; long lines; line numbers |
| LinkPostBanner | "Original article" link |
| PostMeta | Tags and category; tags only; neither |
| SocialLinks | All nine icons |
| MissingImage | The placeholder, with and without a caption |
| RichText | A Contentful sample with an image and a code block |

### How stories are used

- **Stories and tests share sample data.** One file of sample posts feeds both, so a story cannot show a state the tests do not know about.
- **Every story is tested.** Playwright opens each story, checks that it renders, compares a screenshot and runs accessibility checks. A story that breaks fails CI.
- **Code blocks are reviewed there.** They are the one area exempt from matching the live site, so the CodeBlock stories are where Tim approves how they look.
- **Components that take slotted content** get a small wrapper component for the story, since story arguments only carry props.

### Risks

- Astrobook is version 0.13 with one maintainer. Its latest release (August 2026) came after Astro 7 and declares support for Astro 5 and later, but I have not run it on Astro 7 yet. Stage 2 proves it.
- If it stops working, stories are plain objects, so the fallback is a small hand-written page that renders them. The stories and their tests would not change.

## 8. Stages

Each stage is one PR into `astro` unless it grows too large to review. A stage is done when its tests pass in CI.

Tim merges each PR. Until a stage is merged, the next stage's branch is stacked on top of it.

### Stage 0: Plan

This document.

### Stage 1: Baseline and test harness

Done in #133.

- **Work:**
  - Write the baseline capture script and commit its output.
  - Set up Vitest.
  - Add the CI workflow with the `changes`, `test` and `gate` jobs.
- **Tests added:** unit tests for the page extractor and the change classifier, and self-checks on the baseline.
- **Done when:** CI is green on a code PR and skips on a content-only PR. Both were confirmed, the second with a throwaway PR (#134).

### Stage 2: Astro skeleton and proofs

Done in #135.

- **Work:**
  - Replace Gatsby with a bare Astro 7 project on the branch.
  - Remove Gatsby files, the Docker files and unused dependencies. `podcasts.py` and `CLAUDE.md` stay as they are.
  - Update the README's setup and commands for Astro. Its Contentful and AI-assisted writing sections stay.
  - Point Netlify's build at `dist/`.
  - Open a draft, preview-only PR into `main` (#136) so the branch gets a deploy preview. Netlify only builds previews for PRs into `main`.
  - Work through every item in section 10 and record each answer in this file.
- **Tests added:** the smoke job, against a placeholder page.
- **Done when:** the deploy preview builds, and every item in section 10 has an answer.

### Stage 3: Content and URLs

- **Work:**
  - Content collections, the schema and the `Post` model.
  - URL rules.
  - Slug cleanup through the review file.
  - Pin the two undated posts.
  - Routes for posts, markdown pages, list pages, tags and categories, with plain markup.
  - The `_redirects` generator and the sitemap.
  - Build checks.
- **Tests added:** R1 to R5, R12, R16, R23, R24.
- **Done when:** all 768 baseline URLs are accounted for and the redirects work on the deploy preview.

### Stage 4: Components, design and Astrobook

- **Work:**
  - Tailwind.
  - Playwright, and screenshots of the live site taken in the pinned container.
  - The layout and every component, each with stories.
  - Styled pages, including About and the 404 page.
  - Code highlighting.
- **Tests added:** R7, R8, R20, R21, R22, R25, R27 to R30.
- **Done when:** page screenshots match the live site, and Tim has approved the code block stories.

### Stage 5: Content fidelity and images

- **Work:**
  - Run the content comparison across all 518 posts and fix what differs.
  - Fix code fence languages.
  - Move images to `public/images/` and fix the 20 posts.
  - Localise the remote images, reusing the 287 files already in the repo before downloading.
  - Draw the placeholder image.
  - Rewrite links between posts.
- **Tests added:** R6, R13, R14, R15.
- **Done when:** every remaining difference from the baseline is on the expected list with a reason.

### Stage 6: Contentful

- **Work:**
  - The Contentful loader.
  - Rich text rendering.
  - Merging with markdown.
  - Sample responses: a normal post, a link post, a draft, a post with an image and a code block, and a post that clashes with a markdown URL.
- **Tests added:** R17.
- **Done when:** the samples appear correctly on pages, lists and tags, and Tim has done the manual check (R18).

### Stage 7: Feed, SEO and analytics

- **Work:**
  - The `/feed` endpoint with full content from both sources.
  - Head tags and structured data.
  - Google Analytics.
  - The manifest, favicon and `robots.txt`.
- **Tests added:** R9, R10, R11, R19, R26.
- **Done when:** the feed validates and SEO tags match the baseline.

### Stage 8: Cutover

See section 9.

## 9. Cutover and rollback

### Before merging

1. Merge `main` into `astro` so the newest posts are included.
2. Rerun the baseline capture and review what changed since stage 1.
3. Confirm the full suite and the smoke tests are green on the cutover PR.
4. In Netlify, remove the Gatsby build plugins (see section 11).
5. Check that the Contentful credentials are set for production builds.

### Merge

Merge the cutover PR. Netlify builds and publishes the Astro site.

### Straight after

1. Run the smoke tests against `https://timbroder.com`.
2. Load `/feed` and check that Feedburner picks up the new build.
3. Resubmit the sitemap in Google Search Console.

### Rollback

Netlify keeps every deploy. To roll back, publish the last Gatsby deploy from the Netlify deploys list, which takes effect at once, then revert the merge commit on `main`.

### In the following two weeks

- Watch for 404s in Netlify and in Search Console.
- Switch page screenshot tests from the live baseline to the new site's own screenshots.
- Remove this plan, the baseline crawl script and the stale migration branches.

## 10. Things to prove early

These were the assumptions the plan rested on. Stage 2 settled all nine (#135, with the Netlify ones run on the preview in #136).

| # | Question | Answer |
|---|---|---|
| P1 | Does Astro's loader read `.markdown` files as markdown? | **No**, only `.md`. The 497 `.markdown` files were renamed to `.md` in one mechanical commit. |
| P2 | Does Sätteri render the content the way the live site does? | **Yes.** Of 524 post and page bodies, 472 match the live site exactly. The remark pipeline gives the same result apart from one malformed file, so Sätteri stays. Most of the 52 differences are places where the live site shows raw markdown and the new build renders it; stage 5 goes through them. |
| P3 | Can an endpoint get each post's rendered HTML for the feed? | **Yes**, through `entry.rendered.html`. Images referenced by relative path come out as placeholders, which confirms decision 19. |
| P4 | Does an endpoint file build to `/feed` with no extension, and does a Netlify header set its content type? | **Yes.** `/feed` and `/feed/` return 200 as `application/rss+xml`. |
| P5 | Do Netlify redirects match old URLs containing odd characters? | **Yes, with care.** Netlify compares a rule with the request exactly as sent. See "How Netlify matches redirects" below. |
| P6 | Does Astrobook 0.13 run on Astro 7 with Tailwind 4? | **Yes.** Each story also gets a bare page at `/astrobook/stories/<component>/<story>/`, which the screenshot tests will use. |
| P7 | Does Tailwind 4 reproduce today's styles from the existing config? | **Yes so far.** The font scale and typography settings load unchanged. One `@screen lg` rule, which Tailwind 4 no longer understands, became a plain media query. Stage 4's screenshots are the full check. |
| P8 | Can the branch build on Netlify while the site is still set up for Gatsby? | **Yes**, with no workaround. The preview builds in about 30 seconds. |
| P9 | Does Astro 7's stricter HTML parsing or its whitespace stripping affect any template? | **Not so far.** All pages build and post bodies are unaffected. Templates are checked as they are written in stage 4. |

### How Netlify matches redirects

Found by requesting test rules on the deploy preview.

- **A rule matches only the exact characters of the request.** Netlify does not treat `|` and `%7C` as the same thing.
- **Characters a browser always encodes** (`|`, curly quotes, dashes) only match a rule written percent-encoded.
- **Characters a browser sends as they are** (`&`, `,`, `:`, `'`) match a rule written raw. A client that encodes them anyway only matches a rule written encoded.
- **Rules are case-sensitive.** A rule with capitals does not match the lowercased request, and Netlify's own lowercase redirect only applies to real files.
- **A trailing slash on the request is optional.**
- **Placeholders work**: `/:year/:month/slug/` matches any year and month.

So each old URL gets a rule in the form a browser sends and a rule fully percent-encoded. An old URL with capitals also gets both in lowercase, since visitors have been landing on the lowercase form.

One more thing the preview showed: a new deploy reaches Netlify's servers over a few seconds, and in that window some requests still get the old answer. The smoke job waits for six good responses in a row before it starts.

## 11. What I need from Tim

| When | What |
|---|---|
| Every stage | Merge the stage's PR into `astro` |
| Stage 3 | Review and edit `slug-cleanup.csv`, the 83 old URLs and proposed new slugs |
| Stage 4 | Approve the code block stories in Astrobook |
| Stage 5 | Review the placeholder image and the list of remote images that could not be recovered |
| Stage 6 | Publish a test post in Contentful and check it on the deploy preview |
| Cutover | Remove the Gatsby build plugins in Netlify; mark `gate` as a required check on `main` |

## 12. Out of scope

These are deliberately left for after cutover.

- Any design change, including dark mode.
- Search, comments, reading time, tables of contents or other new features.
- Automatic image resizing.
- Cleaning legacy frontmatter out of old posts.
- Renaming or moving content files.
- Publishing the three never-published posts.
