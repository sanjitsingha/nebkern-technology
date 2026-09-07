"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkCredentials,
  createSession,
  destroySession,
  hasValidSession,
} from "@/lib/admin-auth";
import type { Block, Post } from "@/lib/blog";
import {
  createPost,
  deletePost,
  readMinutes,
  slugify,
  updatePost,
} from "@/lib/blog-store";

/** What `useActionState` carries back to the form. `null` is the
 *  untouched state; a string is the message to show above the fields. */
export type FormState = { error: string } | null;

/**
 * Every mutating action re-checks the session itself.
 *
 * A Server Action is a public HTTP endpoint with a generated name — it
 * is not protected by the fact that the page rendering its form was.
 * `proxy.ts` does not cover it either, so guarding only the pages would
 * leave the writes open to anyone who found the endpoint.
 */
async function requireSession() {
  if (!(await hasValidSession())) redirect("/admin/login");
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const username = String(formData.get("username") ?? "");
  const password = String(formData.get("password") ?? "");
  const next = String(formData.get("next") ?? "/admin/posts");

  if (!checkCredentials(username, password)) {
    // One message for both cases: saying which half was wrong tells an
    // attacker when they have found a real username.
    return { error: "That username and password do not match." };
  }

  await createSession();
  // Only same-origin paths, so a crafted `?next=https://…` cannot turn
  // the login form into an open redirect.
  redirect(next.startsWith("/admin") ? next : "/admin/posts");
}

export async function logoutAction() {
  await destroySession();
  redirect("/admin/login");
}

/** Pull a post out of the form. The body arrives as JSON because the
 *  editor's value is structured, and a form field is a string. */
function postFromForm(formData: FormData): Post {
  const title = String(formData.get("title") ?? "").trim();
  const body = JSON.parse(String(formData.get("body") ?? "[]")) as Block[];
  const coverSrc = String(formData.get("coverSrc") ?? "").trim();

  const post: Post = {
    slug: slugify(String(formData.get("slug") ?? "") || title),
    title,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    date: String(formData.get("date") ?? "").trim(),
    tag: String(formData.get("tag") ?? "").trim(),
    author: {
      name: String(formData.get("authorName") ?? "").trim(),
      role: String(formData.get("authorRole") ?? "").trim(),
    },
    body,
    // Derived, never typed. A hand-entered read time is one more thing
    // to forget when a post is edited.
    readMinutes: readMinutes({ body }),
  };

  if (coverSrc) {
    post.cover = {
      src: coverSrc,
      alt: String(formData.get("coverAlt") ?? "").trim(),
    };
  }

  return post;
}

export async function savePostAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  await requireSession();

  const post = postFromForm(formData);
  // Empty on create; the slug being edited on update.
  const originalSlug = String(formData.get("originalSlug") ?? "");

  if (!post.title) return { error: "A post needs a title." };
  if (!post.slug) return { error: "That title does not make a usable URL." };
  if (!post.date) return { error: "A post needs a date." };
  if (!post.body.length) return { error: "A post needs a body." };

  try {
    if (originalSlug) {
      await updatePost(originalSlug, post);
    } else {
      await createPost(post);
    }
  } catch (error) {
    // Duplicate slug, missing row, or a read-only filesystem. The store
    // writes messages meant to be read by a person, so they are shown
    // as-is rather than replaced with something vaguer.
    return {
      error: error instanceof Error ? error.message : "Could not save.",
    };
  }

  revalidateBlog(originalSlug || post.slug, post.slug);
  redirect("/admin/posts");
}

export async function deletePostAction(formData: FormData) {
  await requireSession();

  const slug = String(formData.get("slug") ?? "");
  if (slug) {
    await deletePost(slug);
    revalidateBlog(slug, slug);
  }

  redirect("/admin/posts");
}

/**
 * The public blog is statically generated, so a write here is invisible
 * until the affected paths are rebuilt. Both slugs are passed because an
 * edit that renames a post has to clear the page it used to live at as
 * well as the one it now does.
 */
function revalidateBlog(oldSlug: string, newSlug: string) {
  revalidatePath("/blog");
  revalidatePath(`/blog/${oldSlug}`);
  if (newSlug !== oldSlug) revalidatePath(`/blog/${newSlug}`);
  revalidatePath("/admin/posts");
}
