import Link from "next/link";

import { Arrow, ButtonLink, Eyebrow, PageShell } from "@/components/site/page";

/**
 * The site's 404.
 *
 * Handles both an unknown URL and an explicit `notFound()` — a draft's
 * slug, for one. Next sends it with a 404 status and adds
 * `noindex` itself, so a mistyped link cannot end up in search results.
 *
 * The job is to get someone back onto a real page, so it offers the
 * pages people most often arrive looking for instead of a bare apology.
 */
const DESTINATIONS = [
  {
    href: "/products",
    title: "Products",
    body: "Instant, Ask Maya, Flowra CRM and Vichento.",
  },
  {
    href: "/about",
    title: "About the company",
    body: "Who we are and how we build.",
  },
  {
    href: "/blog",
    title: "Blog",
    body: "Notes on building software for Indian businesses.",
  },
  {
    href: "/trust",
    title: "Trust & security",
    body: "How customer data is protected, and every policy.",
  },
  {
    href: "/careers",
    title: "Careers",
    body: "How we work, and how to get in touch.",
  },
  {
    href: "/contact",
    title: "Contact",
    body: "Reach an engineer, not a queue.",
  },
];

export default function NotFound() {
  return (
    <PageShell>
      <section className="relative overflow-hidden bg-surface">
        <div
          className="grid-backdrop pointer-events-none absolute inset-0"
          aria-hidden="true"
        />
        <div className="relative mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-28">
          <Eyebrow>404 · Page not found</Eyebrow>
          <h1 className="display mt-5 max-w-3xl text-[clamp(2.25rem,5.2vw,4rem)] font-medium text-ink text-balance">
            This page does not exist.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty">
            The link may be out of date, or the page may have moved. These are
            the pages people usually come looking for.
          </p>

          <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DESTINATIONS.map((destination) => (
              <li key={destination.href}>
                <Link
                  href={destination.href}
                  className="group flex h-full flex-col rounded-lg border border-line bg-paper p-6 transition-colors hover:border-accent"
                >
                  <span className="flex items-center justify-between gap-3 text-[1.0625rem] font-semibold tracking-[-0.015em] text-ink group-hover:text-accent">
                    {destination.title}
                    <Arrow />
                  </span>
                  <span className="mt-1.5 text-[0.9375rem] text-muted">
                    {destination.body}
                  </span>
                </Link>
              </li>
            ))}
          </ul>

          <div className="mt-10">
            <ButtonLink href="/" variant="secondary">
              Back to the homepage
            </ButtonLink>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
