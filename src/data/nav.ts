/** Navigation du chrome (header + footer + tiroir mobile). Source unique. */
export interface NavItem {
  label: string;
  href: string;
}

/** Landing — ancres one-page (utilisées sur '/'). */
export const mainNav: NavItem[] = [
  { label: 'Comment ça se passe', href: '/#process' },
  { label: 'La preuve', href: '/#preuve' },
  { label: 'Tarifs', href: '/#prix' },
];

/**
 * CTA de conversion (sections de la landing). Source de vérité —
 * `submit` = variante 1ʳᵉ personne pour le bouton du formulaire.
 */
export const navCta = {
  label: 'Réserver un appel gratuit',
  submit: 'Réserver mon appel gratuit',
  href: '/#contact',
} as const;

/** CTA du chrome (header, tiroir, footer) — vers la page contact. */
export const chromeCta = { label: 'Prendre rendez-vous', href: '/contact' } as const;

/** Liens primaires du header (à droite du méga-menu Services). */
export const primaryNav: NavItem[] = [
  { label: 'Réalisations', href: '/realisations' },
  { label: 'Tarifs', href: '/tarifs' },
  { label: 'Guides', href: '/guides' },
];

/** Icônes du méga-menu (le tracé SVG vit dans Header.astro). */
export type IconName =
  | 'site'
  | 'seo'
  | 'brand'
  | 'print'
  | 'truck'
  | 'mail'
  | 'layers'
  | 'book'
  | 'video'
  | 'grid'
  | 'bolt';

export interface ServiceLink {
  icon: IconName;
  label: string;
  desc: string;
  href: string;
  badge?: string;
}
export interface ServiceGroup {
  title: string;
  items: ServiceLink[];
}

/** Méga-menu Services — 4 groupes (fidèle à la maquette Design). */
export const serviceGroups: ServiceGroup[] = [
  {
    title: 'Présence en ligne',
    items: [
      { icon: 'site', label: 'Création de site', desc: 'Sites pro pour artisans', href: '/creation-site-internet' },
      { icon: 'seo', label: 'Référencement local', desc: 'Être trouvé sur Google', href: '/referencement-seo' },
    ],
  },
  {
    title: 'Image de marque',
    items: [
      { icon: 'brand', label: 'Identité visuelle', desc: 'Logo, charte, univers', href: '/identite-visuelle' },
      { icon: 'print', label: 'Supports imprimés', desc: 'Cartes, flyers, panneaux', href: '/supports-print' },
      { icon: 'truck', label: 'Habillage véhicule', desc: 'Covering & lettrage', href: '/habillage-vehicule-covering' },
      { icon: 'mail', label: 'Templates e-mail', desc: 'Signatures & modèles', href: '/templates-email' },
    ],
  },
  {
    title: 'Contenu & templates',
    items: [
      { icon: 'layers', label: 'Templates Canva', desc: '6M+ téléchargements', href: '/templates-canva', badge: 'Leader' },
      { icon: 'book', label: 'Catalogues produit', desc: 'Imprimé, PDF, web', href: '/catalogues-produit' },
      { icon: 'video', label: 'Production vidéo', desc: 'Chantiers & savoir-faire', href: '/production-video' },
    ],
  },
  {
    title: 'Outils sur-mesure',
    items: [
      { icon: 'grid', label: 'SaaS & outils', desc: 'Logiciels métier, espaces clients', href: '/saas-outils' },
      { icon: 'bolt', label: 'Automatisations', desc: 'Gagnez du temps', href: '/automatisations' },
    ],
  },
];

/** Liens secondaires (grille basse du tiroir mobile). */
export const secondaryNav: NavItem[] = [
  { label: 'À propos', href: '/a-propos' },
  { label: 'Avis clients', href: '/avis' },
  { label: 'FAQ', href: '/faq' },
  { label: 'Contact', href: '/contact' },
  { label: 'Mentions légales', href: '/mentions-legales' },
  { label: 'Confidentialité', href: '/confidentialite' },
];
