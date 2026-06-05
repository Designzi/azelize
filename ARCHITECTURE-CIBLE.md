# ARCHITECTURE-CIBLE.md

> **🟢 ÉTAT RÉEL — révision 2026-06-05.** L'architecture cible décrite ici **correspond fidèlement à l'implémentation**, et une grande partie du « à créer » est désormais **faite** : collection `guides` créée (+ routes + 7 guides), `data/pricing.ts` créé, méga-menu 4 colonnes en place. Restent **non câblés (délibéré)** : la couche **villes** (collection `villes` + route `[service]/[ville]` + route triple-gatée) — vues `views/villes/` orphelines à câbler **ou** supprimer ; `glossaire`/`temoignages` ont été implémentés en **pages statiques**, pas en collections. Tokens : encre/bandes = **brun-olive `#403D30`** (le Jet `#2D3138` est retiré). Annotations « ✅ fait » / « ⏸️ en attente » ajoutées ci-dessous.

Architecture cible **partant de l'existant** (`CARTOGRAPHIE-ASTRO.md`). Principe : **ne remplacer aucune pratique en place sans gain chiffré**. La plupart des fondations existent déjà → on **étend**, on ne reconstruit pas.

> **Posture.** Pour chaque section : ce qui **existe et reste**, l'**écart** au regard des cas Design, et la **proposition** (avec justification DRY/SEO/perf/maintenabilité). Quand l'existant suffit, c'est dit explicitement.

---

## 3A. Modèle de contenu (collections + schémas Zod)

**Existe (à conserver) :** `content.config.ts` — schéma `base` (`seo`, `updated`, `tags`, **`sections[]`**) + collections `prestations`, `realisations`, `blog`, `metiers`. Le champ `sections` (union discriminée Zod, `lib/sections.ts`) est le pivot qui supprime la duplication.

**Écart vs Design (révisé 2026-06-05) :** `guides` est désormais une **collection** ; `glossaire` et `temoignages`/avis ont été faits en **pages statiques** (pas en collections) ; seule la couche **villes** reste sans collection ni route (en attente, registre `seo-architecture.ts` prêt).

**Proposition (étendre, justifié) :**

| Collection | Statut | Champs (au-delà de `base`) | Remplace (Design) | Justification |
|---|---|---|---|---|
| `prestations` | **garder** | `titre, resume, ordre?` | — | en place |
| `realisations` | **garder** | `client, resume, date, couverture?, resultats?` | études de cas | en place ; enrichir entrée Global Cars |
| `blog` | **garder** | `titre, description, date, brouillon` | — | en place |
| `metiers` | **garder** ✅ | `metier, titre, resume, ordre?` | pages métier clonées | en place — **5 métiers** : `electricien, garage-automobile, macon, plombier, vtc` (menuisier/paysagiste abandonnés) |
| `guides` | ✅ **créée (fait)** | `titre, description, date, sommaire?` | 7 guides C5 | collection + 7 MDX + `/guides` + `/guides/[slug]` + 7 vues |
| `villes` | ⏸️ **EN ATTENTE (délibéré)** | `nom, slug, population, zone, quartiers[], temoignage?` | gabarit `-VILLE` + instances | non créée ; vues `views/villes/` orphelines ; gating `MATRICE_VILLE` prêt — à câbler **ou** supprimer |
| ~~`temoignages`~~ | 🔁 **page statique `/avis` (fait)** | — | `avis.html` | implémenté en **page statique**, pas en collection (changement de stratégie) |
| ~~`glossaire`~~ | 🔁 **page statique `/glossaire` (fait)** | — | `TERMS` | implémenté en **page statique**, pas en collection (changement de stratégie) |

> **Source unique de prix** : ✅ **fait** — `src/data/pricing.ts` (paliers + features) consommé par le bloc `pricing`, la page tarifs et le simulateur. Évite la triple-saisie Design (F9).

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
| `/{service}/[ville].astro` ⏸️ **EN ATTENTE** | `getCollection('villes')` × service avec `matrice.ville` | **`MATRICE_VILLE[`${service}/${ville}`] === 'ship'`** (registre prêt, tout `conditionnel`/`exclu`) | C2 — **non câblée (délibéré)** |
| `/guides/index.astro` + `/guides/[slug].astro` ✅ **FAIT** | `getCollection('guides')` | existence d'entrée | C5 |
| `/glossaire.astro` ✅ **FAIT** | **page statique** (pas de collection) | toujours `ship` | outil |
| `/avis.astro` ✅ **FAIT** | **page statique** (pas de collection) | toujours `ship` | C0 |
| `/tarifs.astro` + `/simulateur-investissement.astro` ✅ **FAIT** | `data/pricing.ts` | statiques | C0/outil |

