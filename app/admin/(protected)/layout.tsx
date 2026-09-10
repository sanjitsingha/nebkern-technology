import { redirect } from "next/navigation";

import { hasValidSession } from "@/lib/admin-auth";

/**
 * The authorisation boundary, and nothing else.
 *
 * `proxy.ts` only checks that a session cookie EXISTS — it runs on the
 * Edge, where the HMAC that makes the cookie mean anything cannot be
 * verified. This layout runs in the Node runtime and does the real
 * check, so a forged or expired cookie gets past the proxy and stops
 * here.
 *
 * A route group `(protected)` rather than a folder, so these pages keep
 * their `/admin/posts` URLs while `/admin/login` stays outside the
 * check — nesting the login under the same layout would redirect it to
 * itself forever.
 *
 * The header and the page container used to live here too. They moved
 * down into `(shell)/layout.tsx` when the editor grew its own top bar:
 * the editor is a full-screen working surface with its own chrome, and
 * a layout that renders a nav bar for every descendant cannot let one
 * of them opt out. Auth is the only thing genuinely common to all of
 * them, so auth is the only thing left at this level.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidSession())) redirect("/admin/login");

  return <>{children}</>;
}
