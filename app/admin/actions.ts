"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import {
  checkCredentials,
  createSession,
  destroySession,
  hasValidSession,
} from "@/lib/admin-auth";
import { DEFAULT_TITLE, slugify, type Block, type Post } from "@/lib/blog";
import {
  createPost,
  deletePost,
  getPost,
  readMinutes,
  updatePost,
} from "@/lib/blog-store";

/**
 * Today, as `YYYY-MM-DD`, in Indian time.
 *
 * Not `toISOString().slice(0, 10)`, which is UTC: a post written at any
 * time before 05:30 IST would be stamped with the previous day's date.
 * The company and its readers are both in one timezone, so the honest
 * answer is that timezone rather than the server's — on Vercel the
 * server is UTC and would be wrong every night.
 *
 * `en-CA` because that locale's short date format IS `YYYY-MM-DD`, which
 * is the shape the rest of the site parses.
 */
function today(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
  }).format(new Date());
}

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
  // The editor shows "Untitled" as placeholder text, and a placeholder
  // is never submitted — so an untouched title arrives here as an empty
  // string. Substituting it is what makes "save now, name it later"
  // work instead of failing validation on the field the writer has
  // deliberately not filled in yet.
  const title = String(formData.get("title") ?? "").trim() || DEFAULT_TITLE;
  const body = JSON.parse(String(formData.get("body") ?? "[]")) as Block[];
  const coverSrc = String(formData.get("coverSrc") ?? "").trim();

  const post: Post = {
    slug: slugify(String(formData.get("slug") ?? "") || title),
    title,
    excerpt: String(formData.get("excerpt") ?? "").trim(),
    // Not a field any more. A new post is dated the day it is created,
    // and `savePostAction` puts the original date back when this is an
    // edit — so the published date is the day it first existed and
    // never moves, while `updatedAt` below carries every change.
    date: today(),
    tag: String(formData.get("tag") ?? "").trim(),
    author: {
      name: String(formData.get("authorName") ?? "").trim(),
      role: String(formData.get("authorRole") ?? "").trim(),
    },
    body,
    // Derived, never typed. A hand-entered read time is one more thing
    // to forget when a post is edited.
    readMinutes: readMinutes({ body }),
    // Stamped on every save, including the first. This is what the
    // sitemap reports, so a crawler learns the page changed without the
    // published date being rewritten.
    updatedAt: new Date().toISOString(),
  };

  if (coverSrc) {
    post.cover = {
      src: coverSrc,
      alt: String(formData.get("coverAlt") ?? "").trim(),
    };
  }

  // SEO overrides are only stored when they actually say something.
  // Writing `{ title: "", description: "" }` for every post would put
  // empty strings in front of the fallbacks, and an empty override is
  // not an override — it is a blank meta description.
  const seoTitle = String(formData.get("seoTitle") ?? "").trim();
  const seoDescription = String(formData.get("seoDescription") ?? "").trim();
  const noindex = formData.get("noindex") === "on";

  if (seoTitle || seoDescription || noindex) {
    post.seo = {
      ...(seoTitle ? { title: seoTitle } : {}),
      ...(seoDescription ? { description: seoDescription } : {}),
      ...(noindex ? { noindex: true } : {}),
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

  // Which button was pressed. A submit button's name/value is only
  // included in the form data when it is the one that submitted the
  // form, so this is how the two actions stay one action.
  const draft = formData.get("intent") === "draft";
  if (draft) post.draft = true;

  // An edit keeps the date the post was first published. `postFromForm`
  // stamps today unconditionally, which is right for a new post and
  // would silently re-date an old one — an article from March becoming
  // today's news because somebody fixed a typo in it.
  if (originalSlug) {
    const existing = await getPost(originalSlug);
    if (existing) post.date = existing.date;
  }

  // A draft is held to a lower bar on purpose. The whole point of one is
  // to save unfinished work and come back, so demanding a body would
  // reject exactly the post a writer most wants to keep — the one they
  // have not written yet. It still needs somewhere to live, which is
  // what the title and the slug are.
  // No "needs a title" check any more — `postFromForm` guarantees one.
  if (!post.slug) return { error: "That title does not make a usable URL." };
  if (!draft && !post.body.length) {
    return { error: "A post needs a body before it can be published." };
  }

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
  // A draft save means "not finished", so it returns to the editor it
  // was saved from and the next save carries on from there. It goes to
  // the post's own slug rather than back to /new, which would reopen an
  // empty form and try to create the same post a second time.
  // Publishing is a finishing move, so that goes back to the list.
  redirect(draft ? `/admin/posts/${post.slug}` : "/admin/posts");
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

  // Both are generated from the same posts, so a write leaves them as
  // stale as the pages themselves. Without this the sitemap would go on
  // advertising a deleted post, or omit a new one, until the next
  // deploy.
  revalidatePath("/sitemap.xml");
  revalidatePath("/llms.txt");
}
