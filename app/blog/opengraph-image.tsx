import { renderOgImage } from "@/lib/og";

/**
 * The /blog index's share card. Posts do not inherit it — each post's
 * metadata sets its own image (its cover, or its own title card) — so
 * this covers the index alone.
 */
export const alt = "The Nebkern blog";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({
    eyebrow: "Blog",
    title: "Notes on building software for Indian businesses.",
  });
}
