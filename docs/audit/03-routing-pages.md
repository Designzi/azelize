# Routing Astro & génération de pages — Rapport d'audit

**Périmètre audité :** `src/pages/**` (routes statiques + dynamiques), `src/views/{hubs,metiers,guides,realisations,villes}`, le câblage `import.meta.glob`, `src/data/seo-architecture.ts` (registre SERVICES + statut), `src/content.config.ts` (collections), `astro.config.mjs` (site, redirects, sitemap, trailing slash), `src/pages/404.astro`, `src/pages/og/[...route].ts`, `src/lib/{seo,og}.ts`, `public/robots.txt`.
**Note de santé :** 7/10 — la machinerie de routage est solide et cohérente (12 hubs, métiers, OG, redirections, anti-doorway respecté), mais un maillage interne pointe vers des URL `/prestations/<service>` qui n'existent pas (404 garantis au build) et quelques incohérences latentes subsistent.

## Résumé exécutif
- Le système de pages est bien pensé : un registre central (`seo-architecture.ts`) décide quelles pages de service sont publiées, et chaque page peut afficher soit une maquette « fidèle » dédiée, soit un repli automatique. Les 12 services publiés ont tous leur maquette : aucun « trou ».
- **Problème net :** plusieurs pages (métiers, guides) renvoient des liens vers des adresses du type `/prestations/creation-site-internet` ou `/prestations/referencement-seo` qui **n'existent pas** sur le site (la seule page `/prestations/...` réellement générée est `/prestations/sites-et-landing`). Ces liens mènent à la page « introuvable ». C'est mauvais pour le visiteur et pour Google (liens internes cassés).
- Un dossier `src/views/villes/` (Lorient, Vannes, gabarit) existe mais **aucune route ne le génère** : c'est du code non publié, conforme à la règle « anti-doorway » revendiquée, mais à clarifier (orphelin volontaire vs oubli).
- Deux services (`creation-site-internet`, `referencement-seo`) déclarent « ouvrir une matrice métier », mais le code ne génère des pages métier que pour **un seul** d'entre eux : une promesse de données non tenue, sans effet visible aujourd'hui mais source de confusion.
- Détails d'hygiène : la page de remerciement (`/merci`) est marquée « non indexée » mais reste présente dans le plan de site (sitemap) ; l'absence de réglage explicite des « slash de fin » d'URL laisse un comportement par défaut à confirmer.

## Constats détaillés

### [ROUTE-01] Liens internes vers `/prestations/<service>` inexistants (404 garantis)
- **Sévérité :** Élevé
- **Effort :** S
- **Localisation :** `src/views/metiers/plombier.astro:151,170`, `src/views/metiers/electricien.astro:132,151`, `src/views/guides/faq-site-web-plombier.astro:72,105`, `src/views/guides/invisible-sur-google.astro:56`, `src/views/guides/guide-agence-web-vs-diy.astro:49`, `src/views/guides/seo-ou-google-ads-artisan.astro:26`
- **Description :** Ces vues pointent vers `/prestations/creation-site-internet` et `/prestations/referencement-seo`. Or la route `src/pages/prestations/[slug].astro` se base sur la collection `prestations`, qui ne contient qu'une seule entrée : `src/content/prestations/sites-et-landing.mdx`. Les seules URL `/prestations/...` réellement buildées sont donc `/prestations` (index) et `/prestations/sites-et-landing`. Les services vivent en réalité à la racine : `/creation-site-internet`, `/referencement-seo` (cf. `seo-architecture.ts` + route `[service]/index.astro`).
- **Pourquoi ça compte :** Chaque clic sur ces boutons/liens aboutit à la page 404. C'est une fuite de conversion (le visiteur d'une page métier qui veut « voir le service » tombe dans le vide) et une pénalité SEO (liens internes cassés, maillage rompu, gaspillage de crawl). Le problème est systémique : 9 occurrences dans 6 fichiers.
- **Recommandation :** Remplacer `/prestations/creation-site-internet` → `/creation-site-internet` et `/prestations/referencement-seo` → `/referencement-seo` dans toutes les vues concernées. Idéalement, dériver ces liens d'une source unique (helper qui résout un slug de service vers son URL de hub) plutôt que de les écrire en dur, pour empêcher la régression.

