import type { JSONContent } from "@tiptap/react";

import type { Block } from "@/lib/blog";

/**
 * Converts between the editor's document and the `Block[]` a post
 * stores.
 *
 * The blog body has never been HTML — `BlockView` in the article page
 * renders each block itself, so nothing from the database or the admin
 * is ever injected as markup. That property is worth keeping, so the
 * editor is bent to the model rather than the model to the editor:
 * Tiptap's document goes in and out through here, and anything the
 * model cannot hold is not offered in the toolbar in the first place
 * (see `editor.tsx` — bold, italic, links and ordered lists are all
 * switched off rather than being silently dropped on save).
 *
 * The one convention worth knowing: a blockquote's SECOND paragraph
 * becomes the quote's `cite`. Tiptap's blockquote has nowhere else to
 * put an attribution, and dropping it would quietly destroy the field
 * on every existing post that has one.
 */

/** All the text under a node, marks flattened away. */
function textOf(node: JSONContent | undefined): string {
  if (!node) return "";
  if (node.type === "text") return node.text ?? "";
  return (node.content ?? []).map(textOf).join("");
}

function paragraph(text: string): JSONContent {
  // An empty paragraph must have no `content` key at all — an empty
  // array is invalid in ProseMirror and throws on load.
  return text
    ? { type: "paragraph", content: [{ type: "text", text }] }
    : { type: "paragraph" };
}

export function blocksToDoc(blocks: Block[]): JSONContent {
  const content: JSONContent[] = blocks.map((block) => {
    switch (block.type) {
      case "h2":
        return {
          type: "heading",
          attrs: { level: 2 },
          content: [{ type: "text", text: block.text }],
        };

      case "ul":
        return {
          type: "bulletList",
          content: block.items.map((item) => ({
            type: "listItem",
            content: [paragraph(item)],
          })),
        };

      case "quote":
        return {
          type: "blockquote",
          content: block.cite
            ? [paragraph(block.text), paragraph(block.cite)]
            : [paragraph(block.text)],
        };

      case "code":
        return {
          type: "codeBlock",
          content: block.text ? [{ type: "text", text: block.text }] : [],
        };

      default:
        return paragraph(block.text);
    }
  });

  // ProseMirror will not load a doc with no content.
  return { type: "doc", content: content.length ? content : [paragraph("")] };
}

export function docToBlocks(doc: JSONContent): Block[] {
  const blocks: Block[] = [];

  for (const node of doc.content ?? []) {
    switch (node.type) {
      case "heading":
        blocks.push({ type: "h2", text: textOf(node) });
        break;

      case "bulletList": {
        const items = (node.content ?? [])
          .map(textOf)
          .map((t) => t.trim())
          .filter(Boolean);
        if (items.length) blocks.push({ type: "ul", items });
        break;
      }

      case "blockquote": {
        const paras = (node.content ?? []).map(textOf).map((t) => t.trim());
        const [text, cite] = [paras[0] ?? "", paras[1]];
        if (text) blocks.push({ type: "quote", text, ...(cite ? { cite } : {}) });
        break;
      }

      case "codeBlock":
        blocks.push({ type: "code", text: textOf(node) });
        break;

      default: {
        // Blank paragraphs are the writer's spacing, not content. The
        // renderer already spaces blocks, so keeping them would double
        // the gaps on the published page.
        const text = textOf(node).trim();
        if (text) blocks.push({ type: "p", text });
      }
    }
  }

  return blocks;
}
