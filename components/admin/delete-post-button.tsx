"use client";

import { deletePostAction } from "@/app/admin/actions";

/**
 * Delete, behind a confirm.
 *
 * A client component purely for that confirm — the deletion itself is a
 * Server Action on a real form, so it still works if the dialog is
 * suppressed, and the action re-checks the session regardless.
 */
export function DeletePostButton({
  slug,
  title,
}: {
  slug: string;
  title: string;
}) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!confirm(`Delete “${title}”? This cannot be undone.`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="rounded-md border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-muted transition-colors hover:border-warning hover:text-warning"
      >
        Delete
      </button>
    </form>
  );
}
