import { isFontKey, type Block, type Span } from "@/lib/blog";

/**
 * Converts between Quill's Delta and the `Block[]` a post stores.
 *
 * The blog body has never been HTML — `BlockView` in the article page
 * renders each block itself, so nothing from the database or the admin
 * is ever injected as markup. Quill can hand back HTML and that is
 * exactly what is NOT used here: `getContents()` gives a Delta, and a
 * Delta is data, so the property survives the change of editor.
 *
 * The shape of a Delta is worth knowing before reading this file. It is
 * a flat list of inserts, and the LINE format lives on the newline that
 * ends the line, not on the text before it:
 *
 *   { insert: "Hello " }
 *   { insert: "world", attributes: { bold: true } }
 *   { insert: "\n" }                                  <- ends a paragraph
 *   { insert: "A heading" }
 *   { insert: "\n", attributes: { header: 2 } }        <- ends an h2
 *
 * So the work is done in two passes: cut the ops into lines, then group
 * runs of lines into blocks. Lists, quotes and code blocks are all
 * "consecutive lines sharing a line format" in Delta, and single blocks
 * here.
 *
 * The one convention worth knowing: a quote's SECOND line becomes its
 * `cite`. Delta has nowhere else to put an attribution, and dropping it
 * would quietly destroy the field on every post that has one.
 */

/** A minimal structural type. Deliberately not Quill's own: this module
 *  is pure data-in, data-out, and importing the editor here would drag
 *  a browser library into anything that converts a post. */
export type DeltaOp = {
  insert?: string | Record<string, unknown>;
  attributes?: Record<string, unknown>;
};

export type Delta = { ops: DeltaOp[] };

/** Delta attribute names for the marks a `Span` can carry. Only these
 *  are read; anything else pasted in is dropped rather than stored. */
const MARKS = [
  ["bold", "bold"],
  ["italic", "italic"],
  ["strike", "strike"],
  ["code", "code"],
] as const;

type Line = { spans: Span[]; attrs: Record<string, unknown> };

function spanFrom(text: string, attrs: Record<string, unknown> = {}): Span {
  const span: Span = { text };

  for (const [delta, key] of MARKS) if (attrs[delta]) span[key] = true;
  if (typeof attrs.link === "string") span.href = attrs.link;
  if (isFontKey(attrs.font)) span.font = attrs.font;

  return span;
}

/** Adjacent runs with identical formatting are one run. Quill splits
 *  text ops for reasons of its own; leaving them split would bloat the
 *  stored JSON and produce needless `<strong>` boundaries. */
function merge(spans: Span[]): Span[] {
  return spans.reduce<Span[]>((acc, span) => {
    const prev = acc[acc.length - 1];
    if (
      prev &&
      prev.bold === span.bold &&
      prev.italic === span.italic &&
      prev.strike === span.strike &&
      prev.code === span.code &&
      prev.href === span.href &&
      prev.font === span.font
    ) {
      prev.text += span.text;
      return acc;
    }
    acc.push({ ...span });
    return acc;
  }, []);
}

/** Pass one: ops become lines, each carrying the line format from the
 *  newline that closed it. */
function toLines(delta: Delta): Line[] {
  const lines: Line[] = [];
  let spans: Span[] = [];

  for (const op of delta.ops ?? []) {
    // An embed — the divider is the only one registered. It is its own
    // line, so anything buffered is flushed first.
    if (typeof op.insert === "object" && op.insert !== null) {
      if (spans.length) lines.push({ spans: merge(spans), attrs: {} });
      spans = [];
      if ("divider" in op.insert) lines.push({ spans: [], attrs: { hr: true } });
      continue;
    }

    if (typeof op.insert !== "string") continue;

    // A single insert can hold several newlines, and each one closes a
    // line with this op's attributes.
    const parts = op.insert.split("\n");
    parts.forEach((part, i) => {
      if (part) spans.push(spanFrom(part, op.attributes));
      if (i < parts.length - 1) {
        lines.push({ spans: merge(spans), attrs: op.attributes ?? {} });
        spans = [];
      }
    });
  }

  // Quill always ends with a newline, so a leftover here means text with
  // no closing line — keep it rather than lose the last thing typed.
  if (spans.length) lines.push({ spans: merge(spans), attrs: {} });

  return lines;
}

const hasText = (spans: Span[]) => spans.some((s) => s.text.trim());

