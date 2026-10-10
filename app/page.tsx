import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { ProductSplit } from "@/components/site/product-split";
import { Sectors } from "@/components/site/sectors";
import { Slider } from "@/components/site/slider";
import { Banner } from "@/components/site/banner";
import { Values } from "@/components/site/values";
import { Statement } from "@/components/site/statement";
import { Feedback } from "@/components/site/feedback";
import { HomeFaq } from "@/components/site/home-faq";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";
import { Reveal } from "@/components/site/reveal";

// Hero states the company, the slab shows what it ships, then the rest
// of the page backs both up. Nebkern is the subject of this site; the
// products each have their own site to do the selling.
//
// Fully static — nothing here reads the database or the request, so the
// whole page prerenders once at build time.
export default function Home() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" className="flex-1">
        {/* The hero is deliberately not wrapped. It is on screen at
            load, so it has nothing to scroll into — animating it would
            just delay the first thing anyone reads. */}
        <Hero />

        {/* The gradient products band and the credentials strip under it
            both used to sit here. They are off the homepage, NOT deleted
            — components/site/products-band.tsx (with its carousel) and
            components/site/brand-band.tsx are untouched, and putting
            either back is one import and one line. The catalogue they
            showed still has a page of its own at /products, which is
            where the hero's button now goes. */}

        {/* The two-panel card. Not wrapped in `Reveal`: part of it is on
            screen at load, under the hero, and animating something
            already visible reads as a glitch. It hangs into the section
            below it, which is why it comes before that section rather
            than inside it. */}
        <ProductSplit />

        {/* Who the products are for, straight after what they are.
            This replaced the Ask Maya spotlight, which is off the
            homepage but NOT deleted — components/site/maya-spotlight.tsx
            is untouched, and the nav and footer both still link the
            playground, so nothing is stranded by its absence. */}
        <Reveal>
          <Sectors />
        </Reveal>
        <Reveal>
          <Banner />
        </Reveal>
        <Reveal>
          <Values />
        </Reveal>
        <Reveal>
          <Slider />
        </Reveal>
        <Reveal>
          <Statement />
        </Reveal>

        {/* A client, between the conviction above and the questions
            below: having made the argument ourselves, this is a business
            actually running on it.

            No longer guarded. The section used to hold invented quotes
            and was gated out of production so they could never reach the
            live domain; it now carries Instant's showcase, whose words
            are ours and whose client is real. */}
        <Reveal>
          <Feedback />
        </Reveal>

        {/* Answers before the ask: the questions come last, then the
            closing panel. On paper rather than grey, so it separates
            from the statement band directly above it. */}
        <Reveal>
          <HomeFaq />
        </Reveal>
        <Reveal>
          <Cta />
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
