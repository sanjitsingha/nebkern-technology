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

  // Outside `(shell)`, like the new-post page: the form carries the top
  // bar. The "Edit post" heading and the slug line that used to sit here
  // are gone with it — the title field states the title, and the slug
  // has its own field in the rail.
  return (
    <main>
      <h1 className="sr-only">Edit {post.title}</h1>

      {/* Keyed by slug so navigating between two posts rebuilds the
          form and the editor rather than reusing one seeded with the
          previous post's body. */}
      <PostForm key={post.slug} post={post} />
    </main>
  );
}
