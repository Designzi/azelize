/**
 * Atmosphère de section (« stations du verger » — cf. brief §8).
 *
 * Menthe = marque/action (constante). Les fruits = teinte d'ambiance d'une
 * section : eyebrow, filets, puces, détails. Les tons profonds (S100·B50) sont
 * lisibles sur blanc → signal/texte ; les tons clairs (S25·B100) → fonds doux.
 *
 * Tailwind v4 ne génère un utilitaire que s'il voit la classe en TOUTES LETTRES.
 * On garde donc ici des chaînes littérales (pas de `text-${x}`), une seule fois.
 */
export type Accent = 'menthe' | 'fraise' | 'miel' | 'citron' | 'kiwi';

/** Texte de signal / eyebrow / chiffres — ton profond lisible sur blanc. */
export const accentText: Record<Accent, string> = {
  menthe: 'text-brand',
  fraise: 'text-fraise-s100-b50',
  miel: 'text-miel-s100-b50',
  citron: 'text-citron-s100-b50',
  kiwi: 'text-kiwi-s100-b50',
};

/** Aplat profond pour petits accents (puces, pastilles). */
export const accentBg: Record<Accent, string> = {
  menthe: 'bg-brand',
  fraise: 'bg-fraise-s100-b50',
  miel: 'bg-miel-s100-b50',
  citron: 'bg-citron-s100-b50',
  kiwi: 'bg-kiwi-s100-b50',
};

/** Filet / bordure d'accent (haut de carte, première étape). */
export const accentBorder: Record<Accent, string> = {
  menthe: 'border-brand',
  fraise: 'border-fraise-s100-b50',
  miel: 'border-miel-s100-b50',
  citron: 'border-citron-s100-b50',
  kiwi: 'border-kiwi-s100-b50',
};

/** Fond très clair pour envelopper une carte/zone (ton clair S25·B100). */
export const accentSoftBg: Record<Accent, string> = {
  menthe: 'bg-brand-soft',
  fraise: 'bg-fraise-s25-b100',
  miel: 'bg-miel-s25-b100',
  citron: 'bg-citron-s25-b100',
  kiwi: 'bg-kiwi-s25-b100',
};
