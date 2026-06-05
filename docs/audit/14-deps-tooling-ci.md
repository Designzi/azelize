# Dépendances, tooling & CI — Rapport d'audit

**Périmètre audité :** `package.json`, `package-lock.json`, `eslint.config.mjs`, `.prettierrc.json`, `.prettierignore`, `astro.config.mjs`, `tsconfig.json`, `.gitignore`, `.github/workflows/ci.yml`, `scripts/check-tokens.mjs`, `docs/sync-tokens.cjs`. Analyses read-only : `npm audit`, comparaison versions déclarées/installées, peer deps, versions Node.
**Note de santé :** 8/10 — outillage très propre et cohérent (CI complète, lint + tokens + build, deps à jour) ; quelques scories mineures (placement de deps, redondance, Node non épinglé localement) et des vulnérabilités modérées non atteignables dans ce code.

## Résumé exécutif
- Le projet est **bien outillé** : il y a une intégration continue (CI) qui, à chaque envoi de code, vérifie automatiquement le code (lint), la règle « aucune couleur en dur » et que le site compile. C'est un vrai garde-fou.
- Les **dépendances sont à jour** et alignées : toutes les versions installées respectent les fourchettes déclarées, sans décalage notable.
- `npm audit` remonte 7 alertes de sécurité **modérées**, mais après vérification **aucune n'est exploitable ici** : elles concernent soit une fonctionnalité Astro non utilisée dans le code, soit un outil de développement (le « type-checker ») jamais expédié au visiteur.
- Petites scories sans gravité : deux dépendances de build (`typescript`, `@astrojs/check`) sont rangées dans la mauvaise catégorie ; une dépendance (`astro-eslint-parser`) est déclarée en double ; la version de Node n'est pas figée localement (CI sur Node 20, machine de dev sur Node 22).
- Le contrôle de formatage (`prettier`) existe mais **n'est pas vérifié par la CI** : le style peut diverger sans que rien ne l'arrête.

## Constats détaillés

### [DEPS-01] Vulnérabilités modérées signalées par npm audit (non atteignables ici)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `package-lock.json` (chaînes `astro` ≤6.1.9, `@astrojs/mdx`, `yaml` via `@astrojs/check`)
- **Description :** `npm audit` remonte 7 vulnérabilités (1 basse, 6 modérées). Deux familles : (a) Astro ≤6.1.9 — XSS via `define:vars` dans une balise `</script>` mal échappée + rejeu de paramètres chiffrés des « server islands » ; (b) `yaml` (Stack Overflow sur YAML profondément imbriqué) tiré transitivement par `@astrojs/check` → `@astrojs/language-server` → `yaml-language-server`. Vérification du code : **aucun** `define:vars` ni `server:defer` dans `src/` (grep négatif), donc la surface XSS/server-islands d'Astro n'est pas exercée ; `yaml` n'intervient que dans l'outil de type-check (dev/CI), jamais dans le site livré.
- **Pourquoi ça compte :** une alerte d'audit non triée finit par être ignorée (« fatigue d'alerte ») et masque une vraie alerte future. Ici le risque réel est quasi nul, mais l'état « 7 vulnérabilités » reste visible et bruyant.
- **Recommandation :** monter Astro en patch dès qu'un correctif ≥5.x est publié (rester sur la ligne 5 pour éviter le breaking change vers 6.4.4 proposé par `audit fix --force`). Documenter dans le README que les alertes `yaml`/server-islands sont connues et non applicables. Ne PAS lancer `npm audit fix --force` (il forcerait Astro 6 et @astrojs/check 0.9.2, deux changements de rupture).

### [DEPS-02] `typescript` et `@astrojs/check` rangés en dependencies au lieu de devDependencies
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `package.json:19` (`@astrojs/check`), `package.json:26` (`typescript`)
- **Description :** `typescript` et `@astrojs/check` sont dans `"dependencies"`. Ce sont des outils de **build/dev** : `@astrojs/check` n'est invoqué que par le script `build` (`astro check && astro build`) et `typescript` ne sert qu'à la compilation/vérification. Le site final (statique) ne les embarque pas.
- **Pourquoi ça compte :** la frontière dependencies/devDependencies sert à savoir ce qui part en production. Mal classés, ils seraient installés en `npm ci --omit=dev` (déploiement allégé) alors qu'ils sont nécessaires au build, ou inversement gonfleraient un calcul de surface « runtime ». Pour un site purement statique l'impact est faible, mais c'est une convention que les outils (audit, scanners) exploitent.
- **Recommandation :** déplacer `typescript` et `@astrojs/check` vers `devDependencies`. (À noter : `astro`, `@astrojs/mdx`, `@astrojs/sitemap`, `@tailwindcss/vite`, `tailwindcss`, `astro-og-canvas` peuvent légitimement rester en dependencies car requis au build.)

