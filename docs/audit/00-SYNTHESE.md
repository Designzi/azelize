# Audit Azelize — Synthèse générale

> Document de tête, à lire en premier. Il agrège les 15 rapports détaillés du dossier `docs/audit/`.
> Audit réalisé le **2026-06-05** par 15 agents spécialisés, en **lecture seule** (aucun fichier source modifié).
> Le SEO est audité sur la **structure et la démarche**, jamais sur la qualité du contenu rédactionnel (en grande partie provisoire).

---

## 1. État de santé global

**Note globale : 6,9 / 10** (moyenne des 15 axes).

Le site Azelize repose sur des **fondations techniques saines et modernes** : Astro 5 en build 100 % statique (zéro framework JS côté visiteur → très bonnes performances), TypeScript strict qui passe sans la moindre erreur, un design system tokenisé avec un garde-fou anti-couleur-en-dur qui fonctionne, une machinerie SEO centralisée (un seul composant gère titres, métadonnées et données structurées), et une vraie chaîne d'intégration continue. **La conception est bonne ; ce sont l'exécution de quelques détails et le suivi de la migration qui ont décroché.**

Les problèmes ne sont **pas** des bugs visibles en production, mais trois familles de dette qui, cumulées, freinent la maintenance et plafonnent le référencement :

1. **Des liens internes morts** (vers des pages qui n'existent pas) qui créent des erreurs 404 réelles pour les visiteurs et Google.
2. **Du contenu structuré perdu** : des FAQ affichées à l'écran qui ne sont pas transmises aux moteurs de recherche / IA, sur les pages les plus commerciales.
3. **De la dette de cohérence** : un système de couleurs « fruit » officiellement abandonné mais toujours présent partout dans le code, un dossier « villes » qui ressemble à une fonctionnalité livrée mais n'est relié à rien, et des documents de migration qui décrivent un projet « non démarré » alors qu'il est fait à ~80 %.

Aucun de ces points n'est urgent au sens « le site est cassé », mais le n°1 et le n°2 ont un **impact SEO/UX direct** et méritent d'être traités vite.

| Axe | Rapport | Note |
|---|---|---|
| Architecture & responsabilités | `01-architecture.md` | 7 / 10 |
| Écart docs migration ↔ code | `02-migration-drift.md` | 5 / 10 |
| Routing & génération de pages | `03-routing-pages.md` | 7 / 10 |
| Code mort & inutilisé | `04-code-mort.md` | 7,5 / 10 |
| Clean code & duplication | `05-clean-code.md` | 5 / 10 |
| Patterns Astro & îlots | `06-patterns-astro.md` | 8 / 10 |
| TypeScript & sûreté des types | `07-typescript.md` | 8 / 10 |
| Design tokens & cohérence visuelle | `08-design-tokens.md` | 7 / 10 |
| SEO technique | `09-seo-technique.md` | 8 / 10 |
| SEO programmatique & maillage | `10-seo-programmatique-maillage.md` | 5 / 10 |
| GEO & lisibilité moteurs IA | `11-geo-lisibilite-moteurs.md` | 6,5 / 10 |
| Performance & Core Web Vitals | `12-performance.md` | 8 / 10 |
| Accessibilité | `13-accessibilite.md` | 6 / 10 |
| Dépendances, tooling & CI | `14-deps-tooling-ci.md` | 8 / 10 |
| Contenu structuré & données | `15-data-contenu-structure.md` | 7 / 10 |

---

## 2. Top 10 des problèmes prioritaires

Classés par **impact** (visiteur + référencement + maintenance), tous axes confondus.

| # | Problème | Pourquoi ça compte | Sévérité | Effort | Sources |
|---|---|---|---|---|---|
| 1 | **Liens internes morts → 404.** Des pages métier renvoient vers `/prestations/…` et vers `/creation-site-internet/lorient` / `/vannes` qui ne sont jamais générées. | Impasse pour le visiteur + signal négatif pour Google qui suit ces liens vers du vide. | Élevé | S–M | ROUTE-01, PROG-01, ASTRO-01 |
| 2 | **FAQ affichées mais invisibles pour les moteurs.** Sur les pages métier et les guides « sur-mesure », les questions/réponses visibles ne génèrent aucune donnée structurée FAQPage. | Les FAQ structurées sont l'un des formats les plus cités par Google et les IA. Levier SEO/AEO perdu sur les pages les plus commerciales. | Élevé | M | GEO-01, GEO-02 |
| 3 | **Maillage interne recopié à la main, pages métier quasi orphelines.** Le maillage n'est pas dérivé du registre central ; 5 services publiés sur 11 sont peu liés. | Le nombre de liens entrants pondère l'importance d'une page pour Google ; des pages vendues remontent mal. Cause-racine du n°1. | Élevé | M | PROG-02, PROG-05, PROG-09 |
| 4 | **Système de couleurs « fruit » fantôme.** L'enum `menthe/fraise/miel/citron/kiwi` survit dans 8 axes du code alors que `CLAUDE.md` le déclare supprimé (tout est rendu en `brand`). | Dette de vocabulaire trompeuse : un contributeur croit changer une couleur sans effet, et risque de **réintroduire** ce que la charte interdit. | Moyen | M | ARCH-03, MIG-02, TOK-03, TS-01, DATA-01, ASTRO-04, CLEAN-06, DEAD-07 |
| 5 | **Dossier `views/villes/` orphelin + matrice ville morte.** Aucune route, aucune collection ne les utilise ; jamais compilés. | Illusion d'une fonctionnalité livrée ; piège si un futur `glob` les capte ; contredit la doctrine « pas de SEO géographique ». | Moyen | S | DEAD-01, MIG-03, DATA-02, PROG-03 |
| 6 | **Markup ré-inliné dans `views/` au lieu des primitives ; pages métier dupliquées à ~80 %.** Card/Pill/Grid/Badge quasi jamais réutilisés. | La promesse « 1 composant = 1 vérité visuelle » n'est pas tenue : modifier une carte oblige à éditer ~20 fichiers. Principale dette de maintenance. | Élevé | L | CLEAN-01, CLEAN-02, ARCH-01 |
| 7 | **Documents de migration périmés.** Ils décrivent un projet « non démarré » alors qu'il est fait à ~80 % ; un delta cite même la couleur Jet bannie. | La doc est la mémoire du projet ; fausse, elle planifie du travail déjà fait et invite à des régressions (réintroduire Jet/fruit). | Élevé | M | MIG-01, MIG-05, MIG-06, MIG-09 |
| 8 | **Accessibilité : 4 manques structurels.** Pas de lien d'évitement, focus non géré dans le menu/tiroir mobile, confirmation de formulaire non annoncée, texte `ink-faint` sous le seuil de contraste (2,3:1). | Exclut une partie des utilisateurs (clavier, lecteurs d'écran, malvoyants), public artisan souvent sur mobile en extérieur. Risque légal/UX. | Élevé | S–M | A11Y-01, A11Y-02, A11Y-04, A11Y-05 |
| 9 | **Deux taxonomies de services en parallèle.** Le registre `SERVICES` (11 offres) et la collection `prestations` (1 entrée) décrivent tous deux « ce qu'on fait », sans lien, avec deux familles d'URLs. | Brouille où ajouter une offre, crée des liens morts vers `/prestations/…`, contredit le commentaire « source unique ». | Moyen | M | ARCH-07, PROG-06 |
| 10 | **Identité de l'entreprise floue pour Google/IA.** Fiche Organization minimale (sans `sameAs`/téléphone/adresse), e-mail en `.fr` vs domaine `.com`, page `noindex` `/merci` listée dans le sitemap. | Affaiblit la reconnaissance d'entité (citations IA, SEO local) et envoie des signaux incohérents à la Search Console. | Élevé–Moyen | S | GEO-03, GEO-07, SEO-01, SEO-06 |

