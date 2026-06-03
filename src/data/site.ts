/**
 * Constantes globales du site. Source unique pour le SEO, le footer, etc.
 */
export const site = {
  name: 'Azelize',
  url: 'https://azelize.com',
  // Positionnement issu de la maquette livrée.
  tagline: 'Un site pro, créé et tenu pour vous',
  description:
    "Azelize crée le site et le référencement local des artisans, puis s'en occupe chaque mois. Vous ne payez l'abonnement qu'une fois que le site vous amène des clients.",
  locale: 'fr_FR',
  lang: 'fr',
  // Image Open Graph par défaut (à fournir dans public/og/)
  defaultOgImage: '/og/default.png',
  // ⚠️ Coordonnées provisoires (cf. maquette) — à confirmer.
  email: 'bonjour@azelize.fr',
} as const;

export type Site = typeof site;
