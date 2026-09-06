/**
 * Blog content.
 *
 * PLACEHOLDER DATA. Every post below is written to exercise the layout —
 * headings, lists, quotes, code, long and short titles — not to be
 * published. Replace it before the blog goes live.
 *
 * This file is the seam where Supabase will plug in. The pages import
 * only `listPosts()` and `getPost()`, never the array, so swapping the
 * bodies of those two functions for queries is the whole migration:
 *
 *   export async function listPosts() {
 *     const { data } = await supabase.from("posts")
 *       .select("*").eq("published", true).order("date", { ascending: false });
 *     return data ?? [];
 *   }
 *
 * They are already `async` for that reason — the call sites await them
 * today, so nothing in the pages has to change when the data starts
 * coming over the wire.
 *
 * `Block` mirrors what a rich-text column would hold. Keeping the body
 * structured rather than raw HTML means the renderer stays in charge of
 * styling, and nothing from the database is ever injected as markup.
 */

export type Block =
  | { type: "p"; text: string }
  | { type: "h2"; text: string }
  | { type: "ul"; items: string[] }
  | { type: "quote"; text: string; cite?: string }
  | { type: "code"; text: string };

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date. Rendered through `formatDate` so the string is identical
   *  on the server and in the browser. */
  date: string;
  readMinutes: number;
  tag: string;
  author: { name: string; role: string };
  body: Block[];
}

const POSTS: Post[] = [
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

/** Newest first. Sorted here rather than at the call site so every
 *  consumer gets the same order, and so the eventual Supabase query can
 *  own the ordering without changing the pages. */
export async function listPosts(): Promise<Post[]> {
  return [...POSTS].sort((a, b) => b.date.localeCompare(a.date));
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return POSTS.find((p) => p.slug === slug);
}

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