---

## 3. Quick wins (fort impact / faible effort)

À traiter en priorité : effort **S** (≈ quelques minutes à 1–2 h chacun), bénéfice immédiat.

| Action | Bénéfice | Source |
|---|---|---|
| Exclure `/merci` (noindex) du sitemap | Supprime une incohérence signalée par la Search Console | SEO-01 |
| Réparer / retirer les liens vers `/prestations/…` et `/…/lorient`/`/vannes` | Supprime des 404 réelles | ROUTE-01, ASTRO-01 |
| Ajouter un lien d'évitement (« Aller au contenu ») | Accessibilité clavier de base, sur tout le site | A11Y-01 |
| Annoncer la confirmation de formulaire (`role=status`/`aria-live`) | Les lecteurs d'écran confirment l'envoi | A11Y-04 |
| Compléter la fiche Organization (`sameAs`, téléphone, `@id` partagé) | Renforce l'entité pour Google et les IA | GEO-03, GEO-04 |
| Trancher l'e-mail `.fr` vs domaine `.com` | NAP cohérent = signal de confiance | SEO-06, GEO-07 |
| Supprimer le code mort isolé : `Nav.astro`, `Logo.astro`, `Pill`/`Grid` (ui), SVG logo non référencés, export `accentSoftBg`, fichier `z.md` | Allège le dépôt, lève des ambiguïtés (ex. double source de nav) | DEAD-02→06, MIG-07, MIG-08 |
| Retirer la graisse de police **800** (jamais utilisée) | Octets économisés sur mobile | PERF-02 |
| Ajouter `format:check` à la CI | Empêche la dérive de style | DEPS-05 |
| Activer le `prefetch` de navigation | Transitions quasi instantanées, coût nul | PERF-03 |

