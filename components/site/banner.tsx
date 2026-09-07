import Image from "next/image";

/**
 * A full-bleed photograph, edge to edge, between two sections.
 *
 * No container, no copy, no `max-w-6xl` — every other band on this page
 * is text inside the 6xl column, so the one thing this can do that they
 * cannot is run the whole width of the viewport. That break is the
 * whole point of it.
 *
 * The panel below overlaps it by design; see `OVERLAP` in
 * `questions.tsx`. That overlap is measured from this band's bottom
 * edge, so it follows the height set here rather than needing its own
 * adjustment whenever this changes.
 */

/**
 * Fluid rather than one fixed number, because the crop is a function of
 * width and a single value can only be right at a single viewport.
 *
 * The source is 1500 × 583 (≈2.57:1), so at full bleed its uncropped
 * height is 39vw. The 34vw term tracks a little under that; the flat
 * 80px comes off the whole expression, so the band loses exactly that
 * much at every width rather than at one breakpoint.
 *
 * Net effect: a 300px floor on a phone, ~410px on a laptop, 480px
 * ceiling on a large monitor. The floor is the number that matters —
 * below it the band stops being a photograph and becomes a texture.
 */
const BANNER_H = "calc(clamp(380px, 34vw, 560px) - 80px)";

export function Banner() {
  return (
    // `relative` because `fill` positions against the nearest
    // positioned ancestor; `bg-surface-2` is what shows in the band's
    // own space while the image is still loading.
    <section
      className="relative w-full overflow-hidden bg-surface-2"
      style={{ height: BANNER_H }}
    >
      <Image
        src="/banner.jpg"
        alt="A software team at work in an open-plan office — pairing at desks, talking through a screen at a standing whiteboard."
        fill
        sizes="100vw"
        className="object-cover"
      />
    </section>
  );
}
