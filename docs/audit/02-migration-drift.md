# Écart docs de migration ↔ code réel — Rapport d'audit

**Périmètre audité :** `ARCHITECTURE-CIBLE.md`, `CARTOGRAPHIE-ASTRO.md`, `PLAN-MIGRATION.md`, `MIGRATION-DELTA.md`, `README-MIGRATION.md`, `z.md`, `CLAUDE.md` — confrontés au code réel de `src/` (pages, views, content, data, lib, styles) et à l'historique git.
**Note de santé :** 5/10 — la migration est en réalité **largement exécutée** (≈ 80 % vs le « rien n'est fait » qu'affichent les docs), mais les 5 documents de planification sont devenus **périmés et trompeurs**, et deux drifts de code subsistent (enum fruit fantôme, vues villes orphelines).

## Résumé exécutif

- Les cinq documents de migration décrivent un projet **« avant travaux »** (« aucune migration exécutée », « ce document ne déclenche aucune migration »). Or l'historique git et le code montrent que **les lots 1 à 5 sont en grande partie réalisés** : palette Ocean Twilight migrée, système « fruit » supprimé des tokens, collection guides créée, 47 maquettes portées, méga-menu 4 colonnes en place, source de prix unique créée. Les docs ne reflètent plus la réalité et induiraient en erreur quiconque les lit pour « savoir ce qu'il reste à faire ».
- Le « hot spot fruit » est **confirmé et réel** : `design-tokens.css` ne contient plus **aucun** token fruit (élagage fait), mais `lib/sections.ts:12` et `lib/accents.ts:12` déclarent **encore** l'énum `menthe|fraise|miel|citron|kiwi`. C'est un vestige inerte (les classes pointent toutes vers `brand`), mais c'est une incohérence à nettoyer.
- Le « hot spot villes » est **confirmé et réel** : `src/views/villes/` contient 3 fichiers (`_template`, `lorient`, `vannes`) que **rien n'importe et qu'aucune route ne génère** — code mort. Le registre `MATRICE_VILLE` existe pourtant déjà avec 9 cellules.
- Une décision actée dans les docs n'est **pas** réalisée : la route triple-gatée `[service]/[metier]/[ville].astro` (statut `exclu`) n'existe pas. Inversement, plusieurs choses annoncées « à créer » **existent déjà** (collection guides, pages C0, pricing.ts).
- Sur le fond, l'architecture est saine : la confusion est purement **documentaire**. Le risque principal est qu'un futur intervenant (ou une IA suivant ces docs comme source de vérité) refasse un travail déjà fait ou réintroduise le fruit en croyant le plan encore valide.

## Constats détaillés

### [MIG-01] Les 5 docs de migration sont périmés : ils décrivent un projet non démarré alors que la migration est en grande partie faite
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `README-MIGRATION.md:3` (« Aucune migration exécutée »), `PLAN-MIGRATION.md:5` (« Ce document ne déclenche aucune migration »), `MIGRATION-DELTA.md:119`, `ARCHITECTURE-CIBLE.md:136`
- **Description :** Les cinq documents se présentent explicitement comme une **phase d'analyse/préparation antérieure à toute migration**. Or le code et l'historique git contredisent frontalement ce cadrage : commits `f5e347a` (migration palette Ocean Twilight), `59232e6` (suppression du système fruit), `583a769`/`d550c9b` (collection guides + 7 guides), `6806c24`/`6dd2d39` (5 métiers + pricing.ts), `80eec29` (méga-menu), `46d5caa` (47 maquettes portées). Les lots 1 à 5 du `PLAN-MIGRATION.md` sont donc en grande partie réalisés, mais le plan continue de les présenter comme à faire.
- **Pourquoi ça compte :** Ces documents sont la mémoire du projet. Tels quels, ils mentent sur l'état d'avancement : un nouvel intervenant (humain ou IA) qui les lit comme source de vérité croira devoir « créer la collection guides », « migrer la palette », « créer pricing.ts » — alors que tout cela existe. Risque concret de double travail, de régression (réintroduire le fruit), ou de mauvaise priorisation.
- **Recommandation :** Ajouter en tête de chaque doc un bandeau d'état daté (« MIGRATION EXÉCUTÉE — ce document est historique, voir l'état réel du code ») ou, mieux, créer un unique `ETAT-MIGRATION.md` lot-par-lot indiquant fait/partiel/à faire, et archiver les 4 docs de planification dans `docs/archive/`.