---

## 4. Chantiers de fond (forte valeur / effort important)

| Chantier | Description | Effort | Sources |
|---|---|---|---|
| **Factoriser la couche `views/`** | Extraire un gabarit paramétré pour les pages métier (≈80 % identiques) et faire consommer les primitives UI (Card/Pill/Grid) au lieu de ré-inliner le markup. C'est la dette de maintenance la plus lourde. | L | CLEAN-01, CLEAN-02, ARCH-01 |
| **Éradiquer le système « fruit »** | Renommer/supprimer l'enum `accent` (le réduire à `tone` ou le retirer), nettoyer les ~30+ `accent:'kiwi'…`, les défauts `'menthe'` et les commentaires « Jet »/« Menthe ». Aligner le code sur `CLAUDE.md`. | M | TOK-03, ARCH-03, TS-01, DATA-01 |
| **Trancher la stratégie « villes »** | Décision binaire : **supprimer** le code mort (`views/villes/*`, `MATRICE_VILLE`) **ou** câbler proprement une couche ville (route + collection) avec contenu réellement différencié pour éviter le doorway. Aujourd'hui c'est entre les deux. | M | DATA-02, PROG-03, PROG-04 |
| **Émettre les FAQPage des vues sur-mesure** | Faire dériver le JSON-LD FAQPage du contenu réellement affiché par les composants `views/` (et non de la source de secours `sections` restée vide). | M | GEO-01, GEO-02 |
| **Maillage interne dérivé du registre** | Générer chips/liens services & métiers depuis `seo-architecture.ts` (source unique) au lieu de les recopier page par page ; corrige aussi le n°1 et le n°3 à la racine. | M | PROG-01, PROG-02, PROG-09 |
| **Navigation clavier du menu/tiroir** | Piège de focus, restitution à la fermeture, `role=dialog`/`aria-modal`, `inert` sur le tiroir fermé. | M | A11Y-02, A11Y-03 |
| **Rafraîchir / archiver les docs de migration** | Mettre la table d'état à jour (ce qui est fait), corriger la cartographie, supprimer la mention Jet, archiver les docs périmés. | M | MIG-01, MIG-05, MIG-06, MIG-09 |
| **Unifier la taxonomie des services** | Choisir une source unique (registre `SERVICES` **ou** collection `prestations`) et une seule famille d'URLs ; relier explicitement. | M | ARCH-07, PROG-06 |
| **Auto-héberger les polices** | Supprime une dépendance tierce render-blocking sur le chemin critique (impact LCP + RGPD), permet un `preload` ciblé. | M | PERF-01, SEO-08 |
| **Contraste `ink-faint`** | Remonter le token #A7ABB2 (2,3:1) au-dessus de 4,5:1 partout où il porte du texte. | M | A11Y-05 |

---

## 5. Thèmes transverses (problèmes récurrents)

Quatre fils rouges reviennent dans plusieurs rapports — les traiter une fois résout plusieurs constats à la fois :

- **Le « fruit » fantôme** apparaît dans **8 axes** (architecture, migration, tokens, TypeScript, données, patterns Astro, clean code, code mort). Un seul chantier de renommage les solde tous.
- **Le dossier `villes` orphelin** apparaît dans **7 axes** (architecture, migration, routing, code mort, patterns Astro, SEO programmatique, données). Une seule décision (supprimer ou câbler) les solde tous.
- **Le mécanisme « vue sur-mesure prioritaire sur le contenu »** est la cause-racine commune de plusieurs gros constats : liens morts (n°1), FAQ non émises (n°2), maillage recopié (n°3), MDX jamais rendu (ARCH-01). C'est le point d'architecture le plus structurant à reprendre.
- **Les valeurs Tailwind arbitraires** (≈414 occurrences `[NNpx]` + ≈117 `tracking-[…]`) contre la convention canonique de `CLAUDE.md` : dette diffuse, à résorber progressivement (lint/codemod).

---

## 6. Backlog priorisé (prêt à transformer en specs)

Trié par priorité décroissante. Chaque ligne renvoie au constat détaillé dans le rapport source.

