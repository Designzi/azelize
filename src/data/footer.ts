/**
 * Contenu du footer (source unique consommée par Footer.astro).
 * Les coordonnées vivent dans data/site.ts. Ajouter ici de nouvelles colonnes
 * de navigation (Prestations, Studio…) quand le site grandit.
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
    title: 'Informations',
    links: [
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Confidentialité', href: '/confidentialite' },
    ],
  },
];

export const footerBaseline = 'Devis gratuit · Réponse sous 48 h';
