import "server-only";

import { PostgrestClient } from "@supabase/postgrest-js";
import { StorageClient } from "@supabase/storage-js";

import type { Database } from "@/lib/database.types";

/**
 * The Supabase clients the server uses, and the only place any is made.
 *
 * SERVER ONLY — the `server-only` import above turns any attempt to pull
 * this into a Client Component into a build error. That matters for the
 * admin clients in particular: their key bypasses Row Level Security, and
 * the one thing that must never happen to it is a trip to the browser.
 *
 * - `publicDb()` uses the PUBLISHABLE key. Row Level Security applies, and
 *   the only policy on `posts` lets it read published rows. Everything
 *   reader-facing — the blog, the sitemap, llms.txt — reads through this,
 *   so even a bug that forgot to filter drafts could not show one: the
 *   database would not hand it over.
 *
 * - `adminDb()` and `adminStorage()` use the SECRET key, which bypasses
 *   RLS. /admin needs it to see drafts, to write posts at all, and to mint
 *   the single-use upload URLs images go through. Only ever reached from
 *   behind the admin session check.
 *
 * All are created lazily, on first use. A missing secret key therefore
 * breaks /admin — which says so in plain words, see the (protected)
 * layout — and leaves the public site and its build untouched, because
 * the public pages never ask for it.
 *
 * WHY THE STANDALONE PACKAGES AND NOT `@supabase/supabase-js`: the full
 * client builds a Realtime (WebSocket) client in its constructor, and in
 * current versions that constructor THROWS on Node 20, which has no
 * built-in WebSocket. postgrest-js and storage-js are the pieces
 * supabase-js itself wraps for `.from()` and `.storage` — the same APIs,
 * making the same requests — without the realtime client this never used.
 */

type Db = PostgrestClient<Database>;

/**
 * How stale a public page may get when posts change OUTSIDE the admin —
 * edited straight in the Supabase dashboard, say — before it refreshes
 * on its own. The admin's own saves do not wait for this: they expire
 * the cache immediately through `updateTag(POSTS_CACHE_TAG)`.
 *
 * The public routes that read posts repeat this number as their own
 * `export const revalidate = 300` (Next requires that one to be a
 * literal), so change them together.
 */
export const CONTENT_REVALIDATE_SECONDS = 300;

/** The cache tag on every public posts read, expired on every admin write. */
export const POSTS_CACHE_TAG = "posts";

/**
 * Part of the cache KEY for every public read. Bump it whenever the
 * caching contract below changes.
 *
 * Next matches a cached fetch on URL, method, headers and body — and an
 * entry keeps the lifetime it was WRITTEN with. The first version of
 * this client let a force-static route store the posts query with no
 * expiry at all; giving later requests a five-minute lifetime did not
 * shorten that entry, it made every read opt into the cache and find it
 * "fresh". A new header value is a new key, so entries written under an
 * old contract — in `.next/cache` locally, or in a build cache Vercel
 * restores — can never be served again. PostgREST ignores the header.
 */
const CACHE_KEY_VERSION = "2";

/**
 * Why the public client passes its own `fetch`.
 *
 * Next persists server-side fetch responses in its Data Cache, and that
 * cache survives across builds — locally in `.next/cache`, and on Vercel,
 * which restores it between deploys. With no lifetime set, a route
 * forced static (llms.txt was) stored the posts query forever, and every
 * later build reused it: /blog and the sitemap went on listing five
 * posts that had been deleted from the database days earlier.
 *
 * A bounded lifetime plus a tag fixes both directions: a cached response
 * can never be older than CONTENT_REVALIDATE_SECONDS, and an admin write
 * expires it on the spot.
 */
const publicFetch: typeof fetch = (input, init) => {
  const headers = new Headers(init?.headers);
  headers.set("x-nebkern-cache-version", CACHE_KEY_VERSION);
  return fetch(input, {
    ...init,
    headers,
    next: { revalidate: CONTENT_REVALIDATE_SECONDS, tags: [POSTS_CACHE_TAG] },
  });
};

/** The admin always reads live. Its pages are per-request already (they
 *  read the session cookie), and an editor must never see a cached copy
 *  of the post they just saved. */
const adminFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, cache: "no-store" });

function required(name: string, value: string | undefined): string {
  if (!value) {
    throw new Error(
      `${name} is not set. Add it to .env.local (and to the Vercel project's environment variables).`,
    );
  }
  return value;
}

function projectUrl(): string {
  return required(
    "NEXT_PUBLIC_SUPABASE_URL",
    process.env.NEXT_PUBLIC_SUPABASE_URL,
  ).replace(/\/+$/, "");
}

/**
 * The key goes in both headers, exactly as supabase-js sends it on every
 * call: `apikey` tells the gateway which project and role, and the Bearer
 * token is what the service behind it reads the role from. Sending only
 * one is a known way to get a 401 with one key type and not the other.
 */
function authHeaders(key: string): Record<string, string> {
  return { apikey: key, Authorization: `Bearer ${key}` };
}

const secretKey = () =>
  required("SUPABASE_SECRET_KEY", process.env.SUPABASE_SECRET_KEY);

let publicClient: Db | null = null;
let adminClient: Db | null = null;
let storageClient: StorageClient | null = null;

/** Reads what the public is allowed to read. Row Level Security applies. */
export function publicDb(): Db {
  publicClient ??= new PostgrestClient<Database>(`${projectUrl()}/rest/v1`, {
    headers: authHeaders(
      required(
        "NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY",
        process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY,
      ),
    ),
    fetch: publicFetch,
  });
  return publicClient;
}

/** Full database access, bypassing Row Level Security. Admin only. */
export function adminDb(): Db {
  adminClient ??= new PostgrestClient<Database>(`${projectUrl()}/rest/v1`, {
    headers: authHeaders(secretKey()),
    fetch: adminFetch,
  });
  return adminClient;
}

/**
 * Full Storage access. Admin only, and used for exactly one thing: minting
 * signed upload URLs. The file itself never passes through this server —
 * the browser sends it straight to Storage with the URL's token — so a
 * large photo is not held to the hosting platform's request-size limit.
 */
export function adminStorage(): StorageClient {
  storageClient ??= new StorageClient(
    `${projectUrl()}/storage/v1`,
    authHeaders(secretKey()),
  );
  return storageClient;
}
