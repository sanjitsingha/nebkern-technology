import type { Metadata } from "next";

import {
  IconArrowUpRight,
  IconBell,
  IconDatabase,
  IconDocument,
  IconLock,
  IconMapPin,
  IconMinusCircle,
  IconPlug,
  IconUsers,
} from "@/components/site/icons";
import {
  ButtonLink,
  Card,
  ClosingCta,
  Eyebrow,
  Facts,
  JsonLd,
  JumpLinks,
  PageHero,
  PageShell,
  Section,
} from "@/components/site/page";
import { POLICIES, REGISTERED_DETAILS } from "@/lib/company";
import { pageMetadata, webPageJsonLd } from "@/lib/seo";
import { LINKS, SITE } from "@/lib/site";

const DESCRIPTION =
  "How Nebkern protects customer data — hosting in India, encryption and tenant isolation — with company registration details and every published policy.";

export const metadata: Metadata = pageMetadata({
  title: "Trust & security",
  description: DESCRIPTION,
  path: "/trust",
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Trust & security", path: "/trust" },
];

const REPORT_HREF = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Security report",
)}`;

const REVIEW_HREF = `mailto:${SITE.email}?subject=${encodeURIComponent(
  "Security review",
)}`;

/**
 * /trust — what a security, legal or procurement reviewer looks for.
 *
 * NOTHING ON THIS PAGE IS NEW. Every control is summarised from Instant's
 * published Security Policy, every limit from its "What we do not claim"
 * section and Subprocessor List, and every registration detail from
 * `lib/site.ts`. The policies themselves are linked, not copied: those
 * are the documents Razorpay and Meta reviewed, and a second copy here
 * would be a second version that could drift.
 *
 * If a control changes, it changes in the Security Policy first. Then
 * here.
 */
export default function TrustPage() {
  return (
    <PageShell>
      <JsonLd
        data={webPageJsonLd({
          name: `Trust & security at ${SITE.name}`,
          description: DESCRIPTION,
          path: "/trust",
        })}
      />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Trust & security"
        title="What we protect, how we protect it, and who we are on paper."
        lead="Everything a security, legal or procurement review usually asks for, in one place — with every claim traceable to a published policy."
        actions={
          <>
            <ButtonLink href={LINKS.security}>
              Read the Security Policy
            </ButtonLink>
            <ButtonLink href="#report" variant="secondary">
              Report a vulnerability
            </ButtonLink>
          </>
        }
      >
        <JumpLinks
          links={[
            { label: "Company verification", href: "#verification" },
            { label: "Data protection", href: "#data-protection" },
            { label: "What we do not claim", href: "#not-claimed" },
            { label: "Policies", href: "#policies" },
            { label: "Report a vulnerability", href: "#report" },
          ]}
        />
      </PageHero>

      <Section
        id="verification"
        eyebrow="Company verification"
        title="Who you would be contracting with"
        lead="The registered particulars, exactly as they appear in our legal documents."
      >
        <Facts
          columns={3}
          items={[
            ...REGISTERED_DETAILS,
            { label: "Meta status", value: "Official Meta Tech Provider" },
            {
              label: "Contact",
              value: (
                <a
                  href={`mailto:${SITE.email}`}
                  className="break-all text-accent underline underline-offset-4 hover:text-accent-hover"
                >
                  {SITE.email}
                </a>
              ),
            },
          ]}
        />
      </Section>

      <Section
        id="data-protection"
        tone="surface"
        eyebrow="Data protection"
        title="How our products protect customer data"
        lead="Summarised from Instant's published Security Policy, which describes the controls actually operated — not the ones that sound reassuring."
      >
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          <Card icon={<IconMapPin />} title="Hosted in India">
            Workspace data is hosted in Mumbai, India (ap-south-1). Secrets live
            in the deployment environment, never in the code repository.
          </Card>
          <Card icon={<IconLock />} title="Encrypted in transit and at rest">
            Traffic is served over HTTPS with TLS, and data sits on encrypted
            volumes. Channel and AI provider credentials get a second layer:
            AES-256-GCM under a key held only on the server.
          </Card>
          <Card icon={<IconDatabase />} title="Isolated at the database layer">
            PostgreSQL row-level security scopes every row to the workspace that
            owns it, so a query cannot return another workspace&rsquo;s data
            even if application logic is wrong.
          </Card>
          <Card icon={<IconPlug />} title="Verified integrations">
            Inbound Meta webhooks are checked against an HMAC-SHA256 signature
            before any data is read. Channels connect through official OAuth,
            and outbound webhooks are signed per endpoint.
          </Card>
          <Card icon={<IconUsers />} title="Least-privilege access">
            Roles decide who can read conversations or change settings.
            Back-office access is limited to an explicit allow-list, and staff
            reach customer data only to run the service or resolve a request.
          </Card>
          <Card icon={<IconBell />} title="Incident response">
            Suspected incidents are contained first, then investigated. Where a
            personal data breach affects your data, you are notified without
            undue delay and within 72 hours.
          </Card>
        </div>

        <div className="mt-10">
          <ButtonLink href={LINKS.security} variant="secondary">
            Read the full Security Policy
          </ButtonLink>
        </div>
      </Section>

      <Section
        id="not-claimed"
        eyebrow="What we do not claim"
        title="The limits, stated plainly"
        lead="A security page is more useful when it is honest about its edges."
      >
        <ul className="divide-y divide-line-soft overflow-hidden rounded-lg border border-line bg-surface">
          {[
            "We do not currently claim SOC 2, ISO 27001 or PCI DSS certification. Card and UPI payments are handled entirely by Razorpay, which holds its own compliance — card details are never received or stored on our servers.",
            "Messages on the WhatsApp Business Platform are not end-to-end encrypted the way personal WhatsApp chats are. A business API message is readable by the business and its platform — that is what makes a shared team inbox possible.",
            "Meta processes message data on its own global infrastructure, under its own terms. That is outside our control, and unavoidable on any WhatsApp Business Platform product.",
            "No system is perfectly secure, and no provider can honestly promise otherwise.",
          ].map((limit) => (
            <li
              key={limit}
              className="flex gap-4 px-6 py-6 text-[0.9375rem] leading-relaxed text-ink-soft sm:px-8"
            >
              <span className="text-muted">
                <IconMinusCircle className="mt-0.5 h-5 w-5 shrink-0" />
              </span>
              <span className="text-pretty">{limit}</span>
            </li>
          ))}
        </ul>
      </Section>

      <Section
        id="policies"
        tone="surface"
        eyebrow="Policies"
        title="Every published policy"
        lead="Issued by Nebkern Technology and published alongside Instant, the product they govern."
      >
        <ul className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {POLICIES.map((policy) => (
            <li key={policy.title}>
              <a
                href={policy.href}
                className="group flex h-full flex-col rounded-lg border border-line bg-paper p-7 transition-colors hover:border-accent"
              >
                <span className="flex items-start justify-between gap-4">
                  <span className="grid size-11 place-items-center rounded-md bg-accent/8 text-accent">
                    <IconDocument />
                  </span>
                  <span className="text-muted transition-colors group-hover:text-accent">
                    <IconArrowUpRight className="h-5 w-5" />
                  </span>
                </span>
                <h3 className="mt-6 text-[1.125rem] font-semibold tracking-[-0.018em] text-ink">
                  {policy.title}
                </h3>
                <p className="mt-2.5 text-[0.9375rem] leading-relaxed text-muted text-pretty">
                  {policy.summary}
                </p>
              </a>
            </li>
          ))}
        </ul>
      </Section>

      <section
        id="report"
        aria-labelledby="report-heading"
        className="scroll-mt-24"
      >
        <div className="mx-auto grid max-w-6xl gap-10 px-5 py-20 sm:px-8 sm:py-24 lg:grid-cols-2 lg:gap-16">
          <div>
            <Eyebrow>Report a vulnerability</Eyebrow>
            <h2
              id="report-heading"
              className="display mt-4 text-[clamp(1.75rem,3.4vw,2.625rem)] font-medium text-ink text-balance"
            >
              Found a security issue? We want to hear about it.
            </h2>
            <p className="mt-5 text-lg leading-relaxed text-muted text-pretty">
              Email {SITE.email} with enough detail to reproduce it — the
              affected URL or endpoint, the steps, and what you were able to
              access. We will acknowledge it, investigate, keep you updated, and
              credit you if you would like that.
            </p>
            <div className="mt-9">
              <ButtonLink href={REPORT_HREF}>Email a report</ButtonLink>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-surface p-7 sm:p-9">
            <h3 className="text-[0.75rem] font-semibold tracking-[0.14em] text-muted uppercase">
              Ground rules for research
            </h3>
            <ol className="mt-6 space-y-5">
              {[
                "Give us a reasonable opportunity to fix an issue before disclosing it publicly.",
                "Test only against your own account and data. If a flaw would let you reach another customer's data, stop and tell us instead of proving it.",
                "No denial-of-service testing, social engineering, physical attacks, or automated scanning that degrades the service for others.",
                "We will not pursue legal action over good-faith research that follows these rules.",
              ].map((rule, index) => (
                <li
                  key={rule}
                  className="flex gap-4 text-[0.9375rem] leading-relaxed text-ink-soft"
                >
                  <span className="grid size-7 shrink-0 place-items-center rounded-md bg-surface-2 font-mono text-[0.75rem] text-muted">
                    {index + 1}
                  </span>
                  <span className="text-pretty">{rule}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>

      <ClosingCta
        title="Running a security or procurement review?"
        body="If your process needs a security questionnaire completed or current documentation shared, write to us and we will work through it with you."
        actions={
          <>
            <ButtonLink href={REVIEW_HREF}>Email us</ButtonLink>
            <ButtonLink href="/contact" variant="secondary">
              Other ways to reach us
            </ButtonLink>
          </>
        }
      />
    </PageShell>
  );
}
