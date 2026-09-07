import { NextResponse, type NextRequest } from "next/server";

import { SESSION_COOKIE } from "@/lib/admin-auth";

/**
 * Bounces anonymous visitors off /admin before a page renders.
 *
 * This is an OPTIMISTIC check and nothing more: it asks whether a
 * session cookie exists, not whether it is valid. Two reasons. Proxy
 * runs on the Edge runtime, where `node:crypto` — and so the HMAC that
 * makes the cookie mean anything — is not available. And it runs on
 * every request including prefetches, so it has to stay cheap.
 *
 * The real verification is `hasValidSession()` in
 * `app/admin/(protected)/layout.tsx`, which runs in the Node runtime.
 * A forged cookie gets past this file and is rejected there. Never move
 * an authorisation decision up here on its own.
 *
 * Renamed from `middleware.ts`, which Next 16 deprecated — same
 * behaviour, different filename and export.
 */
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith("/admin/login")) return NextResponse.next();
  if (request.cookies.has(SESSION_COOKIE)) return NextResponse.next();

  const url = request.nextUrl.clone();
  url.pathname = "/admin/login";
  // So a deep link survives the detour through sign-in.
  url.searchParams.set("next", pathname);
  return NextResponse.redirect(url);
}

export const config = {
  matcher: "/admin/:path*",
};
