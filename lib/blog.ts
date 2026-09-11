/**
 * Blog types, and the pure helpers both halves of the app share.
 *
 * The posts themselves live in Supabase, and `lib/blog-store.ts` is the
 * only thing that talks to it. This file used to carry a placeholder
 * SEED array as well; those five posts were copied into the database
 * when the blog moved there, and the array is gone.
 *
 * Nothing here may import a server-only module — no database client, no
 * `node:fs`. This file is reachable from Client Components (the editor
 * and the blog index both import from it), so anything server-only in
 * this graph breaks the browser bundle.
 *
 * `Block` mirrors what the `body` column holds. Keeping the body
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
  underline?: boolean;
  strike?: boolean;
  code?: boolean;
  href?: string;
  font?: FontKey;
};

/**
 * One block of a post body.
 *
 * Text-bearing blocks hold `Span[]` rather than a string. Posts written
 * before that change stored a plain `text`; they were converted when the
 * blog moved to Supabase, so this is the only shape a body now has.
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
  /**
   * An in-body image.
   *
   * `src` must sit on the media host next.config.ts allows, exactly as
   * the cover does — the optimizer refuses anything else, and a post
   * pointing elsewhere renders a broken box. `alt` is required rather
   * than optional: an image with no description is the single most
   * common accessibility failure in a CMS, and making the field
   * optional is how it happens.
   */
  | { type: "image"; src: string; alt: string; caption?: string }
  | { type: "hr" };

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
    case "image":
      // The caption is prose on the page and counts toward reading
      // time; alt text is a description of a picture and does not.
      return block.caption ?? "";
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

/**
 * What an unnamed post is called.
 *
 * Lives here rather than in the form because two places need to agree on
 * it: the editor shows it as placeholder text, and the save action
 * substitutes it when the field comes back empty. A placeholder is not
 * submitted — that is the whole difference between it and a value — so
 * without the server half, saving an untouched title would be a
 * validation error instead of a post called "Untitled".
 */
export const DEFAULT_TITLE = "Untitled";

/**
 * Lowercase, hyphenated, no punctuation.
 *
 * Derived from the title so a writer never has to think about URLs, but
 * stored on the post so renaming a title later cannot silently break a
 * published link.
 *
 * It lives HERE rather than in blog-store.ts, where it used to, because
 * the editor mirrors the title into the slug field as you type and that
 * happens in the browser. blog-store is server-only — it holds the
 * database clients — so a Client Component cannot import from it at all — deliberately. This function
 * is pure string work with no such dependency, so this is where it
 * belongs, and both halves now derive a slug the same way by
 * construction rather than by two implementations agreeing.
 */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export interface Post {
  slug: string;
  title: string;
  excerpt: string;
  /** ISO date. Rendered through `formatDate` so the string is identical
   *  on the server and in the browser. */
  date: string;
  /**
   * ISO timestamp of the last edit, distinct from `date`.
   *
   * `date` is when the post was PUBLISHED, stamped once at creation —
   * a correction next year should not restate the article as new. This
   * is stamped by the admin on every save and is what the sitemap
   * reports as `lastmod`, so a crawler is told the page changed
   * without the published date moving.
   *
   * Optional: posts written before it existed have none, and the
   * sitemap falls back to `date` for those.
   */
  updatedAt?: string;
  readMinutes: number;
  tag: string;
  /**
   * Cover image, shown on the index and above the article.
   *
   * Optional, and genuinely optional: a post without one shows no
   * picture at all, and the layout closes up around the gap. This used
   * to draw a hatched placeholder instead, which meant every post on a
   * site with no photographs yet carried an empty frame. Expected shape
   * once filled:
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
  /**
   * Unpublished work in progress.
   *
   * Optional, and absent means published. In the database it is the
   * `draft` column, and Row Level Security hides every draft row from the
   * publishable key — the public site cannot read one at all.
   *
   * A draft is invisible to the public site: it is absent from the index,
   * the sitemap, llms.txt and the prerendered routes, and its own URL
   * returns a 404. The only place it exists is /admin. There is
   * deliberately no preview link — a shareable URL for an unfinished post
   * is a different feature, and a half-implemented one is how drafts leak.
   */
  draft?: boolean;
  author: { name: string; role: string };
  /**
   * Search-engine overrides. All optional, and all fall back to the
   * post's own fields — a writer who fills none gets sensible metadata,
   * which is why nothing here is required.
   *
   * They exist because the two audiences want different sentences. A
   * title that reads well above an article is often the wrong length
   * for a result page, and an excerpt written to entice on the index is
   * not always the sentence you want Google to quote.
   */
  seo?: {
    /** Replaces the title in `<title>` and the OG tags. */
    title?: string;
    /** Replaces the excerpt in the meta description. */
    description?: string;
    /**
     * Keeps the post out of search results AND out of the sitemap.
     *
     * The two must move together: listing a page in the sitemap while
     * telling crawlers not to index it is a contradiction that shows up
     * in Search Console as an error rather than being quietly ignored.
     */
    noindex?: boolean;
  };
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
