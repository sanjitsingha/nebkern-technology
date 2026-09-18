import { modifiedAt, publishedAt } from "@/lib/blog";
import {
  BLOG_DESCRIPTION,
  BLOG_NAME,
  postUrl,
  shareImage,
} from "@/lib/blog-seo";
import { listPublishedPosts } from "@/lib/blog-store";
import { FEED_PATH, absoluteUrl } from "@/lib/seo";

/**
 * /blog/rss.xml — the blog as an RSS 2.0 feed.
 *
 * For feed readers, and for everything that discovers new writing by
 * polling a feed rather than crawling pages: aggregators, newsletter
 * tools, and search engines' own feed fetchers. Every page advertises it
 * with `<link rel="alternate">` (see FEED_ALTERNATE in lib/seo.ts).
 *
 * A post marked noindex is left out, the same as in the sitemap. The
 * flag means "do not spread this", and a feed is how a post spreads.
 *
 * Summaries, not full text: each item carries the excerpt and a link. A
 * full-text feed would need a second renderer for the body, one that
 * turns blocks into HTML strings — the article page renders React, and
 * two renderers for one body is how they come to disagree.
 *
 * Static, refreshed at most every five minutes, and at once on an admin
 * write through `updateTag` and `revalidateBlog()` in
 * app/admin/actions.ts. A literal, in step with CONTENT_REVALIDATE_SECONDS.
 */
export const revalidate = 300;

/** The five characters XML reserves. Every value that came from the
 *  admin goes through this — a title with an ampersand in it would
 *  otherwise make the whole feed invalid, not just that item. */
function xml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/** RSS dates are RFC 822, which is what `toUTCString` produces:
 *  "Thu, 17 Sep 2026 18:30:00 GMT". */
function rfc822(iso: string): string {
  return new Date(iso).toUTCString();
}

export async function GET() {
  const posts = (await listPublishedPosts()).filter(
    (post) => !post.seo?.noindex,
  );

  // Compared as instants, not as strings: `publishedAt` carries +05:30
  // and `updatedAt` is UTC, so the two do not sort as text.
  const lastChange = posts.reduce<number | undefined>((latest, post) => {
    const at = Date.parse(modifiedAt(post));
    return latest === undefined || at > latest ? at : latest;
  }, undefined);

  const items = posts
    .map((post) => {
      const url = postUrl(post.slug);
      const image = shareImage(post);

      return `    <item>
      <title>${xml(post.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${rfc822(publishedAt(post))}</pubDate>
      <description>${xml(post.excerpt)}</description>
      <media:content url="${xml(absoluteUrl(image.url))}" medium="image" type="${image.type}" width="${image.width}" height="${image.height}" />
    </item>`;
    })
    .join("\n");

  const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:media="http://search.yahoo.com/mrss/">
  <channel>
    <title>${xml(BLOG_NAME)}</title>
    <link>${absoluteUrl("/blog")}</link>
    <description>${xml(BLOG_DESCRIPTION)}</description>
    <language>en-IN</language>
    <atom:link href="${absoluteUrl(FEED_PATH)}" rel="self" type="application/rss+xml" />${
      lastChange === undefined
        ? ""
        : `
    <lastBuildDate>${new Date(lastChange).toUTCString()}</lastBuildDate>`
    }
${items}
  </channel>
</rss>
`;

  return new Response(body, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
