# Azelize — instructions projet

## Tailwind — classes canoniques avant valeurs arbitraires

Toujours préférer une classe canonique à une valeur arbitraire `[...]` quand un équivalent existe (règle `suggestCanonicalClasses` de tailwindcss-intellisense) :

- **Échelle d'espacement / taille** (`px`, `py`, `m*`, `gap`, `w`, `h`, `top`, `max-w`, `translate-*`…) : utiliser le pas d'échelle v4 (1 unité = `0.25rem` = 4px). Ex. `px-[26px]` → `px-6.5`, `w-[18px]` → `w-4.5`, `max-w-[1180px]` → `max-w-295`, `h-[24px]` → `h-6`.
- **Tokens du thème** : utiliser le nom du token plutôt que sa valeur. Ex. `tracking-[-0.035em]` → `tracking-display`, `tracking-[-0.02em]` → `tracking-h2`. Tokens définis dans `src/styles/design-tokens.css`.
- **Garder `[...]`** uniquement quand il n'y a pas d'équivalent : `clamp()`, valeurs hors-échelle (`text-[14.5px]`, `leading-[1.55]`, `tracking-[-0.03em]`), `[22ch]`, etc.

⚠️ **Fichiers `docs/familles/*.html` autonomes** : ils utilisent le CDN `@tailwindcss/browser` avec un `@theme` inline. Un token nommé (ex. `tracking-display`) ne rend QUE s'il est déclaré dans ce `@theme` inline — l'ajouter là avant de l'utiliser, sinon la classe est ignorée au runtime même si l'IntelliSense la valide (il lit le thème du projet, pas l'inline).

## Couleurs

Palette **Ocean Twilight** — couleurs réelles de la maquette Design (décision Q1 : on se fie au Design réel, pas aux `.md`/commentaires) :

- marque `brand` `#2347B8` (+ `brand-deep` / `-bright` / `-soft`), encre `ink` `#2D3138`, bande sombre `brand-900` (Jet), neutres/parchemin (`paper`, `parchment`), filets `line` / `-strong` / `-soft` ;
- **jaune `accent-2`** seul accent coloré, ponctuel : `accent-2-soft` (topbar + carte FAQ), `accent-2-ink` / `-ink-deep` (texte/bouton sur jaune) ;
- chrome : `hover` (survol neutre du méga-menu), `overlay` (voile du tiroir), `shadow-mega`.

Le **système fruit / 17 combinaisons** (`docs/familles/charte-couleur.md`, `menthe/fraise/miel/citron/kiwi`) est **superseded et élagué** : les tokens fruit ont été retirés de `design-tokens.css` (ne reste que marque + neutres + jaune `accent-2`). `lib/accents.ts` renvoie `brand` pour tout accent ; le type `Accent` et les props `accent: …` subsistent comme labels inertes (compat schéma), sans effet visuel. Le site est **monochrome** (marque + neutres + jaune ponctuel). Jamais `ok`/`warn`/`danger` en surface, jamais de couleur en dur (`check:tokens`).
