import { redirect } from "next/navigation";

import { hasValidSession } from "@/lib/admin-auth";

/**
 * The authorisation boundary, and the admin's one configuration check.
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
 * The header and the page container live one level down, in
 * `(shell)/layout.tsx`, so the editor can wear its own chrome instead.
 */
export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  if (!(await hasValidSession())) redirect("/admin/login");

  // Every admin screen reads or writes through the secret key, so without
  // it every one of them would throw. In production Next replaces a thrown
  // error's message with an opaque digest, which would leave "the key is
  // not set" invisible exactly when it matters — so this says it in plain
  // words instead, and only to someone already signed in.
  if (!process.env.SUPABASE_SECRET_KEY) return <MissingSecretKey />;

  return <>{children}</>;
}

function MissingSecretKey() {
  return (
    <main className="mx-auto max-w-xl px-5 py-24 sm:px-8">
      <h1 className="text-[1.5rem] font-semibold tracking-[-0.022em] text-ink">
        The admin is not connected to the database yet
      </h1>
      <p className="mt-4 text-[0.9375rem] leading-relaxed text-muted">
        Posts are stored in Supabase, and reading drafts or saving anything
        needs the project&rsquo;s secret key. The public blog does not use it
        and is working normally.
      </p>
      <ol className="mt-6 list-decimal space-y-2 pl-5 text-[0.9375rem] leading-relaxed text-ink">
        <li>
          Supabase dashboard &rarr; Project Settings &rarr; API Keys &rarr; copy
          the <strong>secret</strong> key (starts{" "}
          <code className="font-mono text-[0.875rem]">sb_secret_</code>).
        </li>
        <li>
          Set it as{" "}
          <code className="font-mono text-[0.875rem]">SUPABASE_SECRET_KEY</code>{" "}
          in <code className="font-mono text-[0.875rem]">.env.local</code>, and
          in the Vercel project&rsquo;s environment variables.
        </li>
        <li>Restart the server (or redeploy on Vercel).</li>
      </ol>
    </main>
  );
}
