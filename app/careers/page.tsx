import type { Metadata } from "next";

import {
  IconBell,
  IconDatabase,
  IconLayers,
  IconMapPin,
  IconMessage,
  IconPlug,
  IconServer,
  IconSparkles,
} from "@/components/site/icons";
import {
  ButtonLink,
  Card,
  JsonLd,
  PageHero,
  PageShell,
  Section,
} from "@/components/site/page";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { SITE } from "@/lib/site";

const DESCRIPTION =
  "Work at Nebkern Technology, a software company in Siliguri, West Bengal, that builds, hosts and supports its own products. See how we work and how to apply.";

export const metadata: Metadata = pageMetadata({
  title: "Careers",
  description: DESCRIPTION,
  path: "/careers",
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Careers", path: "/careers" },
];

const APPLY_HREF = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Careers at Nebkern",
)}`;

/**
 * /careers
 *
 * There are no published openings, and this page says so instead of
 * inventing roles to look busy — a job listing is an offer someone acts
 * on. When there are roles, list them in the "Open roles" section and
 * add JobPosting structured data for each; until then there is
 * deliberately none, because Google treats a JobPosting for a job that
 * does not exist as spam.
 *
 * "How we work" restates the company's published values in the terms a
 * candidate cares about; "The work" describes what the products
 * actually involve. Neither makes a promise the products do not already
 * make in public.
 */
export default function CareersPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          name: `Careers at ${SITE.name}`,
          description: DESCRIPTION,
          path: "/careers",
        })}
      />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Careers"
        title="Build the software Indian businesses run on."
        lead={`Nebkern is a small team in ${SITE.city}, West Bengal. We own what we build — from the first commit to the support conversation after it ships.`}
        actions={
          <>
            <ButtonLink href="#open-roles">See open roles</ButtonLink>
            <ButtonLink href="/about" variant="secondary">
              About the company
            </ButtonLink>
          </>
        }
      />

      <Section
        id="how-we-work"
        eyebrow="How we work"
        title="Four things that shape the work here"
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Card icon={<IconServer />} title="Own it end to end">
            We write the code, own the repositories and run the servers. Nothing
            is thrown over a wall to another team to deploy or to support.
          </Card>
          <Card icon={<IconLayers />} title="Products, not projects">
            We build software we keep running and improving, so the work
            compounds instead of being handed over and forgotten.
          </Card>
          <Card icon={<IconMessage />} title="Close to the customer">
            The person who answers a customer is the person who can fix the
            problem. Nobody relays tickets to a team the customer never meets.
          </Card>
          <Card icon={<IconMapPin />} title="Built for India">
            Official platform integrations, data hosted in India, and product
            decisions made for how business here actually gets done.
          </Card>
        </div>
      </Section>

      <Section
        id="the-work"
        tone="surface"
        eyebrow="The work"
        title="What you would be building"
        lead="Real product and infrastructure problems, on software that businesses depend on every day."
      >
        <div className="grid gap-5 md:grid-cols-2">
          <Card icon={<IconPlug />} title="Messaging platform integrations">
            Official integrations with the WhatsApp Business Platform, Instagram
            and Messenger — webhooks, signature checks, signed deliveries and
            every edge case that comes with them.
          </Card>
          <Card
            icon={<IconDatabase />}
            title="Multi-tenant product engineering"
          >
            A shared team inbox, contacts, pipelines and automations, with every
            workspace isolated at the database layer.
          </Card>
          <Card icon={<IconSparkles />} title="Applied AI">
            Ask Maya answers customers from a business&rsquo;s own catalogue,
            prices and policies — grounded, scoped to one workspace, and never
            trained on its conversations.
          </Card>
          <Card icon={<IconServer />} title="Infrastructure we run">
            Deploys, backups, incident response and the on-call that keeps it
            all running for the businesses that rely on it.
          </Card>
        </div>
      </Section>

      <Section id="open-roles" eyebrow="Open roles" title="Current openings">
        <div className="rounded-lg border border-line bg-surface">
          <div className="flex flex-col gap-5 border-b border-line-soft p-7 sm:flex-row sm:items-center sm:p-9">
            <span className="grid size-11 shrink-0 place-items-center rounded-md bg-surface-2 text-muted">
              <IconBell />
            </span>
            <div>
              <p className="text-[1.125rem] font-semibold tracking-[-0.015em] text-ink">
                No open roles are listed right now.
              </p>
              <p className="mt-1 text-[0.9375rem] text-muted">
                Roles are posted on this page when we are hiring.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6 p-7 sm:p-9 lg:flex-row lg:items-center lg:justify-between">
            <p className="max-w-2xl text-[1.0625rem] leading-relaxed text-ink-soft text-pretty">
              Want to be considered for the next one? Send a short note and a
              link to something you have built — code, a product, anything you
              are proud of.
            </p>
            <div className="shrink-0">
              <ButtonLink href={APPLY_HREF}>Send us a note</ButtonLink>
            </div>
          </div>
        </div>
      </Section>
    </PageShell>
  );
}
