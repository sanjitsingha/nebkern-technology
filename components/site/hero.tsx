import Link from "next/link";

/**
 * The hero: one claim, centred, on #F8F9FB.
 *
 * #F8F9FB rather than the page's own `--paper`, so the hero reads as its
 * own surface and the gradient band below it starts against something
 * flat. A literal rather than a palette entry: it is this section's
 * colour, and anything that needs to match it should take a token.
 *
 * Deliberately spare. It used to have a panel of products on the right
 * and a gradient band of them immediately below; both are gone, so the
 * claim and one button are the whole screen, and the button goes to
 * /products.
 *
 * What used to be behind the copy was a clickable grid backdrop
 * (`BackgroundRippleEffect`). It is gone too, and with it the reason for
 * `overflow-hidden`, for `z-10` on the copy, and for a
 * `pointer-events-none` container with `pointer-events-auto` on each
 * child — all of which existed so clicks could reach the cells behind.
 * The component is still in components/ui with nothing rendering it, as
 * are the `cell-ripple` and `grid-fade-in` keyframes in globals.css.
 */
export function Hero() {
  return (
    <section className="flex min-h-[calc(100svh-5rem-15rem)] items-center bg-[#F8F9FB]">
      {/* Full viewport height, minus the 5rem the sticky nav occupies —
          a flat 100vh would push the hero's own bottom edge below the
          fold by exactly the height of the bar. Then minus a further
          15rem, the strip of the next section left showing at first
          glance: the hint that there is more page below.

          That strip was 9rem, and this section is shorter by the 6rem
          difference. One number to tune: raising it shortens the hero
          and shows more of the products panel without touching anything
          else, because the copy is centred in whatever height is left.

          `svh` rather than `vh` because mobile `vh` measures the
          viewport WITHOUT the browser chrome, so the section overflows
          the visible area on a phone; `svh` is the stable small-viewport
          unit, and `min-h` keeps a short screen from clipping the copy.
          `w-full` on the container because it is a flex item, which
          would otherwise shrink to its content and break the centring. */}
      {/* The padding comes down with the height. On a short viewport the
          copy is taller than the `min-h` above, so the section is sized
          by this padding instead and the calc stops mattering — leaving
          it at py-20 would have made the hero shorter on a desktop and
          not on a laptop. */}
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Fluid rather than a fixed size with one `sm:` step. Two
              lines is a function of characters-per-line, so a fixed 60px
              holds at 1280px and spills to three around 950px — exactly
              the widths a fixed breakpoint does not cover. Scaling with
              the viewport keeps the break where it is from tablet up; on
              a phone a 47-character headline simply cannot be two lines,
              and should not try. */}
          {/* Word for word `SITE.tagline`, which is also the homepage's
              <title> and the text on the share card. "Actually" came out
              with it: it was doing the work of a raised voice, and the
              sentence is steadier without it. */}
          <h1 className="display text-[clamp(2rem,4.6vw,3.75rem)] font-medium text-ink text-balance">
            We build the software Indian businesses run on.
          </h1>

          {/* A rule, not a divider: it marks where the claim ends and the
              explanation begins. `aria-hidden` because it says nothing a
              reader needs. */}
          <span aria-hidden="true" className="mt-8 block h-px w-12 bg-ink/20" />

          {/* A third shorter than it was. Three things went: the company
              name, which the logotype above and the page title already
              say; "end to end", which the four verbs in front of it
              demonstrate rather than need stating; and the two long
              negative clauses, now a pair of three-word ones. What is
              left is the same two claims in a sentence that can be read
              at a glance, which is all a hero paragraph gets. */}
          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty sm:mt-10 sm:text-xl">
            A software company in North Bengal. We design, build, host and
            support our own products &mdash; nothing resold, nothing handed
            over and abandoned.
          </p>

          {/* One action. The nav's "Talk to us" and the closing panel
              both still carry contact, so the hero does not need to offer
              a second door on the way in.

              /products, not the `#products` anchor it used to carry: the
              band that anchor pointed at is off the homepage, and a
              button that scrolls to nothing is worse than one that
              leaves the page.

              `rounded-sm`, 2px: enough that the corner is not a hard
              point against the flat background, far short of the 6px it
              carried before.

              Green, not the indigo accent, and specifically Instant's
              own green — the token resolves to the same value the
              product panel below gets as `--hue`, so the button and the
              panel it leads to are one colour rather than two that
              nearly match. White on it measures 7.16:1.

              Wider than it reads: the padding is `px-10`, not the `px-5`
              of an ordinary button, because this is the only action in a
              full-height hero and had been sitting in that space looking
              incidental. */}
          <div className="mt-12 flex justify-center sm:mt-14">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-brand-green px-10 py-3.5 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-brand-green-hover"
            >
              What we build
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
