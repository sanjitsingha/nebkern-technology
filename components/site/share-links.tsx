import { CopyLink } from "@/components/site/copy-link";
import { SITE } from "@/lib/site";

/**
 * Share an article — the icons at the right-hand end of its meta line.
 *
 * A Server Component, and the URL is built from `SITE.url` rather than
 * from `location.origin` the way `CopyLink` does it. That difference is
 * deliberate: a copied link is for wherever the reader is, but a link
 * posted to LinkedIn has to be one the public can open, so a share from
 * localhost or a Vercel preview should still point at the live article.
 *
 * Every target is a plain GET URL, so there is no embedded script here
 * and nothing is loaded from any of these companies — no share button
 * that reports the reader back to a network they never clicked.
 */

/** One 36px circle. The ring is the button — the icon inside it is
 *  drawn in stroke, so the whole control is outline rather than a solid
 *  chip, and the ring and the glyph take the accent together. */
const CIRCLE =
  "grid size-9 place-items-center rounded-full border border-line text-muted transition-colors hover:border-accent hover:text-accent focus-visible:border-accent focus-visible:text-accent";

/** Shared by every glyph below: 24-unit grid, stroked, never filled. */
const ICON = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.7,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  className: "h-[1.05rem] w-[1.05rem]",
  "aria-hidden": true,
} as const;

export function ShareLinks({ slug, title }: { slug: string; title: string }) {
  const url = `${SITE.url}/blog/${slug}`;
  // Encoded once. A title with an ampersand or a question mark in it
  // would otherwise end the query string early and post a truncated
  // headline.
  const text = encodeURIComponent(title);
  const link = encodeURIComponent(url);

  const targets = [
    {
      name: "LinkedIn",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${link}`,
      icon: (
        <svg {...ICON}>
          <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-4 0v7h-4v-7a6 6 0 0 1 6-6z" />
          <rect x="2" y="9" width="4" height="12" />
          <circle cx="4" cy="4" r="2" />
        </svg>
      ),
    },
    {
      name: "X",
      href: `https://x.com/intent/tweet?url=${link}&text=${text}`,
      icon: (
        // The X mark as two crossing strokes, with the serifs that keep
        // it from reading as a close button.
        <svg {...ICON}>
          <path d="M4 3h3.5l12.5 18H16.5z" />
          <path d="M19.5 3 13.4 10M10.4 13.6 4.2 21" />
        </svg>
      ),
    },
    {
      name: "WhatsApp",
      href: `https://api.whatsapp.com/send?text=${text}%20${link}`,
      icon: (
        <svg {...ICON}>
          <path d="M21 11.5a8.4 8.4 0 0 1-12.6 7.3L3 20.5l1.8-5.2A8.5 8.5 0 1 1 21 11.5z" />
          <path d="M8.9 8.3c.2-.4.4-.4.6-.4h.5c.2 0 .4 0 .6.5l.7 1.7c.1.2 0 .4-.1.5l-.4.5c-.1.2-.2.3 0 .6a6 6 0 0 0 2.7 2.3c.3.1.4 0 .6-.1l.6-.7c.2-.2.3-.1.5 0l1.6.8c.2.1.4.2.4.4a1.8 1.8 0 0 1-1.2 1.6 3 3 0 0 1-2.4-.2 10 10 0 0 1-4.5-4.3 3.4 3.4 0 0 1-.6-2.1c0-.6.3-1 .4-1.1z" />
        </svg>
      ),
    },
  ];

  return (
    // `ms-auto` is what puts this at the right-hand end of the meta row:
    // the row is a flex line, so the auto inline-start margin eats the
    // space between the read time and here. On a phone the row wraps and
    // the icons drop to their own line, still right-aligned.
    <span className="ms-auto flex items-center gap-2">
      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          // `noopener` so the opened tab cannot reach back through
          // `window.opener`; `noreferrer` so the network is not told
          // which article the reader came from.
          rel="noopener noreferrer"
          // The icon is the whole control, so the name is the label.
          // "on X", not "X", because a screen reader reads these one
          // after another and "share" alone would repeat four times.
          aria-label={`Share this post on ${target.name}`}
          title={`Share on ${target.name}`}
          className={CIRCLE}
        >
          {target.icon}
        </a>
      ))}

      <CopyLink slug={slug} className={CIRCLE} />
    </span>
  );
}
