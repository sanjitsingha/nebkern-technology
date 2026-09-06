import type { Metadata, Viewport } from "next";
import { Manrope, JetBrains_Mono } from "next/font/google";
import "./globals.css";

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

const SITE_URL = (process.env.NEXT_PUBLIC_SITE_URL ?? SITE.url).replace(
  /\/$/,
  "",
);

export const metadata: Metadata = {
  // Resolves the relative URLs in the OG tags to absolute ones. Without
  // it Next warns at build and social scrapers receive paths they
  // cannot fetch.
  metadataBase: new URL(SITE_URL),
  title: {
    default: `${SITE.name} — ${SITE.tagline}`,
    template: `%s — ${SITE.name}`,
  },
  description: SITE.description,
  applicationName: SITE.shortName,
  // What Google prints ABOVE the blue title line. Left undeclared it
  // falls back to the bare domain.
  openGraph: {
    siteName: SITE.shortName,
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
    type: "website",
    locale: "en_IN",
    url: `${SITE_URL}/`,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE.name} — ${SITE.tagline}`,
    description: SITE.description,
  },
  alternates: { canonical: `${SITE_URL}/` },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = {
  // One value, because the site is light in every scheme. This is
  // `--paper` in sRGB — keep the two in step if the token moves.
  themeColor: "#fafafc",
};

/**
 * Organization data, so a search engine can tie the domain to a named,
 * registered business rather than guessing. `identifier` carries the
 * Udyam number — the one machine-checkable fact that separates us from
 * a landing page.
 */
const ORGANIZATION_JSONLD = {
  "@context": "https://schema.org",
  "@type": "Organization",
  name: SITE.name,
  alternateName: SITE.shortName,
  url: `${SITE_URL}/`,
  description: SITE.description,
  slogan: SITE.tagline,
  identifier: SITE.udyam,
  email: SITE.email,
  address: {
    "@type": "PostalAddress",
    addressLocality: SITE.city,
    addressRegion: "West Bengal",
    addressCountry: "IN",
  },
  brand: { "@type": "Brand", name: "Instant" },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en-IN"
      className={`${sans.variable} ${mono.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col font-sans">
        <script
          type="application/ld+json"
          // Serialised, not interpolated — the values are ours, but a
          // stringify keeps a stray quote from ever breaking the tag.
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(ORGANIZATION_JSONLD),
          }}
        />
        {children}
      </body>
    </html>
  );
}
