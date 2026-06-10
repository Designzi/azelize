/**
 * Audit SEO du build (dist/) — garde-fou aligné sur les checklists Google
 * (référentiel D:\Zi\APP\seo\seo-google) :
 *   titres/descriptions uniques et aux bonnes longueurs, pas de double marque,
 *   un seul h1, canonical présent, JSON-LD valide en URLs absolues,
 *   liens internes non cassés, pas de CDN fonts résiduel.
 *
 * Usage : npm run build && node scripts/check-seo.mjs  (exit 1 si anomalie)
 */
import fs from 'node:fs';
import path from 'node:path';

const DIST = 'dist';
const pages = [];
(function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.html')) pages.push(p);
  }
})(DIST);

const titles = new Map();
const descs = new Map();
const faqOwner = new Map(); // question FAQ balisée → page (jamais 2 pages)
let issues = 0;
const warn = (m) => {
  console.log('⚠ ' + m);
  issues++;
};
const decode = (s) =>
  s
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"');

for (const p of pages) {
  const html = fs.readFileSync(p, 'utf8');
  const rel =
    '/' +
    path
      .relative(DIST, p)
      .replace(/\\/g, '/')
      .replace(/index\.html$/, '');
  if (html.includes('http-equiv="refresh"')) continue; // pages de redirection (filet legacy)

  const noindex = /name="robots" content="noindex/.test(html);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');

  if (!title) warn(`${rel} : pas de <title>`);
  if (!desc) warn(`${rel} : pas de meta description`);
  if (/Azelize.*— Azelize/.test(title)) warn(`${rel} : double marque → ${title}`);

  // Longueurs/unicité : seulement pour les pages indexables (les noindex sont
  // des placeholders assumés).
  if (!noindex) {
    if (title.length > 65) warn(`${rel} : titre ${title.length} ch → ${title}`);
    if (desc.length > 162) warn(`${rel} : description ${desc.length} ch`);
    if (desc && desc.length < 70) warn(`${rel} : description courte (${desc.length} ch)`);
    if (titles.has(title)) warn(`${rel} : titre dupliqué avec ${titles.get(title)}`);
    if (descs.has(desc)) warn(`${rel} : description dupliquée avec ${descs.get(desc)}`);
    titles.set(title, rel);
    descs.set(desc, rel);
  }

  // JSON-LD : parseable, URLs absolues sur les propriétés de lien.
  for (const m of html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)) {
    try {
      const scan = (o) => {
        for (const [k, v] of Object.entries(o)) {
          if (typeof v === 'object' && v) scan(v);
          else if (
            ['url', 'item', 'logo', 'image'].includes(k) &&
            typeof v === 'string' &&
            !/^https?:/.test(v)
          )
            warn(`${rel} : URL relative dans JSON-LD ${k}=${v}`);
        }
      };
      const j = JSON.parse(m[1]);
      scan(j);
      // Règle Google FAQPage : une Q&A balisée ne doit exister que sur UNE page.
      if (j['@type'] === 'FAQPage') {
        for (const e of j.mainEntity ?? []) {
          if (faqOwner.has(e.name))
            warn(`${rel} : question FAQ balisée aussi sur ${faqOwner.get(e.name)} → ${e.name}`);
          else faqOwner.set(e.name, rel);
        }
      }
    } catch {
      warn(`${rel} : JSON-LD invalide`);
    }
  }

  const h1 = (html.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) warn(`${rel} : ${h1} h1`);
  if (html.includes('fonts.googleapis.com')) warn(`${rel} : référence Google Fonts restante`);
  if (!html.includes('rel="canonical"')) warn(`${rel} : pas de canonical`);
  if (!html.includes('name="viewport"')) warn(`${rel} : pas de viewport`);

  // <img> : alt + dimensions (CLS) + lazy interdit s'il porte fetchpriority high.
  for (const img of html.matchAll(/<img\s[^>]*>/g)) {
    const tag = img[0];
    if (!/\salt="/.test(tag)) warn(`${rel} : <img> sans alt`);
    if (!/\swidth="/.test(tag) || !/\sheight="/.test(tag)) warn(`${rel} : <img> sans width/height`);
    if (/fetchpriority="high"/.test(tag) && /loading="lazy"/.test(tag))
      warn(`${rel} : LCP en lazy`);
  }

  // Liens internes : la cible doit exister dans dist/.
  for (const a of html.matchAll(/href="(\/[^"#?]*)["#?]/g)) {
    const href = decodeURI(a[1]);
    const asFile = path.join(DIST, href);
    const asDir = path.join(DIST, href, 'index.html');
    const asHtml = path.join(DIST, href.replace(/\/$/, '') + '.html');
    if (![asFile, asDir, asHtml].some((f) => fs.existsSync(f) && fs.statSync(f).isFile()))
      warn(`${rel} : lien interne cassé ${href}`);
  }
}

console.log(
  issues
    ? `${issues} anomalie(s) sur ${pages.length} pages`
    : `✓ 0 anomalie — ${pages.length} pages auditées`,
);
process.exit(issues ? 1 : 0);
