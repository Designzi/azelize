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
    '/site-internet/macon': '/creation-site-internet/macon',
    // Métiers retirés (hors maquette Design) : legacy → hub, jamais vers un 404.
    '/site-internet/paysagiste': '/creation-site-internet',
    '/site-internet/menuisier': '/creation-site-internet',
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
