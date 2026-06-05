# Architecture & séparation des responsabilités — Rapport d'audit

**Périmètre audité :** `src/` entier — `pages/`, `views/{hubs,metiers,guides,realisations,villes}/`, `sections/{home,shared}/`, `components/{ui,layout,blocks}/`, `content/` (collections MDX), `data/` (TS), `lib/`, `layouts/`, `styles/`. Câblage `import.meta.glob`, schéma Zod des sections, registre SEO.
**Note de santé :** 7/10 — architecture en couches réellement appliquée et cohérente, mais avec un patron de « portage fidèle » qui crée des sources de vérité dormantes (MDX jamais rendus), un dossier orphelin et un résidu du système fruit en contradiction avec CLAUDE.md.

## Résumé exécutif
- L'architecture « en couches » annoncée (routes → vues de portage → blocs composables → contenu) est bien réelle et appliquée avec discipline : chaque route dynamique suit le même patron clair (un composant dédié par page s'il existe, sinon un repli générique piloté par le contenu). C'est un point fort.
- Le mécanisme de « portage fidèle » fait qu'aujourd'hui **chaque page métier/guide/réalisation possède DEUX contenus** : un composant figé dans `views/` (qui gagne toujours) et un fichier MDX (corps + sections) qui n'est jamais affiché tant que le composant existe. C'est une double source de vérité dormante : un risque de maintenance et de confusion (« lequel fait foi ? »).
- Le dossier `src/views/villes/` (3 fichiers) n'est **branché à aucune route ni à aucune collection** : c'est du code mort assumé (gabarit en attente), mais non signalé comme tel hors d'un commentaire interne.
- Le système de couleurs « fruit » (menthe/fraise/miel…) est décrit comme « élagué » dans CLAUDE.md, mais il **subsiste partout** dans le code (schéma des sections, helper `accents.ts`, et ~30 occurrences `accent: 'kiwi'` dans le registre des services). Inerte visuellement, mais source de confusion.
- Frontière home vs blocs : la duplication redoutée n'en est pas vraiment une (les sections home réutilisent les blocs), **sauf le Hero** qui est recopié à la main au lieu de réutiliser `HeroBlock`, et deux blocs (`TestimonialBlock`, `FormBlock`) qui ne sont pas accessibles depuis la couche contenu.

## Constats détaillés

### [ARCH-01] Double source de vérité dormante : `views/` vs `content/` (MDX) sur 4 collections
- **Sévérité :** Élevé
- **Effort :** L
- **Localisation :** `src/pages/[service]/[metier].astro:46-53`, `src/pages/guides/[slug].astro:36-41`, `src/pages/realisations/[slug].astro:31-38`, croisé avec `src/views/{metiers,guides,realisations}/*` et `src/content/{metiers,guides,realisations}/*`
- **Description :** Le patron de routage charge, via `import.meta.glob`, un composant dédié `views/<col>/<slug>.astro` **s'il existe**, et ne se rabat sur le contenu MDX (corps + `sections`) **que sinon**. Or aujourd'hui la couverture est **1:1** : 5 métiers = 5 vues + 5 MDX, 7 guides = 7 vues + 7 MDX, 3 réalisations = 3 vues + 3 MDX. Conséquence : pour chacune de ces 15 pages, **le composant `views/` gagne systématiquement** et le contenu MDX (souvent un corps rédactionnel ou des `sections:` complets) **n'est jamais rendu**. Les MDX servent encore au build (frontmatter `titre`/`resume`/`seo` → méta, JSON-LD, fil d'Ariane, et `getStaticPaths` itère bien la collection), mais leur corps/sections sont du contenu mort à l'affichage.
- **Pourquoi ça compte :** Deux endroits décrivent la même page. Un rédacteur qui corrige le MDX croit modifier la page visible : rien ne change (la vue prime). À l'inverse, une correction de méta dans le MDX se voit, mais pas le corps. Cette divergence silencieuse est un piège de maintenance classique et un risque d'incohérence SEO (le titre `<h1>` de la vue peut diverger du `titre` du frontmatter qui alimente la balise `<title>` et le JSON-LD).
- **Recommandation :** Trancher par collection. Soit (a) considérer `views/` comme la seule source et réduire les MDX à un frontmatter minimal (méta only, supprimer `sections:`/corps inutilisés) en documentant que le corps n'est pas rendu ; soit (b) à terme migrer le contenu des vues vers des `sections` MDX et supprimer les vues une fois la maquette stabilisée. Dans tous les cas, ajouter un garde-fou (script de cohérence ou commentaire en tête de chaque MDX « corps non rendu — voir views/… »).

