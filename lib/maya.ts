import { COMPANY_FAQ } from "@/lib/company";
import { PRODUCTS, STATUS_LABEL, type Product } from "@/lib/products";
import { SITE } from "@/lib/site";

/**
 * Ask Maya on this site: the product entry, and the playground's
 * knowledge bases and limits.
 *
 * Client-safe on purpose. The playground's browser half shows each
 * knowledge base in full — so a visitor can check that an answer really
 * came from it — and enforces the same limits the server does, so it
 * can say "too long" before sending rather than after.
 */

/** The catalogue entry, so the colour, links and capability lines here
 *  are the same ones /products shows and cannot drift from them. */
export const MAYA: Product = PRODUCTS.find((p) => p.slug === "ask-maya")!;

/** Where the playground lives — defined in lib/site.ts, see there. */
export { PLAYGROUND_PATH } from "@/lib/site";

/**
 * Limits, shared by the form and the route that enforces them.
 *
 * Customer messages on WhatsApp are short; 500 characters is several
 * sentences. The knowledge base cap keeps a pasted document to a few
 * thousand tokens, and the turn cap bounds what one conversation can
 * cost — on the visitor's side, a clear stop rather than a slow creep.
 */
export const MAYA_LIMITS = {
  messageChars: 500,
  knowledgeChars: 8000,
  /** Customer messages per conversation before "start over". */
  customerTurns: 12,
} as const;

export type PresetId = "sample-store" | "nebkern";
export type KnowledgeSource = PresetId | "custom";

export interface KnowledgePreset {
  id: PresetId;
  label: string;
  /** One line under the picker saying what this knowledge base is. */
  blurb: string;
  knowledge: string;
  /** Tap-to-send questions. The last one of each is chosen to fall
   *  outside the knowledge base, so a visitor sees a handoff too. */
  questions: string[];
}

/**
 * A made-up shop. Deliberately ordinary — the questions a clothing store
 * gets on WhatsApp all day — and deliberately labelled as invented, on
 * the page and in its own first line, so nobody mistakes its prices or
 * policies for a real business's.
 */
const SAMPLE_STORE = `Sample Store is a made-up clothing shop, invented for this demo. Its products, prices and policies are not real.

ABOUT
Sample Store sells cotton kurtas, shirts, pants and dupattas, made in Jaipur, and ships across India from Jaipur. Customer support replies on WhatsApp from 10am to 7pm IST, Monday to Saturday.

PRODUCTS
- Indigo block-print kurta: ₹1,299. Sizes S, M, L, XL, XXL. Colours indigo and rust. In stock.
- Classic white cotton shirt: ₹999. Sizes S to XXL. In stock.
- Linen straight pants: ₹1,149. Waist sizes 28 to 38 inches. In stock.
- Mulmul dupatta: ₹649. One size. Colours mustard, rose and sage. Sage is out of stock until 30 October.

SIZES
Kurta and shirt chest measurements: S 38 in, M 40 in, L 42 in, XL 44 in, XXL 46 in. Between two sizes, choose the larger one.

SHIPPING
Free shipping on orders of ₹999 or more; ₹79 below that. Orders ship within one business day. Delivery takes 3 to 5 business days to Delhi, Mumbai, Bengaluru, Chennai, Kolkata and Hyderabad, and 5 to 8 business days everywhere else. Every serviceable Indian pincode is covered. No shipping outside India. A tracking link is sent on WhatsApp when the order ships.

PAYMENT
UPI, debit and credit cards, net banking, and cash on delivery. Cash on delivery is available on orders up to ₹5,000, with a ₹49 fee.

RETURNS AND EXCHANGES
Kurtas, shirts and pants can be returned within 7 days of delivery if unworn, with tags attached. Refunds go back to the original payment method within 5 to 7 business days of the return reaching the store; cash-on-delivery orders are refunded by UPI. One free size exchange per order. Dupattas and sale items cannot be returned.

CARE
Hand wash cold, or machine wash on a gentle cycle. Block prints can bleed on the first wash, so wash them separately.`;

/**
 * Nebkern itself, built from this site's own published facts — the same
 * catalogue, FAQ and particulars the pages render — so nothing Maya says
 * about the company here can be something the site does not say.
 *
 * Prices are absent because this site publishes none. That is what makes
 * "how much does Instant cost?" a real handoff rather than a staged one.
 */
function nebkernKnowledge(): string {
  const products = PRODUCTS.map((product) => {
    const status = product.statusLabel ?? STATUS_LABEL[product.status];
    const lines = [
      `- ${product.name} (${status}): ${product.description}${
        product.href ? ` Website: ${product.href}` : ""
      }`,
      ...(product.capabilities ?? []).map((line) => `  - ${line}`),
    ];
    return lines.join("\n");
  }).join("\n");

  const faq = COMPANY_FAQ.map(
    (item) => `Q: ${item.question}\nA: ${item.answer}`,
  ).join("\n\n");

  return `These are the facts published on nebkern.com, the website of ${SITE.name}.

ABOUT
${SITE.description}
${SITE.name} is ${SITE.entity} based in ${SITE.address}. Udyam (MSME) registration number: ${SITE.udyam}. Contact email: ${SITE.email}.

PRODUCTS
${products}

FREQUENTLY ASKED QUESTIONS
${faq}`;
}

export const PRESETS: KnowledgePreset[] = [
  {
    id: "sample-store",
    label: "Sample store",
    blurb:
      "A made-up clothing shop — its products, prices and policies are invented for this demo.",
    knowledge: SAMPLE_STORE,
    questions: [
      "Can I return a dupatta?",
      "I'm between M and L in the kurta. Which should I pick?",
      "Is cash on delivery available?",
      "My parcel came torn. I want to talk to someone.",
    ],
  },
  {
    id: "nebkern",
    label: "Nebkern",
    blurb:
      "The facts published on this website: our products, where data is stored, how the company is registered.",
    knowledge: nebkernKnowledge(),
    questions: [
      "What does Instant do?",
      "Where is customer data stored?",
      "Can Maya use my own OpenAI key?",
      "How much does Instant cost per month?",
    ],
  },
];

export function presetById(id: string): KnowledgePreset | undefined {
  return PRESETS.find((preset) => preset.id === id);
}
