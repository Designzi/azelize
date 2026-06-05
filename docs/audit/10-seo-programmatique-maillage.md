# SEO programmatique & maillage interne — Rapport d'audit

**Périmètre audité :** `src/data/seo-architecture.ts`, `src/content.config.ts`, routes programmatiques (`src/pages/[service]/index.astro`, `src/pages/[service]/[metier].astro`, `src/pages/{guides,realisations,prestations}/[slug].astro` + index), `src/views/{hubs,metiers,villes,guides,realisations}/`, maillage interne (`src/data/nav.ts`, `src/data/footer.ts`, `src/sections/shared/FinalCta.astro`, breadcrumbs), `astro.config.mjs` (sitemap/redirects), `public/robots.txt`, `src/lib/seo.ts`, sortie `dist/` (sitemap + pages générées).
**Note de santé :** 5/10 — l'ossature programmatique (registre piloté par statut, anti-doorway au sitemap) est saine et bien pensée, mais le maillage interne réel est en grande partie cassé : de nombreux liens internes pointent vers des URLs qui n'existent pas, et le câblage du maillage est codé en dur page par page au lieu d'être dérivé du registre.

## Résumé exécutif
- **La « machine à pages » est saine au niveau du sitemap** : seuls les services et métiers réellement prêts (`ship`) sont publiés. Aucune page « ville » ni page-piège (« doorway ») ne se retrouve dans le sitemap ni indexée. C'est exactement le comportement anti-spam visé.
- **Mais le maillage interne est troué** : sur les pages hub et métier, beaucoup de liens « Site à Lorient », « Référencement local », « Le prix d'un site » pointent vers des adresses qui n'existent pas (pages 404) ou vers un dièse (`#`, lien mort). Concrètement, un visiteur — et Google — cliquent dans le vide.
- **Le maillage est recopié à la main sur chaque page** au lieu d'être généré à partir du registre central. Résultat : 5 pages métier ont 5 listes de liens différentes et incohérentes, certaines justes, d'autres fausses (une même destination écrite de 3 façons différentes, dont une carrément invalide).
- **Des fichiers de pages « ville » existent dans le code (Lorient, Vannes, gabarit) mais ne sont reliés à aucune route** : ils ne se construisent jamais. C'est du code mort qui entretient la confusion (les liens internes croient qu'ils existent).
- **Le footer ne liste que 6 services sur 11** : 5 services réellement publiés (covering, print, vidéo, e-mails, catalogues) n'ont quasiment aucun lien entrant depuis le reste du site, ce qui les rend faibles aux yeux de Google.

## Constats détaillés

