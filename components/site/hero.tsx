import { BackgroundRippleEffect } from "@/components/ui/background-ripple-effect";

export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem-9rem)] items-center overflow-hidden">
      {/* Was a pure-CSS grid (`.grid-field`). The cells are clickable
          now — a click sends a ripple out from the one you hit — so this
          deliberately does NOT carry `pointer-events-none`. The hero's
          copy sits in a `relative` block above it and keeps its own
          clicks; the section's `overflow-hidden` clips the fixed-width
          grid on a narrow screen. */}
      <BackgroundRippleEffect />

      {/* Deliberately spare. The apps get the 40/60 slab immediately
          below; a hero that also listed them would say the same thing
          twice before anyone had scrolled once.

          Full viewport height, minus the 5rem the sticky nav occupies —
          a flat 100vh would push the hero's own bottom edge below the
          fold by exactly the height of the bar. Then minus a further
          9rem, which is the only number here worth tuning: it is the
          strip of the apps slab left showing at first glance, the hint
          that there is more page below. It was 19rem, which made for a
          shorter hero and a wider peek; dropping it to 9rem trades most
          of that peek for height, and taking it to 0 would give a
          hero exactly one screen tall with nothing visible under it.

          The reserve is absolute rather than a percentage, so a taller
          viewport hands the extra room to the hero and the seam still
          lands near the fold.
          `svh` rather than `vh` because mobile `vh` measures the
          viewport WITHOUT the browser
          chrome, so the section overflows the visible area on a phone;
          `svh` is the stable small-viewport unit, and `min-h` keeps a
          short screen from clipping the copy. `w-full` on the inner
          container because it is now a flex item, which would otherwise
          shrink to its content and break the centring. */}
      {/* Asymmetric padding rather than a transform: the block is
          vertically centred, so giving the bottom more padding than the
          top lifts the content off dead centre without moving the
          section or risking overflow on a short screen. */}
      {/* `pointer-events-none` here with `pointer-events-auto` on the
          headline, the paragraph and the button. The container is a
          full-width block, so once it sits above the grid it also sits
          in front of every cell behind it — the backdrop went dead
          across the whole middle of the hero. Events now pass through
          the container and are taken back only by the three things that
          want them, which keeps the text selectable and the button
          clickable while the space around them stays live.

          `z-10` is not cosmetic. `DivGrid` inside the ripple carries
          `z-[3]`, and because its own wrapper is `z-auto` that 3 lands
          in the ROOT stacking context — so without a z-index here the
          backdrop paints over the headline and eats clicks meant for
          the button. The column width is unchanged. */}
      <div className="pointer-events-none relative z-10 mx-auto w-full max-w-6xl px-5 pt-12 pb-36 sm:px-8 sm:pt-16 sm:pb-44">
        <div className="max-w-5xl">
          {/* Fluid rather than a fixed size with one `sm:` step. Two
              lines is a function of characters-per-line, so a fixed
              60px holds at 1280px and spills to three around 950px —
              exactly the widths a fixed breakpoint does not cover.
              Scaling with the viewport keeps the break where it is
              from tablet up; on a phone a 56-character headline simply
              cannot be two lines, and should not try. */}
          <h1 className="pointer-events-auto display text-[clamp(2rem,4.6vw,3.75rem)] font-medium text-ink text-balance">
            We build the software Indian businesses actually run on.
          </h1>

          <p className="pointer-events-auto mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty sm:text-xl">
            Nebkern Technology is a software company in North Bengal. We design,
            build, host and support our own products end to end — we do not
            resell anybody&rsquo;s platform, and we do not hand over a codebase
            and walk away.
          </p>

          {/* One action. The nav's "Talk to us" and the closing panel
              both still carry contact, so the hero does not need to
              offer a second door on the way in. */}
          <div className="mt-9">
            <a
              href="#products"
              className="pointer-events-auto inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
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
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