### [DEPS-03] `astro-eslint-parser` déclaré en double (déjà transitif d'eslint-plugin-astro)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `package.json:30`
- **Description :** `astro-eslint-parser` est déclaré explicitement en devDependency, mais c'est déjà une **dépendance directe** de `eslint-plugin-astro` (range `^1.3.0`) et le config (`eslint.config.mjs`) ne l'importe jamais en direct : il passe par `astro.configs.recommended` qui embarque le parser. La déclaration explicite est donc redondante.
- **Pourquoi ça compte :** une déclaration redondante crée une seconde source de vérité pour la version du parser : un futur `^1.4.0` figé ici pourrait diverger de ce que `eslint-plugin-astro` attend et provoquer un parser dédoublé. Sans gravité aujourd'hui (les ranges sont compatibles), mais c'est du bruit.
- **Recommandation :** soit retirer `astro-eslint-parser` du `package.json` (laisser le plugin le fournir), soit l'assumer comme épinglage volontaire et le commenter. Vérification recommandée avant retrait (`npm ls astro-eslint-parser`) — d'où la sévérité Mineur et non « à corriger d'office ».

### [DEPS-04] Version de Node non épinglée (pas de .nvmrc ni champ engines)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `package.json` (pas de champ `engines`), absence de `.nvmrc` / `.node-version` ; `.github/workflows/ci.yml:15` épingle `node-version: 20`
- **Description :** La CI tourne sur Node 20, mais la machine de dev observée tourne sur **Node 22.22.2** et rien n'aligne les deux : pas de `engines.node` dans `package.json`, pas de `.nvmrc`. Le `setup-node` n'épingle qu'une majeure (`20`), pas un patch.
- **Pourquoi ça compte :** un build qui passe en local (Node 22) mais casse en CI (Node 20), ou l'inverse, est une source classique de « ça marche chez moi ». Sur un site statique le risque est modéré mais réel (API Node, comportements de `vite`/`esbuild`).
- **Recommandation :** ajouter un `.nvmrc` (ex. `20`) ou un champ `engines.node` dans `package.json`, et faire pointer la CI vers ce fichier (`node-version-file: .nvmrc`) pour une seule source de vérité.

### [DEPS-05] La CI ne vérifie pas le formatage (format:check absent du pipeline)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `.github/workflows/ci.yml:18-23` (étapes : check:tokens, lint, build) ; script disponible mais non appelé : `package.json:15` (`format:check`)
- **Description :** Le projet expose `format:check` (`prettier --check .`) mais la CI ne l'exécute pas. Elle lance `check:tokens`, `lint` puis `build`. Le formatage peut donc dériver d'un commit à l'autre sans qu'aucun garde-fou ne le bloque.
- **Pourquoi ça compte :** sans contrôle automatique, le style se fait à la main, les diffs se polluent de reformatages et les revues perdent du temps sur la forme plutôt que le fond.
- **Recommandation :** ajouter une étape `- run: npm run format:check` dans `ci.yml`. (Optionnel : la placer avant le lint pour échouer vite sur un écart de forme.)

### [DEPS-06] Workflow CI sans concurrency ni Dependabot
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `.github/workflows/ci.yml` (pas de bloc `concurrency`) ; absence de `.github/dependabot.yml`
- **Description :** Deux améliorations de robustesse manquent : (a) aucune clé `concurrency` — des pushes rapprochés lancent des runs redondants qui continuent inutilement ; (b) aucun `dependabot.yml` — les mises à jour de dépendances et de GitHub Actions ne sont pas proposées automatiquement (les `actions/checkout@v4` et `setup-node@v4` ne seront pas suivies).
- **Pourquoi ça compte :** sans Dependabot, le suivi de sécurité (cf. DEPS-01) repose sur une veille manuelle ; sans `concurrency`, on gaspille des minutes CI. Impact faible mais ce sont des bonnes pratiques peu coûteuses.
- **Recommandation :** ajouter `concurrency: { group: ${{ github.ref }}, cancel-in-progress: true }` au workflow, et un `.github/dependabot.yml` (écosystèmes `npm` + `github-actions`, cadence hebdo).