### [MIG-02] Drift fruit : l'énum `menthe|fraise|miel|citron|kiwi` survit dans le code alors que les tokens fruit sont supprimés
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/lib/sections.ts:12`, `src/lib/accents.ts:12`
- **Description :** `design-tokens.css` ne contient **plus aucun** token fruit (vérifié : 0 occurrence de `menthe/fraise/miel/citron/kiwi`), conformément à CLAUDE.md (« fruit élagué »). Mais `lib/sections.ts:12` déclare encore `const accent = z.enum(['menthe', 'fraise', 'miel', 'citron', 'kiwi'])` et `lib/accents.ts:12` `export type Accent = 'menthe' | 'fraise' | 'miel' | 'citron' | 'kiwi'`. Le commentaire d'`accents.ts` assume ce choix (« conservé pour la compat des props/schéma ; l'élagage complet viendra ensuite ») et toutes les classes pointent vers `brand` — c'est donc **inerte**, pas un bug visuel. Mais c'est exactement le drift que CLAUDE.md et le delta §2C annonçaient devoir recâbler.
- **Pourquoi ça compte :** Une énum nommée d'après un système officiellement « superseded et élagué » est un piège cognitif : elle suggère que les valeurs `menthe`…`kiwi` ont encore un sens, alors qu'elles sont des étiquettes mortes. Un contenu MDX pourrait écrire `accent: 'fraise'` en croyant obtenir une couleur — sans effet. Dette de cohérence entre la doctrine (CLAUDE.md) et le code.
- **Recommandation :** Remplacer l'énum par des rôles réels (ex. `z.enum(['brand']).optional()`) ou la retirer si aucun accent n'est plus jamais distinct, et mettre à jour `accents.ts` en conséquence. Tâche annoncée comme « Lot 1 » mais restée inachevée.

### [MIG-03] Vues villes orphelines : `src/views/villes/` est du code mort (aucune route, aucune collection)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/villes/_template.astro`, `lorient.astro`, `vannes.astro`
- **Description :** Trois fichiers existent sous `views/villes/`. Vérifications : (a) aucune route `[ville]` n'existe sous `src/pages/` (seules `[service]/index.astro` et `[service]/[metier].astro` sont présentes) ; (b) aucun `import.meta.glob` ne pointe vers `views/villes/` (les globs existants ciblent `views/{hubs,metiers,guides,realisations}`) ; (c) aucune collection `villes` dans `content.config.ts` (collections = prestations, realisations, blog, metiers, guides). Ces vues ne sont donc jamais compilées dans aucune page. Le registre `MATRICE_VILLE` (`seo-architecture.ts:740`) existe pourtant avec 9 cellules (toutes `conditionnel`/`exclu`).
- **Pourquoi ça compte :** Du code mort entretient la confusion (on croit que les pages villes existent), peut être inclus par erreur dans un futur glob, et alourdit la maintenance. À noter une **tension de doctrine** : `content.config.ts:53-57` affirme que les métiers ne sont **pas** du SEO local géographique (« doorway pour un produit vendu partout en France »), or l'existence de vues villes va dans le sens inverse — décision à clarifier.
- **Recommandation :** Soit câbler la couche ville (collection `villes` + route `[service]/[ville].astro` gatée par `MATRICE_VILLE`, comme prévu au Lot 5c), soit supprimer `views/villes/` si la stratégie SEO local est abandonnée. Ne pas laisser ces fichiers en limbes.

### [MIG-04] Route triple-gatée `[service]/[metier]/[ville].astro` annoncée « actée/à créer » mais absente
- **Sévérité :** Mineur
- **Effort :** M
- **Localisation :** attendu `src/pages/[service]/[metier]/` — répertoire inexistant ; promesse en `MIGRATION-DELTA.md:112`, `ARCHITECTURE-CIBLE.md:51`, `PLAN-MIGRATION.md:65`
- **Description :** Les docs présentent comme **décision actée** la création de la route `[service]/[metier]/[ville].astro` avec statut `exclu` (« structure prête, aucune page générée »). Le répertoire `src/pages/[service]/[metier]/` n'existe pas — la route n'a jamais été scaffoldée. Ce n'est pas une régression (rien n'est cassé), mais un écart entre une décision documentée et le code.
- **Pourquoi ça compte :** Faible impact fonctionnel (la route ne devait générer aucune page). L'intérêt est seulement de cohérence : soit la décision tient et la route doit être créée, soit la décision est abandonnée et il faut la retirer des docs pour ne pas laisser une promesse non tenue.
- **Recommandation :** Trancher : créer la route stub (gating registre, 0 page) si la stratégie ville/métier reste au programme, sinon retirer cette décision des docs.

