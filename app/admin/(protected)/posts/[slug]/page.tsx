import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { PostForm } from "@/components/admin/post-form";
import { getPost } from "@/lib/blog-store";

export async function generateMetadata({
  params,
}: PageProps<"/admin/posts/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  return { title: post ? `Edit ${post.title}` : "Post not found" };
}

export default async function EditPostPage({
  params,
}: PageProps<"/admin/posts/[slug]">) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  return (
    <>
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.022em] text-ink">
        Edit post
      </h1>
      <p className="mt-1 font-mono text-[0.8125rem] text-muted">
        /blog/{post.slug}
      </p>

      {/* Keyed by slug so navigating between two posts rebuilds the
          form and the editor rather than reusing one seeded with the
          previous post's body. */}
      <PostForm key={post.slug} post={post} />
    </>
  );
}
