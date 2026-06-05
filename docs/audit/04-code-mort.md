# Code mort & inutilisé — Rapport d'audit

**Périmètre audité :** `src/` entier sous l'angle des références : composants `ui/`, `blocks/`, `layout/`, vues `views/`, exports `lib/`, données `data/`, assets `src/assets/` + `public/`, et dépendances `package.json`. Vérification croisée par analyse manuelle des imports (`import.meta.glob` des routes + imports statiques), `eslint .` (clean) et tentative `knip`/`depcheck` (indisponibles hors-ligne, non installés — analyse faite à la main).
**Note de santé :** 7,5/10 — peu de code mort, mais une grappe d'orphelins claire (vues villes + chaîne Nav/Logo + 2 SVG) à élaguer ou à assumer comme scaffold.

## Résumé exécutif
- Le projet est globalement propre : la quasi-totalité des composants, blocs et fonctions utilitaires sont bien câblés. ESLint ne signale aucune variable inutilisée.
- **Trois fichiers de vue « villes » (`lorient`, `vannes`, `_template`) ne sont reliés à aucune page** : aucune route ne les charge et il n'existe pas de collection « villes ». Ce sont des maquettes mises de côté (la matrice locale est volontairement « non encore buildée » selon le registre SEO) — code mort de fait, à assumer comme brouillon ou à sortir du dossier `src/`.
- Une petite **chaîne d'orphelins liés au logo** : le composant `Nav.astro` (et la donnée `mainNav` qu'il consomme), le composant `Logo.astro` (placeholder jamais utilisé) et les **deux fichiers SVG du logo** (`src/assets/azelize-*.svg`) ne sont référencés nulle part. Le site affiche son logo autrement (texte + favicon).
- **Trois primitives d'UI jamais importées** : `Pill`, `Grid` (celui de `ui/`), `Logo`. Et un export utilitaire mort : `accentSoftBg` dans `lib/accents.ts`.
- Aucune dépendance npm manifestement superflue détectée ; toutes les dépendances de `package.json` correspondent à un usage réel (Astro, MDX, sitemap, OG canvas, Tailwind).

## Constats détaillés

### [DEAD-01] Vues « villes » orphelines (aucune route, aucune collection)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/_template.astro`, `src/views/villes/lorient.astro`, `src/views/villes/vannes.astro`
- **Description :** Aucune route `pages/` ne fait `import.meta.glob('../../views/villes/*.astro')` (seuls `hubs`, `metiers`, `realisations`, `guides` sont globbés depuis les routes correspondantes). Il n'existe pas de collection `villes` dans `src/content.config.ts`. Le registre SEO confirme que la matrice ville (couches 2–4) est « ROADMAP — pilotée, non encore buildée » : toutes les cellules `MATRICE_VILLE` sont `conditionnel`/`exclu`, aucune `ship` (`src/data/seo-architecture.ts:697-751`). Ces trois fichiers ne sont donc jamais compilés ni rendus. `_template.astro` est de surcroît un gabarit (le préfixe `_` l'exclut nativement des routes Astro, mais il est ici dans `views/` pas dans `pages/`).
- **Pourquoi ça compte :** Du code qui n'est jamais exécuté donne une fausse impression de fonctionnalité livrée, alourdit la lecture du dépôt et risque de diverger silencieusement des conventions (palette, tokens) sans que rien ne le signale. Si ces pages doivent vivre un jour, leur place est documentée comme scaffold ; sinon elles polluent `src/`.
- **Recommandation :** Soit assumer explicitement le statut « scaffold » (déplacer hors de `src/`, ex. `docs/scaffold/villes/` ou un dossier `_drafts/` hors build, et ajouter une note), soit les supprimer en attendant le câblage réel de la couche villes. Ne pas les laisser dans `src/views/` où tout le reste est, lui, câblé.

