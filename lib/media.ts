/**
 * Where blog images may live, and the one check every part of the app
 * uses to decide whether an image URL is acceptable.
 *
 * Client-safe on purpose — no server-only imports. The editor runs this
 * check in the browser for instant feedback, the save action runs the
 * same function on the server so a hand-crafted request cannot get past
 * it, and `next.config.ts` allows the image optimizer the same two
 * locations. They have to agree: an image the form accepts but the
 * optimizer refuses renders as a broken box on the published page, and
 * `next/image` throws outright on a host it was not told about.
 *
 * Two places, both public:
 *
 * - The `blog-images` bucket in Supabase Storage. This is where uploads
 *   from /admin go. It is public-read, refuses anything that is not a
 *   raster image or is over 10 MB, and has no write policies — uploads
 *   only happen through single-use signed URLs minted by the server.
 *
 * - `media.instant.nebkern.com/assets/`, the media host the site used
 *   before uploads existed, kept so a pasted URL from there still works.
 */

/** The Storage bucket uploads go to. Created by the
 *  `create_blog_images_bucket` migration. */
export const BLOG_IMAGE_BUCKET = "blog-images";

/** Mirrors the bucket's `file_size_limit`. Checked in the browser only to
 *  fail fast — Storage enforces the real limit itself. */
export const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Mirrors the bucket's `allowed_mime_types`, mapped to the extension an
 *  uploaded file is stored under. No SVG: it can carry script. */
export const IMAGE_TYPES: Readonly<Record<string, string>> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
  "image/avif": "avif",
  "image/gif": "gif",
};

/** The `accept` attribute for a file input, built from the same list. */
export const IMAGE_ACCEPT = Object.keys(IMAGE_TYPES).join(",");

const LEGACY_HOST = "media.instant.nebkern.com";
const LEGACY_PATH = "/assets/";

/**
 * The public URL prefix of the bucket, e.g.
 * `https://<ref>.supabase.co/storage/v1/object/public/blog-images/`.
 *
 * Read from `NEXT_PUBLIC_SUPABASE_URL`, which Next inlines into browser
 * code at build time — so this works in the editor as well as on the
 * server. The reference must stay the literal `process.env.NEXT_PUBLIC_…`
 * for that inlining to happen.
 */
export function blogImagePrefix(): string | null {
  const base = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!base) return null;
  return `${base.replace(/\/+$/, "")}/storage/v1/object/public/${BLOG_IMAGE_BUCKET}/`;
}

/** The public URL of an object in the bucket, from its path. */
export function blogImageUrl(path: string): string {
  const prefix = blogImagePrefix();
  if (!prefix) throw new Error("NEXT_PUBLIC_SUPABASE_URL is not set.");
  return prefix + path.replace(/^\/+/, "");
}

/**
 * Whether an image URL may be saved into a post.
 *
 * HTTPS only, and only the two locations above — matched on the full
 * prefix, not just the host, because the optimizer allowlist is scoped to
 * those paths too and a URL elsewhere on the same host would still fail.
 */
export function isAllowedImageUrl(src: string): boolean {
  let url: URL;
  try {
    url = new URL(src);
  } catch {
    return false;
  }
  if (url.protocol !== "https:") return false;

  if (url.hostname === LEGACY_HOST && url.pathname.startsWith(LEGACY_PATH)) {
    return true;
  }

  const prefix = blogImagePrefix();
  return prefix !== null && url.href.startsWith(prefix);
}

/** What to tell someone whose URL failed `isAllowedImageUrl`. */
export const IMAGE_URL_RULE = `Upload the image, or use a link from ${LEGACY_HOST}${LEGACY_PATH}`;
