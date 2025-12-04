# Codex-ready upgrade prompts: Gatsby site to latest deps + Node 25

Each numbered item is a prompt you can paste into Codex in order. Later prompts include the context of prior steps so you can run them independently across chats.

1. **Baseline + context collection**
   "You are helping upgrade a single-site Gatsby project deployed to Netlify. It uses Yarn with existing lockfile and Gatsby v5.x, Tailwind/PostCSS, React 18, remark/prism plugins, and analytics/sitemap/feed in `gatsby-config.js`. Target runtime is Node 25. First, read `package.json`, `gatsby-config.js`, `gatsby-node.js`, `gatsby-browser.js`, and `gatsby-ssr.js` to inventory dependencies, scripts, and plugin usage. Summarize the current stack, build scripts, and any plugin options that might break on upgrade (sitemap/feed/gtag/remark/sharp). Output only the summary."

2. **Node + tooling plan**
   "Context: We will upgrade to Node 25 on Netlify. Based on the previous summary, list the exact steps to set local Node to 25 (e.g., via .nvmrc or Netlify environment variable), confirm Yarn version, and validate the current lockfile with `yarn install --frozen-lockfile`. Include the precise commands to run."

3. **Dependency audit**
   "Context: Using the inventory, enumerate all direct dependencies/devDependencies with their current versions. Note which have major upgrades available (Gatsby core/plugins, React, Tailwind/PostCSS, remark/prism, utilities). Briefly note any breaking-change areas to check (GraphQL schema changes, image handling, feed/sitemap APIs, SSR/DSG, Tailwind config)."

4. **Upgrade execution script**
   "Context: Plan to bump everything to the latest stable versions compatible with Gatsby's newest major release. Provide a concrete, ordered command list to: (a) update dependency ranges in `package.json` (you may suggest `yarn upgrade-interactive --latest` or explicit `yarn add` commands), (b) regenerate `yarn.lock` on Node 25, and (c) capture a git diff. Keep it concise and actionable."

5. **Config/code adjustments**
   "Context: After upgrades, we need to adjust configs. Using knowledge of Gatsby/Tailwind/PostCSS changes, list specific files to review and the exact checks to perform: `gatsby-config.js`, `gatsby-node.js`, `gatsby-browser.js`, `gatsby-ssr.js`, `tailwind.config.js`, `postcss.config.js`. Mention common breaking changes (plugin option renames, image/sharp changes, feed/sitemap serialization, remark/prism imports). Provide short code snippets or option names to verify."

6. **Build + validation commands**
   "Context: With dependencies updated and configs reviewed, provide the exact commands to validate: run `yarn build`, then `yarn serve` for manual smoke tests. Include a checklist of pages/outputs to check (home, blog posts, RSS/feed, sitemap, redirects from `siteMetadata.redirects`, analytics snippet)."

7. **Netlify alignment**
   "Context: Deployment is static Gatsby on Netlify. Provide steps to ensure Netlify uses Node 25 (env var `NODE_VERSION` or `.nvmrc`), and confirm build command (`yarn build`) and publish directory. Include how to trigger a deploy preview and rollback to previous deploy if issues arise."

8. **Documentation + follow-ups**
   "Context: Finalize the upgrade. List what to document (new versions, config changes, manual QA notes). Suggest follow-up tasks like adding automated tests or linting. Keep the output concise so it can be pasted as-is."
