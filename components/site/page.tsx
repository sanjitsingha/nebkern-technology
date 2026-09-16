import Link from "next/link";
import type { ReactNode } from "react";

import { Footer } from "@/components/site/footer";
import { Nav } from "@/components/site/nav";
import { breadcrumbJsonLd, type Crumb } from "@/lib/seo";

/**
 * The building blocks every inner page is made from.
 *
 * One file on purpose. These pieces only make sense together — a hero,
 * sections under it, cards inside those, a closing panel — and keeping
 * them side by side is what keeps the spacing, the type scale and the
 * card style identical from /about to /trust. A page should be
 * assembled from these, not restyled.
 *
 * The visual language is the homepage's: paper ground, true-white
 * panels with a hairline border and the slab's `rounded-lg`, ink type,
 * one indigo accent spent on eyebrows, icons and the primary action.
 */

/* ------------------------------------------------------------------ */
/* Structure                                                           */
/* ------------------------------------------------------------------ */

/** Structured data as a script tag. `<` is escaped because
 *  `JSON.stringify` does not, and a stray `</script>` inside a value
 *  would otherwise end the tag early — the sanitising step Next's own
 *  JSON-LD guide recommends. */
export function JsonLd({ data }: { data: unknown }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: JSON.stringify(data).replace(/</g, "\\u003c"),
      }}
    />
  );
}

/** Skip link, nav, one <main>, footer — the frame every page shares. */
export function PageShell({ children }: { children: ReactNode }) {
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
        {children}
      </main>
      <Footer />
    </>
  );
}

/* ------------------------------------------------------------------ */
/* Type                                                                */
/* ------------------------------------------------------------------ */

/** The small label above a heading. The square is the logo's kernel at
 *  label size — the one brand mark small enough to sit in a line of
 *  text. */
export function Eyebrow({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p
      className={`inline-flex items-center gap-2.5 text-[0.75rem] font-semibold tracking-[0.14em] text-accent uppercase ${className}`}
    >
      <span className="size-1.5 shrink-0 bg-accent" aria-hidden="true" />
      {children}
    </p>
  );
}

export function Arrow({ className = "h-3.5 w-3.5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} transition-transform group-hover:translate-x-0.5`}
      aria-hidden="true"
    >
      <path d="M3 8h10M9 4l4 4-4 4" />
    </svg>
  );
}

/**
 * A link styled as a button.
 *
 * Internal paths go through `Link`, so moving between pages keeps the
 * app shell; anything with a scheme — another site, `mailto:` — stays a
 * plain anchor. Deciding that here means no page has to remember to.
 */
