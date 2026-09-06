/**
 * What the company does, as distinct from what any one product does.
 *
 * This section used to open with "Built in Siliguri…" — an eyebrow, a
 * headline, three paragraphs of company story and a registered-details
 * card. All of that is gone; these three claims are what remains, and
 * they now stand on their own without a heading over them.
 *
 * The registered particulars that card carried are not lost: the legal
 * name, the constitution, the address and the Udyam number are all
 * still printed in the footer's bottom bar.
 */
const CAPABILITIES = [
  {
    title: "We build products, not one-off projects",
    body: "Everything we ship is software we own, version and keep running. That means a customer gets improvements they did not pay for separately, and a roadmap that outlives whoever wrote the first version.",
  },
  {
    title: "We run our own infrastructure",
    body: "Our servers, our deploys, our on-call. Nothing critical sits on a platform we cannot get into at two in the morning, and no reseller stands between a customer and the systems their business depends on.",
  },
  {
    title: "We integrate with the platforms India sells on",
    body: "Nebkern is an official Meta Tech Provider, which is what lets us connect a business directly to the WhatsApp Business Platform — along with Instagram and Messenger — rather than routing it through somebody else's account.",
  },
];

export function About() {
  // `id="company"` stays: the nav's Company link points here, and these
  // three claims are now what the site says about the company.
  //
  // No `border-t` — the section above ends on grey and this one is
  // paper, so the colour change already draws the boundary.
  return (
    <section id="company" className="scroll-mt-20">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <ul className="grid gap-x-12 gap-y-10 sm:grid-cols-3">
          {CAPABILITIES.map((c) => (
            <li key={c.title}>
              <h2 className="text-[clamp(1.5rem,2.3vw,2.125rem)] leading-[1.15] font-semibold tracking-[-0.026em] text-ink text-balance">
                {c.title}
              </h2>
              <p className="mt-4 text-[1.0625rem] leading-relaxed text-muted text-pretty">
                {c.body}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