/** Pass two: runs of lines sharing a format become one block. */
export function deltaToBlocks(delta: Delta): Block[] {
  const lines = toLines(delta);
  const blocks: Block[] = [];
  let i = 0;

  while (i < lines.length) {
    const { spans, attrs } = lines[i];

    if (attrs.hr) {
      blocks.push({ type: "hr" });
      i += 1;
      continue;
    }

    // Lists: consecutive lines of the same kind are one block.
    if (attrs.list === "bullet" || attrs.list === "ordered") {
      const kind = attrs.list;
      const items: Span[][] = [];
      while (i < lines.length && lines[i].attrs.list === kind) {
        if (hasText(lines[i].spans)) items.push(lines[i].spans);
        i += 1;
      }
      if (items.length) {
        blocks.push({ type: kind === "ordered" ? "ol" : "ul", items });
      }
      continue;
    }

    // Code: consecutive lines are one block, newlines preserved. Marks
    // are discarded — formatting inside code is meaningless, and the
    // editor does not offer it.
    if (attrs["code-block"]) {
      const rows: string[] = [];
      while (i < lines.length && lines[i].attrs["code-block"]) {
        rows.push(lines[i].spans.map((s) => s.text).join(""));
        i += 1;
      }
      blocks.push({ type: "code", text: rows.join("\n") });
      continue;
    }

    // Quote: first line is the quote, an immediately following one is
    // the attribution. A third would have nowhere to go, so it is left
    // to start a new quote rather than being silently merged.
    if (attrs.blockquote) {
      const quote = lines[i].spans;
      i += 1;
      let cite: string | undefined;
      if (i < lines.length && lines[i].attrs.blockquote) {
        const text = lines[i].spans.map((s) => s.text).join("").trim();
        if (text) cite = text;
        i += 1;
      }
      if (hasText(quote)) {
        blocks.push({ type: "quote", spans: quote, ...(cite ? { cite } : {}) });
      }
      continue;
    }

    i += 1;

    if (!hasText(spans)) continue; // blank line: the writer's spacing

    if (attrs.header === 2 || attrs.header === 3) {
      blocks.push({ type: attrs.header === 2 ? "h2" : "h3", spans });
      continue;
    }

    blocks.push({ type: "p", spans });
  }

  return blocks;
}

function opsFor(spans: Span[]): DeltaOp[] {
  return spans
    .filter((span) => span.text.length > 0)
    .map((span) => {
      const attributes: Record<string, unknown> = {};
      for (const [delta, key] of MARKS) if (span[key]) attributes[delta] = true;
      if (span.href) attributes.link = span.href;
      if (span.font) attributes.font = span.font;

      return {
        insert: span.text,
        ...(Object.keys(attributes).length ? { attributes } : {}),
      };
    });
}

/** Closes a line. `attributes` is what Quill reads to decide the line's
 *  format, so this is where a block type is actually expressed. */
function newline(attributes?: Record<string, unknown>): DeltaOp {
  return { insert: "\n", ...(attributes ? { attributes } : {}) };
}

export function blocksToDelta(blocks: Block[]): Delta {
  const ops: DeltaOp[] = [];

  for (const block of blocks) {
    switch (block.type) {
      case "h2":
      case "h3":
        ops.push(...opsFor(block.spans));
        ops.push(newline({ header: block.type === "h2" ? 2 : 3 }));
        break;

      case "ul":
      case "ol":
        for (const item of block.items) {
          ops.push(...opsFor(item));
          ops.push(newline({ list: block.type === "ol" ? "ordered" : "bullet" }));
        }
        break;

      case "quote":
        ops.push(...opsFor(block.spans));
        ops.push(newline({ blockquote: true }));
        if (block.cite) {
          ops.push({ insert: block.cite });
          ops.push(newline({ blockquote: true }));
        }
        break;

      case "code":
        // One Delta line per source line: Quill models a code block as
        // consecutive lines, not as one string with newlines in it.
        for (const row of block.text.split("\n")) {
          if (row) ops.push({ insert: row });
          ops.push(newline({ "code-block": true }));
        }
        break;

      case "hr":
        ops.push({ insert: { divider: true } });
        break;

      default:
        ops.push(...opsFor(block.spans));
        ops.push(newline());
    }
  }

  // Quill requires the document to end in a newline.
  const last = ops[ops.length - 1];
  if (!last || last.insert !== "\n") ops.push(newline());

  return { ops };
}
