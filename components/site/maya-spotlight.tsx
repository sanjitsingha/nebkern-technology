import Link from "next/link";
import type { CSSProperties, ReactNode } from "react";

import { MAYA, PLAYGROUND_PATH } from "@/lib/maya";
import { LINKS } from "@/lib/site";

/**
 * The homepage's band for Ask Maya.
 *
 * Maya gets her own band rather than a card in the apps slab because she
 * is not an app — she ships inside Instant, which is why the slab leaves
 * her out — but she is the product most worth seeing work, and the
 * playground is where a visitor can.
 *
 * The band is #007C07, a solid green, so everything on it is white or
 * near-white: white reads 5.4:1 there, white/90 reads 4.7:1, and
 * anything lighter than /90 drops under the 4.5:1 AA floor — which is
 * why no text out here is dimmer than that.
 *
 * Maya’s own violet survives only INSIDE the white chat card, where it
 * still has a light surface to sit on. On the green it would be a muddy
 * smudge, so the marks around it — the kicker dot, the ticks — are
 * white, and so is the primary button, with the green as its text. The
 * site’s indigo never appears on this band: it reads 1.3:1 against it.
 *
 * Claims come from the catalogue's capability lines and Instant's own
 * Ask Maya page; the example exchange is labelled as one, and every
 * answer in it is taken from the playground's sample store.
 */

const FACTS = [
  "Answers from your catalogue, prices and policies — not the open internet",
  "Replies to customers herself, or drafts the reply for your team",
  "Works with your own OpenAI, Anthropic or OpenRouter key",
];

function Check() {
  return (
    <span
      className="mt-1 grid size-4.5 shrink-0 place-items-center rounded-full bg-white/20"
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-2.5 w-2.5 text-white"
      >
        <path d="M3.5 8.5l3 3 6-7" />
      </svg>
    </span>
  );
}

/**
 * Two turns from the sample store: one Maya can answer, one she cannot.
 * Those are the two behaviours the whole product rests on, and showing
 * only the first would make her look like a chatbot that never says "not
 * me".
 */
function ExampleChat() {
  return (
    <figure className="w-full">
      <div className="overflow-hidden rounded-lg border border-line bg-surface shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)]">
        <div className="flex items-center gap-2.5 border-b border-line-soft px-5 py-3.5">
          <span
            className="size-2 rounded-full"
            style={{ background: "var(--hue)" }}
            aria-hidden="true"
          />
          <span className="text-[0.9375rem] font-semibold text-ink">Maya</span>
          <span className="text-[0.8125rem] text-muted">· Sample store</span>
        </div>

        <div className="space-y-3 bg-surface-2/60 px-4 py-5 sm:px-5">
          <p className="ml-auto w-fit max-w-[85%] rounded-md bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
            Can I return a dupatta?
          </p>

          <div
            className="w-fit max-w-[88%] rounded-md border px-3.5 py-2.5"
            style={{
              background: "color-mix(in oklab, var(--hue) 7%, var(--surface))",
              borderColor: "color-mix(in oklab, var(--hue) 22%, transparent)",
            }}
          >
            <p className="text-[0.6875rem] font-semibold tracking-[0.08em] text-ink-soft uppercase">
              Maya
            </p>
            <p className="mt-1 text-[0.9375rem] leading-relaxed text-ink">
              Sorry, dupattas can&rsquo;t be returned. Kurtas, shirts and pants
              can, within 7 days of delivery, as long as they&rsquo;re unworn
              with the tags on.
            </p>
            <p className="mt-2 text-[0.75rem] text-muted">
              From: Returns and exchanges
            </p>
          </div>

          <p className="ml-auto w-fit max-w-[85%] rounded-md bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
            My parcel came torn. I want to talk to someone.
          </p>

          <div className="flex items-center gap-3 py-1.5">
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
            <p className="text-center text-[0.8125rem] font-semibold text-ink">
              Maya handed this chat to a person
            </p>
            <span className="h-px flex-1 bg-line" aria-hidden="true" />
          </div>
        </div>
      </div>

      <figcaption className="mt-3 text-[0.8125rem] leading-relaxed text-white/90">
        An example from the playground&rsquo;s sample store — a made-up shop.
      </figcaption>
    </figure>
  );
}

/**
 * This band's own buttons.
 *
 * `ButtonLink` has two variants and both assume a light surface: the
 * primary is the site's indigo, which reads 1.3:1 on this green, and the
 * secondary is an ink outline on white. So the pair here is white filled
 * with the green as its text, and a white outline at /70 — the lightest
 * alpha that still clears the 3:1 a control's own edge needs.
 */
function BandLink({
  href,
  children,
  filled = false,
}: {
  href: string;
  children: ReactNode;
  filled?: boolean;
}) {
  const tone = filled
    ? "bg-white text-[#007C07] hover:bg-white/90"
    : "border border-white/70 text-white hover:bg-white/10";
  const className = `inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[0.9375rem] font-medium transition-colors ${tone}`;
  const body = (
    <>
      {children}
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
    </>
  );

  return href.startsWith("/") || href.startsWith("#") ? (
    <Link href={href} className={className}>
      {body}
    </Link>
  ) : (
    <a href={href} className={className}>
      {body}
    </a>
  );
}

export function MayaSpotlight() {
  return (
    <section
      id="maya"
      aria-labelledby="maya-heading"
      className="scroll-mt-20"
      style={
        {
          // Still set, and still used — but only by the chat card,
          // which is white inside and can carry her colour properly.
          "--hue": MAYA.hue,
          background: "#007C07",
        } as CSSProperties
      }
    >
      {/* Asymmetric, and not for taste: the products card above hangs
          64px past its own section into this band (80px from `sm`), so
          the first 64px of this padding sits behind that card and only
          16px of it is green anyone can see. Matching 80px at the bottom
          therefore read as bottom-heavy rather than as balanced.

          Which is also why the top figure does not move. Cutting it is
          what would pull this band up, and at 16px of clearance there is
          nothing to cut — the eyebrow would slide under the card. To
          lift it further, reduce the `-mb-16 sm:-mb-20` on the card in
          product-split.tsx and take the same amount off here. */}
      <div className="mx-auto grid max-w-6xl gap-12 px-5 pt-20 pb-10 sm:px-8 sm:pt-24 sm:pb-12 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2.5 text-[0.75rem] font-semibold tracking-[0.14em] text-white uppercase">
            <span className="size-1.5 shrink-0 bg-white" aria-hidden="true" />
            Ask Maya · {MAYA.statusLabel}
          </p>

          <h2
            id="maya-heading"
            className="display mt-5 text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium text-white text-balance"
          >
            An AI agent that answers from what your business actually knows.
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-white/90 text-pretty">
            Maya is the AI agent inside Instant. Give her your catalogue, prices
            and policies, and she replies to customers on WhatsApp. When the
            answer isn&rsquo;t there, she hands the chat to a person instead of
            guessing.
          </p>

          <ul className="mt-7 space-y-3">
            {FACTS.map((fact) => (
              <li
                key={fact}
                className="flex gap-3 text-[0.9375rem] leading-relaxed text-white/90"
              >
                <Check />
                {fact}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <BandLink href={PLAYGROUND_PATH} filled>
              Try it in the playground
            </BandLink>
            <BandLink href={LINKS.askMaya}>Ask Maya on Instant</BandLink>
          </div>
        </div>

        <ExampleChat />
      </div>
    </section>
  );
}
