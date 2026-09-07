import { promises as fs } from "node:fs";
import path from "node:path";

import { SEED_POSTS, type Post } from "@/lib/blog";

/**
 * The blog's data store: a JSON file on disk.
 *
 * SERVER ONLY. It imports `node:fs`, so importing it from a Client
 * Component is a build error — which is the intended guard rail, not an
 * inconvenience to work around.
 *
 * This is the seam `lib/blog.ts` always described. Every page and every
 * admin action goes through the five functions at the bottom and never
 * touches the file, so moving to Supabase means rewriting their bodies
 * and nothing else. They are all `async` for exactly that reason.
 *
 * WHAT THIS IS NOT: a production database. A JSON file works on a
 * machine with a writable disk and one process — local development, or
 * a long-lived Node server. On Vercel the filesystem is read-only, so
 * writes there will throw and the admin is effectively read-only until
 * a real database is behind these functions. Reads are fine everywhere,
 * because a missing file falls back to the seed.
 */
const FILE = path.join(process.cwd(), "content", "posts.json");

/** Newest first. Sorted in one place so every consumer gets the same
 *  order, and so a future `ORDER BY date DESC` can replace it without
 *  touching a single page. */
function sorted(posts: Post[]): Post[] {
  return [...posts].sort((a, b) => b.date.localeCompare(a.date));
}

async function readAll(): Promise<Post[]> {
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Post[];
  } catch {
    // First run, or the file was deleted. Seeding from the array in
    // lib/blog.ts means a fresh clone has content to render rather than
    // an empty blog that looks broken.
    return SEED_POSTS;
  }
}

async function writeAll(posts: Post[]): Promise<void> {
  await fs.mkdir(path.dirname(FILE), { recursive: true });
  // Pretty-printed because this file is meant to be diffable — it is
  // content, and content belongs in review like anything else.
  await fs.writeFile(FILE, JSON.stringify(posts, null, 2) + "\n", "utf8");
}

/** Lowercase, hyphenated, no punctuation. Derived from the title so a
 *  writer never has to think about URLs, but stored on the post so
 *  renaming a title later cannot silently break a published link. */
export function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

/** Roughly 200 words a minute, floored at 1 — a "0 min read" reads as a
 *  bug even when the arithmetic is right. */
export function readMinutes(post: Pick<Post, "body">): number {
  const words = post.body
    .map((b) =>
      b.type === "ul" ? b.items.join(" ") : "text" in b ? b.text : "",
    )
    .join(" ")
    .trim()
    .split(/\s+/)
    .filter(Boolean).length;

  return Math.max(1, Math.round(words / 200));
}

export async function listPosts(): Promise<Post[]> {
  return sorted(await readAll());
}

export async function getPost(slug: string): Promise<Post | undefined> {
  return (await readAll()).find((p) => p.slug === slug);
}

/** Rejects a duplicate slug rather than overwriting: two posts at one
 *  URL is a silent content loss, and the admin surfaces this as a form
 *  error the writer can act on. */
export async function createPost(post: Post): Promise<void> {
  const posts = await readAll();
  if (posts.some((p) => p.slug === post.slug)) {
    throw new Error(`A post already exists at /blog/${post.slug}`);
  }
  await writeAll([post, ...posts]);
}

/**
 * Updates in place, and can move a post to a new slug.
 *
 * `originalSlug` is separate from `post.slug` because a writer editing
 * the title changes the URL, and the store still has to find the row
 * being edited by where it used to live.
 */
export async function updatePost(
  originalSlug: string,
  post: Post,
): Promise<void> {
  const posts = await readAll();
  const i = posts.findIndex((p) => p.slug === originalSlug);
  if (i === -1) throw new Error(`No post at /blog/${originalSlug}`);

  if (post.slug !== originalSlug && posts.some((p) => p.slug === post.slug)) {
    throw new Error(`A post already exists at /blog/${post.slug}`);
  }

  posts[i] = post;
  await writeAll(posts);
}

export async function deletePost(slug: string): Promise<void> {
  const posts = await readAll();
  await writeAll(posts.filter((p) => p.slug !== slug));
}
