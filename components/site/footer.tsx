import { LINKS, SITE } from "@/lib/site";
import { PRODUCTS } from "@/lib/products";
import { Mark } from "./logo";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Products",
    links: PRODUCTS.filter((p) => p.href).map((p) => ({
      label: p.name,
      href: p.href as string,
    })),
  },
  {
    // These must stay in step with the section ids in app/page.tsx —
    // `#why` survived a restructure here after the section itself was
    // renamed, and a footer link to a missing anchor fails silently.
    title: "Company",
    links: [
      { label: "About", href: "#company" },
      { label: "Blog", href: LINKS.blog },
      { label: "Contact", href: LINKS.contact },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: LINKS.privacy },
      { label: "Terms of Service", href: LINKS.terms },
      { label: "Security", href: LINKS.security },
      { label: "Refunds", href: LINKS.refunds },
    ],
  },
];

export function Footer() {
  return (
    <footer className="bg-panel text-panel-fg">
      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-[1.4fr_repeat(3,1fr)]">
          <div>
            <span className="flex items-center gap-2.5">
              <Mark className="h-7 w-7 text-panel-fg" />
              <span className="text-[1.0625rem] font-semibold tracking-[-0.02em]">
                nebkern
              </span>
            </span>
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
            <div key={col.title}>
              <h2 className="text-[0.6875rem] font-medium tracking-[0.14em] text-panel-muted uppercase">
                {col.title}
              </h2>
              <ul className="mt-4 flex flex-col gap-2.5">
                {col.links.map((l) => (
                  <li key={l.label}>
                    <a
                      href={l.href}
                      className="text-[0.9375rem] text-panel-fg/80 transition-colors hover:text-panel-fg"
                    >
                      {l.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-14 flex flex-col gap-4 border-t border-panel-line pt-7 text-[0.8125rem] text-panel-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} {SITE.name}, {SITE.entity}.{" "}
            {SITE.address}.
          </p>
          <p className="font-mono text-[0.75rem]">Udyam {SITE.udyam}</p>
        </div>

        <p className="mt-5 max-w-3xl text-[0.75rem] leading-relaxed text-panel-muted/80">
          WhatsApp is a trademark of Meta Platforms, Inc. Nebkern Technology is
          an official Meta Tech Provider and is not otherwise affiliated with or
          endorsed by Meta Platforms, Inc.
        </p>
      </div>
    </footer>
  );
}
