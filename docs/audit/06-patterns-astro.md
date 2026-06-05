# Patterns Astro & îlots — Rapport d'audit

**Périmètre audité :** `src/pages/**` (routes statiques et dynamiques), `src/views/**` (portages Design mappés par glob), `src/sections/**`, `src/components/{blocks,ui,layout}/**`, `src/content.config.ts` (Content Layer API), `src/lib/sections.ts`, `src/data/seo-architecture.ts`, `src/pages/og/[...route].ts`, sortie `dist/`.
**Note de santé :** 8/10 — usage d'Astro 5 très propre et idiomatique (Content Layer glob loader, slots, getStaticPaths typés, aucune hydratation client superflue) ; quelques scories : code mort `views/villes/`, liens internes morts, `render()` parfois inutile, dépendance réseau au build pour les polices OG.

## Résumé exécutif
- Le site est **réellement statique** : aucune directive `client:*` (pas de React/Vue hydraté). Les fonctionnalités interactives (menus, accordéons, simulateur) sont du JavaScript natif livré et optimisé par Astro — c'est le bon choix pour ce type de site vitrine, et c'est excellent pour la performance.
- Astro 5 est utilisé dans les règles de l'art : chargement du contenu via le **Content Layer API** (`glob` loader), génération des pages via `getStaticPaths` typés, composition par **slots** plutôt que duplication. Très peu d'« anti-patterns ».
- **Problème principal : du code mort.** Trois pages « villes » (`lorient`, `vannes`, plus un gabarit) existent dans `src/views/villes/` mais **aucune route ne les publie** — elles ne sont jamais construites (vérifié dans `dist/`). Pire, plusieurs pages métier pointent des liens vers ces villes inexistantes : ce sont des **liens internes cassés (erreurs 404)** pour le visiteur et pour Google.
- Le rendu du contenu MDX (`render()`) est parfois exécuté pour rien sur les pages « guides » et « réalisations » quand un composant Design dédié prend le relais — gaspillage mineur au build.
- La génération des images de partage social (Open Graph) télécharge ses polices depuis un **CDN externe au moment du build** : si ce CDN est indisponible, le build peut échouer ou se dégrader. À fiabiliser.

## Constats détaillés

