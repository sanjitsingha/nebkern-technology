"use client";

import { useActionState } from "react";

import { loginAction, type FormState } from "@/app/admin/actions";

const FIELD =
  "w-full rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none transition-colors placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent";

export function LoginForm({ next }: { next?: string }) {
  const [state, formAction, pending] = useActionState<FormState, FormData>(
    loginAction,
    null,
  );

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-3">
      {/* Carries the deep link the proxy interrupted, so signing in
          returns you where you were going. */}
      <input type="hidden" name="next" value={next ?? "/admin/posts"} />

      <label className="flex flex-col gap-1.5">
        <span className="text-[0.8125rem] font-medium text-ink">Username</span>
        <input
          name="username"
          autoComplete="username"
          required
          className={FIELD}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-[0.8125rem] font-medium text-ink">Password</span>
        <input
          name="password"
          type="password"
          autoComplete="current-password"
          required
          className={FIELD}
        />
      </label>

      {/* `role="alert"` so the failure is announced rather than only
          appearing — the form does not move focus on a failed submit. */}
      {state?.error && (
        <p
          role="alert"
          className="rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.875rem] text-ink"
        >
          {state.error}
        </p>
      )}

      <button
        type="submit"
        disabled={pending}
        className="mt-2 rounded-md bg-accent px-4 py-2.5 text-[0.9375rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-60"
      >
        {pending ? "Signing in…" : "Sign in"}
      </button>
    </form>
  );
}
