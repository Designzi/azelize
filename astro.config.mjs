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
      // À garder synchronisé avec les pages qui posent <meta robots="noindex">.
      filter: (page) =>
        !['/mentions-legales', '/confidentialite', '/merci'].some((p) => page.includes(p)),
      // lastmod : à défaut d'une date par page (site statique éditorial),
      // on prend la date du build — signale au moins la fraîcheur de l'ensemble.
      serialize: (item) => ({ ...item, lastmod: new Date().toISOString() }),
    }),
  ],
  // Précharge les liens internes au survol : transitions quasi instantanées,
  // coût quasi nul sur un site statique.
  prefetch: { prefetchAll: true },
  vite: {
    plugins: [tailwindcss()],
  },
  build: {
    inlineStylesheets: 'auto',
  },
});
