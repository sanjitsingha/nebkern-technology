import { createHmac, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";

/**
 * Admin sign-in.
 *
 * THIS IS NOT REAL AUTHENTICATION. There is one hardcoded account, the
 * password is compared in plaintext, and anyone reading this repository
 * knows it. It exists so the admin has a door, not a lock. Before this
 * is exposed anywhere public it needs real accounts, hashed passwords
 * (argon2/bcrypt), and rate limiting on the login route.
 *
 * What it does do properly is the cookie. The session is an HMAC-signed
 * expiry rather than a `admin=true` flag, so it cannot be forged by
 * typing it into devtools, and it carries its own lifetime. That is a
 * low bar, but it is the bar below which the whole thing is theatre.
 *
 * Credentials and the signing secret come from the environment when set
 * — put ADMIN_USERNAME, ADMIN_PASSWORD and ADMIN_SESSION_SECRET in
 * `.env.local` and the defaults below stop being reachable.
 */
const USERNAME = process.env.ADMIN_USERNAME ?? "admin";
const PASSWORD = process.env.ADMIN_PASSWORD ?? "nebkern2026";

/** A fixed fallback so local development works with no setup. Every
 *  deployment must override it: with this value known, a session can be
 *  minted by anyone who has read this file. */
const SECRET = process.env.ADMIN_SESSION_SECRET ?? "dev-only-not-a-secret";

export const SESSION_COOKIE = "nk_admin";
const MAX_AGE_SECONDS = 60 * 60 * 8;

function sign(payload: string): string {
  return createHmac("sha256", SECRET).update(payload).digest("hex");
}

/** Constant-time, and length-guarded because `timingSafeEqual` throws
 *  rather than returns false when the buffers differ in length. */
function safeEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  return bufA.length === bufB.length && timingSafeEqual(bufA, bufB);
}

export function checkCredentials(username: string, password: string): boolean {
  // Both compared, and both in constant time, so the response cannot be
  // used to learn whether the username alone was right.
  const okUser = safeEqual(username, USERNAME);
  const okPass = safeEqual(password, PASSWORD);
  return okUser && okPass;
}

export async function createSession(): Promise<void> {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = String(expiresAt);

  (await cookies()).set(SESSION_COOKIE, `${payload}.${sign(payload)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function destroySession(): Promise<void> {
  (await cookies()).delete(SESSION_COOKIE);
}

/**
 * The real check. Runs in the Node runtime, where `node:crypto` exists.
 *
 * `proxy.ts` cannot call this — it runs on the Edge — which is why the
 * proxy only checks that a cookie is PRESENT and every protected layout
 * calls this to decide whether it is valid.
 */
export async function hasValidSession(): Promise<boolean> {
  const raw = (await cookies()).get(SESSION_COOKIE)?.value;
  if (!raw) return false;

  const [payload, signature] = raw.split(".");
  if (!payload || !signature) return false;
  if (!safeEqual(signature, sign(payload))) return false;

  const expiresAt = Number(payload);
  return Number.isFinite(expiresAt) && expiresAt > Date.now();
}
