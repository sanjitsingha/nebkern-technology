import type { Metadata } from "next";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { BlogSearch } from "@/components/site/blog-search";
import { JsonLd } from "@/components/site/page";
import { BLOG_DESCRIPTION, blogJsonLd } from "@/lib/blog-seo";
import { listPublishedPosts } from "@/lib/blog-store";
import { breadcrumbJsonLd, pageMetadata } from "@/lib/seo";
import { SITE } from "@/lib/site";

/** Static, refreshed at most every five minutes — and at once on an admin
 *  save. A literal, in step with CONTENT_REVALIDATE_SECONDS. */
export const revalidate = 300;

// This page used to set only a title, description and canonical. With no
// `openGraph` of its own it inherited the ROOT layout's — so every shared
// link to /blog previewed with the homepage's title and og:url.
//
// The RSS link comes with `pageMetadata`, along with the canonical.
export const metadata: Metadata = pageMetadata({
  title: "Blog",
  description: BLOG_DESCRIPTION,
  path: "/blog",
  shareTitle: `Blog — ${SITE.name}`,
});

export default async function BlogIndex() {
  const posts = await listPublishedPosts();

  // Projected explicitly rather than passed whole: only these fields
  // cross into the Client Component, so the article bodies stay on the
  // server where they are already being rendered by /blog/[slug].
  //
  // `cover` was missing from this list. It went unnoticed while an unset
  // cover drew a placeholder — the index looked the same either way —
  // but now that no cover means no picture, leaving it out would show a
  // post's cover on its article page and nowhere on the index.
  const summaries = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    readMinutes: post.readMinutes,
    cover: post.cover,
  }));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

      {/* Every post is listed by the same `@id` its own page uses, so a
          crawler joins the two descriptions into one article. */}
      <JsonLd data={blogJsonLd(posts)} />
      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
        ])}
      />

      <Nav />

      <main id="main" className="flex-1">
        {/* The masthead is gone — no eyebrow, no headline, no standfirst.
            The h1 stays as screen-reader text: the page still needs one
            heading, and "Blog" is what it is. */}
        <h1 className="sr-only">Blog</h1>

        <BlogSearch posts={summaries} />
      </main>

      <Footer />
    </>
  );
}