export function ButtonLink({
  href,
  children,
  variant = "primary",
  arrow = true,
}: {
  href: string;
  children: ReactNode;
  variant?: "primary" | "secondary";
  arrow?: boolean;
}) {
  const tone =
    variant === "primary"
      ? "bg-accent text-accent-fg hover:bg-accent-hover"
      : "border border-line bg-surface text-ink hover:border-accent hover:text-accent";
  const className = `group inline-flex items-center justify-center gap-2 rounded-md px-5 py-3 text-[0.9375rem] font-medium transition-colors ${tone}`;
  const body = (
    <>
      {children}
      {arrow && <Arrow />}
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

/* ------------------------------------------------------------------ */
/* Page header                                                         */
/* ------------------------------------------------------------------ */

/** The visible trail and its BreadcrumbList, from one array so the two
 *  cannot disagree. */
export function Breadcrumbs({ crumbs }: { crumbs: Crumb[] }) {
  return (
    <>
      <JsonLd data={breadcrumbJsonLd(crumbs)} />
      <nav aria-label="Breadcrumb">
        <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 text-[0.8125rem] text-muted">
          {crumbs.map((crumb, index) => {
            const last = index === crumbs.length - 1;
            return (
              <li key={crumb.path} className="flex items-center gap-2">
                {last ? (
                  <span aria-current="page" className="text-ink-soft">
                    {crumb.name}
                  </span>
                ) : (
                  <>
                    <Link
                      href={crumb.path}
                      className="transition-colors hover:text-accent"
                    >
                      {crumb.name}
                    </Link>
                    <span aria-hidden="true" className="text-line">
                      /
                    </span>
                  </>
                )}
              </li>
            );
          })}
        </ol>
      </nav>
    </>
  );
}

/**
 * The top of an inner page: trail, eyebrow, the page's one h1, a lead
 * paragraph and up to two actions.
 *
 * True white with a hairline under it, so the header reads as a plane
 * above the paper-toned page — the same move the nav makes. The grid
 * backdrop is the homepage hero's motif at rest.
 */
export function PageHero({
  crumbs,
  eyebrow,
  title,
  lead,
  actions,
  children,
}: {
  crumbs: Crumb[];
  eyebrow: string;
  title: ReactNode;
  lead: ReactNode;
  actions?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative overflow-hidden border-b border-line bg-surface">
      <div
        className="grid-backdrop pointer-events-none absolute inset-0"
        aria-hidden="true"
      />
      <div className="relative mx-auto max-w-6xl px-5 pt-8 pb-20 sm:px-8 sm:pt-10 sm:pb-24">
        <Breadcrumbs crumbs={crumbs} />

        <Eyebrow className="mt-14 sm:mt-16">{eyebrow}</Eyebrow>

        {/* Fluid, like the homepage hero, because line breaks are a
            characters-per-line problem a single breakpoint cannot fix. */}
        <h1 className="display mt-5 max-w-4xl text-[clamp(2.25rem,5.2vw,4rem)] font-medium text-ink text-balance">
          {title}
        </h1>

        <p className="mt-6 max-w-2xl text-lg leading-relaxed text-ink-soft text-pretty sm:text-xl">
          {lead}
        </p>

        {actions && (
          <div className="mt-10 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {actions}
          </div>
        )}

        {children}
      </div>
    </section>
  );
}

/** In-page links under a hero, for pages long enough to need them. Also
 *  what a search engine can offer as jump-to links on the result. */
export function JumpLinks({
  links,
}: {
  links: { label: string; href: string }[];
}) {
  return (
    <nav
      aria-label="On this page"
      className="mt-12 flex flex-wrap items-center gap-2"
    >
      <span className="mr-2 text-[0.8125rem] text-muted">On this page</span>
      {links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          className="rounded-md border border-line bg-surface px-3 py-1.5 text-[0.8125rem] font-medium text-ink-soft transition-colors hover:border-accent hover:text-accent"
        >
          {link.label}
        </a>
      ))}
    </nav>
  );
}

/* ------------------------------------------------------------------ */
/* Sections                                                            */
/* ------------------------------------------------------------------ */

/**
 * A band of the page with an optional heading.
 *
 * `tone` alternates the ground so consecutive sections separate without
 * a rule between them: paper (the default), true white, or the grey
 * band the homepage uses for its statement.
 */
export function Section({
  id,
  eyebrow,
  title,
  lead,
  center = false,
  tone = "paper",
  children,
}: {
  id?: string;
  eyebrow?: string;
  title?: ReactNode;
  lead?: ReactNode;
  center?: boolean;
  tone?: "paper" | "surface" | "muted";
  children: ReactNode;
}) {
  const ground =
    tone === "surface"
      ? "border-y border-line-soft bg-surface"
      : tone === "muted"
        ? "bg-surface-2"
        : "";
  const headingId = id ? `${id}-heading` : undefined;

  return (
    <section
      id={id}
      aria-labelledby={title ? headingId : undefined}
      className={`scroll-mt-24 ${ground}`}
    >
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        {(eyebrow || title) && (
          <header
            className={`max-w-3xl ${center ? "mx-auto text-center" : ""}`}
          >
            {eyebrow && <Eyebrow>{eyebrow}</Eyebrow>}
            {title && (
              <h2
                id={headingId}
                className="display mt-4 text-[clamp(1.75rem,3.4vw,2.625rem)] font-medium text-ink text-balance"
              >
                {title}
              </h2>
            )}
            {lead && (
              <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">
                {lead}
              </p>
            )}
          </header>
        )}
        <div className={eyebrow || title ? "mt-12 sm:mt-14" : ""}>
          {children}
        </div>
      </div>
    </section>
  );
}

/** A white panel with an icon, a heading and a short body — the unit the
 *  inner pages' grids are built from. */
