"use client";

import Link from "next/link";
import { useActionState, useState } from "react";

import { savePostAction, type FormState } from "@/app/admin/actions";
import { BodyEditor } from "@/components/admin/editor";
import { DEFAULT_TITLE, slugify, type Block, type Post } from "@/lib/blog";
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

/**
 * The editor's page column.
 *
 * Deliberately the same width as `SHELL` in the (shell) layout, which
 * the editor no longer shares. Repeating the number is the cost of the
 * editor having its own chrome; the alternative was a shared constant
 * imported across a server/client boundary for two class names.
 */
const BAR = "mx-auto w-full max-w-[88rem] px-5 sm:px-8";

/** Google truncates around these. They are guidance, not validation —
 *  a longer title is not invalid, it is just not all going to show. */
const TITLE_LIMIT = 60;
const DESCRIPTION_LIMIT = 155;

/** A bordered group in the rail. Untitled by design — the fields inside
 *  carry their own placeholders, and a caption above them repeated the
 *  same word one line higher. */
function Panel({ children }: { children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-md border border-line bg-surface p-5">
      {children}
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
  // A new post opens empty, so the placeholder shows.
  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");

  // Whether the slug has been typed in by hand. Until it has, the field
  // follows the title; after that it is the writer's and stops moving.
  // An existing post starts `true`: its slug is a live URL, and having
  // it quietly track a title edit would change a published address as a
  // side effect of fixing a headline.
  const [slugEdited, setSlugEdited] = useState(Boolean(post?.slug));
  const [seoTitle, setSeoTitle] = useState(post?.seo?.title ?? "");
  const [seoDescription, setSeoDescription] = useState(
    post?.seo?.description ?? "",
  );

  // What a search result would actually show. Falls back exactly the
  // way the page does, so an empty override previews the real thing
  // rather than an empty line.
  // `DEFAULT_TITLE`, not a separate "Untitled post" string: an empty
  // title really will be saved as DEFAULT_TITLE, so previewing anything
  // else would show a result the site is never going to produce.
  const previewTitle = seoTitle.trim() || title.trim() || DEFAULT_TITLE;
  const previewDescription =
    seoDescription.trim() || excerpt || "No excerpt yet.";
  // What the slug field shows, and what the URL preview uses — one
  // value, so the preview can never disagree with the field above it.
  const slugValue = slugEdited ? slug : slugify(title);
  const previewUrl = `${SITE.url}/blog/${slugValue || "post-slug"}`;

  // Three states, not two: a post that does not exist yet, one saved as
  // a draft, and one that is live. Each wants different words on the
  // same two buttons, and spelling that out here keeps the JSX from
  // becoming a stack of nested ternaries.
  const isDraft = post?.draft ?? false;
  const isLive = Boolean(post) && !isDraft;

  const publishLabel = isLive ? "Save changes" : "Publish";
  // On a live post this button is an unpublish, which is a bigger thing
  // than "save" and should not be described as one.
  const draftLabel = isLive
    ? "Unpublish to draft"
    : isDraft
      ? "Save draft"
      : "Save as draft";

  return (
    <form action={formAction}>
      <input type="hidden" name="originalSlug" value={post?.slug ?? ""} />
      <input type="hidden" name="body" value={JSON.stringify(body)} />

      {/* The editor's own top bar, and the reason this screen sits
          outside the `(shell)` route group: it REPLACES the admin nav
          rather than stacking under it.

          It lives inside the <form> deliberately. Publish and Save draft
          are real submit buttons, so they can read `pending` from
          `useActionState` and disable themselves mid-save. Rendering the
          bar in a layout would have meant reaching the form through the
          `form="..."` attribute and giving that state up.

          Sticky, because the point of lifting the actions up here is
          that they stay reachable from the bottom of a long draft. */}
      <div className="sticky top-0 z-30 border-b border-line bg-surface">
        <div className={`${BAR} flex h-16 items-center justify-between gap-4`}>
          <Link
            href="/admin/posts"
            className="inline-flex items-center gap-1.5 text-[0.9375rem] font-medium text-ink transition-colors hover:text-accent"
          >
            <svg
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path d="M10 3L5 8l5 5" />
            </svg>
            Back
          </Link>

          {/* Two submit buttons, one action. A submit button's
              name/value only reaches the server when it is the button
              that submitted the form, so `intent` tells the action which
              was pressed without a hidden field or a second endpoint. */}
          <div className="flex items-center gap-2">
            <button
              type="submit"
              name="intent"
              value="publish"
              disabled={pending}
              className="rounded-md bg-accent px-4 py-2 text-[0.875rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
            >
              {pending ? "Saving…" : publishLabel}
            </button>

            <button
              type="submit"
              name="intent"
              value="draft"
              disabled={pending}
              className="rounded-md border border-line bg-surface px-4 py-2 text-[0.875rem] font-medium text-ink transition-colors hover:border-ink/25 disabled:opacity-60"
            >
              {draftLabel}
            </button>

            <Link
              href="/admin/posts"
              className="rounded-md px-3 py-2 text-[0.875rem] font-medium text-muted transition-colors hover:text-ink"
            >
              Cancel
            </Link>
          </div>
        </div>
      </div>

      <div className={`${BAR} py-8 sm:py-10`}>
        {state?.error && (
          <p
            role="alert"
            className="mb-6 rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.875rem] text-ink"
          >
            {state.error}
          </p>
        )}

        {/* The rail is a proportion with a floor, not a fixed 20rem.
          At the old shell width a flat 320px happened to land near the
          70/30 this form is meant to hold; now that the shell is wider,
          the same 320px would be a quarter of it and the split would
          have drifted to roughly 75/25 on its own. A proportion keeps the
          ratio wherever the page ends up, and the rem floor stops the
          settings panels being squeezed at the narrowest desktop width,
          where the percentage is less than the rail needs. */}
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(22rem,34%)] lg:items-start">
          {/* ---- the writing column ---- */}
          <div className="flex flex-col gap-6">
            {/* No label, and no page heading above it either. The field IS
              the title — the way it reads in WordPress — so a "Title"
              caption over a box already holding the title, under an H1
              already saying "New post", was the same word three times
              before a single one had been written.

              "Untitled" is a placeholder, so it is faint, it does not
              have to be cleared before typing, and it is not what the
              field contains. A placeholder is also not SUBMITTED, so
              `savePostAction` substitutes the same word server-side when
              the title comes back empty — which is what keeps "save it
              without naming it and rename it later" working. The two
              halves read `DEFAULT_TITLE` from lib/blog.ts so the word on
              screen and the word that gets saved cannot drift.

              No `required`, for the same reason: the browser would block
              a submit that the server is perfectly happy to complete. */}
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={DEFAULT_TITLE}
              aria-label="Title"
              // `text-ink/25` rather than `text-muted`: muted is tuned for
              // small print, and at 2rem semibold it still reads as text
              // somebody wrote rather than as a prompt.
              className="w-full border-0 bg-transparent p-0 text-[2rem] font-semibold tracking-[-0.024em] text-ink outline-none placeholder:text-ink/25 focus:ring-0"
            />

            {/* No "Body" label and no live word count above it. The label
              named the obvious — it is the only thing under the title —
              and the counter sat at the top of an empty editor
              announcing "0 words · 0 blocks · ~1 min read" before
              anything had been written, which is chrome reporting on
              nothing. */}
            <BodyEditor value={post?.body ?? []} onChange={setBody} />
          </div>

          {/* ---- the settings rail ----

            Placeholders only: no field labels, no hints, no panel
            captions, no status sentences. This is an internal tool with
            one set of users who already know what a slug is, and every
            explanatory line here was a caption on a box that says the
            same thing in its own placeholder. */}
          <div className="flex flex-col gap-5">
            {/* Publish, Save draft and Cancel all moved to the top bar.
              What is left in this panel is the slug. */}
            <Panel>
              {/* The slug mirrors the title until it is touched.
                `slugValue` is what the field shows: the derived slug
                while `slugEdited` is false, and whatever was typed once
                it is true. Typing in it once is what stops it following
                — otherwise correcting a slug and then fixing a typo in
                the title would silently throw the correction away.
                An existing post counts as already edited, since its slug
                is a published URL and must not start tracking a rename.

                The placeholder is a bare "slug" for an untitled post,
                because there is nothing yet to derive one from. */}
              <input
                name="slug"
                value={slugValue}
                onChange={(e) => {
                  setSlugEdited(true);
                  setSlug(e.target.value);
                }}
                placeholder="slug"
                aria-label="Slug"
                className={`${FIELD} font-mono text-[0.8125rem]`}
              />
            </Panel>

            {/* Cover sits directly under the publish box now. */}
            <Panel>
              <input
                name="coverSrc"
                defaultValue={post?.cover?.src}
                placeholder="Cover image URL"
                aria-label="Cover image URL"
                className={`${FIELD} text-[0.8125rem]`}
              />
              <input
                name="coverAlt"
                defaultValue={post?.cover?.alt}
                placeholder="Alt text"
                aria-label="Cover image alt text"
                className={FIELD}
              />
            </Panel>

            {/* Was "Excerpt", which is the word the data model uses; this
              is the word a person uses. The field name stays `excerpt`
              so nothing downstream has to change. */}
            <Panel>
              <textarea
                name="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                rows={4}
                placeholder="Short description"
                aria-label="Short description"
                className={`${FIELD} resize-y`}
              />
            </Panel>

            <Panel>
              <input
                name="tag"
                defaultValue={post?.tag}
                placeholder="Tag"
                aria-label="Tag"
                className={FIELD}
              />
              <input
                name="authorName"
                defaultValue={post?.author.name}
                placeholder="Author"
                aria-label="Author"
                className={FIELD}
              />
              <input
                name="authorRole"
                defaultValue={post?.author.role}
                placeholder="Author role"
                aria-label="Author role"
                className={FIELD}
              />
            </Panel>

            <Panel>
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

              {/* The counters stay. They are not explanatory copy — they
                are the one thing on this panel you cannot work out by
                looking, and they go amber at the length Google starts
                truncating. */}
              <div className="flex flex-col gap-1.5">
                <input
                  name="seoTitle"
                  value={seoTitle}
                  onChange={(e) => setSeoTitle(e.target.value)}
                  placeholder="Search title"
                  aria-label="Search title"
                  className={FIELD}
                />
                <div className="flex justify-end">
                  <Counter value={previewTitle} limit={TITLE_LIMIT} />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <textarea
                  name="seoDescription"
                  value={seoDescription}
                  onChange={(e) => setSeoDescription(e.target.value)}
                  rows={3}
                  placeholder="Meta description"
                  aria-label="Meta description"
                  className={`${FIELD} resize-y`}
                />
                <div className="flex justify-end">
                  <Counter
                    value={previewDescription}
                    limit={DESCRIPTION_LIMIT}
                  />
                </div>
              </div>

              {/* A checkbox is the one control that cannot carry a
                placeholder, so this label stays — without it the box
                says nothing at all. */}
              <label className="flex items-center gap-2.5">
                <input
                  type="checkbox"
                  name="noindex"
                  defaultChecked={post?.seo?.noindex}
                  className="size-4 accent-accent"
                />
                <span className={LABEL}>Hide from search engines</span>
              </label>
            </Panel>
          </div>
        </div>
      </div>
    </form>
  );
}
