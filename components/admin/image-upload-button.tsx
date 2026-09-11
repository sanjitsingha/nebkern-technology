"use client";

import { StorageClient } from "@supabase/storage-js";
import { useRef, useState } from "react";

import { createImageUploadAction } from "@/app/admin/actions";
import {
  BLOG_IMAGE_BUCKET,
  IMAGE_ACCEPT,
  IMAGE_TYPES,
  MAX_IMAGE_BYTES,
} from "@/lib/media";

/**
 * An "Upload" button that puts one image into the blog's Storage bucket
 * and reports its public URL.
 *
 * Two steps, and the split is the point. The server action checks the
 * admin session and mints a signed upload URL with the secret key; the
 * browser then sends the file straight to Storage using only that URL's
 * token. The secret key never reaches the browser, and the file never
 * passes through our server.
 *
 * The browser's own client carries the PUBLISHABLE key, which on its own
 * can do nothing to this bucket — no upload, overwrite, delete or list.
 * The token is what authorises this one upload to this one path.
 *
 * `type="button"` matters: this renders inside the post's <form>, and a
 * bare <button> there would submit it — publishing the post.
 */
export function ImageUploadButton({
  onUploaded,
  onError,
}: {
  /** Called with the image's public URL once it is stored. */
  onUploaded: (url: string) => void;
  /** Called with a message to show, or null to clear an earlier one. */
  onError: (message: string | null) => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  async function upload(file: File) {
    onError(null);

    // Checked here only to fail before any round trip. The bucket
    // enforces the same rules on the real bytes.
    if (!(file.type in IMAGE_TYPES)) {
      return onError("Use a JPG, PNG, WebP, AVIF or GIF image.");
    }
    if (file.size > MAX_IMAGE_BYTES) {
      return onError(
        `That image is ${(file.size / 1024 / 1024).toFixed(1)} MB; the limit is ${MAX_IMAGE_BYTES / 1024 / 1024} MB.`,
      );
    }

    setBusy(true);
    try {
      const ticket = await createImageUploadAction({
        type: file.type,
        size: file.size,
      });
      if ("error" in ticket) return onError(ticket.error);

      const { error } = await browserStorage()
        .from(BLOG_IMAGE_BUCKET)
        .uploadToSignedUrl(ticket.path, ticket.token, file, {
          contentType: file.type,
        });
      if (error) return onError(`Upload failed: ${error.message}`);

      onUploaded(ticket.url);
    } catch (error) {
      onError(
        `Upload failed: ${error instanceof Error ? error.message : "unknown error"}`,
      );
    } finally {
      setBusy(false);
      // Cleared so choosing the same file again still fires `change`.
      if (input.current) input.current.value = "";
    }
  }

  return (
    <>
      <button
        type="button"
        onClick={() => input.current?.click()}
        disabled={busy}
        className="shrink-0 rounded-md border border-line bg-surface px-3 py-2 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink/25 disabled:opacity-60"
      >
        {busy ? "Uploading…" : "Upload"}
      </button>

      {/* No `name`, so the file itself is never part of the post's form
          submission — only the URL it produces is. */}
      <input
        ref={input}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) void upload(file);
        }}
      />
    </>
  );
}

/**
 * A Storage client for the browser, authenticated only by the publishable
 * key. Both values are `NEXT_PUBLIC_`, so Next inlines them at build time.
 * Made per upload rather than at module scope: uploads are rare, and a
 * module-level client would be built on every admin page load for nothing.
 */
function browserStorage(): StorageClient {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) {
    throw new Error("Supabase is not configured for this build.");
  }
  return new StorageClient(`${url.replace(/\/+$/, "")}/storage/v1`, {
    apikey: key,
    Authorization: `Bearer ${key}`,
  });
}
