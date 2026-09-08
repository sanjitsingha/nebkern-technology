"use client";

import Image from "next/image";
import { useEffect, useRef, type CSSProperties } from "react";

/**
 * The Made-in-India statement, revealed word by word on scroll.
 *
 * Written as segments rather than one string so the second sentence can
 * carry the accent colour — it is the half that makes the argument.
 * Plenty of software is made in India; far less of it is designed
 * around how business here actually works.
 */
const PARTS: { text: string; accent?: boolean }[] = [
  { text: "Made in India." },
  { text: "Made for India.", accent: true },
  {
    text: "Not an offshore office building somebody else's product. Not a foreign tool with a rupee price bolted on afterwards. Built in North Bengal, hosted inside the country, and designed for how business here actually gets done.",
  },
];

/** Flattened once at module scope — the word list never changes, so
 *  there is no reason to rebuild it on every render. */
const WORDS = PARTS.flatMap((part) =>
  part.text.split(" ").map((word) => ({ word, accent: part.accent })),
);

/**
 * Where the reveal starts and ends, as a fraction of viewport height,
 * measured against the paragraph's own top edge.
 *
 * `START = 1` is the instant the paragraph's top touches the bottom of
 * the screen — the reveal begins the moment the text appears, wherever
 * the reader happens to be.
 *
 * `END` is negative on purpose: the sentence finishes only after the
 * paragraph's top has passed the top of the screen. That is safe
 * because words light up in reading order, so the final words sit on
 * the LAST line, which is still comfortably in view at that point.
 *
 * The gap between the two is the entire pace control, and 1.2 viewports
 * is close to the practical ceiling for a reveal that is not pinned: a
 * paragraph only ever travels one screen plus its own height, and
 * pushing END lower would finish the sentence with most of it scrolled
 * off the top.
 */
const START = 1.0;
const END = -0.2;

/** Line-art skyline of Indian landmarks, served from the same media
 *  host as the product lockups (already allowlisted in next.config.ts).
 *  Its real pixel size, needed because the build never fetches remote
 *  images and would otherwise have no aspect ratio to reserve. */
const SKYLINE = {
  src: "https://media.instant.nebkern.com/assets/indian-wonders.png",
  width: 2007,
  height: 412,
};

/**
 * The handler writes exactly one custom property, `--p`; every word
 * derives its own opacity from that and its index in CSS (see
 * `.reveal-word` in globals.css). One style write on one element per
 * frame — no React state, no re-render per word — and reads are
 * throttled to one `requestAnimationFrame`, since scroll fires far more
 * often than the screen repaints.
 */
export function Statement() {
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const vh = window.innerHeight;
      const top = el.getBoundingClientRect().top;
      const p = (START * vh - top) / ((START - END) * vh);

      el.style.setProperty("--p", String(Math.min(1, Math.max(0, p))));
    };

    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
  }, []);

  return (
    // Grey, so the statement reads as its own band between two paper
    // sections. The colour change draws the boundary, so no border.
    // Ordinary flow — it scrolls past like any other section.
    <section className="relative overflow-hidden bg-surface-2">
      <div className="relative mx-auto max-w-6xl px-5 py-28 sm:px-8 sm:py-36">
        <p
          ref={ref}
          style={{ "--n": WORDS.length } as CSSProperties}
          className="reveal max-w-4xl text-[clamp(1.5rem,3.4vw,2.5rem)] leading-[1.45] font-medium tracking-[-0.02em] text-ink"
        >
          {WORDS.map(({ word, accent }, i) => (
            // The trailing space lives inside the span so the words
            // still wrap and space normally; a faded space is invisible
            // either way.
            <span
              key={`${word}-${i}`}
              className={`reveal-word${accent ? " text-accent" : ""}`}
              style={{ "--i": i } as CSSProperties}
            >
              {word}
              {i < WORDS.length - 1 ? " " : ""}
            </span>
          ))}
        </p>

      </div>

      {/* Outside the 6xl column: a sibling of it, positioned against the
          SECTION, so `right-0` is the screen's edge rather than the
          column's gutter. That is the whole change — it now runs off the
          side of the page instead of stopping where the text does.

          `bottom-0` still puts it on the section's floor, so it reads as
          a ground line rather than floating, and it still clears the
          paragraph on its own: the text is `max-w-4xl` and ends above
          the bottom padding.

          Width in `vw` now, because a percentage here would resolve
          against the full-width section rather than the column it used
          to sit in — the same 62% would be a much bigger picture. Kept
          soft, because it is scenery, not something to study.

          Decorative, so `alt=""` plus `aria-hidden` — a screen reader
          announcing "indian wonders" here would add nothing. */}
      <div
        className="pointer-events-none absolute right-0 bottom-0 w-[min(620px,44vw)] opacity-40"
        aria-hidden="true"
      >
        <Image
          src={SKYLINE.src}
          alt=""
          width={SKYLINE.width}
          height={SKYLINE.height}
          className="h-auto w-full"
        />
      </div>
    </section>
  );
}
