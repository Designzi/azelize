/**
 * Tarifs — SOURCE DE PRIX UNIQUE (consommée par la landing `home/Pricing.astro`
 * et la page `/tarifs`). Évite toute double-saisie des montants.
 * ⚠️ Prix indicatifs — à confirmer.
 */
export const PRICE_UNIT = '€ / mois';

export interface Tier {
  name: string;
  price: number;
  unit: string;
  line: string;
  feats: string[];
  featured?: boolean;
  /** Première feature rendue comme libellé de report (« Tout X, plus : »). */
  rolloverFirst?: boolean;
}

export const tiers: Tier[] = [
  {
    name: 'Présence',
    price: 390,
    unit: PRICE_UNIT,
    line: 'Site pro + fiche Google + entretien mensuel.',
    feats: [
      'Site vitrine sur-mesure',
      'Fiche Google optimisée',
      'Hébergement, sécurité & mises à jour',
      'Suivi mensuel',
    ],
  },
  {
    name: 'Visibilité',
    price: 590,
    unit: PRICE_UNIT,
    featured: true,
    rolloverFirst: true,
    line: 'Tout Présence + référencement local actif + contenus mensuels + rapport.',
    feats: [
      'Tout Présence, plus :',
      'Référencement local actif',
      'Contenus publiés chaque mois',
      'Gestion des avis Google',
      'Rapport mensuel clair',
    ],
  },
  {
    name: 'Croissance',
    price: 890,
    unit: PRICE_UNIT,
    rolloverFirst: true,
    line: 'Tout Visibilité + campagnes + supports (vidéo, print) + priorité.',
    feats: [
      'Tout Visibilité, plus :',
      'Campagnes (Google, réseaux)',
      'Supports vidéo & print',
      'Traitement prioritaire',
    ],
  },
];

/** Comparatif détaillé (page /tarifs) — un booléen par palier, dans l'ordre de `tiers`. */
export interface CompareRow {
  label: string;
  has: [boolean, boolean, boolean];
}

export const compareRows: CompareRow[] = [
  { label: 'Site sur-mesure', has: [true, true, true] },
  { label: 'Fiche Google optimisée', has: [true, true, true] },
  { label: 'Hébergement & sécurité', has: [true, true, true] },
  { label: 'Référencement local actif', has: [false, true, true] },
  { label: 'Contenus mensuels', has: [false, true, true] },
  { label: 'Gestion des avis', has: [false, true, true] },
  { label: 'Rapport mensuel', has: [false, true, true] },
  { label: 'Campagnes Google & réseaux', has: [false, false, true] },
  { label: 'Supports vidéo & print', has: [false, false, true] },
  { label: 'Traitement prioritaire', has: [false, false, true] },
];
