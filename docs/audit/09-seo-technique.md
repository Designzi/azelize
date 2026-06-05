# Architecture SEO technique — Rapport d'audit

**Périmètre audité :** `src/components/layout/Seo.astro`, `src/lib/seo.ts`, `src/lib/og.ts`, `src/layouts/BaseLayout.astro` + `ArticleLayout.astro`, `src/pages/og/[...route].ts`, `astro.config.mjs` (site, sitemap, redirects), `public/robots.txt`, `src/data/site.ts`, `src/data/seo-architecture.ts`, le câblage JSON-LD dans toutes les routes `src/pages/**`, et le rendu réel dans `dist/` (sitemap, canonical, balises générées).
**Note de santé :** 8/10 — machinerie SEO technique solide, centralisée et bien câblée ; deux trous nets (page `noindex` présente au sitemap, JSON-LD local absent de `/contact`) et quelques manques structurels d'enrichissement.

## Résumé exécutif
- La « plomberie » SEO est centralisée et propre : un seul composant (`Seo.astro`) produit `<title>`, description, canonical, Open Graph, Twitter et les données structurées pour toutes les pages — pas de balises éparpillées à maintenir page par page.
- Les données structurées (ce que Google lit pour afficher des résultats enrichis) sont correctement posées : Organisation, Service, Article, Fil d'Ariane, Page FAQ, et un bloc « commerce local » sur l'accueil. Les types sont conformes et les URL sont absolues.
- Les images de partage social (Open Graph) sont générées automatiquement au build, une par page clé — un vrai plus rarement fait sur ce type de site.
- **Trou net :** la page de remerciement `/merci`, marquée « ne pas indexer », apparaît quand même dans le plan du site (sitemap) qu'on soumet à Google — incohérence à corriger.
- **Trou net :** la fiche « commerce local » (adresse, téléphone) n'est posée que sur l'accueil ; la page `/contact`, qui serait le bon endroit, n'émet aucune donnée structurée.
- Manques d'enrichissement sans gravité : pas de date de dernière modif (`lastmod`) au sitemap, pas de dimensions/`alt` sur les images sociales, fiche Organisation minimale (ni téléphone, ni réseaux sociaux).

## Constats détaillés

### [SEO-01] La page `noindex` `/merci` est listée dans le sitemap
- **Sévérité :** Élevé
- **Effort :** S
- **Localisation :** `astro.config.mjs:24` (filtre sitemap) ; `src/pages/merci.astro:17` (`noindex`) ; vérifié dans `dist/sitemap-0.xml` (présence de `https://azelize.com/merci/`) et `dist/merci/index.html` (`<meta name="robots" content="noindex, nofollow">`).
- **Description :** Le filtre du sitemap n'exclut que `/mentions-legales` et `/confidentialite`. Or `merci.astro` (et `404.astro`, exclu nativement par Astro) sont en `noindex`. Résultat : `/merci/` est soumis à Google via le sitemap tout en lui disant de ne pas l'indexer — message contradictoire.
- **Pourquoi ça compte :** Un sitemap est une liste de pages qu'on demande explicitement à Google d'explorer/indexer. Y mettre une page `noindex` est une incohérence que la Search Console signale (« Exclue par la balise noindex »), gaspille du budget d'exploration et brouille le signal. Sans impact direct sur le classement, mais c'est un défaut de propreté qui peut s'aggraver à chaque nouvelle page `noindex` ajoutée (le filtre est une liste en dur).
- **Recommandation :** Rendre la cohérence automatique plutôt que manuelle. Idéalement, dériver l'exclusion du sitemap de la même source que la balise `noindex` (ex. un registre des chemins `noindex` partagé entre `astro.config.mjs` et les pages). À défaut, ajouter `!page.includes('/merci')` au filtre dès maintenant, et documenter la règle « toute page `noindex` doit être exclue du filtre sitemap ».

