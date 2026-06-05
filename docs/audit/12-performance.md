# Performance & Core Web Vitals — Rapport d'audit

**Périmètre audité :** `astro.config.mjs`, `src/layouts/BaseLayout.astro`, `src/styles/global.css` + `design-tokens.css`, `src/sections/home/Hero.astro`, scripts client inline (`src/**/*.astro`), `import.meta.glob` des routes dynamiques, génération OG (`src/pages/og/[...route].ts`, `src/lib/og.ts`), et analyse du dossier `dist/` après `astro build` (49 pages, 55 fichiers HTML).
**Note de santé :** 8/10 — site statique quasi sans JS, sans images raster et sans CLS structurel ; les rares points faibles sont la stratégie de polices (Google Fonts externe, un poids inutile) et l'absence de `prefetch`.

## Résumé exécutif
- Le site est **très léger** : aucune librairie front (pas de React/Vue), uniquement de petits scripts « maison » de quelques centaines d'octets. Le poids transmis au visiteur est minime.
- **Aucune image photo** sur le site : tout est en SVG ou en dégradés CSS. Il n'y a donc pas de problème de format/poids d'images côté visiteur — le système d'optimisation d'images d'Astro n'est même pas nécessaire en l'état.
- **Le décalage visuel au chargement (CLS) est maîtrisé** : le « visuel à venir » du héro réserve sa place (ratio 16/8) et les animations d'apparition sont conçues pour ne pas cacher le contenu au premier affichage.
- Deux axes d'amélioration de la vitesse perçue : les **polices passent par Google Fonts** (serveur externe qui bloque l'affichage) au lieu d'être hébergées sur le site, et **une graisse de police est téléchargée pour rien**.
- Les **images de partage social (OG)** pèsent ~1,9 Mo au total mais sont générées au build et ne sont chargées par aucune page visitée — elles n'impactent pas la vitesse du site, seulement la durée du build.

## Constats détaillés

### [PERF-01] Polices chargées via Google Fonts (origine tierce, CSS bloquant)
- **Sévérité :** Moyen
- **Effort :** M
- **Localisation :** `src/layouts/BaseLayout.astro:44-50`
- **Description :** Les trois familles (Bricolage Grotesque, Hanken Grotesk, JetBrains Mono) sont chargées par un `<link rel="stylesheet">` vers `fonts.googleapis.com`. C'est une feuille de style **render-blocking servie par un domaine tiers** : le navigateur doit résoudre DNS + se connecter à `fonts.googleapis.com`, télécharger le CSS, puis aller chercher les fichiers `.woff2` sur `fonts.gstatic.com` avant de peindre le texte définitif. Les `preconnect` sont présents (bien), `display=swap` aussi, mais la dépendance réseau externe demeure sur le chemin critique.
- **Pourquoi ça compte :** Chaque connexion à une origine externe ajoute de la latence avant le premier rendu utile (impact LCP) et introduit une dépendance à un service tiers (disponibilité, RGPD/cookies Google selon configuration). Auto-héberger les polices supprime un aller-retour réseau et permet un `preload` ciblé du `.woff2` réellement utilisé pour le titre du héro (LCP).
- **Recommandation :** Auto-héberger les polices (les déposer en `.woff2` dans `public/fonts/` ou `src/assets/`, déclarer les `@font-face` dans `global.css` avec `font-display: swap`) et ajouter un `<link rel="preload" as="font" type="font/woff2" crossorigin>` sur le fichier de la graisse d'affichage du héro. Astro propose aussi l'API expérimentale `experimental.fonts` qui automatise l'auto-hébergement.

### [PERF-02] Graisse de police téléchargée mais jamais utilisée (Bricolage 800)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/layouts/BaseLayout.astro:49` (`Bricolage+Grotesque:...;12..96,800`)
- **Description :** La requête Google Fonts demande la graisse **800** de Bricolage Grotesque, mais aucune classe `font-extrabold` (ou `font-weight:800`) n'existe dans le code (`grep font-extrabold` = 0 occurrence ; le `800` trouvé dans `views/guides/combien-coute-site-internet.astro:27` est un texte de prix, pas un poids). Les graisses réellement employées sont 400/500/600/700.
- **Pourquoi ça compte :** Un poids supplémentaire = un fichier de police téléchargé inutilement (octets gaspillés sur la bande passante visiteur, surtout mobile). Retirer le poids inutilisé allège la charge sans aucun effet visuel.
- **Recommandation :** Retirer `;12..96,800` de l'URL de la police (et de toute déclaration `@font-face` lors de l'auto-hébergement PERF-01). Au passage, vérifier que les 5 graisses de Hanken (400/500/600/700) sont toutes utilisées : `font-normal/medium/semibold/bold` sont bien présentes, donc OK.

### [PERF-03] Aucune préchargement de navigation (`prefetch`) configuré
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `astro.config.mjs` (absence de clé `prefetch`)
- **Description :** Le site n'active pas le `prefetch` d'Astro et n'utilise pas `<ClientRouter>` (vérifié : aucune occurrence dans `src`). Chaque navigation interne déclenche donc un chargement « à froid » de la page suivante (HTML + la feuille CSS partagée si pas encore en cache).
- **Pourquoi ça compte :** Sur un site de conversion (parcours hub → métier → devis), précharger au survol/à l'apparition des liens rend les transitions quasi instantanées, ce qui améliore la vitesse *perçue* et peut soutenir la conversion. Coût quasi nul puisque le site est 100 % statique.
- **Recommandation :** Ajouter `prefetch: { prefetchAll: true, defaultStrategy: 'hover' }` (ou `'viewport'` pour les liens du menu/CTA) dans `astro.config.mjs`. Optionnel mais peu coûteux.

