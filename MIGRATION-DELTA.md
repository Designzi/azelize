# MIGRATION-DELTA.md

Comparaison ligne à ligne entre le **langage source** (`CARTOGRAPHIE-DESIGN.md`, UI kit `ui_kits/azelize-studio/`) et le **langage cible** (`CARTOGRAPHIE-ASTRO.md`). En déduit les **règles de traduction** et la **table de mapping des tokens**.

> **Cadrage essentiel.** Le récepteur Astro n'attend pas d'être construit : il **existe déjà**. La plupart des « idiomes cibles » ci-dessous sont **déjà opérationnels**. Le delta dominant n'est donc pas *structurel* (l'architecture est là) mais *volumétrique* : **~40 pages de contenu** du UI kit restent à porter en **entrées de collection** + **registre `seo-architecture.ts`**, et quelques patterns visuels (mockups, cas premium) restent à factoriser en blocs.

---

## 2A. Table de correspondance (langage source → idiome Astro)

État cible : **D** = déjà implémenté dans le récepteur · **P** = partiel · **À** = à faire.

| Artefact source (Design) | Idiome Astro cible | Règle de traduction | État | Effort |
|---|---|---|---|---|
| Page `.html` autonome (`<head>` + `<style>` propres) | `src/pages/*.astro` sous `BaseLayout` | `<head>` → layout ; corps → page/contenu ; `<style>` → tokens + utilitaires | **D** (mécanisme) | — |
| Chrome `site-chrome.jsx` + `_chrome.css` | `Header/Footer/MobileCtaBar` + `BaseLayout` | chrome unique en composants, nav via `data/nav.ts` & `footer.ts` | **D** | — |
| Composant `.jsx` **statique** (Problem, HowItWorks…) | composant `.astro`, **pas d'îlot** | si zéro interactivité → `.astro` pur | **D** | — |
| Composant `.jsx` **interactif** (FaqList, simulateur, glossaire, cookies) | **JS vanilla** en `<script>` (PAS de React) | hydrater uniquement le comportement, via `<script>` côté client | **P** (FAQ/form faits ; simulateur/glossaire/cookies à porter) | M–L |
| Gabarit `-VILLE` + instances `-lorient`/`-vannes` | **1** route `[service]/[ville].astro` + collection `villes` | la ville = donnée ; **gating** via `MATRICE_VILLE` (déjà encodé) | **P** (registre prêt, route + collection absentes) | M |
| Pages métier clonées (C3) | `[service]/[metier].astro` + collection `metiers` | métier = entrée MDX `sections[]` ; contenu **unique** par métier | **D** (route + 5 entrées) ; **À** : porter les autres métiers | M |
| Hubs services C1 (×11) | `[service]/index.astro` + `SERVICES[].hub` | service = entrée du registre ; hub = `sections[]` | **D** (route + 6 services `ship`) ; **À** : enrichir les hubs | M |
| Styles inline / valeurs en dur | utilitaires Tailwind v4 / tokens `@theme` | via **table de mapping tokens** (§2C) ; `check:tokens` interdit le hex | **D** (garde-fou actif) | — |
| Pages clones C2/C3 (duplication) | routes dynamiques + collections | factorisation pilotée par la donnée | **P** | M |
| Guides éditoriaux (C5) | collection `guides` + `guides/[slug].astro` | corps en MD/MDX ; shell `ArticleLayout` | **À** (collection à créer ; `ArticleLayout` existe) | M |
| Études de cas | collection `realisations` + `realisations/[slug].astro` | gabarit narratif + données + **vrais visuels** (`<Image/>`) | **P** (route + 1 entrée `far`) ; **À** : Global Cars premium | M–L |
| Pages légales (`mentions`, `cgv`, `confidentialite`, `cookies`) | pages statiques (ou collection `legal`) | shell « sommaire collant + sections numérotées » | **P** (2 pages présentes ; `cgv`/`cookies` à ajouter) | S |
| Tarifs (`tarifs.html`, `TarifsSection.jsx`, simulateur) | bloc `pricing` + **source de prix unique** | prix = donnée unique réutilisée (page, simulateur, hub) | **P** (bloc `pricing` existe ; source unique de prix à centraliser) | S–M |
| Glossaire (`TERMS`) | collection `glossaire` + filtre alpha en `<script>` | termes = données ; recherche/filtre en JS vanilla | **À** | M |
| Avis (`avis.html`) | collection `temoignages` + bloc `testimonial` | avis = données ; bloc existe | **À** | S |
| OG par page (Design : absent) | `og/[...route].ts` (astro-og-canvas) | OG générées au build pour toute entrée `ship` | **D** | — |
| Mockups CSS (SERP, dashboard, van, catalogue) copiés par page | blocs/primitives dédiés (`mockup-*`) ou `<Image/>` | factoriser les répétés ; one-offs restent locaux | **À** | M–L |

