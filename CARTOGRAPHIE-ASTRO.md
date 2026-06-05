# CARTOGRAPHIE-ASTRO.md

**Stack récepteur — état de l'art déjà en place.** Document de cartographie en lecture seule.
Miroir structurel de `CARTOGRAPHIE-DESIGN.md` (mêmes intitulés là où ils existent) pour permettre une comparaison ligne à ligne en Phase 2.

> **Constat d'entrée.** Le dépôt Astro n'est pas un stack vierge : il a **déjà implémenté la plupart des cibles** qu'une migration viserait (collections + schémas Zod, modèle `sections → blocs`, routes dynamiques `[service]/[metier]`, registre SEO gaté anti-doorway, génération OG, système de tokens centralisé, garde-fous CI). La « migration » réelle est donc un **portage de contenu** depuis le UI kit Design **vers** cette architecture — pas la construction de l'architecture.

---

## 1A. Stack & configuration

| Élément | Valeur | Preuve |
|---|---|---|
| Astro | `^5.7.0`, output **static** (défaut, pas d'adapter) | `package.json:23`, `astro.config.mjs` |
| Intégrations | `@astrojs/mdx`, `@astrojs/sitemap`, `astro-og-canvas` | `package.json:20-24`, `astro.config.mjs:2-4` |
| Styling | **Tailwind v4** via `@tailwindcss/vite` (pas de `tailwind.config.js` — thème en CSS `@theme`) | `package.json:22,25`, `astro.config.mjs:27-29` |
| TypeScript | `^5.8`, strict, alias d'import | `tsconfig.json`, `package.json:26` |
| Gestionnaire | npm (lockfile présent) | `package-lock.json` |
| Qualité | `astro check` (typecheck) + ESLint v9 flat + Prettier + script `check:tokens` | `package.json:9-15` |
| CI | GitHub Actions : `check:tokens` → `lint` → `build` sur push `main` + PR | `.github/workflows/ci.yml` |

**`astro.config.mjs` (faits saillants) :**
- `site: 'https://azelize.com'` — requis sitemap + canonical (`astro.config.mjs:8`).
- **Redirections statiques déjà en place** : `/site-internet/*` → `/creation-site-internet/*` (6 entrées, `astro.config.mjs:11-18`). Précédent direct pour la table de redirections de migration.
- `sitemap({ filter })` exclut `/mentions-legales` et `/confidentialite` — cohérent avec leur balise `noindex` (`astro.config.mjs:21-25`).
- `build.inlineStylesheets: 'auto'`.

**Alias (`tsconfig.json`)** : `@components/* @layouts/* @content/* @lib/* @data/* @assets/* @styles/*`.

---

## 1B. Structure du dépôt

```
src/
├── pages/
│   ├── index.astro                 # landing one-page (composée de home/*)
│   ├── [service]/index.astro       # couche 1 — hub service (dynamique)
│   ├── [service]/[metier].astro    # couche 3 — service × métier (dynamique)
│   ├── prestations/{index,[slug]}.astro
│   ├── realisations/{index,[slug]}.astro
│   ├── blog/{index,[slug]}.astro
│   ├── og/[...route].ts            # endpoint OG (astro-og-canvas)
│   ├── a-propos.astro · contact.astro
│   └── mentions-legales.astro · confidentialite.astro   (noindex)
├── content/
│   ├── prestations/*.mdx · realisations/*.mdx · blog/*.mdx
│   └── metiers/*.mdx                # 5 métiers (electricien, macon, menuisier, paysagiste, plombier)
├── components/
│   ├── blocks/   Blocks.astro + 10 blocs (Hero, Grid, Includes, Stats, Timeline, Compare, Pricing, Faq, Testimonial, Form)
│   ├── home/     11 sections de la landing (Hero, HowItWorks, … FinalCta) + CtaRow, RiskNote
│   ├── layout/   Header, Footer, Nav, MobileCtaBar, Seo
│   └── ui/       Section, SectionHead, Button, Card, Grid, Badge, Pill, Eyebrow, Breadcrumbs, PageHeader, Field, Logo
├── layouts/      BaseLayout.astro · ArticleLayout.astro
├── lib/          sections.ts (schéma Zod) · seo.ts (JSON-LD) · accents.ts · og.ts · format.ts
├── data/         site.ts · nav.ts · footer.ts · faq.ts · seo-architecture.ts
├── styles/       design-tokens.css (@theme) · global.css
└── content.config.ts               # 4 collections + schéma `base` commun
docs/familles/    charte-couleur.md + HTML autonomes (palettes par fruit) ; sync-tokens.cjs
scripts/          check-tokens.mjs  (garde-fou « aucune couleur en dur »)
```

**Conventions de nommage** : composants PascalCase ; pages kebab-case ; routes dynamiques `[param].astro` ; contenu MDX en kebab-case, `id` = nom de fichier.

---

## 1C. Conventions & bonnes pratiques EN PLACE (à préserver — section critique)

### Composants — granularité en 4 couches
Architecture en couches explicite (commentée dans `Blocks.astro:2-7`) :
- **Couche 4 — renderer** : `components/blocks/Blocks.astro` mappe `section.type → bloc`.
- **Couche 3 — blocs** : 10 blocs sémantiques dans `components/blocks/` (props typées via `lib/sections.ts`).
- **Couche 2 — primitives UI** : 12 composants dans `components/ui/` (`Section`, `Button`, `Card`, `Grid`, `Eyebrow`…), polymorphes (`as`, `href`), pilotés par slots.
- **Couche 1 — chrome** : `Header`, `Footer`, `MobileCtaBar`, `Seo` dans `components/layout/`.
- **Landing** : `sections/home/*` — 9 sections mono-usage de `/` (composent blocs/primitives), rangées dans `src/sections/` (alias `@sections/*`) : `pages/` reste **routes uniquement**. `views/` = corps de pages servies par une route **dynamique** (familles) ; `sections/` = fragments d'une page statique. Les sections réutilisées ailleurs vivent en `components/` (`sections/FinalCta`, `ui/RiskNote`).

> ⚠️ `components/layout/Nav.astro` semble **non utilisé** (Header source sa nav depuis `@data/nav` directement). Doublon léger à confirmer/nettoyer.

### Layouts — hiérarchie
- `BaseLayout.astro` : `<head>` complet (charset, viewport, favicon, polices Google, `<Seo>`), chrome conditionnel (`bare`, `landing`), padding-top 110px (topbar 38 + header 72), barre mobile. Source unique du shell.
- `ArticleLayout.astro` : enveloppe `BaseLayout` (`type="article"`) + en-tête éditorial (eyebrow, h1, lead, date, breadcrumbs) + `.prose-azelize`. Pour blog/contenu long.
- **Aucune duplication de `<head>`** : tout passe par `BaseLayout` → `Seo`.

### Stylage & tokens — fortement centralisé (Tailwind v4 `@theme`)
- **Source de vérité unique** : `src/styles/design-tokens.css` — couche `:root` (variables) + bloc `@theme` (utilitaires Tailwind v4).
- Tokens couleur exposés `--color-*` (brand, ink, paper, parchment, line… + **45 slots fruit** `--color-{famille}-s{25|50|100}-b{25|50|100}`).
- Tokens typo (`--font-display/sans/mono`), tailles **appariées** `--text-* / --text-*--line-height` (`text-h1` pose taille + interligne), `--tracking-*`, `--radius-*`, `--ease-brand`.
- `global.css` : `@import "tailwindcss"` → `@import design-tokens` → `@layer base` (resets) → `@utility container-site/hero` → `@layer components .prose-azelize` → infra motion (`.reveal`, `.anim`).
- **Garde-fou** : `scripts/check-tokens.mjs` rejette tout `#hex`/`rgb()`/`hsl()` hors `design-tokens.css` ; câblé en CI. → **zéro valeur couleur en dur**, déjà tenu.
- `lib/accents.ts` : type `Accent = menthe|fraise|miel|citron|kiwi` → 4 dictionnaires de **classes littérales** (`accentText/Bg/Border/SoftBg`) — pas de template strings (compatible purge Tailwind).

### Collections de contenu — 4 collections + schéma `base` partagé
`content.config.ts` :
- `base` (commun) : `seo?{title,description,ogImage}`, `updated?`, `tags?`, **`sections?: SectionData[]`** (composable).
- `prestations` (+ `titre`, `resume`, `ordre?`), `realisations` (+ `client`, `resume`, `date`, `couverture?`, `resultats?`), `blog` (+ `titre`, `description`, `date`, `brouillon`), `metiers` (+ `metier`, `titre`, `resume`, `ordre?`).
- Loader `glob` sur `src/content/**`. **`sections` est le pivot** : il permet « 1 page paramétrée = N entrées » sans dupliquer de structure.

### Routage — statique + dynamique gaté
- Statiques : `index`, `contact`, `a-propos`, légales.
- Dynamiques avec `getStaticPaths` :
  - `[service]/index.astro` — alimenté par `SERVICES` filtré `statut === 'ship'` (couche 1).
  - `[service]/[metier].astro` — alimenté par `getCollection('metiers')` (couche 3 ; seul `creation-site-internet` ouvre la matrice via `SERVICE_AVEC_METIERS`).
  - `prestations/[slug]`, `realisations/[slug]`, `blog/[slug]` — `getCollection(...)` (blog filtré `!brouillon`).
- **Gating natif par la donnée** : registre `data/seo-architecture.ts` encode `statut: ship|conditionnel|exclu` par cellule (services + matrices ville/métier). Règle d'or anti-doorway commentée en tête : *seules les `ship` sont générées, indexées, au sitemap*.

### SEO — centralisé et structuré
- `components/layout/Seo.astro` : `<title>`, description, robots (si `noindex`), canonical, OpenGraph complet, Twitter card, + injection JSON-LD.
- `lib/seo.ts` : `resolveSeo()` (défauts depuis `site`) + **8 fabriques JSON-LD** : `organization`, `localBusiness` (`ProfessionalService` + adresse), `breadcrumb`, `article`, `faq` (`FAQPage`), `service`, `creativeWork`.
- Chaque type de page émet le bon JSON-LD (ex. métier → `Service` + `BreadcrumbList` + `FAQPage` dérivée des sections `faq`).
- `Breadcrumbs.astro` visible + `breadcrumbJsonLd()` jumelé.
- `@astrojs/sitemap` + redirections + `noindex` sur légales = hygiène SEO déjà posée.

### Stratégie d'hydratation — **îlots zéro**
- **Aucune intégration framework, aucun `client:*`** (vérifié par recherche). Site 100 % statique.
- Interactivité = **JS vanilla en `<script>`** : menu burger + scroll-state header (`Header.astro`), accordéon FAQ (`FaqBlock.astro`, `max-height` + `aria-expanded`), barre CTA mobile au scroll (`MobileCtaBar.astro`), reveal `IntersectionObserver` + smooth-scroll ancres (`index.astro`), formulaire (swap visuel local, non branché) (`FormBlock.astro`).

### Images
- Assets de marque en SVG inline (`src/assets/azelize-*.svg`, `Logo.astro`). Favicon SVG.
- OG : **générées au build** par `astro-og-canvas` via `pages/og/[...route].ts` (PNG statiques) ; helper `lib/og.ts` (`ogImage(key) → /og/{key}.png`).
- Pas encore d'usage de `<Image/>` Astro ni de visuels photo (placeholders) — point ouvert pour les pages-vitrines (cas Global Cars).

### Qualité
- `npm run check` (astro check) ; `lint` (ESLint v9 : js + ts-eslint + eslint-plugin-astro recommandés ; ignore `dist/ .astro/ docs/`) ; `format` (Prettier 100c, single-quote, trailing-comma all, parser astro) ; `check:tokens`.
- `.editorconfig`, `.prettierrc.json`, `.gitattributes`, `.prettierignore` présents.
- **CI bloquante** : tokens → lint → typecheck+build.

---

## 1D. Schéma de sortie miroir (intitulés comparables à CARTOGRAPHIE-DESIGN.md)

| Axe | Design (source) | Astro (récepteur) |
|---|---|---|
| **Pages** | 54 `.html` autonomes | ~14 routes dont 2 dynamiques génératrices ; le reste devient **données** |
| **Composants** | 16 `.jsx` (1 fin sur `index`, monolithes ailleurs) | 4 couches : 10 blocs + 12 primitives + chrome + 11 sections home, **pur `.astro`** |
| **Chrome** | `site-chrome.jsx` inclus par script + `_chrome.css` | `Header/Footer/MobileCtaBar` + `BaseLayout` (slots), data `nav.ts`/`footer.ts` |
| **Tokens** | `colors_and_type.css` (vars) — palette **Ocean Twilight** + jaune | `design-tokens.css` (`@theme`) — palette **fruit / 17 combos** (voir delta) |
| **Patterns** | `.az-*` partagées + héros/mockups copiés par page | `sections[] → Blocks.astro` (DRY) ; mockups : à composer en blocs |
| **Contenu** | en dur dans markup ; embryons `DATA`/`RATES`/`TERMS` | **collections + `sections` Zod** ; registre `seo-architecture.ts` |
| **Interactivité** | React 18 + Babel standalone (CDN, par page) | **JS vanilla**, zéro îlot |
| **SEO** | par page, `<head>` propre à chacune | **centralisé** `Seo.astro` + `lib/seo.ts` (8 JSON-LD) + sitemap |
| **Dépendances** | React/ReactDOM/Babel CDN sur chaque page | aucune lib runtime ; build-time only (mdx, sitemap, og-canvas) |

---

*Fin de la cartographie Astro. Lecture seule, aucun fichier modifié.*
