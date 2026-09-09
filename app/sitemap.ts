import type { MetadataRoute } from "next";

import { listPosts } from "@/lib/blog-store";
import { SITE } from "@/lib/site";

/**
 * /sitemap.xml, built from the same store the pages render from.
 *
 * That is the whole point of generating it rather than keeping a static
 * file: a post added, renamed or deleted in /admin cannot fall out of
 * step with the sitemap, because there is only one list of posts and
 * this reads it.
 *
 * Next treats this as a Route Handler and caches it, so it is generated
 * at build like any other static page. `revalidateBlog()` in
 * app/admin/actions.ts revalidates this path on every write, which is
 * what keeps it current between deploys.
 *
 * `lastModified` prefers `updatedAt` over `date`. They mean different
 * things: `date` is when a post was published and stays put, while
 * `updatedAt` moves on every save. Reporting the published date as
 * lastmod would tell a crawler nothing had changed after an edit.
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // A post marked noindex is excluded here as well as carrying a
  // noindex tag on the page itself. Listing a page in the sitemap while
  // telling crawlers not to index it is a contradiction Search Console
  // reports as an error, so the two must agree.
  const posts = (await listPosts()).filter((post) => !post.seo?.noindex);

  // The blog index changes whenever any post does, so it inherits the
  // newest post's timestamp rather than carrying a build date that
  // would move on every unrelated deploy.
  const newest = posts.reduce<string | undefined>((latest, post) => {
    const stamp = post.updatedAt ?? post.date;
    return !latest || stamp > latest ? stamp : latest;
  }, undefined);

  return [
    {
      url: `${SITE.url}/`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${SITE.url}/contact`,
      lastModified: new Date(),
      // Company particulars, which move roughly never.
      changeFrequency: "yearly" as const,
      priority: 0.7,
    },
    {
      url: `${SITE.url}/blog`,
      lastModified: newest ? new Date(newest) : new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: `${SITE.url}/blog/${post.slug}`,
      lastModified: new Date(post.updatedAt ?? post.date),
      changeFrequency: "yearly" as const,
      // Below the index, which is the page that should rank for the
      // blog itself. An article is not competing with it.
      priority: 0.6,
    })),
  ];
}