export function Card({
  icon,
  title,
  children,
}: {
  icon?: ReactNode;
  title: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-lg border border-line bg-surface p-7 sm:p-8">
      {icon && (
        <span className="grid size-11 shrink-0 place-items-center rounded-md bg-accent/8 text-accent">
          {icon}
        </span>
      )}
      <h3
        className={`${icon ? "mt-6" : ""} text-[1.125rem] font-semibold tracking-[-0.018em] text-ink text-balance`}
      >
        {title}
      </h3>
      <div className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted text-pretty">
        {children}
      </div>
    </div>
  );
}

/**
 * Label/value facts in one bordered panel with hairlines between cells.
 *
 * The hairlines are the grid's `gap-px` showing a line-coloured ground
 * through — which draws correct dividers at any column count, where
 * per-cell borders need a different rule at every breakpoint.
 */
export function Facts({
  items,
  columns = 4,
}: {
  items: { label: string; value: ReactNode; mono?: boolean }[];
  columns?: 2 | 3 | 4;
}) {
  const cols =
    columns === 2
      ? "sm:grid-cols-2"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2 lg:grid-cols-4";

  return (
    <div className="overflow-hidden rounded-lg border border-line">
      <dl className={`grid gap-px bg-line-soft ${cols}`}>
        {items.map((item) => (
          <div key={item.label} className="bg-surface px-6 py-6 sm:px-7">
            <dt className="text-[0.8125rem] text-muted">{item.label}</dt>
            <dd
              className={`mt-1.5 text-ink ${
                item.mono
                  ? "font-mono text-[0.9375rem]"
                  : "text-[1.0625rem] font-medium tracking-[-0.01em]"
              }`}
            >
              {item.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

/**
 * Questions and answers as native <details>.
 *
 * No JavaScript: every answer is in the HTML from the start, so it is
 * readable by a crawler, with scripts off, and by find-in-page. The
 * question is an h3 inside the summary, which the HTML spec allows and
 * which keeps the page outline intact.
 */
export function Faq({
  items,
}: {
  items: { question: string; answer: string }[];
}) {
  return (
    <div className="faq divide-y divide-line-soft overflow-hidden rounded-lg border border-line bg-surface">
      {items.map((item) => (
        <details key={item.question} className="group">
          <summary className="flex cursor-pointer items-center justify-between gap-6 px-6 py-6 transition-colors hover:bg-surface-2/60 sm:px-8">
            <h3 className="text-[1.0625rem] font-semibold tracking-[-0.012em] text-ink text-pretty">
              {item.question}
            </h3>
            <span
              className="faq-plus grid size-8 shrink-0 place-items-center rounded-md border border-line text-muted transition-transform group-hover:border-accent group-hover:text-accent"
              aria-hidden="true"
            >
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="h-3.5 w-3.5"
              >
                <path d="M8 3v10M3 8h10" />
              </svg>
            </span>
          </summary>
          <p className="max-w-3xl px-6 pb-7 text-[0.9375rem] leading-relaxed text-muted text-pretty sm:px-8">
            {item.answer}
          </p>
        </details>
      ))}
    </div>
  );
}

/**
 * The closing panel of an inner page: one sentence, one reason, and the
 * way to act on it.
 *
 * Light, not an ink slab — the homepage's closing section lost its dark
 * background on request, and an inner page ending on the dark panel
 * would reintroduce what was removed. The grid backdrop, centred, is
 * what keeps a white panel from reading as empty.
 */
export function ClosingCta({
  title,
  body,
  actions,
}: {
  title: ReactNode;
  body: ReactNode;
  actions: ReactNode;
}) {
  return (
    <section className="bg-paper">
      <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="relative overflow-hidden rounded-lg border border-line bg-surface px-7 py-16 text-center shadow-[0_24px_60px_-40px_rgb(0_0_0/0.35)] sm:px-14 sm:py-20">
          <div
            className="grid-backdrop grid-backdrop-center pointer-events-none absolute inset-0"
            aria-hidden="true"
          />
          <div className="relative mx-auto max-w-2xl">
            <h2 className="display text-[clamp(1.75rem,3.4vw,2.625rem)] font-medium text-ink text-balance">
              {title}
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">
              {body}
            </p>
            <div className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row">
              {actions}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
