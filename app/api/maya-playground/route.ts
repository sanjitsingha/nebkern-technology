import Anthropic from "@anthropic-ai/sdk";

import { MAYA_LIMITS, presetById, type KnowledgeSource } from "@/lib/maya";
import {
  HandoffFilter,
  playgroundEnabled,
  rateLimit,
  streamReply,
} from "@/lib/maya-playground";

/**
 * POST /api/maya-playground — one reply from Maya, streamed.
 *
 * Stateless, like Instant's own playground endpoint: the browser sends
 * the running transcript every turn, and nothing is stored here. Message
 * content is never logged either — errors are logged by type and status
 * only.
 *
 * The response is newline-delimited JSON, one event per line:
 *   {"t":"text","v":"…"}                         part of the reply
 *   {"t":"done","handoff":false,"truncated":false}
 *   {"t":"error","message":"…"}
 * Anything refused before the model is called (not configured, rate
 * limited, malformed) is an ordinary JSON error with a status code.
 */

/** The reply streams for as long as the model takes; this is the
 *  function's ceiling, and the client's timeout sits inside it. */
export const maxDuration = 60;

type Turn = { role: "user" | "assistant"; content: string };

function json(body: unknown, status: number, headers: HeadersInit = {}) {
  return Response.json(body, {
    status,
    headers: { "Cache-Control": "no-store", ...headers },
  });
}

/**
 * Validates the body, and returns the knowledge base to answer from.
 *
 * A preset is looked up by id on the server rather than accepted as
 * text, so its knowledge base cannot be swapped for something else in
 * transit. Only "custom" carries text, and that is capped.
 *
 * The transcript must alternate, start and end with the customer, and
 * stay under the per-conversation cap — the same limits the form
 * enforces, checked again here because a public endpoint is reachable
 * without the form.
 */
function parse(
  body: unknown,
): { knowledge: string; messages: Turn[] } | { error: string } {
  if (!body || typeof body !== "object") return { error: "Expected JSON." };
  const { source, knowledge, messages } = body as {
    source?: unknown;
    knowledge?: unknown;
    messages?: unknown;
  };

  let text: string;
  if (source === "custom") {
    if (typeof knowledge !== "string" || !knowledge.trim()) {
      return { error: "Paste something for Maya to answer from." };
    }
    if (knowledge.length > MAYA_LIMITS.knowledgeChars) {
      return {
        error: `Keep the knowledge base under ${MAYA_LIMITS.knowledgeChars.toLocaleString("en-IN")} characters.`,
      };
    }
    text = knowledge.trim();
  } else {
    const preset =
      typeof source === "string" ? presetById(source as KnowledgeSource) : undefined;
    if (!preset) return { error: "Unknown knowledge base." };
    text = preset.knowledge;
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    return { error: "Send a message to start." };
  }

  const turns: Turn[] = [];
  for (const [index, raw] of messages.entries()) {
    const role = (raw as Turn)?.role;
    const content = (raw as Turn)?.content;
    const expected = index % 2 === 0 ? "user" : "assistant";

    if (role !== expected || typeof content !== "string" || !content.trim()) {
      return { error: "That conversation is not in a shape Maya can read." };
    }
    // Replies can run longer than a customer's message; both are bounded.
    const cap =
      role === "user" ? MAYA_LIMITS.messageChars : MAYA_LIMITS.messageChars * 8;
    if (content.length > cap) {
      return {
        error: `Keep each message under ${MAYA_LIMITS.messageChars} characters.`,
      };
    }
    turns.push({ role, content: content.trim() });
  }

  if (turns[turns.length - 1].role !== "user") {
    return { error: "The last message has to be the customer's." };
  }
  if (turns.filter((t) => t.role === "user").length > MAYA_LIMITS.customerTurns) {
    return { error: "This conversation has reached its limit. Start over to keep going." };
  }

  return { knowledge: text, messages: turns };
}

/** A sentence a visitor can act on. The typed classes, not message text,
 *  decide which — and none of them repeats the upstream error, which can
 *  name the account or the key. */
function describe(error: unknown): string {
  if (error instanceof Anthropic.RateLimitError) {
    return "Maya is answering a lot of people right now. Try again in a minute.";
  }
  if (
    error instanceof Anthropic.AuthenticationError ||
    error instanceof Anthropic.PermissionDeniedError
  ) {
    return "The playground is unavailable right now.";
  }
  return "Maya couldn't answer just now. Try sending that again.";
}

function clientKey(request: Request): string {
  // On Vercel the platform sets x-forwarded-for, and the first entry is
  // the visitor's address.
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    request.headers.get("x-real-ip") ||
    "unknown"
  );
}

export async function POST(request: Request) {
  if (!playgroundEnabled()) {
    return json({ error: "The playground isn't switched on yet." }, 503);
  }

  // JSON only. That makes a cross-site request from someone else's page
  // a "non-simple" one the browser must preflight — and without CORS
  // headers here the preflight fails, so another website cannot spend
  // this endpoint's budget from its visitors' browsers.
  if (!request.headers.get("content-type")?.includes("application/json")) {
    return json({ error: "Expected JSON." }, 415);
  }

  const limit = rateLimit(clientKey(request));
  if (!limit.ok) {
    return json(
      { error: "That's a lot of questions in a short time. Try again in a few minutes." },
      429,
      { "Retry-After": String(limit.retryAfterSeconds) },
    );
  }

  const parsed = parse(await request.json().catch(() => null));
  if ("error" in parsed) return json(parsed, 400);

  const stream = streamReply(parsed.knowledge, parsed.messages);
  // A visitor who closes the tab or presses "Start over" mid-reply
  // should stop the spend, not leave the model writing to nobody.
  request.signal.addEventListener("abort", () => stream.abort());

  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      const send = (event: object) =>
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      const filter = new HandoffFilter();

      try {
        for await (const event of stream) {
          if (
            event.type === "content_block_delta" &&
            event.delta.type === "text_delta"
          ) {
            const text = filter.push(event.delta.text);
            if (text) send({ t: "text", v: text });
          }
        }

        const rest = filter.flush();
        if (rest) send({ t: "text", v: rest });

        // Checked before anything is treated as an answer. A refusal
        // here means the whole chain declined, fallback included, and
        // any text already streamed is a partial to discard.
        const message = await stream.finalMessage();
        if (message.stop_reason === "refusal") {
          send({
            t: "error",
            message: "Maya can't help with that one. Try asking something else.",
          });
        } else {
          send({
            t: "done",
            handoff: filter.handoff,
            truncated: message.stop_reason === "max_tokens",
          });
        }
      } catch (error) {
        if (!request.signal.aborted) {
          // The status and the API's own error text — which names a
          // parameter or a limit, never the visitor's words — is what
          // tells a 401 (key) from a 400 (a model or option it rejects)
          // from a 529 (overloaded) in the logs.
          console.error(
            "maya-playground:",
            error instanceof Anthropic.APIError
              ? `API ${error.status ?? "?"}: ${error.message.slice(0, 300)}`
              : error instanceof Error
                ? error.name
                : "unknown error",
          );
          send({ t: "error", message: describe(error) });
        }
      } finally {
        controller.close();
      }
    },
    cancel() {
      stream.abort();
    },
  });

  return new Response(body, {
    headers: {
      "Content-Type": "application/x-ndjson; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
