/**
 * Blog types, the date formatter, and the seed content.
 *
 * PLACEHOLDER DATA. Every post below was written to exercise the layout
 * — headings, lists, quotes, code, long and short titles — not to be
 * published. It is now only a SEED: `lib/blog-store.ts` copies it to
 * `content/posts.json` the first time it runs, and everything after
 * that reads and writes that file. Editing a post in /admin edits the
 * JSON, not this array.
 *
 * Nothing here may import `node:fs`, and that is the whole reason the
 * store is a separate module. This file is reachable from
 * `components/site/post-row.tsx`, which a Client Component imports, so
 * a Node built-in in this graph breaks the browser bundle.
 *
 * `Block` mirrors what a rich-text column would hold. Keeping the body
 * structured rather than raw HTML means the renderer stays in charge of
 * styling, and nothing from the database — or from the admin editor —
 * is ever injected as markup.
 */

/**
 * A run of text with its formatting attached.
 *
 * This is what lets the editor offer bold, italic and links without the
 * body becoming HTML. The renderer turns a span into a `<strong>` or an
 * `<a>` itself; nothing is ever injected as markup, so a post loaded
 * from a database — or typed into /admin — still cannot smuggle a
 * script onto the page.
 *
 * `href` is stored as written and sanitised at render time, because the
 * editor cannot be trusted to be the only writer of this data forever.
 */
/**
 * The families a span may use. Absent means the site's sans, which is
 * what the article is set in.
 *
 * A closed list, not a free string. The editor can only offer fonts the
 * published article can actually render, and these need nothing loaded
 * — one is the site's own mono face and the other is a system stack.
 * Anything else would need a webfont on every article page, or would
 * silently fall back to something else on publish.
 *
 * The stacks themselves are read by CSS — globals.css styles Quill's
 * `.ql-font-*` classes with them, and the article maps the key to a
 * utility class. The stored document holds only the KEY.
 */
export const FONT_STACKS = {
  serif: 'ui-serif, Georgia, "Times New Roman", serif',
  mono: "var(--font-mono)",
} as const;

export type FontKey = keyof typeof FONT_STACKS;

/**
 * Narrows an unknown value to a font we actually publish.
 *
 * Quill stores the KEY rather than a CSS stack, so this is the guard on
 * the way in: a `font` attribute pasted in from another document is
 * dropped unless it names one of ours, and the article can never be
 * asked to render a face it has no stack for.
 */
export function isFontKey(value: unknown): value is FontKey {
  return typeof value === "string" && value in FONT_STACKS;
}

export type Span = {
  text: string;
  bold?: boolean;
  italic?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
  font?: FontKey;
};

/**
 * One block of a post body.
 *
 * Text-bearing blocks hold `Span[]` rather than a string. Posts written
 * before that change stored a plain `text`, and `lib/blog-store.ts`
 * normalises those on read — so this type describes what the app works
 * with, and the old shape exists only on disk.
 *
 * `code` keeps a plain string on purpose: inline formatting inside a
 * code block would be meaningless, and the editor does not offer it.
 */
export type Block =
  | { type: "p"; spans: Span[] }
  | { type: "h2"; spans: Span[] }
  | { type: "h3"; spans: Span[] }
  | { type: "ul"; items: Span[][] }
  | { type: "ol"; items: Span[][] }
  | { type: "quote"; spans: Span[]; cite?: string }
  | { type: "code"; text: string }
  | { type: "hr" };

/**
 * The shape a post body had before spans existed: plain strings, no
 * inline formatting.
 *
 * Kept because the seed below and every row already in
 * content/posts.json are written this way. `lib/blog-store.ts`
 * normalises both on read, so nothing past that boundary ever sees it —
 * and a post saved from /admin is written in the new shape, so the old
 * one drains away on its own as posts are edited.
 */
export type LegacyBlock =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; text: string };

/** A post as it may exist on disk: either shape of block, mixed. */
export type StoredPost = Omit<Post, "body"> & {
  body: (Block | LegacyBlock)[];
};

/** Flattens a block's text, for word counts and anything else that
 *  wants the words without the formatting. */
export function blockText(block: Block): string {
  switch (block.type) {
    case "ul":
    case "ol":
      return block.items
        .map((item) => item.map((s) => s.text).join(""))
        .join(" ");
    case "code":
      return block.text;
    case "hr":
      return "";
    default:
      return block.spans.map((s) => s.text).join("");
  }
}

