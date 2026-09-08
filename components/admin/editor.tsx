"use client";

import { useEffect, useRef } from "react";

import type { Block } from "@/lib/blog";
import { blocksToDelta, deltaToBlocks, type Delta } from "@/lib/blog-blocks";

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
 * finds it plain has been lied to by the toolbar. So there is no
 * colour, size, alignment, image or video: the article renders in one
 * column in the site's own type, and offering control over any of that
 * would be offering control the published page ignores.
 *
 * Nothing here ever becomes HTML. Quill will hand back markup if asked;
 * this reads `getContents()` instead, which is a Delta — data — and
 * `lib/blog-blocks.ts` turns it into blocks the article renders itself.
 */

/**
 * Toolbar layout. Each inner array is a group, and Quill draws a
 * separator between groups.
 *
 * `header` and `font` are Quill's own dropdowns, which is most of why
 * this reads like the editors people expect. There is no Heading 1: the
 * article page already renders the post's TITLE as its `h1`, so one in
 * the body would put two on a page and break the outline a screen
 * reader navigates by.
 */
const TOOLBAR = [
  [{ header: [2, 3, false] }],
  [{ font: ["", "serif", "mono"] }],
  ["bold", "italic", "strike", "code"],
  ["link"],
  [{ list: "ordered" }, { list: "bullet" }],
  ["blockquote", "code-block", "divider"],
  ["clean"],
];

export function BodyEditor({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const host = useRef<HTMLDivElement>(null);

  // The callback and the seed value are held in refs so the effect that
  // builds Quill can run exactly once. A dependency on either would
  // rebuild the editor on every keystroke, destroying the selection and
  // the undo history with it.
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;
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
          toolbar: {
            container: TOOLBAR,
            handlers: {
              divider(this: { quill: InstanceType<typeof Quill> }) {
                const range = this.quill.getSelection(true);
                this.quill.insertEmbed(range.index, "divider", true, "user");
                this.quill.setSelection(range.index + 1, 0, "silent");
              },
            },
          },
        },
      });

      // `silent`, so seeding the editor does not register as an edit
      // and does not fire the change handler back at the form.
      editor.setContents(blocksToDelta(initial.current) as never, "silent");

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
      // Quill appends its own DOM to the host and offers no destroy();
      // clearing it is what stops a second toolbar and editor stacking
      // under the first when this remounts.
      container.innerHTML = "";
    };
  }, []);

  return (
    // `quill-host` scopes the theme overrides in globals.css. The border
    // sits on this wrapper rather than on Quill's own containers, so the
    // toolbar and the writing area read as one control.
    <div className="quill-host overflow-hidden rounded-md border border-line bg-surface focus-within:border-accent">
      <div ref={host} />
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

  // Quill has no horizontal rule. The article renders one and the block
  // model stores one, so without this a post containing a divider would
  // lose it the first time anyone opened it in the editor.
  const BlockEmbed = Quill.import("blots/block/embed") as new () => object;

  class Divider extends BlockEmbed {}
  (Divider as unknown as { blotName: string }).blotName = "divider";
  (Divider as unknown as { tagName: string }).tagName = "hr";

  Quill.register(Divider as never, true);
}
