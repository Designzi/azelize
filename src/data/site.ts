/**
 * Constantes globales du site. Source unique pour le SEO, le footer, etc.
 */
export const site = {
  name: 'Azelize',
  url: 'https://azelize.com',
  // Positionnement issu de la maquette livrée.
  tagline: 'Un site pro, créé et tenu pour vous',
  description:
    "Azelize crée le site et le référencement local des artisans, puis s'en occupe chaque mois. Vous ne payez qu'une fois que le site vous amène des clients.",
  locale: 'fr_FR',
  lang: 'fr',
  // Image Open Graph par défaut — générée au build (src/pages/og/[...route].ts).
  defaultOgImage: '/og/default.png',
  // Coordonnées réelles (alignées sur les mentions légales).
  email: 'bonjour@azelize.com',
  phone: '06 14 74 95 99',
  phoneHref: 'tel:+33614749599',
  // Format international (JSON-LD : Google exige l'indicatif pays).
  phoneInternational: '+33 6 14 74 95 99',
  address: ['103 B rue Léon Blum', '56600 Lanester'],
  // Adresse décomposée pour schema.org PostalAddress (postalCode séparé de la ville).
  postalAddress: {
    streetAddress: '103 B rue Léon Blum',
    postalCode: '56600',
    addressLocality: 'Lanester',
    addressRegion: 'Bretagne',
    addressCountry: 'FR',
  },
} as const;

export type Site = typeof site;
