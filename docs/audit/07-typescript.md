# TypeScript & sûreté des types — Rapport d'audit

**Périmètre audité :** `tsconfig.json`, `src/env.d.ts`, schémas Zod (`src/content.config.ts`, `src/lib/sections.ts`), types partagés (`src/lib/*.ts`), données typées (`src/data/*.ts`), Props des composants `.astro` (`src/components/**`, `src/sections/**`, `src/views/**`, `src/layouts/**`), routes dynamiques (`src/pages/**`). Commandes lancées : `npx astro check`, `npx eslint .`.

**Note de santé :** 8/10 — base de typage solide et propre (`astro check` 0 erreur, ESLint 0 warning, Props typées partout, `satisfies GetStaticPaths`), mais quelques `any` ciblés sur le chargement dynamique et un type historique (`Accent`) qui contredit la charte.

## Résumé exécutif
- Le projet compile **sans aucune erreur de type** (`astro check` : 0 erreur, 0 warning, 1 indice) et **passe ESLint sans aucun avertissement** : la discipline de typage est réelle et tenue.
- Le réglage est **strict** (héritage de `astro/tsconfigs/strict`) et les chemins d'import courts (`@components/*`, `@lib/*`…) sont correctement déclarés.
- Le contenu (pages métiers/guides/réalisations) est **validé par des schémas Zod** : une faute dans un fichier `.mdx` (champ manquant, mauvais type) casse le build au lieu de passer en silence — c'est un filet de sécurité précieux.
- Quelques **`any` ponctuels** subsistent : le chargement dynamique des « vues » (composants pris par dossier) perd son type, et un type historique (`Accent` = les anciens fruits menthe/fraise/…) reste en place alors que la charte dit qu'il est abandonné — type valide mais **trompeur**.
- Un même objet « palier tarifaire » est **décrit deux fois** (dans les données et dans le schéma de section), sans type partagé : risque de divergence silencieuse à terme.

## Constats détaillés

### [TS-01] Le type `Accent` encode encore le système « fruit » abandonné
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/lib/sections.ts:12`, `src/lib/accents.ts:12`, `src/components/ui/SectionHead.astro:17`
- **Description :** Le schéma déclare `const accent = z.enum(['menthe', 'fraise', 'miel', 'citron', 'kiwi'])` et `src/lib/accents.ts` exporte `export type Accent = 'menthe' | 'fraise' | 'miel' | 'citron' | 'kiwi'`. Or CLAUDE.md précise que le système fruit est « superseded et élagué » et que `lib/accents.ts` « renvoie `brand` pour tout accent ; le type `Accent` … subsistent comme labels inertes ». Le typage est donc **cohérent avec lui-même** (les données de `seo-architecture.ts` qui écrivent `accent: 'kiwi'`, `'miel'`, etc. — ex. lignes 52, 65, 93, 123 — valident), mais le type **ne reflète plus l'intention métier** : il oblige à choisir parmi cinq valeurs qui n'ont aucun effet visuel. De plus `SectionHead.astro:17` met `accent = 'menthe'` en valeur par défaut, c'est-à-dire un défaut nommé d'après une couleur officiellement retirée.
- **Pourquoi ça compte :** Un type est aussi de la documentation exécutable. Ici il **ment** au prochain développeur (humain ou IA) : l'autocomplétion propose `menthe`/`fraise`/… comme si elles signifiaient quelque chose, alors que la charte interdit ce vocabulaire. C'est exactement le genre de dérive (« DRIFT ») qui rallonge chaque modification future et risque de réintroduire des couleurs proscrites.
- **Recommandation :** Réduire `Accent` à un alias inerte non trompeur (ex. `export type Accent = 'brand'`, ou `type Accent = string` documenté « label inerte »), aligner `z.enum` en conséquence, et remplacer le défaut `'menthe'` par `'brand'`. À défaut, ajouter un commentaire `@deprecated` explicite sur le type et l'enum pour signaler qu'aucune valeur fruit n'a d'effet.

### [TS-02] Composants chargés dynamiquement typés en `any`
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/pages/[service]/index.astro:42`, `src/pages/[service]/[metier].astro:49`, `src/pages/guides/[slug].astro:38`, `src/pages/realisations/[slug].astro:34`
- **Description :** Les quatre routes qui mappent une « vue » par dossier via `import.meta.glob(...)` castent le module en `{ default: any } | undefined`, puis rendent `(module)?.default` comme composant. Le `default: any` désactive toute vérification de type sur le composant rendu (ex. `<HubComponent />`).
- **Pourquoi ça compte :** C'est le **point d'assemblage central** des pages programmatiques (hubs, métiers, guides, réalisations). Le `any` y est volontaire et globalement sans danger (ces vues sont rendues sans props), mais si demain une vue attendait des props, TypeScript ne signalerait rien. C'est une petite zone aveugle dans une mécanique stratégique.
- **Recommandation :** Remplacer `any` par le type composant d'Astro : `{ default: import('astro').AstroComponentFactory }` (ou `AstroInstance['default']`). Le risque concret est faible aujourd'hui ; valeur surtout préventive et documentaire.