---

## 2B. Différences de langage (findings)

| # | Ce que fait **Design** | Ce qu'attend **Astro** | Règle de pont | État récepteur |
|---|---|---|---|---|
| F1 | Chaque page a son `<head>` + `<style>` | `<head>` mutualisé dans `BaseLayout` | tout passe par `BaseLayout` → `Seo` | **résolu** |
| F2 | Styles ~70 % en `<style>` par page, classes préfixées `.gc-*/.si-*` | utilitaires Tailwind + tokens `@theme` | porter en classes canoniques ; `check:tokens` en garde-fou | **résolu** (mécanisme) ; **à appliquer** au portage |
| F3 | Contenu écrit en dur dans le markup | contenu = entrées de collection + `sections[]` | extraire texte → frontmatter MDX / registre | **partiel** (5 métiers, 6 hubs, 1 réa) |
| F4 | Duplication de pages (clones ville/métier/guide) | 1 route dynamique + N entrées | un fichier-gabarit, la variation devient donnée | **partiel** (métier fait ; ville/guide à câbler) |
| F5 | Interactivité globale React 18 + Babel sur **chaque** page | îlots ciblés — ici **JS vanilla**, zéro framework | réécrire l'interactif en `<script>` ; ne jamais réintroduire React | **partiel** (FAQ/form ; reste à porter) |
| F6 | SEO par page (méta dans chaque `<head>`) | SEO centralisé + JSON-LD typé | déléguer à `Seo.astro` + `lib/seo.ts` selon le type | **résolu** |
| F7 | **Pas** de gating : toute page existe en dur | page générée **seulement si** entrée `ship` | piloter le build par `seo-architecture.ts` + existence d'entrée | **résolu** (services) ; **à étendre** (villes) |
| F8 | Palette **Ocean Twilight** (`#2347B8`) + jaune accent (real Design) | récepteur sur **fruit / 17 combos** (`menthe #002080`) — exploration | **Q1 actée** : réconcilier le récepteur vers Ocean Twilight (mapping 1:1 nom pour nom), **élaguer le fruit** | **à réconcilier** (fruit superseded, cf. §2C) |
| F9 | Prix répétés en 3 endroits | source de prix unique | centraliser un module prix consommé par bloc `pricing` + simulateur | **à faire** |
| F10 | Mockups CSS dupliqués par page | composants factorisés / `<Image/>` | extraire les répétés ; garder one-offs en local | **à faire** |

---

## 2C. Table de mapping des tokens (source Design → cible Astro) — **réconciliée (Q1–Q3 actées)**

> ✅ **Décision Q1.** La source de vérité palette = **les couleurs réelles du Design**, jamais les `.md`/commentaires. Le Design ship un fichier **`design-tokens.css` auto-intitulé « Source unique de vérité »** : palette **Ocean Twilight** (`--brand: #2347B8`) + Jet + Blanc + Parchemin + Pale Slate, et — fait décisif — **les mêmes noms de tokens que le récepteur** (`--color-brand`, `--color-brand-deep`, `--color-brand-soft`…). Le « mapping 1:1 » est donc **littéral, nom pour nom** ; seules les **valeurs** divergent. Le système **fruit / 17 combos** du récepteur (marque Menthe `#002080`, 45 slots, `menthe/fraise/miel/citron/kiwi`) n'est documenté que dans `docs/familles/charte-couleur.md` — **un `.md`, donc explicitement ignoré par Q1** : c'est le **« superflu » à élaguer** (« aucun ajout fantôme »).

> ➡️ **Réconciliation** = importer les **valeurs réelles Ocean Twilight** dans les **noms de tokens existants** du récepteur, puis **supprimer les slots fruit non adossés à une couleur Design réellement utilisée**.

### Audit quantitatif (Q2–Q3) — relevé sur le kit Design présent sur la machine
> Fichiers audités : `templates/azelize/{design-tokens.css, colors_and_type.css}` + `preview/*.html` (regex hex/rgba, fréquences). ⚠️ **Les 54 pages produit `.jsx/.html` ne sont PAS sur cette machine** → l'audit d'usage par page (combien de fois chaque jaune sert réellement, brun-olive CtaBand, etc.) reste à compléter au Lot 1, kit en main.

