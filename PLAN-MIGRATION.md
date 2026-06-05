# PLAN-MIGRATION.md

> **🟢 ÉTAT RÉEL — révision 2026-06-05 : la migration est exécutée à ≈ 80 %.** Lots **1 à 5 faits en grande partie** (voir cases ✅ ci-dessous). Restant : couche villes (à câbler **ou** supprimer — délibérément en attente), recâblage énum fruit, Lots 6–9. Ce document a été rédigé en phase de préparation ; il est conservé comme feuille de route, avec l'état réel annoté lot par lot.

Plan de portage séquencé du UI kit Design **vers l'architecture Astro existante**. Chaque lot a un périmètre, des dépendances, des **critères d'acceptation vérifiables** et un point de contrôle.

> **Rappel de cadrage.** On ne construit pas l'architecture (elle existe). On **porte ~40 pages de contenu** en entrées de collection + registre, et on factorise quelques patterns visuels.

---

## A. Liste de préservation (garde-fous — NE PAS dégrader)

Extraits de la Phase 1C, formulés comme invariants à respecter à chaque lot :

1. **Archi en 4 couches** (`Blocks` → blocs → primitives → chrome) : toute page riche passe par `sections[] + Blocks.astro`. Ne jamais coder une page en HTML monolithique.
2. **`<head>` unique** : tout via `BaseLayout` → `Seo.astro`. Jamais de `<head>` ou méta par page.
3. **SEO centralisé** : JSON-LD uniquement via `lib/seo.ts` ; breadcrumb visible jumelé au `breadcrumbJsonLd`.
4. **Zéro îlot / zéro framework** : interactivité en `<script>` vanilla. **Ne pas** ajouter `@astrojs/react`.
5. **Tokens only** : aucune valeur couleur en dur (`check:tokens` bloque) ; classes canoniques avant `[...]` (CLAUDE.md). **Palette = Ocean Twilight réelle** (Q1) — le système fruit/17-combos est superseded et élagué (cf. delta §2C) ; `ok/warn/danger` techniques uniquement, jamais en surface.
6. **Gating anti-doorway** : aucune page `ship` sans contenu unique réel ; le registre `seo-architecture.ts` pilote le build et le sitemap.
7. **Parité visuelle non négociable** : hero accueil, cas Global Cars, simulateur ROI — au pixel.
8. **CI verte obligatoire** : `check:tokens` → `lint` → `astro check && build` à chaque lot.
9. **Alias d'import** (`@lib/@data/@components/@styles…`) et conventions Prettier/ESLint respectés.

---

## B. Séquence par lots

### Lot 0 — Cadrage (décisions actées)
- **Périmètre** : décisions Q1 (palette Ocean Twilight), Q2–Q3 (tokens audit-driven), méga-menu 4 col., triple gaté `exclu`, slugs (Lot 9), backend (Lot 8), visuels (Lot 7) — **toutes actées** (cf. delta « Décisions actées »).
- **Reste à finaliser Lot 1 (kit Design en main)** : audit d'usage par page (jaunes : wash réellement utilisé ? brun-olive CtaBand ? `ok/warn/danger` en surface ?) ; rapatriement des WebP Global Cars (absents de `assets/` à ce jour).
- **Contrôle** : audit quantitatif consigné.