### [DEAD-02] Composant `Nav.astro` non importé (+ donnée `mainNav` transitivement morte)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/components/layout/Nav.astro` ; `src/data/nav.ts:8` (`export const mainNav`)
- **Description :** `Nav.astro` n'apparaît dans aucun `import` du projet (la navigation réelle est codée en dur dans `Header.astro`, qui consomme `serviceGroups`, `primaryNav`, `secondaryNav`, `chromeCta`). `Nav.astro` est le seul consommateur de `mainNav` (`src/components/layout/Nav.astro:2,16`). Comme `Nav.astro` n'est jamais monté, `mainNav` est un export mort par ricochet — aucun autre fichier ne l'importe (vérifié par grep `mainNav`).
- **Pourquoi ça compte :** Deux sources de vérité pour la navigation (le tableau `mainNav` + les tableaux réellement utilisés par `Header`) créent un risque : on édite `mainNav` en croyant changer le menu, sans effet visible. C'est un piège de maintenance classique.
- **Recommandation :** Supprimer `Nav.astro` et l'export `mainNav` s'ils ne servent plus, ou rebrancher `Header` sur `Nav.astro` si l'intention était d'extraire le composant. Trancher pour éviter la double source.

### [DEAD-03] Composant `Logo.astro` (placeholder) jamais importé
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Logo.astro`
- **Description :** `Logo.astro` n'est importé nulle part (absent de la carte d'imports ; grep `Logo` ne le retrouve qu'en commentaire ailleurs). Son propre en-tête le déclare « PLACEHOLDER … à remplacer par les SVG officiels » (`src/components/ui/Logo.astro:3-5`). Le logo affiché du site passe par `Header.astro`/`Footer.astro` (logo textuel) et la favicon `/favicon.svg`.
- **Pourquoi ça compte :** Un composant placeholder non câblé entretient l'ambiguïté sur « comment afficher le logo » et peut être importé par erreur, réintroduisant une identité visuelle obsolète. Impact faible car isolé.
- **Recommandation :** Supprimer, ou le câbler réellement dans `Header`/`Footer` si l'on veut un composant logo unique. Lié à DEAD-05 (ses SVG).

### [DEAD-04] Primitives UI `Pill` et `Grid` jamais importées
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Pill.astro`, `src/components/ui/Grid.astro`
- **Description :** Ni `Pill` ni le `Grid` de `ui/` n'apparaissent dans un `import` (vérifié par grep ciblé). Attention à ne pas confondre : le `Grid` utilisé est `GridBlock` de `components/blocks/` (importé par `Blocks.astro`), pas `ui/Grid.astro`. `Pill.astro` importe `accentBg`/`type Accent` mais n'est lui-même monté nulle part.
- **Pourquoi ça compte :** Primitives de design system jamais consommées : elles gonflent l'inventaire de composants « disponibles » sans être éprouvées, et peuvent diverger des tokens en vigueur. Risque faible (isolées).
- **Recommandation :** Supprimer si non destinées à un usage proche, ou documenter comme primitives réservées. À recroiser avec l'audit design-system pour décider du périmètre cible.

### [DEAD-05] Assets SVG du logo non référencés
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/assets/azelize-monogram.svg`, `src/assets/azelize-wordmark.svg`
- **Description :** Aucune référence à ces fichiers dans le code (grep `monogram|wordmark|assets/|.svg` : seules occurrences = commentaires de `Logo.astro` et la favicon `/favicon.svg` qui, elle, est dans `public/`). Les SVG de `src/assets/` ne sont ni importés en tant qu'assets Astro, ni cités dans une feuille de style.
- **Pourquoi ça compte :** Des assets non référencés ne sont pas inclus au build statique (donc pas de poids en prod), mais ils encombrent le dépôt et suggèrent à tort qu'un vrai logo est en place. Couplé à DEAD-03, ils forment une intention de logo jamais branchée.
- **Recommandation :** Les brancher via un `Logo.astro` réellement utilisé, ou les retirer / archiver hors `src/`. Décision à prendre conjointement avec DEAD-03.

### [DEAD-06] Export utilitaire `accentSoftBg` jamais consommé
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/lib/accents.ts:32` (`export const accentSoftBg`)
- **Description :** `accentSoftBg` n'est importé nulle part (vérifié par grep). Les autres exports du module sont bien utilisés : `accentText` (Eyebrow, StatsBlock, TimelineBlock), `accentBg` (Badge, Pill, IncludesBlock — note : Pill est lui-même mort, cf. DEAD-04), `accentBorder` (TimelineBlock), `type Accent` (plusieurs). La classe `bg-brand-soft` qu'il produirait est partout écrite en clair dans le markup, sans passer par cet export.
- **Pourquoi ça compte :** Export utilitaire mort = bruit dans l'API du module et fausse complétude. Impact minime.
- **Recommandation :** Supprimer l'export `accentSoftBg`. (Le commentaire d'en-tête du module qui le justifie via le « build Tailwind » devient alors caduc pour cette ligne.)

