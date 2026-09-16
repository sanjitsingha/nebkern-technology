import type { CSSProperties } from "react";
import type { Metadata } from "next";
import Image from "next/image";

import {
  IconBadgeCheck,
  IconCheck,
  IconLock,
  IconMapPin,
  IconUsers,
} from "@/components/site/icons";
import {
  ButtonLink,
  Card,
  ClosingCta,
  JsonLd,
  JumpLinks,
  PageHero,
  PageShell,
  Section,
} from "@/components/site/page";
import { PRODUCTS, STATUS_LABEL, type Product } from "@/lib/products";
import { ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { LINKS, SITE } from "@/lib/site";

const DESCRIPTION =
  "Software built, hosted and supported by Nebkern Technology: Instant for sales and support on WhatsApp, the Ask Maya AI agent, and Flowra CRM, in development.";

export const metadata: Metadata = pageMetadata({
  title: "Products — Instant, Ask Maya, Flowra CRM",
  description: DESCRIPTION,
  path: "/products",
  shareTitle: `Products — ${SITE.name}`,
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
];

/**
 * The shipped products as schema.org SoftwareApplications, in an
 * ItemList. Only products with a public site are listed: describing an
 * unreleased product as an application a search engine can surface
 * would be a claim ahead of the software.
 */
const PRODUCTS_JSONLD = {
  "@context": "https://schema.org",
  "@type": "ItemList",
  name: `${SITE.name} products`,
  itemListElement: PRODUCTS.filter((p) => p.href).map((product, index) => ({
    "@type": "ListItem",
    position: index + 1,
    item: {
      "@type": "SoftwareApplication",
      name: product.name,
      description: product.description,
      url: product.href,
      applicationCategory: "BusinessApplication",
      operatingSystem: "Web",
      publisher: { "@id": ORGANIZATION_ID },
    },
  })),
};

/** Live, shipping inside another product, or not out yet — in the
 *  product's own colour when live, the site's gold when not. */
function Status({ product }: { product: Product }) {
  const label = product.statusLabel ?? STATUS_LABEL[product.status];
  const pending = product.status === "development";

  return (
    <span
      className={`inline-flex items-center gap-2 text-[0.8125rem] font-semibold ${
        pending ? "text-warning" : "text-ink-soft"
      }`}
    >
      <span
        className="size-2"
        style={{ background: pending ? "var(--warning)" : "var(--hue)" }}
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/** Where each product's primary and secondary actions go. Kept here, not
 *  in the catalogue, because the words are this page's, not the
 *  product's. */
function actionsFor(product: Product) {
  if (product.slug === "instant") {
    return (
      <>
        <ButtonLink href={product.href!}>Visit Instant</ButtonLink>
        {product.appHref && (
          <ButtonLink href={product.appHref} variant="secondary">
            Sign in
          </ButtonLink>
        )}
      </>
    );
  }
  if (product.href) {
    return (
      <ButtonLink href={product.href}>Learn about {product.name}</ButtonLink>
    );
  }
  return (
    <ButtonLink href="/contact" variant="secondary">
      Ask us about {product.name}
    </ButtonLink>
  );
}

function ProductBlock({ product }: { product: Product }) {
  const headingId = `${product.slug}-heading`;

  return (
    <section
      id={product.slug}
      aria-labelledby={headingId}
      className="scroll-mt-24"
      style={{ "--hue": product.hue } as CSSProperties}
    >
      <div className="grid overflow-hidden rounded-lg border border-line bg-surface lg:grid-cols-[5fr_7fr]">
        {/* Identity: tinted with the product's own colour, so three
            products read as three products on a page that is otherwise
            the parent brand's indigo. */}
        <div
          className="relative flex flex-col p-8 sm:p-10"
          style={{
            background: "color-mix(in oklab, var(--hue) 5%, var(--surface))",
          }}
        >
          <span
            className="absolute inset-x-0 top-0 h-1"
            style={{ background: "var(--hue)" }}
            aria-hidden="true"
          />

          <Status product={product} />

          <h2 id={headingId} className="mt-6">
            {product.logo ? (
              <Image
                src={product.logo.src}
                alt={product.name}
                width={Math.round(
                  40 * (product.logo.width / product.logo.height),
                )}
                height={40}
                className="h-10 w-auto"
              />
            ) : (
              <span className="text-[2rem] leading-none font-semibold tracking-[-0.03em] text-ink">
                {product.name}
              </span>
            )}
          </h2>

          <p className="mt-6 text-[1.125rem] font-semibold tracking-[-0.015em] text-ink">
            {product.kicker}
          </p>
          <p className="mt-3 text-[0.9375rem] leading-relaxed text-muted text-pretty">
            {product.description}
          </p>

          <div className="mt-auto flex flex-col gap-3 pt-9 sm:flex-row sm:flex-wrap">
            {actionsFor(product)}
          </div>
        </div>

        <div className="border-t border-line-soft p-8 sm:p-10 lg:border-t-0 lg:border-l">
          <h3 className="text-[0.75rem] font-semibold tracking-[0.14em] text-muted uppercase">
            What it does
          </h3>

          {product.capabilities ? (
            <ul className="mt-7 grid gap-x-8 gap-y-5 sm:grid-cols-2">
              {product.capabilities.map((capability) => (
                <li
                  key={capability}
                  className="flex gap-3 text-[0.9375rem] leading-relaxed text-ink-soft"
                >
                  <span style={{ color: "var(--hue)" }}>
                    <IconCheck className="mt-0.5 h-5 w-5 shrink-0" />
                  </span>
                  <span className="text-pretty">{capability}</span>
                </li>
              ))}
            </ul>
          ) : (
            // Said plainly rather than filled with a feature list the
            // product does not have yet.
            <p className="mt-7 max-w-md text-[0.9375rem] leading-relaxed text-muted text-pretty">
              {product.name} is in development. We will publish what it does
              when it is ready to use, rather than announce features that do not
              exist yet.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}

export default function ProductsPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          type: "CollectionPage",
          name: `${SITE.name} products`,
          description: DESCRIPTION,
          path: "/products",
        })}
      />
      <JsonLd data={PRODUCTS_JSONLD} />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Products"
        title="Software we build, host and support ourselves."
        lead="Every Nebkern product runs on the same foundations: official platform integrations, data hosted in India, and one team that answers for it end to end."
        actions={
          <>
            <ButtonLink href={LINKS.instant}>Visit Instant</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Talk to us
            </ButtonLink>
          </>
        }
      >
        <JumpLinks
          links={[
            ...PRODUCTS.map((p) => ({ label: p.name, href: `#${p.slug}` })),
            { label: "Shared foundations", href: "#foundations" },
          ]}
        />
      </PageHero>

      <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-20 sm:px-8 sm:py-24">
        {PRODUCTS.map((product) => (
          <ProductBlock key={product.slug} product={product} />
        ))}
      </div>

      <Section
        id="foundations"
        tone="surface"
        eyebrow="Shared foundations"
        title="Adopt one product and the next is already configured"
        lead="Every product sits on the same platform, the same infrastructure in India, and the same team."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Card icon={<IconBadgeCheck />} title="Official Meta integrations">
            Nebkern is an official Meta Tech Provider. Channels connect through
            Meta&rsquo;s own OAuth flows, and every inbound webhook is verified
            against an HMAC-SHA256 signature before any data is read.
          </Card>
          <Card icon={<IconMapPin />} title="Hosted in India">
            Workspace data is hosted in Mumbai, India (ap-south-1). No reseller
            stands between you and the systems your business depends on.
          </Card>
          <Card icon={<IconLock />} title="Isolated and encrypted">
            Each workspace&rsquo;s data is separated at the database layer with
            PostgreSQL row-level security, and stored channel credentials are
            encrypted with AES-256-GCM.
          </Card>
          <Card
            icon={<IconUsers />}
            title="Supported by the people who built it"
          >
            The person who answers is the person who can fix it. And if you ever
            outgrow us, export is a feature, not a favour.
          </Card>
        </div>

        <div className="mt-10">
          <ButtonLink href="/trust" variant="secondary">
            How we protect customer data
          </ButtonLink>
        </div>
      </Section>

      <ClosingCta
        title="Not sure which product fits?"
        body="Tell us how your team talks to customers today. We will tell you plainly whether one of our products fits — or whether it does not yet."
        actions={
          <>
            <ButtonLink href="/contact">Talk to us</ButtonLink>
            <ButtonLink href={LINKS.instant} variant="secondary">
              Visit Instant
            </ButtonLink>
          </>
        }
      />
    </PageShell>
  );
}