### [ARCH-02] Dossier `src/views/villes/` orphelin (aucune route, aucune collection)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/_template.astro`, `src/views/villes/lorient.astro`, `src/views/villes/vannes.astro`
- **Description :** Aucune route `pages/` ne génère de page ville, et il n'existe aucune collection `villes` dans `content.config.ts`. Les 3 fichiers ne sont importés par rien (le `import.meta.glob` ville n'existe nulle part). Le registre `seo-architecture.ts` confirme l'intention (matrice `MATRICE_VILLE` toute en `conditionnel`/`exclu`, et le commentaire « ROADMAP — pilotée, non encore buildée »), et `_template.astro:7-8` se déclare lui-même « Composant autonome NON câblé à une route ». C'est donc du code mort **assumé** (scaffolding en attente), mais qui pèse sur la lecture de l'arborescence et peut tromper un nouvel arrivant.
- **Pourquoi ça compte :** Du code non câblé donne l'illusion de pages existantes (pages villes) qui ne sont pas buildées. Risque de confusion, et de divergence avec les conventions/tokens au fil du temps (un fichier non rendu n'est jamais vérifié visuellement). Note : `content.config.ts:52-57` affirme explicitement que les métiers ne sont **pas** du SEO local géographique, ce qui rend la présence de ces gabarits villes d'autant plus ambiguë sur l'orientation réelle.
- **Recommandation :** Soit déplacer ces gabarits hors de `src/` (ex. `docs/` ou une branche/dossier `scaffold/`) jusqu'à activation, soit ajouter un `README` dans `views/villes/` documentant le statut « non câblé — roadmap matrice locale » et garder `_template.astro` seul comme référence.

### [ARCH-03] Système « fruit » non élagué dans le code, en contradiction avec CLAUDE.md
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/lib/sections.ts:12` (`z.enum(['menthe','fraise','miel','citron','kiwi'])`), `src/lib/accents.ts:12-32` (type `Accent` + 5 clés), `src/data/seo-architecture.ts` (~30 occurrences `accent: 'kiwi'|'miel'|…`), `src/content/prestations/sites-et-landing.mdx` (`accent: kiwi`, `accent: miel`)
- **Description :** CLAUDE.md et la mémoire projet déclarent le système fruit « SUPERSEDED et élagué », tokens fruit retirés de `design-tokens.css`. Côté logique, c'est cohérent : `accents.ts` mappe **toutes** les clés fruit vers `brand` (donc inerte visuellement). Mais le vocabulaire fruit reste **omniprésent** : l'enum Zod l'impose encore comme seules valeurs valides de `accent`, et le registre/contenu le sème partout. Aucune incohérence visuelle (tout pointe `brand`), mais une incohérence documentaire/sémantique vivante.
- **Pourquoi ça compte :** Un développeur lisant `accent: 'kiwi'` dans `seo-architecture.ts` peut croire que la couleur a un effet, ou réintroduire un token fruit. L'enum ferme aussi la porte à des valeurs de tone/accent réellement utiles. C'est de la dette de nommage qui contredit la doc de référence, et qui complexifie l'audit couleurs.
- **Recommandation :** Réduire `accent` à une valeur neutre (`z.literal('brand').optional()` ou suppression) et faire un remplacement global des `accent: '<fruit>'` par soit rien, soit `accent: 'brand'`. Conserver `accents.ts` comme indirection unique mais avec le type réel restant. À défaut d'élagage immédiat, aligner CLAUDE.md (« fruit conservé comme label inerte ») pour ne plus dire « élagué » alors qu'il est partout.

### [ARCH-04] `tone: 'brand-soft'` dans le schéma alors que les bandes sont brun-olive (warm pivot)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `src/lib/sections.ts:13` (`z.enum(['paper','parchment','dark','brand-soft'])`), à confronter avec `src/components/ui/Section.astro` (mapping `tone`)
- **Description :** Le schéma autorise `tone: 'brand-soft'` pour les sections. Après le pivot couleurs « warm » (bandes/encre brun-olive, `brand-900` = `#403D30`), il faut vérifier que `Section.astro` honore encore `brand-soft` de façon cohérente avec la palette, ou si cette valeur est devenue un résidu sans usage. Aucune section MDX/registre n'a été observée utilisant `brand-soft` (les tones vus sont `parchment`).
- **Pourquoi ça compte :** Une valeur de tone offerte par le schéma mais non gérée (ou gérée avec une couleur retirée) peut produire un rendu incohérent si quelqu'un l'utilise. C'est un point à confirmer côté `Section.astro` (hors de ce périmètre de lecture détaillée, d'où « à vérifier »).
- **Recommandation :** Vérifier le `switch`/mapping de `tone` dans `Section.astro`. Si `brand-soft` n'est ni utilisé ni mappé à un token valide, le retirer de l'enum ; sinon documenter le rendu attendu.

