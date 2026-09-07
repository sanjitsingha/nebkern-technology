import Image from "next/image";

import type { Post } from "@/lib/blog";

/**
 * A post's cover image, or the placeholder that stands in until there
 * is one.
 *
 * The placeholder is deliberately not a photograph. A stock image in
 * every slot would look finished and quietly ship as real; a hatched
 * block with the post's tag on it reads as "pending" at a glance, which
 * is what it is. Nothing changes at the call sites when the real
 * pictures arrive — set `cover` on the post and the same component
 * renders it.
 *
 * Covers are expected on the media host the product lockups already use
 * (`media.instant.nebkern.com/assets/**`), which next.config.ts allows.
 * A cover pointed anywhere else will be refused by the image optimizer.
 */
export function PostCover({
  cover,
  tag,
  sizes,
  ratio = "16 / 9",
  className = "",
}: {
  cover: Post["cover"];
  tag: string;
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
  return (
    <div
      className={`relative flex items-center justify-center overflow-hidden rounded-md bg-surface-2 ${className}`}
      style={{ aspectRatio: ratio }}
    >
      {cover ? (
        <Image
          src={cover.src}
          alt={cover.alt}
          fill
          sizes={sizes}
          className="object-cover"
        />
      ) : (
        <>
          {/* A fine diagonal hatch in the site's own line colour. Quiet
              enough to sit behind a card without competing, obvious
              enough that nobody mistakes it for artwork. */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage:
                "repeating-linear-gradient(135deg, var(--line-soft) 0 1px, transparent 1px 11px)",
            }}
            aria-hidden="true"
          />
          <span className="relative text-[0.6875rem] font-medium tracking-[0.14em] text-muted uppercase">
            {tag}
          </span>
        </>
      )}
    </div>
  );
}