### [MIG-05] Items « À créer » du delta déjà réalisés : la table d'état (D/P/À) est fausse
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `MIGRATION-DELTA.md:24` (guides « À »), `:28` (glossaire « À »), `:29` (avis « À »), `:27` (pricing « P »)
- **Description :** Le delta marque plusieurs artefacts comme « À faire » ou « partiel » alors qu'ils sont réalisés : collection `guides` (existe, `content.config.ts:75` + 7 mdx + route `guides/[slug]` + index + 7 vues) ; glossaire (`pages/glossaire.astro` existe) ; avis (`pages/avis.astro` existe) ; source de prix unique (`src/data/pricing.ts` existe). De même `ARCHITECTURE-CIBLE.md:23` liste `guides` comme collection « **créer** » alors qu'elle est créée. Les pages C0 du Lot 4 (cgv, cookies, merci, 404, notre-methodologie, vos-30-premiers-jours, faq) existent toutes sous `src/pages/`.
- **Pourquoi ça compte :** La table D/P/À est l'outil de pilotage. Si elle est fausse, elle est pire qu'inutile : elle planifie du travail déjà fait. Les collections `temoignages`/`glossaire`/`villes` annoncées « à créer » dans `content.config.ts` n'existent d'ailleurs pas comme collections (avis/glossaire sont des pages statiques, pas des collections) — un autre écart entre le plan « par collection » et l'implémentation « page statique ».
- **Recommandation :** Recalculer la table D/P/À à partir du code réel, ou la supprimer. Documenter le choix « avis/glossaire = pages statiques » vs le plan « = collections » (changement de stratégie non tracé).

### [MIG-06] Cartographie périmée : compte de métiers, prestations et architecture composants obsolètes
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `CARTOGRAPHIE-ASTRO.md:48` (« 5 métiers : electricien, macon, menuisier, paysagiste, plombier »), `:50` (« sections/home : 11 sections »), `:75`
- **Description :** La cartographie liste les métiers `electricien, macon, menuisier, paysagiste, plombier`. Le code réel (`src/content/metiers/`) contient `electricien, garage-automobile, macon, plombier, vtc` — `menuisier` et `paysagiste` ont disparu, `garage-automobile` et `vtc` sont apparus. De même `sections/home/` contient 9 fichiers (pas 11, et `FinalCta` est sous `sections/shared/`, `RiskNote`/`CtaRow` ailleurs). La structure décrite (`components/home/`, `views/home/`) a été refactorée plusieurs fois depuis (commits `7c87f3b`, `1c13eef`, `cd76fff`) vers `src/sections/`.
- **Pourquoi ça compte :** Impact faible (cartographie informative), mais elle ne peut plus servir de référence fiable pour s'orienter dans le dépôt. Les chemins cités (`components/home/`) n'existent plus.
- **Recommandation :** Régénérer la cartographie depuis le code actuel, ou la marquer comme snapshot historique daté.

### [MIG-07] `z.md` est un fichier de travail à archiver/supprimer
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `z.md:1`
- **Description :** Le fichier contient une seule ligne utile (`Claude --dangerously-skip-permissions`) — c'est un mémo de commande, pas un document de projet. Le `PLAN-MIGRATION.md:93` prévoit explicitement de le nettoyer au Lot 9 (« `z.md` et fichiers de travail nettoyés »).
- **Pourquoi ça compte :** Bruit dans la racine du dépôt ; un fichier nommé `z.md` non explicite laisse penser à un brouillon oublié.
- **Recommandation :** Supprimer `z.md` ou le déplacer hors versionnement (le mettre en note personnelle / `.gitignore`).

### [MIG-08] `components/layout/Nav.astro` toujours présent et non référencé (doublon annoncé)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/layout/Nav.astro`
- **Description :** `CARTOGRAPHIE-ASTRO.md:77` et `ARCHITECTURE-CIBLE.md:63` signalent `Nav.astro` comme « non utilisé, doublon à confirmer/nettoyer » (prévu Lot 9). Vérification : aucun import de `layout/Nav` dans `src/` ; le header source sa nav depuis `@data/nav`. Le fichier est donc bien orphelin et n'a pas été nettoyé.
- **Pourquoi ça compte :** Code mort mineur. La nav réelle vit dans `data/nav.ts` + `Header.astro` ; `Nav.astro` peut tromper sur la source de vérité de la navigation.
- **Recommandation :** Supprimer `Nav.astro` après une dernière vérification d'absence d'import dynamique.

