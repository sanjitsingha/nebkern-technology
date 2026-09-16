import { renderOgImage } from "@/lib/og";
import { SITE } from "@/lib/site";

/**
 * The card every shared link falls back to — the homepage's, and any
 * route without an `opengraph-image` of its own. Drawn by the shared
 * renderer in lib/og.tsx, so every page's card is the same design.
 */
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ eyebrow: "Software company", title: SITE.tagline });
}
