"use client";

import Link from "next/link";
import { useActionState, useMemo, useState } from "react";

import { savePostAction, type FormState } from "@/app/admin/actions";
import { BodyEditor } from "@/components/admin/editor";
import { blockText, type Block, type Post } from "@/lib/blog";
import { SITE } from "@/lib/site";

/**
 * One form for both creating and editing.
 *
 * `originalSlug` is what tells them apart: empty means create, present
 * means update the post currently at that slug. Keeping it in a hidden
 * field rather than in two near-identical components means the two
 * paths cannot drift.
 *
 * Laid out as a wide writing column with a narrow rail, the shape every
 * CMS converges on for a reason: the body is the work, and everything
 * else — dates, tags, cover, SEO — is settings that should not sit
 * between the writer and the text.
 */
const FIELD =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent";

const LABEL = "text-[0.8125rem] font-medium text-ink";

/** Google truncates around these. They are guidance, not validation —
 *  a longer title is not invalid, it is just not all going to show. */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

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

function Panel({
  title,
  note,
  children,
}: {
  title: string;
  note?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-md border border-line bg-surface p-5">
      <h2 className="text-[0.8125rem] font-semibold tracking-[-0.01em] text-ink">
        {title}
      </h2>
      {note && <p className="mt-1 text-[0.75rem] text-muted">{note}</p>}
      <div className="mt-4 flex flex-col gap-4">{children}</div>
    </section>
  );
}

/** Counts up to a limit and goes amber past it. Not an error state:
 *  going long costs you a truncated result, not a broken page. */
function Counter({ value, limit }: { value: string; limit: number }) {
  const n = value.trim().length;
  return (
    <span
      className={`text-[0.75rem] tabular-nums ${n > limit ? "text-warning" : "text-muted"}`}
    >
      {n}/{limit}
    </span>
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

  // Mirrored into state only because the SEO preview reads them live.
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [seoTitle, setSeoTitle] = useState(post?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seo?.description ?? "",
  );

  // The same arithmetic the server does on save, shown live so the
  // writer is not guessing at length.
  const stats = useMemo(() => {
    const words = body
      .map(blockText)
      .join(" ")
      .split(/\s+/)
      .filter(Boolean).length;
    return { words, minutes: Math.max(1, Math.round(words / 200)) };
  }, [body]);

  // What a search result would actually show. Falls back exactly the
  // way the page does, so an empty override previews the real thing
  // rather than an empty line.
  const previewTitle = seoTitle.trim() || title || "Untitled post";
  const previewDescription =
    seoDescription.trim() || excerpt || "No excerpt yet.";
  const previewUrl = `${SITE.url}/blog/${slug || "post-slug"}`;

  return (
    <form action={formAction} className="mt-8">
      <input type="hidden" name="originalSlug" value={post?.slug ?? ""} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />

      {state?.error && (
        <p
          role="alert"
          className="mb-6 rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.875rem] text-ink"
        >
          {state.error}
        </p>
      )}

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem] lg:items-start">
        {/* ---- the writing column ---- */}
        <div className="flex flex-col gap-6">
          <Field label="Title">
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              className={`${FIELD} text-[1.125rem] font-medium`}
            />
          </Field>

          <Field
            label="Excerpt"
            hint="Shown on the blog index, and used as the meta description unless the SEO panel overrides it."
          >
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              rows={3}
              className={`${FIELD} resize-y`}
            />
          </Field>

          <div className="flex flex-col gap-1.5">
            <div className="flex items-baseline justify-between">
              <span className={LABEL}>Body</span>
              <span className="text-[0.75rem] text-muted tabular-nums">
                {stats.words} {stats.words === 1 ? "word" : "words"} ·{" "}
                {body.length} {body.length === 1 ? "block" : "blocks"} · ~
                {stats.minutes} min read
              </span>
            </div>
            <BodyEditor value={post?.body ?? []} onChange={setBody} />
          </div>
        </div>

        {/* ---- the settings rail ---- */}
        <div className="flex flex-col gap-5">
          <Panel title="Publish">
            <div className="flex flex-wrap items-center gap-3">
              <button
                type="submit"
                disabled={pending}
                className="rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
              >
                {pending ? "Saving…" : post ? "Save changes" : "Create post"}
              </button>
              <Link
                href="/admin/posts"
                className="text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
              >
                Cancel
              </Link>
            </div>

            <Field label="Date">
              <input
                name="date"
                type="date"
                defaultValue={post?.date}
                required
                className={FIELD}
              />
            </Field>

            <Field
              label="URL slug"
              hint="Leave blank on a new post to build it from the title."
            >
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="what-official-whatsapp-access-means"
                className={`${FIELD} font-mono text-[0.8125rem]`}
              />
            </Field>
          </Panel>

          <Panel title="Attribution">
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
          </Panel>

          <Panel
            title="Cover image"
            note={`Must be on ${new URL(SITE.url).hostname === "nebkern.com" ? "media.instant.nebkern.com" : "the media host"} — the only host the image optimizer will fetch.`}
          >
            <Field label="Image URL">
              <input
                name="coverSrc"
                defaultValue={post?.cover?.src}
                placeholder="https://media.instant.nebkern.com/assets/blog/…"
                className={`${FIELD} text-[0.8125rem]`}
              />
            </Field>
            <Field label="Alt text" hint="What the photograph shows.">
              <input
                name="coverAlt"
                defaultValue={post?.cover?.alt}
                className={FIELD}
              />
            </Field>
          </Panel>

          <Panel
            title="Search engines"
            note="Both fields fall back to the title and excerpt. Fill them only when the result page wants a different sentence."
          >
            {/* A live approximation of the result, so the lengths mean
                something. It is the fallback chain the page actually
                uses, not a separate one that could drift from it. */}
            <div className="rounded-md border border-line-soft bg-surface-2 p-3.5">
              <p className="truncate font-mono text-[0.6875rem] text-muted">
                {previewUrl}
              </p>
              <p className="mt-1 truncate text-[0.9375rem] font-medium text-accent">
                {previewTitle}
              </p>
              <p className="mt-0.5 line-clamp-2 text-[0.8125rem] leading-snug text-muted">
                {previewDescription}
              </p>
            </div>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between">
                <span className={LABEL}>Search title</span>
                <Counter value={previewTitle} limit={TITLE_LIMIT} />
              </span>
              <input
                name="seoTitle"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder={title || "Defaults to the post title"}
                className={FIELD}
              />
            </label>

            <label className="flex flex-col gap-1.5">
              <span className="flex items-baseline justify-between">
                <span className={LABEL}>Meta description</span>
                <Counter value={previewDescription} limit={DESCRIPTION_LIMIT} />
              </span>
              <textarea
                name="seoDescription"
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                rows={3}
                placeholder="Defaults to the excerpt"
                className={`${FIELD} resize-y`}
              />
            </label>

            <label className="flex items-start gap-2.5">
              <input
                type="checkbox"
                name="noindex"
                defaultChecked={post?.seo?.noindex}
                className="mt-0.5 size-4 accent-accent"
              />
              <span>
                <span className={LABEL}>Hide from search engines</span>
                <span className="mt-0.5 block text-[0.75rem] text-muted">
                  Adds a noindex tag and drops the post from the sitemap. The
                  page stays reachable by anyone with the link.
                </span>
              </span>
            </label>
          </Panel>
        </div>
      </div>
    </form>
  );
}
