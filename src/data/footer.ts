/**
 * Contenu du footer (source unique consommée par Footer.astro).
 * Les coordonnées vivent dans data/site.ts. Liens fidèles à la maquette Design.
 */
export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export const footerColumns: FooterColumn[] = [
  {
    title: 'Services',
    links: [
      { label: 'Création de site', href: '/creation-site-internet' },
      { label: 'Référencement local', href: '/referencement-seo' },
      { label: 'Templates Canva', href: '/templates-canva' },
      { label: 'Identité visuelle', href: '/identite-visuelle' },
      { label: 'SaaS & outils', href: '/saas-outils' },
      { label: 'Automatisations', href: '/automatisations' },
    ],
  },
  {
    title: 'Le studio',
    links: [
      { label: 'À propos', href: '/a-propos' },
      { label: 'Réalisations', href: '/realisations' },
      { label: 'Tarifs', href: '/tarifs' },
      { label: 'Avis clients', href: '/avis' },
      { label: 'Vos 30 jours', href: '/vos-30-premiers-jours' },
    ],
  },
  {
    title: 'Ressources',
    links: [
      { label: 'Tous les guides', href: '/guides' },
      { label: 'Le prix d’un site', href: '/guides/combien-coute-site-internet' },
      { label: 'Bien choisir', href: '/guides/bien-choisir-prestataire-web' },
      { label: 'Invisible sur Google', href: '/guides/invisible-sur-google' },
      { label: 'Glossaire', href: '/glossaire' },
      { label: 'FAQ', href: '/faq' },
    ],
  },
];

/** Liens légaux (barre basse du footer). */
export const legalLinks: FooterLink[] = [
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
  { label: 'CGV', href: '/cgv' },
  { label: 'Cookies', href: '/cookies' },
];

export const footerZone = 'Lanester · Lorient · Vannes · Morbihan';
export const footerBlurb =
  'Le studio digital pensé pour les artisans et les TPE. Créé et tenu — vous gardez votre métier.';
export const footerBaseline = '© 2026 Azelize — Tous droits réservés';
