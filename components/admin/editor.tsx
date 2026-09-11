"use client";

import { useEffect, useRef, useState } from "react";

import { ImageUploadButton } from "@/components/admin/image-upload-button";
import type { Block } from "@/lib/blog";
import { blocksToDelta, deltaToBlocks, type Delta } from "@/lib/blog-blocks";
import { IMAGE_URL_RULE, isAllowedImageUrl } from "@/lib/media";

/**
 * The post body editor, on Quill.
 *
 * Quill is a plain DOM library, so it is driven through a ref rather
 * than a React wrapper — `react-quill` is unmaintained and conflicts on
 * peer dependencies with React 19, and there is nothing in it this file
 * needs.
 *
 * Every control maps to something `Block[]` can actually store, and
 * anything it cannot is left OUT of the toolbar rather than offered and
 * dropped at save time. A writer who colours a sentence, saves, and
 * finds it plain has been lied to by the toolbar. So there is still no
 * colour, size or alignment: the article renders in one column in the
 * site's own type, and offering control over any of that would be
 * offering control the published page ignores.
 *
 * Nothing here ever becomes HTML. Quill will hand back markup if asked;
 * this reads `getContents()` instead, which is a Delta — data — and
 * `lib/blog-blocks.ts` turns it into blocks the article renders itself.
 */

/**
 * Toolbar layout. Each inner array is a group, and Quill draws a
 * separator between groups.
 *
 * There is no Heading 1: the article page already renders the post's
 * TITLE as its `h1`, so one in the body would put two on a page and
 * break the outline a screen reader navigates by.
 */
