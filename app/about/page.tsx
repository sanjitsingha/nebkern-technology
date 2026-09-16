import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Link from "next/link";

import {
  Arrow,
  ButtonLink,
  ClosingCta,
  Eyebrow,
  Facts,
  Faq,
  JsonLd,
  PageHero,
  PageShell,
  Section,
} from "@/components/site/page";
import { VALUES } from "@/components/site/values";
import { COMPANY_FAQ, PRODUCT_COUNTS, faqJsonLd } from "@/lib/company";
import { PRODUCTS, STATUS_LABEL } from "@/lib/products";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

const DESCRIPTION =
  "Nebkern Technology is a software company in Siliguri, West Bengal. We build, host and support our own products, including Instant on the WhatsApp Business API.";

export const metadata: Metadata = pageMetadata({
  title: "About the company",
  description: DESCRIPTION,
  path: "/about",
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "About", path: "/about" },
];

/**
 * /about — the company, as distinct from its products.
 *
 * Every claim here is one the site already makes somewhere, or a fact
 * from `lib/site.ts`: the story paragraphs are the homepage's own
 * sentences, the values are the homepage's values panel, and the numbers
 * are counted from the product catalogue. There is deliberately no
 * founding year, headcount, customer figure or team section — none of
 * those exist in any published source yet, and a company page is exactly
 * where invented ones get checked.
 */
export default function AboutPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          type: "AboutPage",
          name: `About ${SITE.name}`,
          description: DESCRIPTION,
          path: "/about",
        })}
      />
      <JsonLd data={faqJsonLd(COMPANY_FAQ)} />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="About Nebkern"
        title="We build, host and support our own software — for how India does business."
        lead={
          <>
            {SITE.name} is a software company in {SITE.city}, West Bengal. We do
            not resell anybody&rsquo;s platform, and we do not hand over a
            codebase and walk away: every product we ship, we also run and
            answer for.
          </>
        }
        actions={
          <>
            <ButtonLink href="/products">See what we build</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Talk to us
            </ButtonLink>
          </>
        }
      />

      {/* At a glance. Counted, not typed: the product numbers come from
          the catalogue, so adding a product updates this line too. */}
      <section aria-label="At a glance">
        <div className="mx-auto max-w-6xl px-5 pt-16 sm:px-8 sm:pt-20">
          <Facts
            items={[
              { label: "Headquarters", value: `${SITE.city}, West Bengal` },
              {
                label: "Products",
                value: `${PRODUCT_COUNTS.total} products · ${PRODUCT_COUNTS.live} live`,
              },
              { label: "Meta status", value: "Official Meta Tech Provider" },
              {
                label: "Udyam (MSME) registration",
                value: SITE.udyam,
                mono: true,
              },
            ]}
          />
        </div>
      </section>

      {/* Who we are. Two columns — the claim on the left, the reasoning
          on the right — rather than a centred block, which suits a
          headline and not three paragraphs. */}
      <section aria-labelledby="story-heading" className="scroll-mt-24">
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-[5fr_7fr] lg:gap-16">
          <div>
            <Eyebrow>Who we are</Eyebrow>
            <h2
              id="story-heading"
              className="display mt-4 text-[clamp(1.75rem,3.4vw,2.625rem)] font-medium text-ink text-balance"
            >
              Made in India.{" "}
              <span className="text-accent">Made for India.</span>
            </h2>
          </div>

          <div className="space-y-6 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty sm:text-lg">
            <p>
              Nebkern Technology is a software company based in {SITE.city}, in
              North Bengal. We are not an offshore office building somebody
              else&rsquo;s product, and not a foreign tool with a rupee price
              bolted on afterwards.
            </p>
            <p>
              We build products — software we own, version and keep running — so
              a customer gets improvements they did not pay for separately, and
              a roadmap that outlives whoever wrote the first version.
            </p>
            <p>
              And we run what we build: our servers, our deploys, our on-call.
              The person who answers a customer is the person who can fix the
              problem, and no reseller stands between a business and the systems
              it depends on.
            </p>
          </div>
        </div>
      </section>

      <Section
        id="values"
        tone="surface"
        eyebrow="What we believe"
        title="The principles that decide how we build"
      >
        <ul className="grid gap-5 md:grid-cols-2">
          {VALUES.map((value) => (
            <li
              key={value.title}
              className="flex gap-5 rounded-lg border border-line bg-paper p-7 sm:p-8"
            >
              <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent/8 text-accent">
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-6 w-6"
                  aria-hidden="true"
                >
                  {value.icon}
                </svg>
              </span>
              <div>
                <h3 className="text-[1.125rem] font-semibold tracking-[-0.018em] text-ink text-balance">
                  {value.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  {value.body}
                </p>
              </div>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="products"
        eyebrow="What we build"
        title="Products we build, host and support"
        lead="Each product has its own site for the detail. Here is what they are, and where each one stands."
      >
        <ul className="grid gap-5 md:grid-cols-3">
          {PRODUCTS.map((product) => (
            <li key={product.slug}>
              <Link
                href={`/products#${product.slug}`}
                style={{ "--hue": product.hue } as CSSProperties}
                className="group flex h-full flex-col rounded-lg border border-line bg-surface p-7 transition-colors hover:border-ink/20"
              >
                {/* The product's own colour, as a bar — the parent brand
                    stays indigo and each product keeps its identity. */}
                <span
                  className="h-1 w-10"
                  style={{ background: "var(--hue)" }}
                  aria-hidden="true"
                />
                <h3 className="mt-6 text-[1.3125rem] font-semibold tracking-[-0.02em] text-ink">
                  {product.name}
                </h3>
                <p
                  className={`mt-1 text-[0.8125rem] font-medium ${
                    product.status === "development"
                      ? "text-warning"
                      : "text-muted"
                  }`}
                >
                  {product.statusLabel ?? STATUS_LABEL[product.status]}
                </p>
                <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  {product.kicker}
                </p>
                <span className="mt-auto inline-flex items-center gap-1.5 pt-7 text-[0.875rem] font-medium text-ink transition-colors group-hover:text-accent">
                  About {product.name}
                  <Arrow />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="faq"
        tone="muted"
        eyebrow="FAQ"
        title="Questions people ask about Nebkern"
      >
        <Faq items={COMPANY_FAQ} />
      </Section>

      <ClosingCta
        title="Considering Nebkern for your business?"
        body="Tell us what your business needs and you will reach an engineer, not a queue. If it is something we do not build yet, we would still rather hear about it."
        actions={
          <>
            <ButtonLink href="/contact">Talk to us</ButtonLink>
            <ButtonLink
              href={`mailto:${SITE.email}`}
              variant="secondary"
              arrow={false}
            >
              {SITE.email}
            </ButtonLink>
          </>
        }
      />
    </PageShell>
  );
}
