import {
  blockText,
  modifiedAt,
  publishedAt,
  type Post,
  type PostSummary,
} from "@/lib/blog";
import { ORGANIZATION_ID, absoluteUrl } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * How the blog describes itself to search engines, feed readers and
 * link previews — one module, because five places say these things (the
 * index, the article, the sitemap, the feed and the share images) and
 * they are only guaranteed to agree if they say them through the same
 * functions.
 *
 * No server-only imports: this is pure string work over a `Post`, so any
 * route can use it.
 */

export const BLOG_NAME = `${SITE.shortName} blog`;
export const BLOG_DESCRIPTION = `Notes from ${SITE.name} on building and running software for Indian businesses.`;

/** The Blog entity's `@id`. The index defines it; every article points
 *  back at it through `isPartOf`, which is what joins them into one
 *  graph rather than a list of unrelated pages on the same domain. */
export const BLOG_ID = `${absoluteUrl("/blog")}#blog`;

export function postPath(slug: string): string {
  return `/blog/${slug}`;
}

export function postUrl(slug: string): string {
  return absoluteUrl(postPath(slug));
}

/** The article entity's `@id` — shared by the article's own structured
 *  data and the index's list of posts, so a crawler merges the two
 *  descriptions instead of counting the same post twice. */
export function postId(slug: string): string {
  return `${postUrl(slug)}#article`;
}

/** The `<title>`: the SEO override when one is set, the headline when
 *  not. */
export function postTitle(post: Pick<Post, "title" | "seo">): string {
  return post.seo?.title?.trim() || post.title;
}

/** The meta description: the override when set, else the excerpt — which
 *  is derived from the body, so it is never empty for a post that has
 *  one. */
export function postDescription(post: Pick<Post, "excerpt" | "seo">): string {
  return post.seo?.description?.trim() || post.excerpt;
}

/** Every share image is this size — the 1.91:1 that Facebook, LinkedIn,
 *  X and WhatsApp all crop to — so its dimensions can be declared up
 *  front instead of a scraper having to download it to find out. */
export const SHARE_IMAGE_SIZE = { width: 1200, height: 630 } as const;

/**
 * A short, stable fingerprint of the cover's URL.
 *
 * Link-preview scrapers cache an image by its URL, often for weeks, and
 * the share image's own URL never changes — so without this a new cover
 * would go on previewing as the old one. Uploads are stored under random
 * names, so a new cover is a new `src` and therefore a new query string.
 */
function fingerprint(value: string): string {
  let hash = 5381;
  for (let i = 0; i < value.length; i++) {
    hash = ((hash << 5) + hash + value.charCodeAt(i)) | 0;
  }
  return (hash >>> 0).toString(36);
}

/**
 * The picture a post is shared with, as a path on this site.
 *
 * A post with a cover shares a 1200×630 JPEG cut from it
 * (app/blog/[slug]/cover.jpg) rather than the cover file itself. The
 * original can be a multi-megabyte PNG of any shape — WhatsApp drops a
 * preview image much over 300 KB, and every network crops a picture that
 * is not 1.91:1 wherever it likes. A post without a cover shares the
 * card drawn from its title (app/blog/[slug]/card.png).
 *
 * `alt` falls back to the title. The cover's own alt text is optional
 * for drafts and older posts, and an empty `og:image:alt` is worse than
 * one that at least names the article.
 */
export function shareImage(post: PostSummary) {
  const base = postPath(post.slug);

  return post.cover
    ? {
        url: `${base}/cover.jpg?v=${fingerprint(post.cover.src)}`,
        type: "image/jpeg",
        alt: post.cover.alt || post.title,
        ...SHARE_IMAGE_SIZE,
      }
    : {
        url: `${base}/card.png`,
        type: "image/png",
        alt: post.title,
        ...SHARE_IMAGE_SIZE,
      };
}

/**
 * How structured data names the company wherever it appears as an author
 * or publisher.
 *
 * The `@id` is what joins it to the full Organization the root layout
 * publishes — logo, address, registration number. The name and URL are
 * repeated because a validator reading this block on its own, as Google's
 * Rich Results Test does, flags an author with no name.
 */
const ORGANIZATION_REF = {
  "@type": "Organization",
  "@id": ORGANIZATION_ID,
  name: SITE.name,
  url: absoluteUrl("/"),
};

/**
 * The article's BlogPosting.
 *
 * `headline` is the post's own title, not its SEO override. Google asks
 * that structured data describe what is visible on the page, and what is
 * visible is the `<h1>`; the override exists for the result-page title,
 * which is a different job with a different length limit.
 *
 * `image` lists the original cover first — full resolution, for Google's
 * own crops in Discover and Top stories, which want an image at least
 * 1200px wide — then the 1200×630 share image with its dimensions
 * declared.
 */
export function blogPostingJsonLd(post: Post) {
  const url = postUrl(post.slug);
  const share = shareImage(post);
  const words = post.body
    .map(blockText)
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;

  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "@id": postId(post.slug),
    url,
    // Tells a crawler which URL is the article's own, independently of
    // the one it happened to arrive on.
    mainEntityOfPage: { "@type": "WebPage", "@id": url },
    headline: post.title,
    description: postDescription(post),
    image: [
      ...(post.cover ? [post.cover.src] : []),
      {
        "@type": "ImageObject",
        url: absoluteUrl(share.url),
        width: share.width,
        height: share.height,
      },
    ],
    datePublished: publishedAt(post),
    dateModified: modifiedAt(post),
    // The company, not a person. Posts carry no byline, and naming an
    // author in structured data that the page does not show is exactly
    // the mismatch a rich-results check flags.
    author: ORGANIZATION_REF,
    publisher: ORGANIZATION_REF,
    isPartOf: {
      "@type": "Blog",
      "@id": BLOG_ID,
      name: BLOG_NAME,
      url: absoluteUrl("/blog"),
    },
    inLanguage: "en-IN",
    wordCount: words,
    // ISO 8601 duration — the same number the page prints as "5 min
    // read", in the form schema.org defines for it.
    timeRequired: `PT${post.readMinutes}M`,
  };
}

/**
 * The index's Blog, with every published post listed by `@id`.
 *
 * Each entry repeats only what the index itself shows — title, excerpt,
 * dates, picture — and the full description lives on the article, where
 * the shared `@id` lets a crawler merge the two.
 */
export function blogJsonLd(posts: PostSummary[]) {
  return {
    "@context": "https://schema.org",
    "@type": "Blog",
    "@id": BLOG_ID,
    url: absoluteUrl("/blog"),
    name: BLOG_NAME,
    description: BLOG_DESCRIPTION,
    inLanguage: "en-IN",
    publisher: ORGANIZATION_REF,
    blogPost: posts.map((post) => ({
      "@type": "BlogPosting",
      "@id": postId(post.slug),
      url: postUrl(post.slug),
      headline: post.title,
      description: post.excerpt,
      datePublished: publishedAt(post),
      dateModified: modifiedAt(post),
      image: absoluteUrl(shareImage(post).url),
    })),
  };
}
