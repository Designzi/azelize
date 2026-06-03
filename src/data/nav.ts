/** Navigation principale (header) — ancres de la landing. */
export interface NavItem {
  label: string;
  href: string;
}

export const mainNav: NavItem[] = [
  { label: 'Comment ça se passe', href: '/#process' },
  { label: 'La preuve', href: '/#preuve' },
  { label: 'Tarifs', href: '/#prix' },
];

/**
 * CTA unique du site (brief §9 : un seul CTA, répété). Source de vérité —
 * changer `label` ici le propage partout (header, hero, sections, mobile…).
 * `submit` = variante 1ʳᵉ personne pour le bouton du formulaire.
 */
export const navCta = {
  label: 'Réserver un appel gratuit',
  submit: 'Réserver mon appel gratuit',
  href: '/#contact',
} as const;
