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
  const title = input.title ? `${input.title} — ${site.name}` : `${site.name} — ${site.tagline}`;
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

/** JSON-LD Organization pour la home / les pages clés. */
export function organizationJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    logo: abs('/favicon.svg'),
  };
}

/** Commerce local — coordonnées réelles (home / contact). */
export function localBusinessJsonLd(): JsonLd {
  return {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
    telephone: site.phone,
    address: {
      '@type': 'PostalAddress',
      streetAddress: site.address[0],
      addressLocality: site.address[1],
      addressCountry: 'FR',
    },
    areaServed: 'FR',
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