### [DEPS-07] Le script docs/sync-tokens.cjs n'est ni dans les scripts npm ni vérifié en CI
- **Sévérité :** Hypothèse à vérifier
- **Effort :** S
- **Localisation :** `docs/sync-tokens.cjs`, `package.json:6-17` (pas de script `sync:tokens`)
- **Description :** `docs/sync-tokens.cjs` synchronise le bloc `@theme` de `docs/couleurs-combinaisons.html` depuis `src/styles/design-tokens.css`. Il s'exécute manuellement (`node docs/sync-tokens.cjs`) et n'a aucun script npm associé ni de vérification de dérive (un `--check` qui échouerait si la planche est désynchronisée). `docs/` étant hors lint et hors `check:tokens`, rien ne détecte une planche obsolète.
- **Pourquoi ça compte :** si les tokens changent et qu'on oublie de relancer le script, la planche de référence couleur ment silencieusement. Comme `docs/` est explicitement hors périmètre qualité, c'est assumé — d'où « hypothèse à vérifier » : est-ce un choix délibéré (planche jetable) ou un oubli ?
- **Recommandation :** si la planche doit rester fiable, ajouter un script `sync:tokens` (avec mode `--check`) et l'appeler en CI ; sinon documenter explicitement que la planche est best-effort.

## Points positifs
- **CI réelle et pertinente** (`.github/workflows/ci.yml`) : `npm ci` (build reproductible via le lockfile v3), puis `check:tokens` + `lint` + `astro check && astro build`. Elle couvre l'essentiel (garde-fou design, qualité, type-check, build) et tourne sur push main + toutes les PR.
- **Dépendances parfaitement à jour** : chaque version installée respecte sa fourchette `^` et correspond aux dernières patchs/minors de sa ligne (Astro 5.18.2, Tailwind 4.3.0, TS 5.9.3…). Aucun décalage majeur, aucune dépendance manquante.
- **Garde-fou couleurs maison solide** (`scripts/check-tokens.mjs`) : scanne `.astro`/`.css`, refuse hex/rgb/hsl en dur hors `design-tokens.css`, sortie fichier:ligne + code 1 — exactement ce qu'il faut pour bloquer une PR.
- **ESLint flat config v9 propre et commentée** : ignore correctement `dist/`/`.astro/`/`node_modules/`/`docs/`, recommandés TS + Astro non type-checkés (rapide), exceptions `_`-prefix et `as any` justifiées.
- **Prettier configuré et cohérent** (printWidth 100, simple quotes, plugin Astro) avec `.prettierignore` aligné sur `.gitignore`.
- **astro.config.mjs sain** : `site` défini (sitemap + canoniques), redirects legacy → architecture cible, sitemap qui exclut les pages noindex (cohérent avec robots).
- **Aucune dépendance morte évidente** : `astro-og-canvas` est bien consommé (`src/lib/og.ts`, `src/pages/og/[...route].ts`), peer dep Astro ^5 satisfaite.
- **`.gitignore` complet** (build, types générés, env, éditeurs, Vercel) — pas de fuite de secrets ou d'artefacts.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| DEPS-01 | Moyen | M | Vulnérabilités modérées npm audit (non atteignables ici) |
| DEPS-02 | Mineur | S | typescript / @astrojs/check mal classés en dependencies |
| DEPS-03 | Mineur | S | astro-eslint-parser déclaré en double |
| DEPS-04 | Moyen | S | Version Node non épinglée (pas de .nvmrc / engines) |
| DEPS-05 | Moyen | S | CI ne vérifie pas le formatage (format:check absent) |
| DEPS-06 | Mineur | S | CI sans concurrency ni Dependabot |
| DEPS-07 | Hypothèse à vérifier | S | docs/sync-tokens.cjs non scripté ni vérifié |
