/**
 * Registre SEO — SOURCE DE VÉRITÉ UNIQUE de l'architecture en couches (Partie B).
 *
 * Encode toute la matrice (services × villes × métiers) avec un STATUT par cellule.
 * Règle d'or anti-doorway : seules les pages `ship` sont générées, indexées et au
 * sitemap. `conditionnel` = en attente d'un contenu réel (cas client / FAQ locale)
 * → non buildées (donc absentes du sitemap, jamais doorway). `exclu` = jamais créées.
 *
 * Transposé du `seo-config.ts` de far (resinefar.fr) : la curation pilote le build.
 *
 * ⚠️ Ne JAMAIS faire passer une cellule à `ship` sans contenu unique réel
 * (≥1 cas local OU FAQ métier distincte) — cf. Axe 1 (doorway) de la Revue d'état.
 */
import type { SectionData } from '@lib/sections';

export type Statut = 'ship' | 'conditionnel' | 'exclu';

// ── Couche 1 : SERVICES ──────────────────────────────────────────────────────

export interface Service {
  slug: string;
  nom: string; // libellé affiché, ex. « Création de site internet »
  court: string; // libellé court (nav, fil d'Ariane), ex. « Création de site »
  resume: string; // meta description / résumé hub
  statut: Statut;
  /** Le service ouvre-t-il une matrice ville / métier (couches 2–4) ? */
  matrice: { ville: boolean; metier: boolean };
  /** Contenu éditorial du hub (blocs composés, rendus par Blocks.astro). */
  hub: SectionData[];
}

export const SERVICES: Service[] = [
  {
    slug: 'creation-site-internet',
    nom: 'Création de site internet',
    court: 'Création de site',
    resume:
      'Un site professionnel créé, référencé et tenu pour vous chaque mois. Pensé pour les artisans : rapide, clair, taillé pour amener des clients.',
    statut: 'ship',
    matrice: { ville: true, metier: true },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Création de site internet',
        title: 'Un site professionnel, créé et tenu pour vous.',
        lead: "Vous ne payez l'abonnement qu'une fois que le site vous amène des clients. On crée, on référence, on entretient — vous gardez votre métier.",
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'kiwi',
        items: [
          'Un site clair, rapide et fidèle à votre métier',
          'Référencement local soigné dès la mise en ligne',
          'Demande de devis et appel en évidence',
          'Suivi et mises à jour chaque mois',
        ],
        note: 'Sans engagement — vous arrêtez quand vous voulez.',
      },
      {
        type: 'timeline',
        eyebrow: 'La méthode',
        title: 'Comment on travaille',
        accent: 'miel',
        steps: [
          { num: '1', title: 'On cadre', body: 'Votre métier, vos clients, vos zones — en un appel de 15 minutes.' },
          { num: '2', title: 'On construit', body: 'Site en ligne en deux semaines environ, avec du contenu réel.' },
          { num: '3', title: 'On entretient', body: 'On suit, on ajuste, on fait évoluer — chaque mois.' },
        ],
      },
    ],
  },
  {
    slug: 'referencement-seo',
    nom: 'Référencement SEO local',
    court: 'Référencement SEO',
    resume:
      'Être trouvé sur Google quand un client cherche votre métier près de chez lui. Référencement local suivi et entretenu mois après mois.',
    statut: 'ship',
    matrice: { ville: true, metier: true },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Référencement SEO local',
        title: 'Être trouvé au moment où le client cherche.',
        lead: '81 % des clients cherchent sur Google avant d’appeler un artisan. Si vous n’êtes pas dans les premiers, vous perdez l’appel. On vous y met, et on vous y tient.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce qu’on met en place',
        accent: 'menthe',
        items: [
          'Référencement sur vos villes et vos prestations',
          'Fiche Google et avis travaillés',
          'Contenu local utile, jamais des pages creuses',
          'Suivi des positions et ajustements mensuels',
        ],
        note: 'Le SEO se gagne dans la durée — d’où le suivi mensuel.',
      },
    ],
  },
  {
    slug: 'identite-visuelle',
    nom: 'Identité visuelle',
    court: 'Identité visuelle',
    resume:
      'Logo, couleurs, typographies : une identité cohérente qui inspire confiance, sur votre site comme sur vos supports.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Identité visuelle',
        title: 'Une image pro, cohérente partout.',
        lead: 'Un logo et une charte clairs, déclinés sur votre site, vos devis et vos véhicules. La confiance commence par l’apparence.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'citron',
        items: [
          'Logo et déclinaisons (couleur, monochrome, favicon)',
          'Charte : couleurs, typographies, usages',
          'Cohérence avec votre site et vos supports',
          'Fichiers sources livrés',
        ],
      },
    ],
  },
  {
    slug: 'habillage-vehicule-covering',
    nom: 'Habillage véhicule & covering',
    court: 'Covering',
    resume:
      'Votre véhicule devient une publicité roulante : marquage et covering cohérents avec votre identité.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Habillage véhicule & covering',
        title: 'Votre camion travaille pour vous, même à l’arrêt.',
        lead: 'Marquage, covering, lettrage : un véhicule habillé, c’est des centaines de clients croisés chaque jour, dans votre identité.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'fraise',
        items: [
          'Conception cohérente avec votre identité',
          'Marquage partiel ou covering total',
          'Coordonnées et services bien lisibles',
          'Pose soignée et durable',
        ],
      },
    ],
  },
  {
    slug: 'production-video',
    nom: 'Production vidéo',
    court: 'Vidéo',
    resume:
      'Une vidéo courte qui montre votre travail et inspire confiance — pour votre site, Google et les réseaux.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Production vidéo',
        title: 'Montrer vaut mieux que raconter.',
        lead: 'Une vidéo de présentation ou de chantier, courte et nette, qui rassure le client avant même l’appel.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'kiwi',
        items: [
          'Vidéo de présentation ou de chantier',
          'Format adapté site, Google et réseaux',
          'Montage soigné, durée maîtrisée',
          'Sous-titres et image de marque',
        ],
      },
    ],
  },
  {
    slug: 'supports-print',
    nom: 'Supports print',
    court: 'Print',
    resume:
      'Cartes, flyers, devis, signalétique : des supports imprimés cohérents avec votre identité et votre site.',
    statut: 'ship',
    matrice: { ville: false, metier: false },
    hub: [
      {
        type: 'hero',
        eyebrow: 'Supports print',
        title: 'Le papier qui prolonge votre image.',
        lead: 'Cartes de visite, flyers, devis, panneaux de chantier : des supports cohérents avec votre identité, prêts à imprimer.',
      },
      {
        type: 'includes',
        eyebrow: 'Ce qui est compris',
        title: 'Ce que vous obtenez',
        accent: 'miel',
        items: [
          'Cartes de visite, flyers, plaquettes',
          'Modèles de devis et factures à votre image',
          'Signalétique et panneaux de chantier',
          'Fichiers prêts pour l’impression',
        ],
      },
    ],
  },
];

