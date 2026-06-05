# Design tokens & cohérence visuelle — Rapport d'audit

**Périmètre audité :** `src/styles/design-tokens.css`, `src/styles/global.css`, `scripts/check-tokens.mjs` (exécuté), `src/lib/accents.ts`, `src/lib/sections.ts`, et balayage de cohérence sur l'ensemble de `src/` (couleurs en dur, Jet #2D3138, vocabulaire « fruit », valeurs arbitraires `[..]` vs classes canoniques, tokens définis/consommés).
**Note de santé :** 7/10 — fondations propres et bien gardées (aucune couleur en dur, palette warm respectée, Jet absent), mais double couche de tokens partiellement morte, adoption inégale des classes/tokens canoniques et héritage « fruit » non élagué qui contredit CLAUDE.md.

## Résumé exécutif
- Le garde-fou automatique `npm run check:tokens` **passe** : aucune couleur écrite « en dur » dans le code, tout passe par le design system. C'est un point fort réel.
- La règle « Jet #2D3138 retiré » est **respectée** : la couleur n'apparaît nulle part (seul un commentaire qui rappelle sa suppression). La palette warm brun-olive et le jaune `accent-2` sont cohérents.
- En revanche, le système de tokens vit sur **deux couches** (variables `:root` brutes + couche Tailwind `@theme`) et une **grande partie de la couche `:root` n'est jamais utilisée** : c'est du poids mort qui peut induire en erreur (un commentaire affirme qu'elle « alimente des classes `.ed-*`/`.az-*` », ce qui n'est plus vrai).
- L'héritage du système « fruit » (`menthe`, `fraise`…) **subsiste partout** dans le code (types, schémas, props, ~40 fichiers) alors que CLAUDE.md le déclare « élagué ». C'est inerte visuellement mais c'est un piège de lisibilité pour quiconque arrive sur le projet.
- Les conventions Tailwind de CLAUDE.md (« classe canonique avant valeur arbitraire », « token nommé avant valeur ») sont **appliquées de façon inégale** : on compte des centaines de valeurs `[NNpx]` et `tracking-[-0.0Xem]` qui ont pourtant un équivalent canonique officiel.

## Constats détaillés

### [TOK-01] Double couche de tokens dont la moitié `:root` est morte
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/styles/design-tokens.css:14-102` (couche `:root`)
- **Description :** Le fichier déclare deux couches : `:root` (variables brutes `--brand`, `--accent`, `--surface`, `--sp-*`, `--fs-*`, `--r-*`…) puis `@theme` (mapping Tailwind `--color-*`, `--text-*`, `--radius-*`…). Le balayage des consommateurs `var(--…)` dans tout `src/` montre que les composants consomment quasi exclusivement la couche `@theme` (`var(--color-brand)` ×39, `var(--color-line)` ×24…) plus une poignée de `:root` réellement vivants (`var(--ease)` ×15, `var(--ring-focus)` ×5, `var(--font-display)`, `var(--container-px)`, `var(--paper)`, `var(--brand)`, `var(--ink)`). En revanche, de nombreux tokens `:root` n'ont **aucun consommateur** : `--accent`, `--accent-bright`, `--accent-deep` (25-28), `--surface` (33), `--paper-2` (32), `--brand-line` (23), `--on-dark-line` (46), `--r-xs/-sm/-md/-pill` (78-81, doublonnés par `--radius-*` dans `@theme`), toute l'échelle `--sp-1..10` (74-75), `--fs-*` / `--lh-*` (58-68, doublonnés par `--text-*`), `--shadow-xs/-sm` (84-85), `--hero-max` (92), `--dur-fast/-/-reveal` (99-101).
- **Pourquoi ça compte :** Maintenance et fiabilité. Un développeur qui modifie une valeur dans `:root` (ex. `--accent`, `--sp-5`, `--fs-h2`) croira changer le rendu alors que rien ne consomme ce token — la vraie source est `@theme`. Deux échelles parallèles (`--r-*` vs `--radius-*`, `--fs-*` vs `--text-*`, `--accent-*` vs `--brand-*`) peuvent diverger silencieusement et personne ne le verra.
- **Recommandation :** Décider d'une couche unique. Soit supprimer de `:root` tout ce qui est doublonné/non consommé, soit ne garder dans `:root` que les tokens réellement utilisés en CSS brut (`--ease`, `--ring-focus`, `--font-*`, `--container*`, `--brand`, `--ink`, `--paper`) et tout le reste en `@theme`. Au minimum, documenter clairement quelle couche fait foi.

### [TOK-02] Commentaire de tête trompeur sur l'usage de la couche `:root`
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/styles/design-tokens.css:5-7`
- **Description :** Le commentaire affirme que la couche `:root` est « utilisée par les classes `.ed-*` (landing) et `.az-*` (helpers) ». Or les seules définitions `.ed-*`/`.az-*` survivantes sont **locales et scoped** (`src/pages/cookies.astro:232+`, `src/views/hubs/templates-email.astro`), et elles consomment la couche `@theme` (`var(--color-brand)`, `var(--color-paper)`, `var(--ease)`) — voir `cookies.astro:244-245`. Aucune feuille globale ne définit `.ed-*`/`.az-*`, et ces classes ne lisent pas les alias `:root` (`--accent`, `--brand-*` bruts).
- **Pourquoi ça compte :** Le commentaire justifie l'existence de la couche `:root` par un usage qui n'existe plus. Il fige une fausse dette : on n'ose pas nettoyer `:root` « parce que la landing en dépend ». C'est ce qui pérennise TOK-01.
- **Recommandation :** Corriger ou retirer ce commentaire après décision sur TOK-01.