### [ROUTE-02] `views/villes/` orphelin — aucune route ne génère les pages ville
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/{_template,lorient,vannes}.astro` ; absence de route correspondante dans `src/pages/`
- **Description :** Le dossier contient un gabarit et deux pages ville complètes (Lorient, Vannes), mais : (1) aucune route Astro ne les charge (pas de `[service]/[ville].astro` ni équivalent) ; (2) aucune collection `villes` dans `content.config.ts` ; (3) la matrice ville de `seo-architecture.ts` (`MATRICE_VILLE`) classe toutes les cellules en `conditionnel`/`exclu` — donc rien n'est `ship`. Le commentaire en tête de `lorient.astro:8` l'assume explicitement : « Composant autonome NON câblé à une route (règle anti-doorway) ».
- **Pourquoi ça compte :** Ce code est non publié et inerte. C'est cohérent avec la stratégie anti-doorway revendiquée (ne pas mettre en ligne des pages locales sans contenu unique réel), donc ce n'est pas un bug. Mais sans signal fort, un futur contributeur peut croire à un oubli de câblage et publier des pages doublons, ou au contraire supprimer du travail volontairement scaffoldé. La maintenabilité en souffre.
- **Recommandation :** Décider et documenter le statut : soit marquer clairement ces fichiers comme « scaffold roadmap » (un README dans `views/villes/` renvoyant à `MATRICE_VILLE`), soit les retirer du repo jusqu'à activation. Quand une cellule passera `ship`, prévoir la route `[service]/[ville].astro` calquée sur `[metier].astro`.

### [ROUTE-03] `matrice.metier` déclaré sur 2 services mais 1 seul génère des pages métier
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/data/seo-architecture.ts:81` (`referencement-seo` → `matrice: { ville: true, metier: true }`) vs `src/data/seo-architecture.ts:695` (`SERVICE_AVEC_METIERS = 'creation-site-internet'`, valeur unique) consommé par `src/pages/[service]/[metier].astro:21`
- **Description :** `referencement-seo` annonce une matrice métier (`metier: true`), mais la route `[service]/[metier].astro` est codée en dur autour de `SERVICE_AVEC_METIERS` (une seule chaîne). Conséquence : aucune page `/referencement-seo/{metier}` n'est générée. Le hub `referencement-seo` n'affiche d'ailleurs pas non plus le maillage métier (le bloc « Votre site selon votre métier » du hub ne s'active que pour le repli éditorial ET pour `SERVICE_AVEC_METIERS` — or `referencement-seo` a une maquette dédiée, donc `HubComponent` court-circuite ce repli, cf. `[service]/index.astro:46-49`).
- **Pourquoi ça compte :** Le champ `matrice.metier` de `referencement-seo` est une donnée trompeuse : elle suggère une intention non implémentée. Aujourd'hui sans impact visible (pas de lien mort généré), mais c'est un piège : quelqu'un qui se fie au registre croira que les pages existent. Risque de drift entre la « source de vérité unique » revendiquée et le comportement réel.
- **Recommandation :** Soit aligner la donnée sur le code (passer `referencement-seo` à `metier: false` tant que non câblé), soit généraliser la route : remplacer `SERVICE_AVEC_METIERS` (string) par une liste de services à matrice métier et itérer dessus dans `getStaticPaths`. Documenter le choix.

