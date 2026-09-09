import type { Metadata } from "next";
import Link from "next/link";

import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <>
      <Link
        href="/admin/posts"
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

      <h1 className="mt-5 text-[1.75rem] font-semibold tracking-[-0.024em] text-ink">
        New post
      </h1>
      <p className="mt-1.5 text-[0.9375rem] text-muted">
        The body is stored as structured blocks, not HTML — so the article page
        keeps control of how every heading, quote and list renders.
      </p>

      <PostForm />
    </>
  );
}