### [SEO-02] Aucune donnée structurée sur `/contact` (commerce local posé seulement sur l'accueil)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/lib/seo.ts:58-76` (`localBusinessJsonLd`, dont le commentaire dit « home / contact ») ; `src/pages/index.astro:17` (seul appel) ; confirmé : `dist/contact/index.html` ne contient aucun bloc `application/ld+json`.
- **Description :** La fonction `localBusinessJsonLd()` (type `ProfessionalService` avec adresse + téléphone) n'est appelée que sur l'accueil. Son propre commentaire annonce « home / contact », mais `/contact` n'émet rien. La page la plus naturelle pour porter les coordonnées structurées (NAP : nom, adresse, téléphone) est sans données.
- **Pourquoi ça compte :** Pour un prestataire local, la fiche structurée « commerce/service » sur la page contact aide Google à associer l'entreprise à une adresse et un téléphone (cohérence avec la fiche Google Business, knowledge panel, SEO local). C'est un manque structurel facile à combler.
- **Recommandation :** Ajouter `jsonLd={[localBusinessJsonLd()]}` (et éventuellement `organization`) sur `src/pages/contact.astro`, comme sur l'accueil.

### [SEO-03] Sitemap sans `lastmod` (date de dernière modification)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `astro.config.mjs:22-27` (config `@astrojs/sitemap` sans `serialize`/`lastmod`) ; vérifié dans `dist/sitemap-0.xml` : chaque `<url>` ne contient qu'un `<loc>`, aucun `<lastmod>`.
- **Description :** Le sitemap généré ne porte aucune date de modification. Les contenus datés existent pourtant côté collections (`date`/`updated` sur blog et guides, exploités par `articleJsonLd`).
- **Pourquoi ça compte :** Le `lastmod` aide les moteurs à prioriser le re-crawl des pages réellement modifiées. Son absence n'est pas pénalisante en soi, mais c'est une optimisation structurelle standard, surtout sur un site qui se veut « tenu chaque mois » (l'argument commercial même du produit) : afficher la fraîcheur a du sens ici.
- **Recommandation :** Renseigner `lastmod` via l'option `serialize` du sitemap (mapper l'URL vers la date `updated`/`date` de la collection correspondante), ou a minima la date de build pour les pages éditoriales statiques.

### [SEO-04] Open Graph / Twitter sans dimensions ni texte alternatif
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/layout/Seo.astro:27-39`.
- **Description :** Les balises émises sont `og:image` + `twitter:image` (sans `og:image:width`, `og:image:height`, `og:image:alt`, ni `twitter:image:alt`). Les images OG font pourtant une taille connue et fixe (1200×630, cf. `src/pages/og/[...route].ts`). Manque aussi `og:image:type`.
- **Pourquoi ça compte :** `og:image:width`/`height` permettent à certaines plateformes (LinkedIn, Slack…) d'afficher l'aperçu sans télécharger l'image d'abord (rendu plus fiable et immédiat). `og:image:alt`/`twitter:image:alt` améliorent l'accessibilité du partage. Impact marketing/partage, pas classement.
- **Recommandation :** Ajouter dans `Seo.astro` : `og:image:width=1200`, `og:image:height=630`, `og:image:type=image/png`, et un `og:image:alt`/`twitter:image:alt` (réutiliser le `title` ou la description SEO).

### [SEO-05] Fiche Organisation minimale (pas de téléphone, adresse, ni `sameAs`) et deux entités sans `@id` partagé
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/lib/seo.ts:46-56` (`organizationJsonLd`) vs `src/lib/seo.ts:58-76` (`localBusinessJsonLd`) ; confirmé sur `dist/index.html` : l'accueil émet à la fois `Organization` et `ProfessionalService`, même `name`, sans lien `@id`.
- **Description :** `organizationJsonLd` se limite à `name`/`url`/`description`/`email`/`logo`. Il manque `telephone`, `address`, et surtout `sameAs` (réseaux sociaux / fiche Google). De plus, l'accueil pose deux entités « organisation » (`Organization` et `ProfessionalService`) portant le même nom mais sans `@id` commun pour signaler à Google qu'il s'agit de la même entité.
- **Pourquoi ça compte :** `sameAs` est le principal levier pour relier le site aux profils officiels (réseaux, Google Business) et consolider l'entité dans le knowledge graph. Deux entités homonymes non liées peuvent être interprétées comme distinctes. Impact modéré sur la consolidation d'entité, faible sur le classement direct.
- **Recommandation :** Enrichir `organizationJsonLd` avec `telephone`, `address` (déjà dans `site.ts`) et `sameAs` (quand les profils existent). Donner un `@id` stable (ex. `https://azelize.com/#organization`) à `Organization` et le référencer dans le `provider`/`publisher` des autres blocs (Service, Article) pour relier les entités.

