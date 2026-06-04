# ARCHITECTURE-CIBLE.md

Architecture cible **partant de l'existant** (`CARTOGRAPHIE-ASTRO.md`). Principe : **ne remplacer aucune pratique en place sans gain chiffré**. La plupart des fondations existent déjà → on **étend**, on ne reconstruit pas.

> **Posture.** Pour chaque section : ce qui **existe et reste**, l'**écart** au regard des cas Design, et la **proposition** (avec justification DRY/SEO/perf/maintenabilité). Quand l'existant suffit, c'est dit explicitement.

---

## 3A. Modèle de contenu (collections + schémas Zod)

**Existe (à conserver) :** `content.config.ts` — schéma `base` (`seo`, `updated`, `tags`, **`sections[]`**) + collections `prestations`, `realisations`, `blog`, `metiers`. Le champ `sections` (union discriminée Zod, `lib/sections.ts`) est le pivot qui supprime la duplication.

**Écart vs Design :** les couches **guides**, **villes**, **glossaire**, **témoignages** n'ont pas de collection ; le registre `seo-architecture.ts` les anticipe (matrices) mais sans loaders.

**Proposition (étendre, justifié) :**

| Collection | Statut | Champs (au-delà de `base`) | Remplace (Design) | Justification |
|---|---|---|---|---|
| `prestations` | **garder** | `titre, resume, ordre?` | — | en place |
| `realisations` | **garder** | `client, resume, date, couverture?, resultats?` | études de cas | en place ; enrichir entrée Global Cars |
| `blog` | **garder** | `titre, description, date, brouillon` | — | en place |
| `metiers` | **garder** | `metier, titre, resume, ordre?` | 8 pages métier clonées | en place ; porter les métiers manquants |
| `guides` | **créer** | `titre, description, date, sommaire?` | 7 guides C5 | un shell article + N entrées MD/MDX → DRY fort |
| `villes` | **créer** | `nom, slug, population, zone, quartiers[], temoignage?` | gabarit `-VILLE` + instances | ville = donnée ; gating par `MATRICE_VILLE` |
| `temoignages` | **créer** | `auteur, metier, note, citation, ville?` | `avis.html` | bloc `testimonial` existe déjà |
| `glossaire` | **créer** | `terme, definition, lettre` | `TERMS` | filtre alpha en `<script>` |

> **Source unique de prix** : créer `src/data/pricing.ts` (paliers + features) consommé par le bloc `pricing`, la page tarifs et le simulateur. Évite la triple-saisie Design (F9).

**Gating par la donnée (déjà la philosophie du récepteur) :** une page n'existe que si (a) l'entrée de collection existe **et** (b) sa cellule registre est `ship`. C'est le verrou anti-doorway de `seo-architecture.ts` — à **étendre** aux villes/guides, pas à réinventer.

---

## 3B. Routage dynamique

**Existe (garder) :**
- `/{service}` ← `SERVICES.filter(ship)`
- `/{service}/{metier}` ← `getCollection('metiers')` (gardé par existence de fichier ; `SERVICE_AVEC_METIERS`)
- `/prestations/{slug}`, `/realisations/{slug}`, `/blog/{slug}`

**À câbler (justifié par la duplication Design) :**

