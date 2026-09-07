import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Nav } from "@/components/site/nav";
import { PostCover } from "@/components/site/post-cover";
import { CopyLink } from "@/components/site/copy-link";
import { ListLabel, PostRow } from "@/components/site/post-row";
import { Footer } from "@/components/site/footer";
import { formatDate, type Block } from "@/lib/blog";
import { getPost, listPosts } from "@/lib/blog-store";

/** Every post is known at build time, so every post is prerendered.
 *  Once the data comes from Supabase this same function does the same
 *  job — it is already async. */
export async function generateStaticParams() {
  const posts = await listPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  // `params` is a Promise in this version of Next — it must be awaited
  // before any property is read.
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "Post not found" };

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: `/blog/${post.slug}` },
    openGraph: {
      siteName: "Nebkern",
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.date,
    },
  };
}

/**
 * Renders one structured block.
 *
 * The body is data, not markup — nothing here is injected as HTML, so a
 * post loaded from the database in future cannot smuggle markup onto
 * the page. Every block type gets its styling here, which is also why
 * the site needs no prose plugin.
 */
function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-12 mb-4 text-[1.5rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
          {block.text}
        </h2>
      );

    case "ul":
      return (
        <ul className="my-6 flex flex-col gap-2.5">
          {block.items.map((item) => (
            <li
              key={item}
              className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink-soft"
            >
              <span
                className="mt-[0.7em] size-1.5 shrink-0 bg-accent"
                aria-hidden="true"
              />
              {item}
            </li>
          ))}
        </ul>
      );

    case "quote":
      return (
        <blockquote className="my-9 border-l-2 border-accent pl-6">
          <p className="text-[1.25rem] leading-snug font-medium text-ink text-pretty sm:text-[1.375rem]">
            {block.text}
          </p>
          {block.cite && (
            <cite className="mt-2 block text-[0.875rem] not-italic text-muted">
              {block.cite}
            </cite>
          )}
        </blockquote>
      );

    case "code":
      // `overflow-x-auto` on the block itself: a long line has to scroll
      // inside the code box, never widen the page.
      return (
        <pre className="my-7 overflow-x-auto border border-line bg-surface-2 p-5 font-mono text-[0.8125rem] leading-relaxed text-ink-soft">
          <code>{block.text}</code>
        </pre>
      );

    default:
      return (
        <p className="my-5 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty sm:text-[1.125rem]">
          {block.text}
        </p>
      );
  }
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);

  // A slug that does not resolve is a 404, not an empty page.
  if (!post) notFound();

  const others = (await listPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

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
        <article>
          <header className="border-b border-line-soft">
            {/* Still narrower than the site's 6xl grid, which would put
                a full-width column of running text at a line length
                nobody finishes. 4xl lands at roughly 90 characters at
                the body's 18px — wide for prose, but the whole article
                column moves together (header, cover, body and the
                "Keep reading" list all read this width), so the page
                stays one measure rather than three. */}
            <div className="mx-auto max-w-4xl px-5 pt-12 pb-12 sm:px-8 sm:pt-16 sm:pb-14">
              <Link
                href="/blog"
                className="inline-flex items-center gap-1.5 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
              >
                <svg
                  viewBox="0 0 16 16"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-3.5 w-3.5"
                  aria-hidden="true"
                >
                  <path d="M13 8H3M7 4L3 8l4 4" />
                </svg>
                All posts
              </Link>

              {/* `text-pretty`, not `text-balance`. Balance finds the
                  NARROWEST width that keeps the headline on the same
                  number of lines, so it quietly ignores a wider column —
                  widening the container moved this heading not at all.
                  Pretty fills the measure and only guards the last line
                  against a single-word orphan. */}
              <h1 className="display mt-7 text-[clamp(2rem,4vw,3rem)] font-medium text-ink text-pretty">
                {post.title}
              </h1>

              {/* Byline and article meta on one rule. The tag, date and
                  read time used to sit above the headline, where they
                  were the first thing read on the page — ahead of the
                  title itself. Down here they answer the questions a
                  reader actually has at that moment: who wrote this, and
                  how long is it.

                  `flex-wrap` with `sm:ml-auto` on the meta: the two
                  groups share a line and sit at opposite ends when there
                  is room, and the meta drops below the author when there
                  is not. */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-4 border-t border-line-soft pt-6">
                <div className="flex items-center gap-3">
                  <span
                    className="grid size-9 shrink-0 place-items-center bg-accent text-[0.8125rem] font-semibold text-accent-fg"
                    aria-hidden="true"
                  >
                    {post.author.name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")}
                  </span>
                  <span className="text-[0.875rem]">
                    <span className="block font-medium text-ink">
                      {post.author.name}
                    </span>
                    <span className="block text-muted">{post.author.role}</span>
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted sm:ml-auto">
                  <span className="font-medium text-accent">{post.tag}</span>
                  <span aria-hidden="true">·</span>
                  <time dateTime={post.date}>{formatDate(post.date)}</time>
                  <span aria-hidden="true">·</span>
                  <span>{post.readMinutes} min read</span>
                  <span aria-hidden="true">·</span>
                  <CopyLink slug={post.slug} />
                </div>
              </div>
            </div>
          </header>

          {/* Between the byline and the first paragraph, in the body's
              own column rather than full-bleed — a cover wider than the
              text it introduces reads as a banner for the page instead
              of for the post. */}
          <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-12">
            {/* 21:9, the same ratio the index's lead card uses. That
                keeps one shape for a cover running the full width of a
                column and 16:9 for the thumbnails — at this measure 16:9
                was a 432px block sitting between the byline and the
                first sentence. */}
            <PostCover
              cover={post.cover}
              tag={post.tag}
              ratio="21 / 9"
              sizes="(min-width: 768px) 768px, calc(100vw - 2.5rem)"
            />
          </div>

          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            {post.body.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        </article>

        {/* No `bg-surface-2` any more. The rows carry cover art now,
            and an unset cover renders a surface-2 placeholder — on a
            surface-2 band it would have disappeared into it. Paper, with
            the `border-t` doing the separating, is also what the index's
            list sits on, which is the point. */}
        {others.length > 0 && (
          <section className="border-t border-line-soft">
            <div className="mx-auto max-w-4xl px-5 py-14 sm:px-8 sm:py-16">
              <ListLabel>Keep reading</ListLabel>

              <ul className="divide-y divide-line-soft">
                {others.map((other) => (
                  <PostRow key={other.slug} post={other} />
                ))}
              </ul>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </>
  );
}
