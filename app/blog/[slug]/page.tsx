import type { Metadata } from "next";
import Image from "next/image";
import { notFound } from "next/navigation";

import { Nav } from "@/components/site/nav";
import { PostCover } from "@/components/site/post-cover";
import { CopyLink } from "@/components/site/copy-link";
import { ListLabel, PostRow } from "@/components/site/post-row";
import { Footer } from "@/components/site/footer";
import {
  blockText,
  formatDate,
  safeHref,
  type Block,
  type Span,
} from "@/lib/blog";
import { SITE } from "@/lib/site";

/** Keys map to utilities rather than inline styles, so a body can never
 *  put an arbitrary font-family on the page. */
const FONT_CLASS = { serif: "font-serif", mono: "font-mono" } as const;
import { getPublishedPost, listPublishedPosts } from "@/lib/blog-store";

/** Every published post is known at build time, so every published post
 *  is prerendered. Drafts are absent, and the page below 404s them, so a
 *  draft is not reachable by guessing its URL either.
 *  Once the data comes from Supabase this same function does the same
 *  job — it is already async. */
export async function generateStaticParams() {
  const posts = await listPublishedPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: PageProps<"/blog/[slug]">): Promise<Metadata> {
  // `params` is a Promise in this version of Next — it must be awaited
  // before any property is read.
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  // `getPublishedPost` reads with the publishable key, and Row Level
  // Security never hands a draft to that key — so a draft's slug arrives
  // here as nothing, and its title cannot leak into a tab, a share card
  // or a crawler's index via a guessed URL.
  if (!post) return { title: "Post not found" };

  // The SEO overrides fall back to the post's own fields, so a writer
  // who fills neither still gets correct metadata. They exist because
  // the two audiences want different sentences: a headline that reads
  // well above an article is often the wrong length for a result page.
  const title = post.seo?.title?.trim() || post.title;
  const description = post.seo?.description?.trim() || post.excerpt;

  return {
    title,
    description,
    alternates: { canonical: `/blog/${post.slug}` },
    // A post marked noindex is also dropped from the sitemap, in
    // app/sitemap.ts. The two have to agree: listing a page in the
    // sitemap while telling crawlers not to index it is a contradiction
    // Search Console reports as an error rather than ignoring.
    ...(post.seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    authors: [{ name: post.author.name }],
    openGraph: {
      siteName: SITE.shortName,
      type: "article",
      title,
      description,
      url: `/blog/${post.slug}`,
      publishedTime: post.date,
      // Distinct from `publishedTime`: an edit should tell a crawler
      // the page changed without restating it as newly published.
      modifiedTime: post.updatedAt ?? post.date,
      authors: [post.author.name],
      // Falls through to the site-wide opengraph-image when a post has
      // no cover of its own, so a shared link is never a bare card.
      ...(post.cover
        ? { images: [{ url: post.cover.src, alt: post.cover.alt }] }
        : {}),
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      ...(post.cover ? { images: [post.cover.src] } : {}),
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
/**
 * A run of formatted text.
 *
 * Built from data, never from markup: a `Span` says bold or link and
 * this decides what element that becomes. There is no
 * `dangerouslySetInnerHTML` anywhere in the article, which is what
 * keeps a post — from the database, or from /admin — unable to put a
 * script on the page.
 *
 * `safeHref` drops anything that is not http, https, mailto or an
 * in-page anchor, and a rejected link degrades to plain text rather
 * than rendering a dead or dangerous one.
 */
function SpanView({ span }: { span: Span }) {
  let node: React.ReactNode = span.text;

  if (span.font) {
    node = <span className={FONT_CLASS[span.font]}>{node}</span>;
  }

  if (span.code) {
    node = (
      <code className="rounded bg-surface-2 px-1.5 py-0.5 font-mono text-[0.9em] text-ink">
        {node}
      </code>
    );
  }
  if (span.bold)
    node = <strong className="font-semibold text-ink">{node}</strong>;
  if (span.italic) node = <em>{node}</em>;
  // `underline-offset` so the rule clears the descenders — a browser's
  // default underline cuts straight through a g or a y.
  if (span.underline)
    node = <u className="underline underline-offset-4">{node}</u>;
  if (span.strike) node = <s>{node}</s>;

  const href = safeHref(span.href);
  if (href) {
    const external = /^https?:/.test(href);
    node = (
      <a
        href={href}
        // `noreferrer` alongside `noopener`: the article links out to
        // sites we do not control.
        {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
        className="font-medium text-accent underline underline-offset-4 transition-colors hover:text-accent-hover"
      >
        {node}
      </a>
    );
  }

  return <>{node}</>;
}

function Spans({ spans }: { spans: Span[] }) {
  return (
    <>
      {spans.map((span, i) => (
        <SpanView key={i} span={span} />
      ))}
    </>
  );
}

/** A list item, shared by the bullet and numbered lists so the two
 *  cannot drift apart. */
function ListItem({
  spans,
  marker,
}: {
  spans: Span[];
  marker: React.ReactNode;
}) {
  return (
    <li className="flex gap-3 text-[1.0625rem] leading-relaxed text-ink-soft">
      {marker}
      <span>
        <Spans spans={spans} />
      </span>
    </li>
  );
}

function BlockView({ block }: { block: Block }) {
  switch (block.type) {
    case "h2":
      return (
        <h2 className="mt-12 mb-4 text-[1.5rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]">
          <Spans spans={block.spans} />
        </h2>
      );

    case "h3":
      return (
        <h3 className="mt-9 mb-3 text-[1.1875rem] font-semibold tracking-[-0.018em] text-ink sm:text-[1.3125rem]">
          <Spans spans={block.spans} />
        </h3>
      );

    case "ul":
      return (
        <ul className="my-6 flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <ListItem
              key={i}
              spans={item}
              marker={
                <span
                  className="mt-[0.7em] size-1.5 shrink-0 bg-accent"
                  aria-hidden="true"
                />
              }
            />
          ))}
        </ul>
      );

    case "ol":
      return (
        <ol className="my-6 flex flex-col gap-2.5">
          {block.items.map((item, i) => (
            <ListItem
              key={i}
              spans={item}
              // Not `list-decimal`: the rows are flex, so a marker box
              // of a known width keeps every line's text on the same
              // left edge past nine.
              marker={
                <span className="w-5 shrink-0 font-medium text-accent tabular-nums">
                  {i + 1}.
                </span>
              }
            />
          ))}
        </ol>
      );

    case "quote":
      return (
        <blockquote className="my-9 border-l-2 border-accent pl-6">
          <p className="text-[1.25rem] leading-snug font-medium text-ink text-pretty sm:text-[1.375rem]">
            <Spans spans={block.spans} />
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

    case "image":
      // `figure`/`figcaption` rather than a div and a p: a caption that
      // is programmatically tied to its image is read as belonging to it
      // instead of as a stray sentence after it.
      //
      // Sized by `fill` inside a 16:9 box for the same reason the cover
      // is — the build never fetches a remote image, so it has no
      // intrinsic dimensions to reserve space from, and a bare <img>
      // would collapse the layout until it loaded.
      return (
        <figure className="my-9">
          <div className="relative aspect-[16/9] overflow-hidden rounded-md bg-surface-2">
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(min-width: 896px) 896px, 100vw"
              className="object-cover"
            />
          </div>
          {block.caption && (
            <figcaption className="mt-3 text-[0.875rem] text-muted">
              {block.caption}
            </figcaption>
          )}
        </figure>
      );

    case "hr":
      return <hr className="my-10 border-0 border-t border-line" />;

    default:
      return (
        <p className="my-5 text-[1.0625rem] leading-relaxed text-ink-soft text-pretty sm:text-[1.125rem]">
          <Spans spans={block.spans} />
        </p>
      );
  }
}

export default async function BlogPost({ params }: PageProps<"/blog/[slug]">) {
  const { slug } = await params;
  const post = await getPublishedPost(slug);

  // A slug that does not resolve is a 404, not an empty page — and so is
  // a draft, which `getPublishedPost` cannot see. That matters because
  // this route still renders slugs it did not prerender, on demand: the
  // database is what stops a typed-in draft URL, not this file.
  if (!post) notFound();

  const others = (await listPublishedPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  /**
   * Article structured data.
   *
   * The layout already publishes an Organization; this is the per-page
   * half, and it is what lets a search engine show a headline, a date
   * and a byline rather than guessing them out of the markup.
   *
   * `isPartOf` and `publisher` tie the article back to that
   * Organization by URL, so the two graphs are one graph rather than
   * two unrelated claims on the same domain.
   */
  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    // The same fallback chain `generateMetadata` uses. A post whose SEO
    // panel overrides the title should not then contradict itself in its
    // own structured data.
    headline: post.seo?.title?.trim() || post.title,
    description: post.seo?.description?.trim() || post.excerpt,
    datePublished: post.date,
    dateModified: post.updatedAt ?? post.date,
    author: {
      "@type": "Person",
      name: post.author.name,
      jobTitle: post.author.role,
    },
    publisher: {
      "@type": "Organization",
      name: SITE.name,
      url: `${SITE.url}/`,
    },
    isPartOf: {
      "@type": "Blog",
      name: `${SITE.shortName} blog`,
      url: `${SITE.url}/blog`,
    },
    // Tells a crawler which URL is the article's own, independently of
    // the one it happened to arrive on.
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": `${SITE.url}/blog/${post.slug}`,
    },
    keywords: post.tag,
    // `\s+`, not `s+`. The missing backslash split on the LETTER s, so
    // the count was words-plus-every-s rather than words.
    wordCount: post.body.map(blockText).join(" ").split(/\s+/).filter(Boolean)
      .length,
    ...(post.cover ? { image: [post.cover.src] } : {}),
  };

  return (
    <>
      <script
        type="application/ld+json"
        // Serialised, not interpolated — the values are ours, but a
        // stringify keeps a stray quote from ever breaking the tag.
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleJsonLd) }}
      />

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
              {/* The "← All posts" link that used to open this column is
                  gone. The nav above carries Blog on every page, so it
                  was a second door to the same place, sitting in the one
                  position on the page that should belong to the
                  headline. */}

              {/* `text-pretty`, not `text-balance`. Balance finds the
                  NARROWEST width that keeps the headline on the same
                  number of lines, so it quietly ignores a wider column —
                  widening the container moved this heading not at all.
                  Pretty fills the measure and only guards the last line
                  against a single-word orphan. */}
              <h1 className="display text-[clamp(2rem,4vw,3rem)] font-medium text-ink text-pretty">
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
              of for the post.

              The guard is on the wrapper, not just inside `PostCover`.
              The component already renders nothing without a cover, but
              this padded div would still open `pt-10` of space above a
              body that then began with no picture in it. */}
          {post.cover && (
            <div className="mx-auto max-w-4xl px-5 pt-10 sm:px-8 sm:pt-12">
              {/* 21:9, the same ratio the index's lead card uses. That
                  keeps one shape for a cover running the full width of a
                  column and 16:9 for the thumbnails — at this measure
                  16:9 was a 432px block sitting between the byline and
                  the first sentence. */}
              <PostCover
                cover={post.cover}
                ratio="21 / 9"
                sizes="(min-width: 768px) 768px, calc(100vw - 2.5rem)"
              />
            </div>
          )}

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