> **Triple gaté `/{service}/[metier]/[ville]` (acté — ⏸️ NON CRÉÉ, délibéré) :** la route `[service]/[metier]/[ville].astro` **n'a pas été scaffoldée** (le répertoire `src/pages/[service]/[metier]/` n'existe pas). Décision conservée comme intention ; à créer (statut `exclu`, 0 page générée) **ou** à retirer si la stratégie ville/métier est abandonnée. Aucune régression (la route ne devait générer aucune page).

**`getStaticPaths`** : pattern uniforme déjà en place — `collection × registre → params/props`. Une cellule absente ou non-`ship` ⇒ page non générée ⇒ absente du sitemap (gating natif).

---

## 3C. Layouts & chrome

**Existe (garder tel quel) :** `BaseLayout` (head + chrome + Seo), `ArticleLayout` (en-tête éditorial + prose). Chrome unique (`Header/Footer/MobileCtaBar`) sourcé par `data/`. **Aucune duplication de `<head>`.**

**Proposition (minimale) :**
- **Pas** de nouvelle hiérarchie `ServiceLayout/GuideLayout/CaseLayout` : `BaseLayout` + `Blocks.astro` couvrent déjà les hubs/métiers/prestations ; `ArticleLayout` couvre guides/blog. Ajouter un layout n'apporterait pas de DRY supplémentaire → **on garde**.
- **Nettoyer** le doublon `components/layout/Nav.astro` (non utilisé) — confirmer avant suppression.
- **Méga-menu Services (acté — ✅ FAIT) :** `data/nav.ts` expose `serviceGroups` en structure groupée **4 colonnes** (groupes Design : *Présence en ligne · Image de marque · Contenu & templates · Outils sur-mesure*, chaque item = titre + description) et enrichir `Header.astro` pour parser cette structure — **JS vanilla, zéro régression** (l'ouverture/fermeture du panneau reste un `<script>`). La nav d'ancres one-page actuelle devient un sous-cas (liens `/#…` conservés pour la landing).

---

## 3D. Tokens & thème — **réconciliation vers Ocean Twilight (Q1–Q3 actées)**

**Existe :** `design-tokens.css` (`@theme` Tailwind v4) — mais valeurs **fruit** (`--color-brand #002080` + 45 slots `menthe/fraise/…`) ; `lib/accents.ts` (classes fruit littérales) ; `check:tokens` (CI) ; `docs/sync-tokens.cjs`.

**Décision (Q1) :** la palette canonique de migration = **les couleurs réelles du Design** (Ocean Twilight, cf. `design-tokens.css` Design auto-intitulé « source de vérité », mêmes noms de tokens). Le **système fruit** (documenté en `.md`, ignoré par Q1) est **superseded** et **élagué**.

**Proposition (réconciliation, pas extension) :**
- **Réconcilier les valeurs** des tokens existants vers Ocean Twilight (nom pour nom) : `brand`/`brand-deep`/`brand-bright`/`brand-soft`/`brand-900` → valeurs Design réelles (cf. §2C du delta). Neutres/lignes/parchemin/on-dark : déjà identiques.
- **Créer** les tokens accent réellement utilisés (audit Q2–Q3) : `--color-accent-2` (jaune vif), `--color-accent-2-soft`, `--color-accent-2-ink`, `--color-section-warm` (beige, 1 token) ; `--color-accent-2-wash` et `--color-olive` (CtaBand) **uniquement si usage réel confirmé Lot 1**.
- **Élaguer** les 45 slots fruit non adossés à une couleur Design réelle (« aucun ajout fantôme »).
- **Recâbler** `lib/accents.ts` + énums `tone`/`accent` (`lib/sections.ts`, `Section.astro`, blocs) : de `menthe|fraise|miel|citron|kiwi` vers les rôles Ocean Twilight. ⚠️ **Partiel (2026-06-05)** : les tokens fruit sont élagués et `lib/accents.ts` renvoie `brand` pour tout accent, **mais** l'énum `menthe…kiwi` subsiste (inerte) dans `lib/accents.ts:12` et `lib/sections.ts` — recâblage à finir.
- **Mettre à jour `CLAUDE.md` (§Couleurs) + la mémoire `palette-retenue.md`** : ✅ **fait** — « 17 combinaisons fruit » remplacée par la palette Ocean Twilight réelle ; **encre/bandes = brun-olive `#403D30`**, le Jet `#2D3138` est **retiré**.
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

*Fin de l'architecture cible. **Note (2026-06-05) : l'architecture décrite est implémentée à ≈ 80 %** ; annotations « ✅ fait » / « ⏸️ en attente » ajoutées. La couche villes et la route triple-gatée restent volontairement non câblées.*
