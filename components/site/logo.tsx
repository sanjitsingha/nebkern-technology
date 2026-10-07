import Image from "next/image";

import { SITE } from "@/lib/site";

/**
 * The nebkern mark.
 *
 * The name is neb + kern — nebula and kernel — so the mark is exactly
 * that and nothing else: a solid core with an orbit tilted off it. Drawn
 * in `currentColor` at a 32-unit grid, so one component serves the ink
 * nav, the ink footer and any product colour it is dropped into without
 * a second asset.
 *
 * It stays, now that a real logotype exists, because the logotype cannot
 * go everywhere this can. The footer sets its mark on the dark panel,
 * where the lockup's black sub-line would disappear; and the favicon,
 * the Apple touch icon and the share tile are all square, which a 3.3:1
 * lockup cannot fill without being shrunk past reading or cropped. Those
 * want a square logo file of their own — see the note on `Logo`.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
      className={className}
    >
      {/* The orbit. Tilted rather than concentric — a centred ring
          around a centred square reads as a loading spinner. */}
      <ellipse
        cx="16"
        cy="16"
        rx="14"
        ry="6.1"
        transform="rotate(-32 16 16)"
        stroke="currentColor"
        strokeWidth="2.25"
        opacity="0.6"
      />
      {/* The kernel. */}
      <rect x="11.5" y="11.5" width="9" height="9" fill="currentColor" />
    </svg>
  );
}

/**
 * The company lockup, as supplied.
 *
 * This replaces a mark-plus-typeset-wordmark that stood in while there
 * was no logotype. The file is the real one: "nebkern" over
 * "TECHNOLOGY", 2974×890.
 *
 * Height, not width, is what is set — the intrinsic size is passed so
 * the optimizer knows the ratio, and `w-auto` lets the width follow. At
 * 40px in an 80px bar the wordmark reads comfortably; the sub-line under
 * it is only about five pixels tall, which is the known cost of using a
 * two-line lockup at navigation scale rather than a wordmark-only cut.
 *
 * `alt` is the company name rather than "logo": a screen reader
 * announces this as the link home, and "logo" describes the picture
 * instead of where it goes.
 */
export function Logo({ className }: { className?: string }) {
  return (
    <Image
      src="/nebkern-logo.png"
      alt={SITE.name}
      width={2974}
      height={890}
      // Above the fold on every page, and the one image whose late
      // arrival would be noticed as the page settling.
      priority
      className={`h-10 w-auto ${className ?? ""}`}
    />
  );
}
