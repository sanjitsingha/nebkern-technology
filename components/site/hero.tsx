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
    <section className="flex min-h-[calc(100svh-5rem-9rem)] items-center bg-[#F8F9FB]">
      {/* Full viewport height, minus the 5rem the sticky nav occupies —
          a flat 100vh would push the hero's own bottom edge below the
          fold by exactly the height of the bar. Then minus a further
          9rem, the strip of the next section left showing at first
          glance: the hint that there is more page below.

          `svh` rather than `vh` because mobile `vh` measures the
          viewport WITHOUT the browser chrome, so the section overflows
          the visible area on a phone; `svh` is the stable small-viewport
          unit, and `min-h` keeps a short screen from clipping the copy.
          `w-full` on the container because it is a flex item, which
          would otherwise shrink to its content and break the centring. */}
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mx-auto flex max-w-4xl flex-col items-center text-center">
          {/* Fluid rather than a fixed size with one `sm:` step. Two
              lines is a function of characters-per-line, so a fixed 60px
              holds at 1280px and spills to three around 950px — exactly
              the widths a fixed breakpoint does not cover. Scaling with
              the viewport keeps the break where it is from tablet up; on
              a phone a 56-character headline simply cannot be two lines,
              and should not try. */}
          <h1 className="display text-[clamp(2rem,4.6vw,3.75rem)] font-medium text-ink text-balance">
            We build the software Indian businesses actually run on.
          </h1>

          {/* A rule, not a divider: it marks where the claim ends and the
              explanation begins. `aria-hidden` because it says nothing a
              reader needs. */}
          <span aria-hidden="true" className="mt-8 block h-px w-12 bg-ink/20" />

          <p className="mt-8 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty sm:mt-10 sm:text-xl">
            Nebkern Technology is a software company in North Bengal. We design,
            build, host and support our own products end to end &mdash; we do
            not resell anybody&rsquo;s platform, and we do not hand over a
            codebase and walk away.
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
              carried before. */}
          <div className="mt-12 flex justify-center sm:mt-14">
            <Link
              href="/products"
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-accent px-5 py-3 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
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
