// @ts-check
import { rename } from 'node:fs/promises';
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import astrobook from 'astrobook';
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