### [SEO-06] Incohérence de domaine : `site.url` en `.com`, `site.email` en `.fr`
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `src/data/site.ts:5` (`url: 'https://azelize.com'`) et `src/data/site.ts:16` (`email: 'bonjour@azelize.fr'`) ; le commentaire ligne 15 indique « Coordonnées provisoires (cf. maquette) — à confirmer ».
- **Description :** Le domaine canonique du site est `azelize.com` mais l'e-mail public (repris dans `organizationJsonLd` et `localBusinessJsonLd`) est sur `azelize.fr`. Soit deux domaines coexistent, soit l'un est une coquille.
- **Pourquoi ça compte :** Une incohérence de NAP/domaine affaiblit la cohérence d'entité (le mail apparaît dans le JSON-LD émis à Google). Si `azelize.fr` n'est pas maîtrisé, c'est une fuite de signal ; s'il l'est, il faut une stratégie de redirection vers le domaine canonique. À trancher avant mise en production.
- **Recommandation :** Confirmer le domaine officiel unique, aligner `email` et `url` (ou documenter la coexistence et rediriger `.fr` → `.com` en 301 côté hébergeur).

### [SEO-07] Redirections legacy en `meta refresh` (pas de 301 serveur)
- **Sévérité :** Mineur
- **Effort :** M
- **Localisation :** `astro.config.mjs:11-19` ; vérifié dans `dist/site-internet/index.html` : `<meta http-equiv="refresh" content="0;url=/creation-site-internet"><meta name="robots" content="noindex">`.
- **Description :** Les anciennes URL `/site-internet/*` sont gérées par des pages de redirection HTML (`meta refresh` + `noindex` + canonical vers la cible). C'est le comportement par défaut d'Astro en build statique sans adaptateur. Détail : le `canonical` de ces pages pointe vers `/creation-site-internet` **sans** slash final, alors que le site sert partout avec slash final (`/creation-site-internet/`) — micro-incohérence, atténuée par le `noindex`.
- **Pourquoi ça compte :** Une vraie redirection 301 côté serveur transmet mieux l'autorité (« link equity ») et est instantanée, là où un `meta refresh` est plus lent et moins bien interprété par les moteurs. Comme ce sont d'anciennes URL de migration (faible volume de liens entrants probables), l'impact est limité — mais si l'hébergeur le permet, autant faire propre.
- **Recommandation :** Si l'hébergeur supporte les règles de redirection (Netlify `_redirects`, Vercel, `.htaccess`…), publier ces 6 redirections en 301 serveur en doublon des pages générées. Sinon, conserver l'existant et harmoniser le slash final de la cible canonique.

