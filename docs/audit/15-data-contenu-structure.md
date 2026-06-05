# Contenu structuré & couche de données — Rapport d'audit

**Périmètre audité :** `src/content.config.ts` (5 collections), `src/data/*.ts` (site, nav, footer, faq, pricing, seo-architecture), `src/lib/sections.ts` (schéma sections), `src/lib/accents.ts`, et la consommation de ces données par `src/pages/**` (routes dynamiques + index) et `src/views/**`.
**Note de santé :** 7/10 — couche de données solide, typée et bien commentée, mais deux dérives par rapport aux conventions (enum « fruit » dans le schéma de sections) et un pan de code mort à statut (la matrice « villes ») qui brouille la frontière donnée/contenu.

## Résumé exécutif
- La donnée du site est **bien rangée** : un seul endroit pour les prix, la navigation, le footer, la FAQ et les coordonnées. C'est sain : on change un prix à un seul endroit, et il se met à jour partout (landing + page tarifs).
- Le schéma des « sections » composables contient encore les **noms de l'ancien système de couleurs « fruit »** (`menthe`, `fraise`, `miel`…) que la charte officielle dit avoir supprimé. C'est purement cosmétique côté rendu (tout pointe vers le bleu de marque), mais c'est un piège : un rédacteur peut écrire `accent: 'kiwi'` en croyant que ça change une couleur, alors que ça ne fait rien.
- Toute la **machinerie « pages par ville »** (liste des villes, statuts, gabarits) existe dans le code mais **n'est branchée à aucune page réelle** : trois fichiers de gabarit de ville et une table de villes ne sont lus par personne. C'est du code « en attente » qui ressemble à du code actif — source de confusion.
- Le **contenu éditorial (les fichiers MDX)** des pages « métier » et « réalisation » est, dans les faits, **vide** : le texte affiché vient de composants de design dédiés, et le corps du fichier MDX n'est qu'un commentaire. La donnée utile (titre, résumé, dates, balises SEO) vit dans l'en-tête du fichier. C'est cohérent, mais le double système (en-tête de fichier vs composant) mérite d'être documenté pour éviter qu'on édite le mauvais endroit.
- Plusieurs **champs déclarés mais peu ou pas utilisés** (ex. balises `tags` sur les métiers, certaines variantes de section) : sans danger, mais ça alourdit le contrat de données.

## Constats détaillés

