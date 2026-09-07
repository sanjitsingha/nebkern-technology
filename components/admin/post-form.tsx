"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { savePostAction, type FormState } from "@/app/admin/actions";
import { BodyEditor } from "@/components/admin/editor";
import type { Block, Post } from "@/lib/blog";

/**
 * One form for both creating and editing.
 *
 * `originalSlug` is what tells them apart: empty means create, present
 * means update the post currently at that slug. Keeping it in a hidden
 * field rather than in two near-identical components means the two
 * paths cannot drift.
 */
const FIELD =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const LABEL = "text-[0.8125rem] font-medium text-ink";

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className={LABEL}>{label}</span>
      {children}
      {hint && <span className="text-[0.75rem] text-muted">{hint}</span>}
    </label>
  );
}

export function PostForm({ post }: { post?: Post }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    savePostAction,
    null,
  );

  // The editor's value lives here so it can ride along in a hidden
  // field — a form input holds a string, and a body is structured.
  const [body, setBody] = useState<Block[]>(post?.body ?? []);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-6">
      <input type="hidden" name="originalSlug" value={post?.slug ?? ""} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />

      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.875rem] text-ink"
        >
          {state.error}
        </p>
      )}

      <Field label="Title">
        <input name="title" defaultValue={post?.title} required className={FIELD} />
      </Field>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="URL slug"
          hint="Leave blank on a new post to build it from the title."
        >
          <input
            name="slug"
            defaultValue={post?.slug}
            placeholder="what-official-whatsapp-access-means"
            className={`${FIELD} font-mono`}
          />
        </Field>

        <Field label="Date">
          <input
            name="date"
            type="date"
            defaultValue={post?.date}
            required
            className={FIELD}
          />
        </Field>
      </div>

      <Field label="Excerpt" hint="Shown on the blog index and in search results.">
        <textarea
          name="excerpt"
          defaultValue={post?.excerpt}
          rows={3}
          className={`${FIELD} resize-y`}
        />
      </Field>

      <div className="grid gap-6 sm:grid-cols-3">
        <Field label="Tag">
          <input
            name="tag"
            defaultValue={post?.tag}
            placeholder="Platform"
            className={FIELD}
          />
        </Field>

        <Field label="Author">
          <input
            name="authorName"
            defaultValue={post?.author.name}
            className={FIELD}
          />
        </Field>

        <Field label="Author role">
          <input
            name="authorRole"
            defaultValue={post?.author.role}
            className={FIELD}
          />
        </Field>
      </div>

      <div className="grid gap-6 sm:grid-cols-2">
        <Field
          label="Cover image URL"
          hint="Must be on media.instant.nebkern.com — the only host next.config.ts allows."
        >
          <input
            name="coverSrc"
            defaultValue={post?.cover?.src}
            placeholder="https://media.instant.nebkern.com/assets/blog/…"
            className={FIELD}
          />
        </Field>

        <Field label="Cover alt text">
          <input
            name="coverAlt"
            defaultValue={post?.cover?.alt}
            className={FIELD}
          />
        </Field>
      </div>

      <div className="flex flex-col gap-1.5">
        <span className={LABEL}>Body</span>
        <BodyEditor value={post?.body ?? []} onChange={setBody} />
        <span className="text-[0.75rem] text-muted">
          {body.length} {body.length === 1 ? "block" : "blocks"} · read time is
          worked out from this on save
        </span>
      </div>

      <div className="flex items-center gap-3 border-t border-line-soft pt-6">
        <button
          type="submit"
          disabled={pending}
          className="rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
        >
          {pending ? "Saving…" : post ? "Save changes" : "Create post"}
        </button>

        <Link
          href="/admin/posts"
          className="rounded-md border border-line px-4 py-2.5 text-[0.9375rem] font-medium text-ink transition-colors hover:border-ink/25"
        >
          Cancel
        </Link>
      </div>
    </form>
  );
}
