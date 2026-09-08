import type { ReactNode } from "react";

import { LINKS } from "@/lib/site";

/**
 * The panel that rides up onto the banner: the company's values, four
 * to a grid.
 *
 * This was a question-and-answer list until the heading changed to name
 * values instead. The substance is the same — every claim below is one
 * of the old answers restated as a statement — but a list of questions
 * under a values heading read as a mismatch.
 *
 * Still narrower than the page on purpose. Every other band sits in the
 * 6xl column, so holding this one at 5xl is what marks it as a
 * different KIND of block — a single object on the page rather than
 * another full-width band. The heading keeps its own 3xl measure
 * inside, since a centred line reads badly across a wide panel.
 *
 * `rounded-lg border border-line bg-surface` is not a new idea; it is
 * the same slab the apps section is built from. On a site that is
 * otherwise square-cornered, matching that one radius keeps this
 * reading as part of the system instead of a stray rounded box.
 */

/** Line icons, drawn inline rather than pulled from a set. Four glyphs
 *  is not worth a dependency, and drawing them here means they inherit
 *  `currentColor` and the site's stroke weight instead of arriving with
 *  their own. Deliberately distinct silhouettes — a stack and a cube at
 *  this size read as the same shape. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-8 w-8 shrink-0 text-accent"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

const VALUES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "We build it and we run it",
    body: "We write the code, own the repositories and run the servers. Being an official Meta Tech Provider is our own integration with the WhatsApp Business Platform — not a licence bought from a middleman who could withdraw it.",
    icon: (
      <>
        <rect x="3" y="4" width="18" height="6" />
        <rect x="3" y="14" width="18" height="6" />
        <path d="M7 7h.01M7 17h.01" />
      </>
    ),
  },
  {
    title: "Your data stays in India",
    body: "Everything runs on infrastructure we operate, inside the country. Nothing critical sits on a platform we cannot get into at two in the morning, and no reseller stands between you and the systems your business depends on.",
    icon: (
      <>
        <path d="M12 3l7 3v5c0 4.5-3 7.6-7 9-4-1.4-7-4.5-7-9V6l7-3z" />
        <path d="M9 12l2 2 4-4" />
      </>
    ),
  },
  {
    title: "Products, not one-off projects",
    body: "We build software we keep running, so improvements arrive without a fresh invoice. A build nobody maintains after handover is the opposite of what we are set up to do.",
    icon: (
      <>
        <path d="M12 3l9 5-9 5-9-5 9-5z" />
        <path d="M3 12.5l9 5 9-5" />
        <path d="M3 17l9 5 9-5" />
      </>
    ),
  },
  {
    title: "You reach the people who built it",
    body: "The person who answers is the person who can fix it — no account manager relaying a ticket to a team you never meet. And if you ever outgrow us, export is a feature, not a favour.",
    icon: (
      <>
        <path d="M20 13.5a2 2 0 0 1-2 2H8l-4 3.5V6a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v7.5z" />
        <path d="M8.5 9.5h7M8.5 12.5h4" />
      </>
    ),
  },
];

/** `min-h` rather than a hard `height` so the panel keeps its intended
 *  presence wherever the content fits inside it, and grows instead of
 *  clipping on a narrow phone where four stacked values need more room
 *  than that. A fixed height would cut the last one in half on the
 *  devices least able to spare it. */
const PANEL_H = 720;

/**
 * How far the panel rides up onto the banner above it.
 *
 * Fluid for the same reason the banner is: the photograph reflows with
 * the viewport, so a fixed bite out of it is a different bite at every
 * width. The floor keeps the overlap legible on a phone, where 7vw is
 * barely a finger-width; the ceiling stops the panel from climbing so
 * far up a wide monitor that it covers the people in the frame.
 *
 * The section carries this as a negative top margin and NO top padding
 * — the two would otherwise fight, and the number here would stop
 * meaning "pixels of overlap". The bottom padding is still doing its
 * usual job of separating this from the grey band below.
 */
const OVERLAP = "clamp(56px, 7vw, 112px)";

export function Values() {
  return (
    <section
      id="values"
      // `relative` + `z-10` because a negative margin alone only
      // moves the box; it does not decide what paints on top. The
      // banner is itself positioned (its image is `fill`), so this
      // states the stacking rather than relying on document order.
      //
      // The section stays transparent: only the white panel should
      // cover the photograph, and the gutters either side of it let
      // the image carry on showing through.
      className="relative z-10 scroll-mt-20"
      style={{ marginTop: `calc(${OVERLAP} * -1)` }}
    >
      {/* The outer padding matches the rest of the page, so the panel
          narrows from the middle rather than drifting off the page's
          own gutters. */}
      <div className="mx-auto max-w-5xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div
          className="flex flex-col justify-center rounded-lg border border-line bg-surface px-6 py-14 shadow-[0_-2px_40px_-12px_rgb(0_0_0/0.18)] sm:px-12 sm:py-16"
          style={{ minHeight: PANEL_H }}
        >
          <div className="text-center">
            <h2 className="mx-auto max-w-3xl text-[clamp(2rem,3.6vw,3rem)] leading-[1.1] font-semibold tracking-[-0.028em] text-ink text-balance">
              The core values and principles that drive us
            </h2>

            {/* A short rule under the heading rather than a full-width
                divider: it marks the end of the title without cutting
                the panel in two. */}
            <span
              className="mx-auto mt-7 block h-[3px] w-12 bg-accent"
              aria-hidden="true"
            />
          </div>

          {/* Two up on anything above a phone. No dividers — the icons
              and the whitespace already separate the four, and rules as
              well would be a grid drawn inside a bordered panel. */}
          <ul className="mt-12 grid gap-x-12 gap-y-11 sm:grid-cols-2">
            {VALUES.map((value) => (
              <li key={value.title} className="flex gap-5">
                <Icon>{value.icon}</Icon>

                <div>
                  <h3 className="text-[1.1875rem] font-semibold tracking-[-0.018em] text-ink text-balance">
                    {value.title}
                  </h3>
                  <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                    {value.body}
                  </p>
                </div>
              </li>
            ))}
          </ul>

          <div className="mt-14 flex justify-center">
            <a
              href={LINKS.contact}
              className="inline-flex items-center gap-2 border border-line px-6 py-3 text-[0.9375rem] font-semibold text-accent transition-colors hover:border-accent"
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
          </div>
        </div>
      </div>
    </section>
  );
}
