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

/** JSON-LD Organization pour la home / les pages clés. */
export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: site.name,
    url: site.url,
    description: site.description,
    email: site.email,
  };
}
