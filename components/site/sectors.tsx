import Image from "next/image";
import type { ReactNode } from "react";

/**
 * The sectors band — who the products are built for, scrolling.
 *
 * Replaces the Ask Maya spotlight on the homepage. `maya-spotlight.tsx`
 * is untouched and putting it back is one import and one line; the nav
 * and the footer both still link the playground, so nothing is orphaned
 * by its absence here.
 *
 * NOTE ON THE COPY: the blurbs below are mine, and describe what the
 * products DO for each sector rather than claiming a customer in it.
 * That distinction is deliberate — "appointments and reminders, without
 * the phone tag" is a capability, where "trusted by clinics across
 * India" would be a customer claim this site cannot yet support. Edit
 * them freely; keep them on the capability side of that line.
 */

/**
 * The two tones the icons are drawn in.
 *
 * The design these came from used crimson over navy. Those would be two
 * new brand colours on a page that already carries an indigo accent and
 * three different greens, so the icons use the accent over soft ink
 * instead — the same pairing as the rest of the site. Both tones are
 * named here precisely so that is one edit to reverse.
 */
const STRUCTURE = "text-ink-soft";
const HIGHLIGHT = "text-accent";

/** Shared across all eight: one grid, one weight, round joins. Drawn
 *  rather than imported so the pair of tones stays under our control. */
function Icon({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox="0 0 32 32"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={`h-11 w-11 ${STRUCTURE}`}
    >
      {children}
    </svg>
  );
}

/** The accented part of an icon. A `<g>` carrying a text colour, so the
 *  `stroke="currentColor"` on the root resolves to the highlight inside
 *  it and to the structure tone everywhere else. */
function Accent({ children }: { children: ReactNode }) {
  return <g className={HIGHLIGHT}>{children}</g>;
}

type Sector = {
  name: string;
  blurb: string;
  /** The photograph filling the top 70% of the card. */
  image: string;
  /** NOT RENDERED at the moment — the photograph took the space the
   *  icon had. Kept because these eight are drawn by hand in this file
   *  and nowhere else, so deleting them loses them outright. Say the
   *  word and they go, or they come back as a badge on the photo. */
  icon: ReactNode;
};

/**
 * PLACEHOLDER. One photograph standing in for all eight, so the card
 * can be judged before there are eight real ones.
 *
 * Two things to settle before this ships. It is a stock shot of what
 * looks like a European supermarket, on a band whose whole argument is
 * "built for India" — which is the kind of mismatch a visitor notices
 * without being able to say why. And the licence needs to be yours.
 */
const PLACEHOLDER_IMAGE = "/images/sectors/retail.png";

const SECTORS: Sector[] = [
  {
    name: "Health care",
    blurb: "Appointments and reminders, without the phone tag.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <rect x="4" y="11" width="24" height="15" rx="2.5" />
        <path d="M12 11V8a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v3" />
        <Accent>
          <path d="M16 15v7M12.5 18.5h7" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Retail and D2C",
    blurb: "Order questions answered at national volume.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M6.5 11h19L24 27H8Z" />
        <Accent>
          <path d="M12 11V8.5a4 4 0 0 1 8 0V11" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Real estate",
    blurb: "Site visits booked and followed up in one thread.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M7 13v14h18V13M14 27v-7h4v7" />
        <Accent>
          <path d="M4 14 16 5l12 9" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Finance",
    blurb: "Statements and reminders that actually get read.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M9 14v9M16 14v9M23 14v9M6 26h20" />
        <Accent>
          <path d="M4 12l12-6 12 6" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Education",
    blurb: "Admissions enquiries answered the day they arrive.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M8 15.5V22c0 2 3.6 3.5 8 3.5s8-1.5 8-3.5v-6.5" />
        <Accent>
          <path d="M3 13l13-6 13 6-13 6Z" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Hospitality",
    blurb: "Bookings, menus and table enquiries in one place.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M7 13h16v7a6 6 0 0 1-6 6h-4a6 6 0 0 1-6-6ZM23 15h2.5a3.5 3.5 0 0 1 0 7H23" />
        <Accent>
          <path d="M12 9V6M17 9V6" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Logistics",
    blurb: "Delivery updates customers do not have to chase.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M3 10h14v12H3Z" />
        <circle cx="9" cy="24" r="2.5" />
        <circle cx="22" cy="24" r="2.5" />
        <Accent>
          <path d="M17 14h5l4 4v4h-9Z" />
        </Accent>
      </Icon>
    ),
  },
  {
    name: "Local services",
    blurb: "Every enquiry routed to whoever is free.",
    image: PLACEHOLDER_IMAGE,
    icon: (
      <Icon>
        <path d="M16 28s9-8.5 9-14a9 9 0 1 0-18 0c0 5.5 9 14 9 14Z" />
        <Accent>
          <circle cx="16" cy="14" r="3.5" />
        </Accent>
      </Icon>
    ),
  },
];

