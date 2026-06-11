import { site } from '@data/site';

export interface SeoInput {
  title?: string;
  description?: string;
  /** Chemin de la page courante (Astro.url.pathname) pour le canonical. */
  pathname?: string;
  /** Image OG absolue ou relative à la racine. */
  image?: string;
  /** 'website' (défaut) ou 'article'. */
  type?: 'website' | 'article';
  noindex?: boolean;
}

export interface SeoResolved {
  title: string;
  description: string;
  canonical: string;
  image: string;
  type: 'website' | 'article';
  noindex: boolean;
}

/** Compose les métadonnées SEO finales en s'appuyant sur les défauts du site. */
export function resolveSeo(input: SeoInput = {}): SeoResolved {
  // Garde-fou anti « — Azelize — Azelize » : pas de suffixe marque si le titre
  // la contient déjà (ex. « Bonjour, Azelize »).
  const title = input.title
    ? input.title.includes(site.name)
      ? input.title
      : `${input.title} — ${site.name}`
    : `${site.name} — ${site.tagline}`;
  const description = input.description ?? site.description;
  const canonical = new URL(input.pathname ?? '/', site.url).toString();
  const image = new URL(input.image ?? site.defaultOgImage, site.url).toString();
  return {
    title,
    description,
    canonical,
    image,
    type: input.type ?? 'website',
    noindex: input.noindex ?? false,
  };
}

type JsonLd = Record<string, unknown>;

/** Résout un chemin relatif en URL absolue (requis par schema.org). */
const abs = (path: string) => new URL(path, site.url).toString();

/**
 * JSON-LD WebSite — homepage uniquement (règle Google « site names » : le nom de
 * site est lu sur la home ; ne pas l'émettre ailleurs).
 */
export function websiteJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': abs('/#website'),
    name: site.name,
    url: site.url,
    inLanguage: site.lang,
    publisher: { '@id': abs('/#organization') },
  };
}

/** JSON-LD Organization pour la home / les pages clés. */
export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    // @id partagé avec ProfessionalService → Google fusionne les deux nœuds homonymes.
    '@id': abs('/#organization'),
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    // PNG raster ≥ 112×112 (exigence logo Google) — généré depuis favicon.svg.
    logo: abs('/icons/icon-512.png'),
    // TODO sameAs : ajouter ici les URLs de profils réels (fiche Google Business,
    // réseaux sociaux) dès qu'elles existent dans site.ts. Ne pas inventer d'URLs.
  };
}

/** Commerce local — coordonnées réelles (home / contact). */
export function localBusinessJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    // Même @id que Organization : une seule entité aux yeux des moteurs.
    '@id': abs('/#organization'),
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: site.phoneInternational,
    image: abs(site.defaultOgImage),
    address: { '@type': 'PostalAddress', ...site.postalAddress },
    areaServed: 'FR',
    // TODO geo / openingHoursSpecification : à ajouter quand les coordonnées GPS
    // et horaires réels seront confirmés. Ne pas inventer de données.
  };
}

/** Fil d'Ariane structuré (à coupler avec le composant Breadcrumbs visible). */
export function breadcrumbJsonLd(items: { name: string; url: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((it, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: it.name,
      item: abs(it.url),
    })),
  };
}

interface ArticleInput {
  title: string;
  description: string;
  url: string;
  date?: Date;
  updated?: Date;
  image?: string;
}

/** Article de blog. */
export function articleJsonLd(a: ArticleInput): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: a.title,
    description: a.description,
    url: abs(a.url),
    ...(a.date && { datePublished: a.date.toISOString() }),
    ...(a.updated && { dateModified: a.updated.toISOString() }),
    ...(a.image && { image: abs(a.image) }),
    author: { '@type': 'Organization', name: site.name },
    publisher: { '@type': 'Organization', name: site.name },
  };
}

/**
 * FAQPage — éligible aux rich results Google. À émettre dès qu'une page rend une
 * section FAQ visible (cf. blocs `faq`). Le contenu doit être identique à
 * l'affichage (règle Google), d'où la dérivation directe depuis les sections.
 */
export function faqJsonLd(items: { q: string; a: string }[]): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((it) => ({
      '@type': 'Question',
      name: it.q,
      acceptedAnswer: { '@type': 'Answer', text: it.a },
    })),
  };
}

/**
 * DefinedTermSet — glossaire structuré (un DefinedTerm par entrée). Cible de choix
 * pour les moteurs de réponse (« c'est quoi … »). Le contenu doit être identique à
 * l'affichage, d'où la dérivation directe depuis la liste de termes rendue.
 */
export function definedTermSetJsonLd(set: {
  name: string;
  description: string;
  url: string;
  terms: { term: string; def: string }[];
}): JsonLd {
  const id = abs(`${set.url}#glossaire`);
  return {
    '@context': 'https://schema.org',
    '@type': 'DefinedTermSet',
    '@id': id,
    name: set.name,
    description: set.description,
    url: abs(set.url),
    hasDefinedTerm: set.terms.map((t) => ({
      '@type': 'DefinedTerm',
      name: t.term,
      description: t.def,
      inDefinedTermSet: id,
    })),
  };
}

/** Prestation = Service rendu par l'organisation. */
export function serviceJsonLd(s: { name: string; description: string; url: string }): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: s.name,
    description: s.description,
    url: abs(s.url),
    provider: { '@type': 'Organization', name: site.name },
    areaServed: 'FR',
  };
}

/** Réalisation = œuvre / étude de cas. */
export function creativeWorkJsonLd(w: {
  name: string;
  description: string;
  url: string;
  date?: Date;
}): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: w.name,
    description: w.description,
    url: abs(w.url),
    ...(w.date && { dateCreated: w.date.toISOString() }),
    creator: { '@type': 'Organization', name: site.name },
  };
}
