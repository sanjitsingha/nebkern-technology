import type { MetadataRoute } from "next";

import { listPublishedPosts } from "@/lib/blog-store";
import { absoluteUrl } from "@/lib/seo";

/**
 * /sitemap.xml — every indexable page, built from the same sources the
 * pages render from.
 *
 * Posts come from the store, so a post added, renamed or deleted in
 * /admin cannot fall out of step with this list; `revalidateBlog()` in
 * app/admin/actions.ts revalidates this path on every write.
 *
 * The company pages carry a fixed `lastModified` — the date their copy
 * last changed — rather than `new Date()`. A lastmod that moves on every
 * deploy tells a crawler the page changed when it did not, and Google
 * learns to ignore a sitemap's dates once they prove unreliable. Move
 * the date when the copy moves.
 */
const COMPANY_PAGES_UPDATED = new Date("2026-09-17");

/** Regenerated at most every five minutes, so a post published or removed
 *  outside the admin still reaches the sitemap on its own. A literal, in
 *  step with CONTENT_REVALIDATE_SECONDS in lib/supabase.ts. */
export const revalidate = 300;

const COMPANY_PAGES: {
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}[] = [
  { path: "/", priority: 1, changeFrequency: "monthly" },
  { path: "/products", priority: 0.9, changeFrequency: "monthly" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/trust", priority: 0.7, changeFrequency: "monthly" },
  { path: "/contact", priority: 0.7, changeFrequency: "yearly" },
  { path: "/careers", priority: 0.6, changeFrequency: "monthly" },
];

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Drafts never reach here — `listPublishedPosts` has already dropped
  // them, and their URLs 404 anyway.
  //
  // A post marked noindex is excluded here as well as carrying a noindex
  // tag on the page itself. Listing a page in the sitemap while telling
  // crawlers not to index it is a contradiction Search Console reports as
  // an error, so the two must agree.
  const posts = (await listPublishedPosts()).filter(
    (post) => !post.seo?.noindex,
  );

  // The blog index changes whenever any post does, so it inherits the
  // newest post's timestamp.
  const newest = posts.reduce<string | undefined>((latest, post) => {
    const stamp = post.updatedAt ?? post.date;
    return !latest || stamp > latest ? stamp : latest;
  }, undefined);

  return [
    ...COMPANY_PAGES.map((page) => ({
      url: absoluteUrl(page.path),
      lastModified: COMPANY_PAGES_UPDATED,
      changeFrequency: page.changeFrequency,
      priority: page.priority,
    })),
    {
      url: absoluteUrl("/blog"),
      lastModified: newest ? new Date(newest) : COMPANY_PAGES_UPDATED,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...posts.map((post) => ({
      url: absoluteUrl(`/blog/${post.slug}`),
      lastModified: new Date(post.updatedAt ?? post.date),
      changeFrequency: "yearly" as const,
      // Below the index, which is the page that should rank for the
      // blog itself.
      priority: 0.6,
    })),
  ];
}
