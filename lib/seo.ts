import type { Metadata } from "next";

import { SITE } from "@/lib/site";

/**
 * Search and sharing metadata, built one way for every page.
 *
 * The reason this exists is a Next.js rule that is easy to trip over:
 * metadata from a layout and a page is merged SHALLOWLY. A page that sets
 * `openGraph` at all replaces the root layout's whole `openGraph` object —
 * so a page that only meant to change its title silently loses the site
 * name and locale, and a page that sets nothing inherits the HOMEPAGE's
 * og:url and og:title. /blog was doing exactly that: every share of the
 * blog index claimed to be the homepage.
 *
 * `pageMetadata` always returns the full set, so no page can end up with
 * half of it.
 */

/** The canonical origin, without a trailing slash. Overridable for a
 *  staging deploy; production is always nebkern.com. */
export const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(
  /\/$/,
  "",
);

/** Turns a site path into the absolute URL structured data requires —
 *  JSON-LD is not resolved against `metadataBase`, so relative URLs in it
 *  are simply wrong. */
export function absoluteUrl(path = "/"): string {
  if (/^https?:\/\//.test(path)) return path;
  if (path === "/" || path === "") return `${SITE_URL}/`;
  return `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`;
}

/**
 * Stable identifiers for the two site-wide entities. Every page's
 * structured data points at these instead of re-describing the company,
 * which is what lets a crawler join them into one graph.
 */
export const ORGANIZATION_ID = `${SITE_URL}/#organization`;
export const WEBSITE_ID = `${SITE_URL}/#website`;

/** One page's metadata, complete. `title` feeds the root template
 *  ("About the company — Nebkern Technology"); `shareTitle` is what a
 *  link preview shows, and defaults to the same full string. */
export function pageMetadata({
  title,
  description,
  path,
  shareTitle,
}: {
  title: string;
  description: string;
  path: string;
  shareTitle?: string;
}): Metadata {
  const share = shareTitle ?? `${title} — ${SITE.name}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: {
      type: "website",
      siteName: SITE.shortName,
      locale: "en_IN",
      url: path,
      title: share,
      description,
    },
    twitter: {
      card: "summary_large_image",
      title: share,
      description,
    },
  };
}

export type Crumb = { name: string; path: string };

/** BreadcrumbList for the trail a page shows. Google uses it in place of
 *  the raw URL on the result line. */
export function breadcrumbJsonLd(crumbs: Crumb[]) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: crumbs.map((crumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: crumb.name,
      item: absoluteUrl(crumb.path),
    })),
  };
}

/** The page itself, typed as precisely as schema.org allows — `AboutPage`
 *  and `ContactPage` exist for a reason — and tied back to the site and
 *  the company by `@id`. */
export function webPageJsonLd({
  type = "WebPage",
  name,
  description,
  path,
}: {
  type?: "WebPage" | "AboutPage" | "ContactPage" | "CollectionPage";
  name: string;
  description: string;
  path: string;
}) {
  const url = absoluteUrl(path);
  return {
    "@context": "https://schema.org",
    "@type": type,
    "@id": `${url}#webpage`,
    url,
    name,
    description,
    inLanguage: "en-IN",
    isPartOf: { "@id": WEBSITE_ID },
    about: { "@id": ORGANIZATION_ID },
  };
}
