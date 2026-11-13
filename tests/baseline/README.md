# Baseline

This folder holds facts captured from the live Gatsby site. The Astro migration is tested against them: the new build must reproduce these facts, apart from a short list of intended differences.

It is temporary. Once the Astro site is live and stable, this folder and the capture script go away.

## Files

| File | What it holds |
|---|---|
| `urls.txt` | Every URL in the live sitemap, as decoded paths, sorted |
| `pages.jsonl` | One line per page (every sitemap URL plus the 404 page): head tags, navigation, footer, and for posts and markdown pages the date, tags, category, "original article" link and body |
| `lists.json` | For every list page: its headline, pagination and the order of its cards. Card details are stored once per post. |
| `feed.json` | The feed's channel details and every item's guid, link, title and date |
| `site.json` | How Netlify answers a few non-page requests (redirects, 404, feed, sitemap), plus `robots.txt` and the web app manifest |
| `meta.json` | When the capture ran, the commit of `main` it reflects, and counts |

Post bodies are stored as text, link targets, image sources, code blocks, element counts and block structure (where each paragraph, heading and list item starts and ends), not as HTML, so two renderers can be compared.

## Capturing again

```sh
npm run baseline:capture
npm test
```

Run it whenever `main` has changed while Gatsby is still the live site. The capture makes about 780 requests, four at a time, and takes two to three minutes.

## Posts written in Contentful

The live site has posts that come from Contentful, and so does this capture. A build made without the Contentful settings cannot have them, and that is every build except Netlify's.

- `tests/lib/expected.ts` lists them in `CONTENTFUL_ON_LIVE`. Add a post there when one is published in Contentful.
- The build tests read the baseline through `tests/lib/live.ts`, which leaves those posts out when the build lacks them, along with the tag pages that exist only for them.
- The smoke tests ask the deployed site for exactly those pages.

## Quirks of the live site

The capture records what the live site does, including things that are bugs. Each one needs a decision about whether the new site repeats it; those decisions are tracked in `MIGRATION_PLAN.md`.

- **Every page of a list shows the whole list.** `/page/2/` shows the same 516 cards as `/`. The same is true of tag and category pages. Pagination links and page counts exist, but nothing is actually split into pages.
- **Three posts are missing from every list and from the feed,** though their pages exist: `best-apps-for-new-dads`, `fussy-coffee` and `games-i-was-addicted-to-in-2014`. They lack `layout:` or `date:` in frontmatter.
- **Two posts have no date,** so their URLs use the month of the latest build and move every month: `fussy-coffee` and `games-i-was-addicted-to-in-2014`.
- **Two posts have an empty title.** `heymamma-2` has an unquoted title starting with `#`, which YAML reads as a comment, so its page title is "null". `games-i-was-addicted-to-in-2014` has a blank title.
- **Two posts with `link: None`** show an "original article" link pointing at `…/None/`.
- **`/tag//` exists.** Two posts have an empty tag, which produces a page titled "Tag: null".
- **`/tag/apps/` has no cards.** Its only post is one of the three unlisted posts.
- **The 404 page highlights "Posts"** in the navigation, because `/404.html` starts with a digit.
- **Some card descriptions show raw markdown,** where a post begins with an image.
- **54 posts show links or pictures as raw markdown,** such as `[here](http://example.com/a- b)`. The old export wrapped long lines, also in the middle of an address, and an address with a break in it is not a link.
- **A wrapped line can fall out of its list item or quote.** In the old exports a list item or quote that wraps continues on the next line with no indent. The live site ends the list or quote there and starts a paragraph, so a quote can break off in mid-sentence.
- **A picture kept on the site links to a resized copy** under `/static/`, and gets its file name as alt text when it has none. Both come from Gatsby's image plugin.
- **`/feed` is served as `text/plain`,** and the manifest as `application/octet-stream`.
- **`/using-typescript/`** is a leftover page from the Gatsby starter.