### [SEO-08] Polices Google chargées en bloquant, sans `<link rel="preload">` ni self-host
- **Sévérité :** Hypothèse à vérifier
- **Effort :** M
- **Localisation :** `src/layouts/BaseLayout.astro:44-50`.
- **Description :** Les polices sont chargées via une feuille de style Google Fonts externe et bloquante (`<link rel="stylesheet">`), avec `preconnect`. Pas de `preload` de la feuille ni des fichiers de police critiques ; pas de self-hosting.
- **Pourquoi ça compte :** Relève des Core Web Vitals (LCP, CLS) qui sont un facteur de classement. Une CSS externe bloquante sur le chemin critique peut retarder le premier rendu. Constat à confirmer par une mesure réelle (Lighthouse/PSI) avant d'agir — d'où « Hypothèse à vérifier ». Hors périmètre strict « machinerie SEO » mais à la frontière performance/SEO.
- **Recommandation :** Mesurer l'impact (LCP) ; si significatif, envisager le self-host des polices (via `@fontsource` déjà présent dans l'écosystème, cf. les fonts CDN utilisées par `og/[...route].ts`) ou au minimum `preload` la feuille critique. À arbitrer côté axe performance.

## Points positifs
- **Centralisation exemplaire :** un seul `Seo.astro` + `lib/seo.ts` produit toutes les balises head et tout le JSON-LD ; aucune balise SEO dispersée dans les pages. Maintenance et cohérence assurées.
- **Canonical robuste :** `resolveSeo` construit le canonical en URL absolue via `new URL(pathname, site.url)`, et le rendu réel inclut le slash final cohérent avec le sitemap (`/creation-site-internet/`). `site` est bien défini dans `astro.config.mjs` (requis sitemap + canonical).
- **JSON-LD large et correct :** `Organization`, `ProfessionalService` (avec `PostalAddress`), `Service`, `Article` (avec `datePublished`/`dateModified`), `BreadcrumbList`, `FAQPage`, `CreativeWork` — tous avec `@context`/`@type` valides et URL absolues (`abs()`). Câblage vérifié sur toutes les routes dynamiques (`[service]`, `[service]/[metier]`, `prestations`, `realisations`, `blog`, `guides`) et la home/faq.
- **FAQPage dérivé de l'affichage réel :** les items JSON-LD proviennent des mêmes sections que le rendu visible (home, faq, et sections `faq` des pages), respectant la règle Google « contenu identique » et évitant le risque de manipulation.
- **Images OG industrialisées :** génération build-time (`astro-og-canvas`) d'une image par page clé, fallback `default.png`, clé dérivée de l'URL. Présence confirmée dans `dist/og/`.
- **Anti-doorway piloté par registre :** `seo-architecture.ts` ne génère au build (et donc au sitemap) que les cellules `ship` ; les pages villes/métiers `conditionnel`/`exclu` ne sont pas buildées — bonne hygiène structurelle pour le SEO local programmatique.
- **Cohérence noindex ↔ sitemap partielle déjà en place :** `mentions-legales` et `confidentialite` sont à la fois `noindex` et exclues du sitemap ; la `404` est nativement hors sitemap. Il ne manque que `/merci` (SEO-01).
- **robots.txt minimal et correct :** `Allow: /` + lien `Sitemap:` absolu vers `sitemap-index.xml` (présent dans `dist/`).
- **hreflang volontairement absent :** documenté comme non requis (site FR uniquement) dans `ARCHITECTURE-CIBLE.md:94` — décision assumée, pas un oubli.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| SEO-01 | Élevé | S | Page `noindex` `/merci` présente dans le sitemap |
| SEO-02 | Moyen | S | Aucun JSON-LD sur `/contact` (commerce local seulement sur l'accueil) |
| SEO-03 | Moyen | M | Sitemap sans `lastmod` |
| SEO-04 | Mineur | S | Open Graph/Twitter sans dimensions ni `alt` |
| SEO-05 | Mineur | S | Fiche Organisation minimale, entités sans `@id` partagé |
| SEO-06 | Hypothèse à vérifier | S | Incohérence domaine `.com` (url) vs `.fr` (email) |
| SEO-07 | Mineur | M | Redirections legacy en `meta refresh` au lieu de 301 serveur |
| SEO-08 | Hypothèse à vérifier | M | Polices Google bloquantes, sans preload/self-host |