### [MIG-09] CLAUDE.md contredit les docs de migration sur la couleur de l'encre (Jet vs brun-olive)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `MIGRATION-DELTA.md:77-78` (encre/brand-900 = `#2D3138` Jet), vs `CLAUDE.md` §Couleurs + `src/styles/design-tokens.css:22,34,125` (`--ink`/`--brand-900` = `#403D30` brun-olive)
- **Description :** Le `MIGRATION-DELTA.md` (table de mapping, §2C) acte `--color-ink = #2D3138` (Jet) et `--color-brand-900 = #2D3138`. Le code réel et CLAUDE.md ont pivoté vers `#403D30` (brun-olive warm), avec mention explicite « Jet #2D3138 RETIRÉ — ne jamais réintroduire » (commit `2616deb`). Le delta documente donc une décision **ultérieurement révisée** sans être mis à jour. Un lecteur du delta réintroduirait le Jet, en violation directe de CLAUDE.md.
- **Pourquoi ça compte :** Contradiction directe entre deux documents censés faire foi sur la palette. C'est précisément le « garde-fou contradictoire » que le delta lui-même craignait (`MIGRATION-DELTA.md:98`). Risque de régression couleur si on suit le delta plutôt que CLAUDE.md.
- **Recommandation :** Mettre à jour la table §2C du delta vers `#403D30` (ou la marquer obsolète), CLAUDE.md faisant foi. Vérifier qu'aucun autre doc ne cite `#2D3138` comme cible.

## Points positifs

- L'architecture cible décrite dans les docs **correspond fidèlement** à ce qui a été implémenté : 4 couches, gating par registre, `<head>` unique, zéro îlot React, tokens centralisés. La qualité de l'analyse initiale est réelle — c'est le suivi d'état qui a décroché.
- La migration est effectivement **avancée et propre** : palette Ocean Twilight en place, fruit élagué des tokens, méga-menu 4 colonnes (`data/nav.ts`), source de prix unique (`data/pricing.ts`), 7 guides + collection, 5 métiers à contenu unique, pages C0 portées — conformes aux invariants du `PLAN §A`.
- Le registre `seo-architecture.ts` (`MATRICE_VILLE`, statuts ship/conditionnel/exclu) est en place et cohérent avec la doctrine anti-doorway, prêt à câbler la couche ville le jour venu.
- Les drifts restants sont **inertes** (enum fruit sans effet, vues villes non compilées) : aucun bug visible en production, ce qui laisse le temps de les nettoyer sans urgence.

## Tableau récapitulatif

| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| MIG-01 | Élevé | M | Docs de migration périmés : décrivent un projet non démarré alors qu'il est ≈80 % fait |
| MIG-02 | Moyen | S | Énum fruit `menthe…kiwi` survit dans sections.ts/accents.ts (tokens fruit pourtant supprimés) |
| MIG-03 | Moyen | S | Vues `views/villes/` orphelines (aucune route, aucune collection, aucun glob) |
| MIG-04 | Mineur | M | Route triple-gatée `[service]/[metier]/[ville]` actée mais jamais créée |
| MIG-05 | Moyen | S | Table d'état D/P/À fausse : guides/glossaire/avis/pricing déjà réalisés |
| MIG-06 | Mineur | S | Cartographie périmée (métiers, sections home, arborescence composants) |
| MIG-07 | Mineur | S | `z.md` = fichier de travail à archiver/supprimer |
| MIG-08 | Mineur | S | `Nav.astro` toujours présent et non référencé |
| MIG-09 | Hypothèse à vérifier | S | Contradiction palette : delta cite Jet `#2D3138`, code/CLAUDE.md = brun-olive `#403D30` |

---

### Conclusion sur le % de migration « fait » vs « annoncé »

Les docs **annoncent 0 %** (« aucune migration exécutée »). Le code montre **≈ 75–80 % fait** :
- **Lot 1 (tokens Ocean Twilight + élagage fruit)** : fait à ≈ 90 % (tokens migrés, fruit retiré des CSS) — reste l'énum fruit dans `sections.ts`/`accents.ts` (MIG-02) et la MAJ des docs.
- **Lot 2 (pricing + méga-menu)** : fait.
- **Lot 3 (hubs C1)** : fait (11 vues hubs).
- **Lot 4 (pages C0)** : fait (cgv, cookies, merci, 404, faq, notre-methodologie, vos-30-premiers-jours).
- **Lot 5a guides** : fait. **5b métiers** : fait (5, contenu unique). **5c villes** : **non câblé** (vues orphelines, pas de route/collection — MIG-03) + route triple-gatée absente (MIG-04). **5d avis / 5e glossaire** : faits en pages statiques (≠ collections du plan — MIG-05).
- **Lot 9 (nettoyage)** : non fait (`z.md`, `Nav.astro` subsistent — MIG-07/08).

Le travail restant réel est bien plus mince que ne le laissent croire les docs : surtout **câbler ou supprimer la couche villes**, **finir le recâblage de l'énum fruit**, et **resynchroniser/archiver les 5 documents** pour qu'ils cessent de désinformer.
