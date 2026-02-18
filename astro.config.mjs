import { defineConfig } from 'astro/config'
import tailwindcss from '@tailwindcss/vite'
import sitemap from '@astrojs/sitemap'

export default defineConfig({
  site: 'https://timbroder.com',
  trailingSlash: 'always',
  vite: { plugins: [tailwindcss()] },
  integrations: [sitemap()],
  markdown: {
    shikiConfig: { theme: 'monokai', wrap: true }
  },
  redirects: {
    '/feed': '/feed.xml'
  }
})
