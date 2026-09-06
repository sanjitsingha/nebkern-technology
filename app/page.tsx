import { Nav } from "@/components/site/nav";
import { Hero } from "@/components/site/hero";
import { Apps } from "@/components/site/apps";
import { About } from "@/components/site/about";
import { Statement } from "@/components/site/statement";
import { Approach } from "@/components/site/approach";
import { Cta } from "@/components/site/cta";
import { Footer } from "@/components/site/footer";

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
        <Hero />
        <Apps />
        <About />
        <Statement />
        <Approach />
        <Cta />
      </main>

      <Footer />
    </>
  );
}
