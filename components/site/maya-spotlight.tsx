import type { CSSProperties } from "react";

import { ButtonLink } from "@/components/site/page";
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
 * In her own colour, per the rule the whole palette is built on: the
 * parent brand stays neutral and indigo, and each product's hue carries
 * the variety inside its own space. The colour is a wash and a few
 * marks, never body text — violet at small sizes does not clear AA on
 * this background, so words stay in ink.
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
      className="mt-1 grid size-4.5 shrink-0 place-items-center rounded-full"
      style={{ background: "color-mix(in oklab, var(--hue) 16%, transparent)" }}
      aria-hidden="true"
    >
      <svg
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-2.5 w-2.5"
        style={{ color: "var(--hue)" }}
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
              Sorry, dupattas can&rsquo;t be returned. Kurtas, shirts and
              pants can, within 7 days of delivery, as long as they&rsquo;re
              unworn with the tags on.
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

      <figcaption className="mt-3 text-[0.8125rem] leading-relaxed text-muted">
        An example from the playground&rsquo;s sample store — a made-up shop.
      </figcaption>
    </figure>
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
          "--hue": MAYA.hue,
          // A wash of her colour over the page's own paper — enough to
          // mark the band as hers, far too little to tint the text.
          background: "color-mix(in oklab, var(--hue) 5%, var(--paper))",
        } as CSSProperties
      }
    >
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:items-center lg:gap-16">
        <div>
          <p className="inline-flex items-center gap-2.5 text-[0.75rem] font-semibold tracking-[0.14em] text-ink-soft uppercase">
            <span
              className="size-1.5 shrink-0"
              style={{ background: "var(--hue)" }}
              aria-hidden="true"
            />
            Ask Maya · {MAYA.statusLabel}
          </p>

          <h2
            id="maya-heading"
            className="display mt-5 text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium text-ink text-balance"
          >
            An AI agent that answers from what your business actually knows.
          </h2>

          <p className="mt-5 text-lg leading-relaxed text-ink-soft text-pretty">
            Maya is the AI agent inside Instant. Give her your catalogue,
            prices and policies, and she replies to customers on WhatsApp.
            When the answer isn&rsquo;t there, she hands the chat to a person
            instead of guessing.
          </p>

          <ul className="mt-7 space-y-3">
            {FACTS.map((fact) => (
              <li
                key={fact}
                className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft"
              >
                <Check />
                {fact}
              </li>
            ))}
          </ul>

          <div className="mt-9 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href={PLAYGROUND_PATH}>Try it in the playground</ButtonLink>
            <ButtonLink href={LINKS.askMaya} variant="secondary">
              Ask Maya on Instant
            </ButtonLink>
          </div>
        </div>

        <ExampleChat />
      </div>
    </section>
  );
}
