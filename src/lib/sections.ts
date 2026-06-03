import { z } from 'astro:content';

/**
 * Sections composables (couche 4 pilotée par le contenu).
 *
 * Une entrée de collection déclare `sections: [...]` : une union discriminée par
 * `type`, où chaque variante correspond aux props d'un bloc (couche 3). Le
 * renderer `components/blocks/Blocks.astro` mappe `type → bloc`. C'est ce qui
 * permet « 100 prestations = 1 page paramétrée » sans dupliquer de structure.
 */

const accent = z.enum(['menthe', 'fraise', 'miel', 'citron', 'kiwi']).optional();
const tone = z
  .enum(['paper', 'parchment', 'dark', 'brand-soft', 'fraise', 'miel', 'citron', 'kiwi'])
  .optional();

/** Champs d'en-tête communs aux sections (hors hero). */
const head = {
  eyebrow: z.string().optional(),
  title: z.string().optional(),
  intro: z.string().optional(),
  accent,
  tone,
};

export const sectionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('hero'),
    eyebrow: z.string().optional(),
    title: z.string(),
    lead: z.string().optional(),
    accent,
  }),
  z.object({
    ...head,
    type: z.literal('grid'),
    cols: z.union([z.literal(2), z.literal(3), z.literal(4)]).optional(),
    items: z.array(z.object({ title: z.string(), body: z.string() })),
  }),
  z.object({
    ...head,
    type: z.literal('includes'),
    items: z.array(z.string()),
    note: z.string().optional(),
  }),
  z.object({
    ...head,
    type: z.literal('stats'),
    stats: z.array(z.object({ n: z.string(), label: z.string(), sub: z.string().optional() })),
  }),
  z.object({
    ...head,
    type: z.literal('timeline'),
    steps: z.array(z.object({ num: z.string(), title: z.string(), body: z.string() })),
  }),
  z.object({
    ...head,
    type: z.literal('compare'),
    bad: z.object({ title: z.string(), items: z.array(z.string()) }),
    good: z.object({ title: z.string(), items: z.array(z.string()) }),
    close: z.string().optional(),
  }),
  z.object({
    ...head,
    type: z.literal('pricing'),
    ctaHref: z.string().optional(),
    engagementNote: z.string().optional(),
    featuredLabel: z.string().optional(),
    tiers: z.array(
      z.object({
        name: z.string(),
        line: z.string(),
        price: z.union([z.string(), z.number()]),
        unit: z.string().optional(),
        feats: z.array(z.string()),
        featured: z.boolean().optional(),
        rolloverFirst: z.boolean().optional(),
      }),
    ),
  }),
  z.object({
    ...head,
    type: z.literal('faq'),
    items: z.array(z.object({ q: z.string(), a: z.string() })),
  }),
]);

export type SectionData = z.infer<typeof sectionSchema>;
