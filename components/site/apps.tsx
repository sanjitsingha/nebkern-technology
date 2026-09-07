import type { CSSProperties } from "react";
import Image from "next/image";

import { CardSpotlight } from "@/components/ui/card-spotlight";
import { PRODUCTS, STATUS_LABEL, type Product } from "@/lib/products";

/** Lockup height inside an app row. Width comes from the file's real
 *  aspect ratio so nothing is squashed. */
const LOGO_H = 32;

/**
 * One app in the right-hand 60%.
 *
 * Stacked rows rather than a two-up grid: at 60% of the container each
 * column would be ~290px, too narrow for a lockup and an action on one
 * line.
 */
function AppRow({ product }: { product: Product }) {
  const Wrapper = product.href ? "a" : "div";

  return (
    <li className="py-7 first:pt-0 last:pb-0">
      <Wrapper
        {...(product.href ? { href: product.href } : {})}
        style={{ "--hue": product.hue } as CSSProperties}
        className="group flex flex-col"
      >
        <div className="flex items-start justify-between gap-4">
          {product.logo ? (
            // The lockup IS the heading — it already carries the mark
            // and the name, so nothing repeats it and no colour chip
            // sits beside it putting two marks in one place.
            <h3 className="flex items-center">
              <Image
                src={product.logo.src}
                alt={product.name}
                width={LOGO_H * (product.logo.width / product.logo.height)}
                height={LOGO_H}
                className="h-8 w-auto"
              />
            </h3>
          ) : (
            <h3 className="flex items-center gap-3">
              <span
                className="grid size-8 shrink-0 place-items-center"
                style={{
                  background:
                    "color-mix(in oklab, var(--hue) 14%, transparent)",
                }}
                aria-hidden="true"
              >
                <span
                  className="size-3"
                  style={{ background: "var(--hue)", opacity: 0.55 }}
                />
              </span>
              <span className="text-[1.375rem] font-semibold tracking-[-0.02em] text-ink">
                {product.name}
              </span>
            </h3>
          )}

          {/* The action sits where the status pill used to. A shipped
              app needs a way in far more than it needs a badge saying
              it shipped; an unshipped one has no way in, so it says so
              instead — bare text, because a bordered pill would promise
              a control that is not there. */}
          {product.href ? (
            <span className="inline-flex shrink-0 items-center gap-1.5 pt-1.5 text-[0.875rem] font-medium text-ink">
              Visit {product.name}
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
                aria-hidden="true"
              >
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          ) : (
            <span className="shrink-0 pt-1.5 text-[0.875rem] font-medium text-warning">
              {product.statusLabel ?? STATUS_LABEL[product.status]}
            </span>
          )}
        </div>

        <p className="mt-3.5 max-w-xl text-[0.9375rem] leading-relaxed text-muted text-pretty">
          {product.description}
        </p>
      </Wrapper>
    </li>
  );
}

export function Apps() {
  // Standalone apps only. Ask Maya is `isApp: false` so it is absent
  // from this slab entirely — it still reaches visitors through the
  // footer's Products column and its own page on the Instant site.
  const apps = PRODUCTS.filter((p) => p.isApp);

  return (
    <section id="products" className="relative scroll-mt-20 overflow-hidden">
      {/* The slab straddles the seam: its top half over the hero's
          paper (which is just the page background showing through),
          its bottom half over this section's grey.

          The grey is anchored to the SLAB, not to the section — it
          starts at the slab's own 50% line and runs `h-screen` down,
          with the section's `overflow-hidden` doing the clipping. An
          earlier version split the SECTION in half, which only landed
          on the slab's midpoint while the padding stayed symmetric;
          the bottom padding is now deliberately larger, so that would
          have drifted. This holds at any padding.

          `w-screen` + centring makes it full-bleed, since the grey has
          to reach past the max-w-6xl container to the viewport edges.

          There is no `border-t` on purpose: above the seam this
          section matches the hero exactly, so a divider would draw a
          line across a continuous surface. */}
      <div className="relative mx-auto max-w-6xl px-5 pt-20 pb-40 sm:px-8 sm:pt-24 sm:pb-48">
        <div className="relative">
          <div
            className="absolute top-1/2 left-1/2 h-screen w-screen -translate-x-1/2 bg-surface-2"
            aria-hidden="true"
          />

          {/* 40 / 60. One bordered slab so the coloured panel and the
              app list read as a single object rather than two stacked
              cards. `relative` lifts it above the grey layer. */}
          <div className="relative grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[2fr_3fr]">
            {/* The indigo block is inset, not flush. The gutter is the
              slab's own white showing through on all four sides, which
              makes it read as a card sitting ON the panel rather than a
              coloured half of it — and it is the same white the app
              list sits on, so the two halves stay one object. */}
            <div className="p-4 sm:p-5">
              {/* The card keeps the component's own colours — black,
                  a #262626 wash under the cursor, blue and violet dots.
                  Nothing about the palette is passed in, so this stays
                  whatever the library ships; only the box it sits in is
                  ours. It is the one dark surface above the fold, which
                  the closing panel and footer already establish as this
                  site's punctuation. */}
              <CardSpotlight className="flex h-full flex-col justify-center overflow-hidden px-8 py-12 sm:px-10 sm:py-14">
                <div
                  className="pointer-events-none absolute -top-24 -left-16 h-72 w-72 rounded-full bg-white opacity-[0.13] blur-3xl"
                  aria-hidden="true"
                />

                {/* z-20 to clear the spotlight's z-0 wash. Document
                    order would probably win this anyway; saying it
                    outright means a later change to either layer
                    cannot quietly reverse them. */}
                <div className="relative z-20">
                  {/* The hero owns the h1; this panel makes the claim
                    that belongs to the catalogue, not the company. */}
                  <h2 className="display text-[2.25rem] font-semibold text-white sm:text-[2.75rem]">
                    Two products. One platform.
                  </h2>

                  <p className="mt-5 text-[1.0625rem] leading-relaxed text-neutral-300 text-pretty">
                    Both built, hosted and supported by the same team, on
                    infrastructure we run ourselves. Adopt one and the next is
                    already configured.
                  </p>
                </div>
              </CardSpotlight>
            </div>

            <div className="px-8 py-12 sm:px-10 sm:py-14">
              <p className="border-b border-line pb-4 text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
                Our apps
              </p>

              <ul className="mt-7 divide-y divide-line-soft">
                {apps.map((p) => (
                  <AppRow key={p.slug} product={p} />
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
