import Link from "next/link";

import { logoutAction } from "@/app/admin/actions";

/**
 * The ordinary admin chrome: a nav bar, and a page column under it.
 *
 * This is what every admin screen EXCEPT the editor wears. The editor
 * lives outside this group because it replaces the bar entirely — its
 * top bar carries the back link and the publish controls, and stacking
 * that under a second bar would give the screen two of them.
 *
 * Auth is not checked here; the parent `(protected)` layout does it for
 * this group and the editor alike.
 */

/**
 * The width of the admin shell, header and content together.
 *
 * Wider than the public site's `max-w-6xl`, and deliberately not the
 * same token. The site is a reading surface, where a long line of
 * running text is a liability; this is a working surface.
 *
 * 88rem (1408px) rather than the next step up the Tailwind scale
 * (`max-w-7xl`, 1280px), which was too small a move to be worth making.
 * It still leaves a gutter on a 1512px laptop and does not run edge to
 * edge on a 1440px display.
 *
 * Named once because the header and the content have to agree: they are
 * separate containers, and the lockup drifting out of line with the
 * column beneath it is exactly what happens when one is changed alone.
 *
 * The editor's own bar in `components/admin/post-form.tsx` repeats this
 * width deliberately, so the two screens line up despite not sharing a
 * container.
 */
const SHELL = "mx-auto w-full max-w-[88rem] px-5 sm:px-8";

export default function ShellLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-line bg-surface">
        <div
          className={`${SHELL} flex h-16 items-center justify-between gap-6`}
        >
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

      <main className={`${SHELL} py-10 sm:py-12`}>{children}</main>
    </>
  );
}
