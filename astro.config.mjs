import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  site: 'https://azelize.com', // requis pour le sitemap + URLs canoniques
  // Migration des anciennes pages métier (/site-internet/*) vers l'architecture
  // en couches (/creation-site-internet/*). Redirections statiques générées au build.
  redirects: {
    '/site-internet': '/creation-site-internet',
    '/site-internet/plombier': '/creation-site-internet/plombier',
    '/site-internet/electricien': '/creation-site-internet/electricien',
    '/site-internet/paysagiste': '/creation-site-internet/paysagiste',
    '/site-internet/menuisier': '/creation-site-internet/menuisier',
    '/site-internet/macon': '/creation-site-internet/macon',
  },
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
