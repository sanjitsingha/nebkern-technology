import type { Metadata } from "next";

import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  return (
    <>
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.022em] text-ink">
        New post
      </h1>
      <PostForm />
    </>
  );
}
