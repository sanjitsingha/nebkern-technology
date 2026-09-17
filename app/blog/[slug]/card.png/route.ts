import { getPublishedPost, listPublishedPosts } from "@/lib/blog-store";
import { renderOgImage } from "@/lib/og";

/**
 * /blog/<slug>/card.png — the share card for a post without a cover.
 *
 * A plain route rather than an `opengraph-image` file on purpose. A file
 * convention in this segment would take priority over the page's own
 * metadata and replace a post's COVER as its share image too; as a route,
 * the post page chooses — its cover when it has one, this card when not.
 *
 * Prerendered for every published post, refreshed on the same five-minute
 * cycle as the post itself (keep the literal in step with
 * CONTENT_REVALIDATE_SECONDS). A draft or unknown slug is a 404, so a
 * card cannot leak an unpublished title.
 */
export const revalidate = 300;

export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((post) => ({ slug: post.slug }));
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return new Response("Not found", { status: 404 });

  return renderOgImage({ eyebrow: "Blog", title: post.title });
}
