import type { ReactNode } from "react";

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
function Icon({
  children,
  color = "text-accent",
}: {
  children: ReactNode;
  color?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`h-8 w-8 shrink-0 ${color}`}
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/**
 * A drawn underline, for the two quoted phrases in the heading.
 *
 * `preserveAspectRatio="none"` so one path stretches to whatever the
 * phrase measures, and `vector-effect="non-scaling-stroke"` so that
 * stretch does not squash the stroke with it — without the second, a
 * path flattened to a third of an em comes out as a hairline.
 *
 * Drawn rather than `text-decoration`, because an underline is a
 * straight rule under the whole phrase; this is a stroke with a slight
 * rise and fall in it, which reads as a mark someone made.
 */
function Underline({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 12"
      fill="none"
      preserveAspectRatio="none"
      aria-hidden="true"
      className={`absolute inset-x-0 -bottom-1 h-[0.3em] w-full ${className}`}
    >
      <path
        d="M3 8.6C41 4.4 93 2.9 135 4.9c21 1 42 2.4 62 3.8"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinecap="round"
        vectorEffect="non-scaling-stroke"
      />
    </svg>
  );
}

/**
 * What "made in India, made for India" means in practice — the four on
 * the homepage panel.
 *
 * Kept apart from `VALUES` below rather than replacing it, and the two
 * are not the same claim in different words: these are about who the
 * products are priced, designed and staffed FOR, where `VALUES` is about
 * how the company is set up to build and run them. /about renders those
 * and only those, so the homepage changing does not quietly rewrite what
 * the company says it believes.
 *
 * Every line here is a checkable claim about the business — rupee
 * pricing with no enterprise gate, phone-first design, support in IST in
 * English and Hindi. Worth confirming each still holds before this
 * ships, because each is the sort a customer can hold us to.
 */
const INDIA_PRINCIPLES: { title: string; body: string; icon: ReactNode }[] = [
  {
    title: "Priced in rupees. Priced honestly.",
    body: "No dollar billing, no hidden markups, no features locked behind enterprise calls. Our pricing works for a two-person shop in Indore and a hundred-person brand in Bengaluru.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M9.5 8h5M9.5 10.8h5M13.5 8c0 2.1-1.4 2.8-3.2 2.8H9.5l4.3 5.2" />
      </>
    ),
  },
  {
    title: "Mobile before desktop",
    body: "Most of India meets the internet on a phone. We design for that screen first — and for networks that aren't always perfect.",
    icon: (
      <>
        <rect x="7" y="2.5" width="10" height="19" rx="2.5" />
        <path d="M11 18.5h2" />
      </>
    ),
  },
  {
    title: "Support in your time zone",
    body: "Real people, working IST hours, in English and Hindi. No tickets routed across oceans.",
    icon: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 6.8V12l3.4 2" />
      </>
    ),
  },
  {
    title: "Built for here, not for export",
    body: "Our roadmap is shaped by the businesses and writers who use our products here, not by a market we're trying to impress abroad.",
    icon: (
      <>
        <path d="M5.5 21.5V3" />
        <path d="M5.5 3.8h11.8l-2.3 3.9 2.3 3.9H5.5" />
      </>
    ),
  },
];

/** Exported: /about renders these four in its own layout, so the
 *  company states its operating principles in exactly one set of words.
 *  No longer on the homepage — see `INDIA_PRINCIPLES` above, which took
 *  that panel over. */
export const VALUES: {
  title: string;
  body: string;
  color: string;
  icon: ReactNode;
}[] = [
  {
    title: "We build it and we run it",
    body: "We write the code, own the repositories and run the servers. Being an official Meta Tech Provider is our own integration with the WhatsApp Business Platform — not a licence bought from a middleman who could withdraw it.",
    color: "text-blue-600",
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
    color: "text-emerald-600",
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
    color: "text-amber-600",
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
    color: "text-purple-600",
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
const PANEL_H = 560;

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
      // Labelled from inside again. The banner above used to carry this
      // heading and this id with it, which is why the two components had
      // to stay adjacent; they no longer do.
      aria-labelledby="values-heading"
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
          // Hard shadow, matching the sector cards above: 4px across and
          // down, zero blur, black at 10%. It replaces a wide soft one
          // that was lifting the panel off the photograph; the hard
          // version does not lift it so much as set it down on top.
          className="flex flex-col justify-center rounded-lg border border-line bg-surface px-6 py-14 shadow-[4px_4px_0_0_rgb(0_0_0/0.1)] sm:px-12 sm:py-16"
          style={{ minHeight: PANEL_H }}
        >
          {/* The heading is back inside the panel. It spent a while on
              the banner above, so the picture introduced the values and
              the panel carried them; now the picture is only a picture
              and this is what labels the section.

              `<br />` rather than letting it wrap: the two sentences are
              a matched pair, and a break that lands anywhere other than
              between them breaks the rhyme. Each line is short enough
              that a phone wraps it again anyway. */}
          <h2
            id="values-heading"
            className="display mx-auto max-w-3xl text-center text-[clamp(1.375rem,2.6vw,2rem)] font-medium text-ink text-balance"
            // Inline, and a Tailwind `leading-*` class would not have
            // worked: `.display` is written as plain CSS in globals.css,
            // which leaves it UNLAYERED, and unlayered rules beat
            // everything inside `@layer utilities` no matter the order.
            // Its 1.04 is right for one line of display type and far too
            // tight for two — at that setting the drawn underline under
            // each phrase very nearly touches the line beneath it.
            style={{ lineHeight: 1.5 }}
          >
            {/* The flag's two colours, which is the whole reason these
                two strokes are different: saffron over the line about
                where we come from, green over the line about how we
                work.

                #FF9933 is the flag's saffron exactly. The site has no
                token for it and should not gain one — it means this
                heading and nothing else, where a palette entry would
                invite its use elsewhere. It replaces `--warning`, the
                gold reserved for "not shipped yet", which carried the
                wrong meaning here as much as the wrong hue.

                The green is `--brand-green` rather than the flag's own
                #138808. The two are close, and reusing the token the
                hero button already runs on keeps this page to one green
                instead of adding a fourth. Swap it for the literal if
                you want the pair exact. */}
            <span className="relative inline-block">
              &ldquo;Made in India&rdquo;
              <Underline className="text-[#FF9933]" />
            </span>{" "}
            is where we come from.
            <br />
            <span className="relative inline-block">
              &ldquo;Made for India&rdquo;
              <Underline className="text-brand-green" />
            </span>{" "}
            is how we work.
          </h2>

          {/* Two up on anything above a phone. No dividers — the icons
              and the whitespace already separate the four, and rules as
              well would be a grid drawn inside a bordered panel. */}
          <ul className="mt-14 grid gap-x-12 gap-y-11 sm:mt-16 sm:grid-cols-2">
            {INDIA_PRINCIPLES.map((value) => (
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

          {/* The "Talk to us" button that closed this panel is gone, to
              match the design this was converted to. Contact is not lost
              with it: the nav carries it, the closing panel at the foot
              of the page is entirely a call to action, and /contact is
              in the footer. Restoring it is one `<Link>`. */}
        </div>
      </div>
    </section>
  );
}