### [PERF-04] Feuille CSS partagée non inlinée malgré `inlineStylesheets:'auto'`
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `astro.config.mjs:31-33` ; `dist/_astro/_slug_.CeUBMrct.css` (90 037 octets, ~16,5 Ko gzip)
- **Description :** Avec `inlineStylesheets:'auto'`, Astro n'inline que les petites feuilles (< ~4 Ko). Ici la quasi-totalité du CSS du site est regroupée dans **une seule feuille partagée de 90 Ko** liée en externe sur chaque page (render-blocking au premier chargement). C'est en réalité un **bon compromis** : la feuille est mutualisée et mise en cache après la première page, donc les navigations suivantes ne la re-téléchargent pas. Le `cookies.astro` génère en plus une petite feuille dédiée (5,4 Ko) — comportement attendu du code-splitting CSS.
- **Pourquoi ça compte :** Sur la **première** page vue, ces 90 Ko (16,5 Ko gzip) bloquent le rendu le temps du téléchargement. Sur un site de marketing où la première impression compte, inliner le CSS critique au-dessus de la ligne de flottaison supprimerait ce blocage initial. Le risque est faible (16,5 Ko gzip restent modestes) d'où la sévérité mineure.
- **Recommandation :** Conserver la stratégie actuelle (elle est saine pour un site multi-pages). Si le LCP de la page d'accueil l'exige après mesure réelle (Lighthouse/PageSpeed), envisager `inlineStylesheets:'always'` page d'accueil uniquement, ou un découpage du CSS critique. À ne traiter qu'après mesure terrain, pas en aveugle.

### [PERF-05] Quatre `import.meta.glob({ eager: true })` sur les routes dynamiques
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/pages/guides/[slug].astro:36`, `src/pages/realisations/[slug].astro:32`, `src/pages/[service]/index.astro:40`, `src/pages/[service]/[metier].astro:47`
- **Description :** Chaque route dynamique charge en **eager** l'ensemble des vues d'un dossier (`views/hubs/*`, `views/metiers/*`, `views/guides/*`, `views/realisations/*`) pour mapper le slug vers le composant. En `eager`, tous les modules du glob sont importés même quand une seule vue est rendue pour un slug donné.
- **Pourquoi ça compte :** Comme c'est un site **statique** (rendu au build, aucun JS de page envoyé au visiteur), l'impact runtime côté visiteur est **nul** : ce coût est uniquement au build. Avec ~11 hubs / 5 métiers / 7 guides / 3 réalisations, le surcoût de build est négligeable (build complet en ~8 s). À surveiller seulement si le nombre de vues explose (programmatique ville/métier à grande échelle).
- **Recommandation :** Laisser tel quel à cette échelle. Si les dossiers `views/` grossissent fortement, passer en glob **lazy** (`eager:false`) et n'`await` que le module correspondant au slug, pour garder un build rapide.

## Points positifs
- **Zéro framework JS client** : aucune dépendance React/Vue, uniquement de petits scripts vanilla `is:inline` (header sticky, méga-menu, FAQ accordéon, reveal au scroll, barre CTA mobile), chacun de quelques centaines d'octets. C'est l'idéal pour les Core Web Vitals (TBT/INP).
- **Aucune image raster** : tout en SVG (`favicon.svg`, monogramme, wordmark) ou en dégradés CSS (placeholder héro). Pas de risque de poids/format d'image non optimisé ; `astro:assets` n'est pas requis en l'état.
- **CLS structurel maîtrisé** : le placeholder visuel du héro réserve son espace via `aspect-[16/8]` (`Hero.astro:37`), évitant tout saut de mise en page.
- **Pattern d'animation correct pour le LCP** : le contenu est **visible par défaut** ; les règles `opacity:0` ne s'appliquent qu'une fois la classe `.anim` posée par JS (`global.css:158-165`), donc le héro n'est jamais caché au premier rendu. `prefers-reduced-motion` est respecté (`global.css:167-172`).
- **Polices avec `display=swap`** et `preconnect` vers les deux origines Google Fonts déjà en place — le texte de repli s'affiche immédiatement (pas de FOIT).
- **CSS mutualisé et raisonnable** : 90 Ko bruts mais ~16,5 Ko gzip, partagés et cachés sur tout le site ; code-splitting CSS effectif (feuille dédiée `cookies`).
- **Images OG générées au build** (`astro-og-canvas`) : ~1,9 Mo de PNG produits une seule fois au build, jamais sur le chemin critique d'une page visitée — coût build uniquement, build complet ~8 s.
- **Pages HTML compactes** : page la plus lourde = `index.html` à ~72 Ko brut / ~12,8 Ko gzip.

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| PERF-01 | Moyen | M | Polices via Google Fonts (tiers, CSS bloquant) → auto-héberger + preload |
| PERF-02 | Mineur | S | Graisse Bricolage 800 demandée mais jamais utilisée |
| PERF-03 | Mineur | S | Aucun `prefetch` de navigation configuré |
| PERF-04 | Mineur | S | CSS partagé 90 Ko non inliné (acceptable, à mesurer) |
| PERF-05 | Mineur | S | `import.meta.glob` eager sur 4 routes (coût build uniquement) |
