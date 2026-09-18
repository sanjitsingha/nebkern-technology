import type { Metadata } from "next";

import {
  IconArrowUpRight,
  IconDocument,
  IconMessage,
  IconUsers,
} from "@/components/site/icons";
import { MayaPlayground } from "@/components/site/maya-playground";
import {
  ButtonLink,
  Card,
  ClosingCta,
  Facts,
  JsonLd,
  PageHero,
  PageShell,
  Section,
} from "@/components/site/page";
import { MAYA, PLAYGROUND_PATH } from "@/lib/maya";
import { playgroundEnabled } from "@/lib/maya-playground";
import { ORGANIZATION_ID, pageMetadata, webPageJsonLd } from "@/lib/seo";
import { LINKS, SITE } from "@/lib/site";

const TITLE = "Ask Maya playground — try the AI agent";
const DESCRIPTION =
  "Try Ask Maya, the AI agent inside Instant. Pick what she knows, message her like a customer, and watch her answer from it — or hand off to a person.";

export const metadata: Metadata = pageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: PLAYGROUND_PATH,
  shareTitle: `Maya playground — ${SITE.name}`,
});

const CRUMBS = [
  { name: "Home", path: "/" },
  { name: "Products", path: "/products" },
  { name: "Maya playground", path: PLAYGROUND_PATH },
];

/**
 * Every line here is something Maya does in Instant, as Instant's own
 * published pages and its playground's instructions describe her:
 * grounded on the business's knowledge base rather than the open
 * internet, replying in the customer's language, drafting or answering,
 * and handing off rather than guessing.
 */
const HOW = [
  {
    icon: <IconDocument className="h-5 w-5" />,
    title: "She reads what you give her",
    body: "Your catalogue, prices, policies and FAQs — not the open internet. Her answers are your business's, not a guess from somewhere else.",
  },
  {
    icon: <IconMessage className="h-5 w-5" />,
    title: "She answers like your team would",
    body: "In the customer's own language, in a message short enough for WhatsApp. Or she drafts the reply and one of your team sends it.",
  },
  {
    icon: <IconUsers className="h-5 w-5" />,
    title: "She hands off instead of guessing",
    body: "When the answer isn't in what she knows — or a customer asks for a person, or is upset — she passes the chat to your team rather than making something up.",
  },
];

/**
 * How this page differs from the real thing — said plainly, because a
 * demo that looks like the product invites the assumption that it IS
 * the product, down to where the words go.
 */
const DIFFERENCES = [
  {
    label: "What she knows",
    here: "A sample, this site, or text you paste.",
    instant: "The documents your business uploads.",
  },
  {
    label: "The model",
    here: "Anthropic's Claude, on Nebkern's account.",
    instant: "Your own OpenAI, Anthropic or OpenRouter key.",
  },
  {
    label: "Where she talks",
    here: "This page.",
    instant: "Your WhatsApp number, next to your team's shared inbox.",
  },
  {
    label: "What is kept",
    here: "Nothing.",
    instant:
      "Conversations stay in your workspace, and are never used to train general-purpose models.",
  },
];

export default function MayaPlaygroundPage() {
  return (
    <PageShell>
      <JsonLd
        data={{
          ...webPageJsonLd({
            name: TITLE,
            description: DESCRIPTION,
            path: PLAYGROUND_PATH,
          }),
          // What the page is about, as its own entity: Ask Maya, published
          // by the company and pointing at its home on Instant's site.
          mainEntity: {
            "@type": "SoftwareApplication",
            name: MAYA.name,
            description: MAYA.description,
            applicationCategory: "BusinessApplication",
            operatingSystem: "Web",
            url: LINKS.askMaya,
            publisher: { "@id": ORGANIZATION_ID },
          },
        }}
      />

      <PageHero
        crumbs={CRUMBS}
        eyebrow="Ask Maya"
        title="Try Maya on a knowledge base you choose."
        lead="Maya is the AI agent inside Instant. Pick what she knows — a sample shop, this company, or text you paste — then message her the way a customer would. She answers only from that, and hands the chat to a person when the answer isn't there."
      />

      {/* The playground reads the key at build time: no key, and it says
          it isn't switched on rather than offering a chat that cannot
          answer. */}
      <Section id="playground">
        <MayaPlayground enabled={playgroundEnabled()} />
      </Section>

      <Section
        id="how"
        tone="surface"
        eyebrow="How Maya works"
        title="Grounded answers, and a person when they run out."
        lead="The playground runs Maya's own instructions from Instant, so what you see here is how she behaves with real customers."
      >
        <div className="grid gap-5 md:grid-cols-3">
          {HOW.map((item) => (
            <Card key={item.title} icon={item.icon} title={item.title}>
              {item.body}
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="differences"
        eyebrow="This page and Instant"
        title="What changes when she works for you."
      >
        {/* "Here" in the quieter weight, "In Instant" in the value's own —
            the product is the point, this page the exception to it. */}
        <Facts
          columns={2}
          items={DIFFERENCES.map((row) => ({
            label: row.label,
            value: (
              <>
                <span className="block text-[0.9375rem] font-normal text-muted">
                  Here: {row.here}
                </span>
                <span className="mt-1.5 block">In Instant: {row.instant}</span>
              </>
            ),
          }))}
        />
      </Section>

      <ClosingCta
        title="Put Maya on your own WhatsApp."
        body="She ships inside Instant. Connect your number, give her your knowledge base, and test her in Instant's own playground before a customer ever sees her."
        actions={
          <>
            <ButtonLink href={LINKS.askMaya}>See Ask Maya on Instant</ButtonLink>
            <ButtonLink href={LINKS.instant} variant="secondary" arrow={false}>
              Visit Instant
              <IconArrowUpRight className="h-3.5 w-3.5" />
            </ButtonLink>
          </>
        }
      />
    </PageShell>
  );
}
