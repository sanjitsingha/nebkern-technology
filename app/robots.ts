import type { MetadataRoute } from "next";

import { SITE } from "@/lib/site";

/**
 * /robots.txt
 *
 * Everything is crawlable except the admin. `/admin` already sends
 * `noindex` in its metadata and redirects anonymous visitors to a login,
 * so this is the third of three — and the only one that stops a crawler
 * spending its budget on pages it will be bounced from anyway.
 *
 * Worth being clear about what this is not: `Disallow` is a request, not
 * a control. It keeps well-behaved crawlers out of /admin; it does not
 * protect anything, and it is not a substitute for the session check.
 * Anyone can read robots.txt, so listing a path here also advertises it
 * — acceptable for /admin, which is a guessable path anyway.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: "/admin",
    },
    sitemap: `${SITE.url}/sitemap.xml`,
    // Names the canonical hostname for crawlers that honour it, which
    // matters here: the site answers on more than one.
    host: SITE.url,
  };
}
