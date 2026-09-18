import type { Metadata } from "next";
import Image from "next/image";
import { notFound, permanentRedirect } from "next/navigation";

import { Nav } from "@/components/site/nav";
import { PostCover } from "@/components/site/post-cover";
import { ShareLinks } from "@/components/site/share-links";
import { ListLabel, PostRow } from "@/components/site/post-row";
import { Footer } from "@/components/site/footer";
import { JsonLd } from "@/components/site/page";
import { FEED_ALTERNATE, breadcrumbJsonLd } from "@/lib/seo";
import {
  formatDate,
  headingIds,
  modifiedAt,
  publishedAt,
  safeHref,
  type Block,
  type Span,
} from "@/lib/blog";
import {
  blogPostingJsonLd,
  postDescription,
  postPath,
  postTitle,
  shareImage,
} from "@/lib/blog-seo";
import { SITE } from "@/lib/site";
import {
  findRedirect,
  getPublishedPost,
  listPublishedPosts,
} from "@/lib/blog-store";

/** Keys map to utilities rather than inline styles, so a body can never
 *  put an arbitrary font-family on the page. */
const FONT_CLASS = { serif: "font-serif", mono: "font-mono" } as const;

/** Every published post is known at build time, so every published post
 *  is prerendered. Drafts are absent, and the page below 404s them, so a
 *  draft is not reachable by guessing its URL either.
 *  Once the data comes from Supabase this same function does the same
 *  job — it is already async. */
/** Prerendered, refreshed at most every five minutes, and at once on an
 *  admin save. A literal, in step with CONTENT_REVALIDATE_SECONDS. */