### [TOK-03] Vocabulaire « fruit » toujours présent dans tout le code (contredit CLAUDE.md)
- **Sévérité :** Moyen
- **Effort :** L
- **Localisation :** `src/lib/accents.ts:12-20` ; `src/lib/sections.ts:12` ; `src/components/ui/{Eyebrow,Pill,Badge,SectionHead,PageHeader}.astro` ; `src/components/blocks/{StatsBlock,TimelineBlock,IncludesBlock}.astro` ; `src/data/seo-architecture.ts` (≈25 occurrences) ; `src/content/prestations/sites-et-landing.mdx:13,23,37` ; nombreux `src/views/hubs/*` et `src/sections/home/*` avec `accent="menthe"`.
- **Description :** CLAUDE.md indique que le système « fruit / 17 combinaisons » est « SUPERSEDED et élagué » et que `lib/accents.ts` renvoie `brand` pour tout accent. C'est vrai sur le **rendu** (`accents.ts` mappe tous les fruits vers `text-brand`/`bg-brand`/`bg-brand-soft`), mais le **vocabulaire** survit partout : le type `Accent = 'menthe' | 'fraise' | …`, l'enum Zod `z.enum(['menthe','fraise','miel','citron','kiwi'])` (`sections.ts:12`), les valeurs par défaut `accent = 'menthe'` dans ~8 primitives, et des dizaines de `accent: 'kiwi'/'miel'/…` dans les données et le contenu.
- **Pourquoi ça compte :** Lisibilité et risque de régression. Un nouvel arrivant lit « miel/fraise » et croit à un système de couleurs vivant ; il peut ajouter un `accent="citron"` en pensant obtenir une couleur, ou « réparer » `accents.ts` pour rendre les fruits visibles — réintroduisant exactement ce que la charte interdit. L'écart entre la doc (« élagué ») et le code (« partout ») est une dette de cohérence.
- **Recommandation :** Aligner code et doc : soit renommer en labels neutres (`'neutral'`/`'brand'`) avec une migration des données et du schéma, soit (a minima) réduire l'enum à une seule valeur et ajouter un commentaire en tête de `accents.ts`/`sections.ts:12` rappelant que ces valeurs sont **inertes** et ne doivent pas être ré-activées. Effort L à cause du nombre de points d'appel.

