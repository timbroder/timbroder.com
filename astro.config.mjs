// @ts-check
import { defineConfig } from 'astro/config';
import { satteri } from '@astrojs/markdown-satteri';
import tailwindcss from '@tailwindcss/vite';
import astrobook from 'astrobook';

// https://astro.build/config
export default defineConfig({
  site: 'https://timbroder.com',
  trailingSlash: 'always',
  markdown: {
    // The Gatsby site did not convert quotes or dashes, so neither does this.
    processor: satteri({ features: { smartPunctuation: false } }),
  },
  integrations: [
    // The component library, public at /astrobook/.
    // ASTROBOOK=off leaves it out of a build if it ever blocks a deploy.
    ...(process.env.ASTROBOOK === 'off'
      ? []
      : [
          astrobook({
            subpath: '/astrobook',
            directory: 'src/components',
            css: ['./src/styles/global.css'],
            title: 'timbroder.com components',
          }),
        ]),
  ],
  vite: { plugins: [tailwindcss()] },
});
