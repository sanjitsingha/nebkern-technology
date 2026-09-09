"use client";

import {
  useEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from "react";

/**
 * The company's three claims, one per slide.
 *
 * These were a static three-column section (`about.tsx`) until they
 * moved in here. The copy is carried over word for word — only the
 * presentation changed.
 *
 * Each colour carries white text, so all three clear WCAG AA at 4.5:1
 * against white: 6.18, 6.00 and 7.29 to one. That is the bar for
 * normal text, not the 3:1 a large heading alone would be allowed,
 * because the body copy sits on the same colour as the heading.
 */
const SLIDES = [
  {
    color: "#3356d2",
    title: "We build products, not one-off projects",
    body: "Everything we ship is software we own, version and keep running. That means a customer gets improvements they did not pay for separately, and a roadmap that outlives whoever wrote the first version.",
  },
  {
    color: "#007240",
    title: "We run our own infrastructure",
    body: "Our servers, our deploys, our on-call. Nothing critical sits on a platform we cannot get into at two in the morning, and no reseller stands between a customer and the systems their business depends on.",
  },
  {
    color: "#a4126c",
    title: "We integrate with the platforms India sells on",
    body: "Nebkern is an official Meta Tech Provider, which is what lets us connect a business directly to the WhatsApp Business Platform — along with Instagram and Messenger — rather than routing it through somebody else's account.",
  },
];

/** How far a drag has to travel before it counts as a swipe. Below
 *  this it is a tap or a wobble, and changing slide on either would
 *  make the panel feel twitchy. */
const SWIPE_PX = 50;

/** How long each slide holds before the next takes over. */
const AUTOPLAY_MS = 4000;

function Chevron({ direction }: { direction: "left" | "right" }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-3 w-3"
      aria-hidden="true"
    >
      <path d={direction === "left" ? "M10 3L5 8l5 5" : "M6 3l5 5-5 5"} />
    </svg>
  );
}

/**
 * One slide at a time, changing by dissolve.
 *
 * The earlier version was a native scroll container, which came with
 * dragging, momentum and keyboard support for free. A crossfade cannot
 * reuse any of that — the slides no longer sit side by side, so there
 * is nothing to scroll — which is why the drag and the arrow keys are
 * implemented by hand here. That is the real cost of the effect.
 *
 * The slides are stacked with CSS grid rather than absolute
 * positioning: every slide occupies the same cell, so the track is
 * exactly as tall as the tallest slide and needs no measured height.
 * Absolute positioning would collapse the track to nothing and force a
 * hardcoded one.
 */
