/**
 * OG images — helper de chemin (couche pure, sans import de contenu).
 *
 * Les images sont générées au build par `src/pages/og/[...route].ts`
 * (astro-og-canvas) et servies à `/og/<clé>.png`. Chaque page passe son chemin
 * via la prop `image` (→ Seo.astro → og:image / twitter:image).
 *
 * Convention de clé = chemin d'URL sans le « / » initial (ex. `site-internet/plombier`),
 * plus les clés spéciales `home` et `default` (fallback du site).
 */
export const ogImage = (key: string): string => `/og/${key}.png`;