### [PROG-01] Maillage interne cassé : liens vers des URLs inexistantes sur les pages hub et métier
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/views/hubs/creation-site-internet.astro:14-30`, `src/views/metiers/plombier.astro:146-151,170`, `src/views/metiers/electricien.astro:129-132,151`, `src/views/metiers/vtc.astro:48-53`, `src/views/metiers/macon.astro:191-192`
- **Description :** De nombreux liens internes pointent vers des routes qui ne sont pas générées (vérifié dans `dist/`). Cas confirmés :
  - Hub `creation-site-internet.astro` : les chips villes Lorient/Vannes/Hennebont/Auray ont `href="#"` (lignes 16-19, liens morts) ; la chip Lanester pointe `/creation-site-internet/lanester` (non buildé). Les 8 chips métier ont **toutes** `href="#"` (lignes 21-30) — y compris des métiers qui n'existent pas en contenu (Peintre, Carreleur, Menuisier, Paysagiste). Le hub ne maille donc vers **aucune** des 5 vraies pages métier.
  - `plombier.astro` et `electricien.astro` : chips `/creation-site-internet/lanester`, `/creation-site-internet/lorient`, `/creation-site-internet/vannes` (pages villes non buildées) et `/prestations/referencement-seo` (n'existe pas — la seule prestation buildée est `sites-et-landing`). Bouton « Voir le service » → `/prestations/creation-site-internet` (n'existe pas).
  - `vtc.astro:51-52` : `/creation-site-internet-lorient` (URL **malformée** — tiret au lieu de slash, n'a jamais existé) et `/combien-coute-site-internet` (le guide existe à `/guides/combien-coute-site-internet`, le préfixe `/guides/` manque → 404).
- **Pourquoi ça compte :** Chaque lien interne mort est une impasse pour le visiteur (mauvaise expérience, perte de conversion) et un signal négatif pour Google, qui suit ces liens et tombe sur des 404. Le « jus de lien » (autorité interne) se perd au lieu de circuler vers les pages utiles. Sur des pages censées être les « pages de référence » du SEO (les métiers), c'est le cœur du maillage qui est défaillant.
- **Recommandation :** Ne lier que vers des destinations réellement buildées. Idéalement, dériver toutes les chips de maillage du registre `seo-architecture.ts` (filtré sur `statut === 'ship'` pour les villes/métiers, et sur la collection `metiers` réelle), de sorte qu'un lien ne puisse pas exister sans page cible. À court terme : corriger les `href` (préfixe `/guides/`, slash au lieu de tiret, retirer les liens villes/prestations inexistants).

### [PROG-02] Maillage interne dupliqué et codé en dur page par page (pas de source unique)
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/views/metiers/plombier.astro:146-151`, `electricien.astro:129-132`, `macon.astro:190-194`, `vtc.astro:48-53`, `garage-automobile.astro:219-223`, `creation-site-internet.astro:14-30`
- **Description :** Le bloc « D'autres métiers, d'autres villes » est recopié à la main dans chaque vue, avec un jeu de liens **différent et incohérent** d'une page à l'autre : macon et garage pointent prudemment les chips ville vers le hub `/creation-site-internet`, tandis que plombier/electricien pointent vers des URLs ville inexistantes, et vtc utilise une URL malformée. La même intention (« Site à Lorient ») est écrite de 3 manières incompatibles. Aucune ne s'appuie sur `VILLES` / `METIERS_CIBLES` du registre.
- **Pourquoi ça compte :** Le pattern programmatique promet « 1 source de vérité → N pages cohérentes ». Ici le maillage est l'exact inverse : N copies manuelles divergentes. Toute évolution (nouvelle ville `ship`, nouveau métier) doit être répercutée à la main sur chaque vue, avec un risque garanti d'oubli et de liens morts (cf. PROG-01). Ce n'est pas scalable et c'est la cause-racine de PROG-01.
- **Recommandation :** Créer un composant de maillage unique (ex. `MaillageMetiers.astro`) qui reçoit le métier courant et génère les chips à partir du registre (`getCollection('metiers')` pour les autres métiers, `VILLES`/`MATRICE_VILLE` filtrés `ship` pour les villes). Les vues n'importent que ce composant. On supprime ainsi la duplication et on rend les liens morts structurellement impossibles.