### [ARCH-05] Home `Hero` recopié à la main au lieu de réutiliser `HeroBlock` (frontière sections/blocs)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/sections/home/Hero.astro:11-46` vs `src/components/blocks/HeroBlock.astro:17-43`
- **Description :** Le point chaud « duplication home vs blocs » est **en grande partie un faux positif** : `home/Faq.astro:6,12` réutilise `FaqBlock`, `home/Pricing.astro:8,31` réutilise `PricingBlock`, `home/Proof.astro` réutilise `TestimonialBlock`/`StatsBlock`, `home/Problem` etc. sont des compositions bespoke légitimes (couche page assemblant des blocs). La vraie duplication est le **Hero** : `home/Hero.astro` réimplémente intégralement la structure de `HeroBlock` (même `max-w-[1080px]`, mêmes classes `anim-*`, même frame visuel) au lieu de l'utiliser comme le fait `Blocks.astro:30-39`. De plus, `home/Hero` emploie des valeurs arbitraires (`text-[clamp(2.6rem,6vw,5rem)]`, `pt-[clamp(...)]`) là où `HeroBlock` est tokenisé (`text-display`, `hero-pad`, `text-lead`).
- **Pourquoi ça compte :** Deux héros à maintenir en parallèle : une évolution de design du hero devra être faite à deux endroits, avec risque de divergence (et le home/Hero diverge déjà des tokens canoniques recommandés par CLAUDE.md). C'est précisément le couplage que la couche « blocs » est censée éviter.
- **Recommandation :** Réécrire `home/Hero.astro` comme une fine composition au-dessus de `HeroBlock` (slots `lead`/`cta`/`showcase`), ce qui réaligne aussi le hero home sur les tokens `text-display`/`text-lead`/`hero-pad`. Si le frame « Visuel à venir » est spécifique à la home, le passer en slot `showcase`.

