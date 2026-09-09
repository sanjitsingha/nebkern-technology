import { TypewriterEffectSmooth } from "@/components/ui/typewriter-effect";
import { LINKS, SITE } from "@/lib/site";

/**
 * The headline, split for the typewriter.
 *
 * It takes an array of words rather than a string because it animates
 * per word, so the sentence has to be written this way round. The last
 * two carry the accent — the same device the Made-in-India statement
 * uses, where the second half is the half that makes the point.
 */
const HEADLINE = [
  { text: "Tell" },
  { text: "us" },
  { text: "what" },
  { text: "your" },
  { text: "business" },
  { text: "actually", className: "text-accent" },
  { text: "needs.", className: "text-accent" },
];

export function Cta() {
  return (
    <section className="border-t border-line-soft">
      {/* The dark panel is gone, and with it the accent glow that sat
          behind it — that existed to stop a large ink field reading as
          a flat rectangle, and there is no ink field now. No border
          either: the section is the content, centred on the page. */}
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="px-7 py-14 sm:px-14 sm:py-20">
          <div className="mx-auto max-w-2xl text-center">
            {/* `TypewriterEffectSmooth` sets `white-space: nowrap`, so
                this line CANNOT wrap — it reveals by widening a clipped
                box, and wrapping would break that. The size is
                therefore capped by how much room the longest line has,
                not by taste: at the small end it has to stay narrow
                enough that a phone does not scroll sideways.

                `my-0` overrides the component's own `my-6`; the spacing
                below belongs to the paragraph. */}
            <TypewriterEffectSmooth
              words={HEADLINE}
              className="my-0 justify-center text-[clamp(1rem,3.1vw,2.25rem)] text-ink"
              cursorClassName="bg-accent"
            />

            <p className="mx-auto mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Whether that is one of the products we already run or something
              nobody has built properly for India yet — we would rather hear the
              problem than pitch you a solution. Write to us and you will reach
              an engineer, not a queue.
            </p>

            <div className="mt-9 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
              <a
                href={LINKS.contact}
                className="inline-flex items-center justify-center gap-2 bg-accent px-5 py-3 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
              >
                Talk to us
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M3 8h10M9 4l4 4-4 4" />
                </svg>
              </a>
              <a
                href={`mailto:${SITE.email}`}
                className="inline-flex items-center justify-center border border-line px-5 py-3 text-[0.9375rem] font-medium break-all text-ink transition-colors hover:border-ink/25"
              >
                {SITE.email}
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
