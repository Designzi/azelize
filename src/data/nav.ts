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

/** CTA principal du header. */
export const navCta: NavItem = { label: 'Prendre rendez-vous', href: '/#contact' };
