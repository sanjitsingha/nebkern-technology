export function Hero() {
  return (
    <section className="relative flex min-h-[calc(100svh-5rem-19rem)] items-center overflow-hidden">
      <div
        className="grid-field pointer-events-none absolute inset-0"
        aria-hidden="true"
      />

      {/* Deliberately spare. The apps get the 40/60 slab immediately
          below; a hero that also listed them would say the same thing
          twice before anyone had scrolled once.

          Full viewport height, minus the 5rem the sticky nav occupies —
          a flat 100vh would push the hero's own bottom edge below the
          fold by exactly the height of the bar. `svh` rather than `vh`
          and minus a further 19rem held back so the top half of the
          apps slab below is already on screen at first glance. That
          reserve is the slab's half-height plus the section's top
          padding; it is absolute, so a taller viewport gives the extra
          room to the hero and the seam still lands near the fold.
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
      <div className="relative mx-auto w-full max-w-6xl px-5 pt-12 pb-16 sm:px-8 sm:pt-16 sm:pb-20">
        <div className="max-w-5xl">
          {/* Fluid rather than a fixed size with one `sm:` step. Two
              lines is a function of characters-per-line, so a fixed
              60px holds at 1280px and spills to three around 950px —
              exactly the widths a fixed breakpoint does not cover.
              Scaling with the viewport keeps the break where it is
              from tablet up; on a phone a 56-character headline simply
              cannot be two lines, and should not try. */}
          <h1 className="display text-[clamp(2rem,4.6vw,3.75rem)] font-medium text-ink text-balance">
            We build the software Indian businesses actually run on.
          </h1>

          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty sm:text-xl">
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
              className="inline-flex items-center justify-center gap-2 rounded-md bg-accent px-5 py-3 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
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
