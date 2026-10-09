/**
 * What clients say, on the homepage.
 *
 * Currently holding PLACEHOLDER quotes — see `PLACEHOLDER` below. They
 * exist so the section can be designed and reviewed against realistic
 * content, and they are gated out of the production build.
 *
 * Deliberately NO `Review` or `AggregateRating` structured data, even
 * once the quotes are real. Google does not allow an organisation to
 * mark up reviews of itself on its own site; doing it is ineligible for
 * rich results at best and a manual action at worst. The quotes are here
 * to be read by people.
 */
export type Testimonial = {
  /** Their words, not ours. No quotation marks — the design adds them. */
  quote: string;
  name: string;
  /** Job title, and the business. Both matter: a quote from "Rahul" is
   *  worth less than one from "Rahul, who runs a catering company". */
  role: string;
  company: string;
};

/**
 * INVENTED COPY. Every quote, name and company below is made up — there
 * is no Sunrise Catering, no Meridian Interiors, no Kalpana Textiles,
 * and nobody said any of this.
 *
 * Lengths vary on purpose: three quotes of different sizes are what
 * actually tests whether the cards still bottom out on one line.
 *
 * Replace the whole array when real quotes arrive. Nothing else needs to
 * change.
 */
const PLACEHOLDER: Testimonial[] = [
  {
    quote:
      "We were answering the same five questions on WhatsApp about sixty times a day. Those are handled now, and the conversations that do reach a person are the ones actually worth a person.",
    name: "Ananya Rao",
    role: "Operations Lead",
    company: "Sunrise Catering",
  },
  {
    quote:
      "Setup took an afternoon. What I had not expected was being able to read back, a month later, exactly what customers kept asking for.",
    name: "Vikram Mehta",
    role: "Founder",
    company: "Meridian Interiors",
  },
  {
    quote:
      "I had tried two chatbots before this and switched both off inside a week, because they answered confidently and wrongly. This one says it does not know, and hands the chat over. That is the whole difference.",
    name: "Priya Nair",
    role: "Customer Experience",
    company: "Kalpana Textiles",
  },
];

/**
 * Placeholders render locally and on preview deploys; the production
 * build gets an empty list, so the section disappears from nebkern.com.
 *
 * This is not squeamishness about unfinished copy. A made-up quote with
 * a named person attached, served from the live domain, is a fake
 * review — something India's consumer-protection rules and the FTC both
 * treat as an actionable claim rather than as a to-do. The gate means
 * the design can be worked on without that ever being one push away.
 *
 * `VERCEL_ENV` is "production" only for the live domain; preview deploys
 * report "preview", and it is undefined on this machine. The page is
 * statically prerendered, so this is decided once, at build time.
 *
 * To put the placeholders on the live site anyway, make this
 * `= PLACEHOLDER`.
 */
export const FEEDBACK: Testimonial[] =
  process.env.VERCEL_ENV === "production" ? [] : PLACEHOLDER;

/** The homepage asks this before rendering, so an empty list costs no
 *  markup at all — not even an empty section wrapper. */
export const hasFeedback = FEEDBACK.length > 0;

function Quote({ testimonial }: { testimonial: Testimonial }) {
  return (
    <figure className="flex h-full flex-col rounded-lg border border-line bg-surface p-7 sm:p-8">
      {/* A drawn quote mark rather than a typed one: at this size a real
          “ sits on the text baseline and drifts with the font, where
          this stays put. */}
      <svg
        viewBox="0 0 32 24"
        fill="currentColor"
        aria-hidden="true"
        className="h-5 w-7 shrink-0 text-accent/30"
      >
        <path d="M0 24V13.5C0 6 4.5 1 12 0v4.5C7.8 5.5 5.6 8 5.4 12H12v12H0Zm20 0V13.5C20 6 24.5 1 32 0v4.5c-4.2 1-6.4 3.5-6.6 7.5H32v12H20Z" />
      </svg>

      <blockquote className="mt-5 flex-1 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
        {testimonial.quote}
      </blockquote>

      <figcaption className="mt-6 border-t border-line-soft pt-5">
        <span className="block text-[0.9375rem] font-semibold tracking-[-0.015em] text-ink">
          {testimonial.name}
        </span>
        <span className="mt-0.5 block text-[0.875rem] text-muted">
          {testimonial.role}, {testimonial.company}
        </span>
      </figcaption>
    </figure>
  );
}

export function Feedback() {
  if (!hasFeedback) return null;

  return (
    <section
      id="feedback"
      aria-labelledby="feedback-heading"
      className="scroll-mt-20 bg-surface-2"
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        {/* The centred heading over a short accent rule — the device the
            values panel and the FAQ both use for a section that speaks
            to the reader rather than describing the company. */}
        <div className="text-center">
          <h2
            id="feedback-heading"
            className="display mx-auto max-w-2xl text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium text-ink text-balance"
          >
            What the people using it say
          </h2>
          <span
            className="mx-auto mt-7 block h-[3px] w-12 bg-accent"
            aria-hidden="true"
          />
        </div>

        {/* `items-stretch` through the grid and `h-full` on the card, so
            three quotes of different lengths still end on one line. */}
        <ul className="mt-12 grid items-stretch gap-5 md:grid-cols-2 lg:grid-cols-3">
          {FEEDBACK.map((testimonial) => (
            <li key={`${testimonial.name}-${testimonial.company}`}>
              <Quote testimonial={testimonial} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
