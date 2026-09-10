import Image from "next/image";

import type { Post } from "@/lib/blog";

/**
 * A post's cover image, or nothing at all.
 *
 * This used to render a hatched placeholder carrying the post's tag
 * whenever `cover` was unset — a standing "pending" block that was
 * honest about being unfinished, but which every post on the site was
 * showing, so the blog read as a page of empty frames rather than a
 * page of writing. It renders `null` now: a post with no picture simply
 * has no picture, and the layout closes up around it.
 *
 * Nothing changes at the call sites when the real pictures arrive — set
 * `cover` on the post and the same component renders it. The call sites
 * do have to cope with a null return, which is why each one asks
 * `post.cover` before opening a slot for it.
 *
 * Covers are expected on the media host the product lockups already use
 * (`media.instant.nebkern.com/assets/**`), which next.config.ts allows.
 * A cover pointed anywhere else will be refused by the image optimizer.
 */
export function PostCover({
  cover,
  sizes,
  ratio = "16 / 9",
  className = "",
}: {
  cover: Post["cover"];
  /** Required whenever the cover is not full-width — `fill` images have
   *  no intrinsic size for the browser to pick a source from. */
  sizes: string;
  /**
   * CSS `aspect-ratio`. 16:9 suits a thumbnail, where the box is a few
   * hundred pixels across and its height barely registers. It does not
   * suit anything running the full width of the 6xl column: at ~990px
   * wide that is a 558px-tall block before the headline even starts,
   * which is why the lead card asks for something flatter.
   */
  ratio?: string;
  className?: string;
}) {
  if (!cover) return null;

  return (
    <div
      className={`relative overflow-hidden rounded-md bg-surface-2 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      <Image
        src={cover.src}
        alt={cover.alt}
        fill
        sizes={sizes}
        className="object-cover"
      />
    </div>
  );
}
