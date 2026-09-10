import type { Metadata } from "next";
import Link from "next/link";

import { DeletePostButton } from "@/components/admin/delete-post-button";
import { formatDate } from "@/lib/blog";
import { listPosts } from "@/lib/blog-store";

export const metadata: Metadata = { title: "Posts" };

export default async function PostsPage() {
  // `listPosts`, not `listPublishedPosts`: this is the one screen where
  // a draft is supposed to show up. Everything reader-facing uses the
  // published list.
  const posts = await listPosts();
  const drafts = posts.filter((post) => post.draft).length;

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-[1.5rem] font-semibold tracking-[-0.022em] text-ink">
            Posts
          </h1>
          <p className="mt-1 text-[0.9375rem] text-muted">
            {posts.length - drafts}{" "}
            {posts.length - drafts === 1 ? "post" : "posts"} published
            {drafts > 0 && <> · {drafts} in draft</>}
          </p>
        </div>

        <Link
          href="/admin/posts/new"
          className="rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
        >
          New post
        </Link>
      </div>

      {posts.length === 0 ? (
        <p className="mt-10 rounded-md border border-line bg-surface px-5 py-8 text-center text-[0.9375rem] text-muted">
          No posts yet.
        </p>
      ) : (
        <ul className="mt-8 divide-y divide-line-soft rounded-md border border-line bg-surface">
          {posts.map((post) => (
            <li
              key={post.slug}
              className="flex flex-wrap items-center gap-x-5 gap-y-3 px-5 py-4"
            >
              <div className="min-w-0 flex-1">
                <span className="flex flex-wrap items-center gap-x-2.5 gap-y-1">
                  <Link
                    href={`/admin/posts/${post.slug}`}
                    className="text-[1.0625rem] font-semibold tracking-[-0.018em] text-ink transition-colors hover:text-accent"
                  >
                    {post.title}
                  </Link>

                  {/* Only drafts are badged. Marking the published ones
                      too would put a label on every row and leave the
                      one state worth spotting no easier to spot. */}
                  {post.draft && (
                    <span className="border border-warning/40 bg-warning/10 px-1.5 py-0.5 text-[0.6875rem] font-medium tracking-[0.06em] text-ink uppercase">
                      Draft
                    </span>
                  )}
                </span>

                <p className="mt-1 flex flex-wrap items-center gap-x-2.5 gap-y-1 text-[0.8125rem] text-muted">
                  <span className="font-medium text-accent">{post.tag}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  {/* A draft has no live URL, so showing one that 404s
                      would be a link to nowhere dressed as an address. */}
                  <span className="font-mono">
                    {post.draft ? "not published" : `/blog/${post.slug}`}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/posts/${post.slug}`}
                  className="rounded-md border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-accent hover:text-accent"
                >
                  Edit
                </Link>
                <DeletePostButton slug={post.slug} title={post.title} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
