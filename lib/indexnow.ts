import "server-only";

import { SITE_URL } from "@/lib/seo";

/**
 * IndexNow: telling search engines a page changed, instead of waiting
 * for them to notice.
 *
 * One request to api.indexnow.org is shared with every engine in the
 * protocol — Bing, Yandex, Seznam, Naver, Yep — and Bing's index is also
 * what DuckDuckGo, Yahoo and ChatGPT search draw on. Google is not a
 * member; it learns from the sitemap's `lastmod`, which the admin's
 * writes already keep current.
 *
 * The key is not a secret. It proves the request comes from whoever
 * controls the domain, by being served at KEY_PATH on it — which is also
 * why it is in the source rather than an environment variable. Change it
 * here and the key file follows.
 */
export const INDEXNOW_KEY = "250c91636d588a31aa7d205ddee24628";

/** Served by app/indexnow.txt/route.ts. At the site root, because a key
 *  file only vouches for URLs at or below its own path. */
export const INDEXNOW_KEY_PATH = "/indexnow.txt";

/**
 * Submits URLs that were added, changed or removed.
 *
 * Production only. A preview deploy or a dev server saving a post would
 * otherwise announce URLs on the real domain for content that never
 * reached it. `VERCEL_ENV` is set by Vercel on every deployment and is
 * "production" only for the production one.
 *
 * Fire-and-forget: it never throws, and the admin calls it through
 * `after()`, so a slow or failing search engine can never hold up or
 * fail a save. A removed page is submitted too — that is how an engine
 * learns to drop it rather than finding out on its next crawl.
 */
export async function notifyIndexNow(urls: string[]): Promise<void> {
  if (process.env.VERCEL_ENV !== "production") return;

  const urlList = [...new Set(urls)];
  if (urlList.length === 0) return;

  try {
    const response = await fetch("https://api.indexnow.org/indexnow", {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({
        host: new URL(SITE_URL).host,
        key: INDEXNOW_KEY,
        keyLocation: `${SITE_URL}${INDEXNOW_KEY_PATH}`,
        urlList,
      }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });

    // 200 is accepted; 202 is accepted with the key still being checked,
    // which is what the first submission from a new key gets.
    if (response.status !== 200 && response.status !== 202) {
      console.error(
        `IndexNow refused ${urlList.length} URL(s): ${response.status} ${await response.text()}`,
      );
    }
  } catch (error) {
    console.error("IndexNow submission failed:", error);
  }
}
