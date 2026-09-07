import type { Metadata } from "next";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { BlogSearch } from "@/components/site/blog-search";
import { listPosts } from "@/lib/blog-store";
import { SITE } from "@/lib/site";

export const metadata: Metadata = {
  title: "Blog",
  description: `Notes from ${SITE.name} on building and running software for Indian businesses.`,
  alternates: { canonical: "/blog" },
};

export default async function BlogIndex() {
  const posts = await listPosts();

  // Projected explicitly rather than passed whole: only these six fields
  // cross into the Client Component, so the article bodies stay on the
  // server where they are already being rendered by /blog/[slug].
  const summaries = posts.map((post) => ({
    slug: post.slug,
    title: post.title,
    excerpt: post.excerpt,
    date: post.date,
    readMinutes: post.readMinutes,
    tag: post.tag,
  }));

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

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
