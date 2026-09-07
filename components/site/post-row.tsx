import Link from "next/link";

import { PostCover } from "@/components/site/post-cover";
import { formatDate, type PostSummary } from "@/lib/blog";

/**
 * One post in a list, and the meta line that goes with it.
 *
 * Shared rather than duplicated: the blog index's "Recent posts" and an
 * article's "Keep reading" are the same object in two places, and the
 * only way they stay the same is by being the same component. The two
 * had drifted already — the article's version carried no cover, no
 * excerpt and no read time, and styled its title as a `p` at a
 * different size.
 *
 * No `"use client"`. There are no hooks here, so this renders on the
 * server inside the article page and comes along as client code inside
 * the index's search component, without either needing to know.
 */

/** Tag · date · read time. The order the site uses everywhere. */
export function Meta({ post }: { post: PostSummary }) {
  return (
    <>
      <span className="font-medium text-accent">{post.tag}</span>
      <span aria-hidden="true">·</span>
      <time dateTime={post.date}>{formatDate(post.date)}</time>
      <span aria-hidden="true">·</span>
      <span>{post.readMinutes} min read</span>
    </>
  );
}

export function PostRow({ post }: { post: PostSummary }) {
  return (
    <li>
      <Link
        href={`/blog/${post.slug}`}
        className="group grid gap-5 py-8 lg:grid-cols-[1fr_20rem] lg:items-start lg:gap-10"
      >
        {/* First in the DOM so the picture leads the stacked row on a
            phone; `lg:order-last` sends it to the right-hand column once
            the row goes two-up. */}
        <PostCover
          cover={post.cover}
          tag={post.tag}
          sizes="(min-width: 1024px) 320px, calc(100vw - 2.5rem)"
          className="lg:order-last"
        />

        <div>
          {/* `text-pretty`, not `text-balance`. Balance picks the
              NARROWEST width that keeps the heading on the same number
              of lines, so a title wraps well short of the column it has
              been given. Pretty fills the measure and only guards the
              last line against a one-word orphan. */}
          <h2 className="text-[1.375rem] font-semibold tracking-[-0.018em] text-ink transition-colors group-hover:text-accent text-pretty sm:text-[1.5rem]">
            {post.title}
          </h2>

          <p className="mt-2 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
            {post.excerpt}
          </p>

          <div className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
            <Meta post={post} />
          </div>
        </div>
      </Link>
    </li>
  );
}

/**
 * The label above such a list — "Recent posts", "Keep reading".
 *
 * A styled `p`, not a heading: a real `h2` would either outrank the post
 * titles below it, which are already `h2`, or force them down a level
 * for a label that is furniture rather than structure. Its `border-b` is
 * the list's top rule, so the `ul` below it carries none of its own.
 */
export function ListLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="border-b border-line pb-4 text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
      {children}
    </p>
  );
}
