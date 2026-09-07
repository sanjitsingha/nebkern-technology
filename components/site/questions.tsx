import { LINKS } from "@/lib/site";

/**
 * The panel below the banner: a narrower column than the rest of the
 * page, and the answers to what a buyer actually asks before writing.
 *
 * Narrower on purpose. Every other band sits in the 6xl column, so
 * pulling this one in to 4xl is what marks it as a different KIND of
 * block — a single object on the page rather than another full-width
 * band — and a question-and-answer list wants a short measure anyway.
 *
 * `rounded-lg border border-line bg-surface` is not a new idea; it is
 * the same slab the apps section is built from. On a site that is
 * otherwise square-cornered, matching that one radius keeps this
 * reading as part of the system instead of a stray rounded box.
 */
const QUESTIONS = [
  {
    q: "Are you reselling somebody else's platform?",
    a: "No. We write the code, own the repositories and run the servers. When we say we are an official Meta Tech Provider, that is our own integration with the WhatsApp Business Platform — not a licence bought from a middleman who could withdraw it.",
  },
  {
    q: "Where does our data actually live?",
    a: "On infrastructure we operate, inside India. Nothing critical sits on a platform we cannot get into at two in the morning, and there is no reseller standing between you and the systems your business depends on.",
  },
  {
    q: "Do you take on custom projects?",
    a: "Rarely, and only when the work has a life beyond one customer. We build products we keep running, so a one-off build that nobody maintains after handover is the opposite of what we are set up to do. If your problem is genuinely unsolved, tell us anyway — that is how products start.",
  },
  {
    q: "Who do we talk to when something breaks?",
    a: "An engineer. We are small enough that the person who answers is the person who can fix it, and there is no account manager relaying a ticket to a team you never meet.",
  },
  {
    q: "What happens if we outgrow the product?",
    a: "You keep your data. Export is a feature, not a favour, and we would rather be told what is missing than watch a customer leave quietly — most of what we ship next comes from that conversation.",
  },
];

/** As specified. `min-h` rather than a hard `height` so the panel is
 *  exactly 800px wherever the answers fit inside it — every screen from
 *  a tablet up — and grows instead of clipping on a narrow phone, where
 *  five stacked answers simply need more room than that. A fixed height
 *  here would cut the last question in half on the devices least able
 *  to spare it. */
const PANEL_H = 800;

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

export function Questions() {
  return (
    <section
      id="questions"
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
      {/* 4xl against the 6xl the rest of the page uses. The outer
          padding stays identical, so the panel narrows from the middle
          rather than drifting off the page's own gutters. */}
      <div className="mx-auto max-w-4xl px-5 pb-20 sm:px-8 sm:pb-24">
        <div
          className="flex flex-col justify-center rounded-lg border border-line bg-surface px-6 py-14 shadow-[0_-2px_40px_-12px_rgb(0_0_0/0.18)] sm:px-12 sm:py-16"
          style={{ minHeight: PANEL_H }}
        >
          <div>
            <p className="text-[0.8125rem] font-medium tracking-[0.08em] text-accent uppercase">
              Before you write
            </p>
            <h2 className="mt-4 text-[clamp(1.75rem,3vw,2.375rem)] leading-[1.12] font-semibold tracking-[-0.026em] text-ink text-balance">
              The questions we get asked first.
            </h2>
          </div>

          {/* Dividers between rows rather than around them — inside a
              bordered panel, a second box per question would be a
              border drawn on top of a border. */}
          <dl className="mt-10 divide-y divide-line-soft border-t border-line-soft">
            {QUESTIONS.map(({ q, a }) => (
              <div key={q} className="py-6 first:pt-7">
                <dt className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">
                  {q}
                </dt>
                <dd className="mt-2 leading-relaxed text-muted text-pretty">
                  {a}
                </dd>
              </div>
            ))}
          </dl>

          <p className="mt-10 text-[0.9375rem] leading-relaxed text-muted">
            Something here not answered?{" "}
            <a
              href={LINKS.contact}
              className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
            >
              Ask us directly
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
