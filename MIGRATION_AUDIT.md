# timbroder.com Feature Audit for Gatsby → Astro Migration

## Site Identity

- **URL:** https://timbroder.com/
- **Title:** "Tim Broder .com"
- **Tagline:** "Tim Broder is a creative technologist"
- **Author:** Tim Broder
- **Author Summary:** "Code, Comics, Crossfit, and now, D&D."
- **Running Since:** 2007
- **Platform History:** WordPress (2007–2014) → Jekyll (2015–) → Gatsby 5 (2023–present)
- **Base Starter:** `gatsby-starter-blog` (heavily customized)

---

## 1. Content Architecture

### 1a. Dual Content Sources

The site pulls content from **two sources simultaneously** and merges them into a single unified feed:

1. **Local Markdown files** (`/content/blog/` and `/content/pages/`)
2. **Contentful CMS** (headless CMS via API)

Key behaviors:
- Posts from both sources are merged, normalized to a common shape, and sorted by date
- **Markdown takes priority** if a slug conflicts with a Contentful post
- Contentful posts use rich text (not markdown) with embedded assets and custom code blocks
- Both sources support: title, date, description, tags, category, link, draft status

### 1b. Content Types

| Type | Source | Location / Route |
|------|--------|-----------------|
| Blog Posts | Markdown + Contentful | `/YYYY/MM/slug-name/` |
| Static Pages | Markdown only | `/{path}/` (e.g., `/projects/`, `/podcasts/`) |

### 1c. Blog Post Frontmatter (Markdown)

Active fields used by the current Gatsby build:

