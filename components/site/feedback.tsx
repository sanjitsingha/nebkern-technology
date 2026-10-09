import Image from "next/image";

/**
 * The client showcase, carried over from Instant's own homepage — the
 * same section, the same words, the same shape, in this site's colours.
 *
 * WHAT IT DELIBERATELY IS NOT: a quote. The line beside the photograph
 * is OUR description of what the client does with Instant, not their
 * words, and it carries no quotation marks and no named speaker for
 * that reason. Putting invented words next to a real business's logo
 * publishes an endorsement they never gave — a fake review, which
 * India's consumer-protection rules and the FTC both treat as an
 * actionable claim rather than as a to-do. The quote cards that used to
 * stand here held invented names and were gated out of production for
 * the same reason; this replaces them with something that can actually
 * be published.
 *
 * When Rahul Catering Services sends words of their own, in writing,
 * this becomes a quote: wrap the line in a <blockquote>, attribute it,
 * and nothing else changes. Instant's copy of this section carries the
 * same note.
 *
 * Deliberately NO `Review` or `AggregateRating` structured data, even
 * then. Google does not allow an organisation to mark up reviews of
 * itself on its own site; doing it is ineligible for rich results at
 * best and a manual action at worst.
 */

/** Our words about their use of the product, not a quote from them. */
const SHOWCASE_COPY =
  "Catering enquiries, menus and bookings — all on one WhatsApp number, answered by whoever on the team is free.";

/** The client, and the two assets they appear through. Both files are
 *  copies of Instant's, under public/images/showcase. */
const CLIENT = {
  name: "Rahul Catering Services",
  photo: {
    src: "/images/showcase/rahul-catering-services.png",
    width: 1086,
    height: 1448,
  },
  logo: {
    src: "/images/showcase/rahul-catering-logo.png",
    width: 1714,
    height: 1247,
  },
} as const;

/** Inert until there is a second client to move between — `disabled`
 *  rather than a control that answers a press by doing nothing. Instant
 *  carries the same pair, in the same state, for the same reason. */
function Arrow({ back = false }: { back?: boolean }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.7"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
      aria-hidden="true"
    >
      <path d={back ? "M13 8H3M7 4L3 8l4 4" : "M3 8h10M9 4l4 4-4 4"} />
    </svg>
  );
}

export function Feedback() {
  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="scroll-mt-20 bg-surface-2"
    >
      <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8 sm:py-24">
        {/* Title left, controls right — the header shape Instant uses
            here and the products carousel uses above. */}
        <div className="flex flex-col gap-8 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-3xl">
            <h2
              id="feedback-heading"
              className="display text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium text-ink text-pretty"
            >
              Hear from the power users of Instant
            </h2>
            <p className="mt-5 max-w-xl text-lg leading-relaxed text-muted text-pretty">
              Teams running their bookings, enquiries and follow-ups through one
              shared WhatsApp number — and what changed once they did.
            </p>
          </div>

          <div className="flex shrink-0 gap-3">
            {[
              { label: "Previous client", back: true },
              { label: "Next client", back: false },
            ].map(({ label, back }) => (
              <button
                key={label}
                type="button"
                aria-label={label}
                disabled
                className="grid size-11 place-items-center rounded-full border border-line text-ink transition-colors hover:border-ink/25 disabled:pointer-events-none disabled:opacity-30"
              >
                <Arrow back={back} />
              </button>
            ))}
          </div>
        </div>

        {/* The tile. `relative` so the logo can hang in the bottom-right
            corner. White on the section's grey, so it reads as a raised
            surface — the same move Instant makes against its cream. */}
        <div className="relative mt-12 overflow-hidden rounded-[25px] bg-surface p-2 shadow-[4px_4px_0_2px_rgb(0_0_0/0.05)] sm:mt-14 sm:flex sm:h-[500px] sm:items-center sm:gap-10">
          {/* Greyscale so it reads as a backdrop for the line rather than
              competing with it — and so the logo is the only colour in
              the tile. Sized by height on the row so the portrait stays
              whole instead of being cropped; on a phone the tile stacks
              and the photograph takes a fixed band at the top. */}
          <Image
            src={CLIENT.photo.src}
            alt={`${CLIENT.name} on WhatsApp`}
            width={CLIENT.photo.width}
            height={CLIENT.photo.height}
            sizes="(min-width: 640px) 320px, 100vw"
            className="h-56 w-full rounded-[16px] object-cover object-top grayscale sm:h-full sm:w-auto sm:object-contain"
          />

          {/* The line sits in the middle of whatever width is left, not
              of the tile, so it stays centred as the photograph takes its
              share. The bottom padding keeps it clear of the logo. */}
          <div className="flex flex-1 items-center justify-center px-5 pt-8 pb-24 sm:px-6 sm:py-16">
            <p className="max-w-[62ch] text-left text-[clamp(1.25rem,2.4vw,1.875rem)] leading-[1.3] font-medium text-ink text-balance">
              {SHOWCASE_COPY}
            </p>
          </div>

          <Image
            src={CLIENT.logo.src}
            alt={CLIENT.name}
            width={CLIENT.logo.width}
            height={CLIENT.logo.height}
            sizes="180px"
            className="absolute right-6 bottom-5 h-12 w-auto object-contain sm:right-8 sm:bottom-6 sm:h-16"
          />
        </div>
      </div>
    </section>
  );
}