### [DATA-01] Le schéma de sections garde les noms « fruit » supprimés par la charte
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/lib/sections.ts:12`, `src/lib/accents.ts:12`, et usages dans `src/data/seo-architecture.ts` (ex. lignes 51, 65, 93, 123…)
- **Description :** `sections.ts:12` déclare `const accent = z.enum(['menthe', 'fraise', 'miel', 'citron', 'kiwi'])`. Le type `Accent` de `accents.ts:12` est identique. Or `CLAUDE.md` indique explicitement que le système « fruit / 17 combinaisons » est **superseded et élagué**, et que `lib/accents.ts` « renvoie `brand` pour tout accent ; le type `Accent` et les props `accent:` subsistent comme labels inertes ». Concrètement : les hubs de `seo-architecture.ts` peuplent encore ces valeurs (`accent: 'kiwi'`, `accent: 'miel'`, etc.), mais `accents.ts:14-20` mappe les cinq vers la même classe `text-brand` / `bg-brand`. Le résultat visuel est uniforme — l'enum n'a plus d'effet, seulement un coût de confusion.
- **Pourquoi ça compte :** un label qui n'a aucun effet est un piège de maintenance. Un rédacteur ou un futur développeur peut croire que `accent: 'fraise'` colore une section en rose et perdre du temps à diagnostiquer pourquoi « la couleur ne change pas ». Le schéma ment sur sa propre intention. C'est la dérive nº1 signalée par l'orchestrateur, ici confirmée.
- **Recommandation :** soit (a) remplacer l'enum par un commentaire de compat (`z.string().optional()` neutre, ou un enum à une seule valeur sémantique `'brand'`), soit (b) si on garde l'enum pour compat de schéma, ajouter un commentaire clair « valeurs héritées sans effet visuel — voir lib/accents.ts » directement sur la ligne, et migrer progressivement les `accent:` de `seo-architecture.ts` pour ne plus les peupler. Le plus propre à terme : retirer la prop des sections qui ne s'en servent plus.

### [DATA-02] Matrice « villes » : données et gabarits déclarés mais jamais consommés (code mort à statut)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/data/seo-architecture.ts:703-750` (`Ville`, `VILLES`, `MetierCible`, `METIERS_CIBLES`, `MATRICE_VILLE`) ; `src/views/villes/_template.astro`, `src/views/villes/lorient.astro`, `src/views/villes/vannes.astro`
- **Description :** Aucune route ne consomme `VILLES` ni `MATRICE_VILLE` : la recherche d'usage hors de `seo-architecture.ts` ne remonte que `src/views/hubs/creation-site-internet.astro:14` qui redéclare **sa propre** constante `VILLES` locale (un tableau de tuples codé en dur), sans importer celle du registre. Les vues `src/views/villes/*` ne sont chargées par **aucun** `import.meta.glob` (les routes globbent `views/hubs/*`, `views/metiers/*`, `views/guides/*`, `views/realisations/*` — jamais `views/villes/*`), et il n'existe **aucune route** `pages/[service]/[ville].astro`. De plus, `content.config.ts` n'a **pas** de collection `villes`, et le commentaire `content.config.ts:53-57` affirme que les métiers ne sont **PAS** du SEO local géographique. La machinerie ville est donc entièrement orpheline : ni buildée, ni reliée. `METIERS_CIBLES` (727-733) n'est pas lu non plus — le build des métiers suit directement la collection `metiers` (cf. `[service]/[metier].astro:22`).
- **Pourquoi ça compte :** du code qui ressemble à de l'infrastructure active mais qui ne l'est pas est l'une des principales sources de bugs de compréhension. Un développeur qui ajoute une ville dans `VILLES` ou édite `views/villes/lorient.astro` croira modifier le site — sans effet. Ça gonfle aussi la surface à maintenir et entre en tension avec la règle anti-doorway du fichier (statuts `conditionnel`/`exclu`) : le dispositif de garde-fou existe, mais sans route qui le lit, il ne garde rien.
- **Recommandation :** trancher explicitement. Si la matrice ville est une **roadmap assumée** (ce que dit le commentaire ligne 697-701), isoler ces déclarations dans un fichier `seo-architecture.roadmap.ts` clairement non importé, OU les laisser mais ajouter en tête un bandeau `// ⚠️ NON CÂBLÉ — aucune route ne lit ceci à ce jour`. Faire dériver le `VILLES` codé en dur du hub `creation-site-internet.astro:14` de la source `VILLES` du registre pour qu'au moins une source de vérité existe. Si la piste ville est abandonnée, supprimer `views/villes/*` et la section villes du registre.

