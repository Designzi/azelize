import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';
import { sectionSchema } from './lib/sections';

/**
 * Champs communs à toutes les collections (override SEO par entrée, date de
 * mise à jour, tags, et sections composables). Optionnels → rétro-compatible.
 */
const base = z.object({
  seo: z
    .object({
      title: z.string().optional(),
      description: z.string().optional(),
      ogImage: z.string().optional(),
    })
    .optional(),
  updated: z.coerce.date().optional(),
  tags: z.array(z.string()).optional(),
  sections: z.array(sectionSchema).optional(),
});

const prestations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/prestations' }),
  schema: base.extend({
    titre: z.string(),
    resume: z.string(),
    ordre: z.number().optional(),
  }),
});

const realisations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/realisations' }),
  schema: base.extend({
    client: z.string(),
    resume: z.string(),
    date: z.coerce.date(),
    couverture: z.string().optional(),
    resultats: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: base.extend({
    titre: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    brouillon: z.boolean().default(false),
  }),
});

/**
 * Pages SEO « métier » (intention d'achat « site internet pour [métier] »).
 * Cible : l'artisan qui cherche qui va lui faire son site — PAS le SEO local
 * géographique (doorway pour un produit vendu partout en France). Chaque entrée
 * porte un contenu UNIQUE par métier (problèmes, besoins, FAQ propres au métier)
 * via `sections` → évite le contenu dupliqué / doorway.
 */
const metiers = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/metiers' }),
  schema: base.extend({
    metier: z.string(), // nom du métier au singulier, ex. « plombier » (titres + JSON-LD)
    titre: z.string(), // titre éditorial, ex. « Site internet pour plombier »
    resume: z.string(),
    ordre: z.number().optional(),
  }),
});

/**
 * Guides pratiques (contenu éditorial long, intention informationnelle « comment
 * faire X »). Calqué sur `blog`/`metiers` : `titre`/`description` pilotent le SEO
 * et l'OG, `resume` sert l'accroche éditoriale (header, listes). Sections
 * composables optionnelles via `base`.
 */
const guides = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/guides' }),
  schema: base.extend({
    titre: z.string(),
    description: z.string(),
    date: z.coerce.date().optional(),
    resume: z.string(),
    ordre: z.number().optional(),
  }),
});

export const collections = { prestations, realisations, blog, metiers, guides };
