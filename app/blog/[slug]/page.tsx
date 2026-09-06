import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Nav } from "@/components/site/nav";
import { Footer } from "@/components/site/footer";
import { getPost, listPosts, formatDate, type Block } from "@/lib/blog";

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
            {/* Narrower than the site's usual container. A column of
                running text wants roughly 65 characters a line; the
                6xl grid the rest of the site uses would give nearly
                double that and make it tiring to read. */}
            <div className="mx-auto max-w-3xl px-5 pt-12 pb-12 sm:px-8 sm:pt-16 sm:pb-14">
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

              <div className="mt-7 flex flex-wrap items-center gap-x-3 gap-y-1 text-[0.8125rem] text-muted">
                <span className="font-medium text-accent">{post.tag}</span>
                <span aria-hidden="true">·</span>
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readMinutes} min read</span>
              </div>

              <h1 className="display mt-4 text-[clamp(2rem,4vw,3rem)] font-medium text-ink text-balance">
                {post.title}
              </h1>

              <p className="mt-5 text-[1.1875rem] leading-relaxed text-ink-soft text-pretty">
                {post.excerpt}
              </p>

              <div className="mt-8 flex items-center gap-3 border-t border-line-soft pt-6">
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
            </div>
          </header>

          <div className="mx-auto max-w-3xl px-5 py-12 sm:px-8 sm:py-16">
            {post.body.map((block, i) => (
              <BlockView key={i} block={block} />
            ))}
          </div>
        </article>

        {others.length > 0 && (
          <section className="border-t border-line-soft bg-surface-2">
            <div className="mx-auto max-w-3xl px-5 py-14 sm:px-8 sm:py-16">
              <h2 className="text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
                Keep reading
              </h2>

              <ul className="mt-6 divide-y divide-line">
                {others.map((other) => (
                  <li key={other.slug}>
                    <Link
                      href={`/blog/${other.slug}`}
                      className="group block py-5"
                    >
                      <div className="flex flex-wrap items-center gap-x-3 text-[0.8125rem] text-muted">
                        <span className="font-medium text-accent">
                          {other.tag}
                        </span>
                        <span aria-hidden="true">·</span>
                        <time dateTime={other.date}>
                          {formatDate(other.date)}
                        </time>
                      </div>
                      <p className="mt-1.5 text-[1.125rem] font-semibold tracking-[-0.014em] text-ink transition-colors group-hover:text-accent text-balance">
                        {other.title}
                      </p>
                    </Link>
                  </li>
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