### [PROG-03] Vues « ville » orphelines : code mort jamais relié à une route
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/_template.astro`, `src/views/villes/lorient.astro`, `src/views/villes/vannes.astro`
- **Description :** Trois fichiers de vues villes existent, mais aucune route ne les charge : il n'y a pas de `pages/[service]/[ville].astro`, aucun `import.meta.glob('../../views/villes/...')` (vérifié — seules des mentions en commentaires existent), et `dist/` ne contient aucune page ville. La matrice ville (`MATRICE_VILLE` dans `seo-architecture.ts:740-750`) est entièrement `conditionnel`/`exclu`, donc volontairement non buildée. Ces vues sont donc du code mort.
- **Pourquoi ça compte :** Le code mort entretient une illusion de fonctionnalité : plusieurs liens internes (PROG-01) supposent que `/creation-site-internet/lorient` existe « parce que la vue est là ». Pour un nouvel intervenant, c'est trompeur et c'est une dette qui invite à câbler des pages géo (risque doorway, cf. PROG-04). Côté SEO pur, aucun impact direct (rien n'est publié), d'où la sévérité Moyen.
- **Recommandation :** Soit supprimer `src/views/villes/` (assumer que la couche ville n'est pas d'actualité), soit documenter explicitement leur statut « scaffolding non câblé » et bloquer leur câblage tant que la règle anti-doorway (contenu local unique réel) n'est pas remplie. Ne jamais les relier sans contenu différencié par ville.

### [PROG-04] Couche « ville » = risque doorway géographique à surveiller (machinerie de garde présente)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** M
- **Localisation :** `src/data/seo-architecture.ts:697-750`, `src/content.config.ts:52-67`
- **Description :** Le registre encode une matrice service × ville (Lanester, Lorient, Vannes, Hennebont, Auray, Ploemeur, Quéven) avec une règle anti-doorway explicite : seules les cellules `ship` sont buildées/indexées, et le commentaire interdit de passer une cellule à `ship` sans « ≥1 cas local OU FAQ métier distincte ». À ce jour, toutes les cellules ville sont `conditionnel`/`exclu` (donc rien n'est publié). `content.config.ts` revendique aussi que la collection `metiers` cible l'intention d'achat (« site internet pour plombier ») et **non** le SEO local géographique, justement pour éviter le doorway. La machinerie de garde est donc bien là et fonctionne (sitemap propre, PROG-07).
- **Pourquoi ça compte :** Les pages « service à [ville] » dupliquées avec un contenu quasi identique d'une commune à l'autre sont le motif doorway classiquement pénalisé par Google. Le risque n'est pas actuel (rien n'est publié), mais il deviendrait Élevé si la couche ville était activée sans contenu réellement différencié par commune — d'autant que les vues existantes (`lorient.astro`, `vannes.astro`) dérivent d'un `_template.astro` commun.
- **Recommandation :** Conserver la discipline du registre. Avant tout passage d'une ville à `ship` : exiger un contenu local vérifiable (cas client local, FAQ/zone d'intervention propres, preuves). Auditer la divergence de contenu entre deux villes avant publication. Garder Ploemeur/Quéven en `exclu` (population < seuil, justifié dans le code).

### [PROG-05] Footer : seuls 6 services sur 11 sont maillés → 5 services publiés quasi orphelins
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/data/footer.ts:17-26`, comparé à `src/data/seo-architecture.ts:32-689` (11 services `ship`)
- **Description :** Le footer liste 6 services (création, référencement, Canva, identité, SaaS, automatisations). Manquent : `supports-print`, `habillage-vehicule-covering`, `production-video`, `templates-email`, `catalogues-produit` — pourtant tous `ship` et présents au sitemap. Le méga-menu du header (`nav.ts:61-93`) liste bien les 11 services, donc ces 5 pages reçoivent au moins le lien du méga-menu ; mais le footer (lien sitewide le plus stable) les ignore. Aucune page « liste de tous les services » ne les regroupe non plus (la page `/prestations` ne liste que la collection `prestations`, cf. PROG-06).
- **Pourquoi ça compte :** Le nombre et la qualité des liens internes entrants pondèrent l'importance d'une page pour Google. Cinq pages de service « à la traîne » sur le maillage (présentes au sitemap mais peu liées) seront perçues comme secondaires et remonteront mal. Pour un site qui vend ces services, c'est une perte de visibilité directe.
- **Recommandation :** Compléter la colonne « Services » du footer pour couvrir les 11 services (ou un sous-ensemble cohérent), idéalement en la dérivant de `SERVICES.filter(s => s.statut === 'ship')` plutôt qu'en liste manuelle, pour rester synchrone avec le registre.