const TOOLBAR = [
  [{ header: [2, 3, false] }],
  [{ font: ["", "serif", "mono"] }],
  ["bold", "italic", "underline", "strike", "code"],
  ["link"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block"],
  ["image", "divider"],
  ["undo", "redo", "clean"],
  // A group of its own, so Quill's separator sets it apart: every other
  // control here acts on the selection, and this one acts on the post.
  ["settings"],
];

type ImageDraft = { src: string; alt: string; caption: string };

const EMPTY_DRAFT: ImageDraft = { src: "", alt: "", caption: "" };

export function BodyEditor({
  value,
  onChange,
  onSettings,
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
  /** Opens the post's settings. The button lives in Quill's toolbar,
   *  but the fields it opens belong to the form around this editor, so
   *  the editor only reports the click. Required rather than optional:
   *  a settings button that does nothing when pressed is worse than no
   *  button. */
  onSettings: () => void;
}) {
  const host = useRef<HTMLDivElement>(null);
  const quill = useRef<InstanceType<typeof import("quill").default> | null>(
    null,
  );

  // Where the caret was when the image button was pressed. Focus moves
  // to the panel's inputs the moment it opens, and Quill forgets the
  // selection — without this the image would always land at position 0.
  const savedRange = useRef<number | null>(null);

  const [draft, setDraft] = useState<ImageDraft | null>(null);
  const [imageError, setImageError] = useState<string | null>(null);

  // The callbacks and the seed value are held in refs so the effect that
  // builds Quill can run exactly once. A dependency on any of them would
  // rebuild the editor on every keystroke, destroying the selection and
  // the undo history with it.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
  const onSettingsRef = useRef(onSettings);
  onSettingsRef.current = onSettings;
  const initial = useRef(value);

  useEffect(() => {
    const container = host.current;
    if (!container) return;

    let detach: (() => void) | null = null;
    let cancelled = false;

    // Imported here rather than at module scope: Quill touches
    // `document` as it loads, which throws during the server render.
    void (async () => {
      const { default: Quill } = await import("quill");
      if (cancelled) return;

      registerFormats(Quill);

      const editor = new Quill(container, {
        theme: "snow",
        placeholder: "Write the post…",
        modules: {
          // Quill's history defaults to a 1000ms coalescing window,
          // which bundles a whole sentence into one undo step. 500ms
          // undoes closer to a phrase at a time, which is what a writer
          // expects from ctrl+Z.
          history: { delay: 500, maxStack: 200, userOnly: true },
          toolbar: {
            container: TOOLBAR,
            handlers: {
              divider(this: { quill: InstanceType<typeof Quill> }) {
                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, "divider", true, "user");
                this.quill.setSelection(range.index + 1, 0, "silent");
              },
              // Overrides Quill's own image handler, which opens a file
              // picker and inlines the file as a base64 data URL. That
              // would write megabytes of image into the post JSON and
              // into every page that loads it. Images live in Supabase
              // Storage instead: this opens a panel that uploads one
              // there (or takes a link) and stores only its URL.
              image(this: { quill: InstanceType<typeof Quill> }) {
                savedRange.current = this.quill.getSelection(true)?.index ?? 0;
                setImageError(null);
                setDraft(EMPTY_DRAFT);
              },
              undo(this: { quill: InstanceType<typeof Quill> }) {
                this.quill.history.undo();
              },
              redo(this: { quill: InstanceType<typeof Quill> }) {
                this.quill.history.redo();
              },
              settings() {
                onSettingsRef.current();
              },
            },
          },
        },
      });

      quill.current = editor;

      // Quill labels each toolbar button with its bare format name, so
      // this one would be announced as "settings" and show no tooltip.
      // `aria-haspopup` tells a screen reader it opens a dialog rather
      // than applying something to the selection, which is what every
      // other button in the row does.
      const toolbar = editor.getModule("toolbar") as
        { container: HTMLElement } | undefined;
      const settingsButton =
        toolbar?.container.querySelector("button.ql-settings");
      settingsButton?.setAttribute("aria-label", "Post settings");
      settingsButton?.setAttribute("title", "Post settings");
      settingsButton?.setAttribute("aria-haspopup", "dialog");

      // `silent`, so seeding the editor does not register as an edit
      // and does not fire the change handler back at the form.
      editor.setContents(blocksToDelta(initial.current) as never, "silent");
      // Seeding also fills the undo stack with the seed itself, so the
      // first ctrl+Z would wipe the post back to empty.
      editor.history.clear();

      const handler = () =>
        onChangeRef.current(
          deltaToBlocks(editor.getContents() as unknown as Delta),
        );

      editor.on("text-change", handler);
      detach = () => editor.off("text-change", handler);
    })();

    return () => {
      cancelled = true;
      detach?.();
      quill.current = null;
      // Quill appends its own DOM to the host and offers no destroy();
      // clearing it is what stops a second toolbar and editor stacking
      // under the first when this remounts.
      container.innerHTML = "";
    };
  }, []);

  const insertImage = () => {
    const editor = quill.current;
    if (!editor || !draft) return;

    const src = draft.src.trim();
    const alt = draft.alt.trim();

    if (!src) return setImageError("Upload an image, or paste its link.");
    // The same check the save action runs on the server, so an image
    // accepted here is one the published page is able to load.
    if (!isAllowedImageUrl(src)) return setImageError(`${IMAGE_URL_RULE}.`);
    // Required, not encouraged. An image with no description is the
    // commonest accessibility failure in a CMS, and it happens whenever
    // the field is skippable.
    if (!alt) return setImageError("Describe the image for screen readers.");

    const at = savedRange.current ?? editor.getLength();
    const caption = draft.caption.trim();
    editor.insertEmbed(
      at,
      "image",
      { src, alt, ...(caption ? { caption } : {}) },
      "user",
    );
    editor.setSelection(at + 1, 0, "silent");

    setDraft(null);
    setImageError(null);
  };

  const field =
    "w-full rounded-md border border-line bg-surface px-3 py-2 text-[0.875rem] text-ink outline-none placeholder:text-muted focus:border-accent";

  return (
    // `quill-host` scopes the theme overrides in globals.css.
    //
    // No border and no background on this wrapper any more. It used to
    // box the toolbar and the writing area together as one control;
    // now the toolbar carries its own border and the writing area has
    // none, so the text sits directly on the page the way the title
    // above it does. `overflow-hidden` and `rounded-md` went with the
    // border — there is no longer a corner to clip anything against.
    <div className="quill-host">
      <div ref={host} />

      {draft && (
        <div
          className="border-t border-line bg-surface-2 p-4"
          // This panel sits inside the post's <form>, so Enter in any of
          // its fields would do what Enter does in a form: submit it with
          // the first submit button — Publish. Here Enter means "insert".
          // An IME mid-composition keeps Enter for confirming characters.
          onKeyDown={(e) => {
            if (
              e.key === "Enter" &&
              !e.nativeEvent.isComposing &&
              e.target instanceof HTMLInputElement
            ) {
              e.preventDefault();
              insertImage();
            }
          }}
        >
          <p className="text-[0.8125rem] font-medium text-ink">Insert image</p>

          {/* Only once the link is one the site can load, so the preview
              never shows a picture that would then fail to publish. */}
          {isAllowedImageUrl(draft.src) && (
            // eslint-disable-next-line @next/next/no-img-element -- a preview of a URL still being edited; next/image would re-optimise on every change and adds nothing here.
            <img
              src={draft.src}
              alt=""
              className="mt-3 max-h-48 rounded-md border border-line-soft bg-surface object-contain"
            />
          )}

          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {/* Upload or paste. An upload writes the stored file's URL
                into this same field, so there is one value and one check
                however the image arrived. */}
            <div className="flex gap-2 sm:col-span-3">
              <input
                autoFocus
                value={draft.src}
                onChange={(e) => setDraft({ ...draft, src: e.target.value })}
                placeholder="Image link — or upload one"
                aria-label="Image link"
                className={`${field} min-w-0 flex-1`}
              />
              <ImageUploadButton
                onUploaded={(url) => {
                  setImageError(null);
                  setDraft((d) => (d ? { ...d, src: url } : d));
                }}
                onError={setImageError}
              />
            </div>
            <input
              value={draft.alt}
              onChange={(e) => setDraft({ ...draft, alt: e.target.value })}
              placeholder="Alt text — what the picture shows"
              className={`${field} sm:col-span-2`}
            />
            <input
              value={draft.caption}
              onChange={(e) => setDraft({ ...draft, caption: e.target.value })}
              placeholder="Caption (optional)"
              className={field}
            />
          </div>

          {imageError && (
            <p role="alert" className="mt-2 text-[0.8125rem] text-warning">
              {imageError}
            </p>
          )}

          <div className="mt-3 flex gap-2">
            <button
              type="button"
              onClick={insertImage}
              className="rounded-md bg-accent px-3 py-1.5 text-[0.8125rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover"
            >
              Insert
            </button>
            <button
              type="button"
              onClick={() => {
                setDraft(null);
                setImageError(null);
              }}
              className="rounded-md border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink/25"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

/**
 * One-time registration of what Quill does not ship.
 *
 * Guarded because this module is imported once but the editor mounts
 * many times, and Quill warns loudly when a format is overwritten.
 */
let registered = false;

function registerFormats(Quill: typeof import("quill").default) {
  if (registered) return;
  registered = true;

  // A closed font list. Quill's Font attributor writes a CLASS —
  // `ql-font-serif` — rather than an inline style, which is what keeps
  // an arbitrary family out of the document even when one is pasted in.
  const Font = Quill.import("formats/font") as { whitelist: string[] };
  Font.whitelist = ["serif", "mono"];
  Quill.register(Font as never, true);

  // Toolbar buttons Quill has no icon for. Without these the buttons
  // render as empty squares.
  const icons = Quill.import("ui/icons") as Record<string, string>;
  icons.undo = `<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M5 7H11a3.5 3.5 0 0 1 0 7H8"/><path class="ql-stroke" d="M7.5 4.5 4.5 7l3 2.5"/></svg>`;
  icons.redo = `<svg viewBox="0 0 18 18"><path class="ql-stroke" d="M13 7H7a3.5 3.5 0 0 0 0 7h3"/><path class="ql-stroke" d="M10.5 4.5 13.5 7l-3 2.5"/></svg>`;
  // A gear, drawn on a 24-unit grid because the teeth do not survive
  // being drawn at 18. The button scales it down to Quill's 18, which
  // would thin the stroke to match; the inline width puts it back in
  // line with its neighbours. Inline because snow's `.ql-stroke` rule
  // sets the width in CSS, and CSS beats a presentation attribute.
  icons.settings = `<svg viewBox="0 0 24 24"><path class="ql-stroke" style="stroke-width:2.5" d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle class="ql-stroke" style="stroke-width:2.5" cx="12" cy="12" r="3"/></svg>`;

  const BlockEmbed = Quill.import("blots/block/embed") as new () => object;

  // Quill has no horizontal rule. The article renders one and the block
  // model stores one, so without this a post containing a divider would
  // lose it the first time anyone opened it in the editor.
  class Divider extends BlockEmbed {}
  (Divider as unknown as { blotName: string }).blotName = "divider";
  (Divider as unknown as { tagName: string }).tagName = "hr";
  Quill.register(Divider as never, true);

  /**
   * Replaces Quill's built-in image format.
   *
   * Its version stores a bare `src` string and has nowhere to put alt
   * text or a caption, both of which the block model carries. This one
   * round-trips the whole record through data attributes.
   *
   * `create` accepts a plain string too: an image pasted from elsewhere
   * arrives through Quill's clipboard as a bare src, and without this it
   * would throw rather than paste.
   */
  class ImageBlot extends BlockEmbed {
    static create(
      value: string | { src: string; alt?: string; caption?: string },
    ) {
      const node = (
        BlockEmbed as unknown as { create: (v?: unknown) => HTMLElement }
      ).create.call(this) as HTMLElement;

      const record = typeof value === "string" ? { src: value } : value;
      node.setAttribute("src", record.src ?? "");
      node.setAttribute("alt", record.alt ?? "");
      if (record.caption) node.setAttribute("data-caption", record.caption);
      return node;
    }

    static value(node: HTMLElement) {
      const caption = node.getAttribute("data-caption");
      return {
        src: node.getAttribute("src") ?? "",
        alt: node.getAttribute("alt") ?? "",
        ...(caption ? { caption } : {}),
      };
    }
  }
  (ImageBlot as unknown as { blotName: string }).blotName = "image";
  (ImageBlot as unknown as { tagName: string }).tagName = "img";
  Quill.register(ImageBlot as never, true);
}
