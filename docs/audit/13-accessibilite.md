# Accessibilité — Rapport d'audit

**Périmètre audité :** `src/layouts/{BaseLayout,ArticleLayout}.astro`, `src/components/layout/{Header,Footer,Nav,MobileCtaBar,Seo}.astro`, `src/components/ui/{Field,Button,Breadcrumbs,Logo,RiskNote,Pill}.astro`, `src/components/blocks/{FormBlock,FaqBlock}.astro`, `src/pages/{contact,devis,faq}.astro`, `src/views/realisations/global-cars.astro`, `src/styles/{global,design-tokens}.css`, `src/data/site.ts`. Axes : sémantique HTML / landmarks, hiérarchie de titres, ARIA, alt, gestion du focus (méga-menu, tiroir mobile), contrastes (tokens), formulaires, langue, navigation clavier.
**Note de santé :** 6/10 — fondations saines (lang, focus-visible global, labels liés, prefers-reduced-motion, contrastes principaux conformes), mais des manques structurels récurrents sur la navigation clavier des menus, l'absence de lien d'évitement, et l'annonce des changements d'état dynamiques.

## Résumé exécutif
- Les bases sont bonnes : la langue de la page est déclarée (`fr`), un anneau de focus visible existe partout, les champs de formulaire ont chacun une étiquette correctement reliée, et les animations se coupent pour les personnes sensibles au mouvement.
- Il manque un « lien d'évitement » (skip link) : une personne au clavier ou au lecteur d'écran doit re-traverser tout le menu sur chaque page avant d'atteindre le contenu.
- Le méga-menu Services (bureau) et le tiroir mobile ne sont pas pilotables au clavier de façon fiable : pas de piège de focus dans le tiroir, pas de déplacement du focus à l'ouverture/fermeture, et des liens du menu déroulant restent atteignables au clavier même quand le menu est visuellement fermé.
- Quand un formulaire affiche « C'est noté » après envoi, le changement n'est pas annoncé : un utilisateur de lecteur d'écran ne sait pas que sa demande est passée (pas de zone « live », pas de déplacement du focus).
- La couleur de texte la plus pâle (`ink-faint`, ~2,3:1) est sous le seuil de lisibilité réglementaire ; elle sert pour des libellés, des indications « (optionnel) », les séparateurs de fil d'Ariane et surtout les textes indicatifs (placeholders) des champs.

## Constats détaillés

### [A11Y-01] Aucun lien d'évitement vers le contenu principal
- **Sévérité :** Élevé
- **Effort :** S
- **Localisation :** `src/layouts/BaseLayout.astro:53-59` (`<body>` → `<header>` puis `<main class="flex-1">` sans `id`)
- **Description :** Le `<main>` n'a pas d'`id` et aucun lien « Aller au contenu » n'est rendu en tête de `<body>`. Le header contient une topbar, le logo, la nav (avec déclencheur de méga-menu), le CTA et le burger.
- **Pourquoi ça compte :** Une personne navigant au clavier ou au lecteur d'écran doit franchir tous les éléments du header à chaque page avant d'atteindre le contenu. C'est un critère WCAG 2.4.1 (Contournement de blocs) attendu sur tout site.
- **Recommandation :** Ajouter `id="main"` sur `<main>` et, juste après l'ouverture de `<body>`, un lien `<a href="#main">` visuellement masqué qui devient visible au focus (classe utilitaire « skip link »). L'anneau de focus global existe déjà, il suffit de rendre le lien visible au `:focus`.