| Field | Type | Required | Purpose |
|-------|------|----------|---------|
| `title` | string | Yes | Post title |
| `date` | datetime | Yes | Publication date (formats vary: `YYYY-MM-DD`, `YYYY-MM-DD HH:MM`, ISO 8601) |
| `layout` | string | Yes | `"post"` or `"page"` — determines content type |
| `tags` | string[] | No | YAML list of topic tags |
| `category` | string | No | Single category string |
| `link` | string | No | External URL for "link post" format (see feature #5) |
| `description` | string | No | Custom excerpt/meta description |
| `draft` | boolean | No | If `true`, excluded from build |
| `slug` | string | No | Manual slug override (legacy, used in older posts) |

Legacy fields still present in older posts (not actively used by Gatsby):

| Field | Origin | Notes |
|-------|--------|-------|
| `wordpress_id` | WordPress | Integer ID from WP database |
| `dsq_thread_id` | WordPress | Disqus thread ID |
| `author` | Jekyll | Always `"tim"` |
| `comments` | WordPress | Disqus boolean flag |
| `excerpt` | Jekyll | Rarely used |

### 1d. Contentful Schema

**ContentfulBlogPost:** title, slug, date, description, tags, category, link, draft, content (rich text), ogImage

**ContentfulCodeBlock** (embedded entry): title, language, code, showLineNumbers

**ContentfulAsset** (embedded entry): images with title, description, file URL

### 1e. Static Pages (Markdown)

These are markdown files with `layout: page` and an explicit `path:` field:

| Page | Path | Content |
|------|------|---------|
| Projects | `/projects/` | List of personal/client projects with links |
| Podcasts | `/podcasts/` | History of co-hosted podcasts on Tekside network |
| Podcasts I Listen To | `/podcasts-i-listen-to/` | List of podcasts (current and former) |
| Talks | `/talks/` | Speaking engagements with slide links |
| Apps | `/apps/` | iOS app portfolio (Weather Notifications) |
| Listening | `/listening/` | (if present) |

### 1f. Content Volume

- ~25 local markdown blog posts
- Additional posts in Contentful (count unknown without API access)
- Blog archive goes back to 2007
- 6 static pages

---

## 2. URL Structure & Routing

### 2a. Slug Generation

- **Markdown posts:** `/{YYYY}/{MM}/{slug}/` derived from frontmatter date + filename
  - If frontmatter has `path:` → use that directly
  - If frontmatter has `slug:` + `date:` → `/{YYYY}/{MM}/{slug}/`
  - Otherwise → strip date prefix from filename, combine with date
- **Contentful posts:** `/{YYYY}/{MM}/{slug}/` using `moment(date).format('YYYY/MM/') + slug`
- **Static pages:** Use frontmatter `path:` field directly (e.g., `/projects/`)
- **Trailing slashes:** Always enforced (`trailingSlash: "always"`)

### 2b. Pagination Routes

| Route Pattern | Content |
|---------------|---------|
| `/` | Page 1 of all posts |
| `/page/{N}/` | Page N of all posts |
| `/tag/{kebab-tag}/` | Page 1 of posts with tag |
| `/tag/{kebab-tag}/page/{N}/` | Page N of tag archive |
| `/category/{kebab-cat}/` | Page 1 of posts in category |
| `/category/{kebab-cat}/page/{N}/` | Page N of category archive |

- 20 posts per page (`POSTS_PER_PAGE = 20`)

### 2c. Redirects

- `/feed` → `/atom_feedburner.xml` (configured in siteMetadata, applied via `createRedirect`)

---

## 3. Navigation

### 3a. Primary Navigation

Configured in `gatsby-config.js` siteMetadata, rendered in both header and footer:

| Label | Path |
|-------|------|
| Posts | `/` |
| Podcasts | `/podcasts/` |
| Projects | `/projects/` |
| Talks | `/talks/` |
| About | `/about/` |

### 3b. Header

- Centered pill-shaped nav bar with frosted glass effect (`bg-white/90 backdrop-blur`)
- Active state: teal text with gradient underline
- "Posts" shows active on any path matching `/^\\/\\d/` (date-based post URLs) or exactly `/`

### 3c. Footer

- Repeats all nav links horizontally
- Copyright line: `© {since} - {currentYear} {authorName}. All rights reserved.`
- `since` is `2007`

---

## 4. Post Display Features

### 4a. Post Listing (Home / Archive)

- Card-based layout with responsive grid (single column mobile, 4-column grid on desktop)
- Each card shows: title (linked), date, category ("in {category}"), description/excerpt
- CTA text: "Read article" for normal posts, "Read commentary" for link posts
- Date shown as eyebrow metadata; hidden on mobile (shown inline instead)

### 4b. Single Post Page

- Date displayed with decorative vertical bar
- Large headline
- Post body wrapped in `<Prose>` component (Tailwind Typography)
- **For link posts:** Shows "Check out the original article" link above content
- **Footer metadata:** Tags as rounded pill badges (linked to tag archives), category with link
- Previous/Next post navigation (works across both content sources)

### 4c. Rich Text Rendering (Contentful)

- Full rich text renderer supporting:
  - Embedded images (via `GatsbyImage` / responsive)
  - Embedded code blocks with Prism syntax highlighting
  - 16+ languages: JS, TS, JSX, TSX, Python, Bash, JSON, YAML, Markdown, CSS, SQL, GraphQL, Go, Ruby, Diff, and more
  - Line numbers (toggleable per block)
  - Custom styling for tables, lists, blockquotes, headings

---

## 5. Link Posts

A "Daring Fireball"-style link post pattern:

- Posts with a `link` field in frontmatter (or Contentful) point to an external article
- On the post page: displays "Check out the original article" with a link before the post body
- On listings: CTA says "Read commentary" instead of "Read article"
- The post content is the author's commentary on the linked article

---

## 6. SEO & Meta

### 6a. SEO Component

- `<title>` format: `{pageTitle} | Tim Broder .com`
- `<meta name="description">`
- Canonical URLs via `<link rel="canonical">`
- Open Graph: `og:title`, `og:description`, `og:type` (website), `og:url`, `og:image`
- Twitter Cards: `summary_large_image`, `twitter:title`, `twitter:description`, `twitter:image`
- Default OG image fallback: `/og-image.png` (in `/static/`)
- Contentful posts can have a custom `ogImage` field

### 6b. Structured Data

- JSON-LD `Article` schema on every blog post
- Fields: headline, description, url, datePublished, author (Person), publisher (Person), image, mainEntityOfPage

### 6c. Sitemap

- Generated by `gatsby-plugin-sitemap`
- Custom query excludes 404 page
- Referenced in `robots.txt`

### 6d. robots.txt

```
User-agent: *
Disallow:

Sitemap: https://timbroder.com/sitemap-index.xml
```

### 6e. Mastodon Verification

- `<link rel="me" href="https://masto.ai/@timothybroder" />` in the `<head>` of the blog list template

---

## 7. RSS Feed

- Generated by `gatsby-plugin-feed`
- Merges posts from both Markdown and Contentful
- Feed available at: `https://feeds.feedburner.com/timbroder` (via Feedburner)
- Internal redirect: `/feed` → `/atom_feedburner.xml`
- RSS link header in blog list template: `<link rel="alternate" type="application/rss+xml" ...>`
- Filters out draft posts
- Sorted by date descending

---

## 8. Analytics

- **Google Analytics 4** via `gatsby-plugin-google-gtag`
- Tracking ID: `G-L8N53HMK1R`
- Script placed in `<head>` (`head: true`)

---

## 9. Styling & Design System

### 9a. CSS Framework

- **Tailwind CSS v3.4.18** with PostCSS + Autoprefixer
- **@tailwindcss/typography** plugin for prose/article content
- No CSS modules, no styled-components — pure Tailwind utility classes

### 9b. Typography

- Fonts: `@fontsource/montserrat` and `@fontsource/merriweather`
- Custom Tailwind typography configuration:
  - Body text: `zinc-600`
  - Links: `teal-500`
  - Headings: `zinc-800` (bold)
  - Accent/highlight color: `teal-500`

### 9c. Code Highlighting

- **Prism.js** with Okaidia theme (dark background)
- Line numbers enabled by default
- Custom `.gatsby-highlight` CSS styling in `global.css`
- Imported in `gatsby-browser.js`

### 9d. Layout System

- Custom `Container` component with `OuterContainer` (max-width + padding) and `InnerContainer` patterns
- Responsive: mobile-first with `sm:`, `md:`, `lg:` breakpoints
- No dark mode (explicitly removed per commit history)

### 9e. UI Library

- `@headlessui/react` v1.7.19 (listed as dependency, unclear if actively used)
- `clsx` for conditional class composition

---

## 10. About Page

- Custom React page (not markdown), at `/about/`
- Two-column responsive grid: bio text + photo on left/right
- Author photo via `StaticImage` (optimized, rotated 3deg)
- 9 social media links with SVG icons:

| Service | URL |
|---------|-----|
| Mastodon | https://masto.ai/@timothybroder |
| Instagram | https://www.instagram.com/timothybroder/ |
| GitHub | https://github.com/timbroder |
| LinkedIn | https://www.linkedin.com/in/timbroder/ |
| Reddit | https://www.reddit.com/user/broderboy/ |
| Goodreads | https://www.goodreads.com/user/show/1253891-tim-broder |
| PlayStation (Exophase) | https://www.exophase.com/user/timbroder/ |
| Last.fm | https://www.last.fm/user/broderboy/ |
| Trakt | https://trakt.tv/users/timbroder |

---

## 11. Image Handling

- **gatsby-plugin-image** + **gatsby-plugin-sharp** + **gatsby-transformer-sharp** for responsive image optimization
- **gatsby-remark-images** for inline markdown images (maxWidth: 630px)
- **gatsby-remark-responsive-iframe** for embedded iframes (videos, etc.)
- Formats: auto, webp, avif
- No featured image field in markdown frontmatter — images are inline in content
- Contentful posts can have a dedicated `ogImage` field
- Static images: `avatar.png`, `profile-pic.png`, `gatsby-icon.png`, `og-image.png`, `favicon.ico`

---

## 12. PWA / Manifest

- `gatsby-plugin-manifest` generates a web app manifest:
  - `name: "Gatsby Starter Blog"` (note: not customized)
  - `display: minimal-ui`
  - `icon: src/images/gatsby-icon.png` (note: still default Gatsby icon)
- **No service worker / offline support**

---

## 13. Deployment & Infrastructure

### 13a. Hosting

- **Netlify** with `netlify.toml` configuration
- Build command: `npm run build -- --verbose --log-pages`
- Publish directory: `public`
- `netlify-plugin-gatsby-cache` for build caching

### 13b. Build Environment

- Node 22 (`.nvmrc` and `netlify.toml`)
- `NODE_OPTIONS="--max-old-space-size=4096"` (4GB memory)
- `GATSBY_EXPERIMENTAL_QUERY_CONCURRENCY=1` (throttled queries)
- Environment variables: `CONTENTFUL_SPACE_ID`, `CONTENTFUL_ACCESS_TOKEN`

### 13c. Docker

- `Dockerfile` and `docker-compose.yml` present (for local development)

---

## 14. Code Quality

- **ESLint:** Airbnb config, babel-parser, react/jsx-a11y/import plugins
- **Prettier:** No semicolons, single quotes, ES5 trailing commas
- **No tests** (`"test": "echo \"Write tests!\" && exit 1"`)

---

## 15. Miscellaneous Utilities

- **podcasts.py** — Python script to parse Overcast OPML export and generate markdown podcast list
- **lodash** — Used for `kebabCase` (tag/category slug generation) and string manipulation
- **moment.js** — Used for date formatting in slug generation

---

## 16. Features NOT Present (Confirmed Absent)

These were checked for and confirmed not implemented:

- [ ] Dark mode / theme switching (was explicitly removed)
- [ ] Comments system (legacy Disqus fields exist in old posts but no integration)
- [ ] Search functionality
- [ ] Newsletter / email signup
- [ ] Reading time estimation
- [ ] Table of contents generation
- [ ] Serverless functions / API routes
- [ ] E-commerce / payments
- [ ] Social share buttons on posts (Twitter Cards exist for link previews only)

---

## Questions to Discuss

1. **Contentful going forward?** Do you want to keep Contentful as a content source in Astro, or consolidate everything to markdown/MDX? Astro has good Contentful support, but it adds complexity.

2. **Feedburner:** The RSS feed redirects through Feedburner (`https://feeds.feedburner.com/timbroder`). Do you want to keep using Feedburner, or generate the RSS feed directly from Astro and point the domain's `/feed` to it?

3. **Legacy frontmatter cleanup:** Older posts have WordPress/Jekyll remnants (`wordpress_id`, `dsq_thread_id`, `author`, `comments`). Should we strip these during migration, or leave them as-is for historical record?

4. **Manifest name:** Currently says "Gatsby Starter Blog" and uses the default Gatsby icon. Should these be updated during migration?

5. **The About page** is a custom React component (not markdown). In Astro, this could be an `.astro` component or an MDX file. Preference?

6. **`@headlessui/react`** is listed as a dependency — is it actively used anywhere, or can it be dropped?

7. **Link posts:** Do you still use the link-post pattern (external `link` field with commentary)? Should we keep this feature?

8. **Docker files:** Are the Dockerfile and docker-compose.yml still used for local development, or can they be dropped?

9. **Pagination count:** 20 posts per page — should that stay the same?

10. **Tag/Category system:** Currently tags are an array and category is a single string. Both generate paginated archive pages. Keep this structure, or simplify?

11. **The `podcasts-i-listen-to` page** links to `/podcasts-i-listen-to` from the podcasts page, but the page file is `listening.markdown` with `path: /podcasts-i-listen-to` — do you still want this page?

12. **Google Analytics:** Keep GA4, or switch to something privacy-focused (Plausible, Fathom, etc.)?

13. **Previous/Next navigation** on posts currently works across both content sources (markdown and Contentful) in chronological order. Preserve this behavior?