### [ASTRO-01] Pages « villes » jamais publiées : code mort + liens internes cassés (404)
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/views/villes/lorient.astro`, `src/views/villes/vannes.astro`, `src/views/villes/_template.astro` ; liens : `src/views/metiers/electricien.astro:130-131`, `src/views/metiers/plombier.astro:149-150`, `src/views/metiers/vtc.astro:51`
- **Description :** Le dossier `src/views/villes/` contient trois fichiers (deux pages + un gabarit), mais **aucune route ne les charge** : les routes mappées par `import.meta.glob` ne ciblent que `views/hubs/*`, `views/metiers/*`, `views/guides/*`, `views/realisations/*` (vérifié dans les 4 fichiers `pages/.../[*].astro`). Confirmation par la sortie de build : `dist/creation-site-internet/` ne contient que `electricien/`, `garage-automobile/`, `macon/`, `plombier/`, `vtc/` — **aucun `lorient/` ni `vannes/`**. Or plusieurs pages métier contiennent des liens « Site à Lorient » → `/creation-site-internet/lorient` et « Site à Vannes » → `/creation-site-internet/vannes` : ces URL retournent une **404**. `vtc.astro:51` utilise en plus une forme d'URL incohérente (`/creation-site-internet-lorient`, sans slash), elle aussi morte.
- **Pourquoi ça compte :** Du code mort entretient la confusion (« est-ce câblé ou pas ? »), et surtout des liens internes vers des 404 nuisent à l'expérience visiteur et au SEO (Google suit ces liens et rencontre des pages absentes). Comme l'orchestrateur l'a noté, `content.config.ts` affirme explicitement que les pages métier ne sont **pas** du SEO local géographique — l'existence de pages villes contredit cette intention.
- **Recommandation :** Décider du sort des villes. Soit (a) les **câbler** réellement (route `[ville].astro` + statut `ship` dans `seo-architecture.ts`, aujourd'hui `conditionnel`), soit (b) **supprimer** `src/views/villes/` et retirer les liens « Site à Lorient/Vannes » des pages métier. Dans les deux cas, corriger la forme d'URL de `vtc.astro:51`.

### [ASTRO-02] `render(entry)` exécuté même quand un composant Design dédié prend le relais
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/pages/guides/[slug].astro:41`, `src/pages/realisations/[slug].astro:38`
- **Description :** Sur ces deux routes, `const { Content } = await render(entry);` est appelé **systématiquement**, alors que si un composant dédié existe (`GuideComponent` / `CaseComponent`), le `Content` MDX n'est jamais affiché. La route métier (`[metier].astro:53`) fait justement l'inverse, et correctement : `const { Content } = MetierComponent ? { Content: null } : await render(entry);` — le rendu MDX n'est compilé que s'il sera utilisé.
- **Pourquoi ça compte :** `render()` compile le MDX (rendu de markdown, exécution des composants imbriqués) : l'exécuter pour un résultat jeté est du travail de build inutile. Impact faible aujourd'hui (peu d'entrées), mais c'est une incohérence de pattern entre routes sœurs qui mérite d'être alignée.
- **Recommandation :** Reproduire le garde de `[metier].astro` : ne `render()` que dans la branche éditoriale (quand ni `GuideComponent`/`CaseComponent` ni un composant dédié ne priment).

### [ASTRO-03] Génération des images OG dépendante d'un CDN externe au build
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/pages/og/[...route].ts:83-86`
- **Description :** `OGImageRoute` charge les polices (`Bricolage Grotesque`, `Hanken Grotesk`) directement depuis `https://cdn.jsdelivr.net/...` au moment du build. Le build a donc une **dépendance réseau dure** vers un service tiers.
- **Pourquoi ça compte :** Si jsDelivr est lent, bloqué (CI sans accès réseau, pare-feu) ou modifie l'URL `@latest`, la génération des images sociales peut échouer ou produire un fallback non désiré — sans signal clair. Les images de partage (LinkedIn, Facebook, X) sont un atout de conversion ; leur build doit être déterministe.
- **Recommandation :** Vendre les fichiers `.ttf` localement (ex. via `@fontsource`) et passer un chemin local à `fonts:` plutôt qu'une URL CDN. Build reproductible et hors-ligne.

### [ASTRO-04] Enum `accent` encore en valeurs « fruit » dans le schéma des sections
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/lib/sections.ts:12-13`
- **Description :** `const accent = z.enum(['menthe','fraise','miel','citron','kiwi']).optional();` et `tone` inclut `'brand-soft'`. Le système « fruit / 17 combinaisons » est pourtant déclaré **superseded et élagué** par CLAUDE.md, et `lib/accents.ts` renvoie `brand` pour tout accent (label inerte). Le schéma valide donc encore des libellés qui n'ont plus aucun effet visuel, et accepterait du contenu MDX utilisant `accent: 'fraise'` comme si c'était signifiant.
- **Pourquoi ça compte :** Côté patterns Astro/Zod, un schéma qui décrit des options sans effet est trompeur pour un rédacteur de contenu et pour la maintenance : il suggère des choix qui n'existent plus. C'est un drift entre le schéma et la réalité du design system. (À recouper avec l'axe « cohérence design/couleurs ».)
- **Recommandation :** Soit retirer le champ `accent` du schéma (et des props inertes) si plus aucune sémantique, soit le remplacer par une enum reflétant la palette réelle. Vérifier qu'aucun MDX existant ne dépend des valeurs fruit avant de trancher.

### [ASTRO-05] Duplication structurelle Hero home vs HeroBlock
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/sections/home/Hero.astro` vs `src/components/blocks/HeroBlock.astro`
- **Description :** Les deux composants partagent quasi la même ossature (`container-site` → `max-w-[1080px]` → `h1 font-display ... [&_em]:text-brand`). `HeroBlock` est le hero générique piloté par slots (réutilisé par `Blocks.astro`) ; `Hero.astro` est la version landing bespoke (classes d'animation `anim-2..5`, `RiskNote`, CTA spécifiques). La frontière est défendable (la home a des besoins propres), mais l'ossature dupliquée peut diverger silencieusement (un ajustement de `max-width` ou de typographie sur l'un n'atteint pas l'autre).
- **Pourquoi ça compte :** Risque de dérive visuelle entre la home et les pages générées si l'un évolue sans l'autre. Note : contrairement à ce qu'on pouvait craindre, **il n'y a PAS de duplication FAQ/Pricing** — `sections/home/Faq.astro` **compose** `FaqBlock` (voir `Faq.astro:6,12`), ce qui est exactement le bon pattern.
- **Recommandation :** Optionnel. Si la home doit rester bespoke, documenter en commentaire le lien de parenté avec `HeroBlock`. Sinon, factoriser l'ossature commune dans `HeroBlock` et passer les variantes d'animation par prop/slot.

### [ASTRO-06] JavaScript client substantiel dans un site « statique » (pour information)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** ~25 blocs `<script>` (ex. `src/pages/simulateur-investissement.astro:210`, `src/pages/devis.astro:283`, `src/pages/cookies.astro:365`, `src/components/layout/Header.astro:170`, `src/components/blocks/FormBlock.astro:76`)
- **Description :** Le site est statique au sens « pas d'îlots hydratés », mais embarque une bonne quantité de JS natif (menus, accordéons FAQ, bannière cookies, simulateur d'investissement, devis interactif). Ces `<script>` sans `is:inline` sont **traités/bundlés par Astro** (hash, minification, scoping) — c'est le bon usage. Les `is:inline` ne servent qu'à des micro-injections (`document.documentElement.classList.add('anim')` anti-flash, et `set:html` de configs JSON `window.__SI_CONFIG__`).
- **Pourquoi ça compte :** Aucun problème de pattern Astro en soi — c'est noté pour mémoire : la promesse « quasi 100% HTML statique » est exacte côté hydratation, mais l'interactivité repose sur du JS vanilla non négligeable. Un audit perf dédié (poids JS, FormBlock, simulateur) pourrait être pertinent. Pas de fuite XSS détectée : les `set:html` portent soit du JSON sérialisé (`JSON.stringify` de données internes), soit des constantes locales (`ICONS` dans `Header.astro:14`), jamais de l'entrée utilisateur.
- **Recommandation :** Aucune action requise. Si l'interactivité s'étoffe, envisager d'extraire les scripts récurrents (accordéon, reveal) dans des modules partagés `src/scripts/` plutôt que de les redéclarer par page.

## Points positifs
- **Zéro directive `client:*`** : le site tient sa promesse statique, aucune hydratation superflue à payer côté visiteur.
- **Content Layer API d'Astro 5 utilisé correctement** : toutes les collections passent par `glob({ pattern: '**/*.mdx', base: ... })` dans `content.config.ts` (API moderne, pas l'ancien dossier magique `src/content`).
- **`getStaticPaths` systématiquement typés** via `satisfies GetStaticPaths`, avec `props` passés proprement (pas de re-fetch dans le corps de page).
- **Composition par slots exemplaire** : `Astro.slots.has(...)` utilisé pour le rendu conditionnel (HeroBlock, FaqBlock, FormBlock, SectionHead, PageHeader, CompareBlock) — pattern Astro idiomatique, et `sections/home/Faq.astro` réutilise `FaqBlock` au lieu de le dupliquer.
- **Globs eager bien ciblés** : `import.meta.glob('../../views/.../*.astro', { eager: true })` limité à un dossier par route, indexé par clé exacte — coût de build maîtrisé.
- **`set:html` sans surface XSS** : uniquement du JSON sérialisé interne et des constantes locales ; le JSON-LD (`Seo.astro:43`) est sérialisé via `JSON.stringify`.
- **Pas de raster à optimiser** : le site n'utilise que des SVG (logos) inline/en assets ; l'absence d'`astro:assets`/`<Image>` est donc justifiée, pas un manque.
- **OG images pré-rendues au build** (astro-og-canvas) sans adapter SSR : bon choix pour un site statique.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| ASTRO-01 | Élevé | M | Pages « villes » jamais publiées : code mort + liens internes 404 |
| ASTRO-02 | Mineur | S | `render(entry)` exécuté inutilement quand un composant dédié prime |
| ASTRO-03 | Moyen | M | Génération OG dépendante d'un CDN externe au build |
| ASTRO-04 | Moyen | S | Enum `accent` encore en valeurs « fruit » dans le schéma sections |
| ASTRO-05 | Mineur | S | Duplication structurelle Hero home vs HeroBlock |
| ASTRO-06 | Hypothèse à vérifier | S | JS client substantiel dans un site « statique » (info) |
