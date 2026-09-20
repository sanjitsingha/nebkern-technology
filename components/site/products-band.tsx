import Link from "next/link";

import { Arrow } from "@/components/site/page";
import { ProductCarousel } from "@/components/site/product-carousel";
import { PRODUCTS } from "@/lib/products";

/**
 * The homepage's products band: the claim on the left, the catalogue on
 * the right, on a blue-to-cyan gradient.
 *
 * It replaces the white slab that used to straddle the hero's seam. The
 * copy is that slab's, carried over word for word.
 *
 * Colour and contrast. The gradient holds #1243a0 flat across the left
 * half and runs to #2da3c2 at the right edge. White on that blue is
 * 9.0:1, but white on the cyan is 2.9:1 — under the 4.5:1 AA needs — so
 * nothing relies on the cyan carrying text: the copy sits on the blue
 * half, and every product is a white card with ink on it. On a phone
 * there are no halves to sit in, so the gradient runs top-to-bottom
 * instead and the copy keeps the blue end.
 *
 * `id="products"` is load-bearing: the hero's one button links here.
 */

/** Blue to the middle, then cyan — written twice because Tailwind reads
 *  class names literally and cannot see an interpolated string. */
const GRADIENT =
  "bg-[linear-gradient(to_bottom,#1243a0,#1243a0_50%,#2da3c2)] lg:bg-[linear-gradient(to_right,#1243a0,#1243a0_50%,#2da3c2)]";

export function ProductsBand() {
  return (
    <section
      id="products"
      aria-labelledby="products-heading"
      className={`scroll-mt-20 ${GRADIENT}`}
    >
      <div className="mx-auto flex max-w-7xl flex-col justify-center gap-12 px-5 py-12 sm:px-8 sm:py-16 lg:grid lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
        <div>
          <h2
            id="products-heading"
            className="display text-[clamp(2rem,3.8vw,2.75rem)] font-semibold text-white text-balance"
          >
            Two products. One platform.
          </h2>

          {/* white/80 rather than a grey: on this blue it reads as the
              same ink at a lower weight, and still clears AA at 7.2:1. */}
          <p className="mt-5 text-[1.0625rem] leading-relaxed text-white/80 text-pretty">
            Both built, hosted and supported by the same team, on infrastructure
            we run ourselves. Adopt one and the next is already configured.
          </p>

          <Link
            href="/products"
            className="group mt-8 inline-flex items-center gap-2 text-[0.9375rem] font-semibold text-white"
          >
            <span className="border-b border-white/40 pb-0.5 transition-colors group-hover:border-white">
              All products
            </span>
            <Arrow />
          </Link>
        </div>

        <ProductCarousel products={PRODUCTS} />
      </div>
    </section>
  );
}
