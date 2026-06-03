import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const prestations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/prestations' }),
  schema: z.object({
    titre: z.string(),
    resume: z.string(),
    ordre: z.number().optional(),
  }),
});

const realisations = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/realisations' }),
  schema: z.object({
    client: z.string(),
    resume: z.string(),
    date: z.coerce.date(),
    couverture: z.string().optional(),
    resultats: z.array(z.string()).optional(),
  }),
});

const blog = defineCollection({
  loader: glob({ pattern: '**/*.mdx', base: './src/content/blog' }),
  schema: z.object({
    titre: z.string(),
    description: z.string(),
    date: z.coerce.date(),
    brouillon: z.boolean().default(false),
  }),
});

export const collections = { prestations, realisations, blog };