### [PROG-06] Page `/prestations` désynchronisée du registre des services (deux sources de vérité concurrentes)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/pages/prestations/index.astro:8-10`, `src/pages/prestations/[slug].astro`, `src/content/prestations/` (1 seul fichier : `sites-et-landing.mdx`), vs `src/data/seo-architecture.ts` (11 services)
- **Description :** Il existe **deux** systèmes parallèles décrivant l'offre : (a) le registre `SERVICES` (11 services, qui génère les hubs `/{service}`) et (b) la collection `prestations` (1 seule entrée, `sites-et-landing`, qui génère `/prestations/{slug}` + l'index `/prestations`). La page `/prestations` n'affiche donc qu'**une** carte, sans rapport avec les 11 hubs services. Plusieurs liens internes pointent d'ailleurs vers des prestations qui n'existent pas (`/prestations/referencement-seo`, `/prestations/creation-site-internet` — cf. PROG-01), preuve que la frontière entre « service » et « prestation » n'est pas claire dans le code lui-même.
- **Pourquoi ça compte :** Deux sources de vérité pour « ce que vend l'entreprise » génèrent des incohérences (liens morts, page index quasi vide, doublon conceptuel hub vs prestation). Pour le SEO, on se retrouve potentiellement avec deux familles d'URLs concurrentes pour des intentions proches, et un index `/prestations` qui n'apporte presque rien.
- **Recommandation :** Clarifier la frontière : soit la collection `prestations` est dépréciée au profit des hubs services (et `/prestations` redirige/agrège les hubs), soit elle a un rôle distinct documenté. Dans tous les cas, faire pointer les liens internes vers la bonne famille d'URLs et aligner l'index sur le registre.

### [PROG-07] Sitemap & robots propres, redirections legacy en place — anti-doorway opérationnel
- **Sévérité :** Mineur (constat positif à préserver / surveiller)
- **Effort :** S
- **Localisation :** `astro.config.mjs:7-32`, `public/robots.txt`, `dist/sitemap-0.xml`
- **Description :** Le `dist/sitemap-0.xml` ne contient **que** des pages réelles : les 11 hubs, les 5 métiers `ship`, guides, réalisations, prestations, pages éditoriales. Aucune page ville, aucune URL legacy `/site-internet/*`, aucune page-piège. Les anciennes URLs `/site-internet/*` sont redirigées (301 statiques) vers la nouvelle architecture `/creation-site-internet/*`, y compris les métiers retirés (paysagiste, menuisier) renvoyés vers le hub plutôt qu'en 404. `robots.txt` pointe correctement le `sitemap-index.xml`. La config sitemap exclut bien `/mentions-legales` et `/confidentialite` (cohérent avec un `noindex`). Note : ces deux pages **ne posent pas** de balise `noindex` réelle (le mécanisme `seo.noindex` existe dans `Seo.astro:24` mais n'est pas activé sur ces pages) — à vérifier si l'exclusion sitemap suffit à votre intention.
- **Pourquoi ça compte :** C'est le socle qui empêche le site de publier des pages fines/dupliquées. Bien fait, il protège la réputation SEO du domaine. À préserver lors des prochaines activations de cellules.
- **Recommandation :** Conserver le pilotage par statut. Vérifier l'alignement « exclusion sitemap » vs « balise `noindex` » sur mentions/confidentialité (si l'on veut vraiment qu'elles soient désindexées, poser `noindex` ; sinon, retirer l'exclusion sitemap).

