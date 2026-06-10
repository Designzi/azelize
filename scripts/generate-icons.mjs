/**
 * Génère les icônes raster (public/icons/*) depuis public/favicon.svg.
 *
 * Pourquoi : Google demande des favicons en multiples de 48 px et un logo
 * Organization raster ≥ 112×112 bien rendu (le SVG seul ne suffit pas pour
 * Google Images) ; iOS ignore le SVG (apple-touch-icon).
 *
 * Usage : node scripts/generate-icons.mjs  (à relancer si favicon.svg change)
 */
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const SVG = 'public/favicon.svg';
const OUT = 'public/icons';

// nom → taille (px). 48/96 : favicons Google ; 180 : apple-touch ; 512 : logo JSON-LD + PWA.
const targets = {
  'favicon-48.png': 48,
  'favicon-96.png': 96,
  'apple-touch-icon.png': 180,
  'icon-192.png': 192,
  'icon-512.png': 512,
};

await mkdir(OUT, { recursive: true });
for (const [name, size] of Object.entries(targets)) {
  // density : suréchantillonne le SVG (viewBox 32px) pour un rendu net à la taille cible.
  await sharp(SVG, { density: Math.ceil((72 * size) / 32) })
    .resize(size, size)
    .png()
    .toFile(path.join(OUT, name));
  console.log(`✓ ${OUT}/${name} (${size}×${size})`);
}
