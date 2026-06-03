#!/usr/bin/env node
/**
 * Synchronise le bloc @theme de la planche couleurs-combinaisons.html avec la
 * source de vérité src/styles/design-tokens.css (son propre bloc @theme).
 *
 * La planche est AUTONOME (un seul .html, ouvrable en file:// ou servi par Vite
 * via /@fs) et stylée en Tailwind pur (build navigateur @tailwindcss/browser).
 * Elle embarque donc une copie du @theme du projet → à relancer si les tokens
 * changent :
 *
 *     node docs/sync-tokens.cjs
 */
const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', 'src/styles/design-tokens.css');
const PLANCHE = path.join(__dirname, 'couleurs-combinaisons.html');

/** Extrait le contenu (entre accolades) du VRAI bloc `@theme { … }`
 *  (et non le mot « @theme » cité dans un commentaire d'en-tête). */
function themeBody(css) {
  const m = /@theme\s*\{/.exec(css);     // « @theme » suivi de `{` = la déclaration réelle
  if (!m) return null;
  let depth = 0, open = m.index + m[0].length - 1, end = -1;
  for (let i = open; i < css.length; i++) {
    if (css[i] === '{') depth++;
    else if (css[i] === '}') { depth--; if (depth === 0) { end = i; break; } }
  }
  return css.slice(open + 1, end);
}

const body = themeBody(fs.readFileSync(SRC, 'utf8'));
if (!body) { console.error('✖ @theme introuvable dans design-tokens.css'); process.exit(1); }
const count = (body.match(/--color-[a-zA-Z0-9-]+\s*:/g) || []).length;

let html = fs.readFileSync(PLANCHE, 'utf8');
const re = /(@theme\s*\{)[\s\S]*?(\n\s*\})/;       // le @theme de la planche
if (!re.test(html)) { console.error('✖ Bloc @theme introuvable dans la planche'); process.exit(1); }
html = html.replace(re, `$1${body}$2`);
fs.writeFileSync(PLANCHE, html);
console.log(`✓ @theme synchronisé (${count} couleurs) dans docs/couleurs-combinaisons.html`);
