# Azelize

Site Azelize — **Astro 5** · **TypeScript strict** · **Tailwind CSS 4** (CSS-first via `@tailwindcss/vite`) · **MDX** · **Sitemap**. Statique par défaut, déploiement **Vercel**.

**Produit :** un abonnement « site pro créé et tenu pour vous », pensé pour les
artisans — _vous ne payez que quand le site vous amène des clients_. La page
d'accueil (`/`) est une landing one-page portée fidèlement de la maquette
livrée (`templates/azelize/ui_kits/azelize-studio/`).

## Démarrage

```bash
npm install
npm run dev      # serveur de dev
npm run build    # astro check + build statique → dist/
npm run preview  # prévisualiser le build
```

## Architecture

```
src/
├── pages/            1 fichier = 1 URL (landing, prestations, réalisations, blog, pages locales)
├── content.config.ts collections Astro 5 (glob loader + Zod) — à la RACINE de src/
├── content/          prestations / realisations / blog en .mdx
├── components/
│   ├── ui/           primitives sans métier (Button, Section, SectionHead, Card,
│   │                 Grid, Eyebrow, Pill, Badge, Logo)
│   ├── blocks/       blocs métier génériques pilotés par props (HeroBlock,
│   │                 StatsBlock, GridBlock, TestimonialBlock, PricingBlock,
│   │                 FaqBlock, FormBlock, CompareBlock, TimelineBlock, IncludesBlock)
│   ├── layout/       singletons (Header, Footer, Nav, Seo)
│   └── home/         sections de la landing : composent les blocs + injectent
│                     contenu et atmosphère (teinte de section)
├── layouts/          BaseLayout, ArticleLayout
├── styles/           design-tokens.css (SOURCE de vérité) + global.css (entrée unique)
├── lib/              helpers SEO / JSON-LD
└── data/             site, nav, footer
```

## Design system

Deux fichiers dans `src/styles/` :

- **`design-tokens.css`** — source de vérité. `:root` (variables brutes
  `--brand`, `--ink`… + **palette naturelle** : Menthe H=225 pour la marque,
  Fraise/Miel/Citron/Kiwi en grille HSB) **+** bloc `@theme` qui génère les
  utilitaires Tailwind v4 : couleurs (`bg-brand`, `text-fraise-s100-b50`,
  `bg-miel-s25-b100`…), échelle typo (`text-display`, `text-h2`, `text-eyebrow`),
  tracking et rayons.
- **`global.css`** — point d'entrée unique (`@import tailwindcss` → tokens →
  base + prose MDX + infra de motion `.reveal`). Importé une seule fois dans
  `BaseLayout`.

La landing est **stylée uniquement en utilitaires Tailwind** (plus de
`landing.css` ni de classes `.ed-*`). Les structures récurrentes vivent dans
`components/blocks/` ; les teintes d'ambiance par section passent par
`lib/accents.ts` (mapping `accent → classes`, car Tailwind exige des classes
littérales).

Polices chargées via `<link>` dans `BaseLayout` (et **non** en `@import` CSS,
qui finirait après Tailwind dans le bundle) : Bricolage Grotesque (titres),
Hanken Grotesk (corps/UI), JetBrains Mono (technique). **Aucune valeur en dur
hors des tokens.**

## Pages

- `/` — landing one-page (sections mono-usage dans `sections/home/` : Hero, Problem,
  HowItWorks, WhatsIncluded, WhySubscription, Proof, Pricing, Faq ; le CTA final
  réutilisé est `components/sections/FinalCta.astro`).
- `/mentions-legales`, `/confidentialite` — pages légales (provisoires).
- `prestations/`, `realisations/`, `blog/`, `a-propos`, `contact` —
  **échafaudage** (collections + routes) pour un déploiement progressif. Non
  liés depuis la maquette ; à activer par paliers avec du contenu réel.

## ⚠️ À fournir / trancher (cf. brief §8)

- **Formulaire de prise de RDV** (`components/sections/FinalCta.astro`) —
  actuellement **inerte** (état « envoyé » géré en JS local). Brancher un
  endpoint Astro (`+ @astrojs/vercel`, `prerender = false`) ou un service
  externe, et décider **où arrivent les demandes**.
- **Tarifs** — `390/590/890 €` dans `Pricing.astro` sont **indicatifs**, à
  confirmer.
- **Preuve** — chiffres et citations de `Proof.astro` (cas resinefar.fr) à
  confirmer avec les vrais résultats clients.
- **Coordonnées** — e-mail/téléphone/adresse du footer (`data/site.ts`,
  `Footer.astro`) **provisoires**.
- **Logos** — wordmark texte utilisé dans le header/footer (fidèle à la
  maquette). SVG régénérés en bleu Menthe dans `src/assets/` + favicon
  bleu (`public/favicon.svg`).
- **Image OG** — déposer `public/og/default.png` (référencée dans `data/site.ts`).
