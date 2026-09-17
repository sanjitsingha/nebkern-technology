import Image from "next/image";

/**
 * The full-bleed photograph between the slider and the values panel —
 * now washed in the brand indigo, carrying the values heading.
 *
 * It used to be the picture alone, with the heading sitting inside the
 * white panel below. The heading moved up here so the band introduces
 * the values instead of merely separating them from what came before,
 * which also gives the one photograph on the site something to say.
 *
 * No container and no `max-w-6xl`: every other band on this page is text
 * inside the 6xl column, so running the whole width of the viewport is
 * the one thing this can do that they cannot.
 *
 * The panel below overlaps this band — see `OVERLAP` in values.tsx — so
 * the heading is held clear of the bottom by the same amount.
 */

/**
 * Fluid rather than one fixed number, because the crop is a function of
 * width and a single value can only be right at a single viewport.
 *
 * Taller than it was (it was ~300–480px): the band now holds a heading
 * as well as a picture, and the panel below eats the bottom of it.
 * Floor 420px on a phone, ~530px on a laptop, 620px ceiling on a large
 * monitor.
 */
const BANNER_H = "clamp(420px, 38vw, 620px)";

/** Kept in step with `OVERLAP` in values.tsx — the panel rides up onto
 *  this band by that much, so the heading is padded off the bottom by
 *  the same amount and never ends up behind it. */
const OVERLAP = "clamp(56px, 7vw, 112px)";

export function Banner() {
  return (
    // `relative` because `fill` positions against the nearest positioned
    // ancestor; `bg-panel` is what shows in the band's own space while
    // the image is still loading, so it never flashes white.
    <section
      aria-labelledby="values-heading"
      className="relative w-full overflow-hidden bg-panel"
      style={{ height: BANNER_H }}
    >
      {/* Desaturated on purpose: it is the first half of a duotone. A
          colour photograph under a coloured wash fights it and comes out
          muddy; a greyscale one takes the wash cleanly. */}
      <Image
        src="/banner.jpg"
        alt="A software team at work in an open-plan office — pairing at desks, talking through a screen at a standing whiteboard."
        fill
        sizes="100vw"
        priority={false}
        className="object-cover grayscale contrast-[1.08]"
      />

      {/* The wash. `multiply` keeps the photograph's own light and shade
          — the room, the desks, the people are all still legible —
          while pushing every tone towards the brand indigo. A flat
          translucent colour would have hidden the picture and left a
          blue rectangle. */}
      <div
        className="absolute inset-0 bg-accent mix-blend-multiply"
        aria-hidden="true"
      />

      {/* A second, gentler pass in the same colour, this time normal
          blending. Multiply alone leaves the brightest parts of the
          photograph close to white; this lifts the whole band onto one
          hue so it reads as a brand surface rather than a tinted photo. */}
      <div className="absolute inset-0 bg-accent/35" aria-hidden="true" />

      {/* Darkened top and bottom, so the heading has a consistent ground
          under it wherever the photograph happens to be light, and the
          band meets the section above and the panel below without a hard
          edge. */}
      <div
        className="absolute inset-0 bg-linear-to-b from-panel/45 via-transparent to-panel/55"
        aria-hidden="true"
      />

      {/* Centred in the part of the band the panel does not cover. */}
      <div
        className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center sm:px-8"
        style={{ paddingBottom: OVERLAP }}
      >
        {/* A soft pool of shadow under the words, and only under the
            words. The photograph has sunlit windows in it, and white
            text crossing one of those drops to about 1:1 — this holds
            the text's own ground dark enough to read against while the
            rest of the band keeps the brightness it has. Cheaper than
            darkening the whole image, and it does not flatten the
            picture. */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "radial-gradient(ellipse 68% 62% at 50% 45%, color-mix(in oklab, var(--panel) 76%, transparent), transparent 74%)",
          }}
          aria-hidden="true"
        />

        <h2
          id="values-heading"
          className="display relative mx-auto max-w-4xl text-[clamp(2rem,4vw,3.25rem)] font-medium text-white text-balance"
        >
          The core values and principles that drive us
        </h2>

        {/* The same short rule the heading had in the panel, in amber.
            Not the site's `--warning` gold, which is tuned to clear AA as
            small text on WHITE and goes muddy on indigo (about 1.5:1
            against this band); this bright amber is the complement of the
            brand blue and lands near 4.5:1, so it reads as a deliberate
            mark rather than a smudge. */}
        <span
          className="relative mt-7 block h-[3px] w-12 bg-amber-400"
          aria-hidden="true"
        />
      </div>
    </section>
  );
}