### [ARCH-06] Blocs non câblés à la couche contenu : `TestimonialBlock` et `FormBlock`
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/blocks/Blocks.astro:11-18` (imports) et `:50-63` (mapping) vs `src/components/blocks/TestimonialBlock.astro`, `src/components/blocks/FormBlock.astro`, `src/components/blocks/CtaBand.astro`
- **Description :** Le contexte décrit `Blocks.astro` comme mappant `type → bloc` pour 12 blocs, dont `TestimonialBlock`, `FormBlock`, `CtaBand`. En réalité `Blocks.astro` ne connaît que 8 types (hero, grid, includes, stats, timeline, compare, pricing, faq) — c'est cohérent avec le schéma `sections.ts`. `TestimonialBlock` n'est utilisé que par `home/Proof.astro`, `FormBlock` que par `FinalCta.astro`/`Field.astro`, `CtaBand` directement par les vues/pages. Ils ne sont donc **pas pilotables par le contenu** (impossible de déclarer une section témoignage ou formulaire dans un MDX).
- **Pourquoi ça compte :** Frontière implicite, non documentée : un rédacteur attend de pouvoir ajouter un témoignage via `sections:` et ne le peut pas. Ce n'est pas un bug (ces blocs sont surtout des composants de page), mais l'écart entre « 12 blocs composables » annoncé et « 8 types pilotables » mérite d'être explicité.
- **Recommandation :** Soit ajouter les types `testimonial`/`form`/`ctaBand` au schéma + mapping `Blocks.astro` (cohérence de la promesse « page paramétrée »), soit reclasser `TestimonialBlock`/`FormBlock`/`CtaBand` (ce sont plutôt des composants de section partagés) et documenter que `Blocks.astro` couvre 8 types.

### [ARCH-07] Deux taxonomies « services » parallèles : collection `prestations` vs registre `SERVICES`
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/data/seo-architecture.ts:32-689` (`SERVICES`, 13 services, routes `/{service}`) vs `src/content/prestations/*` + `src/pages/prestations/[slug].astro` + `src/pages/prestations/index.astro`
- **Description :** Deux notions d'offre coexistent : (1) le registre TS `SERVICES` (13 entrées, hubs `/{service}` avec `hub: SectionData[]` inline) qui se présente comme « SOURCE DE VÉRITÉ UNIQUE de l'architecture » ; (2) la collection MDX `prestations` (1 entrée `sites-et-landing`) routée sous `/prestations/*` avec sa propre page index « Ce que nous faisons ». Les deux décrivent l'offre commerciale, avec des URLs et des modèles de données différents, sans lien explicite entre eux. La page `/prestations` liste 1 item ; les hubs `/{service}` en exposent 13.
- **Pourquoi ça compte :** Risque de confusion de navigation/SEO (deux familles d'URLs pour « ce qu'on fait ») et de double maintenance des descriptions d'offre. Le commentaire « source de vérité UNIQUE » de `seo-architecture.ts` est contredit par l'existence d'une collection parallèle. Pour un futur contributeur : où ajouter une nouvelle offre — un service au registre ou une prestation MDX ?
- **Recommandation :** Clarifier la frontière dans la doc d'architecture : `prestations` = vitrine éditoriale détaillée d'un sous-ensemble, `SERVICES` = matrice SEO/hubs ; ou fusionner si la distinction n'est pas voulue. À minima, créer un maillage explicite (les hubs pointent vers la prestation détaillée correspondante quand elle existe) et retirer le qualificatif « UNIQUE » du commentaire tant que les deux coexistent.

### [ARCH-08] `hub: SectionData[]` volumineux codé en dur dans un fichier `data/` TS (650+ lignes)
- **Sévérité :** Mineur
- **Effort :** M
- **Localisation :** `src/data/seo-architecture.ts:41-688`
- **Description :** Le contenu éditorial des 13 hubs (hero, includes, timeline, grid, compare, faq — des centaines de lignes de copie française) est embarqué en dur dans le registre TS, alors que tous les autres contenus longs passent par des collections MDX (`metiers`, `guides`, etc.). Mélange des responsabilités : `seo-architecture.ts` est à la fois registre structurel (statuts ship/draft, matrice) **et** dépôt de contenu rédactionnel. Note : ce contenu n'est de toute façon affiché qu'en repli (les vues `views/hubs/*` existent toutes pour les 13 services et priment — cf. ARCH-01 appliqué aux hubs).
- **Pourquoi ça compte :** Un fichier `data/` de 750 lignes mêlant config et copie est pénible à maintenir et à relire ; et comme les `views/hubs/*` priment, ce `hub:` est en pratique un repli mort aujourd'hui (même problème que ARCH-01). Le registre structurel y perd en lisibilité.
- **Recommandation :** Soit déplacer le contenu de `hub:` vers une collection `services` MDX (aligné sur le reste), soit, si les vues priment définitivement, réduire `hub:` au strict nécessaire (ou le supprimer). Garder dans `seo-architecture.ts` uniquement la structure (slug, nom, statut, matrice).

