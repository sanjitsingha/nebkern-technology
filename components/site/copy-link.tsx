"use client";

import { useEffect, useRef, useState } from "react";

/**
 * "Copy link" for an article, sitting in the byline beside the read
 * time.
 *
 * The URL is built in the browser from `location.origin` rather than
 * from SITE.url, so a link copied on localhost or a Vercel preview
 * points at the site the reader is actually on. Only the origin is
 * taken — a query string or hash the reader arrived with is not theirs
 * to pass on.
 */
export function CopyLink({ slug }: { slug: string }) {
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
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 text-[0.8125rem] text-muted transition-colors hover:text-accent"
      >
        <svg
          viewBox="0 0 16 16"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="h-3.5 w-3.5"
          aria-hidden="true"
        >
          <path d="M6.5 9.5a2.5 2.5 0 0 0 3.6.1l2.3-2.3a2.55 2.55 0 0 0-3.6-3.6l-.8.8" />
          <path d="M9.5 6.5a2.5 2.5 0 0 0-3.6-.1L3.6 8.7a2.55 2.55 0 0 0 3.6 3.6l.8-.8" />
        </svg>
        Copy link
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
