import { PRODUCTS } from "@/lib/products";
import { LINKS, SITE } from "@/lib/site";

/**
 * Company content shared by more than one page.
 *
 * The rule for everything in this file is the same as for `lib/site.ts`:
 * each statement must be traceable to something already published —
 * this site's own copy, `lib/site.ts`, or Instant's legal pages. A
 * company page that invents a founding year, a customer count or a
 * certification is worse than one that says less, because those are
 * exactly the facts a buyer's due diligence checks.
 */

/** Products that are live, versus the whole catalogue. Derived, so the
 *  "at a glance" numbers can never drift from `lib/products.ts`. */
export const PRODUCT_COUNTS = {
  total: PRODUCTS.length,
  live: PRODUCTS.filter((p) => p.status === "live").length,
};

/** The registered particulars, as a buyer's finance or legal team asks
 *  for them. Mono where the value is an identifier to be checked. */
export const REGISTERED_DETAILS: {
  label: string;
  value: string;
  mono?: boolean;
}[] = [
  { label: "Legal name", value: SITE.name },
  { label: "Constitution", value: capitalise(SITE.entity) },
  { label: "Registered address", value: SITE.address },
  { label: "Udyam (MSME) registration", value: SITE.udyam, mono: true },
];

function capitalise(text: string) {
  // "a sole proprietorship" → "Sole proprietorship"
  const bare = text.replace(/^an?\s+/i, "");
  return bare.charAt(0).toUpperCase() + bare.slice(1);
}

/**
 * Questions people ask about the company, answered from published facts.
 *
 * Rendered on /about as native <details>, and emitted as FAQPage
 * structured data from the same array — the two cannot disagree.
 */
export const COMPANY_FAQ: { question: string; answer: string }[] = [
  {
    question: "What does Nebkern Technology do?",
    answer: `${SITE.name} is a software company that designs, builds, hosts and supports its own products for Indian businesses. Its flagship product is Instant, sales and support on the official WhatsApp Business API, with an AI agent, Ask Maya, built in.`,
  },
  {
    question: "Where is Nebkern Technology based?",
    answer: `In ${SITE.address}. The company builds and supports its products from North Bengal.`,
  },
  {
    question: "Is Nebkern an official Meta Tech Provider?",
    answer:
      "Yes. Nebkern Technology is an official Meta Tech Provider. That is its own integration with the WhatsApp Business Platform, Instagram and Messenger, so a business connects directly rather than through a third party's account.",
  },
  {
    question: "Where is customer data stored?",
    answer:
      "Instant's workspace data is hosted in Mumbai, India (ap-south-1). Meta processes message data on its own infrastructure under its own terms, which is unavoidable on any WhatsApp Business Platform product. The Subprocessor List names every provider involved.",
  },
  {
    question: "Does Nebkern take on custom software projects?",
    answer:
      "Nebkern builds and maintains its own products rather than one-off client projects, so improvements reach every customer instead of a single handed-over codebase. If your business has a problem none of our products solve yet, we would still like to hear about it.",
  },
  {
    question: "How is the company registered?",
    answer: `${SITE.name} is ${SITE.entity} based in ${SITE.address}, with Udyam (MSME) registration number ${SITE.udyam}.`,
  },
];

export function faqJsonLd(items: { question: string; answer: string }[]) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: { "@type": "Answer", text: item.answer },
    })),
  };
}

/**
 * The published policies. They live on instant.nebkern.com because they
 * govern Instant, and they are issued by Nebkern Technology — so this
 * site links to them rather than keeping a second copy that could drift
 * from the one Razorpay and Meta actually reviewed.
 *
 * Titles match the documents' own headings; the summaries are each
 * document's own introduction, shortened.
 */
export const POLICIES: {
  title: string;
  summary: string;
  href: string;
}[] = [
  {
    title: "Privacy Policy",
    summary:
      "What we collect, why we have it, who else sees it, and how to get it back or get it deleted.",
    href: LINKS.privacy,
  },
  {
    title: "Terms & Conditions",
    summary:
      "What you can expect from us, what we need from you, and what happens when something goes wrong.",
    href: LINKS.terms,
  },
  {
    title: "Security Policy",
    summary:
      "The controls we actually operate, plus an honest account of what we do not claim.",
    href: LINKS.security,
  },
  {
    title: "Data Processing Agreement",
    summary:
      "How we handle the personal data we hold on your instructions. It applies from the moment you accept the Terms.",
    href: LINKS.dpa,
  },
  {
    title: "Subprocessor List",
    summary:
      "Every third party that touches your data, what each can see, and how to object.",
    href: LINKS.subprocessors,
  },
  {
    title: "Cancellation & Refunds",
    summary:
      "Cancel in two clicks, keep what you paid for until the period ends, and exactly when money comes back.",
    href: LINKS.refunds,
  },
];