function Card({ sector, inCopy }: { sector: Sector; inCopy: 0 | 1 }) {
  return (
    <li
      // The second run exists only to make the loop seamless. Under
      // reduced motion the track stops and wraps instead, where a second
      // run would read as the list said twice — so it is dropped there.
      // Hard shadow: 4px across and down, zero blur, black at 10%. The
      // zero is what makes it hard — every other shadow on this site is
      // a soft one, so this is written out rather than reached for from
      // the scale, which has no hard step.
      // `h-`, not `min-h-`, and that is the whole reason the split
      // works: a percentage height resolves against the parent's height,
      // so the two children below can only be 70% and 30% of something
      // definite. Under a `min-h` they would have had nothing to be a
      // percentage OF and would have collapsed to their content.
      //
      // 480px splits into 336 for the photograph and 144 for the words.
      // The floor is what the words need — 40 of padding, a 22px title,
      // an 8px gap and two 22px lines, so 114 — and anything under that
      // clips the second line of the longer blurbs. The rest of the
      // height goes to the picture, which is the point of the card.
      //
      // `overflow-hidden` so the photograph is cut by the card's rounded
      // corners rather than squaring them off.
      className={`flex h-[30rem] w-96 shrink-0 flex-col overflow-hidden rounded-lg border border-line bg-surface shadow-[4px_4px_0_0_rgb(0_0_0/0.1)] ${
        inCopy === 1 ? "motion-reduce:hidden" : ""
      }`}
      aria-hidden={inCopy === 1 ? "true" : undefined}
    >
      {/* `relative` because `fill` positions against the nearest
          positioned ancestor, and `fill` rather than a width/height pair
          because the crop is what matters here: the box is a fixed
          shape and the photograph should cover it, whatever its own
          proportions are.

          `alt=""` on purpose. The sector's name is directly below in
          text, and with one placeholder repeated across eight cards an
          alt would be the same sentence read out eight times. */}
      <div className="relative h-[70%] w-full">
        {/* Greyscale, the same treatment as the banner photograph lower
            down — and the same reasoning: the only colour this band
            carries is its own pale green wash and the accent in the
            heading, so a full-colour photograph repeated eight times
            across would be the loudest thing on the page. `contrast` is
            nudged up because desaturating flattens a picture. */}
        <Image
          src={sector.image}
          alt=""
          fill
          sizes="384px"
          className="object-cover grayscale contrast-[1.08]"
        />
      </div>

      <div className="flex h-[30%] flex-col justify-center px-5">
        <h3 className="text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink">
          {sector.name}
        </h3>
        <p className="mt-2 text-[0.9375rem] leading-relaxed text-muted text-pretty">
          {sector.blurb}
        </p>
      </div>
    </li>
  );
}

