/**
 * Accent de section — réconcilié sur la marque unique (Ocean Twilight, Q1).
 *
 * Le site Design est MONOCHROME : tous les accents pointent désormais vers
 * `brand`. Le type `Accent` (héritage du système fruit) est conservé pour la
 * compat des props/schéma ; l'élagage complet des tokens fruit viendra ensuite.
 *
 * Tailwind v4 ne génère un utilitaire que s'il voit la classe en toutes lettres :
 * les littéraux `text-brand` / `bg-brand` / `border-brand` / `bg-brand-soft` ci-
 * dessous suffisent à les conserver au build.
 */
export type Accent = 'menthe' | 'fraise' | 'miel' | 'citron' | 'kiwi';

const all = (cls: string): Record<Accent, string> => ({
  menthe: cls,
  fraise: cls,
  miel: cls,
  citron: cls,
  kiwi: cls,
});

/** Texte de signal / eyebrow / chiffres. */
export const accentText = all('text-brand');

/** Aplat profond pour petits accents (puces, pastilles). */
export const accentBg = all('bg-brand');

/** Filet / bordure d'accent (haut de carte, première étape). */
export const accentBorder = all('border-brand');

/** Fond très clair pour envelopper une carte/zone. */
export const accentSoftBg = all('bg-brand-soft');