export const revalidate = 300;

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
  const title = postTitle(post);
  const description = postDescription(post);
  const path = postPath(post.slug);

  // A post with a cover shares a 1200×630 cut of it; one without, a card
  // drawn from its title. Either way the size is known and declared, so
  // a scraper can lay out the preview before it has fetched the image.
  // See `shareImage` for why the cover file itself is not used.
  const image = shareImage(post);

  return {
    title,
    description,
    alternates: { canonical: path, types: FEED_ALTERNATE },
    // A post marked noindex is also dropped from the sitemap, in
    // app/sitemap.ts. The two have to agree: listing a page in the
    // sitemap while telling crawlers not to index it is a contradiction
    // Search Console reports as an error rather than ignoring.
    ...(post.seo?.noindex ? { robots: { index: false, follow: true } } : {}),
    openGraph: {
      siteName: SITE.shortName,
      locale: "en_IN",
      type: "article",
      title,
      description,
      url: path,
      // Full timestamps with an offset, not bare dates. See
      // `publishedAt` in lib/blog.ts for what a bare date got wrong.
      publishedTime: publishedAt(post),
      // Distinct from `publishedTime`: an edit should tell a crawler
      // the page changed without restating it as newly published.
      modifiedTime: modifiedAt(post),
      // Set explicitly on purpose: once a page sets `openGraph` at all,
      // it no longer inherits the root's image, and these posts used to
      // be shared as bare links.
      images: [image],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [{ url: image.url, alt: image.alt }],
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

/**
 * `id` is set on headings only — see `headingIds` in lib/blog.ts. It is
 * what makes `#section` links into an article work. `scroll-mt-28` keeps
 * the heading clear of the 80px sticky nav when the browser jumps to it;
 * without it the heading would land underneath the bar.
 */
function BlockView({ block, id }: { block: Block; id?: string }) {
  switch (block.type) {
    case "h2":
      return (
        <h2
          id={id}
          className="mt-12 mb-4 scroll-mt-28 text-[1.5rem] font-semibold tracking-[-0.02em] text-ink sm:text-[1.75rem]"
        >
          <Spans spans={block.spans} />
        </h2>
      );

    case "h3":
      return (
        <h3
          id={id}
          className="mt-9 mb-3 scroll-mt-28 text-[1.1875rem] font-semibold tracking-[-0.018em] text-ink sm:text-[1.3125rem]"
        >
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
            {/* The widths the body column actually renders at: 832px
                once the 4xl column is full, the viewport less the side
                padding below that. It said 896px and 100vw, which sent
                every phone an image sized for the full screen width. */}
            <Image
              src={block.src}
              alt={block.alt}
              fill
              sizes="(min-width: 896px) 832px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
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
  if (!post) {
    // Unless it is a URL a published post USED to live at. Renaming a
    // post in the admin records the old slug, and the old URL answers
    // with a permanent redirect — so links already out in the world,
    // and whatever ranking the page had earned, follow it to the new
    // address instead of ending at a 404. The target is checked too: a
    // post unpublished since its rename should 404, not redirect to one.
    const target = await findRedirect(slug);
    if (target && target !== slug && (await getPublishedPost(target))) {
      permanentRedirect(postPath(target));
    }
    notFound();
  }

  const others = (await listPublishedPosts())
    .filter((p) => p.slug !== post.slug)
    .slice(0, 2);

  // Computed once for the whole body, since a repeated heading's id
  // depends on how many came before it.
  const ids = headingIds(post.body);

  return (
    <>
      {/* Through `JsonLd`, which escapes `<`. This used to be a bare
          `JSON.stringify` into the script tag, and the values here are
          typed in the admin — a title containing `</script>` would have
          ended the tag and dumped the rest of the JSON onto the page. */}
      <JsonLd data={blogPostingJsonLd(post)} />

      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:left-3 focus:z-60 focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-fg"
      >
        Skip to content
      </a>

      <JsonLd
        data={breadcrumbJsonLd([
          { name: "Home", path: "/" },
          { name: "Blog", path: "/blog" },
          { name: post.title, path: `/blog/${post.slug}` },
        ])}
      />

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
            <div className="mx-auto max-w-4xl px-5 pt-12 pb-8 sm:px-8 sm:pt-16 sm:pb-9">
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

              {/* Article meta on one rule. The byline that used to sit
                  beside it is gone with the author field: posts are
                  published by the company, so a name and a job title
                  under every headline was furniture. What is left is
                  what a reader actually wants at this moment — what it
                  is about, when it was written, how long it is, and a
                  way to keep the link. */}
              <div className="mt-8 flex flex-wrap items-center gap-x-3 gap-y-3 border-t border-line-soft pt-6 text-[0.8125rem] text-muted">
                <time dateTime={post.date}>{formatDate(post.date)}</time>
                <span aria-hidden="true">·</span>
                <span>{post.readMinutes} min read</span>

                {/* Pushed to the far end of this same line rather than
                    given a row of its own: sharing is something a reader
                    does after reading, so it should not be a block of
                    its own between the headline and the first sentence.
                    `gap-y-3` is for the wrap on a phone, where the
                    circles drop below the date and need more than the
                    1px of breathing room the text line wanted. */}
                <ShareLinks slug={post.slug} title={post.title} />
              </div>
            </div>
          </header>

          {/* Between the byline and the first paragraph, in the body's
              own column rather than full-bleed — a cover wider than the
              text it introduces reads as a banner for the page instead
              of for the post.

              The guard is on the wrapper, not just inside `PostCover`.
              The component already renders nothing without a cover, but
              this padded div would still open its top padding above a
              body that then began with no picture in it.

              This `pt` and the header's `pb` stack, so the two together
              are the whole gap under the meta line. At `pb-14` + `pt-12`
              that came to 104px — nearly twice the 56px above the meta
              line, which read as the header having lost its footing. */}
          {post.cover && (
            <div className="mx-auto max-w-4xl px-5 pt-8 sm:px-8 sm:pt-9">
              {/* 16:9, so the picture is 468px tall in this 832px
                  column rather than the 357px that 21:9 gave it. The
                  index's lead card keeps 21:9: it runs 1088px wide, so
                  the same ratio there is already 466px, and matching the
                  numbers matters more here than matching the shape.

                  `preload`, because this is the page's largest element
                  above the fold — the thing Largest Contentful Paint
                  times. Preloading starts the download from the <head>
                  instead of waiting for the parser to reach this tag,
                  and LCP is one of the Core Web Vitals Google ranks on.

                  `altFallback`: both existing covers were saved with no
                  alt text, which left the largest image on the page
                  undescribed to image search and to screen readers. */}
              <PostCover
                cover={post.cover}
                ratio="16 / 9"
                sizes="(min-width: 896px) 832px, (min-width: 640px) calc(100vw - 4rem), calc(100vw - 2.5rem)"
                preload
                altFallback={post.title}
              />
            </div>
          )}

          <div className="mx-auto max-w-4xl px-5 py-12 sm:px-8 sm:py-16">
            {post.body.map((block, i) => (
              <BlockView key={i} block={block} id={ids.get(i)} />
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
