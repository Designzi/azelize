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

export const collections = { prestations, realisations, blog };