- **Marque (bleu)** confirmée active : `#2347b8` (×9), `#1c39a0` (×6), `#2f57d0` (×4), wash `#e6ebf9` (×5).
- **Encre/neutres** (match exact récepteur) : `#2d3138` (×9), `#4a4f57`, `#6f747c`, `#a7abb2`, lignes `#e7e4da`/`#c9cdd2`(×14)/`#f1eee5`, parchemin `#f5f1e8` (×5), papier `#fff/#ffffff`.
- **Jaunes (accent-2)** définis : `#ffd500` (vif, ×1), `#ffea80` (soft, ×1), `#fff4bf` (wash, ×1) + encre `#403500` (×1). → **2 à 3 variantes** selon usage réel (vif + soft sûrs ; wash « réservé/hover » à confirmer Lot 1).
- **Beige de section** : `#f2f0e6` (×1) — **1 seule variante** (Q3 → **1 token**).
- **Brun-olive CtaBand `#403d30`** : **absent du kit token** (vit dans le `<style>` des pages produit, non présentes) → variante réelle probable, **à confirmer Lot 1**.
- **Mort, à NE PAS créer** (commentaires uniquement) : olive `#39541d`, lime `#c1fe49` — confirme la consigne Q1.
- **Hors-token dans `preview/*.html`** : rampes de démo (verts `#34d77a`/`#107a37`, rouges `#ff6b6b`/`#c0142a`, ambres `#fbbf24`/`#b45309`, neutres chauds `#201a1a`…, rayures placeholder `#eeebe0`/`#e6e2d6`) → **démos de doc, pas palette produit** → ignorées.

**Légende action** : *réconcilier* (même nom, adopter la valeur Design réelle) · *réutiliser* (valeur déjà identique) · *créer* (variante réelle sans slot) · *élaguer* (slot récepteur sans adossement Design réel).