### [TOK-04] Valeurs arbitraires `[NNpx]` à la place de l'échelle canonique
- **Sévérité :** Moyen
- **Effort :** L
- **Localisation :** ≈414 occurrences de `*-[NNpx]` sur 61 fichiers. Exemples vérifiés : `src/sections/home/Faq.astro:18,23` (`p-[22px]`→`p-5.5`, `px-[18px]`→`px-4.5`, `py-[10px]`→`py-2.5`) ; `src/components/layout/Header.astro:37,39` (`h-[38px]`, `h-[7px] w-[7px]`→`h-7/w-7` au pas 4px le plus proche) ; `src/views/hubs/templates-email.astro:88` (`h-[42px] w-[42px]`) ; `src/pages/contact.astro:92` et `devis.astro:192` (`h-[54px] w-[54px]`→`h-13.5 w-13.5`).
- **Description :** CLAUDE.md impose « toujours préférer une classe canonique à une valeur arbitraire quand un équivalent existe » (échelle v4, 1u = 4px). De nombreuses valeurs `[NNpx]` qui sont des multiples de 4 (donc directement exprimables sur l'échelle) restent en arbitraire. (Note : une large part des 962 `[..]` totaux sont des `clamp()`, `[62ch]`, `[16/8]`, `leading-[1.5]` légitimes et hors-échelle — TOK-04 ne vise que les `px` réductibles.)
- **Pourquoi ça compte :** Cohérence du rythme visuel et conformité à la convention maison. Les valeurs arbitraires court-circuitent l'échelle d'espacement : on obtient des `22px`, `26px`, `18px` au lieu de pas réguliers, ce qui fait dériver l'harmonie d'espacement et complique les ajustements globaux.
- **Recommandation :** Convertir progressivement les `*-[NNpx]` réductibles vers le pas d'échelle (l'IntelliSense `suggestCanonicalClasses` les signale déjà). Prioriser les composants partagés (`components/ui/*`, `components/blocks/*`, `layout/*`) qui se répercutent partout.

### [TOK-05] `tracking-[-0.0Xem]` au lieu des tokens nommés
- **Sévérité :** Mineur
- **Effort :** M
- **Localisation :** ≈117 occurrences de `tracking-[-0.0Xem]` sur 55 fichiers, alors que les tokens nommés `tracking-display` / `tracking-h1` / `tracking-h2` / `tracking-tight` / `tracking-eyebrow` sont définis (`design-tokens.css:175-179`) mais peu adoptés (≈44 occurrences sur 10 fichiers seulement). Exemple : `src/sections/home/Faq.astro:19` (`tracking-[-0.01em]`).
- **Description :** CLAUDE.md cite explicitement `tracking-[-0.035em]` → `tracking-display` et `tracking-[-0.02em]` → `tracking-h2` comme exemples canoniques. Les tokens existent mais l'écriture arbitraire reste dominante. Certaines valeurs (`-0.01em`, `-0.03em`) n'ont pas de token et sont des arbitraires légitimes ; mais `-0.035em`, `-0.025em`, `-0.02em`, `-0.015em`, `0.16em` ont chacun un token.
- **Pourquoi ça compte :** Un token nommé centralise le réglage typographique : si l'on veut resserrer tous les titres H2, on change `--tracking-h2` une fois. Avec des arbitraires éparpillés, le réglage devient introuvable et incohérent.
- **Recommandation :** Remplacer les valeurs arbitraires de tracking qui correspondent exactement à un token par le token nommé. Garder en `[..]` uniquement les valeurs hors-échelle (`-0.01em`, `-0.03em`).

