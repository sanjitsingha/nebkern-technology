import Link from "next/link";

import { LINKS, SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { Mark } from "./logo";

type FooterLink = { label: string; href: string };

/**
 * Every page on the site is reachable from here, in three columns.
 *
 * This used to link "About" to `#company` and "Contact" to Instant's
 * help centre. The anchor only existed on the homepage, so from every
 * other page it went nowhere; the contact link left the company site for
 * a product's support site. Both now point at real pages.
 *
 * The legal documents keep pointing at instant.nebkern.com — they are
 * issued by Nebkern Technology but published there, and that published
 * copy is the one Razorpay and Meta reviewed. Titles match each
 * document's own heading.
 */
const COLUMNS: { title: string; links: FooterLink[] }[] = [
  {
    title: "Products",
    links: [
      { label: "All products", href: "/products" },
      ...PRODUCTS.filter((p) => p.href).map((p) => ({
        label: p.name,
        href: p.href as string,
      })),
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "/about" },
      { label: "Careers", href: "/careers" },
      { label: "Blog", href: "/blog" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Trust & legal",
    links: [
      { label: "Trust & security", href: "/trust" },
      { label: "Privacy Policy", href: LINKS.privacy },
      { label: "Terms & Conditions", href: LINKS.terms },
      { label: "Security Policy", href: LINKS.security },
      { label: "Data Processing Agreement", href: LINKS.dpa },
      { label: "Subprocessor List", href: LINKS.subprocessors },
      { label: "Cancellation & Refunds", href: LINKS.refunds },
    ],
  },
];

const LINK_CLASS =
  "text-[0.9375rem] text-panel-fg/80 transition-colors hover:text-panel-fg";

/** Our own pages through `Link`, so the app shell survives the trip;
 *  anything on another host stays a plain anchor. */
function FooterAnchor({ link }: { link: FooterLink }) {
  return link.href.startsWith("/") ? (
    <Link href={link.href} className={LINK_CLASS}>
      {link.label}
    </Link>
  ) : (
    <a href={link.href} className={LINK_CLASS}>
      {link.label}
    </a>
  );
}

export function Footer() {
  return (
    <footer className="bg-panel text-panel-fg">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <Link
              href="/"
              className="inline-flex items-center gap-2.5 text-panel-fg"
            >
              <Mark className="h-7 w-7 text-panel-fg" />
              <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
                nebkern
              </span>
              <span className="sr-only">— {SITE.name} home</span>
            </Link>
            <p className="mt-4 max-w-xs text-[0.9375rem] leading-relaxed text-panel-muted text-pretty">
              A software company in {SITE.city}, West Bengal. We build, host and
              support our own products end to end.
            </p>
            <a
              href={`mailto:${SITE.email}`}
              className="mt-5 inline-block text-[0.875rem] break-all text-panel-muted underline decoration-panel-line underline-offset-4 transition-colors hover:text-panel-fg"
            >
              {SITE.email}
            </a>
          </div>

          {COLUMNS.map((col) => (
            <nav key={col.title} aria-label={col.title}>
              <h2 className="text-[0.6875rem] font-medium tracking-[0.14em] text-panel-muted uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <FooterAnchor link={link} />
                  </li>
                ))}
              </ul>
            </nav>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-panel-line pt-7 text-[0.8125rem] text-panel-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}, {SITE.entity}.{" "}
            {SITE.address}.
          </p>
          <p className="font-mono text-[0.75rem]">Udyam {SITE.udyam}</p>
        </div>

        <p className="mt-5 max-w-3xl text-[0.75rem] leading-relaxed text-panel-muted">
          WhatsApp is a trademark of Meta Platforms, Inc. Nebkern Technology is
          an official Meta Tech Provider and is not otherwise affiliated with or
          endorsed by Meta Platforms, Inc.
        </p>
      </div>
    </footer>
  );
}