/**
 * Only `http`, `https`, `mailto` and same-page anchors survive.
 *
 * Guards against `javascript:` and `data:` URLs, which are the reason a
 * link in user-authored content is a security question and not just a
 * formatting one. Returns undefined for anything else, and the renderer
 * prints the text without a link rather than a broken one.
 */
export function safeHref(href: string | undefined): string | undefined {
  if (!href) return undefined;
  const value = href.trim();
  if (value.startsWith("/") || value.startsWith("#")) return value;
  try {
    const { protocol } = new URL(value);
    return ["http:", "https:", "mailto:"].includes(protocol)
      ? value
      : undefined;
  } catch {
    return undefined;
  }
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date. Rendered through `formatDate` so the string is identical
   *  on the server and in the browser. */
  date: string;
  readMinutes: number;
  tag: string;
  /**
   * Cover image, shown on the index and above the article.
   *
   * Optional while the photographs are outstanding — a post without one
   * renders a hatched placeholder carrying its tag, so the layout is
   * already the real layout. Expected shape once filled:
   *
   *   cover: {
   *     src: "https://media.instant.nebkern.com/assets/blog/<name>.webp",
   *     alt: "What the photograph shows",
   *   }
   *
   * No width or height: it is rendered with `fill` inside a 16:9 box,
   * so the crop is the layout's and the build never needs to fetch it.
   */
  cover?: { src: string; alt: string };
  author: { name: string; role: string };
  body: Block[];
}

/**
 * What the index renders: a post without its body or byline.
 *
 * Named because the index is a Client Component now, and handing it
 * whole `Post` objects would serialise every article's blocks into the
 * page just to print five titles and excerpts.
 */
export type PostSummary = Omit<Post, "body" | "author">;