### [TS-03] Cast `as as any` pour la balise polymorphe dans les primitives
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Section.astro:20`, `src/components/ui/Grid.astro:13`
- **Description :** Le motif `const Tag = as as any;` sert à rendre une balise dynamique (`<Tag>`) à partir d'une prop `as?: string`. Le `as any` court-circuite la vérification du nom de balise.
- **Pourquoi ça compte :** Impact réel quasi nul (rendu HTML statique, valeur fournie par le code, pas par l'utilisateur), mais c'est une perte de garantie : une faute de frappe dans `as="sektion"` passerait. C'est un idiome Astro courant ; à noter pour exhaustivité plutôt qu'à corriger en urgence.
- **Recommandation :** Si on veut resserrer : typer `as?: keyof astroHTML.JSX.IntrinsicElements` et faire `const Tag = as as keyof astroHTML.JSX.IntrinsicElements;`. Sinon laisser tel quel — coût/bénéfice faible.

### [TS-04] `window as any` dans le script du simulateur
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/pages/simulateur-investissement.astro:234`
- **Description :** Le script client lit sa configuration via `(window as any).__SI_CONFIG__ as { plans: Plan[]; rates: ... }`. Le `as any` contourne l'absence de déclaration de la propriété globale `__SI_CONFIG__`, mais le second `as {...}` réintroduit aussitôt un typage : la donnée consommée **est** typée, c'est seulement l'accès à `window` qui est non typé.
- **Pourquoi ça compte :** Faible : le double-cast est localisé et le shape attendu est explicite. Le seul risque est qu'une divergence entre l'objet sérialisé (`config` côté serveur, ligne 207) et l'interface `Plan` ne soit pas détectée par le compilateur, ces deux mondes communiquant par `JSON.stringify`.
- **Recommandation :** Déclarer la propriété globale (`declare global { interface Window { __SI_CONFIG__?: SiConfig } }`) et partager le type `SiConfig` entre le frontmatter et le `<script>` pour fermer la zone aveugle de sérialisation. Optionnel.