### [ARCH-09] Couche `lib/` saine et bien séparée — aucune dépendance circulaire observée
- **Sévérité :** Mineur (constat positif documenté)
- **Effort :** S
- **Localisation :** `src/lib/{seo,og,accents,format,sections}.ts`
- **Description :** Les modules `lib/` ont des rôles nets et un sens de dépendance descendant : `sections.ts` (schéma Zod, importé par `content.config.ts` et `seo-architecture.ts`), `seo.ts` (helpers JSON-LD, dépend de `data/site`), `og.ts`, `accents.ts`, `format.ts`. Aucun import croisé `lib ↔ components` ni cycle détecté à la lecture des graphes d'import principaux. La direction `pages → views/sections → components → lib/data` est respectée.
- **Pourquoi ça compte :** Une couche utilitaire sans cycle ni couplage remontant est exactement ce qu'on attend ; c'est un acquis à préserver lors des refactors (notamment l'élagage fruit d'ARCH-03 qui touche `accents.ts` et `sections.ts`).
- **Recommandation :** Préserver cette discipline. Lors de l'élagage fruit, garder `accents.ts` comme unique point d'indirection couleur d'accent.

## Points positifs
- Le patron de routage est **uniforme et lisible** sur les 4 collections : même structure `import.meta.glob` → composant dédié sinon repli `Blocks`/`ArticleLayout`, avec méta/JSON-LD/fil d'Ariane systématiquement construits au même endroit. Facile à apprendre une fois, applicable partout.
- **Séparation `ui` / `layout` / `blocks` claire** : primitives réutilisables (`Button`, `Card`, `Section`…), chrome de page (`Header`, `Footer`, `Seo`), blocs composables. Pas de mélange constaté.
- **Système de blocs piloté par schéma Zod** (`sections.ts` ↔ `Blocks.astro`) bien conçu : union discriminée typée, un seul point de mapping, réutilisé par hubs, métiers, guides, réalisations, prestations.
- **Registre SEO avec statuts `ship`/`conditionnel`/`exclu`** : excellente discipline anti-doorway — le build suit la curation, les pages sans contenu réel ne sont pas générées.
- **Réutilisation effective des blocs par les sections home** (`Faq`→`FaqBlock`, `Pricing`→`PricingBlock`, `Proof`→`Testimonial/StatsBlock`) : la duplication redoutée est limitée au seul Hero (ARCH-05).
- **Sources de données centralisées** (`data/pricing.ts`, `data/nav.ts`) consommées partout (ex. prix importé dans `_template.astro`, jamais codé en dur), conforme à `check:tokens`.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| ARCH-01 | Élevé | L | Double source de vérité dormante `views/` vs `content/` (MDX) |
| ARCH-02 | Moyen | S | Dossier `views/villes/` orphelin (aucune route/collection) |
| ARCH-03 | Moyen | M | Système « fruit » non élagué, contredit CLAUDE.md |
| ARCH-04 | Hypothèse à vérifier | S | `tone: 'brand-soft'` résiduel après pivot warm |
| ARCH-05 | Moyen | M | Home `Hero` recopié au lieu de réutiliser `HeroBlock` |
| ARCH-06 | Mineur | S | `TestimonialBlock`/`FormBlock` non câblés à la couche contenu |
| ARCH-07 | Moyen | M | Deux taxonomies services : `prestations` vs `SERVICES` |
| ARCH-08 | Mineur | M | Contenu hub volumineux codé en dur dans `data/` TS |
| ARCH-09 | Mineur | S | `lib/` saine, pas de cycle (constat positif) |
