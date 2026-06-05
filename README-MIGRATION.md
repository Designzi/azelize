# README-MIGRATION — Index

> **🟢 ÉTAT RÉEL — MIGRATION EXÉCUTÉE À ≈ 80 % (révision 2026-06-05).** Ces 5 documents ont d'abord été rédigés en phase « avant travaux ». Ils sont depuis **désynchronisés** : les lots 1 à 5 sont en grande partie **faits** (palette Ocean Twilight migrée, fruit élagué des tokens, méga-menu 4 colonnes, `pricing.ts`, collection `guides` + 7 guides, 5 métiers, pages C0, avis/glossaire). Les tables d'état et les chemins ci-dessous sont **mis à jour** pour refléter le code réel ; les mentions historiques restantes sont annotées. Restant réel : câbler **ou** supprimer la couche villes (vues orphelines), finir le recâblage de l'énum fruit (`lib/accents.ts`/`lib/sections.ts`), interactif Lot 6, vitrines Lot 7. Source de vérité = le code `src/` + `CLAUDE.md`.

Tour **analyse + plan** (Prompt 2). Cartographie du stack Astro récepteur, mesure de l'écart avec le langage source Design, architecture cible et plan de portage séquencé.

## Les 5 documents

1. **[CARTOGRAPHIE-ASTRO.md](./CARTOGRAPHIE-ASTRO.md)** — Phase 1. État de l'art du stack Astro existant (stack, structure, conventions à préserver), en miroir de `CARTOGRAPHIE-DESIGN.md`.
2. **[MIGRATION-DELTA.md](./MIGRATION-DELTA.md)** — Phase 2. Table de correspondance source→idiome Astro, findings de langage, **table de mapping des tokens**, questions ouvertes (Q1–Q6).
3. **[ARCHITECTURE-CIBLE.md](./ARCHITECTURE-CIBLE.md)** — Phase 3. Collections, routage, layouts, tokens, SEO, îlots, décisions & arbitrages — **en étendant l'existant**, pas en le reconstruisant.
4. **[PLAN-MIGRATION.md](./PLAN-MIGRATION.md)** — Phase 4. Liste de préservation, séquence en 10 lots, risques/mitigations, definition of done.

> Le 5ᵉ document est ce README d'index.

## Le constat qui structure tout

Le dépôt Astro **n'est pas un stack vierge** : il a **déjà implémenté le socle** — collections + schémas Zod, routes dynamiques `[service]/[metier]`, registre SEO gaté anti-doorway (`seo-architecture.ts`), génération OG (`astro-og-canvas`), tokens centralisés `@theme`, interactivité **100 % vanilla** (zéro îlot React), garde-fous CI (`check:tokens` → `lint` → `build`).

➡️ La migration est un **portage fidèle, page par page**, de chaque maquette Design vers une page Astro dédiée — **sur le modèle de la home** (`index.astro` + sections dans `sections/home/`, Tailwind, JS vanilla). On **ne coule plus le contenu dans un jeu de blocs génériques** (`Blocks.astro` / `sections[]`) : chaque page **reproduit sa maquette telle quelle** (structure, copie, composants spécifiques : mockups, bandes de stats, tableaux d'objections, chips de maillage…). Les seuls écarts tolérés sont ceux du passage **CSS → Tailwind**.

## Décisions actées (détail dans MIGRATION-DELTA « Décisions actées »)

- **Q1 — Palette** : source de vérité = **couleurs réelles du Design** = **Ocean Twilight** (`#2347B8`). Le Design ship son propre `design-tokens.css` « source de vérité » avec **les mêmes noms de tokens** que le récepteur → mapping **1:1 nom pour nom**, on réconcilie les **valeurs**. Le **système fruit / 17-combos** (documenté en `.md`, ignoré par Q1) est **superseded et élagué** ⇒ recâbler `accents.ts`/énums + **mettre à jour `CLAUDE.md` et la mémoire**.
- **Q2–Q3 — Tokens** : audit-driven — créer un token **seulement** si variante réelle utilisée (1 beige → 1 token) ; supprimer le superflu. ⚠️ Audit d'usage par page à finaliser au **Lot 1** (les 54 pages produit ne sont pas sur la machine).
- **Navigation** : **méga-menu 4 colonnes** — étendre `data/nav.ts` + `Header.astro` (vanilla).
- **Triple gaté** : **créer** `[service]/[metier]/[ville].astro`, statut **`exclu`** (route prête, 0 page générée).
- **Slugs villes** (Lot 9) · **backend formulaire** (Lot 8) · **visuels Global Cars** (Lot 7 — pas encore dans `assets/`).

## Invariants à préserver (détail dans PLAN §A)

Archi 4 couches · `<head>` unique · SEO centralisé · **zéro îlot/zéro React** · tokens only (palette **Ocean Twilight** réelle, `ok/warn/danger` techniques seulement) · gating anti-doorway · parité pixel des vitrines · CI verte.

## Prochaine étape

*(Note historique : ce tour partait de l'analyse. Depuis, la migration a été exécutée à ≈ 80 % — voir bandeau d'état en tête.)*

Restant réel (révision 2026-06-05) :
- **Couche villes** : trancher — câbler (collection `villes` + route `[service]/[ville]` gatée `MATRICE_VILLE`) **ou** supprimer `src/views/villes/` (vues orphelines, aucun glob, aucune route). Décision délibérément **en attente** (on n'indexe pas un gros volume au départ).
- **Énum fruit** : finir le recâblage de `lib/accents.ts` / `lib/sections.ts` (énum `menthe…kiwi` encore présente mais inerte — toutes les classes pointent vers `brand`).
- **Lot 6** (interactif vanilla : simulateur, glossaire, cookies), **Lot 7** (vitrine Global Cars + visuels WebP), **Lot 8** (formulaire), **Lot 9** (redirections, nettoyage `Nav.astro`/`z.md`).
