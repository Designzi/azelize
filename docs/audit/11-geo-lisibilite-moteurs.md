# GEO & lisibilité moteurs génératifs — Rapport d'audit

**Périmètre audité :** `src/lib/seo.ts`, `src/components/layout/Seo.astro`, `src/data/site.ts`, hiérarchie de titres (h1→h3) sur tous les templates (`src/pages/**`, `src/views/**`, `src/sections/home/**`, `src/components/blocks/**`), données structurées JSON-LD (Organization / ProfessionalService / Service / Article / CreativeWork / BreadcrumbList / FAQPage), adressabilité (texte vs image, ancres), NAP, et vérification sur le build `dist/`.
**Note de santé :** 6.5/10 — fondations solides (1 seul h1/page, hiérarchie propre, fabrique JSON-LD complète, contenu en vrai texte) mais des FAQ visibles non transformées en FAQPage et une entité « organisation » incomplète bridant la lisibilité par les moteurs génératifs.

## Résumé exécutif
- Pour qu'un moteur de réponse (ChatGPT, Perplexity, Google AI) cite correctement un site, il a besoin d'une structure nette : un seul grand titre par page, des sous-titres logiques, et des « fiches d'identité » invisibles (données structurées) qui décrivent l'entreprise et ses contenus. Azelize fait l'essentiel bien : chaque page a exactement un titre principal, la hiérarchie des sous-titres est cohérente, et tout le texte est réellement du texte (pas des images).
- Problème majeur : plusieurs pages affichent une FAQ visible (pages métiers comme « plombier », et même un guide entièrement bâti sur des questions/réponses), mais ces questions ne sont **jamais déclarées comme FAQPage** aux moteurs. Le code qui fabrique cette donnée lit une mauvaise source (le contenu éditorial de secours, vide), pas la FAQ réellement affichée. Résultat vérifié sur le build : aucune de ces pages n'expose de FAQPage.
- La « fiche d'identité » de l'entreprise (Organization) est minimale : pas de téléphone, pas d'adresse, et surtout aucun lien `sameAs` vers une fiche Google/des réseaux. Les moteurs génératifs ont alors du mal à relier Azelize à une entité unique et fiable.
- Le glossaire — pourtant un atout majeur pour ces moteurs (des définitions claires « c'est quoi… ») — n'expose aucune donnée structurée de type définition, alors qu'il s'y prête idéalement.
- L'e-mail public est sur le domaine `azelize.fr` alors que le site vit sur `azelize.com` : incohérence d'identité (NAP) qui brouille la reconnaissance de l'entité.

## Constats détaillés

### [GEO-01] Les FAQ visibles des pages métiers ne génèrent aucun FAQPage
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/pages/[service]/[metier].astro:39` (`const faqItems = sections?.flatMap(...)`), source visible déconnectée dans `src/views/metiers/plombier.astro:127` (`const FAQ`) ; confirmé sur le build : `dist/creation-site-internet/plombier/index.html` → 2 blocs JSON-LD (Service + Breadcrumb), `FAQPage` = 0. Idem electricien, macon, vtc, garage-automobile.
- **Description :** La page métier rend le composant dédié `views/metiers/{slug}.astro`, qui contient sa propre liste de questions/réponses affichées. Mais le `faqJsonLd` n'est émis que si `entry.data.sections` contient une section `faq` — or les `.mdx` de métiers n'ont pas de `sections` (ex. `plombier.mdx` ne porte que le front-matter). La FAQ visible et la source du JSON-LD sont deux objets distincts : la FAQ affichée n'est donc jamais déclarée.
- **Pourquoi ça compte :** Une FAQ structurée (FAQPage) est l'un des formats les plus exploités par les moteurs génératifs et la recherche pour extraire et citer des réponses. Ici, du contenu Q/R de qualité (urgence, photos, délai, prix) reste invisible pour les machines : opportunité d'AEO/GEO directement perdue sur les pages les plus commerciales.
- **Recommandation :** Pour les vues bespoke, exposer la liste FAQ depuis le composant vers la route (ex. la vue exporte ses items, ou centraliser la FAQ par métier dans une donnée que la route ET la vue consomment). Émettre `faqJsonLd` à partir de cette source unique, garantissant la parité « affiché = déclaré » exigée par Google.

### [GEO-02] Les guides bâtis sur une FAQ n'émettent pas de FAQPage
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/pages/guides/[slug].astro:28` (même schéma que GEO-01) ; `src/views/guides/faq-site-web-plombier.astro` (guide entièrement composé de questions) ; confirmé sur le build : `dist/guides/faq-site-web-plombier/index.html` → `Article` = 1, `FAQPage` = 0. Idem `combien-coute-site-internet`.
- **Description :** Comme pour les métiers, le `faqJsonLd` des guides dérive de `entry.data.sections`. Quand le guide est rendu par un composant dédié (`views/guides/*.astro`) sans `sections` MDX, aucune FAQPage n'est produite, même lorsque la page est intégralement une FAQ.
- **Pourquoi ça compte :** Un guide nommé « FAQ site web plombier » qui n'expose pas de FAQPage est un cas d'école de potentiel GEO gaspillé : ce contenu est exactement ce qu'un moteur de réponse cherche à citer.
- **Recommandation :** Même remède que GEO-01 : tirer les items FAQ de la source réellement rendue (vue dédiée) et émettre `faqJsonLd` en conséquence.

### [GEO-03] Entité Organization incomplète et sans `sameAs`
- **Sévérité :** Élevé
- **Effort :** S
- **Localisation :** `src/lib/seo.ts:46-56` (`organizationJsonLd` : `name`/`url`/`description`/`email`/`logo` seulement) ; confirmé : `grep sameAs` sur tout `dist/` → aucune occurrence.
- **Description :** La « fiche d'identité » Organization ne contient ni `telephone`, ni `address` (pourtant disponibles dans `src/data/site.ts`), ni surtout `sameAs` (fiche Google Business, réseaux sociaux). De plus aucune entité du graphe ne porte de `@id`.
- **Pourquoi ça compte :** Les moteurs génératifs construisent une représentation d'entité (« qui est Azelize ? ») en croisant les signaux. Sans `sameAs` ni coordonnées, l'entité reste floue et difficile à relier à une présence vérifiable — ce qui réduit la probabilité d'être cité avec confiance.
- **Recommandation :** Enrichir `organizationJsonLd` avec `telephone`, `address` (depuis `site.ts`), `sameAs` (dès que les profils existent) et un `@id` stable (ex. `https://azelize.com/#organization`). Référencer ce `@id` dans `provider`/`publisher` des autres blocs (Service, Article) pour souder le graphe en une entité unique. (Recoupe le constat 09-SEO.)

### [GEO-04] Deux entités « organisation » concurrentes sur l'accueil, non reliées
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/pages/index.astro:17` (`organization` + `localBusinessJsonLd()`) → `dist/index.html` émet `Organization` (`seo.ts:46`) ET `ProfessionalService` (`seo.ts:59`), même `name`, sans `@id` commun.
- **Description :** L'accueil déclare deux nœuds organisation de même nom mais sans lien explicite. Pour un moteur, rien n'indique formellement qu'il s'agit de la même entité.
- **Pourquoi ça compte :** L'ambiguïté d'entité dilue les signaux et peut amener un moteur génératif à hésiter ou à dédoubler l'organisation, au détriment de la clarté de citation.
- **Recommandation :** Donner le même `@id` aux deux nœuds (ou n'émettre qu'un nœud `ProfessionalService` enrichi qui hérite des champs Organization). Aligner sur la résolution de GEO-03.

### [GEO-05] Le glossaire n'expose pas de données structurées de définition
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/pages/glossaire.astro:21-47` (tableau `TERMS` : 16 paires terme/définition, en texte) ; aucune émission JSON-LD sur cette page (`jsonLd` absent du `BaseLayout`).
- **Description :** Le glossaire est un excellent contenu « entité/définition » (« c'est quoi le SEO, un lead, une fiche Google… »), entièrement en texte exploitable, mais aucune donnée structurée `DefinedTermSet`/`DefinedTerm` n'est émise.
- **Pourquoi ça compte :** Les pages de définitions sont une cible privilégiée des moteurs de réponse. Une structuration `DefinedTerm` rend chaque définition explicitement adressable et améliore l'extraction/citation. C'est un gain GEO à fort levier pour une page déjà bien rédigée.
- **Recommandation :** Ajouter une fabrique `definedTermSetJsonLd(terms)` dans `lib/seo.ts` et l'émettre sur `/glossaire`. Optionnellement, doter chaque terme d'un `id` d'ancre HTML (deep-link) pour citer une définition précise.

### [GEO-06] FAQ et définitions sans ancres profondes (adressabilité)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/blocks/FaqBlock.astro:23` (items via `data-faq-item`, pas d'`id`) ; `src/pages/faq.astro:87` (`data-key`, pas d'`id`) ; `src/pages/glossaire.astro` (termes sans `id`).
- **Description :** Les questions de FAQ et les termes du glossaire ne portent pas d'ancre `id` permettant un lien direct (`/faq#…`). Le contenu est en texte (bien), mais non adressable au niveau de l'item.
- **Pourquoi ça compte :** Les moteurs génératifs et la recherche valorisent l'adressabilité fine (pouvoir pointer une réponse précise). Des ancres stables facilitent aussi les liens internes et les citations.
- **Recommandation :** Générer un `id` slugifié par question et par terme, et l'exposer comme ancre. Faible coût, bénéfice d'adressabilité durable.

### [GEO-07] NAP incohérent : e-mail `.fr` vs domaine `.com`
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/data/site.ts:6` (`url: 'https://azelize.com'`) vs `src/data/site.ts:16` (`email: 'bonjour@azelize.fr'`), repris dans `organizationJsonLd`/`localBusinessJsonLd`.
- **Description :** L'identité publique mêle deux domaines. Soit `azelize.fr` est un domaine annexe, soit c'est une coquille. Le commentaire de `site.ts:15` indique d'ailleurs des coordonnées « provisoires à confirmer ».
- **Pourquoi ça compte :** La cohérence du NAP (Name / Address / Phone, et par extension domaine/e-mail) est un signal de confiance d'entité. Une divergence brouille la reconnaissance par les moteurs génératifs et l'attribution de citations.
- **Recommandation :** Trancher le domaine canonique et aligner l'e-mail (ou documenter explicitement le second domaine via `sameAs`/redirection). À confirmer côté métier avant correction.

### [GEO-08] `ProfessionalService` sans `geo`/`openingHours` ni précision géographique
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/lib/seo.ts:59-76` (`localBusinessJsonLd` : `address` sans `postalCode`, `areaServed: 'FR'` générique, pas de `geo` ni `openingHours`).
- **Description :** L'adresse structurée n'inclut pas le code postal ; la zone desservie est « FR » alors que le positionnement réel est local (bassin Lorient/Vannes, cf. `faq.astro:41`). Pas de coordonnées `geo` ni d'horaires.
- **Pourquoi ça compte :** Pour une activité locale, des signaux géographiques précis aident les moteurs à situer et qualifier l'entité dans les réponses à intention locale. (Structurel, pas rédactionnel.)
- **Recommandation :** Compléter `PostalAddress` (`postalCode`, `addressRegion`), affiner `areaServed` (Morbihan / Lorient-Vannes) et, si pertinent, ajouter `geo`/`openingHours`. Données à confirmer.

### [GEO-09] Pages clés sans aucune donnée structurée
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** Vérifié sur le build : `dist/contact/index.html`, `dist/a-propos/index.html`, `dist/tarifs/index.html` → 0 bloc `application/ld+json`.
- **Description :** Contact (page naturelle du NAP), À propos (entité/about) et Tarifs ne portent aucune donnée structurée. `localBusinessJsonLd` n'est appelé que sur l'accueil, alors que son commentaire annonce « home / contact ».
- **Pourquoi ça compte :** Ce sont des pages où les moteurs génératifs vont chercher l'identité, les coordonnées et l'offre. Sans structuration, ces signaux ne sont disponibles que sur l'accueil.
- **Recommandation :** Émettre `localBusinessJsonLd()` (et `organization`) sur `/contact`, lier `/a-propos` à l'entité Organization, et envisager une description structurée de l'offre sur `/tarifs`. (Recoupe le constat 09-SEO.)

## Points positifs
- **Un seul `<h1>` par page, partout :** vérifié sur le build (`dist/index.html`, `faq`, `creation-site-internet`, métiers, guides → h1 = 1 chacun). Hiérarchie h1→h2→h3 propre et sans saut sur les templates échantillonnés (ex. `views/hubs/referencement-seo.astro` : h1 puis h2/h3 logiques). Base de structure sémantique exemplaire pour les LLM.
- **Fabrique JSON-LD centralisée et complète** (`lib/seo.ts`) : Organization, ProfessionalService, Service, Article, CreativeWork, BreadcrumbList, FAQPage. Les pages les utilisent réellement (vérifié : accueil 3 blocs ; métiers/guides Service+Article+Breadcrumb).
- **Breadcrumb structuré jumelé au fil d'Ariane visible** (`breadcrumbJsonLd` émis sur hubs, métiers, guides, blog, réalisations) : excellent pour la compréhension de la structure du site.
- **Tout le contenu est en vrai texte**, pas en image : les héros décoratifs sont `aria-hidden` (ex. `sections/home/Hero.astro:39`), les FAQ et le glossaire sont du texte exploitable. Adressabilité de fond très favorable au GEO.
- **`robots.txt` ouvert** (`Allow: /`) : aucun blocage des crawlers de moteurs génératifs ; sitemap déclaré. La machinerie de crawl ne fait pas obstacle.
- **Parité « affiché = déclaré » respectée là où la source est commune :** la FAQ de l'accueil et celle de `/faq` dérivent du même tableau que l'affichage (`index.astro`, `faq.astro:48`) — la bonne pratique existe, il faut l'étendre aux vues bespoke (GEO-01/02).

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| GEO-01 | Élevé | M | FAQ métiers visibles sans FAQPage |
| GEO-02 | Élevé | M | Guides-FAQ sans FAQPage |
| GEO-03 | Élevé | S | Organization incomplète, sans `sameAs`/`@id` |
| GEO-04 | Moyen | S | Deux entités organisation non reliées (accueil) |
| GEO-05 | Moyen | M | Glossaire sans `DefinedTerm`/`DefinedTermSet` |
| GEO-06 | Mineur | S | FAQ/définitions sans ancres profondes |
| GEO-07 | Moyen | S | NAP incohérent : e-mail `.fr` vs domaine `.com` |
| GEO-08 | Mineur | S | `ProfessionalService` sans `geo`/précision locale |
| GEO-09 | Moyen | S | Contact/À-propos/Tarifs sans JSON-LD |
