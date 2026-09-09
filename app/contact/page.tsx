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

/* ============================================================
   Icons. Line-drawn at 24px to match the arrows already used
   across the site — stroke, no fill, currentColor so each one
   inherits its column's text colour.
   ============================================================ */

function IconHeadset() {
  return (
    <Glyph>
      <path d="M4 13v-2a8 8 0 0 1 16 0v2" />
      <path d="M4 13h2.5a1 1 0 0 1 1 1v3.5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z" />
      <path d="M20 13h-2.5a1 1 0 0 0-1 1v3.5a1 1 0 0 0 1 1H19a1 1 0 0 0 1-1z" />
      <path d="M20 18.5v.5a2 2 0 0 1-2 2h-3" />
    </Glyph>
  );
}

function IconLayers() {
  return (
    <Glyph>
      <path d="M4.5 5.5h7v7h-7z" />
      <path d="M14 4.5l5.5 2-2 5.5-5.5-2z" />
      <circle cx="9" cy="17.5" r="3" />
      <path d="M9 15.5v-1M9 20.5v-1M11 17.5h1M6 17.5h1" />
    </Glyph>
  );
}

function IconRenew() {
  return (
    <Glyph>
      <path d="M20 12a8 8 0 1 1-2.5-5.8" />
      <path d="M20 4v3.5h-3.5" />
      <path d="M8.5 12.2l2.4 2.3 4.6-4.6" />
    </Glyph>
  );
}

function IconDocument() {
  return (
    <Glyph>
      <path d="M4.5 5.5h15v13h-15z" />
      <path d="M4.5 9h15" />
      <path d="M7.5 12h5M7.5 15h3" />
      <path d="M15 15.5l3.5 3.5" />
    </Glyph>
  );
}

function Glyph({ children }: { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-9 w-9 text-accent"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* ============================================================
   The routes.

   Zoho's version of this layout sends each column to a different
   mailbox — sales@, upgrade@, renewal@, cancellation@. Nebkern has
   one address, so four columns pointing at it would be theatre: the
   layout would promise routing that does not exist.

   These are the four real destinations instead, in the same shape.
   ============================================================ */

type Route = {
  icon: React.ReactNode;
  question: string;
  action: string;
  href: string;
  /** An extra outlined link under the action, as the refund column has
   *  in the original. */
  secondary?: { label: string; href: string };
};

const NEW_HERE: Route = {
  icon: <IconHeadset />,
  question:
    "New to Nebkern? Want a walkthrough, or have questions about what we build and what it costs?",
  action: SITE.email,
  href: `mailto:${SITE.email}`,
};

const EXISTING: Route[] = [
  {
    icon: <IconLayers />,
    question:
      "Need help with your account — adding numbers, changing your plan, or extra services?",
    action: "Instant help centre",
    href: LINKS.contact,
  },
  {
    icon: <IconRenew />,
    question:
      "Setting something up and stuck, or want the detail on how a feature actually works?",
    action: "Read the docs",
    href: LINKS.docs,
  },
  {
    icon: <IconDocument />,
    question:
      "Need to cancel or change a subscription? We would rather hear why than watch you go quietly.",
    action: SITE.email,
    href: `mailto:${SITE.email}`,
    secondary: { label: "Read our refund policy", href: LINKS.refunds },
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

/** Sits on a group's top border, centred. `bg-surface` is the card
 *  behind it, which is what makes it read as pinned to the edge rather
 *  than floating over it. */
function Badge({
  children,
  tone,
}: {
  children: React.ReactNode;
  tone: "accent" | "ink";
}) {
  return (
    <span
      className={`absolute -top-2.5 left-1/2 -translate-x-1/2 rounded-sm px-3 py-1 text-[0.6875rem] font-semibold tracking-[0.1em] whitespace-nowrap uppercase ${
        tone === "accent"
          ? "bg-accent text-accent-fg"
          : "bg-panel text-panel-fg"
      }`}
    >
      {children}
    </span>
  );
}

function Column({ route }: { route: Route }) {
  const external = route.href.startsWith("http");

  return (
    <div className="flex flex-col gap-5 px-6 py-8 sm:px-8">
      {route.icon}

      <p className="text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
        {route.question}
      </p>

      <a
        href={route.href}
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="text-[0.9375rem] font-medium break-all text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
      >
        {route.action}
      </a>

      {route.secondary && (
        <a
          href={route.secondary.href}
          target="_blank"
          rel="noopener noreferrer"
          className="group mt-auto inline-flex items-center gap-2 self-start rounded-sm border border-line px-4 py-2.5 text-[0.8125rem] font-medium tracking-[0.04em] text-ink uppercase transition-colors hover:border-accent hover:text-accent"
        >
          {route.secondary.label}
          <svg
            viewBox="0 0 16 16"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
            aria-hidden="true"
          >
            <path d="M3 8h10M9 4l4 4-4 4" />
          </svg>
        </a>
      )}
    </div>
  );
}

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
        {/* The coloured band. Its bottom padding is deliberately large:
            the card below is pulled up into it, and this is the space
            being pulled into. */}
        <section className="bg-accent">
          <div className="mx-auto max-w-5xl px-5 pt-20 pb-44 text-center sm:px-8 sm:pt-24">
            <h1 className="display text-[clamp(2rem,4.2vw,3.25rem)] font-medium text-accent-fg text-balance">
              Looking for something in particular?
            </h1>
            <p className="mt-4 text-lg text-accent-fg/80">
              We are here to help.
            </p>
            {/* The one flash of gold on the page. It is the site's
                `--warning` token rather than a new colour — on indigo it
                does the job Zoho's yellow rule does. */}
            <span
              className="mx-auto mt-7 block h-0.5 w-12 bg-warning"
              aria-hidden="true"
            />
          </div>
        </section>

        {/* Pulled up so it straddles the band's bottom edge. `relative`
            because a negative margin moves the box but does not decide
            what paints on top of the coloured section. */}
        <section className="relative">
          <div className="mx-auto -mt-32 max-w-6xl px-5 sm:px-8">
            <div className="rounded-md border border-line bg-surface p-3 shadow-[0_24px_60px_-32px_rgb(0_0_0/0.35)] sm:p-4">
              {/* 1 / 3, so the single new-here column and the three
                  existing-customer ones each get even width. Stacks
                  below `lg`, where four columns would be unreadable. */}
              <div className="grid gap-3 lg:grid-cols-[1fr_3fr] lg:gap-4">
                <div className="relative rounded-sm border border-line-soft pt-3">
                  <Badge tone="accent">I&rsquo;m new here</Badge>
                  <Column route={NEW_HERE} />
                </div>

                {/* One bordered group with internal dividers, not three
                    boxes — the badge labels the set, so the set has to
                    read as one object. */}
                <div className="relative rounded-sm border border-line-soft pt-3">
                  <Badge tone="ink">Existing customer</Badge>
                  <div className="grid divide-y divide-line-soft sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                    {EXISTING.map((route) => (
                      <Column key={route.question} route={route} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section>
          <div className="mx-auto max-w-6xl px-5 py-16 sm:px-8 sm:py-20">
            <h2 className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
              Registered details
            </h2>

            <dl className="mt-6 grid gap-x-10 gap-y-5 sm:grid-cols-2 lg:grid-cols-4">
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