### [A11Y-02] Méga-menu et tiroir mobile : focus non géré
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** `src/components/layout/Header.astro:87-120` (méga-menu `data-mega`), `:126-168` (tiroir `<aside id="mobile-drawer">`), script `:170-235`
- **Description :** À l'ouverture du tiroir mobile, le focus reste sur le burger ; aucun piège de focus dans le tiroir ; à la fermeture (Échap, voile, clic lien) le focus n'est pas restitué au burger. Le tiroir est un `<aside>` sans `role="dialog"`/`aria-modal="true"`. Le méga-menu desktop n'a pas de navigation au clavier dédiée (flèches), et s'ouvre/ferme essentiellement via `mouseenter`/`mouseleave` (`:199-204`) : un utilisateur clavier peut l'ouvrir au clic (bien) mais ne dispose pas d'un fonctionnement clavier cohérent ni de fermeture au `blur`.
- **Pourquoi ça compte :** WCAG 2.1.1 (clavier) et 2.4.3 (ordre de focus). Sans piège ni restitution de focus, l'utilisateur clavier « sort » du tiroir par derrière, se perd, et ne sait pas qu'un dialogue est ouvert.
- **Recommandation :** À l'ouverture du tiroir : déplacer le focus sur le premier élément focusable (ou le bouton de fermeture), poser `role="dialog"` + `aria-modal="true"` + `aria-label`, piéger le focus (Tab cyclique), et restituer le focus au burger à la fermeture. Pour le méga-menu, fermer sur `focusout` du header et permettre la fermeture au clavier (Échap déjà géré `:227-232`).

