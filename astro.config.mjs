// @ts-check
import { readFile, rename } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import astrobook from 'astrobook';
import * as pagefind from 'pagefind';
import { codeTheme } from './src/lib/code-theme.ts';

/**
 * Netlify reads redirects from a file called `_redirects`. Astro will not
 * build a route whose name starts with "_", so the file is built as
 * redirects.txt (src/pages/redirects.txt.ts) and renamed here.
 *
 * @returns {import('astro').AstroIntegration}
 */
function netlifyRedirects() {
  return {
    name: 'netlify-redirects',
    hooks: {
      'astro:build:done': async ({ dir }) => {
        await rename(new URL('redirects.txt', dir), new URL('_redirects', dir));
      },
    },
  };
}

/**
 * The search index. Pagefind reads the built pages and writes its index
 * into pagefind/, which the search page loads in the browser. It takes only
 * the pages marked with data-pagefind-body, which are the posts.
 *
 * It runs as part of the build, not as a second command, so every build has
 * an index: Netlify's, which is the one with the Contentful posts, and the
 * build with the sample posts.
 *
 * @returns {import('astro').AstroIntegration}
 */
function searchIndex() {
  return {
    name: 'search-index',
    hooks: {
      'astro:build:done': async ({ dir, logger }) => {
        const { index, errors } = await pagefind.createIndex();
        if (!index) throw new Error(`Pagefind did not start: ${errors.join('; ')}`);
        const read = await index.addDirectory({ path: fileURLToPath(dir) });
        const written = await index.writeFiles({
          outputPath: fileURLToPath(new URL('pagefind/', dir)),
        });
        await pagefind.close();
        const problems = [...errors, ...read.errors, ...written.errors];
        if (problems.length > 0) {
          throw new Error(`The search index was not built: ${problems.join('; ')}`);
        }
        // Pagefind's own account of what it kept, which the tests read too.
        const entry = JSON.parse(await readFile(new URL('pagefind/pagefind-entry.json', dir), 'utf8'));
        const posts = Object.values(entry.languages).reduce((sum, { page_count }) => sum + page_count, 0);
        logger.info(`${posts} posts can be searched.`);
      },
    },
  };
}

// https://astro.build/config
export default defineConfig({
  site: 'https://timbroder.com',
  trailingSlash: 'always',
  markdown: {
    // The Gatsby site did not convert quotes or dashes, so neither does this.
    processor: satteri({ features: { smartPunctuation: false } }),
    // Monokai with a few colours lightened; see src/lib/code-theme.ts.
    shikiConfig: { theme: codeTheme },
  },
  integrations: [
    // sitemap-index.xml and sitemap-0.xml, the same names the Gatsby site used.
    sitemap({ filter: (page) => !page.includes('/astrobook/') }),
    netlifyRedirects(),
    searchIndex(),
    // The component library, public at /astrobook/.
    // ASTROBOOK=off leaves it out of a build if it ever blocks a deploy.
    ...(process.env.ASTROBOOK === 'off'
      ? []
      : [
          astrobook({
            subpath: '/astrobook',
            directory: 'src/components',
            css: ['./src/styles/global.css'],
            // Keeps the component library out of search results.
            head: './src/components/AstrobookHead.astro',
            title: 'timbroder.com components',
          }),
        ]),
  ],
  vite: { plugins: [tailwindcss()] },
});
