"use client";

import {
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
  const dragX = useRef<number | null>(null);

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
    "grid size-8 place-items-center rounded-full border border-line bg-surface text-ink shadow-[0_6px_20px_-10px_rgb(0_0_0/0.28)] transition-colors hover:border-ink/25";

  return (
    // `id="company"` moved here with the copy. The nav and the footer
    // both link to it, and an anchor pointing at a section that no
    // longer exists fails silently.
    <section id="company" className="scroll-mt-20 overflow-hidden">
      <div className="relative mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
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
          className="grid touch-pan-y"
        >
          {SLIDES.map((slide, i) => {
            const active = i === index;
            return (
              <div
                key={slide.title}
                // Every slide in the same grid cell: they overlap, so
                // one can fade up as another fades down.
                className={`col-start-1 row-start-1 transition-opacity duration-500 motion-reduce:duration-0 ${
                  active ? "opacity-100" : "pointer-events-none opacity-0"
                }`}
                aria-hidden={!active}
              >
                {/* Two layers on purpose: a white card, and the coloured
                    panel inset inside it. The card's padding IS the
                    white margin around the colour — the same move the
                    apps slab makes, and what stops the colour reading
                    as a full-bleed band across the page. */}
                <div className="rounded-md border border-line bg-surface p-2.5 sm:p-3">
                  <div
                    // `min-h` rather than an aspect ratio: a ratio ties
                    // height to width, so the panel grew taller on
                    // every wider screen. A minimum keeps it short and
                    // still lets it grow if the copy needs the room.
                    className="flex min-h-[264px] flex-col justify-center rounded-md px-7 py-10 select-none sm:min-h-[288px] sm:px-12"
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

        {/* Overlaid on the card's edges. With the track back at the
            site's full content width there is no gutter left to sit in,
            so they ride on the colour — where a white disc reads
            perfectly well against any of the three. */}
        <button
          type="button"
          onClick={() => go(-1)}
          aria-label="Previous"
          className={`${arrow} absolute top-1/2 left-7 -translate-y-1/2 sm:left-11`}
        >
          <Chevron direction="left" />
        </button>

        <button
          type="button"
          onClick={() => go(1)}
          aria-label="Next"
          className={`${arrow} absolute top-1/2 right-7 -translate-y-1/2 sm:right-11`}
        >
          <Chevron direction="right" />
        </button>
      </div>
    </section>
  );
}