### [ROUTE-04] `/merci` est noindex mais non exclue du sitemap
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/pages/merci.astro:17` (`noindex`) vs `astro.config.mjs:23-26` (filtre sitemap n'exclut que `/mentions-legales` et `/confidentialite`)
- **Description :** Trois pages portent `noindex` : `mentions-legales`, `confidentialite`, `merci` (plus `404`, hors sitemap par nature). Le filtre du sitemap n'exclut que les deux premières. `/merci` se retrouve donc listée dans le sitemap tout en étant marquée non-indexable.
- **Pourquoi ça compte :** Incohérence de signaux pour les moteurs : un sitemap déclare « voici mes pages à indexer », alors que la page dit « ne m'indexe pas ». Ce n'est pas grave (Google gère), mais c'est exactement le type d'incohérence que le filtre cherchait à éviter, et le commentaire du filtre (`Exclure les pages noindex`) prétend le faire de façon exhaustive.
- **Recommandation :** Ajouter `&& !page.includes('/merci')` au filtre du sitemap, ou — plus robuste — dériver la liste d'exclusion d'une source commune avec les pages qui passent `noindex` pour éviter de réoublier au prochain ajout.

### [ROUTE-05] `trailingSlash` et `build.format` non explicités — canonical vs URL servies
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `astro.config.mjs` (aucun `trailingSlash` ni `build.format`) ; `src/lib/seo.ts:28` (canonical = `new URL(pathname, site.url)`) ; `src/lib/seo.ts:87` (breadcrumb JSON-LD via `abs(url)` sans slash final)
- **Description :** Aucun réglage `trailingSlash` n'est posé. Par défaut Astro construit en format `directory` (`/creation-site-internet/index.html`, servi à `/creation-site-internet/`) et `trailingSlash: 'ignore'`. Or les canonical et les URL JSON-LD sont générées **sans** slash final (`/creation-site-internet`, `/realisations`, etc.), car dérivées soit de chemins codés en dur sans slash (breadcrumbs), soit de `Astro.url.pathname` (qui, en dev/preview, peut ou non porter le slash selon le serveur). Selon l'hébergeur de production, l'URL réellement servie peut différer (avec ou sans slash) de la canonical déclarée.
- **Pourquoi ça compte :** Si l'URL canonique annoncée diffère de l'URL réellement servie/liée (slash final), on crée un signal SEO ambigu (canonical pointant vers une variante, risque de duplication perçue). À confirmer en inspectant le `dist/` buildé et le comportement de l'hébergeur cible.
- **Recommandation :** Fixer explicitement `trailingSlash: 'never'` (cohérent avec les URL sans slash déjà utilisées partout dans les breadcrumbs/JSON-LD) dans `astro.config.mjs`, puis vérifier que les canonical produits dans `dist/` correspondent. À défaut, normaliser le `pathname` dans `resolveSeo` pour garantir une forme unique.

### [ROUTE-06] Mention « Menthe » obsolète dans la génération OG (commentaires + couleurs)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/pages/og/[...route].ts:6,60` (commentaire « fond Menthe profond », « Marque Menthe »)
- **Description :** Les commentaires du générateur d'images Open Graph parlent de « Menthe », vocabulaire du système fruit explicitement déclaré **superseded et élagué** par `CLAUDE.md`. Les couleurs OG codées en dur (dégradé `#001040 → #002080`, bord `#0040FF`, texte `#BFCFFF`) ne correspondent pas non plus à la palette marque actuelle « Ocean Twilight » (`brand #2347B8`). C'est une route de build, hors `check:tokens` (couleurs en dur tolérées ici techniquement, mais désalignées de la charte).
- **Pourquoi ça compte :** Les images OG (vignettes de partage social) ne reflètent pas l'identité visuelle réelle du site, et la documentation interne propage un vocabulaire abandonné — friction de maintenance et incohérence de marque sur les réseaux/Google.
- **Recommandation :** Mettre à jour le dégradé et les libellés OG sur la palette Ocean Twilight (`brand #2347B8`, encre/crème selon la charte) et purger le mot « Menthe » des commentaires. Idéalement, lire les couleurs depuis les tokens plutôt que de les recopier.

