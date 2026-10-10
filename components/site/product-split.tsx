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
 * Copy rules, same as everywhere else on this site: the line under each
 * lockup comes from the catalogue, so nothing here claims anything
 * lib/products.ts does not already say. Vichento has not shipped, and
 * its panel says so in words rather than relying on a badge.
 */

type Panel = {
  slug: string;
  /** The small pill in the corner. What the thing IS, in two words. */
  label: string;
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
    blurb:
      "A shared team inbox on the official WhatsApp Business API, with contacts, pipelines and campaigns attached.",
    cta: "Visit Instant",
    href: "https://instant.nebkern.com",
  },
  {
    slug: "vichento",
    label: "Read & write",
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
      // White, with no background of its own — the wrapper's surface
      // shows through. The tinted gradient that used to be here is gone;
      // `--hue` stays set because the label chip and the link below
      // still carry the product's colour, which is now the only place
      // either product is distinguished by anything but its words.
      //
      // Shorter: the top figure is the one that cannot come down much,
      // because the label sits inside it absolutely and the lockup has
      // to clear it. Moving the chip to `top-4` bought the 8px that let
      // the padding go from 56/40 to 48/32, and the gaps between lockup,
      // headline, blurb and link each gave up a step as well.
      className="relative flex flex-col items-center rounded-lg px-6 pt-12 pb-8 text-center sm:px-8 sm:pt-14 sm:pb-10"
      style={{ "--hue": product.hue } as CSSProperties}
    >
      <span
        className="absolute top-4 left-4 rounded-sm px-2.5 py-1 text-[0.6875rem] font-semibold tracking-[0.12em] text-ink-soft uppercase"
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

      {/* The headline that sat here is gone, so the blurb follows the
          lockup directly and takes the gap the headline used to open.
          Nothing else in the panel was a heading, which is why the
          section carries its own `aria-label` rather than being named by
          one. */}
      <p className="mt-5 max-w-md text-sm leading-relaxed text-muted text-pretty">
        {panel.blurb}
      </p>

      {/* Outlined and in the product's own colour, not the site's
          indigo: the panel is already that product's, and an indigo
          button in it would be the parent brand talking over it. */}
      <Anchor
        href={panel.href}
        className="mt-6 inline-flex items-center gap-2 rounded-full border px-5 py-2.5 text-[0.75rem] font-semibold tracking-[0.08em] uppercase transition-colors"
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
        {/* `-mb-20` is the overlap below, and `z-10` keeps the card above
            both the section it hangs into and the hero it now reaches
            back into.

            The gutter is gone. A 2px padding used to leave a 4px white
            channel between the two panels and around them, which worked
            precisely because the panels were tinted — white between two
            colours is a division, white between two whites is nothing.
            So the division is a rule now: one white card with a border
            and a line down the middle, which becomes a line ACROSS the
            middle on a phone, where the two panels stack.

            Hard shadow, matching the cards and the panel further down
            the page: 4px across and down, zero blur, black at 10%. It
            replaces a two-part soft one that was floating this card; at
            this size that read as a dialog rather than as part of the
            page.

            `-mt-12` is the same trick upwards: this section has no top
            padding, so the card began exactly where the hero ended, and
            a negative top margin lifts it into the hero's own box. No
            seam shows, because this section and the hero are both
            #F8F9FB.

            Capped by the hero's bottom padding, which is 48px and 64px
            from `sm`. Lifting the card by more than that would put it
            against the hero's button on a viewport short enough that the
            copy, not the `min-h` calc, sets the hero's height — so these
            two numbers stay just under those two. */}
        <div className="relative z-10 -mt-8 -mb-16 overflow-hidden rounded-xl border border-line bg-surface shadow-[4px_4px_0_0_rgb(0_0_0/0.1)] sm:-mt-12 sm:-mb-20">
          <div className="grid divide-y divide-line sm:grid-cols-2 sm:divide-x sm:divide-y-0">
            {PANELS.map((panel) => (
              <PanelCard key={panel.slug} panel={panel} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