export function Slider() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const dragX = useRef<number | null>(null);

  /**
   * Advance on a timer.
   *
   * `index` is in the dependency list on purpose: changing slide by any
   * means tears the interval down and starts a fresh one, so a manual
   * click gets a full four seconds rather than whatever was left on the
   * previous tick.
   *
   * Not gated on `prefers-reduced-motion`. The crossfade already
   * collapses to an instant swap under that setting
   * (`motion-reduce:duration-0`), so what is left is a slide changing,
   * not something sliding — and gating it would switch the carousel off
   * entirely on any machine with Windows' animation effects disabled,
   * which is a performance setting far more often than a vestibular
   * one. The hover and focus pause above is the stop control.
   */
  useEffect(() => {
    if (paused) return;
    const id = setInterval(
      () => setIndex((i) => (i + 1) % SLIDES.length),
      AUTOPLAY_MS,
    );
    return () => clearInterval(id);
  }, [paused, index]);

  const go = (direction: 1 | -1) =>
    // Wraps in both directions, so neither arrow is ever a dead end.
    setIndex((i) => (i + direction + SLIDES.length) % SLIDES.length);

  const onPointerDown = (e: ReactPointerEvent<HTMLDivElement>) => {
    // Mouse drags on text usually mean "select", not "swipe"; only a
    // touch or pen starts one.
    if (e.pointerType === "mouse") return;
    dragX.current = e.clientX;
  };

  const onPointerUp = (e: ReactPointerEvent<HTMLDivElement>) => {
    const start = dragX.current;
    dragX.current = null;
    if (start === null) return;

    const dx = e.clientX - start;
    if (Math.abs(dx) < SWIPE_PX) return;
    go(dx < 0 ? 1 : -1);
  };

  const arrow =
    "grid size-8 place-items-center rounded-full border border-line bg-surface text-ink transition-colors hover:border-accent hover:text-accent";

  return (
    // `id="company"` moved here with the copy. The nav and the footer
    // both link to it, and an anchor pointing at a section that no
    // longer exists fails silently.
    // Half paper, half grey, with the card straddling the join.
    //
    // A hard-stop gradient rather than two stacked divs: one paint, no
    // extra elements, and the stop is a single number to move if the
    // seam ever wants to sit somewhere other than the middle.
    //
    // The two colours are not decorative. `--paper` is what the values
    // panel above sits on and `--surface-2` is the Statement band
    // below, so the top half continues the section before it and the
    // bottom half becomes the section after it — the card appears to
    // bridge them rather than to sit in a third band of its own.
    //
    // The card lands on the join for free: the container's vertical
    // padding is symmetric, so its centre already is the section's.
    <section
      id="company"
      className="scroll-mt-20 overflow-hidden"
      style={{
        background:
          "linear-gradient(to bottom, var(--paper) 50%, var(--surface-2) 50%)",
      }}
    >
      <div
        className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20"
        // Hovering or tabbing into the carousel stops the clock. Content
        // that moves on its own has to be stoppable, and the moment a
        // reader is actually engaging with a slide is the moment it
        // should not be yanked away from them.
        onMouseEnter={() => setPaused(true)}
        onMouseLeave={() => setPaused(false)}
        onFocus={() => setPaused(true)}
        onBlur={() => setPaused(false)}
      >
        <div
          // Focusable and labelled so the arrow keys have somewhere to
          // land — the native scrolling that used to provide them is
          // gone with the crossfade.
          tabIndex={0}
          role="group"
          aria-roledescription="carousel"
          aria-label="What we build"
          onKeyDown={(e) => {
            if (e.key === "ArrowLeft") go(-1);
            if (e.key === "ArrowRight") go(1);
          }}
          onPointerDown={onPointerDown}
          onPointerUp={onPointerUp}
          onPointerCancel={() => (dragX.current = null)}
          // Horizontal gestures are ours, vertical ones stay with the
          // page — without this a swipe would fight the page scroll.
          className="grid touch-pan-y sm:px-10"
        >
          {SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={slide.title}
                // Every slide in the same grid cell: they overlap, so
                // one can fade up as another fades down.
                className={`col-start-1 row-start-1 h-full transition-opacity duration-500 motion-reduce:duration-0 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!active}
              >
                {/* Two layers on purpose: a white card, and the coloured
                    panel inset inside it. The card's padding IS the
                    white margin around the colour — the same move the
                    apps slab makes, and what stops the colour reading
                    as a full-bleed band across the page. */}
                {/* `h-full` down both layers. The slides share one grid
                    cell, so the CELL is already the height of the
                    tallest — but a block child only grows to its own
                    content, which left the short slides visibly shorter
                    and the card resizing as it crossfaded. */}
                <div className="h-full rounded-md border border-line bg-surface p-2.5 sm:p-3">
                  <div
                    // `min-h` rather than an aspect ratio: a ratio ties
                    // height to width, so the panel grew taller on
                    // every wider screen. A minimum keeps it short and
                    // still lets it grow if the copy needs the room.
                    className="flex h-full min-h-[208px] flex-col justify-center rounded-md px-6 py-6 select-none sm:min-h-[228px] sm:px-10 sm:py-7"
                    style={{ background: slide.color }}
                  >
                    <p className="font-mono text-[0.75rem] tracking-[0.1em] text-white/70">
                      {String(i + 1).padStart(2, "0")}
                    </p>

                    <h2 className="mt-3 max-w-2xl text-[clamp(1.5rem,2.6vw,2.125rem)] leading-[1.15] font-medium tracking-[-0.024em] text-balance text-white">
                      {slide.title}
                    </h2>

                    <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-pretty text-white/85">
                      {slide.body}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* At the column's outer edge, in the gutter the track's own
            `sm:px-14 lg:px-20` opens up — so they sit clear of the
            coloured panel instead of on it.

            A phone has no gutter to give: the column is only `px-5`
            wide at the sides, so there they stay hard against the edge
            and just touch the card. Everything from `sm` up gets real
            separation, which is where the overlap was actually being
            noticed. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className={`${arrow} absolute top-1/2 left-0 -translate-y-1/2 sm:left-4 lg:left-6`}
        >
          <Chevron direction="left" />
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className={`${arrow} absolute top-1/2 right-0 -translate-y-1/2 sm:right-4 lg:right-6`}
        >
          <Chevron direction="right" />
        </button>
      </div>
    </section>
  );
}
