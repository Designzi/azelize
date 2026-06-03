import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://azelize.com', // requis pour le sitemap + URLs canoniques
  integrations: [
    mdx(),
    sitemap({
      // Exclure les pages noindex (cohérent avec la balise robots).
      filter: (page) =>
        !page.includes('/mentions-legales') && !page.includes('/confidentialite'),
    }),
  ],
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
