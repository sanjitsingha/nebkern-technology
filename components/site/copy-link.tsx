"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Copy link" for an article — the last icon in its share row.
 *
 * The URL is built in the browser from `location.origin` rather than
 * from SITE.url, so a link copied on localhost or a Vercel preview
 * points at the site the reader is actually on. Only the origin is
 * taken — a query string or hash the reader arrived with is not theirs
 * to pass on. `ShareLinks` deliberately does the opposite: see the note
 * there.
 *
 * `className` comes from `ShareLinks` so this circle is the same object
 * as the three beside it, defined once where the row is laid out rather
 * than copied into both files and left to drift.
 */
export function CopyLink({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const [copied, setCopied] = useState(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // A reader who clicks and then navigates away leaves a timer holding
  // a setState on an unmounted component behind them.
  useEffect(() => {
    return () => {
      if (timer.current) clearTimeout(timer.current);
    };
  }, []);

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(
        `${window.location.origin}/blog/${slug}`,
      );
    } catch {
      // No clipboard: an insecure context, or permission refused. Say
      // nothing rather than flash "Copied" over a copy that never
      // happened — a confirmation that lies is worse than none.
      return;
    }

    setCopied(true);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => setCopied(false), 1800);
  }

  return (
    <span className="relative inline-flex">
      {/* Icon only now that it sits in a row of circles. The word "Copy
          link" went with the pill it used to be; the label it carried
          is on `aria-label`, so nothing was lost to a screen reader. */}
      <button
        type="button"
        onClick={handleCopy}
        aria-label="Copy a link to this post"
        title="Copy link"
        className={className}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.7"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-[1.05rem] w-[1.05rem]"
          aria-hidden="true"
        >
          <path d="M9.8 14.2a3.8 3.8 0 0 0 5.5.1l3.4-3.4a3.9 3.9 0 0 0-5.5-5.5l-1.2 1.2" />
          <path d="M14.2 9.8a3.8 3.8 0 0 0-5.5-.1l-3.4 3.4a3.9 3.9 0 0 0 5.5 5.5l1.2-1.2" />
        </svg>
      </button>

      {/* The visible bubble is decorative — `aria-hidden`, because the
          live region below is what a screen reader should hear. Kept
          mounted and faded rather than conditionally rendered so it
          cannot shift the byline's height as it appears. */}
      <span
        className={`pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 rounded-md bg-panel px-2 py-1 text-[0.6875rem] font-medium whitespace-nowrap text-panel-fg transition-opacity ${
          copied ? "opacity-100" : "opacity-0"
        }`}
        aria-hidden="true"
      >
        Copied
      </span>

      {/* Empty until the copy succeeds, so nothing is announced on load
          — a `role="status"` carrying text from the first render gets
          read out as the page arrives. */}
      <span role="status" aria-live="polite" className="sr-only">
        {copied ? "Link copied to clipboard" : ""}
      </span>
    </span>
  );
}
