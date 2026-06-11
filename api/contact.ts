/**
 * POST /api/contact — réception des formulaires du site (FormBlock + /contact).
 *
 * Fonction serverless Vercel (répertoire `api/` racine — coexiste avec le build
 * Astro statique, aucun adapter requis). Envoie le lead par email via Brevo —
 * même compte et mêmes noms de variables que far (`D:\Zi\APP\far\src\lib\brevo.ts`).
 *
 * Variables d'environnement (dashboard Vercel, ou `.env` local avec `vercel dev`) :
 *   BREVO_API_KEY_EMAIL        — clé API Brevo email (requise, identique à far)
 *   INTERNAL_EMAIL_RECIPIENT   — destinataire des leads (défaut : bonjour@azelize.com)
 *   BREVO_EMAIL_SENDER_NAME    — nom d'expéditeur (défaut : Azelize)
 *   BREVO_EMAIL_SENDER_ADDRESS — adresse d'expéditeur (défaut : bonjour@azelize.com,
 *                                vérifiée sur le compte Brevo, domaine authentifié)
 *
 * Deux modes de réponse :
 *   - fetch JS (Accept: application/json) → JSON { ok, error? }
 *   - soumission native sans JS → 303 vers /merci (ou retour /contact si erreur)
 *
 * Anti-spam : honeypot (`website`) + rate-limit best-effort par IP (en mémoire,
 * donc par instance — suffisant pour décourager les bots naïfs).
 */

const MAX_LEN = 2000;
const WINDOW_MS = 10 * 60_000;
const MAX_PER_WINDOW = 5;

/** Champs acceptés → libellé dans l'email (l'ordre est celui de l'email).
 *  Union des champs des trois formulaires : FinalCta (nom/metier/tel),
 *  /contact (+ mot) et /devis (+ ville/services/site/objectif). */
const LABELS: Record<string, string> = {
  nom: 'Nom',
  tel: 'Téléphone',
  metier: 'Métier',
  ville: 'Ville',
  services: 'Services souhaités',
  site: 'Site existant',
  objectif: 'Objectif',
  mot: 'Besoin',
};

const ESC: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ESC[c] ?? c);

const hits = new Map<string, number[]>();
function rateLimited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => t > now - WINDOW_MS);
  recent.push(now);
  hits.set(ip, recent);
  return recent.length > MAX_PER_WINDOW;
}

export async function POST(request: Request): Promise<Response> {
  const wantsJson = request.headers.get('accept')?.includes('application/json') ?? false;
  const reply = (status: number, body: Record<string, unknown>) =>
    wantsJson
      ? Response.json(body, { status })
      : Response.redirect(new URL(status < 400 ? '/merci' : '/contact', request.url), 303);

  const data: Record<string, string> = {};
  try {
    const type = request.headers.get('content-type') ?? '';
    if (type.includes('application/json')) {
      Object.assign(data, (await request.json()) as Record<string, string>);
    } else {
      (await request.formData()).forEach((v, k) => {
        if (typeof v === 'string') data[k] = v;
      });
    }
  } catch {
    return reply(400, { ok: false, error: 'invalid_body' });
  }

  // Honeypot rempli → bot. On fait semblant d'accepter, sans rien envoyer.
  if (data.website) return reply(200, { ok: true });

  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  if (rateLimited(ip)) return reply(429, { ok: false, error: 'rate_limited' });

  const clean = (v: unknown) => (typeof v === 'string' ? v.trim().slice(0, MAX_LEN) : '');
  const fields = Object.fromEntries(Object.keys(LABELS).map((k) => [k, clean(data[k])]));
  if (!fields.nom || !fields.tel) return reply(400, { ok: false, error: 'missing_fields' });

  const apiKey = process.env.BREVO_API_KEY_EMAIL;
  if (!apiKey) {
    console.error('api/contact : BREVO_API_KEY_EMAIL manquante');
    return reply(500, { ok: false, error: 'misconfigured' });
  }
  const to = process.env.INTERNAL_EMAIL_RECIPIENT ?? 'bonjour@azelize.com';
  const sender = {
    name: process.env.BREVO_EMAIL_SENDER_NAME ?? 'Azelize',
    email: process.env.BREVO_EMAIL_SENDER_ADDRESS ?? 'bonjour@azelize.com',
  };

  const page = request.headers.get('referer') ?? 'inconnue';
  const present = Object.entries(LABELS).filter(([k]) => fields[k]);
  const html = [
    '<h2 style="font-family:sans-serif;margin:0 0 12px">Nouveau lead via le site</h2>',
    '<table style="font-family:sans-serif;font-size:15px;border-collapse:collapse">',
    ...present.map(
      ([k, label]) =>
        `<tr><td style="padding:4px 16px 4px 0;color:#666;vertical-align:top">${label}</td>` +
        `<td style="padding:4px 0"><strong>${esc(fields[k])}</strong></td></tr>`,
    ),
    '</table>',
    `<p style="font-family:sans-serif;font-size:13px;color:#999;margin-top:16px">Page : ${esc(page)}</p>`,
  ].join('\n');
  const text =
    present.map(([k, label]) => `${label} : ${fields[k]}`).join('\n') + `\n\nPage : ${page}`;

  // Même appel que far (lib/brevo.ts) : POST /v3/smtp/email, header `api-key`,
  // timeout 15 s pour ne pas bloquer la fonction si Brevo ne répond pas.
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15_000);
  let res: Response;
  try {
    res = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST',
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        sender,
        to: [{ email: to }],
        subject: `Nouveau lead Azelize : ${fields.nom}${fields.metier ? ` — ${fields.metier}` : ''}`,
        htmlContent: html,
        textContent: text,
      }),
      signal: controller.signal,
    });
  } catch (err) {
    console.error('api/contact : appel Brevo en échec', err);
    return reply(502, { ok: false, error: 'send_failed' });
  } finally {
    clearTimeout(timeout);
  }

  if (!res.ok) {
    console.error('api/contact : Brevo a répondu', res.status, await res.text());
    return reply(502, { ok: false, error: 'send_failed' });
  }
  return reply(200, { ok: true });
}
