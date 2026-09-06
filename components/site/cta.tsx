import { LINKS, SITE } from "@/lib/site";

export function Cta() {
  return (
    <section className="border-t border-line-soft">
      <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="relative overflow-hidden bg-panel px-7 py-14 sm:px-14 sm:py-20">
          {/* A single soft light source, off-centre. Enough to keep a
              large ink field from reading as a flat rectangle. */}
          <div
            className="pointer-events-none absolute -top-32 -right-24 h-80 w-80 rounded-full opacity-[0.18] blur-3xl"
            style={{ background: "var(--accent)" }}
            aria-hidden="true"
          />

          <div className="relative max-w-2xl">
            <h2 className="display text-[2rem] font-semibold text-panel-fg sm:text-[2.75rem]">
              Tell us what your business actually needs.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-panel-muted text-pretty">
              Whether that is one of the products we already run or something
              nobody has built properly for India yet — we would rather hear the
              problem than pitch you a solution. Write to us and you will reach
              an engineer, not a queue.
            </p>

            <div className="mt-9 flex flex-col gap-3 sm:flex-row sm:items-center">
              <a
                href={LINKS.contact}
                className="inline-flex items-center justify-center gap-2 bg-accent text-accent-fg transition-colors hover:bg-accent-hover px-5 py-3 text-[0.9375rem] font-medium"
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
                className="inline-flex items-center justify-center border border-panel-line px-5 py-3 text-[0.9375rem] font-medium break-all text-panel-fg transition-colors hover:border-panel-fg/40"
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
