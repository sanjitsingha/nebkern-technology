import Image from "next/image";

/**
 * The full-bleed photograph the panel below rides up onto.
 *
 * Back to being the picture and nothing else. It carried the values
 * heading over an indigo duotone wash until that heading moved down into
 * the panel; with no words left on the band, the wash had nothing to
 * keep legible and was only tinting a photograph. The heading, the rule
 * under it, the radial pool of shadow that held it readable against the
 * sunlit windows and both passes of indigo all went with it.
 *
 * Greyscale stays. It was the first half of the duotone, but it is also
 * the right treatment on its own here: the panel in front is the only
 * thing in this part of the page that should carry colour.
 *
 * Same file as before — `/banner.jpg`, unchanged.
 */

/**
 * Shorter than it was, which is a consequence of the heading leaving
 * rather than a separate decision: at 420–620px the band was sized to
 * hold a line of display type clear of the panel overlapping its bottom.
 * What has to show now is only the strip above the panel and the strip
 * below it, so the height comes down to match.
 *
 * Still fluid, for the original reason — the crop is a function of
 * width, and one fixed number is right at exactly one viewport.
 */
const BANNER_H = "clamp(260px, 26vw, 420px)";

export function Banner() {
  return (
    // A plain div now, not a `<section>`: a section earns its place by
    // being labelled, and this one's label was the heading that left.
    // `relative` because `fill` positions against the nearest positioned
    // ancestor; `bg-panel` is what occupies the band while the image is
    // still loading, so it never flashes white.
    <div
      className="relative w-full overflow-hidden bg-panel"
      style={{ height: BANNER_H }}
    >
      <Image
        src="/banner.jpg"
        alt="A software team at work in an open-plan office — pairing at desks, talking through a screen at a standing whiteboard."
        fill
        sizes="100vw"
        className="object-cover grayscale contrast-[1.08]"
      />
    </div>
  );
}
