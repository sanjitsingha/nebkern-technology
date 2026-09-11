import "server-only";

import { cache } from "react";

import { blockText, type Block, type Post } from "@/lib/blog";
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

/** A row as the app sees it. The table is flat (cover, author and SEO
 *  are columns); `Post` groups them back into the objects the pages
 *  already expect, and omits what is unset rather than carrying nulls. */
function fromRow(row: PostRow): Post {
  const seo = {
    ...(row.seo_title ? { title: row.seo_title } : {}),
    ...(row.seo_description ? { description: row.seo_description } : {}),
    ...(row.noindex ? { noindex: true } : {}),
  };

  return {
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    date: row.published_on,
    ...(row.updated_at ? { updatedAt: row.updated_at } : {}),
    readMinutes: row.read_minutes,
    tag: row.tag,
    ...(row.cover_src
      ? { cover: { src: row.cover_src, alt: row.cover_alt ?? "" } }
      : {}),
    ...(row.draft ? { draft: true } : {}),
    author: { name: row.author_name, role: row.author_role },
    ...(Object.keys(seo).length > 0 ? { seo } : {}),
    // Stored as JSON and never queried into; the page renders it. Every
    // row is written by this file or the seed, both in the current block
    // shape, so it is read back as-is.
    body: row.body as unknown as Block[],
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
    tag: post.tag,
    cover_src: post.cover?.src ?? null,
    cover_alt: post.cover?.alt ?? null,
    author_name: post.author.name,
    author_role: post.author.role,
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
