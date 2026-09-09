import type { Metadata } from "next";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { LINKS, SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Contact",
  description: `How to reach ${SITE.name} — a software company in ${SITE.address}. Write to us and you will reach an engineer, not a queue.`,
  alternates: { canonical: "/contact" },
  openGraph: {
    title: `Contact ${SITE.name}`,
    description: `How to reach ${SITE.name}, a software company in ${SITE.address}.`,
    url: "/contact",
    type: "website",
  },
};

/**
 * Routes off this page, most direct first.
 *
 * There is deliberately no form. A form that posts nowhere is worse
 * than no form — it swallows a message and shows a success state — and
 * nothing here is wired to an inbox yet. The DNS is already set up for
 * Resend, so this becomes a real form the moment there is an API key
 * and somewhere for it to land.
 */
const ROUTES = [
  {
    label: "Email",
    value: SITE.email,
    href: `mailto:${SITE.email}`,
    note: "The fastest way in. It reaches the people who build the software, not a support tier.",
    primary: true,
  },
  {
    label: "Product support",
    value: "Instant help centre",
    href: LINKS.contact,
    note: "Already using Instant and something is wrong? Start here — it reaches the same team with your account attached.",
  },
  {
    label: "Documentation",
    value: "Read the docs",
    href: LINKS.docs,
    note: "Most setup questions are answered here, and it is quicker than waiting on a reply.",
  },
];

/** The particulars a buyer's finance or legal team asks for. Also in the
 *  footer, but nobody should have to dig them out of a footer. */
const REGISTERED = [
  { label: "Legal name", value: SITE.name },
  { label: "Constitution", value: SITE.entity },
  { label: "Registered address", value: SITE.address },
  { label: "Udyam registration", value: SITE.udyam, mono: true },
];

export default function ContactPage() {
  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

      <Nav />

      <main id="main" className="flex-1">
        <section className="border-b border-line-soft">
          <div className="mx-auto max-w-4xl px-5 pt-16 pb-14 sm:px-8 sm:pt-20 sm:pb-16">
            <p className="text-[0.6875rem] font-medium tracking-[0.14em] text-accent uppercase">
              Contact
            </p>
            <h1 className="display mt-3 max-w-3xl text-[clamp(2rem,4.2vw,3.25rem)] font-medium text-ink text-pretty">
              Tell us what your business actually needs.
            </h1>
            <p className="mt-5 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty">
              Whether that is one of the products we already run or something
              nobody has built properly for India yet — we would rather hear the
              problem than pitch you a solution.
            </p>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
            <ul className="flex flex-col gap-4">
              {ROUTES.map((route) => {
                // Only the mail link and our own pages stay in place;
                // the product links go to Instant's site.
                const external = route.href.startsWith("http");

                return (
                  <li key={route.label}>
                    <a
                      href={route.href}
                      {...(external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className={`group flex flex-col gap-1.5 rounded-md border p-6 transition-colors sm:p-7 ${
                        route.primary
                          ? "border-line bg-surface hover:border-accent"
                          : "border-line-soft hover:border-line"
                      }`}
                    >
                      <span className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
                        {route.label}
                      </span>

                      <span className="flex items-center gap-2 text-[1.125rem] font-semibold tracking-[-0.018em] break-all text-ink transition-colors group-hover:text-accent sm:text-[1.25rem]">
                        {route.value}
                        <svg
                          viewBox="0 0 16 16"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.6"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="h-3.5 w-3.5 shrink-0 transition-transform group-hover:translate-x-0.5"
                          aria-hidden="true"
                        >
                          <path d="M3 8h10M9 4l4 4-4 4" />
                        </svg>
                      </span>

                      <span className="mt-1 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
                        {route.note}
                      </span>
                    </a>
                  </li>
                );
              })}
            </ul>
          </div>
        </section>

        <section className="border-t border-line-soft bg-surface-2">
          <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
            <h2 className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
              Registered details
            </h2>

            <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2">
              {REGISTERED.map((item) => (
                <div key={item.label}>
                  <dt className="text-[0.8125rem] text-muted">{item.label}</dt>
                  <dd
                    className={`mt-1 text-[1.0625rem] text-ink ${
                      item.mono ? "font-mono text-[0.9375rem]" : ""
                    }`}
                  >
                    {item.value}
                  </dd>
                </div>
              ))}
            </dl>

            <p className="mt-8 max-w-2xl text-[0.9375rem] leading-relaxed text-muted">
              We are a small team in North Bengal. If your question is about
              procurement, security review or data processing, say so in the
              first line and it will reach the right person faster.
            </p>
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}
