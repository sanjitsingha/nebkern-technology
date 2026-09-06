/**
 * The products Nebkern builds.
 *
 * This is a catalogue on a company site, not a sales page — each entry
 * says what the thing is and where to find it, and the product's own
 * site does the selling. Keep the descriptions factual for that reason:
 * anything that reads as a pitch belongs on the product's site, not
 * here.
 *
 * It is also the single source for the grid, the nav menu and the
 * footer, so a product added here appears in three places at once and
 * cannot appear in only two.
 */

export type ProductStatus = "live" | "beta" | "development";

export interface Product {
  slug: string;
  name: string;
  /** What it is, in the fewest words that are still true. Not a
   *  slogan. Rendered in the mobile nav menu only — the apps slab drops
   *  it and lets the description carry the whole explanation. */
  kicker: string;
  description: string;
  status: ProductStatus;
  /** Overrides the status pill where the plain status would mislead —
   *  a capability that is live, but ships inside another product
   *  rather than standing alone. */
  statusLabel?: string;
  /** oklch, product-owned. Read as `--hue` by everything in the card.
   *  Per-product colour is why the parent palette stayed neutral: six
   *  products in six colours read as a suite, six products in one
   *  colour read as one product. */
  hue: string;
  href?: string;
  /** The product's own lockup, where it has one. It replaces both the
   *  colour chip and the name, because it already carries both — a
   *  chip beside it would put two marks on one card. Remote width and
   *  height are required: the build cannot measure a file it does not
   *  fetch, and without them the layout jumps when the image lands. */
  logo?: { src: string; width: number; height: number };
  /** True for a product you can open on its own. False for one that
   *  ships inside another — the hero's "Explore apps" strip lists only
   *  the standalone ones, while the catalogue below lists everything. */
  isApp: boolean;
}

export const PRODUCTS: Product[] = [
  {
    slug: "instant",
    name: "Instant",
    kicker: "Sales and support on WhatsApp",
    description:
      "A shared team inbox on the official WhatsApp Business API, with contacts, pipelines and campaigns attached.",
    status: "live",
    // Instant's own forest green, matched to its product UI.
    hue: "oklch(0.446 0.127 146)",
    href: "https://instant.nebkern.com",
    logo: {
      src: "https://media.instant.nebkern.com/assets/instant-full-logo-green.webp",
      width: 3514,
      height: 844,
    },
    isApp: true,
  },
  {
    slug: "ask-maya",
    name: "Ask Maya",
    kicker: "AI agent for customer conversations",
    description:
      "Answers customer questions from a business's own catalogue, prices and policies — drafting a reply for an agent or handling the conversation itself.",
    status: "live",
    // Live, but not separately purchasable. The pill says so rather
    // than implying a standalone product that does not exist yet.
    statusLabel: "Ships inside Instant",
    hue: "oklch(0.55 0.19 305)",
    href: "https://instant.nebkern.com/ask-maya",
    isApp: false,
  },
  {
    // TODO(nebkern): the name and status are the user's; the kicker and
    // description are the safest reading of "Flowra CRM" and nothing
    // more. Replace them with the real positioning before launch —
    // guessing at an unreleased product's features in public is exactly
    // the kind of claim that is expensive to walk back.
    slug: "flowra-crm",
    name: "Flowra CRM",
    kicker: "Customer relationship management",
    description:
      "A CRM of our own, on the same platform and Indian infrastructure as everything else we ship.",
    status: "development",
    // Warm amber — clear of Instant's green, Ask Maya's violet and the
    // indigo the parent brand uses.
    hue: "oklch(0.615 0.152 52)",
    isApp: true,
  },
];

export const STATUS_LABEL: Record<ProductStatus, string> = {
  live: "Live",
  beta: "In beta",
  development: "Coming soon",
};
