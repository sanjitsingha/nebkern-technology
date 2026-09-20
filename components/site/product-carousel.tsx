"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import Image from "next/image";
import Link from "next/link";

import { STATUS_LABEL, type Product } from "@/lib/products";

/**
 * The products, as a carousel on the homepage's gradient band.
 *
 * A scroller rather than a slider library: the track is an ordinary
 * horizontally scrolling list with scroll snapping, so a trackpad, a
 * touch swipe and the keyboard all work without this component being
 * involved. The two buttons only scroll it, and they are the part that
 * needs JavaScript — which is why this file, and not the band around it,
 * is the client component.
 *
 * The cards stay white with ink on them: the gradient reaches #2da3c2 at
 * its right edge, where white text would fall to 2.9:1.
 */

/** The gap between cards, in px. Part of the step a button scrolls by:
 *  one trackful plus the gap that follows it. */
const GAP = 16;

/** Lockup height inside a card. Width follows the file's real ratio. */
const LOGO_H = 28;

function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d={back ? "M13 8H3M7 4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}

function ProductCard({ product }: { product: Product }) {
  // A product with a site of its own goes there; one without goes to its
  // entry on /products, which is the page that says what it is and when.
  const href = product.href ?? `/products#${product.slug}`;
  const label = product.statusLabel ?? STATUS_LABEL[product.status];
  const pending = product.status === "development";
  const Anchor = product.href ? "a" : Link;

  return (
    <li
      // Two per view from sm up: each card is half the track less half
      // the gap between them, so a pair fills it exactly and a press
      // advances a pair. On a phone two would be 167px wide, so it is one
      // card and a peek of the next instead.
      className="w-[85%] shrink-0 snap-start sm:w-[calc(50%-0.5rem)]"
      style={{ "--hue": product.hue } as CSSProperties}
    >
      <Anchor
        href={href}
        // `min-h` rather than a fixed height: the card is at least this
        // tall, and a longer kicker grows it rather than spilling out.
        // The kicker's `flex-1` holds the action to the bottom edge, so
        // the extra height opens between the two, not under the link.
        className="group flex h-full min-h-88 flex-col rounded-lg bg-surface p-7 transition-transform hover:-translate-y-0.5"
      >
        <span
          className={`inline-flex items-center gap-2 text-[0.75rem] font-semibold ${
            pending ? "text-warning" : "text-ink-soft"
          }`}
        >
          <span
            className="size-1.5 shrink-0"
            style={{ background: pending ? "var(--warning)" : "var(--hue)" }}
            aria-hidden="true"
          />
          {label}
        </span>

        {/* The lockup IS the name where there is one, so nothing prints
            it twice. */}
        <h3 className="mt-4 flex items-center">
          {product.logo ? (
            <Image
              src={product.logo.src}
              alt={product.name}
              width={Math.round(
                LOGO_H * (product.logo.width / product.logo.height),
              )}
              height={LOGO_H}
              className="h-7 w-auto"
            />
          ) : (
            <span className="text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
              {product.name}
            </span>
          )}
        </h3>

        <p className="mt-2.5 flex-1 text-[0.9375rem] leading-relaxed text-muted text-pretty">
          {product.kicker}
        </p>

        <span className="mt-5 inline-flex items-center gap-1.5 text-[0.875rem] font-semibold text-ink transition-colors group-hover:text-accent">
          {product.href ? `Visit ${product.name}` : "What it is"}
          <Arrow />
        </span>
      </Anchor>
    </li>
  );
}

export function ProductCarousel({ products }: { products: Product[] }) {
  const track = useRef<HTMLUListElement>(null);
  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);

  /** Which buttons are still worth pressing. Read from the scroller
   *  itself rather than tracked as an index, so a swipe, a trackpad and
   *  a button all leave the same state behind. */
  const sync = useCallback(() => {
    const el = track.current;
    if (!el) return;
    setAtStart(el.scrollLeft <= 2);
    // A 1px rounding gap is normal at the far end; 2px of slack keeps
    // the forward button from staying lit with nowhere to go.
    setAtEnd(el.scrollLeft + el.clientWidth >= el.scrollWidth - 2);
  }, []);

  useEffect(() => {
    sync();
    // The track's width decides how much is out of view, so the answer
    // changes when the column does.
    const el = track.current;
    if (!el || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(sync);
    observer.observe(el);
    return () => observer.disconnect();
  }, [sync]);

  const step = (direction: 1 | -1) => {
    const el = track.current;
    if (!el) return;
    // A page, not a card: the track holds exactly two cards from sm up,
    // so its own width plus the gap lands on the next pair's snap point.
    const by = el.clientWidth + GAP;
    el.scrollBy({
      left: direction * by,
      // Honour the same preference globals.css honours for transitions:
      // an animated scroll is motion too.
      behavior: window.matchMedia("(prefers-reduced-motion: reduce)").matches
        ? "auto"
        : "smooth",
    });
  };

  const button =
    "grid size-10 shrink-0 place-items-center rounded-full border border-white/45 text-white transition-colors hover:border-white hover:bg-white/10 disabled:opacity-35 disabled:hover:bg-transparent";

  return (
    <div className="min-w-0">
      {/* Top right of the carousel, which on a desktop is the top right
          of the band. */}
      <div className="mb-5 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => step(-1)}
          disabled={atStart}
          aria-label="Previous products"
          className={button}
        >
          <Arrow back />
        </button>
        <button
          type="button"
          onClick={() => step(1)}
          disabled={atEnd}
          aria-label="Next products"
          className={button}
        >
          <Arrow />
        </button>
      </div>

      {/* `tabIndex` because a scrollable region has to be reachable by
          keyboard; the label tells a screen reader what it is scrolling.
          The scrollbar is hidden — the buttons and the peeking next card
          say it moves, and a scrollbar across the gradient does not. */}
      <ul
        ref={track}
        onScroll={sync}
        tabIndex={0}
        aria-label="Products"
        className="flex snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </ul>
    </div>
  );
}