### [A11Y-03] Liens du méga-menu focusables alors que le menu est fermé
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/components/layout/Header.astro:87-120` (panneau `invisible … opacity-0 … hidden lg:block`) et tiroir mobile `:126-168` (`translate-x-full`, jamais retiré du flux de tabulation)
- **Description :** Le panneau du méga-menu est masqué via `invisible`/`opacity-0` mais reste dans le DOM ; en `lg`, il est `block`. Les liens de service (`:97`) et ceux du tiroir restent atteignables par `Tab` même quand le composant est fermé (pas de `inert`, pas de `tabindex="-1"`, `visibility:hidden` n'est posé que via la classe `invisible` qui retire bien du tab, mais le tiroir mobile fermé n'utilise que `translate-x-full` et reste tabulable).
- **Pourquoi ça compte :** Un utilisateur clavier rencontre des liens « fantômes » hors écran, ce qui casse l'ordre de focus (WCAG 2.4.3) et désoriente.
- **Recommandation :** Sur le tiroir et le panneau du sous-menu mobile fermés, appliquer `inert` (ou `visibility:hidden`/`hidden`) quand `data-open` est absent, pour les retirer du parcours clavier. Vérifier que la classe `invisible` du méga-menu suffit bien à retirer ses liens du tab (sinon ajouter `inert`).

### [A11Y-04] États « envoyé » de formulaire non annoncés (pas de live region ni focus)
- **Sévérité :** Élevé
- **Effort :** S
- **Localisation :** `src/components/blocks/FormBlock.astro:66-90`, `src/pages/contact.astro:86-106 / 184-196`, `src/pages/devis.astro:186-204`
- **Description :** À la soumission, le formulaire reçoit `hidden` et le bloc de confirmation passe de `hidden` à `flex`. Ce bloc n'a ni `role="status"`/`aria-live="polite"`, ni déplacement du focus vers le message. La coche « ✓ » est `aria-hidden="true"` (correct), mais rien d'autre n'annonce le succès.
- **Pourquoi ça compte :** WCAG 4.1.3 (Messages d'état). Un utilisateur de lecteur d'écran qui valide le formulaire n'entend aucun retour : il croit que rien ne s'est passé. Le focus restant sur un bouton désormais masqué est également problématique.
- **Recommandation :** Sur le conteneur `data-contact-sent` / `data-devis-sent`, ajouter `role="status"` (ou `aria-live="polite"`) et, après affichage, déplacer le focus sur son titre (`tabindex="-1"` + `.focus()`). À noter pour l'orchestrateur : ces formulaires sont explicitement non connectés (`brief §11`), mais l'accessibilité de l'état local reste à corriger.

### [A11Y-05] Texte `ink-faint` sous le seuil de contraste WCAG AA
- **Sévérité :** Élevé
- **Effort :** M
- **Localisation :** token `--color-ink-faint: #A7ABB2` (`src/styles/design-tokens.css:128`) ; usages : placeholders des champs (`src/components/ui/Field.astro:30` `placeholder:text-ink-faint`, idem `contact.astro:75`, `devis`), libellé « (optionnel) » (`contact.astro:68`), titres de colonnes footer (`Footer.astro:36,44`), séparateur de fil d'Ariane (`Breadcrumbs.astro:24`), « Visuel à venir » (`Hero.astro:41`)
- **Description :** Ratio mesuré `#A7ABB2` sur blanc = **2,3:1**, très en deçà du minimum AA de 4,5:1 (texte normal) et même de 3:1 (texte large / éléments d'UI). Les placeholders, lorsqu'ils portent une information, et les libellés concernés sont donc difficilement lisibles.
- **Pourquoi ça compte :** WCAG 1.4.3 (Contraste minimum). Les placeholders et libellés secondaires en gris très pâle sont inaccessibles aux personnes malvoyantes et inconfortables pour tout le monde en plein soleil (cible artisans/mobile).
- **Recommandation :** Foncer `ink-faint` (viser ≥4,5:1, p. ex. autour de `#6F747C` déjà utilisé pour `ink-soft` à 4,7:1) **ou** réserver `ink-faint` à des éléments purement décoratifs et ne jamais y porter d'information textuelle. Pour les placeholders, ne pas y mettre d'info essentielle (ils ne remplacent pas le label, qui ici existe — bon point).

### [A11Y-06] `aria-label` posé sur des `<figure>` décoratifs (visuels placeholder)
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/views/realisations/global-cars.astro:161-165, 187-191, 219-223` (`<figure … aria-label={alt} />` avec fond CSS, sans image ni `role`)
- **Description :** Ces `<figure>` sont des aplats de fond (motif `PARCH`) sans contenu ni `<img>`. `aria-label` sur un `<figure>` (rôle `figure`) n'est pas restitué de manière fiable par tous les lecteurs d'écran, et l'élément n'a pas de texte alternatif réel : soit le visuel porte de l'information (et il faut un `<img alt>` une fois le vrai visuel posé), soit il est décoratif (et l'`aria-label` est trompeur).
- **Pourquoi ça compte :** WCAG 1.1.1 (Contenu non textuel). Aujourd'hui ce sont des placeholders, mais le pattern guide vers une alternative textuelle non fiable une fois les vrais visuels intégrés.
- **Recommandation :** Quand les vrais visuels arriveront, utiliser `<img alt="…">` (ou `<figure>` + `<figcaption>` + `<img>`). Tant que ce sont des aplats décoratifs, retirer l'`aria-label` (ou passer en `role="img"` + `aria-label` si on veut absolument exposer un nom). Vérifier le même pattern ailleurs (placeholders « Visuel à venir »).

### [A11Y-07] Champs obligatoires non distingués visuellement ni programmatiquement
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/components/ui/Field.astro:33-47` (prop `required` posée sur l'input mais aucun indicateur), usages `contact.astro:56-64` (aucun `required` passé) ; libellé « (optionnel) » présent uniquement `contact.astro:68`
- **Description :** Le composant `Field` accepte `required` et le transmet à l'`<input>` (validation HTML native — bien), mais n'ajoute ni marqueur visuel (`*`), ni `aria-required`/indication dans le label. Sur la page contact, aucun champ n'est marqué `required` ; seul un champ est annoté « (optionnel) », ce qui par contraste laisse deviner que les autres sont obligatoires sans le dire explicitement.
- **Pourquoi ça compte :** WCAG 3.3.2 (Étiquettes ou instructions). L'utilisateur ne sait pas quels champs sont obligatoires avant de déclencher une erreur de validation.
- **Recommandation :** Dans `Field`, quand `required`, ajouter un indicateur visible dans le `<label>` (ex. `*` avec libellé « obligatoire » accessible) ; la contrainte `required` native gère déjà l'état programmatique. Harmoniser la stratégie (tout marquer obligatoire, ou tout marquer optionnel) plutôt que de la déduire.

### [A11Y-08] Accordéons FAQ : relation bouton↔panneau non exposée
- **Sévérité :** Moyen
- **Effort :** S
- **Localisation :** `src/components/blocks/FaqBlock.astro:30-49`, `src/pages/faq.astro:91-101`, `src/views/guides/faq-site-web-plombier.astro:176`
- **Description :** Les déclencheurs sont bien des `<button type="button">` avec `aria-expanded` correctement basculé en JS (bon point). En revanche le panneau de réponse (`data-faq-a` / `.fq-a-wrap`) n'a pas d'`id` relié par `aria-controls` sur le bouton, et le panneau n'est pas masqué à l'arbre d'accessibilité quand il est replié (il est seulement à `max-height:0; overflow:hidden`, donc son texte reste exposé aux lecteurs d'écran).
- **Pourquoi ça compte :** Pratique ARIA pour les accordéons (WCAG 4.1.2). Le contenu replié reste lu par les lecteurs d'écran, et l'utilisateur ne sait pas quel panneau le bouton contrôle.
- **Recommandation :** Donner un `id` au panneau, le référencer via `aria-controls` sur le bouton, et masquer le panneau replié à l'arbre d'accessibilité (`hidden` ou `inert` quand fermé) en plus du `max-height` pour l'animation.

### [A11Y-09] Hiérarchie de titres dépendante du contenu (risque de h1 multiple / saut de niveau)
- **Sévérité :** Hypothèse à vérifier
- **Effort :** M
- **Localisation :** `src/components/blocks/Blocks.astro` (mapping type→bloc), `HeroBlock.astro`, sections home (`src/sections/home/*`), vues `src/views/**`
- **Description :** Les `<h1>` sont posés au cas par cas dans les sections/vues (ex. `ArticleLayout.astro:27` un seul h1 — bon ; `Hero.astro:14` h1 ; `contact.astro:32` h1). Mais le système de blocs composables (`HeroBlock`, etc.) et l'assemblage de plusieurs sections par page rendent possible un `<h1>` absent, dupliqué, ou un saut de niveau (h1→h3) selon le contenu injecté. Non vérifié exhaustivement page par page.
- **Pourquoi ça compte :** WCAG 1.3.1 / 2.4.6. Une hiérarchie de titres cohérente (un seul h1, pas de saut) structure la page pour les lecteurs d'écran.
- **Recommandation :** Vérifier au build (ou via un test) qu'il y a exactement un `<h1>` par page rendue et pas de saut de niveau ; documenter dans `HeroBlock` quel niveau de titre il produit. Outil read-only suggéré : un crawl de `dist/` après `astro build`.

### [A11Y-10] Burger sans `aria-expanded` initial (état seulement posé en JS)
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/layout/Header.astro:73-83` (le burger a `aria-label` et `aria-controls` mais pas d'`aria-expanded="false"` dans le HTML rendu ; il est posé seulement au premier `setDrawer`, `:212`)
- **Description :** Le déclencheur du méga-menu et le sous-toggle ont bien `aria-expanded="false"` en HTML (`:55`, `:139`). Le burger, lui, n'a pas d'`aria-expanded` initial : il n'apparaît que lors du premier clic. Avant toute interaction (et si le JS échoue), l'état « replié/déplié » du tiroir n'est pas exposé.
- **Pourquoi ça compte :** WCAG 4.1.2. Cohérence des composants à déclencheur ; un lecteur d'écran annonce mieux un bouton dont l'état est explicite dès le chargement.
- **Recommandation :** Ajouter `aria-expanded="false"` directement sur le burger dans le HTML (`:73-78`).

### [A11Y-11] Bouton de fermeture du tiroir : « × » comme contenu visible
- **Sévérité :** Mineur
- **Effort :** S
- **Localisation :** `src/components/layout/Header.astro:133` (`<button … aria-label="Fermer le menu">×</button>`)
- **Description :** Le caractère « × » (U+00D7) est le contenu textuel visible du bouton. L'`aria-label="Fermer le menu"` prend le dessus pour le nom accessible (bon), donc le « × » ne sera pas lu deux fois. Point d'attention mineur : s'assurer que le glyphe ne soit pas annoncé comme « multiplié par » sur certains lecteurs si l'`aria-label` venait à manquer.
- **Pourquoi ça compte :** Robustesse du nom accessible (WCAG 4.1.2) ; ici c'est correct grâce à l'`aria-label`.
- **Recommandation :** Conserver l'`aria-label`. Éventuellement remplacer le « × » par une icône SVG `aria-hidden` pour la portabilité visuelle. Faible priorité.

## Points positifs
- Langue de page déclarée : `<html lang={site.lang}>` = `fr` (`BaseLayout.astro:37`, `site.ts:14`).
- Anneau de focus visible global et cohérent via `:focus-visible` + token `--ring-focus` (`global.css:64-68`, `design-tokens.css:95`), réutilisé sur les champs (`Field.astro:30`).
- Étiquettes de formulaire correctement liées : `<label for={id}>` ↔ `id` de l'input/textarea (`Field.astro:34-46`), `autocomplete` renseigné (`name`, `tel`), `<fieldset>`/`<legend>` sur le formulaire devis (`devis.astro:124-158`).
- Landmarks présents : `<header>`, `<nav aria-label="Navigation principale">`, `<main>`, `<footer>`, `<aside>` ; fil d'Ariane en `<nav aria-label="Fil d'Ariane">` avec `aria-current="page"` sur l'élément courant (`Breadcrumbs.astro:18-28`).
- Déclencheurs interactifs = vrais `<button type="button">` avec `aria-expanded` basculé (méga-menu, sous-menu, accordéons FAQ) ; chips devis = `<button aria-pressed>` (`devis.astro:136-149`) — bon usage.
- Icônes/ornements décoratifs marqués `aria-hidden="true"` de façon systématique (carets, puces, SVG du méga-menu, coche de succès).
- `prefers-reduced-motion: reduce` respecté (animations et `scroll-behavior` neutralisés, `global.css:167-172`) ; le JS du contact teste aussi `matchMedia` avant l'IntersectionObserver (`contact.astro:164-167`).
- `Escape` ferme le méga-menu et le tiroir ; le tiroir se referme au resize ≥1024px (`Header.astro:227-235`).
- Aucune image bitmap réelle dans le code (`<img>`/`<Image>` absents) : pas de dette d'`alt` manquant à ce stade — l'enjeu se reportera quand les vrais visuels seront intégrés (cf. A11Y-06).

## Tableau récapitulatif
| ID | Sévérité | Effort | Titre |
|----|----------|--------|-------|
| A11Y-01 | Élevé | S | Aucun lien d'évitement vers le contenu principal |
| A11Y-02 | Élevé | M | Méga-menu et tiroir mobile : focus non géré |
| A11Y-03 | Moyen | S | Liens de menu focusables alors que le menu est fermé |
| A11Y-04 | Élevé | S | États « envoyé » de formulaire non annoncés |
| A11Y-05 | Élevé | M | Texte `ink-faint` sous le seuil de contraste WCAG AA |
| A11Y-06 | Moyen | S | `aria-label` sur `<figure>` décoratifs (placeholders) |
| A11Y-07 | Moyen | S | Champs obligatoires non distingués |
| A11Y-08 | Moyen | S | Accordéons FAQ : relation bouton↔panneau non exposée |
| A11Y-09 | Hypothèse à vérifier | M | Hiérarchie de titres dépendante du contenu |
| A11Y-10 | Mineur | S | Burger sans `aria-expanded` initial |
| A11Y-11 | Mineur | S | Bouton de fermeture « × » comme contenu visible |
