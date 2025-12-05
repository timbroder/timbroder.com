# Codex-driven upgrade prompts: Gatsby site to latest deps + Node 25

Each numbered item is a **ready-to-send prompt** for Codex. Every prompt repeats essential context so it can be pasted into a fresh chat. Codex should **perform all commands itself**; you should not run anything manually.

1. **Baseline + context collection**
   "You are upgrading a single-site Gatsby project deployed to Netlify. It uses Yarn with a committed lockfile, Gatsby 5.x, Tailwind/PostCSS, React 18, remark/prism plugins, and analytics/sitemap/feed in `gatsby-config.js`. Target runtime is Node 25. Read `package.json`, `gatsby-config.js`, `gatsby-node.js`, `gatsby-browser.js`, and `gatsby-ssr.js` to inventory dependencies, scripts, and plugin usage. Summarize the current stack, build scripts, and any plugin options that might break on upgrade (sitemap/feed/gtag/remark/sharp). Output only the summary."

2. **Node + tooling setup**
   "Context: Netlify deploys this Gatsby site; runtime target is Node 25. Plan and execute the steps to set Node 25 locally (e.g., create/update `.nvmrc` or Netlify `NODE_VERSION`), confirm Yarn version, and validate the current lockfile by running `yarn install --frozen-lockfile`. Provide and run the necessary commands yourself." 

3. **Dependency audit**
   "Context: Using the inventory, enumerate all direct dependencies/devDependencies with their current versions. Identify major upgrades available (Gatsby core/plugins, React, Tailwind/PostCSS, remark/prism, utilities). Note likely breaking-change areas (GraphQL schema changes, image handling, feed/sitemap APIs, SSR/DSG, Tailwind config). Run any needed commands to confirm versions."

4. **Upgrade execution**
   "Context: Upgrade everything to the latest stable versions compatible with the newest Gatsby release on Node 25. Provide and execute an ordered command list to: (a) update dependency ranges in `package.json` (via `yarn upgrade-interactive --latest` or explicit `yarn add`/`yarn upgrade`), (b) regenerate `yarn.lock` on Node 25, and (c) show the git diff. You should run all commands." 

5. **Config/code adjustments**
   "Context: After upgrades, adjust configs for compatibility. Review `gatsby-config.js`, `gatsby-node.js`, `gatsby-browser.js`, `gatsby-ssr.js`, `tailwind.config.js`, and `postcss.config.js`. Check for common breaking changes (plugin option renames, image/sharp changes, feed/sitemap serialization, remark/prism imports). Make any needed edits and summarize what changed. Include short code snippets if useful." 

6. **Build + validation**
   "Context: With dependencies updated and configs adjusted, run validation commands yourself: `yarn build`, then `yarn serve` for manual smoke tests. Provide a checklist of pages/outputs to verify (home, blog posts, RSS/feed, sitemap, redirects from `siteMetadata.redirects`, analytics snippet). Share results and any fixes applied." 

7. **Netlify alignment**
   "Context: Deployment is static Gatsby on Netlify. Ensure Netlify uses Node 25 via `NODE_VERSION` env var or `.nvmrc`, and confirm build command (`yarn build`) and publish directory. Trigger a deploy preview and describe rollback steps to a previous deploy if issues arise. Run any necessary Netlify CLI commands." 

8. **Documentation + follow-ups**
   "Context: Finalize the upgrade with no manual commands from me. Document new versions, config changes, and manual QA notes. Suggest follow-up tasks like adding automated tests or linting. Keep the output concise so I can paste it directly into docs."
