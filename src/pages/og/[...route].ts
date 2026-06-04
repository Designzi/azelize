/**
 * Génération build-time des images Open Graph (1200×630) — une par page clé.
 *
 * Inspiré du `/og` dynamique de far (resinefar.fr), transposé au statique : ici
 * astro-og-canvas pré-rend des PNG au build (aucun adapter SSR requis). Chaque
 * image reprend le titre + résumé de sa page, sur fond Menthe profond de la marque.
 * Servies à `/og/<clé>.png` ; les pages réfèrent ce chemin via `lib/og.ts`.
 */
import { OGImageRoute } from 'astro-og-canvas';
import { getCollection } from 'astro:content';
import { site } from '@data/site';
import { SERVICES, SERVICE_AVEC_METIERS } from '@data/seo-architecture';

interface OgPage {
  title: string;
  description: string;
}

const [metiers, prestations, realisations, blog, guides] = await Promise.all([
  getCollection('metiers'),
  getCollection('prestations'),
  getCollection('realisations'),
  getCollection('blog'),
  getCollection('guides'),
]);

const pages: Record<string, OgPage> = {
  // Fallback du site (cf. site.defaultOgImage = '/og/default.png').
  default: { title: site.name, description: site.tagline },
  home: { title: site.tagline, description: site.description },
};

// Hubs de service (couche 1).
for (const s of SERVICES.filter((s) => s.statut === 'ship')) {
  pages[s.slug] = { title: s.nom, description: s.resume };
}
// Pages métier (couche 3, sous le service création de site).
for (const m of metiers) {
  pages[`${SERVICE_AVEC_METIERS}/${m.id}`] = { title: m.data.titre, description: m.data.resume };
}
for (const p of prestations) {
  pages[`prestations/${p.id}`] = { title: p.data.titre, description: p.data.resume };
}
for (const r of realisations) {
  pages[`realisations/${r.id}`] = { title: r.data.client, description: r.data.resume };
}
for (const b of blog.filter((a) => !a.data.brouillon)) {
  pages[`blog/${b.id}`] = { title: b.data.titre, description: b.data.description };
}
for (const g of guides) {
  pages[`guides/${g.id}`] = { title: g.data.titre, description: g.data.description };
}

export const { getStaticPaths, GET } = await OGImageRoute({
  param: 'route',
  pages,
  getImageOptions: (_path, page: OgPage) => ({
    title: page.title,
    description: page.description,
    // Marque Menthe : dégradé profond #001040 → #002080, liseré #0040FF.
    bgGradient: [
      [0, 16, 64],
      [0, 32, 128],
    ],
    border: { color: [0, 64, 255], width: 24, side: 'block-end' },
    padding: 80,
    font: {
      title: {
        color: [255, 255, 255],
        size: 76,
        weight: 'ExtraBold',
        lineHeight: 1.1,
        families: ['Bricolage Grotesque'],
      },
      description: {
        color: [191, 207, 255], // brand-soft #BFCFFF
        size: 34,
        weight: 'Normal',
        lineHeight: 1.4,
        families: ['Hanken Grotesk'],
      },
    },
    fonts: [
      'https://cdn.jsdelivr.net/fontsource/fonts/bricolage-grotesque@latest/latin-800-normal.ttf',
      'https://cdn.jsdelivr.net/fontsource/fonts/hanken-grotesk@latest/latin-400-normal.ttf',
    ],
  }),
});