export const SEED_POSTS: StoredPost[] = [
  {
    slug: "what-official-whatsapp-access-actually-means",
    title: "What “official WhatsApp access” actually means",
    excerpt:
      "Half the tools sold to Indian businesses run on an unofficial bridge that can lose a number overnight. Here is how to tell the difference before you commit.",
    date: "2026-08-28",
    readMinutes: 6,
    tag: "Platform",
    author: { name: "Sanjit Singh", role: "Founder" },
    body: [
      {
        type: "p",
        text: "If you have shopped for WhatsApp software in the last year, you have seen two kinds of product priced within a few hundred rupees of each other. One connects through the official WhatsApp Business Platform. The other automates WhatsApp Web in a browser somewhere and calls it an integration. They are not the same purchase, and the difference only shows up on the day it matters.",
      },
      { type: "h2", text: "The unofficial route" },
      {
        type: "p",
        text: "An unofficial tool signs in as you and drives the app the way a person would. It is quick to set up because there is no review, no business verification and nothing to approve. That is also the problem: nothing about it is sanctioned, so nothing about it is protected.",
      },
      {
        type: "ul",
        items: [
          "The number can be blocked without warning or appeal",
          "Message history lives in a session that breaks whenever the app updates",
          "There is no delivery or read reporting you can rely on",
          "Nobody is accountable to you when it stops working",
        ],
      },
      { type: "h2", text: "What official access buys" },
      {
        type: "p",
        text: "The official platform runs through Meta directly. Your number stays on your own business account with its own quality rating, templates are reviewed before they send, and delivery is reported back per message. Setup takes longer because verification is real. That delay is the product.",
      },
      {
        type: "quote",
        text: "The cheapest tool is the one you have to migrate off after it loses your number.",
      },
      { type: "h2", text: "How to check" },
      {
        type: "p",
        text: "Ask one question: is the number registered to your own WhatsApp Business account, or to a number the vendor owns? If they cannot show you the account with your name on it, you are renting somebody else’s.",
      },
    ],
  },
  {
    slug: "building-software-from-a-tier-two-city",
    title: "Building software from a tier-two city",
    excerpt:
      "Siliguri is not a tech hub, and that turned out to matter far less than we expected — and in a few specific ways, to help.",
    date: "2026-08-14",
    readMinutes: 5,
    tag: "Company",
    author: { name: "Sanjit Singh", role: "Founder" },
    body: [
      {
        type: "p",
        text: "Every argument for moving a software company to Bangalore is about proximity — to talent, to customers, to money. Two of those three stopped being about distance some time ago.",
      },
      { type: "h2", text: "What you lose" },
      {
        type: "p",
        text: "Hiring is genuinely harder. There is no pool of engineers who have already shipped something at scale, so you train people or you do it yourself. Investors are unlikely to drop in. Neither of those is fatal; both are real.",
      },
      { type: "h2", text: "What you gain" },
      {
        type: "p",
        text: "You are surrounded by the customer. The distributor two streets away runs on WhatsApp. So does the clinic, the parts supplier, the wholesaler. When the people you are building for are your neighbours, the feedback loop is measured in hours and costs nothing.",
      },
      {
        type: "ul",
        items: [
          "Cheaper to run, so the runway is longer for the same money",
          "Problems arrive from real businesses rather than from a deck",
          "Support in the same timezone and the same languages as the customer",
        ],
      },
    ],
  },
  {
    slug: "why-we-host-in-india",
    title: "Why we host in India",
    excerpt:
      "Data residency gets talked about as a compliance checkbox. The reason we do it is more boring than that, and more practical.",
    date: "2026-07-30",
    readMinutes: 4,
    tag: "Infrastructure",
    author: { name: "Sanjit Singh", role: "Founder" },
    body: [
      {
        type: "p",
        text: "Every customer conversation, contact record and media file we hold sits on infrastructure inside the country. That decision gets framed as a legal one. It was mostly a latency one.",
      },
      { type: "h2", text: "The practical case" },
      {
        type: "p",
        text: "A shared inbox is a real-time product. Every keystroke, every read receipt, every assignment crosses the network. Serving that from a region on the other side of the world adds a few hundred milliseconds to every action, and a few hundred milliseconds is the difference between an app that feels immediate and one that feels tired.",
      },
      {
        type: "code",
        text: "# round trip from a Siliguri office\nap-south-1 (Mumbai)     ~28 ms\nus-east-1  (Virginia)   ~230 ms",
      },
      { type: "h2", text: "The other case" },
      {
        type: "p",
        text: "The compliance answer matters too, and it is simpler to give when it is true by construction. When a procurement team asks where the data lives, there is one answer and it does not need qualifying.",
      },
    ],
  },
  {
    slug: "a-shared-inbox-is-not-a-chat-app",
    title: "A shared inbox is not a chat app",
    excerpt:
      "The moment two people answer the same number, the problem stops being messaging and starts being coordination.",
    date: "2026-07-11",
    readMinutes: 7,
    tag: "Product",
    author: { name: "Sanjit Singh", role: "Founder" },
    body: [
      {
        type: "p",
        text: "One person with a phone does not need software. The trouble starts at two, and it is never about the messages themselves.",
      },
      { type: "h2", text: "The three questions" },
      {
        type: "p",
        text: "Every shared inbox exists to answer the same three questions, over and over, for every open conversation.",
      },
      {
        type: "ul",
        items: [
          "Who is dealing with this one?",
          "Has anybody replied yet, and what did they say?",
          "Is this finished, or is it still waiting on us?",
        ],
      },
      {
        type: "quote",
        text: "Two people answering the same customer is not twice the service. It is half the trust.",
      },
      {
        type: "p",
        text: "Assignment, status and notes are not features bolted onto messaging. They are the actual product; the messaging is the easy part.",
      },
    ],
  },
  {
    slug: "what-we-are-building-next",
    title: "What we are building next",
    excerpt:
      "A short note on where Nebkern is going after Instant, and why the second product looks the way it does.",
    date: "2026-06-19",
    readMinutes: 3,
    tag: "Company",
    author: { name: "Sanjit Singh", role: "Founder" },
    body: [
      {
        type: "p",
        text: "Instant started because businesses were running their sales on a personal phone with no record of any of it. The same conversation keeps happening one step further along: the messages are under control now, and the relationships around them are not.",
      },
      {
        type: "p",
        text: "That is the gap the next product is aimed at. More when there is something real to show — we would rather ship it than announce it.",
      },
    ],
  },
];

/**
 * Formats an ISO date as "28 August 2026".
 *
 * Deliberately not `toLocaleDateString`: that reads the runtime's locale
 * and timezone, which differ between the server render and the browser,
 * and a date that renders differently in the two produces a hydration
 * mismatch. Parsing the ISO parts by hand keeps the output identical
 * everywhere.
 */
const MONTHS = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

export function formatDate(iso: string): string {
  const [y, m, d] = iso.split("-").map(Number);
  return `${d} ${MONTHS[m - 1]} ${y}`;
}
