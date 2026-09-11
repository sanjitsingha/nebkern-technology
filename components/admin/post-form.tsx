"use client";

import Link from "next/link";
import { useActionState, useRef, useState } from "react";

import { savePostAction, type FormState } from "@/app/admin/actions";
import { BodyEditor } from "@/components/admin/editor";
import { ImageUploadButton } from "@/components/admin/image-upload-button";
import { DEFAULT_TITLE, slugify, type Block, type Post } from "@/lib/blog";
import { isAllowedImageUrl } from "@/lib/media";
import { SITE } from "@/lib/site";

/**
 * One form for both creating and editing.
 *
 * `originalSlug` is what tells them apart: empty means create, present
 * means update the post currently at that slug. Keeping it in a hidden
 * field rather than in two near-identical components means the two
 * paths cannot drift.
 *
 * One writing column and nothing beside it. Everything that is not the
 * body — slug, cover, description, byline, SEO — lives in a settings
 * dialog opened from the editor's toolbar. They are settings: set once,
 * revisited occasionally, and a rail showing them for the whole of the
 * writing was screen width spent on things nobody was looking at.
 *
 * The dialog sits INSIDE the <form>, and that is load-bearing. Form
 * ownership follows the DOM, not the rendering: `showModal()` lifts the
 * dialog into the top layer, but its fields are still descendants of
 * this form, so Publish and Save draft submit them whether the dialog
 * is open or shut. It is also never unmounted — a closed <dialog> is
 * `display: none`, not gone — which is what keeps the uncontrolled
 * fields' edits alive between openings. Rendering it conditionally
 * would throw away whatever was typed into them, and a field that is
 * not in the DOM is not submitted at all.
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

/** A bordered group in the settings dialog. Untitled by design — the
 *  fields inside carry their own placeholders, and a caption above them
 *  repeated the same word one line higher. */
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

  // Controlled, unlike the other settings fields, because an upload has
  // to be able to write the stored file's URL into it.
  const [coverSrc, setCoverSrc] = useState(post?.cover?.src ?? "");
  const [coverError, setCoverError] = useState<string | null>(null);

  // The settings dialog, driven imperatively. There is no `open` state
  // to keep in step with the element: the browser owns whether it is
  // open, closes it on Escape by itself, and a state flag mirroring that
  // would just be a second answer to the same question.
  const settings = useRef<HTMLDialogElement>(null);

  // Whether the current click STARTED on the backdrop. A click's target
  // is the nearest common ancestor of where the press and the release
  // landed, so selecting text in a field and letting go outside the
  // dialog reports the dialog itself — and would close it mid-drag.
  const pressedBackdrop = useRef(false);

  const openSettings = () => {
    const dialog = settings.current;
    // Older engines throw on `showModal()` for a dialog already open.
    if (dialog && !dialog.open) dialog.showModal();
  };

  const closeSettings = () => settings.current?.close();

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
        {/* The published article's own measure. With the rail gone this
            column would otherwise run the full 88rem of the bar above —
            around 150 characters a line, far past anything comfortable
            to write in — and 4xl is exactly the width the post renders
            at, so a line here wraps where it will on the page. */}
        <div className="mx-auto flex max-w-4xl flex-col gap-6">
          {state?.error && (
            <p
              role="alert"
              className="rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.875rem] text-ink"
            >
              {state.error}
            </p>
          )}

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
          <BodyEditor
            value={post?.body ?? []}
            onChange={setBody}
            onSettings={openSettings}
          />
        </div>
      </div>

      {/* ---- post settings ----

          Placeholders only: no field labels, no hints, no panel
          captions, no status sentences. This is an internal tool with
          one set of users who already know what a slug is, and every
          explanatory line here was a caption on a box that says the
          same thing in its own placeholder.

          Every button in here is `type="button"`. The dialog is inside
          the form, so a bare <button> would default to submit and
          publish the post from a settings screen. */}
      <dialog
        ref={settings}
        aria-labelledby="post-settings-title"
        onMouseDown={(e) => {
          pressedBackdrop.current = e.target === e.currentTarget;
        }}
        // With `p-0` on the dialog and the panel filling it, the only
        // place a click can land ON the dialog element is its backdrop.
        onClick={(e) => {
          if (pressedBackdrop.current && e.target === e.currentTarget) {
            closeSettings();
          }
          pressedBackdrop.current = false;
        }}
        onKeyDown={(e) => {
          // Enter in a field would otherwise do what Enter does in any
          // form: submit it with the form's first submit button, which
          // is Publish, up in the top bar. In a dialog Enter means
          // "done", so it closes instead. Textareas are not inputs, so
          // they keep Enter as a newline, and an IME mid-composition
          // keeps it for confirming characters.
          if (
            e.key === "Enter" &&
            !e.nativeEvent.isComposing &&
            e.target instanceof HTMLInputElement
          ) {
            e.preventDefault();
            closeSettings();
          }
        }}
        className="m-auto w-[min(56rem,calc(100vw-2rem))] rounded-lg border border-line bg-paper p-0 text-ink shadow-[0_24px_64px_-24px_rgb(0_0_0/0.35)] backdrop:bg-ink/40"
      >
        {/* The flex column is on this inner element, never on the
            <dialog> itself. A `display: flex` class on the dialog would
            beat the browser's own `dialog:not([open]) { display: none }`
            and leave the "closed" dialog showing on the page. */}
        <div className="flex max-h-[calc(100dvh-4rem)] flex-col">
          <div className="flex items-center justify-between gap-4 border-b border-line bg-surface px-6 py-4">
            <h2
              id="post-settings-title"
              className="text-[1.125rem] font-semibold tracking-[-0.02em] text-ink"
            >
              Post settings
            </h2>

            <button
              type="button"
              onClick={closeSettings}
              className="-mr-1 grid size-8 shrink-0 place-items-center rounded-md text-muted transition-colors hover:bg-surface-2 hover:text-ink"
            >
              <span className="sr-only">Close</span>
              <svg
                viewBox="0 0 16 16"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                className="h-4 w-4"
                aria-hidden="true"
              >
                <path d="M4 4l8 8M12 4l-8 8" />
              </svg>
            </button>
          </div>

          {/* The only part that scrolls, so the title and Done stay put
              on a short screen. `min-h-0` is what lets a flex child
              shrink below its content and scroll at all. */}
          <div className="min-h-0 flex-1 overflow-y-auto p-6">
            {/* Two columns: what the post IS on the left, how it shows
                up in search on the right. Stacked, the dialog would be
                taller than most laptop screens. */}
            <div className="grid gap-5 md:grid-cols-2 md:items-start">
              <div className="flex flex-col gap-5">
                <Panel>
                  {/* The slug mirrors the title until it is touched.
                      `slugValue` is what the field shows: the derived
                      slug while `slugEdited` is false, and whatever was
                      typed once it is true. Typing in it once is what
                      stops it following — otherwise correcting a slug
                      and then fixing a typo in the title would silently
                      throw the correction away. An existing post counts
                      as already edited, since its slug is a published
                      URL and must not start tracking a rename.

                      The placeholder is a bare "slug" for an untitled
                      post, because there is nothing yet to derive one
                      from. */}
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

                <Panel>
                  {/* Shown only once the link is one the site can load,
                      so the preview never promises a cover that would
                      then fail to publish. 21:9, the article's own ratio,
                      so the crop here is the crop on the page. */}
                  {isAllowedImageUrl(coverSrc) && (
                    // eslint-disable-next-line @next/next/no-img-element -- a preview of a URL still being edited; next/image would re-optimise on every change and adds nothing here.
                    <img
                      src={coverSrc}
                      alt=""
                      className="aspect-21/9 w-full rounded-md border border-line-soft bg-surface-2 object-cover"
                    />
                  )}

                  <div className="flex gap-2">
                    <input
                      name="coverSrc"
                      value={coverSrc}
                      onChange={(e) => {
                        setCoverError(null);
                        setCoverSrc(e.target.value);
                      }}
                      placeholder="Cover image — upload or paste a link"
                      aria-label="Cover image URL"
                      className={`${FIELD} min-w-0 flex-1 text-[0.8125rem]`}
                    />
                    <ImageUploadButton
                      onUploaded={(url) => {
                        setCoverError(null);
                        setCoverSrc(url);
                      }}
                      onError={setCoverError}
                    />
                  </div>

                  {coverError && (
                    <p role="alert" className="text-[0.8125rem] text-warning">
                      {coverError}
                    </p>
                  )}
                  <input
                    name="coverAlt"
                    defaultValue={post?.cover?.alt}
                    placeholder="Alt text"
                    aria-label="Cover image alt text"
                    className={FIELD}
                  />
                </Panel>

                {/* Was "Excerpt", which is the word the data model uses;
                    this is the word a person uses. The field name stays
                    `excerpt` so nothing downstream has to change. */}
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
              </div>

              <Panel>
                {/* A live approximation of the result, so the lengths
                    mean something. It is the fallback chain the page
                    actually uses, not a separate one that could drift
                    from it. */}
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

                {/* The counters stay. They are not explanatory copy —
                    they are the one thing on this panel you cannot work
                    out by looking, and they go amber at the length
                    Google starts truncating. */}
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

          <div className="flex justify-end border-t border-line bg-surface px-6 py-3">
            <button
              type="button"
              onClick={closeSettings}
              className="rounded-md bg-accent px-4 py-2 text-[0.875rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Done
            </button>
          </div>
        </div>
      </dialog>
    </form>
  );
}