| Prio | Constat | Sévérité | Effort | Rapport (ID) |
|---|---|---|---|---|
| P1 | Réparer/retirer les liens internes morts (404) | Élevé | S–M | 03 (ROUTE-01), 06 (ASTRO-01), 10 (PROG-01) |
| P1 | Émettre FAQPage depuis les vues métier & guides | Élevé | M | 11 (GEO-01, GEO-02) |
| P1 | Exclure `/merci` du sitemap | Élevé | S | 09 (SEO-01) |
| P1 | Lien d'évitement + focus tiroir/menu | Élevé | S–M | 13 (A11Y-01, A11Y-02) |
| P1 | Confirmation de formulaire annoncée | Élevé | S | 13 (A11Y-04) |
| P1 | Contraste `ink-faint` ≥ 4,5:1 | Élevé | M | 13 (A11Y-05) |
| P2 | Maillage dérivé du registre (corrige liens + orphelines) | Élevé | M | 10 (PROG-02, PROG-05, PROG-09) |
| P2 | Factoriser pages métier + réutiliser primitives UI | Élevé | L | 05 (CLEAN-01, CLEAN-02) |
| P2 | Compléter l'entité Organization + NAP `.com`/`.fr` | Élevé | S | 11 (GEO-03, GEO-07), 09 (SEO-06) |
| P2 | Rafraîchir/archiver les docs de migration (+ retirer mention Jet) | Élevé | M | 02 (MIG-01, MIG-09) |
| P3 | Éradiquer le système « fruit » (enum, défauts, commentaires) | Moyen | M | 08 (TOK-03), 01 (ARCH-03), 07 (TS-01) |
| P3 | Trancher la stratégie « villes » (supprimer ou câbler) | Moyen | M | 15 (DATA-02), 10 (PROG-03) |
| P3 | Unifier la taxonomie des services | Moyen | M | 01 (ARCH-07), 10 (PROG-06) |
| P3 | Supprimer le code mort isolé (Nav, Logo, Pill, Grid, SVG, accentSoftBg, z.md) | Mineur | S | 04 (DEAD-02→06), 02 (MIG-07) |
| P3 | Auto-héberger les polices + retirer graisse 800 + prefetch | Moyen | M | 12 (PERF-01, PERF-02, PERF-03) |
| P4 | `format:check` en CI, Node épinglé, deps reclassées | Moyen | S | 14 (DEPS-02→05) |
| P4 | Nettoyer la couche `:root` morte des tokens + commentaires faux | Moyen | M | 08 (TOK-01, TOK-02) |
| P4 | Résorber les valeurs Tailwind arbitraires (canonique) | Moyen | M–L | 08 (TOK-04, TOK-05), 05 (CLEAN-04) |
| P4 | Enrichissements SEO (lastmod, dimensions/alt OG, JSON-LD pages clés, glossaire DefinedTerm) | Mineur–Moyen | S–M | 09 (SEO-03→05), 11 (GEO-05, GEO-09) |
| P5 | `render()` MDX inutile sur routes guides/réalisations ; champs schéma inertes (`tags`) | Mineur | S | 06 (ASTRO-02), 15 (DATA-04, DATA-05) |

---

## 7. Ce qui est bien fait (à préserver)

- **Performances** : build statique, zéro JS de framework, aucune image raster, CLS maîtrisé. Excellent socle.
- **TypeScript** : `astro check` passe sans erreur sur 117 fichiers, mode strict, alias propres, schémas Zod en union discriminée.
- **SEO technique centralisé** : un seul `Seo.astro` + `lib/seo.ts` pour titres, canonical, OG/Twitter et un JSON-LD large et conforme.
- **Discipline couleurs** : `check:tokens` empêche toute couleur en dur ; le Jet banni est totalement absent du code.
- **Anti-doorway** : le registre `seo-architecture.ts` ne publie que les pages `ship` ; le sitemap ne contient que des pages réelles.
- **Outillage/CI** : intégration continue réelle, dépendances toutes à jour, ESLint/Prettier propres.
- **Couche `lib/` saine** : rôles nets, aucune dépendance circulaire.

---

## 8. Index des rapports

| Fichier | Axe |
|---|---|
| `01-architecture.md` | Architecture & séparation des responsabilités |
| `02-migration-drift.md` | Écart docs de migration ↔ code réel |
| `03-routing-pages.md` | Routing Astro & génération de pages |
| `04-code-mort.md` | Code mort & inutilisé |
| `05-clean-code.md` | Clean code & duplication |
| `06-patterns-astro.md` | Patterns Astro & îlots |
| `07-typescript.md` | TypeScript & sûreté des types |
| `08-design-tokens.md` | Design tokens & cohérence visuelle |
| `09-seo-technique.md` | Architecture SEO technique |
| `10-seo-programmatique-maillage.md` | SEO programmatique & maillage interne |
| `11-geo-lisibilite-moteurs.md` | GEO & lisibilité moteurs génératifs |
| `12-performance.md` | Performance & Core Web Vitals |
| `13-accessibilite.md` | Accessibilité |
| `14-deps-tooling-ci.md` | Dépendances, tooling & CI |
| `15-data-contenu-structure.md` | Contenu structuré & couche de données |

---

*Tous les constats sont sourcés sur des fichiers réels. Les points marqués « Hypothèse à vérifier » dans les rapports détaillés demandent une confirmation avant action. Aucun fichier source n'a été modifié pendant cet audit.*