export const getService = (slug: string): Service | undefined =>
  SERVICES.find((s) => s.slug === slug);

/** Service consommant la collection `metiers` pour sa matrice métier (couche 3). */
export const SERVICE_AVEC_METIERS = 'creation-site-internet';

// ── Couches 2–4 : matrice locale (ROADMAP — pilotée, non encore buildée) ─────
//
// Encodage de la matrice Partie B. Aucune de ces cellules n'est `ship` à ce jour
// (contenu local / cas client à venir). Pour activer une page : passer à `ship`
// ET fournir le contenu unique réel, PUIS câbler la route correspondante.

export interface Ville {
  slug: string;
  nom: string;
  population: number;
  zone: 'siege' | 'bassin' | 'rayonnement';
}

export const VILLES: Ville[] = [
  { slug: 'lanester', nom: 'Lanester', population: 7200, zone: 'siege' },
  { slug: 'lorient', nom: 'Lorient', population: 57000, zone: 'bassin' },
  { slug: 'vannes', nom: 'Vannes', population: 47000, zone: 'rayonnement' },
  { slug: 'hennebont', nom: 'Hennebont', population: 12500, zone: 'bassin' },
  { slug: 'auray', nom: 'Auray', population: 13000, zone: 'rayonnement' },
  { slug: 'ploemeur', nom: 'Ploemeur', population: 4000, zone: 'bassin' },
  { slug: 'queven', nom: 'Quéven', population: 6000, zone: 'bassin' },
];

/** Métiers BTP visés (couche 3). `statut` = intention; le BUILD suit la collection `metiers`. */
export interface MetierCible {
  slug: string;
  nom: string;
  statut: Statut; // ship = contenu rédigé (présent dans la collection metiers)
}

export const METIERS_CIBLES: MetierCible[] = [
  { slug: 'plombier', nom: 'Plombier', statut: 'ship' },
  { slug: 'electricien', nom: 'Électricien', statut: 'ship' },
  { slug: 'paysagiste', nom: 'Paysagiste', statut: 'ship' },
  { slug: 'menuisier', nom: 'Menuisier', statut: 'ship' },
  { slug: 'macon', nom: 'Maçon', statut: 'ship' },
  { slug: 'peintre', nom: 'Peintre', statut: 'conditionnel' },
  { slug: 'carreleur', nom: 'Carreleur', statut: 'conditionnel' },
  { slug: 'couvreur', nom: 'Couvreur', statut: 'conditionnel' },
  { slug: 'plaquiste', nom: 'Plaquiste', statut: 'conditionnel' },
  { slug: 'entreprise-renovation', nom: 'Entreprise de rénovation', statut: 'conditionnel' },
];

/**
 * Matrice service × ville (couche 2) — statuts issus de la Partie B.
 * Clé = `${service}/${ville}`. Toutes `conditionnel`/`exclu` aujourd'hui :
 * en attente du cas client FAR + FAQ locale réelle (décision : scaffolder).
 */
export const MATRICE_VILLE: Record<string, Statut> = {
  'creation-site-internet/lanester': 'conditionnel',
  'creation-site-internet/lorient': 'conditionnel',
  'creation-site-internet/vannes': 'conditionnel',
  'creation-site-internet/hennebont': 'conditionnel',
  'creation-site-internet/auray': 'conditionnel',
  'creation-site-internet/ploemeur': 'exclu', // pop. < 5k, demande nulle, doorway
  'creation-site-internet/queven': 'exclu',
  'referencement-seo/lanester': 'conditionnel',
  'referencement-seo/lorient': 'conditionnel',
};
