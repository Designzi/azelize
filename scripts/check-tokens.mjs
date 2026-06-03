#!/usr/bin/env node
/**
 * Garde-fou design system (brief §4/§12) : aucune COULEUR en dur dans les
 * composants/pages. Toutes les couleurs doivent venir de design-tokens.css
 * (consommées via utilitaires Tailwind `bg-*`/`text-*`… ou `var(--…)`).
 *
 * Scanne les fichiers .astro et .css de src/ (hors design-tokens.css) et refuse :
 *   - hex      #fff / #FFFFFF / #ffffffff
 *   - rgb()/rgba()/hsl()/hsla() littéraux
 * Sortie : liste fichier:ligne, code de sortie 1 si violation.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, basename, extname } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const ALLOWLIST = new Set(['design-tokens.css']); // seule source légitime de hex
const EXT = new Set(['.astro', '.css']);

const HEX = /#[0-9a-fA-F]{3,8}\b/;
const FUNC = /\b(rgba?|hsla?)\s*\(/;

/** @param {string} dir */
function walk(dir) {
  /** @type {string[]} */
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    const s = statSync(p);
    if (s.isDirectory()) out.push(...walk(p));
    else if (EXT.has(extname(p)) && !ALLOWLIST.has(basename(p))) out.push(p);
  }
  return out;
}

const violations = [];
for (const file of walk(SRC)) {
  const lines = readFileSync(file, 'utf8').split(/\r?\n/);
  lines.forEach((line, i) => {
    const m = line.match(HEX) || line.match(FUNC);
    if (m) violations.push(`${relative(ROOT, file)}:${i + 1}  ${line.trim().slice(0, 100)}`);
  });
}

if (violations.length) {
  console.error(`\n✖ Couleur en dur détectée (${violations.length}) — utilise un token du design system :\n`);
  for (const v of violations) console.error('  ' + v);
  console.error('\n→ Ajoute/consomme une variable dans src/styles/design-tokens.css.\n');
  process.exit(1);
}
console.log('✓ Aucune couleur en dur hors design-tokens.css.');
