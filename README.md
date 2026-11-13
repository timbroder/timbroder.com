# timbroder.com
Repository for Tim Broder's [personal website](https://www.timbroder.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f8072d00-28cb-44d9-8169-4661b1580663/deploy-status)](https://app.netlify.com/sites/funny-meringue-5e00b8/deploys)

Deployed using [Netlify](https://app.netlify.com/sites/funny-meringue-5e00b8/overview)

## Local Development

The site is built with [Astro](https://astro.build/). A migration from Gatsby is in progress; see [MIGRATION_PLAN.md](MIGRATION_PLAN.md).

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
| `npm run test:build` | Compare the build in `dist/` with the live-site baseline (run `npm run build` first). Also builds the site with the sample Contentful posts and checks those. |
| `npm run build:samples` | Build the site with the sample Contentful posts into `dist-samples/` |
| `npm run test:browser` | Browser tests: the pages against the live site, every component story, navigation and accessibility (run `npm run build` first) |
| `npm run test:smoke` | Check redirects and headers on a deployed copy (set `SMOKE_URL`) |
| `npm run serve` | Serve `dist/` the way the browser tests see it |
| `npm run check` | Type-check the project |
| `npm run format` | Format code with Prettier |
| `npm run baseline:capture` | Re-capture the live-site baseline the migration is tested against (see `tests/baseline/README.md`) |

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
