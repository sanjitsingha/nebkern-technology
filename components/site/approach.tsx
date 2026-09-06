import { LINKS } from "@/lib/site";

/**
 * How the company works — the commitments behind every product, rather
 * than any one product's features. Each is a claim we can substantiate
 * on request, which is what the documents rail underneath is for.
 */
const PRINCIPLES = [
  {
    title: "You deal with the people who built it",
    body: "There is no account manager relaying your problem to an engineer in another timezone. The person who answers a support ticket can open the code, and usually wrote it. Support runs on IST, in the languages your team actually works in.",
  },
  {
    title: "We own the whole stack",
    body: "Application, database, infrastructure and deploys are all ours. When something breaks there is nobody to escalate to and nobody to blame — which is exactly the incentive you want in a vendor whose software runs your operations.",
  },
  {
    title: "Your data stays in India",
    body: "Databases run in the Mumbai region and media is served from Indian edges. Credentials are encrypted at rest, every tenant is isolated at the database row, and outbound webhooks are signed.",
  },
  {
    title: "Priced and invoiced for Indian businesses",
    body: "Rupees, GST invoices, and payment by UPI, card or netbanking. No dollar pricing that moves with the exchange rate, and no minimum seat count designed for a company far larger than yours.",
  },
];

/** The documents a procurement or compliance reviewer asks for by name.
 *  All eleven policies are published on the product site; these are the
 *  four they ask for first. */
const DOCUMENTS = [
  { label: "Security Policy", href: LINKS.security },
  { label: "Data Processing Agreement", href: LINKS.dpa },
  { label: "Subprocessor list", href: LINKS.subprocessors },
  { label: "Privacy Policy", href: LINKS.privacy },
];

export function Approach() {
  return (
    <section id="approach" className="scroll-mt-20 border-t border-line-soft">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
        <div className="max-w-2xl">
          <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-accent uppercase">
            How we work
          </p>
          <h2 className="display mt-3 text-[2rem] font-semibold text-ink sm:text-[2.75rem]">
            A vendor you can check up on.
          </h2>
          <p className="mt-5 text-lg leading-relaxed text-ink-soft text-pretty">
            Software that runs your operations is not a low-stakes purchase.
            Here is everything you would want to verify before making one.
          </p>
        </div>

        <ol className="mt-14 grid gap-x-12 gap-y-10 sm:grid-cols-2">
          {PRINCIPLES.map((p, i) => (
            <li key={p.title} className="flex gap-5">
              <span
                className="mt-0.5 font-mono text-[0.8125rem] text-accent tabular-nums"
                aria-hidden="true"
              >
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3 className="text-[1.0625rem] font-semibold tracking-[-0.012em] text-ink">
                  {p.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  {p.body}
                </p>
              </div>
            </li>
          ))}
        </ol>

        <div className="mt-14 flex flex-col gap-4 border border-line bg-surface-2 p-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
          <p className="text-[0.9375rem] text-ink-soft">
            <span className="font-medium text-ink">Reviewing us?</span> The
            documents your legal team will ask for are already public.
          </p>
          <ul className="flex flex-wrap gap-x-5 gap-y-2">
            {DOCUMENTS.map((d) => (
              <li key={d.label}>
                <a
                  href={d.href}
                  className="text-[0.875rem] font-medium text-ink underline decoration-line underline-offset-4 transition-colors hover:decoration-ink"
                >
                  {d.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
