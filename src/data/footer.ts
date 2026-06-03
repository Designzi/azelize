/** Colonnes du footer. */
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
    title: 'Prestations',
    links: [
      { label: 'Sites & landing', href: '/prestations' },
      { label: 'Identité de marque', href: '/prestations' },
      { label: 'Outils sur mesure', href: '/prestations' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { label: 'À propos', href: '/a-propos' },
      { label: 'Réalisations', href: '/realisations' },
      { label: 'Blog', href: '/blog' },
      { label: 'Contact', href: '/contact' },
    ],
  },
  {
    title: 'Légal',
    links: [
      { label: 'Mentions légales', href: '/mentions-legales' },
      { label: 'Confidentialité', href: '/confidentialite' },
    ],
  },
];
