import { promises as fs } from "node:fs";
import path from "node:path";

import {
  blockText,
  SEED_POSTS,
  type Block,
  type LegacyBlock,
  type Post,
  type StoredPost,
} from "@/lib/blog";

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

/**
 * Brings a block up to the current shape.
 *
 * Bodies written before inline formatting existed store a plain string
 * where there is now a `Span[]`. Upgrading them here — at the one place
 * data enters the app — means no page, renderer or editor has to know
 * that two shapes ever existed, and a post rewrites itself into the new
 * shape the first time somebody saves it.
 */
function normalizeBlock(block: Block | LegacyBlock): Block {
  switch (block.type) {
    case "p":
    case "h2":
      return "spans" in block
        ? block
        : { type: block.type, spans: [{ text: block.text }] };

    case "ul":
      return "items" in block && typeof block.items[0] === "string"
        ? {
            type: "ul",
            items: (block.items as string[]).map((t) => [{ text: t }]),
          }
        : (block as Block);

    case "quote":
      return "spans" in block
        ? block
        : {
            type: "quote",
            spans: [{ text: block.text }],
            ...(block.cite ? { cite: block.cite } : {}),
          };

    // `code` and `hr` never held spans; `h3` and `ol` did not exist
    // before them, so anything of those types is already current.
    default:
      return block as Block;
  }
}

function normalizePost(post: StoredPost): Post {
  return { ...post, body: post.body.map(normalizeBlock) };
}

async function readAll(): Promise<Post[]> {
  let stored: StoredPost[];

  try {
    stored = JSON.parse(await fs.readFile(FILE, "utf8")) as StoredPost[];
  } catch {
    // First run, or the file was deleted. Seeding from the array in
    // lib/blog.ts means a fresh clone has content to render rather than
    // an empty blog that looks broken.
    stored = SEED_POSTS;
  }

  return stored.map(normalizePost);
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
    .map(blockText)
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