| Token Design (valeur réelle) | Nom sémantique | Token Astro (nom identique) | Action |
|---|---|---|---|
| `#2347B8` `--brand`/`--accent` | Primaire (Ocean Twilight) | `--color-brand` (= `#002080` aujourd'hui) | **réconcilier** → `#2347B8` |
| `#1C39A0` `--brand-deep` | Primaire foncé | `--color-brand-deep` (`#001040`) | **réconcilier** → `#1C39A0` |
| `#2F57D0` `--brand-bright` | Primaire clair | `--color-brand-bright` (`#0040FF`) | **réconcilier** → `#2F57D0` |
| `#E6EBF9` `--brand-soft` | Wash bleu | `--color-brand-soft` (`#BFCFFF`) | **réconcilier** → `#E6EBF9` |
| `#2D3138` `--ink` | Jet Black (encre) | `--color-ink` (`#2D3138`) | **réutiliser** (match) |
| `#2D3138` `--brand-900` | Bandes sombres | `--color-brand-900` (`#001040`) | **réconcilier** → `#2D3138` (Jet) |
| `#FFD500` `--accent-2` | Jaune vif | *(aucun — slots citron à élaguer)* | **créer** `--color-accent-2` |
| `#FFEA80` `--accent-2-soft` | Jaune clair (topbar) | `citron-s50-b100` (=`#FFEA80`) | **créer** `--color-accent-2-soft` (élaguer citron) |
| `#FFF4BF` `--accent-2-wash` | Jaune très clair (hover) | — | **créer si usage réel confirmé** (Lot 1) |
| `#403500` `--accent-2-ink` | Encre sur jaune | — | **créer** `--color-accent-2-ink` |
| `#F2F0E6` `--section-warm` | Beige (fond section) | ≠ parchment/line-soft | **créer** `--color-section-warm` (1 token, Q3) |
| `#403D30` (en dur) | Brun-olive (CtaBand/cookies) | — | **créer** `--color-olive` (Q2, si confirmé Lot 1) |
| `#FFFFFF` `--paper` | Blanc canvas | `--color-paper` | réutiliser (match) |
| `#F5F1E8` `--paper-2` | Parchemin | `--color-parchment` | réutiliser (match) |
| `#4A4F57`·`#6F747C`·`#A7ABB2` | Ink 2 / soft / faint | `--color-ink-2/-soft/-faint` | réutiliser (match) |
| `#E7E4DA`·`#C9CDD2`·`#F1EEE5` | Filets | `--color-line/-strong/-soft` | réutiliser (match) |
| on-dark `#E8EAED`·`#FFF`·`#C9CDD2`·`rgba(255,255,255,.16)` | Texte/lignes sur sombre | `--color-on-dark/-bright/-soft/-line` | réutiliser (match) |
| `#16A34A`·`#F59E0B`·`#E11D2E` (ok/warn/danger) | États sémantiques | présents en `:root` | **conserver technique uniquement** ; absents de la surface produit (à vérifier sur usage réel Lot 1) |
| `menthe/fraise/miel/citron/kiwi` × 45 slots | Système fruit (exploration) | `--color-{famille}-s..-b..` | **élaguer** (aucun adossement Design réel ; `.md` ignoré par Q1) |
| Typo Bricolage / Hanken / JetBrains Mono | Display / Body / Mono | `--font-display/-sans/-mono` | réutiliser (identiques) |
| Échelle type, tracking, espacement 4px, radius 4–8px, ombres quasi nulles | — | `--text-*`, `--tracking-*`, échelle Tailwind, `--radius-*`, `--shadow-*` | réutiliser (ajuster clamps si écart) |

**Conséquences à traiter (réconciliation fruit → Ocean Twilight)** — voir PLAN Lot 1 :
- `src/lib/accents.ts` (mappe vers familles fruit) → recâbler sur les rôles Ocean Twilight ou neutraliser.
- Props `tone`/`accent` (`lib/sections.ts`, `Section.astro`, blocs) qui énumèrent `menthe|fraise|…` → redéfinir l'énum sur la palette réelle.
- **`CLAUDE.md`** (§Couleurs « 17 combinaisons », « jamais ok/warn/danger ») et la **mémoire `palette-retenue.md`** : **désormais supersédés** par Q1 → à mettre à jour avant le portage (sinon garde-fou contradictoire).
- `docs/familles/*` + `check-tokens.mjs` : la doc fruit devient obsolète ; `check:tokens` reste valide (toujours zéro hex hors `design-tokens.css`).

**Objectif inchangé :** zéro valeur en dur après portage (`check:tokens`) ; mais le **set de tokens** est désormais la **palette Design réelle**, élaguée du superflu fruit.

---

## Décisions actées (remplace les questions ouvertes)

| Réf | Décision | Implication migration |
|---|---|---|
| **Q1 — Palette** | Se fier **uniquement aux couleurs réelles** du Design (`.jsx/.html` + `design-tokens.css`), ignorer `.md`/commentaires | Réconcilier les tokens récepteur vers **Ocean Twilight** (mapping 1:1 nom pour nom) ; **élaguer le fruit** ; aucun token fantôme |
| **Q2–Q3 — Tokens** | Construire **strictement sur variantes réelles** (audit quantitatif), supprimer le superflu | Créer un token **seulement** si variation réelle utilisée et sans slot (ex. 1 beige → 1 `--color-section-warm`) ; jaunes 2–3 + ink ; olive si confirmé |
| **Navigation** | **Méga-menu 4 colonnes** | Étendre `data/nav.ts` → structure groupée (4 groupes) ; `Header.astro` parse la structure (JS vanilla, zéro régression) |
| **Triple gaté** | **Créer** la route `[service]/[metier]/[ville].astro`, **statut `exclu`** au registre | Route présente mais **aucune page générée** (ni index, ni sitemap) tant que le contenu local spécifique manque |
| **Slugs villes** | Vérifier au **Lot 9** si `creation-site-internet-lorient.html` (etc.) existent/sont indexés côté Design | Si oui → **redirections 301** dans `astro.config.mjs` (précédent déjà en place) |
| **Backend formulaire** | Trancher au **Lot 8** (endpoint Astro vs Formspree/Web3Forms) selon le scope | Ne bloque pas la structure ; brief au moment du lot |
| **Visuels Global Cars** | WebP + assets dans `D:\Zi\APP\templates\azelize\assets` → copier vers `src/assets/` au **Lot 7**, via `<Image/>` | ⚠️ Vérifié : `assets/` ne contient pour l'instant que `azelize-monogram.svg` + `azelize-wordmark.svg` — **les WebP Global Cars ne sont pas encore présents** ; à rapatrier avant le Lot 7 |

---

*Fin du delta. Aucune migration exécutée.*
