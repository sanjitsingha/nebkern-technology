import type { Metadata } from "next";

import { PostForm } from "@/components/admin/post-form";

export const metadata: Metadata = { title: "New post" };

export default function NewPostPage() {
  // Outside the `(shell)` route group, so there is no admin nav bar and
  // no page container around this — the form brings its own top bar and
  // its own column. That is what lets the editor be a full-screen
  // working surface instead of a page inside a chrome it does not want.
  return (
    <main>
      {/* No visible H1 and no standfirst. The form's title field is the
          heading — it sits at the top of the writing column at 2rem,
          carrying "Untitled" until it is renamed — and a static "New
          post" above it was a second, competing title that said less.

          It stays as screen-reader text rather than going entirely: the
          page still needs one heading to be navigable, and "New post" is
          what it is. Same move /blog makes with its own masthead gone. */}
      <h1 className="sr-only">New post</h1>

      <PostForm />
    </main>
  );
}
