import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import Script from "next/script";
import "./globals.css";

import { PRODUCTS } from "@/lib/products";
import {
  FEED_ALTERNATE,
  ORGANIZATION_ID,
  SITE_URL,
  WEBSITE_ID,
} from "@/lib/seo";
import { SITE } from "@/lib/site";

// Manrope, and deliberately NOT Instant's Inter — the parent brand now
// differs from the product in voice as well as colour.
//
// No `weight` array on purpose. Manrope is a variable font with a 200–800
// axis, so omitting weight ships ONE file that covers every weight
// continuously; listing weights instead pins a separate static file per
// value, which is more bytes for strictly less range. Everything from
// `font-light` to `font-extrabold` is already available.
const sans = Manrope({
  variable: "--font-sans-family",
  subsets: ["latin"],
  display: "swap",
});

// Used for the registration number, the region and the other
// verifiable particulars. Setting them in mono is not decoration: it
// signals "this is an identifier, check it" rather than "this is copy".
const mono = JetBrains_Mono({
  variable: "--font-mono-family",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  // Resolves the relative URLs in the OG tags to absolute ones. Without
  // it Next warns at build and social scrapers receive paths they
  // cannot fetch.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.summary,
  applicationName: SITE.shortName,
  authors: [{ name: SITE.name, url: `${SITE_URL}/` }],
  creator: SITE.name,
  publisher: SITE.name,
  // What Google prints ABOVE the blue title line. Left undeclared it
  // falls back to the bare domain.
  openGraph: {
    siteName: SITE.shortName,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.summary,
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.summary,
  },
  // The homepage's canonical. Every other page sets its own through
  // `pageMetadata` in lib/seo.ts — a page that did not would inherit this
  // one and tell crawlers it was a duplicate of the homepage.
  alternates: { canonical: `${SITE_URL}/`, types: FEED_ALTERNATE },
  robots: {
    index: true,
    follow: true,
    // Allows full-size image previews and unlimited snippet length in
    // results. Google's defaults are more conservative than a company
    // site has any reason to be.
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  formatDetection: { telephone: false, address: false, email: false },
  /**
   * Trustpilot proves domain ownership by reading a meta tag from the
   * homepage. `verification.other` renders it as
   * `<meta name="…" content="…">`, which is the shape they look for.
   *
   * Named a ONE-TIME id by Trustpilot: it is checked once and then
   * spent. Safe to delete once the domain shows verified, and worth
   * doing — a stale verification tag is a claim nobody is checking any
   * more.
   */
  verification: {
    other: {
      "trustpilot-one-time-domain-verification-id":
        "97f2998d-b27d-4a13-8162-68741b649af7",
    },
  },
};

export const viewport: Viewport = {
  // One value, because the site is light in every scheme. This is
  // `--paper` in sRGB — keep the two in step if the token moves.
  themeColor: "#fafafc",
};

/**
 * The company and the website, as one linked graph.
 *
 * Every page's own structured data points back at these two by `@id`
 * rather than describing the company again, so a crawler sees one
 * organisation across the whole domain. `identifier` carries the Udyam
 * number — the one machine-checkable fact that separates a registered
 * business from a landing page — and `logo` is a 512px PNG, above the
 * 112px minimum Google asks for.
 */
const SITE_JSONLD = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      "@id": ORGANIZATION_ID,
      name: SITE.name,
      alternateName: SITE.shortName,
      url: `${SITE_URL}/`,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/logo.png`,
        width: 512,
        height: 512,
      },
      description: SITE.description,
      slogan: SITE.tagline,
      email: SITE.email,
      identifier: {
        "@type": "PropertyValue",
        propertyID: "Udyam registration number",
        value: SITE.udyam,
      },
      address: {
        "@type": "PostalAddress",
        addressLocality: SITE.city,
        addressRegion: "West Bengal",
        addressCountry: "IN",
      },
      areaServed: { "@type": "Country", name: "India" },
      contactPoint: {
        "@type": "ContactPoint",
        contactType: "customer support",
        email: SITE.email,
        areaServed: "IN",
        availableLanguage: "English",
      },
      brand: PRODUCTS.filter((p) => p.href).map((p) => ({
        "@type": "Brand",
        name: p.name,
      })),
    },
    {
      "@type": "WebSite",
      "@id": WEBSITE_ID,
      url: `${SITE_URL}/`,
      name: SITE.name,
      alternateName: SITE.shortName,
      description: SITE.description,
      inLanguage: "en-IN",
      publisher: { "@id": ORGANIZATION_ID },
    },
  ],
};

/** The GA4 property for nebkern.com. Public by nature — it ships in the
 *  page source on every site that measures anything — so it sits here
 *  rather than in an environment variable nobody could set without a
 *  redeploy anyway. */
const GA_ID = "G-CTJV1F5QR7";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <noscript>
          {/* The reveal is JS-driven, so with JS off nothing would ever
              clear the opacity. Everything stays visible instead. */}
          <style
            dangerouslySetInnerHTML={{
              __html: ".reveal-up{opacity:1;transform:none}",
            }}
          />
        </noscript>
        <script
          type="application/ld+json"
          // `<` escaped: JSON.stringify does not, and a stray `</script>`
          // in any value would end the tag early.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(SITE_JSONLD).replace(/</g, "\\u003c"),
          }}
        />
        {children}

        {/* Google Analytics 4.

            `next/script` rather than the raw tags: `afterInteractive`
            loads it once the page is usable, so measurement never
            competes with the page's own rendering, and Next keeps it
            to a single load across client-side navigations — a plain
            <script> in the App Router can be re-executed or dropped
            depending on where it lands.

            The second block is `gtag('config')`, which records the
            first page view. Route changes after that are counted by
            GA4's own history listener, so there is nothing to wire up
            per page. */}
        <Script
          src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
          strategy="afterInteractive"
        />
        <Script id="ga4" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', '${GA_ID}');`}
        </Script>
      </body>
    </html>
  );
}
