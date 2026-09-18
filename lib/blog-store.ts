import "server-only";

import { cache } from "react";

import { blockText, excerptFrom, type Block, type Post } from "@/lib/blog";
import type { Database, Json } from "@/lib/database.types";
import { adminDb, publicDb } from "@/lib/supabase";

/**
 * The blog's data store: the `posts` table in Supabase.
 *
 * This is the seam `lib/blog.ts` always described. Every page and every
 * admin action goes through the functions at the bottom and never touches
 * the database directly, so the move from a JSON file on disk to Supabase
 * rewrote their bodies and nothing else — no page changed shape.
 *
 * Reads are split by audience, and the split is enforced by the database
 * rather than by this file:
 *
 * - `listPublishedPosts` / `getPublishedPost` use the publishable key.
 *   Row Level Security only lets that key see rows where `draft = false`,
 *   so a draft cannot reach a reader even if a caller forgot to filter.
 *   The explicit `.eq("draft", false)` below duplicates the policy on
 *   purpose — Supabase recommends it, because it lets Postgres plan the
 *   query around the partial index instead of discovering the filter
 *   through the policy.
 *
 * - `listPosts` / `getPost` and every write use the secret key and see
 *   everything. They are only called from /admin, behind the session
 *   check.
 *
 * Failures THROW. The file store used to fall back to seed content when
 * it could not read, which made a broken store look like a working blog
 * with the wrong posts in it. A failed query here is an error page, which
 * is the honest outcome.
 */

type PostRow = Database["public"]["Tables"]["posts"]["Row"];
type PostWrite = Database["public"]["Tables"]["posts"]["Insert"];

/** Postgres's code for a unique-constraint violation — here, a slug
 *  that another post already has. */
const UNIQUE_VIOLATION = "23505";

/** Newest first, with creation order breaking ties between posts
 *  published the same day so the order never shuffles between renders. */
const NEWEST_FIRST = { ascending: false } as const;

/** A row as the app sees it. The table is flat (cover and SEO are
 *  columns); `Post` groups them back into the objects the pages already
 *  expect, and omits what is unset rather than carrying nulls. */
function fromRow(row: PostRow): Post {
  const seo = {
    ...(row.seo_title ? { title: row.seo_title } : {}),
    ...(row.seo_description ? { description: row.seo_description } : {}),
    ...(row.noindex ? { noindex: true } : {}),
  };

  // Stored as JSON and never queried into; the page renders it. Every
  // row is written by this file or the seed, both in the current block
  // shape, so it is read back as-is.
  const body = row.body as unknown as Block[];

  return {
    slug: row.slug,
    title: row.title,
    // Derived here, not read from `row.excerpt`, so it always matches
    // the body it summarises. The column is still written on save — it
    // keeps a row readable on its own in the Supabase dashboard — but
    // this is the one that reaches a page, which means posts written
    // before the excerpt was a field need no backfill.
    excerpt: excerptFrom(body),
    date: row.published_on,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
    readMinutes: row.read_minutes,
    ...(row.cover_src
      ? { cover: { src: row.cover_src, alt: row.cover_alt ?? "" } }
      : {}),
    ...(row.draft ? { draft: true } : {}),
    ...(Object.keys(seo).length > 0 ? { seo } : {}),
    body,
  };
}

/** The inverse of `fromRow`. Every column is written explicitly — an
 *  update replaces the whole post, exactly as the file store did, so
 *  publishing a draft sets `draft` back to false rather than leaving it. */
function toRow(post: Post): PostWrite {
  return {
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    published_on: post.date,
    updated_at: post.updatedAt ?? null,
    read_minutes: post.readMinutes,
    cover_src: post.cover?.src ?? null,
    cover_alt: post.cover?.alt ?? null,
    // `tag`, `author_name` and `author_role` are left alone. Posts have
    // no category and no author any more; the columns stay so an older
    // row is not rewritten by a migration, and nothing reads them.
    seo_title: post.seo?.title ?? null,
    seo_description: post.seo?.description ?? null,
    noindex: post.seo?.noindex ?? false,
    draft: post.draft ?? false,
    body: post.body as unknown as Json,
  };
}

function raise(action: string, error: { message: string }): never {
  throw new Error(`Could not ${action}: ${error.message}`);
}

/** Roughly 200 words a minute, floored at 1 — a "0 min read" reads as a
 *  bug even when the arithmetic is right. */
export function readMinutes(post: Pick<Post, "body">): number {
  const words = post.body
    .map(blockText)
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
}

/** Everything, drafts included. This is the ADMIN view — /admin/posts is
 *  the one place an unpublished post is supposed to appear. */
export async function listPosts(): Promise<Post[]> {
  const { data, error } = await adminDb()
    .from("posts")
    .select("*")
    .order("published_on", NEWEST_FIRST)
    .order("created_at", NEWEST_FIRST);

  if (error) raise("list posts", error);
  return data.map(fromRow);
}

/**
 * Published posts only. This is the PUBLIC view — the index, the sitemap,
 * llms.txt and the prerendered article routes all read through it.
 *
 * Wrapped in React's `cache` so a single render asks the database once:
 * the article page, for one, wants the list both for its static params
 * and for its "Keep reading" section.
 */
export const listPublishedPosts = cache(async (): Promise<Post[]> => {
  const { data, error } = await publicDb()
    .from("posts")
    .select("*")
    .eq("draft", false)
    .order("published_on", NEWEST_FIRST)
    .order("created_at", NEWEST_FIRST);

  if (error) raise("list published posts", error);
  return data.map(fromRow);
});

