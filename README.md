# timbroder.com
Repository for Tim Broder's [personal website](https://www.timbroder.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f8072d00-28cb-44d9-8169-4661b1580663/deploy-status)](https://app.netlify.com/sites/funny-meringue-5e00b8/deploys)

Deployed using [Netlify](https://app.netlify.com/sites/funny-meringue-5e00b8/overview)

## Local Development

The site is built with [Astro](https://astro.build/). It replaced a Gatsby site on 2026-11-13; [MIGRATION_PLAN.md](MIGRATION_PLAN.md) records how and why.

### Prerequisites

- Node.js 22.23.4 or later (the version is pinned in `.nvmrc`; [nvm](https://github.com/nvm-sh/nvm) will pick it up)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/timbroder/timbroder.com.git
   cd timbroder.com
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running locally

Start the development server:
```bash
npm run dev
```

The site will be available at `http://localhost:4321`. The component library is at `http://localhost:4321/astrobook/`.

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the production site into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm test` | Run the unit tests |
| `npm run test:build` | Check the build in `dist/`: lists, head tags, the feed, redirects, links and images (run `npm run build` first). Also builds the site with the sample Contentful posts and checks those. |
| `npm run build:samples` | Build the site with the sample Contentful posts into `dist-samples/` |
| `npm run test:browser` | Browser tests: screenshots of each kind of page and of every component story, navigation and accessibility (run `npm run build` first) |
| `npm run test:smoke` | Check redirects and headers on a deployed copy (set `SMOKE_URL`) |
| `npm run serve` | Serve `dist/` the way the browser tests see it |
| `npm run check` | Type-check the project |
| `npm run format` | Format code with Prettier |

### Tests and publishing

Publishing a post never needs a change to a test.

- A markdown post only touches `content/` and `public/images/`, and CI skips the tests for a change like that. A post published in Contentful rebuilds the site on Netlify and never reaches CI.
- The build itself checks every post. One that breaks a rule (no date, an untidy slug, a local picture with no file) stops the Netlify build with a message, and the site stays as it was.
- The tests check rules, not a list of posts. Two things are pinned: the addresses and feed guids the site had on the day it replaced the Gatsby site (`tests/fixtures/cutover.json`), which must keep working, and screenshots of a few pages that a new post does not change.

Screenshots are stored under `tests/browser/__screenshots__/linux/` and only compare on the system that took them. To accept a deliberate change of design, run `npm run build`, then `npm run test:browser:linux -- --update-snapshots` (it needs Docker), and commit the screenshots that changed.

## Content Management

This site supports two content sources that are merged together:

### Markdown (content/blog/)
Traditional markdown files with frontmatter. Add a new `.md` file, commit, and push to trigger a deploy.

### Contentful
Blog posts can also be created in [Contentful](https://app.contentful.com/). Posts from both sources are merged and sorted by date.

A post from Contentful follows the same rules as a markdown post: it needs a title, a date and a slug made of lowercase letters, digits and hyphens, and it lives at `/YYYY/MM/slug/`. If a markdown post already has that address, the markdown post is shown.

#### Content Types
- **Blog Post** (`blogPost`)

  | Field | What the site does with it |
  |-------|----------------------------|
  | `title`, `slug`, `date` | Required. The month in the address is the month of `date` in UTC. |
  | `content` | Rich text: the body of the post. |
  | `description` | The summary on cards and in link previews. Without it, the start of the text is used. |
  | `tags`, `category` | The post's tag and category pages. |
  | `link` | Makes the post a link post about that article. |
  | `ogImage` | The post's own picture for link previews. |
  | `draft` | When on, the post is hidden even though it is published. |

- **Code Block** (`codeBlock`) - Embedded in a post's rich text. `code` is highlighted as `language`; turn `showLineNumbers` off to hide the line numbers.

A picture embedded in rich text gets the asset's title as its alt text. If the asset has a description, that is shown as a caption.

The build stops, and the live site stays as it was, when a post has something the site cannot show: a missing title or date, an untidy slug, an embedded entry or picture that is not published, or an entry of another type. The build log names the post and the problem.

### Publishing Flow

Since the site is statically generated, content changes require a site rebuild:

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│  Contentful │────▶│   Webhook   │────▶│   Netlify   │
│   Publish   │     │   Trigger   │     │   Rebuild   │
└─────────────┘     └─────────────┘     └─────────────┘
```

#### Setup Contentful → Netlify Webhook

1. **Get Netlify Build Hook URL:**
   - Go to Netlify → Site settings → Build & deploy → Build hooks
   - Click "Add build hook", name it "Contentful", select branch `main`
   - Copy the generated URL

2. **Add Webhook in Contentful:**
   - Go to Contentful → Settings → Webhooks
   - Click "Add Webhook"
   - Name: `Netlify Deploy`
   - URL: Paste the Netlify build hook URL
   - Triggers: Select "Publish" and "Unpublish" for Entry
   - Content Types: Filter to `Blog Post` only (optional)
   - Save

Now when you publish or unpublish a Blog Post in Contentful, Netlify will automatically rebuild the site.

#### Environment Variables

Required in Netlify (Site settings → Environment variables):

| Variable | Description |
|----------|-------------|
| `CONTENTFUL_SPACE_ID` | Your Contentful space ID |
| `CONTENTFUL_ACCESS_TOKEN` | Content Delivery API access token |
| `CONTENTFUL_ENVIRONMENT` | Optional. The environment to read; `master` when not set |

A production build fails without the first two. Anywhere else (your machine, CI) a build without them leaves the Contentful posts out and says so. To read the real space locally, put both in a `.env` file, which git ignores.

To see the sample Contentful posts locally:

```bash
CONTENTFUL_FIXTURES=src/fixtures/contentful/entries.json npm run dev
```

Every page says what its build read from Contentful, in `<meta name="build-contentful">`: `api: 2 posts`, `samples: 3 posts` or `off`.

## AI-Assisted Content Creation

This repository includes a comprehensive writing voice guide (`CLAUDE.MD`) that captures Tim's authentic writing style, tone, and patterns based on 25+ blog posts spanning 2007-2026.

### Using the Voice Guide

**With Claude (or other AI assistants):**

```
Using the voice guide in CLAUDE.MD, write a blog post about [topic]...
```

**Example prompts:**

1. **Technical post:**
   ```
   Using the voice guide in CLAUDE.MD, write a blog post about debugging
   a React performance issue. Include: the problem, how I investigated it
   with React DevTools, the solution, and what I learned. Keep it 300-400 words.
   ```

2. **Personal reflection:**
   ```
   Using the voice guide in CLAUDE.MD, write a short post (150-200 words)
   about the importance of taking breaks during focused work. Make it personal
   and include a practical takeaway.
   ```

3. **Link post:**
   ```
   Using the voice guide in CLAUDE.MD, write a link post about this article:
   [URL]. Pull out 2-3 key quotes and explain why it resonated with me.
   ```

### What the Voice Guide Includes

- Core voice characteristics (conversational, authentic, humble)
- Writing style guidelines (sentence structure, paragraph formatting)
- Content patterns for different post types (technical, personal, link posts)
- Language preferences and common phrases
- Example transformations showing formal vs. Tim's voice
- Pre-publish checklist for consistency
- **Attribution guidelines** for transparently crediting AI-generated content

The voice guide ensures AI-generated content maintains consistency with the established writing style of the blog.

### Attribution Requirement

**All AI-generated posts must include attribution.** Add this at the end of AI-written posts:

```markdown
---

*This post was written by Claude (Anthropic's AI assistant) based on [my experiences/notes/outline] and the voice guide in this repository.*
```

See `CLAUDE.MD` for alternative attribution formats and best practices.

## Checking in on Google Search Console

In November 2026 Google had about a third of this site indexed. [#145](https://github.com/timbroder/timbroder.com/pull/145) fixed what was broken and gave every post more ways to be found: an archive, a tag index, links between neighbouring posts, and a description of its own on every list page.

Google takes weeks to react. The first check-in worth doing is about a month after #145 was merged, and then every few months.

### What to export

Everything comes from [Search Console](https://search.google.com/search-console). Each export is a zip. Keep them: the next check-in compares against them.

1. **Indexing → Pages → Export.** The summary, with one count per reason.
2. **On the same page, "View data about indexed pages" → Export.** The indexed addresses.
3. **On the same page, each row under "Why pages aren't indexed" → Export.** One list per reason. Skip a reason whose count is 0.
4. **Performance → Search results, last 3 months → Export.**
5. **Links → External links → Top linked pages → Export.**

Also open **Manual actions** and **Security issues**. Both should say that no issues were detected.

### The baseline: 17 November 2026

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

### Check-ins so far

Each check-in adds a row.

| Date | Pages indexed | Posts indexed | Tag pages indexed | Addresses indexed | Search clicks a month |
|---|---|---|---|---|---|
| 2026-11-17 | 219 | 196 of 519 | 18 of 189 | 269 | About 5 |

### How to read the numbers

- **Count pages, not addresses.** Google held several addresses for one post: with and without the trailing slash, and old slugs. The 269 indexed addresses were 219 pages, and 97 of them were forms that redirect. As Google drops those, "Indexed" can fall towards 219 with nothing having got worse.
- **A page is indexed if any form of its address is.** The forms are: with or without the trailing slash, with `www`, ending in `.html`, and any old slug in the post's `redirect_from`.
- **Some numbers should rise.** "Page with redirect" grows as Google rechecks old addresses. "Duplicate, Google chose different canonical than user" rises and then falls, while Google follows the redirects of the 85 posts that were given new slugs.
- **"Not found (404)" should fall to two or three.** A new address there is worth a look.
- **What a page says did not decide whether it was indexed.** Indexed, declined and never-crawled posts were alike in length, in how much of them was quoted, in year and in tags. So #145 changed the site's structure, and a check-in is the test of whether that worked.
- **Judge search traffic by clicks.** 70% of impressions were the home page, deep in the results, and most did not look like people. They fell by 95% between May and October 2026 while clicks stayed the same.

### The prompt

Give Claude this, with the paths of the exports filled in:

```
Check in on how Google is indexing timbroder.com.

Start with the "Checking in on Google Search Console" section of README.md. It has
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
2. What moved in each "not indexed" reason, and whether the README says to expect
   that move. Open anything new under "Not found (404)" on the live site.
3. Whether the eight posts named in the README are indexed again.
4. Search clicks a month, and which pages earned them.
5. Which pages were gained and which were lost, if I gave you the last exports.
6. Anything the numbers show that the README did not expect.

Say which findings you checked and which are your reading of the data. If you think
the site should change, say what and why, and wait for my answer before changing it.
When we are done, add a row to "Check-ins so far" in the README.
```
