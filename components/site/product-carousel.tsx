"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
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
        // Picture on top, words underneath — the shape Instant's own
        // feature rail uses. No fixed height: the band takes its height
        // from the card's width and the text sizes itself, and a flex row
        // stretches every card to the tallest, so they still line up.
        className="group flex h-full flex-col overflow-hidden rounded-lg bg-surface transition-transform hover:-translate-y-0.5"
      >
        {/* The picture band, locked to 3:2 so art made at that shape
            fills it at any width. Until a product has art, it is a panel
            tinted in the product's own colour carrying its mark — see
            `image` in lib/products.ts. */}
        <div
          className="relative aspect-3/2 shrink-0"
          style={{
            background: "color-mix(in oklab, var(--hue) 13%, var(--surface))",
          }}
        >
          {product.image ? (
            <Image
              src={product.image}
              alt=""
              fill
              sizes="(min-width: 640px) 40vw, 85vw"
              className="object-cover"
            />
          ) : (
            <div
              aria-hidden="true"
              className="flex h-full items-center justify-center px-6"
            >
              {product.logo ? (
                <Image
                  src={product.logo.src}
                  alt=""
                  width={Math.round(
                    LOGO_H * (product.logo.width / product.logo.height),
                  )}
                  height={LOGO_H}
                  className="h-8 w-auto sm:h-9"
                />
              ) : (
                // Ink, not the product's hue: at this size the hue on its
                // own tint falls near the 4.5:1 line, and the tint behind
                // it is already carrying the colour.
                <span className="text-center text-[1.5rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
                  {product.name}
                </span>
              )}
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-6 sm:p-7">
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

          {/* The name in words here, whatever the band showed: a lockup
              read twice is the name said twice. */}
          <h3 className="mt-3 text-[1.25rem] font-semibold tracking-[-0.02em] text-ink">
            {product.name}
          </h3>

          <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
            {product.kicker}
          </p>

          {/* `mt-auto` so every card's action sits on the same line,
              however long the line above it runs. */}
          <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-[0.875rem] font-semibold text-ink transition-colors group-hover:text-accent">
            {product.href ? `Visit ${product.name}` : "What it is"}
            <Arrow />
          </span>
        </div>
      </Anchor>
    </li>
  );
}

export function ProductCarousel({
  products,
  children,
}: {
  products: Product[];
  /** The band's heading and paragraph. They sit above the buttons in the
   *  left column, so the whole two-column layout lives here rather than
   *  in the band — the buttons are on one side and what they scroll is
   *  on the other. */
  children: ReactNode;
}) {
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

  // Solid white with an ink arrow. It also settles the contrast: an
  // outline ring measured 1.7:1 against the gradient, under the 3:1 a
  // control needs, where a white disc on the blue is 9:1 and the arrow
  // inside it 17:1.
  const button =
    "grid size-11 shrink-0 place-items-center rounded-full bg-white text-ink transition-opacity hover:opacity-90 disabled:opacity-40";

  return (
    // The cards take eight columns of twelve so that a pair of them is
    // wide enough to be read across the band rather than glanced at.
    <div className="flex flex-col gap-12 lg:grid lg:grid-cols-[4fr_8fr] lg:items-center lg:gap-14">
      <div>
        {children}

        <div className="mt-9 flex gap-3">
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
        className="flex min-w-0 snap-x snap-mandatory gap-4 overflow-x-auto pb-1 scrollbar-none focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white [&::-webkit-scrollbar]:hidden"
      >
        {products.map((product) => (
          <ProductCard key={product.slug} product={product} />
        ))}
      </ul>
    </div>
  );
}