### [TOK-06] Tokens d'états `ok`/`warn`/`danger` définis dans le système alors qu'ils sont bannis en surface
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/styles/design-tokens.css:49-51` (`:root`) et `133-135` (`@theme` : `--color-ok`, `--color-warn`, `--color-danger` + `-soft`).
- **Description :** CLAUDE.md interdit « jamais `ok`/`warn`/`danger` en surface ». Le balayage confirme qu'ils ne sont **utilisés nulle part** en surface (seule mention : un commentaire dans `src/views/guides/invisible-sur-google.astro:8` expliquant qu'on **n'utilise pas** le rouge de la maquette — bonne discipline). Mais les tokens restent exposés comme utilitaires Tailwind (`bg-danger`, `text-warn`…), donc disponibles à l'autocomplétion.
- **Pourquoi ça compte :** Exposer dans `@theme` des couleurs que la charte interdit rend leur usage trivial et indétectable par `check:tokens` (ce sont des tokens « légitimes » au sens du script). C'est une porte ouverte vers une violation de charte que l'outillage ne rattrapera pas.
- **Recommandation :** Soit retirer ces tokens de `@theme` (les garder en `:root` interne si vraiment nécessaire, hors utilitaires), soit ajouter une règle au garde-fou interdisant `bg-danger`/`text-warn`/etc. en surface. Au minimum, commenter qu'ils sont réservés à un usage hors-surface.

### [TOK-07] `check:tokens` ne couvre ni les MDX ni `data/*.ts` ni `docs/`
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `scripts/check-tokens.mjs:18` (`EXT = new Set(['.astro', '.css'])`).
- **Description :** Le garde-fou ne scanne que `.astro` et `.css` sous `src/`. Les couleurs en dur écrites dans un frontmatter MDX (`src/content/**`), dans `src/data/*.ts`, ou dans un composant inline d'une page TS ne seraient pas détectées. Les `docs/familles/*.html` autonomes sont explicitement hors-périmètre (assumé par CLAUDE.md). Je n'ai pas trouvé de hex en dur dans ces zones lors du balayage, donc c'est une lacune de couverture théorique plutôt qu'une violation constatée.
- **Pourquoi ça compte :** Le garde-fou donne une assurance « zéro couleur en dur » qui ne vaut que pour `.astro`/`.css`. Si demain une valeur de style passe par une donnée TS ou un MDX, elle échappera au filet.
- **Recommandation :** Vérifier si le besoin existe ; le cas échéant, étendre `EXT` à `.ts`/`.mdx` (avec allowlist adaptée) ou documenter explicitement le périmètre du garde-fou.

## Points positifs
- **`npm run check:tokens` passe** (`✓ Aucune couleur en dur hors design-tokens.css.`) : la discipline « aucune couleur en dur » est réellement tenue dans `.astro`/`.css`.
- **Jet #2D3138 totalement absent** du code (seul un commentaire en rappelle la suppression) : la décision « warm pivot » est respectée.
- **Palette warm cohérente** : `ink`/`brand-900` = brun-olive `#403D30`, crème `on-dark` `#F4F1E6` sur bandes sombres, `accent-2` jaune comme seul accent ponctuel (topbar `Header.astro:37`, carte FAQ `Faq.astro:18`) — conforme à CLAUDE.md.
- **`accents.ts` neutralise correctement le rendu** : tous les « fruits » mappent vers `brand`, donc aucun écart visuel malgré le vocabulaire résiduel.
- **Échelle typo centralisée et couplée** : `--text-*` (taille + interligne) et `--tracking-*` exposés en `@theme`, plus `prose-azelize` et `hero-pad` comme points de contrôle uniques — bonne intention d'architecture.
- **Accessibilité** : anneau de focus tokenisé (`--ring-focus`) appliqué globalement (`global.css:64-68`) et `prefers-reduced-motion` respecté (`global.css:167-172`).

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| TOK-01 | Moyen | M | Double couche de tokens dont la moitié `:root` est morte |
| TOK-02 | Mineur | S | Commentaire de tête trompeur sur l'usage de `:root` |
| TOK-03 | Moyen | L | Vocabulaire « fruit » toujours présent (contredit CLAUDE.md) |
| TOK-04 | Moyen | L | Valeurs arbitraires `[NNpx]` au lieu de l'échelle canonique |
| TOK-05 | Mineur | M | `tracking-[-0.0Xem]` au lieu des tokens nommés |
| TOK-06 | Mineur | S | Tokens `ok`/`warn`/`danger` exposés alors que bannis en surface |
| TOK-07 | Hypothèse à vérifier | S | `check:tokens` ne couvre ni MDX ni `data/*.ts` |