| Route à créer | Source | Gating | Couche |
|---|---|---|---|
| `/{service}/[ville].astro` | `getCollection('villes')` × service avec `matrice.ville` | **`MATRICE_VILLE[`${service}/${ville}`] === 'ship'`** (registre déjà écrit, tout `conditionnel`/`exclu` aujourd'hui) | C2 |
| `/guides/index.astro` + `/guides/[slug].astro` | `getCollection('guides')` (`!brouillon`) | existence d'entrée | C5 |
| `/glossaire.astro` | `getCollection('glossaire')` | toujours `ship` | outil |
| `/avis.astro` | `getCollection('temoignages')` | toujours `ship` | C0 |
| `/tarifs.astro` + `/simulateur-investissement.astro` | `data/pricing.ts` | statiques | C0/outil |

> **Triple gaté `/{service}/[metier]/[ville]` (acté) :** **créer la route** `[service]/[metier]/[ville].astro`, gardée par le registre avec **statut `exclu`** par défaut. La route existe (structure prête) mais **aucune page n'est générée** (ni index, ni sitemap, ni OG) tant qu'une cellule ne passe pas `ship` avec contenu local spécifique réel. Risque doorway neutralisé par le gating, sans bloquer la structure.

**`getStaticPaths`** : pattern uniforme déjà en place — `collection × registre → params/props`. Une cellule absente ou non-`ship` ⇒ page non générée ⇒ absente du sitemap (gating natif).

---

## 3C. Layouts & chrome

**Existe (garder tel quel) :** `BaseLayout` (head + chrome + Seo), `ArticleLayout` (en-tête éditorial + prose). Chrome unique (`Header/Footer/MobileCtaBar`) sourcé par `data/`. **Aucune duplication de `<head>`.**

**Proposition (minimale) :**
- **Pas** de nouvelle hiérarchie `ServiceLayout/GuideLayout/CaseLayout` : `BaseLayout` + `Blocks.astro` couvrent déjà les hubs/métiers/prestations ; `ArticleLayout` couvre guides/blog. Ajouter un layout n'apporterait pas de DRY supplémentaire → **on garde**.
- **Nettoyer** le doublon `components/layout/Nav.astro` (non utilisé) — confirmer avant suppression.
- **Méga-menu Services (acté) :** **étendre `data/nav.ts`** en structure groupée **4 colonnes** (groupes Design : *Présence en ligne · Image de marque · Contenu & templates · Outils sur-mesure*, chaque item = titre + description) et enrichir `Header.astro` pour parser cette structure — **JS vanilla, zéro régression** (l'ouverture/fermeture du panneau reste un `<script>`). La nav d'ancres one-page actuelle devient un sous-cas (liens `/#…` conservés pour la landing).

---

## 3D. Tokens & thème — **réconciliation vers Ocean Twilight (Q1–Q3 actées)**

**Existe :** `design-tokens.css` (`@theme` Tailwind v4) — mais valeurs **fruit** (`--color-brand #002080` + 45 slots `menthe/fraise/…`) ; `lib/accents.ts` (classes fruit littérales) ; `check:tokens` (CI) ; `docs/sync-tokens.cjs`.

**Décision (Q1) :** la palette canonique de migration = **les couleurs réelles du Design** (Ocean Twilight, cf. `design-tokens.css` Design auto-intitulé « source de vérité », mêmes noms de tokens). Le **système fruit** (documenté en `.md`, ignoré par Q1) est **superseded** et **élagué**.

**Proposition (réconciliation, pas extension) :**
- **Réconcilier les valeurs** des tokens existants vers Ocean Twilight (nom pour nom) : `brand`/`brand-deep`/`brand-bright`/`brand-soft`/`brand-900` → valeurs Design réelles (cf. §2C du delta). Neutres/lignes/parchemin/on-dark : déjà identiques.
- **Créer** les tokens accent réellement utilisés (audit Q2–Q3) : `--color-accent-2` (jaune vif), `--color-accent-2-soft`, `--color-accent-2-ink`, `--color-section-warm` (beige, 1 token) ; `--color-accent-2-wash` et `--color-olive` (CtaBand) **uniquement si usage réel confirmé Lot 1**.
- **Élaguer** les 45 slots fruit non adossés à une couleur Design réelle (« aucun ajout fantôme »).
- **Recâbler** `lib/accents.ts` + énums `tone`/`accent` (`lib/sections.ts`, `Section.astro`, blocs) : de `menthe|fraise|miel|citron|kiwi` vers les rôles Ocean Twilight.
- **Mettre à jour `CLAUDE.md` (§Couleurs) + la mémoire `palette-retenue.md`** : la règle « 17 combinaisons fruit » est remplacée par « palette Ocean Twilight réelle ». Sinon garde-fou contradictoire.
- **Inchangé** : `check:tokens` reste actif (zéro hex hors `design-tokens.css`) ; classes canoniques avant `[...]` (CLAUDE.md) ; registre rounded-xs + quasi sans ombres.
- **Aucune régression visuelle** sur vitrines (hero, Global Cars, simulateur) : parité au pixel.

---

## 3E. SEO & données structurées

**Existe (garder, c'est un point fort) :** `Seo.astro` + `lib/seo.ts` (8 fabriques JSON-LD), sitemap filtré, `noindex` légales, redirections, `Breadcrumbs` + `breadcrumbJsonLd`, OG auto (`og/[...route].ts`).

**Proposition (brancher les nouveaux types) :**
- `guides/[slug]` → `articleJsonLd` (réutiliser).
- `/{service}/[ville]` → `serviceJsonLd` + `breadcrumb` + (si FAQ locale) `faqJsonLd` ; **n'émettre que si `ship`** (anti-doorway).
- `temoignages` → enrichir `localBusiness`/`service` avec `aggregateRating` (optionnel, si note réelle).
- OG : étendre la map `pages` de `og/[...route].ts` aux nouvelles collections (même pattern qu'aujourd'hui).
- **hreflang** : non requis (FR uniquement) — ne pas ajouter.

---

## 3F. Îlots & performance

**Décision structurante (déjà actée par le récepteur) : zéro framework, zéro îlot.** L'interactivité reste en **JS vanilla `<script>`**. Ne **pas** réintroduire React malgré l'origine `.jsx` du Design.

| Comportement Design (React) | Cible | Technique |
|---|---|---|
| Header scroll / burger | en place | `<script>` (Header.astro) |
| Accordéon FAQ | en place | `<script>` (FaqBlock.astro) |
| Reveal au scroll | en place | `IntersectionObserver` (index.astro) — généraliser via `.reveal` global |
| Simulateur ROI | à porter | `<script>` + `data/pricing.ts` ; recalcul DOM |
| Simulateur de palier (devis) | à porter | `<script>` (chips → prix) |
| Glossaire (recherche/filtre) | à porter | `<script>` (filtre liste rendue au build) |
| Préférences cookies + bannière | à porter | `<script>` (localStorage) |
| Formulaires | à brancher | endpoint Astro ou service externe (Q5) |

**Perf :** JS minimal, pas d'hydration ; objectif Lighthouse ~100 conservé. Images réelles via `<Image/>` (formats modernes) pour le cas premium.

---

## 3G. Décisions & arbitrages

| Décision | Gain | Coût | Alternative écartée |
|---|---|---|---|
| **Garder l'archi en 4 couches + `sections`** | DRY massif (40 clones → entrées) | aucun | calque 1:1 du HTML Design (rejeté) |
| **Étendre, ne pas reconstruire** | risque minimal, parité préservée | discipline | refonte (inutile, l'archi existe) |
| **Zéro îlot React** | perf, simplicité, 0 dépendance runtime | réécrire l'interactif en vanilla | îlots React (surdimensionné ici) |
| **Ocean Twilight (Design réel) prime — fruit élagué** (Q1) | source de vérité = couleurs réelles ; mapping 1:1 nom pour nom ; aucun token fantôme | réconcilier valeurs + recâbler `accents.ts`/énums + MAJ CLAUDE.md/mémoire | garder le fruit (rejeté : `.md` ignoré par Q1) |
| **Tokens audit-driven** (Q2–Q3) | set minimal, zéro superflu | audit d'usage à finaliser Lot 1 (kit) | porter tous les tokens Design en bloc (rejeté) |
| **Méga-menu 4 colonnes** | parité Design, navigation multi-services | étendre `data/nav.ts` + Header (vanilla) | garder nav one-page seule (rejeté) |
| **Triple gaté créé + `exclu`** | structure prête, doorway neutralisé | tenir le registre | ne pas créer la route (rejeté) |
| **Gating registre étendu aux villes/guides** | anti-doorway natif, SEO sain | tenir le registre à jour | générer toutes les pages (risque doorway) |
| **Pas de layout par type** | moins de surface | — | `ServiceLayout/GuideLayout` (pas de DRY supplémentaire) |
| **`data/pricing.ts` unique** | fin de la triple-saisie prix | petite migration | garder 3 sources (rejeté) |

**Restent à trancher en cours de route (non bloquants) :** Q4 slugs/redirections villes (Lot 9), Q5 backend formulaire (Lot 8). **À confirmer Lot 1, kit en main :** usage réel des jaunes (wash ?), brun-olive CtaBand, présence `ok/warn/danger` en surface, rapatriement des WebP Global Cars (Q6, pas encore dans `assets/`).

---

*Fin de l'architecture cible. Aucun fichier de code créé dans `src/`.*
