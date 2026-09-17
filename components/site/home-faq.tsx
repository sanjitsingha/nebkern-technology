import { Faq, JsonLd } from "@/components/site/page";
import { COMPANY_FAQ, faqJsonLd } from "@/lib/company";

/**
 * The homepage's frequently asked questions.
 *
 * The same six questions /about answers, from the one array in
 * lib/company.ts — a company that answers "where is your data stored?"
 * two different ways on two pages has a problem no layout fixes.
 *
 * Rendered in the `plain` variant: hairline-separated rows on the page
 * rather than another bordered slab, since the values panel and the apps
 * slab already own that shape above. Native <details>, so every answer is
 * in the HTML for a crawler and works with JavaScript off.
 *
 * The centred heading with a short rule under it is the values panel's
 * device, repeated deliberately — it is how this site marks a section
 * that addresses the reader directly.
 */
export function HomeFaq() {
  return (
    <section id="faq" aria-labelledby="faq-heading" className="scroll-mt-20">
      {/* The FAQPage data and the visible questions come from the same
          array, so the two cannot disagree — which is the condition
          Google puts on marking up an FAQ at all. */}
      <JsonLd data={faqJsonLd(COMPANY_FAQ)} />

      {/* The site's own 6xl column, the width the apps slab and every
          other band on this page use — the questions were holding a
          narrower measure than anything around them. The heading and the
          answers keep their own narrower measures inside it, since a
          centred line and a paragraph both read badly at full width. */}
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="text-center">
          <h2
            id="faq-heading"
            className="display mx-auto max-w-2xl text-[clamp(1.875rem,3.6vw,2.75rem)] font-medium text-ink text-balance"
          >
            Frequently asked questions
          </h2>
          <span
            className="mx-auto mt-7 block h-[3px] w-12 bg-accent"
            aria-hidden="true"
          />
        </div>

        <div className="mt-12">
          <Faq items={COMPANY_FAQ} variant="plain" />
        </div>
      </div>
    </section>
  );
}