### [ROUTE-07] Repli métier du hub inatteignable dès qu'une maquette dédiée existe
- **Sévérité :** Hypothèse à vérifier
- **Effort :** M
- **Localisation :** `src/pages/[service]/index.astro:46-49` et `:62-90`
- **Description :** Le bloc « Votre site selon votre métier » (maillage vers les pages métier) n'est rendu que dans la branche de repli (`!HubComponent`) ET seulement pour `SERVICE_AVEC_METIERS`. Comme `creation-site-internet` possède une maquette dédiée (`views/hubs/creation-site-internet.astro`), `HubComponent` est défini, donc `metiers` reste `[]` et le bloc de repli ne s'affiche jamais. Le maillage hub → métiers dépend alors entièrement de ce que contient la maquette dédiée (à vérifier qu'elle relaie bien vers `/creation-site-internet/{plombier,…}`).
- **Pourquoi ça compte :** Si la maquette dédiée du hub création n'inclut pas elle-même les liens vers les 5 pages métier, ces pages métier deviennent quasi orphelines (atteignables seulement via sitemap/maillage latéral), ce qui dilue leur poids SEO et leur découvrabilité. Le code de repli donne une fausse impression de filet de sécurité qui, ici, ne s'arme jamais.
- **Recommandation :** Vérifier dans `views/hubs/creation-site-internet.astro` la présence des liens vers les pages métier ; sinon, sortir le bloc maillage de la branche de repli pour qu'il s'affiche aussi sous une maquette dédiée, ou garantir le maillage côté maquette.

## Points positifs
- **Registre central pilote le build** (`seo-architecture.ts`) : seuls les services `ship` génèrent un hub (`[service]/index.astro:21-25`), discipline anti-doorway claire et tenue (matrice ville/`MATRICE_VILLE` jamais `ship`).
- **Couverture complète des 12 services publiés** : chaque slug `ship` a une maquette dédiée correspondante dans `views/hubs/` (vérifié 1:1), et le méga-menu (`nav.ts`) pointe vers les 12 hubs existants — pas de lien mort au niveau de la nav principale.
- **Câblage `import.meta.glob` robuste avec repli** : hubs, métiers, guides et réalisations chargent une maquette fidèle si elle existe, sinon retombent proprement sur un rendu éditorial (Blocks/MDX) — pas d'écran blanc, double source de vérité maîtrisée par convention de nommage `id`/slug.
- **Collections cohérentes avec les routes** : `metiers` (5 mdx) = `views/metiers` (5) = `METIERS_CIBLES` (5 `ship`) ; `realisations` (3) et `guides` (7) alignés avec leurs vues ; le brouillon blog est filtré (`blog/[slug].astro:9`).
- **OG, sitemap, robots, redirections en place** : génération OG build-time pour toutes les pages clés (`og/[...route].ts`), `site` défini pour canonical/sitemap, `robots.txt` renvoyant au sitemap-index, redirections legacy `/site-internet/*` → architecture en couches (y compris métiers retirés vers le hub plutôt qu'un 404).
- **404 sur-mesure** avec liens de récupération et `noindex`, JSON-LD breadcrumbs systématique sur les pages dynamiques.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| ROUTE-01 | Élevé | S | Liens internes vers `/prestations/<service>` inexistants (404) |
| ROUTE-02 | Moyen | S | `views/villes/` orphelin — aucune route ne le génère |
| ROUTE-03 | Moyen | M | `matrice.metier` sur 2 services mais 1 seul génère les pages métier |
| ROUTE-04 | Mineur | S | `/merci` noindex mais présente dans le sitemap |
| ROUTE-05 | Hypothèse à vérifier | S | `trailingSlash`/`build.format` non explicités vs canonical |
| ROUTE-06 | Mineur | S | Vocabulaire/couleurs « Menthe » obsolètes dans la génération OG |
| ROUTE-07 | Hypothèse à vérifier | M | Repli maillage métier du hub inatteignable sous maquette dédiée |
