"use client";

import { EditorContent, useEditor, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { useEffect } from "react";

import type { Block } from "@/lib/blog";
import { blocksToDoc, docToBlocks } from "@/lib/blog-blocks";

/**
 * The post body editor.
 *
 * Every extension the `Block` model cannot store is switched OFF rather
 * than left on and dropped at save time. A writer who bolds a sentence,
 * saves, and finds it plain has been lied to by the toolbar; a writer
 * who has no bold button knows where they stand. So: no bold, italic,
 * strike, underline, inline code, links, ordered lists or horizontal
 * rules, and headings are level 2 only — the article page styles h2 and
 * the h1 is the post's title.
 *
 * The parent owns the value. This component reports `Block[]` upward on
 * every change and never re-seeds itself from props, because feeding an
 * editor its own output on each keystroke fights the cursor.
 */
export function BodyEditor({
  value,
  onChange,
}: {
  value: Block[];
  onChange: (blocks: Block[]) => void;
}) {
  const editor = useEditor({
    // Tiptap renders on the client only; without this Next warns about
    // the editor's DOM not matching the server's.
    immediatelyRender: false,
    extensions: [
      StarterKit.configure({
        heading: { levels: [2] },
        bold: false,
        italic: false,
        strike: false,
        underline: false,
        code: false,
        link: false,
        orderedList: false,
        horizontalRule: false,
        hardBreak: false,
      }),
    ],
    content: blocksToDoc(value),
    editorProps: {
      attributes: {
        class:
          "admin-prose min-h-[26rem] w-full px-4 py-4 outline-none focus:outline-none",
      },
    },
    onUpdate: ({ editor }) => onChange(docToBlocks(editor.getJSON())),
  });

  // The editor holds a live ProseMirror view and DOM listeners; leaving
  // it behind on unmount leaks both.
  useEffect(() => () => editor?.destroy(), [editor]);

  if (!editor) {
    // Reserves the editor's height so the form does not jump when the
    // client bundle lands.
    return (
      <div className="min-h-[30rem] rounded-md border border-line bg-surface" />
    );
  }

  return (
    <div className="overflow-hidden rounded-md border border-line bg-surface focus-within:border-accent">
      <Toolbar editor={editor} />
      <EditorContent editor={editor} />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      // Without this a click inside the toolbar blurs the editor first,
      // and the command then runs against a lost selection.
      onMouseDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-pressed={active}
      className={`rounded px-2.5 py-1.5 text-[0.8125rem] font-medium transition-colors ${
        active
          ? "bg-accent text-accent-fg"
          : "text-muted hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function Toolbar({ editor }: { editor: Editor }) {
  return (
    <div className="flex flex-wrap items-center gap-1 border-b border-line-soft bg-surface-2 px-2 py-2">
      <ToolbarButton
        active={editor.isActive("paragraph")}
        onClick={() => editor.chain().focus().setParagraph().run()}
      >
        Text
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("heading", { level: 2 })}
        onClick={() =>
          editor.chain().focus().toggleHeading({ level: 2 }).run()
        }
      >
        Heading
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("bulletList")}
        onClick={() => editor.chain().focus().toggleBulletList().run()}
      >
        List
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("blockquote")}
        onClick={() => editor.chain().focus().toggleBlockquote().run()}
      >
        Quote
      </ToolbarButton>
      <ToolbarButton
        active={editor.isActive("codeBlock")}
        onClick={() => editor.chain().focus().toggleCodeBlock().run()}
      >
        Code
      </ToolbarButton>

      <span className="ml-auto pr-1 text-[0.75rem] text-muted">
        A quote&rsquo;s second paragraph becomes its attribution
      </span>
    </div>
  );
}