### Lot 1 — Réconciliation tokens (Ocean Twilight) + recâblage — ✅ ≈ 90 % FAIT
*(Tokens `brand*`/`brand-900` réconciliés vers Ocean Twilight ; fruit élagué de `design-tokens.css` (0 token fruit) ; tokens `accent-2*` créés ; CLAUDE.md/mémoire à jour. **Reste** : énum fruit `menthe…kiwi` encore dans `lib/accents.ts:12` et `lib/sections.ts` — inerte, à recâbler. ⚠️ L'encre/`brand-900` est finalement **`#403D30` brun-olive**, pas le Jet `#2D3138` du delta §2C : décision révisée, le Jet est **retiré**.)*
- **Périmètre** :
  1. **Réconcilier les valeurs** des tokens `brand*`/`brand-900` vers Ocean Twilight (nom pour nom, cf. delta §2C) ;
  2. **créer** les tokens accent réels (`accent-2`, `accent-2-soft`, `accent-2-ink`, `section-warm` ; `accent-2-wash`/`olive` si confirmés) ;
  3. **élaguer** les 45 slots fruit non adossés ;
  4. **recâbler** `lib/accents.ts` + énums `tone`/`accent` (`lib/sections.ts`, `Section.astro`, blocs) sur la palette réelle ;
  5. **mettre à jour `CLAUDE.md` (§Couleurs) + la mémoire `palette-retenue.md`** (fruit → Ocean Twilight) ;
  6. resync `docs/sync-tokens.cjs` (ou marquer la doc fruit obsolète).
- **Dépendances** : Lot 0 (audit finalisé).
- **Critères** : `check:tokens` vert ; `astro check && build` vert (énums cohérentes) ; **aucune régression visuelle** (diff home + 1 hub) ; CLAUDE.md/mémoire alignés (plus de règle « 17 combos » contradictoire).
- **Contrôle** : capture avant/après home + hub ; relecture CLAUDE.md.

### Lot 2 — Données socles, prix & méga-menu — ✅ FAIT
*(`src/data/pricing.ts` créé ; méga-menu **4 colonnes** en place — `serviceGroups` (4 groupes) dans `data/nav.ts`, parsing vanilla dans `Header.astro`.)*
- **Périmètre** : créer `data/pricing.ts` (source unique) ; brancher bloc `pricing` + page `/tarifs` dessus ; **étendre `data/nav.ts` en structure groupée 4 colonnes** (4 groupes Design) + adapter `Header.astro` (parsing vanilla) ; ajuster `data/footer.ts` si besoin.
- **Dépendances** : Lots 0–1.
- **Critères** : prix identiques partout (tarifs = bloc home = futur simulateur) ; méga-menu fonctionnel desktop + tiroir mobile, **zéro `client:*`** ; build vert.
- **Contrôle** : grep « aucun prix en dur résiduel » ; test nav desktop/mobile ; revue tarifs.

### Lot 3 — Hubs services C1 (enrichissement) — ✅ FAIT (vues hubs en place)
- **Périmètre** : compléter les `SERVICES[].hub` (`sections[]`) pour les 6 services `ship` à partir des hubs Design ; statuer sur les services Design absents (vidéo/print existent ; templates-canva, saas, automatisations, catalogues, email → créer entrées **seulement si** retenus).
- **Dépendances** : Lots 1–2.
- **Critères** : chaque hub rend via `Blocks` ; `serviceJsonLd` + breadcrumb ; OG générée ; parité de contenu.
- **Contrôle** : revue d'un hub de référence (création-site-internet).

### Lot 4 — Pages C0 statiques manquantes — ✅ FAIT
*(Présentes sous `src/pages/` : `a-propos`, `faq`, `merci`, `404`, `vos-30-premiers-jours`, `cgv`, `cookies`, `notre-methodologie`, + `devis`, `simulateur-investissement`, `tarifs`.)*
- **Périmètre** : porter `le-studio`→`a-propos`, `faq`, `merci`, `404`, `vos-30-premiers-jours`, légales manquantes (`cgv`, `cookies`), `notre-methodologie`.
- **Dépendances** : Lots 1–2.
- **Critères** : sous `BaseLayout`/`ArticleLayout` ; `noindex` + exclusion sitemap pour légales ; build vert.
- **Contrôle** : check sitemap (légales absentes) ; check `noindex`.

### Lot 5 — Collections + routes dynamiques — ✅ partiellement FAIT (villes en attente)
- **5a Guides** — ✅ **FAIT** : collection `guides` (`content.config.ts:75`) + `/guides` + `/guides/[slug]` + 7 guides MDX + 7 vues sous `views/guides/`.
- **5b Métiers** — ✅ **FAIT** : 5 métiers à contenu unique sous `src/content/metiers/` (`electricien, garage-automobile, macon, plombier, vtc`). ⚠️ `menuisier`/`paysagiste` du plan d'origine **abandonnés** ; `garage-automobile`/`vtc` ajoutés.
- **5c Villes** — ⏸️ **EN ATTENTE (délibéré)** : ni collection `villes`, ni route `[service]/[ville]`, ni route triple-gatée `[service]/[metier]/[ville]`. `src/views/villes/` (`_template`, `lorient`, `vannes`) existe mais est **orphelin** (aucun glob, aucune route). Le registre `MATRICE_VILLE` est prêt (cellules `conditionnel`/`exclu`). À trancher : câbler **ou** supprimer. On n'indexe pas la couche villes au départ.
- **5d Avis** — ✅ **FAIT** mais en **page statique** `src/pages/avis.astro` (≠ collection `temoignages` du plan : changement de stratégie).
- **5e Glossaire** — ✅ **FAIT** mais en **page statique** `src/pages/glossaire.astro` (≠ collection `glossaire` du plan).
- **Dépendances** : Lots 1–3.
- **Critères** : une entrée absente ou non-`ship` ⇒ page non générée + absente du sitemap (gating vérifié) ; OG map étendue ; pas de contenu dupliqué (anti-doorway).
- **Contrôle** : build du sitemap et inspection des URLs générées vs registre.

### Lot 6 — Îlots interactifs (vanilla)
- **Périmètre** : porter simulateur ROI, simulateur de palier (devis), filtre glossaire, préférences cookies + bannière — tous en `<script>`.
- **Dépendances** : Lots 2 (prix), 5 (glossaire).
- **Critères** : comportement identique au Design ; **zéro** `client:*` introduit ; `prefers-reduced-motion` respecté ; pas de régression perf.
- **Contrôle** : test manuel de chaque interaction.

### Lot 7 — Pages-vitrines & visuels réels
- **Périmètre** : cas premium **Global Cars** (8 sections narratives + WebP via `<Image/>`), hero accueil, parité simulateur.
- **Dépendances** : Lots 1, 5d, 6, Q6.
- **Critères** : **parité au pixel** (revue visuelle dédiée) ; images optimisées ; `creativeWorkJsonLd`.
- **Contrôle** : comparaison côte à côte avec le Design.

### Lot 8 — SEO/sitemap & formulaires
- **Périmètre** : vérifier OG sur tous les types, JSON-LD par type, sitemap final ; brancher le formulaire devis (endpoint ou service externe, Q5).
- **Dépendances** : Lots 3–7.
- **Critères** : Rich Results test OK (FAQ, Service, Article, Breadcrumb) ; soumission formulaire fonctionnelle ; sitemap conforme au registre.
- **Contrôle** : audit SEO + test formulaire bout en bout.

### Lot 9 — Nettoyage & redirections
- **Périmètre** : table de redirections (slugs Design plats → routes en couches, cf. précédent `astro.config.mjs`) ; supprimer doublons (`Nav.astro` si confirmé inutilisé) ; retirer placeholders.
- **Dépendances** : tous lots de contenu.
- **Critères** : aucune URL morte ; redirections 301 testées ; lint/build verts ; `z.md` et fichiers de travail nettoyés.
- **Contrôle** : crawl des anciennes URL → 301 attendues.

---

## C. Risques & mitigations

| Risque | Impact | Mitigation |
|---|---|---|
| **Régression visuelle** sur vitrines | élevé | Lot 7 dédié ; revue pixel ; geler les tokens (Lot 1 minimal) |
| **Doorway SEO** (pages ville/métier creuses) | élevé | gating registre ; `ship` **uniquement** avec contenu unique réel ; villes restent `conditionnel` |
| **Perte SEO sur changement de slug** | moyen | table de redirections (Lot 9) ; précédent `astro.config.mjs` à réutiliser |
| **Réintroduction accidentelle de React** | moyen | garde-fou règle 4 ; revue de PR ; pas d'ajout d'intégration |
| **Réconciliation palette** (fruit → Ocean Twilight) casse une énum / un rendu | moyen | Q1 actée ; recâbler `accents.ts`+énums en Lot 1 ; `astro check` + diff visuel ; MAJ CLAUDE.md/mémoire pour éviter garde-fou contradictoire |
| **Triple-saisie prix réapparaît** | faible | `data/pricing.ts` source unique (Lot 2) |
| **Interactif vanilla mal porté** (FAQ/simulateur) | moyen | tests manuels Lot 6 ; parité comportementale documentée |
| **Valeur en dur introduite** | faible | `check:tokens` bloquant en CI |

---

## D. Définition de fin (Definition of Done globale)

- [ ] Toutes les pages Design retenues portées (ou explicitement écartées avec justification).
- [ ] Aucune page générée sans entrée de collection + statut `ship` (gating respecté ; sitemap = registre).
- [ ] Zéro `client:*` / zéro framework runtime ; interactivité vanilla équivalente au Design.
- [ ] Zéro valeur couleur en dur (`check:tokens` vert) ; palette **Ocean Twilight réelle** (fruit élagué, `accents.ts`/énums recâblés, CLAUDE.md/mémoire à jour) ; classes canoniques.
- [ ] CI verte : `check:tokens` → `lint` → `astro check && build`.
- [ ] Parité visuelle au pixel sur hero accueil, cas Global Cars, simulateur ROI.
- [ ] JSON-LD correct par type + sitemap propre + redirections 301 en place.
- [ ] Formulaire devis fonctionnel ; aucune URL morte ; doublons/placeholders nettoyés.

---

*Fin du plan. **Note (2026-06-05) : la migration a été exécutée à ≈ 80 %** — voir l'état annoté lot par lot ci-dessus ; ce document reste la feuille de route pour le restant (villes, recâblage énum fruit, Lots 6–9).*
