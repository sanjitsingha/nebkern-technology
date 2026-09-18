import { INDEXNOW_KEY } from "@/lib/indexnow";

/**
 * /indexnow.txt — the IndexNow key file.
 *
 * A search engine that receives a submission fetches this and checks it
 * holds the key the submission carried. That is the whole of the
 * protocol's proof that the request came from this domain's owner. See
 * lib/indexnow.ts.
 */
export const dynamic = "force-static";

export function GET() {
  return new Response(INDEXNOW_KEY, {
    headers: { "Content-Type": "text/plain; charset=utf-8" },
  });
}
