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
  });
  return publicClient;
}

/** Full database access, bypassing Row Level Security. Admin only. */
export function adminDb(): Db {
  adminClient ??= new PostgrestClient<Database>(`${projectUrl()}/rest/v1`, {
    headers: authHeaders(secretKey()),
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