### [TS-05] Le type « palier tarifaire » est défini deux fois sans type partagé
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/data/pricing.ts:8` (`interface Tier`) vs `src/lib/sections.ts:67` (objet `tiers` du bloc `pricing`)
- **Description :** `pricing.ts` définit `interface Tier { name; price; unit?; line; feats; featured?; rolloverFirst? }`. `sections.ts` redéfinit indépendamment, dans le schéma Zod du bloc `pricing`, un objet quasi identique (`name`, `line`, `price`, `unit?`, `feats`, `featured?`, `rolloverFirst?`). Les deux structures décrivent la même notion mais ne partagent aucun type : le schéma Zod n'est pas dérivé de `Tier`, ni l'inverse.
- **Pourquoi ça compte :** **Double source de vérité de forme.** Si on ajoute demain un champ à un palier (ex. `badge`), il faut penser à le répliquer aux deux endroits ; un oubli ne déclenche aucune erreur de compilation, juste un comportement partiel. C'est une dette de cohérence typique des systèmes qui ont à la fois des données « en dur » (TS) et des données « contenu » (Zod).
- **Recommandation :** Faire converger : soit dériver `Tier` de l'objet Zod via `z.infer`, soit (plus simple ici, car `pricing.ts` est la source de prix réelle) documenter explicitement que le bloc Zod doit rester aligné sur `Tier`. Vérifier au passage que `price` accepte bien les mêmes types des deux côtés (`number` en `pricing.ts`, `string | number` en `sections.ts`).

### [TS-06] `JsonLd = Record<string, unknown>` non discriminé (typage volontairement lâche)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** L
- **Localisation :** `src/lib/seo.ts:40`
- **Description :** Toutes les fabriques JSON-LD (`organizationJsonLd`, `articleJsonLd`, `faqJsonLd`, etc.) retournent `Record<string, unknown>`. Le contenu est correct à la lecture, mais la **forme** des objets schema.org n'est pas typée : rien n'empêche un `@type` mal orthographié ou un champ obligatoire manquant.
- **Pourquoi ça compte :** Le JSON-LD alimente les résultats enrichis Google. Une erreur de structure ne casse pas le build et passe inaperçue jusqu'à un test Rich Results externe. Impact SEO **structurel** réel. Cela dit, typer schema.org est lourd (paquet `schema-dts`) et peut être surdimensionné pour ~7 fabriques ; d'où la sévérité « à vérifier » selon l'ambition.
- **Recommandation :** Optionnel — envisager `schema-dts` (`import type { Organization, Article } from 'schema-dts'`) pour typer le retour de chaque fabrique, ou a minima un test de validation au build. Sinon, statu quo acceptable vu la taille.

### [TS-07] Indice TypeScript résiduel sur `eslint.config.mjs`
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `eslint.config.mjs:6` (signalé par `astro check` : `ts(6387)`)
- **Description :** `astro check` remonte 1 indice : `ts.config(...)` est marqué deprecated. C'est de l'outillage (config ESLint), hors code applicatif, mais c'est le seul diagnostic non-vert de la base.
- **Pourquoi ça compte :** Aucun impact runtime ni sur le site. Purement hygiène d'outillage : une future version de `typescript-eslint` pourrait retirer la signature.
- **Recommandation :** Suivre la migration recommandée par `typescript-eslint` (utilisation de `defineConfig` ou de la nouvelle API) lors d'une montée de version. Non urgent.

## Points positifs
- **`astro check` : 0 erreur, 0 warning** sur 117 fichiers, et **ESLint : aucun message** : la base est saine et la CI (`build` = `astro check && astro build`) protège réellement contre les régressions de type.
- Mode **strict** hérité de `astro/tsconfigs/strict`, alias `@` complets et cohérents (`tsconfig.json:5-15`), `env.d.ts` correctement référencé.
- **Schémas Zod bien conçus** : `content.config.ts` factorise un `base` partagé, `sections.ts` utilise une **union discriminée par `type`** que `Blocks.astro` exploite par narrowing (`s.type === 'grid'`) — le compilateur garantit que chaque bloc reçoit les bonnes props. C'est un bon usage du typage discriminé.
- **`satisfies GetStaticPaths`** sur toutes les routes dynamiques (`[slug]`, `[service]`, `[metier]`) : on conserve l'inférence fine des `props` tout en validant la signature attendue par Astro.
- **Données figées en `as const`** (`site.ts:20`, `nav.ts`, `pricing.ts`) → littéraux étroits, plus sûrs à consommer ; interfaces explicites (`Service`, `Tier`, `NavItem`, `IconName`, `Statut`) bien nommées et commentées.
- **Props typées dans tous les composants `.astro`** rencontrés (`interface Props` systématique), avec valeurs par défaut et `Record<NonNullable<Props['x']>, string>` pour les tables de variantes (`Section.astro:22`) — motif robuste.
- **Aucun `@ts-ignore` / `@ts-expect-error` / `@ts-nocheck`** dans `src/` : pas de suppression d'erreur masquée.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| TS-01 | Moyen | M | Le type `Accent` encode encore le système « fruit » abandonné |
| TS-02 | Moyen | S | Composants chargés dynamiquement typés en `any` |
| TS-03 | Mineur | S | Cast `as as any` pour la balise polymorphe (Section/Grid) |
| TS-04 | Mineur | S | `window as any` dans le script du simulateur |
| TS-05 | Moyen | M | Type « palier tarifaire » défini deux fois sans type partagé |
| TS-06 | Hypothèse à vérifier | L | JSON-LD typé `Record<string, unknown>` (non discriminé) |
| TS-07 | Mineur | S | Indice `ts(6387)` deprecated sur `eslint.config.mjs` |
