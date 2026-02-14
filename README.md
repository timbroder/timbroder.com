# timbroder.com
Repository for Tim Broder's [personal website](https://www.timbroder.com/)

[![Netlify Status](https://api.netlify.com/api/v1/badges/f8072d00-28cb-44d9-8169-4661b1580663/deploy-status)](https://app.netlify.com/sites/funny-meringue-5e00b8/deploys)

Deployed using [Netlify](https://app.netlify.com/sites/funny-meringue-5e00b8/overview)

## Local Development

### Prerequisites

- Node.js (recommended: use [nvm](https://github.com/nvm-sh/nvm) for version management)
- npm

### Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/timbroder/timbroder.com-gat3.git
   cd timbroder.com-gat3
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

### Running locally

Start the development server:
```bash
npm run develop
```

The site will be available at `http://localhost:8000`

### Other commands

| Command | Description |
|---------|-------------|
| `npm run build` | Build the production site |
| `npm run serve` | Serve the production build locally |
| `npm run clean` | Clear Gatsby cache and public directories |
| `npm run format` | Format code with Prettier |

## Content Management

This site supports two content sources that are merged together:

### Markdown (content/blog/)
Traditional markdown files with frontmatter. Add a new `.md` file, commit, and push to trigger a deploy.

### Contentful
Blog posts can also be created in [Contentful](https://app.contentful.com/). Posts from both sources are merged and sorted by date.

#### Content Types
- **Blog Post** (`blogPost`) - Main post with title, date, slug, rich text content, tags, category
- **Code Block** (`codeBlock`) - Embeddable code snippets with syntax highlighting

### Publishing Flow

Since Gatsby is a static site generator, content changes require a site rebuild:

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
