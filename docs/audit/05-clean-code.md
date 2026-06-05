# Clean code & duplication — Rapport d'audit

**Périmètre audité :** `src/components/` (ui, blocks, layout), `src/sections/` (home, shared), `src/views/` (hubs, metiers, guides, realisations, villes), `src/layouts/`. Analyse statique en lecture seule (comptage d'occurrences, comparaison de fichiers, vérification vs CLAUDE.md).
**Note de santé :** 5/10 — socle de primitives propre et bien documenté, mais une couche `views/` qui ré-inline massivement le markup au lieu d'utiliser ces primitives, des valeurs arbitraires Tailwind partout (contre la convention CLAUDE.md), et des reliquats du système « fruit » abandonné.

## Résumé exécutif
- Le projet a deux « niveaux » de qualité très différents : les briques réutilisables (`components/ui`, `components/blocks`) sont soignées, typées et commentées ; les pages de la couche `views/` (services, métiers, villes, guides) recopient le même HTML à la main au lieu de réutiliser ces briques.
- Conséquence concrète : un changement de style (ex. l'apparence d'une « pastille » de lien ou d'une « carte ») doit être répété dans 18 à 20 fichiers au lieu d'un seul. Risque élevé d'incohérences au fil du temps.
- Deux pages métier (plombier / électricien) sont identiques à ~80 % : ce sont des copies-collés qui devraient être un seul gabarit paramétré.
- La convention maison (préférer les classes Tailwind « canoniques » aux valeurs entre crochets `[..]`) est très peu respectée dans `views/` : plus de 100 valeurs arbitraires dans certains fichiers, dont beaucoup ont un équivalent canonique.
- Des restes de l'ancien système de couleurs « fruit » (mots `menthe`, `accent`) traînent encore comme valeurs par défaut et dans des commentaires obsolètes (« Menthe », « Jet ») : du code mort/trompeur à nettoyer, sans effet visuel mais source de confusion.

## Constats détaillés

### [CLEAN-01] Les primitives `Card`, `Pill`, `Grid`, `Badge`, `PageHeader`, `Breadcrumbs` sont quasi inutilisées : le markup est ré-inliné dans `views/`
- **Sévérité :** Élevé
- **Effort :** L
- **Localisation :** `src/components/ui/Card.astro`, `Pill.astro`, `Grid.astro`, `Badge.astro`, `PageHeader.astro` vs l'ensemble de `src/views/`
- **Description :** `Card` n'est utilisé que dans 2 fichiers (`pages/prestations/index.astro`, `pages/[service]/index.astro`) et **0** fichier de `views/` ; `Pill`, `Grid`, `Badge`, `PageHeader`, `Breadcrumbs` sont utilisés dans **0** fichier de `views/`. À la place, le markup équivalent est écrit à la main : la « carte » `rounded-sm/md border border-line bg-paper p-6` apparaît inline **18 fois** dans `views/`, et la « pastille de lien » `rounded-full border border-line-strong bg-paper px-[15px] py-2 …` apparaît dans **20 fichiers** (identite-visuelle, creation-site-internet, tous les métiers, les villes, plusieurs guides…). Exemple `src/views/hubs/identite-visuelle.astro:135` (carte étape), `:158` (carte FAQ), `:182` (pastille de lien).
- **Pourquoi ça compte :** la promesse d'un design system (un composant = une vérité visuelle) n'est pas tenue. Modifier le style d'une carte ou d'une pastille oblige à éditer ~20 fichiers ; en pratique on en oublie → divergences visuelles. C'est la principale dette de cette base.
- **Recommandation :** extraire 3 composants — une `Pill`/`TagLink` (lien-pastille), réutiliser `Card` pour les cartes étape/FAQ/INCLUS, et un petit `LinkChips`/`Maillage` pour les listes de liens internes — puis remplacer les occurrences inline dans `views/`. Prioriser pastille + carte (les plus dupliquées).

### [CLEAN-02] Pages métier dupliquées à ~80 % (plombier ≈ électricien ≈ maçon ≈ vtc…)
- **Sévérité :** Élevé
- **Effort :** L
- **Localisation :** `src/views/metiers/plombier.astro` (429 l.), `electricien.astro` (386 l.), `macon.astro`, `garage-automobile.astro`, `vtc.astro`
- **Description :** la comparaison ligne à ligne de `plombier.astro` et `electricien.astro` donne **316 lignes communes** (sur ~400) : même structure de sections, mêmes classes, seuls le texte et quelques chiffres changent. Ce sont des copies-collés manuels, pas un gabarit.
- **Pourquoi ça compte :** chaque page métier est un fichier de 400 lignes à maintenir indépendamment ; la moindre évolution de structure (ajout d'une section, changement de hiérarchie de titres) doit être refaite N fois. Multiplie le coût de maintenance et le risque d'incohérence entre métiers.
- **Recommandation :** convertir ces pages en un gabarit unique piloté par données (un objet de contenu par métier, rendu par un seul composant de layout métier), à la manière de ce que fait déjà `Blocks.astro`/`lib/sections.ts` pour les pages dynamiques. Le contenu textuel non définitif (placeholder) rend cette refonte d'autant moins risquée.

### [CLEAN-03] `src/views/villes/_template.astro` (+ lorient/vannes) : gabarit/scaffold livré dans le code source, sans route
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/_template.astro` (300 l.), `lorient.astro` (255 l.), `vannes.astro` (253 l.)
- **Description :** `_template.astro` est un fichier-gabarit (préfixe `_`, 300 lignes de markup réel) rangé dans `views/`. Aucune référence à `villes/` ni à `_template` n'a été trouvée dans `src/pages/`, `src/lib/`, `src/data/` ; `lorient` et `vannes` partagent **158 lignes** identiques. (Hypothèse côté routage à confirmer par l'audit architecture, mais aucun import glob détecté.)
- **Pourquoi ça compte :** un scaffold dans l'arborescence source brouille la lecture (« est-ce du code vivant ? ») et, s'il est balayé par un `import.meta.glob`, peut générer une page fantôme. Du code mort présumé alourdit la base.
- **Recommandation :** sortir `_template.astro` du code source (le placer en `docs/` ou en snippet) ; statuer sur lorient/vannes (les brancher via un gabarit ville unique façon CLEAN-02, ou les retirer s'ils ne sont pas destinés à être publiés).

### [CLEAN-04] Valeurs Tailwind arbitraires `[..]` massives dans `views/`, contre la convention CLAUDE.md (classes canoniques)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/views/hubs/referencement-seo.astro` (120 occurrences `[..]`), `villes/_template.astro` (101), `realisations/global-cars.astro` (101), `views/metiers/plombier.astro` (96), `Header.astro` (87)…
- **Description :** CLAUDE.md impose de préférer une classe canonique quand un équivalent existe (`px-[15px]`→`px-3.75`, `mb-[18px]`→`mb-4.5`, `mt-[16px]`→`mt-4`, `py-[18px]`→`py-4.5`, `mt-[3px]`→`mt-0.75`…). Les comptages montrent des centaines d'occurrences évitables : `px-[15px]`×24, `mt-[22px]`×16, `mb-[18px]`×16, `px-[22px]`×13, `py-[18px]`×4, etc. Certaines sont légitimes (vraies valeurs hors-grille comme `gap-[9px]`, `h-[9px]`, ou des `clamp()`/`[22ch]`), mais une large part a un équivalent canonique.
- **Pourquoi ça compte :** au-delà du non-respect de la convention maison, les valeurs arbitraires ad hoc créent une échelle d'espacement informelle et incohérente (pourquoi `[15px]` ici et `px-4` là ?), nuisent à la lisibilité et empêchent l'IntelliSense de suggérer/valider.
- **Recommandation :** passer une fois sur `views/` (et `Header.astro`) pour convertir les arbitraires « sur grille » vers les pas canoniques v4 ; ne garder `[..]` que pour `clamp()`, les `ch`, et les valeurs réellement hors-échelle. Quantifier avant/après avec le même `grep`.

### [CLEAN-05] Duplication conceptuelle Hero : `sections/home/Hero.astro` vs `blocks/HeroBlock.astro`
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/sections/home/Hero.astro:11-46` et `src/components/blocks/HeroBlock.astro:17-43`
- **Description :** les deux composants rendent la même structure de hero (h1 `max-w-[22ch]` centré + lead `max-w-[62ch]` + CTA + showcase `aspect-[16/8]`, mêmes classes `anim-2..5`). Différence notable : `HeroBlock` utilise les **tokens** (`text-display`, `text-lead`, `hero-pad`) tandis que `Hero` ré-écrit les **valeurs arbitraires** (`text-[clamp(2.6rem,6vw,5rem)]`, `pt-[clamp(146px,14vw,190px)]`, `text-[clamp(1.0625rem,1.6vw,1.3rem)]`). Le hero gradient `repeating-linear-gradient` est par ailleurs réinventé dans 11 fichiers (`MOCKUP`/inline style).
- **Pourquoi ça compte :** deux sources de vérité pour « le hero », divergentes (l'une tokenisée, l'autre non) : les évolutions ne se propagent pas, et `Hero.astro` est en dérive vs la convention tokens. Le motif « visuel à venir » dupliqué 11× est aussi un candidat composant.
- **Recommandation :** faire reposer `Hero.astro` sur `HeroBlock` (ou aligner ses classes sur les tokens `text-display`/`text-lead`/`hero-pad`), et extraire un composant `MockupFrame`/`Placeholder` pour le gradient « visuel à venir ».

### [CLEAN-06] Reliquats du système « fruit » : défaut `accent = 'menthe'` partout (label mort mais trompeur)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/components/ui/Eyebrow.astro:15`, `SectionHead.astro:17`, `PageHeader.astro:14`, `Badge.astro:12`, `Pill.astro:13`, `blocks/IncludesBlock.astro:15`, `StatsBlock.astro:17`, `TimelineBlock.astro:18` ; + 11 sites passent `accent="menthe"` (`sections/home/Pricing.astro:16`, `Proof.astro:31,39`, plusieurs hubs)
- **Description :** CLAUDE.md indique que le système fruit est *superseded et élagué* et que `lib/accents.ts` renvoie `brand` pour tout. C'est bien le cas (`accents.ts:14-32` mappe tout vers `brand`), mais 8 composants gardent `accent = 'menthe'` en valeur par défaut et 11 appels écrivent explicitement `accent="menthe"`. La valeur n'a **aucun effet** (tous les fruits → `brand`) : c'est du bruit qui survit. (À distinguer du DRIFT réel signalé sur `lib/sections.ts` — hors de ce périmètre, à voir avec l'audit data/schéma.)
- **Pourquoi ça compte :** un lecteur croit qu'`accent="menthe"` colore quelque chose en vert, alors que c'est inerte. C'est trompeur et entretient l'idée d'un système de couleurs qui n'existe plus. Risque de réintroduire la complexité « fruit » par mimétisme.
- **Recommandation :** retirer les `accent="menthe"` explicites (puisque sans effet) et, à terme, le param `accent` des composants (ou changer le défaut en un nom neutre). À coordonner avec l'élagage du type `Accent` côté `lib/`.

### [CLEAN-07] Commentaires obsolètes : « Jet », « Menthe », « bande sombre Jet » (couleurs retirées du système)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Section.astro:6` (« tone dark = bande sombre Jet »), `blocks/CtaBand.astro:5` (« Bande Menthe profonde »), `blocks/PricingBlock.astro:4` (« en Menthe (marque) »), `sections/home/Pricing.astro:2`, `Proof.astro:2`
- **Description :** plusieurs en-têtes de composants décrivent encore la palette par les noms abandonnés. CLAUDE.md est explicite : Jet `#2D3138` est **retiré** et le système fruit (Menthe…) est superseded. Aucune couleur en dur ni Jet réel n'a été trouvé dans le markup (le `check:tokens` tient bien) — ce ne sont que des commentaires. Les seules mentions « Jet » techniques (BaseLayout `JetBrains Mono`) sont légitimes.
- **Pourquoi ça compte :** documentation interne mensongère = on prend des décisions de design sur de fausses prémisses. Faible risque technique, mais entretient la confusion couleur déjà pointée en CLEAN-06.
- **Recommandation :** corriger ces commentaires (« bande sombre brun-olive `brand-900` », retirer « Menthe »).

### [CLEAN-08] Naming mixte FR/EN et clés ultra-courtes dans les données de `views/`
- **Sévérité :** Mineur
- **Effort :** M
- **Localisation :** ensemble de `src/views/` (frontmatter) — ex. `creation-site-internet.astro` (`VILLES`, `METIERS`, `INCLUS`), `identite-visuelle.astro:15-53` (`STEPS`, `FAQ`, `LINKS` + clés `{ n, t, p }` / `{ q, a }`)
- **Description :** les constantes mélangent français (`INCLUS`, `METIERS`, `LEVIERS`, `CONSTRUIT`, `AUTOMATISE`, `FORMATS`) et anglais (`LINKS`, `STEPS`, `INCLUDED`, `items`, `includes`, `cards`, `chips`). Les objets de contenu utilisent des clés mono-lettre cryptiques (`n`, `t`, `p`, `q`, `a`) répétées dans de nombreux fichiers.
- **Pourquoi ça compte :** incohérence de nommage = friction cognitive et copier-coller fragile. Les clés `t`/`p`/`n` ne disent pas ce qu'elles contiennent (titre ? texte ? numéro ?), ce qui ralentit la lecture et la future extraction en gabarits (CLEAN-02).
- **Recommandation :** fixer une langue de code (FR ou EN) pour les identifiants et adopter des clés explicites (`numero/titre/texte` ou `n°/title/body`). À faire naturellement lors de la centralisation des données métier (CLEAN-02).

### [CLEAN-09] `Button.astro` : tailles définies en valeurs arbitraires plutôt que canoniques
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Button.astro:33-35`
- **Description :** la primitive bouton — pourtant la plus réutilisée — code ses paddings en arbitraire : `px-[18px] py-[14px]` (sm), `px-[26px] py-[17px]` (md), `px-8 py-[20px]` (lg). `px-[26px]` a un équivalent canonique `px-6.5`, `py-[20px]`→`py-5` ; `py-[14px]`/`py-[17px]` sont hors-grille (légitimement arbitraires).
- **Pourquoi ça compte :** c'est la primitive la plus visible ; mélanger `px-8` (canonique) et `px-[26px]` (arbitraire) dans le même objet illustre l'incohérence et va à l'encontre de la convention. Impact mineur (1 fichier) mais valeur d'exemple forte.
- **Recommandation :** convertir ce qui a un équivalent (`px-[26px]`→`px-6.5`, `py-[20px]`→`py-5`) ; assumer les paddings hors-grille restants ou les caler sur la grille v4.

## Points positifs
- Couche `components/ui` et `components/blocks` réellement propre : props typées via `interface Props`, en-têtes de commentaire qui expliquent l'intention, composants courts (la plupart < 90 lignes).
- Pattern polymorphe soigné (`Button`/`Card` rendent `<a>` ou `<button>`/`<div>` selon `href`) — bonne réutilisation.
- `Section.astro` est une vraie primitive de rythme (tone/width/pad en props, agnostique du contenu) ; `Blocks.astro` + union discriminée `lib/sections.ts` est un bon modèle de page pilotée par données — exactement ce qui manque à `views/`.
- Aucune couleur en dur trouvée dans le markup (le garde-fou `check:tokens` fonctionne) ; `lib/accents.ts` est cohérent avec la décision « monochrome marque ».
- `CtaBand`/`FinalCta`/`FormBlock` montrent une bonne factorisation des CTA et formulaires avec valeurs par défaut sensées.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| CLEAN-01 | Élevé | L | Primitives Card/Pill/Grid/Badge inutilisées, markup ré-inliné dans views/ |
| CLEAN-02 | Élevé | L | Pages métier dupliquées à ~80 % (plombier ≈ électricien) |
| CLEAN-03 | Moyen | S | villes/_template.astro + lorient/vannes : scaffold/code mort présumé |
| CLEAN-04 | Moyen | M | Valeurs Tailwind arbitraires massives vs convention canonique |
| CLEAN-05 | Moyen | M | Duplication conceptuelle Hero vs HeroBlock (tokens vs arbitraire) |
| CLEAN-06 | Moyen | S | Défaut accent='menthe' partout (label mort trompeur) |
| CLEAN-07 | Mineur | S | Commentaires obsolètes « Jet »/« Menthe » |
| CLEAN-08 | Mineur | M | Naming mixte FR/EN et clés mono-lettre dans views/ |
| CLEAN-09 | Mineur | S | Button.astro en valeurs arbitraires plutôt que canoniques |
