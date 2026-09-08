import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Apps } from "@/components/site/apps";
import { Slider } from "@/components/site/slider";
import { Banner } from "@/components/site/banner";
import { Values } from "@/components/site/values";
import { Statement } from "@/components/site/statement";
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

        <Reveal>
          <Apps />
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
        <Reveal>
          <Cta />
        </Reveal>
      </main>

      <Footer />
    </>
  );
}