### [DEAD-07] Type `Accent` et schéma `accent` figés sur le système fruit (héritage inerte)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** M
- **Localisation :** `src/lib/accents.ts:12` ; `src/lib/sections.ts:12`
- **Description :** Le type `Accent = 'menthe' | 'fraise' | 'miel' | 'citron' | 'kiwi'` et l'enum Zod `accent` reprennent les 5 valeurs du système « fruit » pourtant déclaré SUPERSEDED/élagué dans `CLAUDE.md`. Les fonctions `accentText`/`accentBg`/etc. renvoient toutes `brand` quel que soit l'accent : les props `accent: 'kiwi'`, `'miel'`, etc. présentes dans `seo-architecture.ts` (hubs) et `sections.ts` sont donc des **labels inertes sans effet visuel** — c'est volontaire et documenté (« compat schéma »). Ce n'est pas du code « mort » au sens strict (le type est référencé par plusieurs composants), mais c'est de la **dette de vocabulaire** : des valeurs qui ne signifient plus rien fonctionnellement.
- **Pourquoi ça compte :** Un nouveau contributeur peut croire que `accent: 'fraise'` colore quelque chose, et passer du temps à débugger un effet qui n'existe pas. À terme, ces valeurs gagneraient à être supprimées du schéma et des données (au profit d'aucun accent, ou d'un `accent?: 'brand'` neutre). Relève davantage de l'axe cohérence/architecture que du strict code mort.
- **Recommandation :** Hors périmètre « suppression directe » (le type est utilisé). À traiter comme une simplification planifiée : retirer les valeurs fruit du `z.enum` et des props `accent:` dans `seo-architecture.ts`, une fois la décision actée avec l'audit cohérence. Pointé ici pour traçabilité.

## Points positifs
- **Câblage par convention propre et homogène :** chaque famille de vues (`hubs`, `metiers`, `realisations`, `guides`) est chargée par un `import.meta.glob` côté route, et chaque fichier de vue correspond exactement à un slug de service (`SERVICES`, tous `ship`) ou à une entrée de collection (`metiers` ×5, `realisations` ×3, `guides` ×7). Aucune vue orpheline dans ces quatre familles — seul `villes` (non câblé) fait exception.
- **Blocs tous consommés :** les 12 composants de `components/blocks/` sont utilisés — 8 via le routeur `Blocks.astro`, plus `TestimonialBlock` (Proof), `FormBlock` (FinalCta) et `CtaBand` (très largement importé).
- **Primitives UI majoritairement vivantes :** `Button`, `Card`, `Section`, `Eyebrow`, `Breadcrumbs`, `PageHeader`, `SectionHead`, `Field`, `Badge`, `RiskNote` sont toutes câblées.
- **`lib/` quasi entièrement consommé :** tout `seo.ts` (chaque fonction JSON-LD a un appelant), `og.ts`, `format.ts`, `sections.ts` (`sectionSchema`/`SectionData`) servent ; seul `accentSoftBg` est orphelin.
- **Données utilisées :** `site`, `nav` (sauf `mainNav`), `footer`, `faq`, `pricing` (`tiers`, `PRICE_UNIT`, `compareRows`), `seo-architecture` (`SERVICES`, `getService`, `SERVICE_AVEC_METIERS`) ont tous des consommateurs réels.
- **`eslint .` ne remonte aucune variable/import inutilisé** sur l'ensemble du dépôt.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| DEAD-01 | Moyen | S | Vues « villes » orphelines (aucune route, aucune collection) |
| DEAD-02 | Moyen | S | `Nav.astro` non importé (+ `mainNav` morte par ricochet) |
| DEAD-03 | Mineur | S | `Logo.astro` placeholder jamais importé |
| DEAD-04 | Mineur | S | Primitives UI `Pill` et `Grid` jamais importées |
| DEAD-05 | Mineur | S | Assets SVG du logo non référencés |
| DEAD-06 | Mineur | S | Export `accentSoftBg` jamais consommé |
| DEAD-07 | Hypothèse à vérifier | M | Type `Accent`/schéma `accent` figés sur le système fruit (inerte) |
