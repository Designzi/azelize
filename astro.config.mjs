import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

/**
 * <lastmod> honnête : date du dernier commit git touchant les sources de la
 * route (règle Google : lastmod doit refléter des mises à jour réelles, pas la
 * date de build). Route sans source identifiable → pas de lastmod du tout.
 */
function gitLastmod(paths) {
  const existing = paths.filter((p) => existsSync(p));
  if (!existing.length) return undefined;
  try {
    const out = execSync(`git log -1 --format=%cI -- ${existing.map((p) => `"${p}"`).join(' ')}`, {
      encoding: 'utf8',
    }).trim();
    return out || undefined;
  } catch {
    return undefined;
  }
}

/** Sources plausibles d'une route (page, vue, contenu) — les inexistantes sont filtrées. */
function routeSources(pathname) {
  const segs = pathname
    .replace(/^\/+|\/+$/g, '')
    .split('/')
    .filter(Boolean);
  if (segs.length === 0) return ['src/pages/index.astro', 'src/sections/home', 'src/data/site.ts'];
  const [a, b] = segs;
  if (!b) {
    return [
      `src/pages/${a}.astro`,
      `src/pages/${a}/index.astro`,
      `src/views/hubs/${a}.astro`,
      `src/views/villes/${a}.astro`,
    ];
  }
  return [
    `src/content/${a}/${b}.mdx`,
    `src/views/${a}/${b}.astro`,
    // métiers : routés sous /creation-site-internet/<metier> ([service]/[metier].astro)
    `src/content/metiers/${b}.mdx`,
    `src/views/metiers/${b}.astro`,
  ];
}

// https://astro.build/config
export default defineConfig({
  site: 'https://azelize.com', // requis pour le sitemap + URLs canoniques
  // Migration des anciennes pages métier (/site-internet/*) vers l'architecture
  // en couches (/creation-site-internet/*). Redirections statiques générées au build
  // (pages meta-refresh = filet de secours) ; les VRAIS 301 sont servis par Vercel —
  // garder vercel.json synchronisé avec cette liste.
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
        ![
          '/mentions-legales',
          '/confidentialite',
          '/merci',
          // Pages noindex (pas encore prêtes au SEO) — synchronisé avec la prop
          // `noindex` posée sur ces pages / entrées de collection.
          '/avis',
          '/blog', // index + /blog/bonjour-azelize (placeholder)
          '/prestations', // index + /prestations/sites-et-landing (placeholder)
          '/realisations/global-cars', // visuels manquants
        ].some((p) => page.includes(p)),
      // lastmod : dernier commit git des sources de la route (jamais la date de
      // build — Google ignore les lastmod non fiables). Sans source → omis.
      serialize: (item) => {
        const lastmod = gitLastmod(routeSources(new URL(item.url).pathname));
        return lastmod ? { ...item, lastmod } : item;
      },
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
