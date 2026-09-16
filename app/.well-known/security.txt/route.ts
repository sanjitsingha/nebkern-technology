import { SITE_URL } from "@/lib/seo";
import { SITE } from "@/lib/site";

/**
 * /.well-known/security.txt — RFC 9116.
 *
 * The standard place a security researcher looks for how to report a
 * vulnerability. It points at the same address and rules as the "Report
 * a vulnerability" section of /trust.
 *
 * `Expires` is required and must be less than a year out. It is computed
 * at build, so every deploy pushes it forward; a site that goes a year
 * without deploying will publish an expired file, which is the honest
 * signal that nobody has reviewed it.
 */
export const dynamic = "force-static";

export function GET() {
  const expires = new Date();
  expires.setUTCFullYear(expires.getUTCFullYear() + 1);
  expires.setUTCDate(expires.getUTCDate() - 1);
  expires.setUTCHours(0, 0, 0, 0);

  const body = [
    `Contact: mailto:${SITE.email}`,
    `Expires: ${expires.toISOString()}`,
    `Preferred-Languages: en`,
    `Policy: ${SITE_URL}/trust#report`,
    `Canonical: ${SITE_URL}/.well-known/security.txt`,
    "",
  ].join("\n");

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