### [DATA-03] Double source de vérité « villes » entre registre et hub
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/data/seo-architecture.ts:710-718` vs `src/views/hubs/creation-site-internet.astro:14`
- **Description :** Le registre liste 7 villes typées (`{ slug, nom, population, zone }`). Le hub création redéclare en dur `const VILLES: [string, string][]` (label + href) pour son maillage interne, sans réutiliser le registre. Les deux listes peuvent diverger silencieusement (une ville ajoutée d'un côté, oubliée de l'autre).
- **Pourquoi ça compte :** la promesse affichée du registre est « SOURCE DE VÉRITÉ UNIQUE » (`seo-architecture.ts:1`). Ici elle est contredite : le seul endroit qui affiche des villes (le maillage du hub) ignore le registre. Risque de liens vers des villes non prévues ou d'incohérence label.
- **Recommandation :** importer `VILLES` du registre dans le hub et en dériver le maillage, ou acter que le hub est un « portage fidèle figé » (auquel cas DATA-02 prime : le registre ville devient documentation, pas donnée active).

### [DATA-04] Le corps MDX des collections `metiers` et `realisations` est un placeholder, mais `render()` est toujours appelé
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/content/metiers/plombier.mdx:12`, `src/content/realisations/far.mdx:17` (et homologues) ; `src/pages/[service]/[metier].astro:53`, `src/pages/realisations/[slug].astro:38`
- **Description :** Le contenu réel de ces pages est rendu par un composant de `views/` (portage Design). Le corps des `.mdx` n'est qu'un commentaire (« Le contenu de cette page est rendu par le composant dédié… »). Pour les métiers, `[service]/[metier].astro:53` court-circuite correctement le rendu (`Content: null` si `MetierComponent` existe). Pour les réalisations, en revanche, `realisations/[slug].astro:38` appelle **toujours** `await render(entry)` même quand un `CaseComponent` prend le relais et que `<Content/>` n'est jamais affiché — travail inutile au build, et `<Content/>` n'est tout simplement pas rendu dans la branche `CaseComponent`.
- **Pourquoi ça compte :** la frontière donnée/contenu devient floue : l'en-tête du fichier (frontmatter) est la vraie donnée, le corps est mort. Un rédacteur qui ouvre `far.mdx` pour « écrire l'étude de cas » éditera un corps qui ne s'affiche pas — il faut éditer `views/realisations/far.astro`. C'est contre-intuitif et non documenté côté collection.
- **Recommandation :** documenter dans `content.config.ts` (ou un README de `content/`) que pour `realisations`/`metiers` le corps MDX est ignoré quand une vue dédiée existe, le frontmatter restant la donnée. Optionnellement, ne plus appeler `render(entry)` dans `realisations/[slug].astro` quand `CaseComponent` est présent (aligné sur ce que fait déjà la route métier).

### [DATA-05] Champs de schéma déclarés mais non lus
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/content.config.ts:18` (`tags` sur `base`, donc sur toutes collections) ; `src/lib/sections.ts:32-36, 44-48` (variantes `grid`, `includes`, `stats`, `timeline` jamais utilisées par certaines collections)
- **Description :** `tags` est déclaré sur toutes les collections via `base`, mais n'est lu que pour `realisations` (`realisations/index.astro:84`) et `guides` (`guides/index.astro:38`). Sur `metiers` (ex. `plombier.mdx:9` `tags: [plombier, plomberie, chauffagiste]`) et `blog`, `tags` est saisi mais jamais affiché ni exploité (ni SEO, ni maillage). Côté sections, l'union discriminée propose 8 variantes ; les pages métier/réalisation câblées par vue dédiée n'en consomment aucune (elles passent par les composants `views/`). Aucune `stats`/`timeline`/`grid` n'apparaît par exemple dans les FAQ JSON-LD dérivées (`[metier].astro:39` ne lit que `type === 'faq'`).
- **Pourquoi ça compte :** un champ saisissable mais ignoré crée une fausse attente (« j'ai mis des tags, pourquoi ne s'affichent-ils pas ? ») et un risque de dette : on maintient une donnée morte. Sans gravité fonctionnelle.
- **Recommandation :** soit exploiter `tags` sur métiers/blog (au minimum dans le rendu ou le maillage), soit le restreindre aux collections qui s'en servent (sortir `tags` de `base` et le remettre dans `realisations`/`guides` uniquement). Documenter quelles variantes de section sont réellement utilisées par chaque collection.

### [DATA-06] Commentaire obsolète : `tone: 'dark'` décrit comme « Jet », couleur retirée du système
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/ui/Section.astro:6`
- **Description :** Le commentaire de la primitive décrit `'dark'` comme « bande sombre Jet ». Or la classe rendue (`Section.astro:26`) est `bg-brand-900` (le brun-olive warm `#403D30`), et `CLAUDE.md` précise « ⚠️ Jet `#2D3138` retiré du système — ne jamais le réintroduire ». Le code est correct ; seul le commentaire ment.
- **Pourquoi ça compte :** un commentaire faux est pire qu'absent : il peut conduire quelqu'un à « corriger » la couleur vers l'ancien Jet, réintroduisant exactement ce que la charte interdit. C'est une donnée de documentation incohérente avec la donnée de design.
- **Recommandation :** remplacer « (bande sombre Jet) » par « (bande sombre warm `brand-900` `#403D30`) ».

