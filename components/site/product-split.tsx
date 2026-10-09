import Image from "next/image";
import Link from "next/link";
import type { CSSProperties } from "react";

import { PRODUCTS } from "@/lib/products";

/**
 * Two products, side by side on one white card, straddling the seam
 * between the hero and the section below it.
 *
 * The card hangs past the bottom of its own band with a negative margin
 * rather than being painted onto a two-tone background. A split
 * background would have to name the colour of whatever section follows
 * — the colour would then be wrong the first time the page is
 * reordered. The overlap costs the section below 5rem of its top
 * padding, which `MayaSpotlight` has (py-20 / sm:py-24) with room left.
 *
 * Copy rules, same as everywhere else on this site: the headline and the
 * line under it come from the catalogue, so nothing here claims anything
 * lib/products.ts does not already say. Vichento has not shipped, and
 * its panel says so in words rather than relying on a badge.
 */

type Panel = {
  slug: string;
  /** The small pill in the corner. What the thing IS, in two words. */
  label: string;
  headline: string;
  blurb: string;
  cta: string;
  /** Where the button goes. The product's own site where it has one,
   *  and its entry on /products where it does not — never a repository:
   *  source code is not a product somebody can use. */
  href: string;
};

const PANELS: Panel[] = [
  {
    slug: "instant",
    label: "Shared inbox",
    headline: "Sales and support on one WhatsApp number",
    blurb:
      "A shared team inbox on the official WhatsApp Business API, with contacts, pipelines and campaigns attached.",
    cta: "Visit Instant",
    href: "https://instant.nebkern.com",
  },
  {
    slug: "vichento",
    label: "Read & write",
    headline: "A place to read and write",
    blurb:
      "In development: a reading and writing platform for long-form pieces — somewhere to publish human stories and ideas, and somewhere to read them.",
    cta: "What it is",
    href: "/products#vichento",
  },
];

function Arrow() {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3.5 w-3.5"
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

function PanelCard({ panel }: { panel: Panel }) {
  const product = PRODUCTS.find((p) => p.slug === panel.slug);
  if (!product) return null;

  // External products keep a plain anchor; everything inside this site
  // goes through `Link`. The same split the rest of the site makes.
  const Anchor = panel.href.startsWith("http") ? "a" : Link;

  return (
    <div
      className="relative flex flex-col items-center rounded-lg px-6 pt-14 pb-10 text-center sm:px-8 sm:pt-16 sm:pb-12"
      style={
        {
          "--hue": product.hue,
          // Strongest at the top left, gone by the bottom right, so the
          // two panels read as tinted glass rather than as two flat
          // colour fields with a white line between them.
          background:
            "linear-gradient(135deg, color-mix(in oklab, var(--hue) 18%, var(--surface)), var(--surface) 80%)",
        } as CSSProperties
      }
    >
      <span
        className="absolute top-5 left-5 rounded-sm px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-soft uppercase"
        style={{
          background: "color-mix(in oklab, var(--hue) 16%, var(--surface))",
        }}
      >
        {panel.label}
      </span>

      {product.logo ? (
        <Image
          src={product.logo.src}
          // The product's name, because the lockup is the only place it
          // appears in this panel — the headline is a sentence about it,
          // not the name itself.
          alt={product.name}
          width={Math.round(28 * (product.logo.width / product.logo.height))}
          height={28}
          className="h-7 w-auto"
        />
      ) : (
        <span className="display text-xl font-semibold text-ink">
          {product.name}
        </span>
      )}

      <h2 className="display mt-6 max-w-sm text-[clamp(1.25rem,2.1vw,1.625rem)] font-medium text-ink text-balance">
        {panel.headline}
      </h2>

      <p className="mt-3 max-w-md text-sm leading-relaxed text-muted text-pretty">
        {panel.blurb}
      </p>

      {/* Outlined and in the product's own colour, not the site's
          indigo: the panel is already that product's, and an indigo
          button in it would be the parent brand talking over it. */}
      <Anchor
        href={panel.href}
        className="mt-7 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.75rem] font-semibold tracking-[0.08em] uppercase transition-colors"
        style={{
          color: "var(--hue)",
          borderColor: "color-mix(in oklab, var(--hue) 45%, transparent)",
        }}
      >
        {panel.cta}
        <Arrow />
      </Anchor>
    </div>
  );
}

export function ProductSplit() {
  return (
    <section aria-label="Products" className="bg-[#F8F9FB]">
      <div className="mx-auto max-w-6xl px-5 sm:px-8">
        {/* `-mb-20` is the overlap, and `z-10` keeps the card above the
            section it hangs into. The 2px padding is what draws the
            division: a 4px white gutter (6px from `sm`) shows between
            the two panels and around them, so there is no border to
            keep in step with the tints.

            12px outside, 8px on each panel — near enough to concentric
            at a gutter this thin, and deliberately tighter than the
            20px/12px it started at. */}
        <div className="relative z-10 -mb-16 rounded-xl bg-surface p-1 shadow-[0_1px_2px_rgb(0_0_0/0.04),0_18px_40px_-18px_rgb(0_0_0/0.18)] sm:-mb-20 sm:p-1.5">
          <div className="grid gap-1 sm:grid-cols-2 sm:gap-1.5">
            {PANELS.map((panel) => (
              <PanelCard key={panel.slug} panel={panel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