export function Sectors() {
  return (
    <section
      aria-labelledby="sectors-heading"
      // The palest wash of the hero button's green rather than another
      // literal: one more hardcoded tint is the thing this page has too
      // many of already. At 5% it reads as a tinted paper, not as colour.
      style={{
        background:
          "color-mix(in oklab, var(--brand-green) 5%, var(--surface))",
      }}
    >
      {/* Top-heavy on purpose. The products card above hangs 64px past
          its own section into this one (80px from `sm`), so that much of
          this padding sits behind the card and never shows. At the 80px
          this started on, the heading cleared the card by 16px and read
          as crowded against it; 160px leaves a real 96px of gap, and
          192px leaves 112px from `sm`.

          So the two figures are not comparable: the top one is measured
          from a card edge that is not this section's edge, the bottom
          one from the section itself. Which is why the top number still
          looks much larger than the bottom one while the band reads as
          evenly padded. */}
      <div className="mx-auto max-w-6xl px-5 pt-40 sm:px-8 sm:pt-48">
        {/* Left-aligned, unlike the centred headings elsewhere on the
            page: the cards below run off the right edge, and a centred
            heading over a left-anchored row reads as a mistake. */}
        {/* No `max-w` on this one. The 42rem cap it had was narrower
            than the line needs, so the heading wrapped inside a
            container with 400px to spare on either side; without it the
            full 72rem is available and the sentence sits on one line.

            Left to fit rather than forced with `whitespace-nowrap`,
            which would hold one line right up to the point of pushing a
            horizontal scrollbar onto the page. This way the break comes
            back on its own below roughly 720px, which is a phone, where
            a 47-character heading has to wrap anyway. */}
        <h2
          id="sectors-heading"
          className="display text-[clamp(1.75rem,3.2vw,2.5rem)] font-medium text-ink text-balance"
        >
          Built for the businesses that keep India moving.
        </h2>
        <p className="mt-4 max-w-xl text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
          From a neighbourhood clinic to a national D2C brand, our products are
          shaped by the sectors that serve India every day.
        </p>
      </div>

      {/* Outside the container on purpose, not nudged out of it with a
          negative margin. The row is the full width of the window, so
          cards enter at one screen edge and leave at the other, and no
          edge fade marks where that happens — a card is simply cut by
          the window, which is what says the row keeps going.

          Horizontal padding cannot go on the `ul`: the loop translates
          the track by exactly -50%, which only lands the second run
          where the first began while the track is twice one run and
          nothing else. Padding would add to the width and the seam
          would drift by that much every cycle. */}
      <div className="mt-16 overflow-hidden pb-28 sm:mt-20 sm:pb-32">
        {/* `pb-1.5` is room for the cards' hard shadow, not spacing.
            The wrapper above clips, and its height is exactly the
            tallest card's — so the 4px of shadow below each card fell
            outside the box and was cut off, while the 4px to the right
            landed in the `gap-5` between cards and survived. Six
            pixels of padding puts the bottom edge back inside.

            Under reduced motion the track stops, so the -50% no longer
            matters and the gutters can come back: it becomes a centred,
            wrapping grid at the same 6xl width as the heading above.
            Both `motion-reduce:px-5` and `sm:motion-reduce:px-8` are
            set, and the stacked one is what gives the wider gutter from
            `sm` up, because Tailwind emits that bucket last.

            `animation-duration` is overridden here rather than on the
            shared `--animate-marquee` token, which is also what the logo
            band in brand-band.tsx runs on: its 45s was set for small
            marks, and these cards are six times the width. 100s puts the
            row at about 25px a second, slow enough to read a card
            without following it. */}
        <ul className="flex w-max animate-marquee gap-5 pb-1.5 [animation-duration:100s] hover:[animation-play-state:paused] motion-reduce:mx-auto motion-reduce:w-full motion-reduce:max-w-6xl motion-reduce:animate-none motion-reduce:flex-wrap motion-reduce:px-5 sm:motion-reduce:px-8">
          {([0, 1] as const).map((copy) =>
            SECTORS.map((sector) => (
              <Card
                key={`${copy}-${sector.name}`}
                sector={sector}
                inCopy={copy}
              />
            )),
          )}
        </ul>
      </div>
    </section>
  );
}