### [DATA-07] `MATRICE_VILLE` incomplet vs produit cartésien implicite
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `src/data/seo-architecture.ts:740-750`
- **Description :** `MATRICE_VILLE` ne renseigne que 9 cellules : les 7 villes pour `creation-site-internet`, et seulement `lanester` + `lorient` pour `referencement-seo`. Les deux services portent pourtant `matrice: { ville: true }` (lignes 81). Les autres couples `referencement-seo/{ville}` n'existent pas dans la table — leur statut est donc implicitement « non défini » plutôt que `conditionnel`/`exclu`. Comme rien ne lit cette table (cf. DATA-02), c'est sans effet aujourd'hui, mais si une route venait s'y brancher, l'absence de clé pourrait être interprétée comme « ship par défaut » ou provoquer un `undefined` non géré.
- **Pourquoi ça compte :** une table de garde-fou anti-doorway incomplète est un risque latent : le jour où elle pilote le build, les trous deviennent des comportements non spécifiés. À vérifier au moment du câblage.
- **Recommandation :** au moment d'activer la matrice, soit compléter toutes les cellules `service×ville`, soit définir explicitement la valeur par défaut pour une clé absente (`?? 'exclu'`).

## Points positifs
- **Source de vérité unique réellement appliquée pour les prix et la FAQ** : `data/pricing.ts` est consommé par la landing et `/tarifs` ; `data/faq.ts` documente explicitement que rendu et JSON-LD doivent rester identiques (`faq.ts:1-5`) — exactement la bonne discipline pour les rich results Google.
- **Schémas Zod bien structurés et rétro-compatibles** : champs communs factorisés dans `base` (`content.config.ts:9-20`), union discriminée par `type` pour les sections (`sections.ts:24`) — extensible et validé au build.
- **Frontière content/ ↔ data/ ↔ lib/ globalement claire** : `data/` = config TS, `content/` = entrées éditoriales, `lib/sections.ts` = contrat de structure. Les routes consomment via `getCollection`/`getStaticPaths` de façon idiomatique Astro 5.
- **Commentaires riches et intentionnels** : presque chaque fichier de données explique son rôle et ses garde-fous (anti-doorway, source unique, prix indicatifs à confirmer). Très utile pour la reprise.
- **Validation au build native** : les `coerce.date()` et champs requis garantissent qu'une entrée MDF malformée fait échouer le build plutôt que de produire une page cassée.
- **Typage fort des données de chrome** (`NavItem`, `ServiceLink`, `IconName`, `Tier`, `CompareRow`) : les composants reçoivent des structures contrôlées, pas des objets libres.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| DATA-01 | Moyen | S | Enum « fruit » conservé dans le schéma de sections (labels inertes) |
| DATA-02 | Moyen | M | Matrice « villes » déclarée mais jamais consommée (code mort à statut) |
| DATA-03 | Mineur | S | Double source de vérité « villes » (registre vs hub) |
| DATA-04 | Mineur | S | Corps MDX placeholder mais `render()` toujours appelé (réalisations) |
| DATA-05 | Mineur | S | Champs de schéma déclarés mais non lus (`tags`, variantes de section) |
| DATA-06 | Mineur | S | Commentaire obsolète « Jet » sur `tone: 'dark'` (couleur retirée) |
| DATA-07 | Hypothèse à vérifier | S | `MATRICE_VILLE` incomplet vs produit cartésien implicite |
