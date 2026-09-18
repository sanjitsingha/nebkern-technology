import sharp from "sharp";

import { SHARE_IMAGE_SIZE } from "@/lib/blog-seo";
import { getPublishedPost, listPublishedPosts } from "@/lib/blog-store";
import { isAllowedImageUrl } from "@/lib/media";

/**
 * /blog/<slug>/cover.jpg — a post's cover, cut down to a share image.
 *
 * The cover itself is whatever was uploaded: any shape, any format, up to
 * 10 MB. Handed to a link-preview scraper as-is, that goes wrong in
 * predictable ways — WhatsApp shows no picture at all for an image much
 * over 300 KB, and every network crops a picture that is not 1.91:1
 * wherever it sees fit. One of the two current covers is a 673 KB PNG,
 * which WhatsApp would have dropped.
 *
 * So this re-encodes it once: 1200×630, cropped from the centre (the same
 * crop `object-cover` makes on the page), as a progressive JPEG — which
 * every scraper accepts, unlike WebP or AVIF. The result is what
 * `og:image` and `twitter:image` point at; see `shareImage` in
 * lib/blog-seo.ts. The page itself still shows the original through
 * next/image, which does its own resizing per screen.
 *
 * Prerendered for every published post with a cover, refreshed on the
 * five-minute cycle, and at once on an admin save. A post without a
 * cover — or a draft, or an unknown slug — is a 404, so this can never
 * leak an unpublished cover.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts
    .filter((post) => post.cover)
    .map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  // The same allowlist the admin enforces on save. This route fetches
  // the URL server-side, so it must never be pointed at an arbitrary
  // host — even by a row edited straight in the database.
  if (!post?.cover || !isAllowedImageUrl(post.cover.src)) {
    return new Response("Not found", { status: 404 });
  }

  // `force-cache` is safe because uploads are stored under random names:
  // a new cover is a new URL, never new bytes at an old one.
  //
  // A failed download THROWS rather than answering with an error status.
  // This route's response is cached and served as the post's share
  // image, so a 502 returned here could be what every link preview got
  // for the next five minutes. Thrown during a background refresh, Next
  // keeps serving the last good image instead; thrown during a build,
  // the build fails and the previous deploy stays live — the same
  // failure policy as every posts query in lib/blog-store.ts.
  const source = await fetch(post.cover.src, { cache: "force-cache" });
  if (!source.ok) {
    throw new Error(
      `Could not fetch the cover for /blog/${slug}: ${source.status} ${source.statusText}`,
    );
  }

  const jpeg = await sharp(Buffer.from(await source.arrayBuffer()))
    // Applies the EXIF orientation a phone photo carries, which JPEG
    // re-encoding would otherwise strip — leaving the picture sideways.
    .rotate()
    .resize(SHARE_IMAGE_SIZE.width, SHARE_IMAGE_SIZE.height, {
      fit: "cover",
      position: "centre",
    })
    // JPEG has no transparency. Without this a transparent PNG's clear
    // areas come out black; the site's background is white, so that is
    // what they become.
    .flatten({ background: "#ffffff" })
    .jpeg({ quality: 82, progressive: true, mozjpeg: true })
    .toBuffer();

  return new Response(new Uint8Array(jpeg), {
    headers: { "Content-Type": "image/jpeg" },
  });
}
