import type { Metadata } from "next";

import { LoginForm } from "@/components/admin/login-form";

export const metadata: Metadata = { title: "Sign in" };

export default async function LoginPage({
  searchParams,
}: PageProps<"/admin/login">) {
  // A Promise in this version of Next — it must be awaited before any
  // property is read.
  const { next } = await searchParams;

  return (
    <div className="grid min-h-screen place-items-center px-5 py-16">
      <div className="w-full max-w-sm">
        <h1 className="text-[1.5rem] font-semibold tracking-[-0.022em] text-ink">
          Nebkern admin
        </h1>
        <p className="mt-1.5 text-[0.9375rem] text-muted">
          Sign in to manage the blog.
        </p>

        <LoginForm next={typeof next === "string" ? next : undefined} />
      </div>
    </div>
  );
}
