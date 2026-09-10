"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { PostCover } from "@/components/site/post-cover";
import { ListLabel, Meta, PostRow } from "@/components/site/post-row";
import { type PostSummary } from "@/lib/blog";

/**
 * The blog index, with its search field.
 *
 * A client component because filtering is the whole point and it should
 * happen as the reader types — no round trip, no `?q=` in the URL for a
 * list this size. The page above it stays a Server Component and does
 * the fetching, so nothing here knows where posts come from.
 *
 * It receives summaries rather than posts: passing whole `Post` objects
 * across the boundary would serialise every article's body into the
 * page just to render five titles.
 */

/** Title, excerpt and tag — what a reader would expect to match on. The
 *  body is not here to search, which is the honest limit of a filter
 *  built on the index's own data. */
function matchesQuery(post: PostSummary, q: string) {
  return `${post.title} ${post.excerpt} ${post.tag}`.toLowerCase().includes(q);
}

/** The newest post, given the wide treatment. Only shown on the
 *  unfiltered list — once a reader is searching, one result standing
 *  taller than the others is noise, not hierarchy. */
function LeadCard({ post }: { post: PostSummary }) {
  return (
    <Link
      href={`/blog/${post.slug}`}
      className="group block rounded-md border border-line bg-surface p-7 transition-colors hover:border-ink/20 sm:p-10"
    >
      {/* Above the meta, not beside it — at this width a cover sharing a
          row with the headline would leave both too narrow to carry the
          card. Full width of the container on every breakpoint, capped
          at the 6xl column minus the card's own padding.

          21:9 rather than the thumbnail's 16:9. The same ratio that is
          unremarkable at 208px wide is a 558px wall at 990px, pushing
          the headline it introduces off the fold.

          Renders nothing at all until the post has a cover, and its
          `mb-7` goes with it — so the card opens on its meta line
          rather than on a space where a picture is not. */}
      <PostCover
        cover={post.cover}
        ratio="21 / 9"
        sizes="(min-width: 1152px) 1024px, (min-width: 640px) calc(100vw - 8rem), calc(100vw - 6.5rem)"
        className="mb-7"
      />

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
        <Meta post={post} />
      </div>

      {/* Two things were holding this short: `max-w-3xl` capped it at
          768px inside a card that is nearly 990px wide, and
          `text-balance` then shrank it further to the narrowest width
          that kept the same line count. Both gone. */}
      <h2 className="display mt-4 text-[clamp(1.5rem,2.8vw,2.25rem)] font-medium text-ink text-pretty">
        {post.title}
      </h2>

      <p className="mt-4 max-w-2xl text-[1.0625rem] leading-relaxed text-muted text-pretty">
        {post.excerpt}
      </p>

      <span className="mt-6 inline-flex items-center gap-1.5 text-[0.9375rem] font-semibold text-ink">
        Read it
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5"
          aria-hidden="true"
        >
          <path d="M3 8h10M9 4l4 4-4 4" />
        </svg>
      </span>
    </Link>
  );
}

export function BlogSearch({ posts }: { posts: PostSummary[] }) {
  const [query, setQuery] = useState("");
  const q = query.trim().toLowerCase();
  const searching = q.length > 0;

  const matches = useMemo(
    () => (q ? posts.filter((post) => matchesQuery(post, q)) : posts),
    [posts, q],
  );

  const [lead, ...rest] = matches;

  return (
    <>
      {/* Sticks below the bar rather than to the top of the window:
          the nav is `sticky top-0` at `h-20`, so `top-20` parks this
          against its underside instead of behind it. `z-40` sits under
          the nav's `z-50` — the two overlap for a moment on a short
          screen, and the bar should win.

          It needs `bg-paper` for the first time now. Transparent was
          fine while it scrolled away; a sticky band with no background
          would have the list running underneath it.

          Padding is tighter than it was. At `pt-10 pb-8` this band was
          ~116px, which on top of the 80px bar meant a quarter of a
          laptop screen was permanently chrome. */}
      <section className="sticky top-20 z-40 border-b border-line-soft bg-paper">
        <div className="mx-auto max-w-6xl px-5 py-4 sm:px-8 sm:py-5">
          <div className="relative max-w-md">
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted"
              aria-hidden="true"
            >
              <circle cx="7" cy="7" r="4.5" />
              <path d="M10.5 10.5L14 14" />
            </svg>

            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search posts"
              // The field is the only thing in this band, so it carries
              // the page's accessible name for the list it filters
              // rather than leaning on a heading that is no longer here.
              aria-label="Search posts"
              className="w-full rounded-md border border-line bg-surface py-2.5 pr-4 pl-10 text-[0.9375rem] text-ink transition-colors outline-none placeholder:text-muted hover:border-ink/25 focus:border-accent focus:ring-1 focus:ring-accent"
            />
          </div>

          {/* Announced politely so a screen reader hears the count change
              as the list narrows, without interrupting typing. Rendered
              only while searching — a count over the full list would be
              noise on arrival. */}
          <p
            aria-live="polite"
            className="mt-3 text-[0.8125rem] text-muted empty:mt-0"
          >
            {searching
              ? `${matches.length} ${matches.length === 1 ? "post" : "posts"} matching “${query.trim()}”`
              : ""}
          </p>
        </div>
      </section>

      <section>
        <div className="mx-auto max-w-6xl px-5 py-14 sm:px-8 sm:py-16">
          {matches.length === 0 ? (
            <p className="text-[1.0625rem] leading-relaxed text-muted">
              Nothing here matches that yet. Try a shorter phrase, or{" "}
              <button
                type="button"
                onClick={() => setQuery("")}
                className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
              >
                clear the search
              </button>
              .
            </p>
          ) : searching ? (
            // One flat list while filtering: every result is equally a
            // result, and promoting the first would imply a ranking the
            // filter does not actually do.
            <ul className="divide-y divide-line-soft border-t border-line-soft">
              {matches.map((post) => (
                <PostRow key={post.slug} post={post} />
              ))}
            </ul>
          ) : (
            <>
              <LeadCard post={lead} />

              <div className="mt-14">
                <ListLabel>Recent posts</ListLabel>
              </div>

              <ul className="divide-y divide-line-soft">
                {rest.map((post) => (
                  <PostRow key={post.slug} post={post} />
                ))}
              </ul>
            </>
          )}
        </div>
      </section>
    </>
  );
}
