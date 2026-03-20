# Astro migration prompts

Use the following prompts to drive a granular, step-by-step migration from Gatsby to Astro while preserving the current look, Tailwind styling, offsite-linked posts, RSS, sitemap, categories/tags, and frontmatter-driven slugs. Ask them in order; each prompt gathers the inputs needed for the next stage. Steps 1–3 explicitly kick off the migration by installing Astro and decommissioning Gatsby.

1) **Bootstrap Astro**
“Should we initialize Astro in-place (e.g., `npm create astro@latest -- --template blog --install`) or scaffold in `astro/` and migrate content before cutting over? Confirm package manager (npm/yarn/pnpm) so we pin lockfiles correctly.”

2) **Astro/Tailwind setup**
“Are we adding Tailwind via `astro add tailwind` immediately after bootstrap? Confirm desired Tailwind config (JIT, content paths) and whether to reuse the existing `tailwind.config.js` tokens.”

3) **Retire Gatsby dependencies**
“After Astro scaffold, do we remove Gatsby packages/config (gatsby*, plugins) and keep content/assets only? Should we keep Gatsby alongside Astro temporarily for diffing, or fully deinstall now?”

4) **Audit inputs**
“Please share your deployment target (e.g., Netlify/Vercel), current Gatsby version, and any hosting redirect rules we must preserve (including Feedburner).”

5) **Content inventory**
“List the content locations and formats (Markdown/MDX) and confirm required frontmatter fields (`title`, `date`, `slug`/`path`, `link`, `tags`, `categories`, `description`, `draft`). Can you provide a sample post with an offsite `link`?”

6) **Content migration & Markdown fidelity**
“Confirm we are migrating *all* existing posts/pages as-is. Should we preserve Markdown syntax and frontmatter fields verbatim (no conversion to MDX unless needed)? Share any Markdown extensions (remark plugins), custom shortcodes, or fenced code block conventions (e.g., language tags, ` ```sh `, ` ```tsx `) so code snippets render identically in Astro.”

7) **Slug rules confirmation**
“Do we follow the existing priority—`path` > `slug` > date+filename—for slugs? Any exceptions (e.g., legacy redirects)?”

8) **Navigation data**
“Provide the current `siteMetadata.nav` items and any dynamic logic (active-route highlighting, archive handling) that must be mirrored.”

9) **Layout and styling**
“Share screenshots or the Tailwind token source (colors/spacing/typography) so we can recreate the layered background, header/footer, and blog typography in Astro.”

10) **Home page behavior**
“Confirm home page features: posts grid, offsite-link handling on cards, Mastodon verification, and alternate RSS link. Anything else to keep?”

11) **Post template specifics**
“Detail the post template behaviors: external-link banner when `frontmatter.link` exists, tag chips, category links to `/tag/` and `/category/`, canonical meta tags, and any MDX shortcodes/components.”

12) **Taxonomy pages**
“Describe tag/category page layouts (headline banners, ordering) and any pagination rules.”

13) **About and static pages**
“Share the About page content and assets (rotated avatar, social icon set) plus any other static pages to port.”

14) **Feeds and sitemap**
“Confirm RSS requirements (endpoints, Feedburner redirect) and sitemap expectations. Should offsite-linked posts use the external URL in the feed item link?”

15) **Redirects and metadata**
“List all redirects in Gatsby (`gatsby-node.js`/`siteMetadata.redirects`) and site-wide metadata (author info, social links) we need in Astro config.”

16) **Testing and acceptance**
“Which checks should gate each milestone? (e.g., `astro check`, lint/format, visual parity screenshots for layout/home/post/tag/category/About, manual validation of slugs/RSS/sitemap/offsite links).”

17) **Rollout plan**
“Any content freeze windows or phased launch needs? Confirm desired order to tackle milestones: bootstrap, content ingestion, layout/nav, home, post template, taxonomy, static pages, feeds/sitemap, redirects, QA.”

18) **Risks and follow-ups**
“Are there planned design tweaks (dark mode, fonts) or platform constraints that could affect the migration?”
