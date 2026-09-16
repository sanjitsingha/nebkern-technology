import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

/**
 * The link-preview card, drawn once and titled per page.
 *
 * Every route's `opengraph-image.tsx` calls this with its own eyebrow
 * and headline, so a shared /about link previews as "About the company",
 * not as the homepage tagline. Generated rather than checked in so it
 * cannot drift from the copy or the palette.
 *
 * Satori renders this, and it has no cascade, no default font stack and
 * no oklch: every style is stated on its own element, every multi-child
 * box says `display: flex`, and the colours are sRGB equivalents of the
 * tokens in globals.css.
 */
export const OG_SIZE = { width: 1200, height: 630 };

const INK = "#1c1f2b";
const PAPER = "#fafafc";
const ACCENT = "#3b46d4";
const MUTED = "#71768c";
const LINE = "#e3e5ec";

/** The nebkern mark — a square kernel inside a tilted orbit — built from
 *  boxes, since Satori's SVG support does not cover a rotated ellipse. */
function Mark() {
  return (
    <div
      style={{
        position: "relative",
        width: 52,
        height: 52,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 56,
          height: 24,
          border: `3px solid ${ACCENT}`,
          borderRadius: "50%",
          opacity: 0.6,
          transform: "rotate(-32deg)",
        }}
      />
      <div style={{ width: 15, height: 15, background: ACCENT }} />
    </div>
  );
}

/**
 * The square brand tile — the favicon's indigo square with the white mark
 * — at any pixel size. Used for the Apple touch icon and for /logo.png,
 * the raster logo the Organization structured data points at.
 *
 * Proportions are app/icon.svg's, scaled from its 32-unit grid, so the
 * tile and the favicon are the same drawing.
 */
export function renderBrandTile(px: number) {
  const s = px / 32;
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "#3356d2",
        position: "relative",
      }}
    >
      <div
        style={{
          position: "absolute",
          width: 22.4 * s,
          height: 9.8 * s,
          border: `${2.4 * s}px solid #ffffff`,
          borderRadius: "50%",
          opacity: 0.75,
          transform: "rotate(-32deg)",
        }}
      />
      <div style={{ width: 7 * s, height: 7 * s, background: "#ffffff" }} />
    </div>,
    { width: px, height: px },
  );
}

export function renderOgImage({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) {
  // Post titles are written by people, and some run long. The card has
  // room for about three lines at 66px; past that the type steps down so
  // a long title still fits, and anything genuinely enormous is cut with
  // an ellipsis rather than running off the bottom of the image.
  const text = title.length > 120 ? `${title.slice(0, 117).trimEnd()}…` : title;
  const fontSize = text.length > 80 ? 48 : text.length > 50 ? 56 : 66;

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        background: PAPER,
        padding: "64px 80px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        <Mark />
        <div
          style={{
            fontSize: 34,
            fontWeight: 600,
            letterSpacing: "-0.02em",
            color: INK,
          }}
        >
          nebkern
        </div>
      </div>

      <div style={{ display: "flex", flexDirection: "column" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 14,
            fontSize: 24,
            fontWeight: 600,
            letterSpacing: "0.14em",
            textTransform: "uppercase",
            color: ACCENT,
          }}
        >
          <div style={{ width: 10, height: 10, background: ACCENT }} />
          {eyebrow}
        </div>
        <div
          style={{
            display: "flex",
            marginTop: 22,
            maxWidth: 1000,
            fontSize,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.08,
            color: INK,
          }}
        >
          {text}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          borderTop: `2px solid ${LINE}`,
          paddingTop: 26,
          fontSize: 24,
          color: MUTED,
        }}
      >
        <div style={{ display: "flex" }}>
          {`${SITE.name} · ${SITE.address}`}
        </div>
        <div style={{ display: "flex", color: ACCENT }}>nebkern.com</div>
      </div>
    </div>,
    OG_SIZE,
  );
}
