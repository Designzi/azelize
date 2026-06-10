/**
 * Vendorise les Google Fonts en local (public/fonts/ + src/styles/fonts.css).
 *
 * Pourquoi : la feuille fonts.googleapis.com est render-blocking et ajoute
 * 2 connexions tierces sur le chemin critique (LCP). On télécharge les fichiers
 * EXACTS que servait le CDN (mêmes axes variables opsz/wght, mêmes subsets
 * unicode-range) → rendu identique au pixel, auto-hébergé, préchargeable.
 *
 * Usage : node scripts/vendor-fonts.mjs  (à relancer pour mettre à jour les fontes)
 */
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

// Même URL que l'ancien <link> de BaseLayout — ne pas changer les axes sans
// vérifier le rendu (Bricolage : optical sizing 12..96 utilisé par les titres).
const CSS_URL =
  'https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:opsz,wght@12..96,400;12..96,500;12..96,600;12..96,700&family=Hanken+Grotesk:wght@400;500;600;700&family=JetBrains+Mono:wght@400;500&display=swap';

// UA moderne → Google sert du woff2 variable + subsets unicode-range.
const UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36';

const OUT_DIR = 'public/fonts';
const CSS_OUT = 'src/styles/fonts.css';

const res = await fetch(CSS_URL, { headers: { 'User-Agent': UA } });
if (!res.ok) throw new Error(`CSS Google Fonts: HTTP ${res.status}`);
let css = await res.text();

await mkdir(OUT_DIR, { recursive: true });

// Télécharge chaque fichier référencé et réécrit l'URL en /fonts/<nom-stable>.
const urls = [...new Set([...css.matchAll(/url\((https:[^)]+)\)/g)].map((m) => m[1]))];
const seen = new Map();
for (const url of urls) {
  // https://fonts.gstatic.com/s/<famille>/<version>/<hash>.woff2 → famille-hash.woff2
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  const name = `${parts[1]}-${parts.at(-1)}`;
  if (!seen.has(url)) {
    const r = await fetch(url, { headers: { 'User-Agent': UA } });
    if (!r.ok) throw new Error(`${url}: HTTP ${r.status}`);
    await writeFile(path.join(OUT_DIR, name), Buffer.from(await r.arrayBuffer()));
    seen.set(url, name);
    console.log(`✓ ${OUT_DIR}/${name}`);
  }
  css = css.replaceAll(url, `/fonts/${seen.get(url)}`);
}

const header = `/* GÉNÉRÉ par scripts/vendor-fonts.mjs — ne pas éditer à la main.
   @font-face auto-hébergées, identiques au CDN Google Fonts (display=swap). */\n\n`;
await writeFile(CSS_OUT, header + css);
console.log(`✓ ${CSS_OUT} (${urls.length} fichiers)`);

// Repère les fichiers du subset latin (à précharger dans BaseLayout).
for (const block of css.split('/* ')) {
  if (block.startsWith('latin */')) {
    const fam = block.match(/font-family: '([^']+)'/)?.[1];
    const file = block.match(/url\((\/fonts\/[^)]+)\)/)?.[1];
    const w = block.match(/font-weight: ([^;]+);/)?.[1];
    if (fam && file) console.log(`  latin → ${fam} (${w}) : ${file}`);
  }
}
