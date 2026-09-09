import Link from "next/link";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/admin/actions";
import { hasValidSession } from "@/lib/admin-auth";

/**
 * The authorisation boundary.
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
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidSession())) redirect("/admin/login");

  return (
    <>
      <header className="border-b border-line bg-surface">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-6 px-5 sm:px-8">
          <Link
            href="/admin/posts"
            className="text-[0.9375rem] font-semibold tracking-[-0.018em] text-ink"
          >
            Nebkern admin
          </Link>

          <div className="flex items-center gap-5">
            <Link
              href="/blog"
              className="text-[0.875rem] text-muted transition-colors hover:text-ink"
            >
              View blog
            </Link>
            <form action={logoutAction}>
              <button
                type="submit"
                className="text-[0.875rem] text-muted transition-colors hover:text-ink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-12">
        {children}
      </main>
    </>
  );
}