### [PROG-08] JSON-LD `Service` sans rattachement géographique fin (areaServed = 'FR' partout)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/lib/seo.ts:135-145` (`serviceJsonLd`), `src/lib/seo.ts:59-76` (`localBusinessJsonLd`)
- **Description :** Les pages service et métier émettent un JSON-LD `Service` avec `areaServed: 'FR'`, et le `ProfessionalService` (local) n'est posé que sur home/contact (à vérifier). Pour un studio dont l'offre métier vise des artisans locaux (Morbihan), il n'y a pas de signal structuré reliant les pages métier à une zone réelle. Ce n'est pas un défaut bloquant (les pages métier ciblent volontairement l'intention nationale « site pour plombier », pas le local), mais c'est un levier structurel non exploité.
- **Pourquoi ça compte :** Le balisage structuré aide Google à comprendre la nature et la portée de l'offre. Tant que la stratégie reste « national par métier », `FR` est cohérent ; si la couche ville est activée un jour, il faudra un balisage `areaServed` par commune pour appuyer le local.
- **Recommandation :** Laisser `FR` tant que les pages restent non géographiques. Documenter que l'activation d'une couche ville impliquera d'enrichir `serviceJsonLd`/`localBusinessJsonLd` avec la zone réelle.

### [PROG-09] Profondeur de clic des pages métier dépendante d'un hub au maillage cassé
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/pages/[service]/index.astro:45-49,62-94`, `src/views/hubs/creation-site-internet.astro:90-132`
- **Description :** La route hub prévoit un bloc de maillage automatique vers les pages métier (`getCollection('metiers')` → cartes), **mais uniquement dans le repli éditorial** (`!HubComponent`). Or `creation-site-internet` a une vue dédiée (`HubComponent` défini), donc ce bloc auto n'est jamais rendu : c'est le maillage codé en dur de la vue qui prend le relais — et il pointe tous ses chips métier vers `#` (PROG-01). Conséquence : les 5 pages métier ne sont atteignables ni depuis leur hub, ni depuis le footer, ni depuis le méga-menu (qui ne liste que les services). Leur seul lien entrant fiable provient des chips croisées entre métiers (et encore, partiellement cassées).
- **Pourquoi ça compte :** Une page sans lien interne fiable est quasi orpheline : difficile à découvrir par Google et par l'utilisateur, profondeur de clic élevée ou nulle. Les pages métier sont pourtant désignées « pages de référence » du SEO programmatique — elles devraient être les mieux maillées.
- **Recommandation :** Faire rendre le bloc « Votre site selon votre métier » (cartes issues de la collection) **aussi** quand une vue hub dédiée existe (le sortir du repli, l'injecter via slot ou l'appeler depuis la vue), ou intégrer le composant de maillage de PROG-02 dans la vue hub avec des liens réels vers `/creation-site-internet/{metier}`.

## Points positifs
- **Pilotage par statut (`ship`/`conditionnel`/`exclu`) réellement appliqué** : `getStaticPaths` filtre sur `statut === 'ship'` (`[service]/index.astro:21-25`) et le sitemap ne contient que des pages réelles — la promesse anti-doorway tient au niveau publication.
- **Registre central unique et bien documenté** (`seo-architecture.ts`) encodant toute la matrice services × villes × métiers avec une règle anti-doorway explicite et justifiée (commentaires lignes 1-13, 735-739).
- **Pattern programmatique propre côté routes** : une seule route paramétrée `[service]/[metier].astro` génère toutes les pages métier depuis la collection (« 5 métiers = 1 route »), avec repli éditorial gracieux (portage fidèle si vue dédiée, sinon Blocks + MDX).
- **Breadcrumbs cohérents et balisés** : chaque route construit un fil d'Ariane visible ET son `BreadcrumbList` JSON-LD (`seo.ts:79-90`), avec URLs absolues correctes.
- **Canonical correct par page** : `Seo.astro:13` dérive le canonical de `Astro.url.pathname` (le défaut `'/'` de `resolveSeo` n'est jamais atteint), donc pas de canonical erroné malgré l'absence de `pathname` passé par `BaseLayout`.
- **FAQPage JSON-LD dérivé des sections FAQ réellement affichées** (`[metier].astro:39`, `guides/[slug].astro:28`, `prestations/[slug].astro:27`) — respecte la règle Google « contenu structuré = contenu visible ».
- **Redirections legacy 301 en place** (`astro.config.mjs`) y compris pour les métiers retirés renvoyés vers le hub, évitant les 404 sur les anciennes URLs indexées.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| PROG-01 | Élevé | M | Maillage interne cassé : liens vers des URLs inexistantes (hub + métiers) |
| PROG-02 | Élevé | M | Maillage dupliqué et codé en dur page par page (pas de source unique) |
| PROG-03 | Moyen | S | Vues « ville » orphelines : code mort jamais relié à une route |
| PROG-04 | Hypothèse à vérifier | M | Couche ville = risque doorway géographique (garde présente, à surveiller) |
| PROG-05 | Moyen | S | Footer : 6 services sur 11 maillés → 5 services publiés quasi orphelins |
| PROG-06 | Moyen | M | Page `/prestations` désynchronisée du registre (deux sources de vérité) |
| PROG-07 | Mineur | S | Sitemap/robots propres + redirections legacy — anti-doorway opérationnel |
| PROG-08 | Mineur | S | JSON-LD Service sans rattachement géographique fin |
| PROG-09 | Moyen | S | Pages métier quasi orphelines (hub à vue dédiée n'émet pas le maillage auto) |