/** One post by slug, drafts included. Admin only. */
export async function getPost(slug: string): Promise<Post | undefined> {
  const { data, error } = await adminDb()
    .from("posts")
    .select("*")
    .eq("slug", slug)
    .maybeSingle();

  if (error) raise(`load /blog/${slug}`, error);
  return data ? fromRow(data) : undefined;
}

/**
 * One PUBLISHED post by slug, or undefined — which the article page turns
 * into a 404. A draft's slug resolves to nothing here, so a draft is not
 * reachable by guessing its URL.
 *
 * Cached for the same reason as the list: `generateMetadata` and the page
 * both ask for the same post during one render.
 */
export const getPublishedPost = cache(
  async (slug: string): Promise<Post | undefined> => {
    const { data, error } = await publicDb()
      .from("posts")
      .select("*")
      .eq("slug", slug)
      .eq("draft", false)
      .maybeSingle();

    if (error) raise(`load /blog/${slug}`, error);
    return data ? fromRow(data) : undefined;
  },
);

/** Rejects a duplicate slug rather than overwriting: two posts at one
 *  URL is a silent content loss, and the admin surfaces this as a form
 *  error the writer can act on. The unique constraint on `slug` is what
 *  enforces it now — the database says no, and this translates. */
export async function createPost(post: Post): Promise<void> {
  const { error } = await adminDb().from("posts").insert(toRow(post));

  if (error?.code === UNIQUE_VIOLATION) {
    throw new Error(`A post already exists at /blog/${post.slug}`);
  }
  if (error) raise("create the post", error);
}

/**
 * Updates in place, and can move a post to a new slug.
 *
 * `originalSlug` is separate from `post.slug` because a writer editing
 * the title changes the URL, and the store still has to find the row
 * being edited by where it used to live.
 *
 * `.select("slug")` asks for the updated rows back, because an update
 * that matches nothing is not an error to Postgres — without it, saving a
 * post that had been deleted in another tab would report success.
 */
export async function updatePost(
  originalSlug: string,
  post: Post,
): Promise<void> {
  const { data, error } = await adminDb()
    .from("posts")
    .update(toRow(post))
    .eq("slug", originalSlug)
    .select("slug");

  if (error?.code === UNIQUE_VIOLATION) {
    throw new Error(`A post already exists at /blog/${post.slug}`);
  }
  if (error) raise("save the post", error);
  if (!data || data.length === 0) {
    throw new Error(`No post at /blog/${originalSlug}`);
  }
}

export async function deletePost(slug: string): Promise<void> {
  const { error } = await adminDb().from("posts").delete().eq("slug", slug);
  if (error) raise(`delete /blog/${slug}`, error);
}

/**
 * PostgREST's code for "no such table". The redirects table comes from
 * supabase/migrations/20260918120000_post_redirects.sql; until that has
 * been applied, both functions below behave as if there were simply no
 * redirects — which is exactly how the site behaved before they existed.
 */
const TABLE_MISSING = "PGRST205";

/**
 * Where a post that used to live at `slug` lives now, if anywhere.
 *
 * Only asked after a slug has already failed to resolve, so it costs
 * nothing on a working URL. It deliberately does NOT throw like the rest
 * of this file: a failed lookup here should end in the 404 the reader
 * was getting anyway, not turn every unknown URL into an error page.
 *
 * Read with the publishable key, and the table's policy only shows rows
 * whose target is published — so a redirect can never reveal a draft.
 */
export const findRedirect = cache(
  async (slug: string): Promise<string | undefined> => {
    const { data, error } = await publicDb()
      .from("post_redirects")
      .select("to_slug")
      .eq("from_slug", slug)
      .maybeSingle();

    if (error) {
      if (error.code !== TABLE_MISSING) {
        console.error(
          `Redirect lookup for /blog/${slug} failed: ${error.message}`,
        );
      }
      return undefined;
    }
    return data?.to_slug;
  },
);

/**
 * Records that a published post moved from `from` to `to`. Called after
 * the post itself has moved — the table's foreign key needs `to` to
 * exist — and only for posts that were public, since a draft's old slug
 * was never an address anyone had.
 *
 * Redirects that already pointed at `from` need no work: the foreign
 * key's ON UPDATE CASCADE re-pointed them at `to` when the post's slug
 * changed, so a post renamed twice still redirects in one hop.
 *
 * Never throws. The rename has already succeeded by the time this runs,
 * and failing the save over its redirect would tell the writer their
 * post did not save when it did.
 */
export async function recordRename(from: string, to: string): Promise<void> {
  const db = adminDb();

  // A post moving BACK to an address it once had would otherwise leave
  // a redirect from that address to itself.
  const cleared = await db.from("post_redirects").delete().eq("from_slug", to);
  const saved = cleared.error
    ? cleared
    : await db.from("post_redirects").upsert({ from_slug: from, to_slug: to });

  const error = cleared.error ?? saved.error;
  if (!error) return;

  console.error(
    error.code === TABLE_MISSING
      ? `/blog/${from} was renamed to /blog/${to}, but no redirect was recorded: the post_redirects table does not exist yet. Apply supabase/migrations/20260918120000_post_redirects.sql.`
      : `Could not record the redirect /blog/${from} -> /blog/${to}: ${error.message}`,
  );
}
