import { ImageResponse } from "next/og";

import { SITE } from "@/lib/site";

/**
 * The card every shared link falls back to.
 *
 * Until now the site declared `openGraph` metadata with no image at
 * all, so a link pasted into WhatsApp or Slack rendered as a bare grey
 * box. This file convention covers every route that does not supply its
 * own, which is all of them except a post with a cover.
 *
 * Generated rather than a checked-in PNG so it cannot drift from the
 * tagline and the palette it is drawn from — the tokens below are the
 * sRGB equivalents of the oklch ones in globals.css, because Satori
 * (which renders this) does not understand oklch.
 */
export const alt = `${SITE.name} — ${SITE.tagline}`;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const INK = "#1c1f2b";
const PAPER = "#fafafc";
const ACCENT = "#3b46d4";
const MUTED = "#71768c";

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: PAPER,
          padding: "72px 80px",
          // Satori has no cascade and no default font stack, so every
          // text style has to be stated on the element that uses it.
          fontFamily: "sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <div style={{ width: 28, height: 28, background: ACCENT }} />
          <div style={{ fontSize: 30, fontWeight: 600, color: INK }}>
            {SITE.name}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            fontSize: 68,
            fontWeight: 600,
            letterSpacing: "-0.03em",
            lineHeight: 1.1,
            color: INK,
            maxWidth: 900,
          }}
        >
          {SITE.tagline}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 26,
            color: MUTED,
          }}
        >
          <div style={{ display: "flex" }}>{SITE.address}</div>
          <div style={{ display: "flex", color: ACCENT }}>nebkern.com</div>
        </div>
      </div>
    ),
    size,
  );
}
