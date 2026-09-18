"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type FormEvent,
} from "react";

import {
  MAYA,
  MAYA_LIMITS,
  PRESETS,
  presetById,
  type KnowledgeSource,
} from "@/lib/maya";

/**
 * The playground: pick what Maya knows, then talk to her as a customer.
 *
 * Two panels. The knowledge base sits beside the chat, in full, because
 * the whole claim being demonstrated is "she answers from THIS" — a
 * visitor should be able to check any reply against the text it came
 * from. The chat is the conversation Instant's own playground shows a
 * business before Maya goes live.
 *
 * A handoff ends the conversation, as it does in Instant: once Maya
 * passes a chat to a person she stops replying in it. Continuing to type
 * at her afterwards would demonstrate a behaviour the product does not
 * have.
 */

type Bubble = {
  id: number;
  role: "user" | "assistant";
  text: string;
  /** Still arriving — shows the typing dots until the first words land. */
  streaming?: boolean;
  handoff?: boolean;
  truncated?: boolean;
};

type StreamEvent =
  | { t: "text"; v: string }
  | { t: "done"; handoff: boolean; truncated: boolean }
  | { t: "error"; message: string };

const SOURCES: { id: KnowledgeSource; label: string }[] = [
  ...PRESETS.map((preset) => ({ id: preset.id, label: preset.label })),
  { id: "custom", label: "Your own" },
];

let nextId = 0;

export function MayaPlayground({ enabled }: { enabled: boolean }) {
  const [source, setSource] = useState<KnowledgeSource>("sample-store");
  const [custom, setCustom] = useState("");
  const [bubbles, setBubbles] = useState<Bubble[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // What a screen reader hears: each finished reply, once. The thread
  // itself is not a live region, or every streamed word would be read
  // out as it arrived.
  const [announcement, setAnnouncement] = useState("");

  const inFlight = useRef<AbortController | null>(null);
  const thread = useRef<HTMLDivElement>(null);

  const preset = source === "custom" ? undefined : presetById(source);
  const knowledgeReady = source !== "custom" || custom.trim().length > 0;
  const customerTurns = bubbles.filter((b) => b.role === "user").length;
  const handedOff = bubbles.some((b) => b.handoff);
  const atLimit = customerTurns >= MAYA_LIMITS.customerTurns;
  const canSend =
    enabled && knowledgeReady && !busy && !handedOff && !atLimit;

  // Follow the conversation down as it grows and as a reply streams in.
  useEffect(() => {
    const el = thread.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [bubbles]);

  // Leaving the page mid-reply stops the request, and with it the spend.
  useEffect(() => () => inFlight.current?.abort(), []);

  function reset() {
    inFlight.current?.abort();
    inFlight.current = null;
    setBubbles([]);
    setBusy(false);
    setError(null);
    setAnnouncement("");
  }

  function choose(next: KnowledgeSource) {
    if (next === source) return;
    // A new knowledge base is a new Maya. Carrying the old conversation
    // over would have her contradict answers she gave from other text.
    reset();
    setSource(next);
  }

  async function send(raw: string) {
    const text = raw.trim();
    if (!text || !canSend) return;

    const history = [
      ...bubbles.map((b) => ({ role: b.role, content: b.text })),
      { role: "user" as const, content: text },
    ];
    // Both ids up front: the error path removes this exact pair.
    const questionId = ++nextId;
    const replyId = ++nextId;

    setBubbles((current) => [
      ...current,
      { id: questionId, role: "user", text },
      { id: replyId, role: "assistant", text: "", streaming: true },
    ]);
    setInput("");
    setError(null);
    setBusy(true);

    const controller = new AbortController();
    inFlight.current = controller;

    const update = (patch: Partial<Bubble> | ((b: Bubble) => Partial<Bubble>)) =>
      setBubbles((current) =>
        current.map((b) =>
          b.id === replyId
            ? { ...b, ...(typeof patch === "function" ? patch(b) : patch) }
            : b,
        ),
      );

    try {
      const response = await fetch("/api/maya-playground", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          source,
          ...(source === "custom" ? { knowledge: custom } : {}),
          messages: history,
        }),
        signal: controller.signal,
      });

      if (!response.ok || !response.body) {
        const data = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(data?.error ?? "Maya couldn't answer just now.");
      }

      // Newline-delimited JSON: split on newlines, keeping any partial
      // line for the next chunk — a chunk boundary can fall mid-event.
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";
      let finished = false;
      // Kept alongside the bubble so the finished reply can be announced
      // without reading state back out of an updater.
      let reply = "";

      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });

        let newline: number;
        while ((newline = buffer.indexOf("\n")) >= 0) {
          const line = buffer.slice(0, newline).trim();
          buffer = buffer.slice(newline + 1);
          if (!line) continue;

          const event = JSON.parse(line) as StreamEvent;
          if (event.t === "text") {
            reply += event.v;
            update((b) => ({ text: b.text + event.v }));
          } else if (event.t === "error") {
            throw new Error(event.message);
          } else {
            finished = true;
            update({
              streaming: false,
              handoff: event.handoff,
              truncated: event.truncated,
            });
            setAnnouncement(
              event.handoff
                ? "Maya handed this conversation to a person."
                : `Maya: ${reply}`,
            );
          }
        }
      }

      if (!finished) throw new Error("Maya's reply was cut off. Try again.");
    } catch (caught) {
      if (controller.signal.aborted) return;

      // Take the exchange back out and return the message to the box, so
      // one press resends it. Leaving the unanswered message in the
      // thread would also break the transcript's customer/Maya
      // alternation for the next send.
      setBubbles((current) =>
        current.filter((b) => b.id !== replyId && b.id !== questionId),
      );
      setInput(text);
      setError(
        caught instanceof Error ? caught.message : "Maya couldn't answer just now.",
      );
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    void send(input);
  }

  const status = !enabled
    ? "The playground isn't switched on yet."
    : !knowledgeReady
      ? "Paste a knowledge base to start."
      : handedOff
        ? "Maya passed this chat to a person. Start over to try again."
        : atLimit
          ? "That's the limit for one conversation. Start over to keep going."
          : null;

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:items-start"
      style={{ "--hue": MAYA.hue } as CSSProperties}
    >
      {/* ---- What Maya knows ---- */}
      <section
        aria-labelledby="knowledge-heading"
        className="rounded-lg border border-line bg-surface p-5 sm:p-6"
      >
        <h2
          id="knowledge-heading"
          className="text-[1.0625rem] font-semibold tracking-[-0.014em] text-ink"
        >
          What Maya knows
        </h2>

        <fieldset className="mt-4">
          <legend className="sr-only">Knowledge base</legend>
          <div className="grid grid-cols-3 gap-1 rounded-md border border-line bg-surface-2 p-1">
            {SOURCES.map((option) => (
              <label key={option.id} className="relative">
                <input
                  type="radio"
                  name="knowledge-source"
                  value={option.id}
                  checked={source === option.id}
                  onChange={() => choose(option.id)}
                  className="peer sr-only"
                />
                <span className="block cursor-pointer rounded px-2 py-2 text-center text-[0.8125rem] font-medium text-muted transition-colors peer-checked:bg-surface peer-checked:text-ink peer-checked:shadow-[0_1px_2px_rgb(0_0_0/0.08)] peer-focus-visible:ring-2 peer-focus-visible:ring-accent hover:text-ink">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        {preset ? (
          <>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-muted text-pretty">
              {preset.blurb}
            </p>
            {/* The text Maya is given, verbatim — the same string the
                server puts in her instructions, from the same module. */}
            <pre className="mt-4 max-h-[26rem] overflow-y-auto rounded-md border border-line-soft bg-surface-2 p-4 font-sans text-[0.8125rem] leading-relaxed whitespace-pre-wrap text-ink-soft">
              {preset.knowledge}
            </pre>
          </>
        ) : (
          <>
            <p className="mt-4 text-[0.875rem] leading-relaxed text-muted text-pretty">
              Paste your own FAQ, prices, delivery or return policy. Maya
              answers only from what is here.
            </p>
            <textarea
              value={custom}
              onChange={(e) => {
                // Editing the knowledge base mid-conversation would have
                // Maya contradict her earlier replies; start fresh.
                if (bubbles.length) reset();
                setCustom(e.target.value);
              }}
              maxLength={MAYA_LIMITS.knowledgeChars}
              rows={14}
              placeholder={
                "Delivery: 3–5 days across India, free over ₹999.\nReturns: within 7 days, unused, with tags.\nOpen: 10am–7pm, Monday to Saturday."
              }
              aria-label="Your knowledge base"
              className="mt-4 w-full resize-y rounded-md border border-line bg-surface p-3.5 text-[0.875rem] leading-relaxed text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent"
            />
            <p className="mt-1.5 text-right text-[0.75rem] text-muted tabular-nums">
              {custom.length.toLocaleString("en-IN")} /{" "}
              {MAYA_LIMITS.knowledgeChars.toLocaleString("en-IN")}
            </p>
          </>
        )}
      </section>

      {/* ---- The chat ---- */}
      <section
        aria-labelledby="chat-heading"
        className="flex h-[38rem] flex-col overflow-hidden rounded-lg border border-line bg-surface"
      >
        <header className="flex items-center justify-between gap-4 border-b border-line-soft px-5 py-3.5">
          <div className="min-w-0">
            <h2
              id="chat-heading"
              className="flex items-center gap-2 text-[0.9375rem] font-semibold text-ink"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ background: "var(--hue)" }}
                aria-hidden="true"
              />
              Chat with Maya
            </h2>
            <p className="mt-0.5 truncate text-[0.75rem] text-muted">
              Answering from:{" "}
              {SOURCES.find((option) => option.id === source)?.label}
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            disabled={bubbles.length === 0 && !error}
            className="shrink-0 rounded-md border border-line px-3 py-1.5 text-[0.8125rem] font-medium text-ink transition-colors hover:border-ink/25 disabled:cursor-default disabled:opacity-40"
          >
            Start over
          </button>
        </header>

        <div
          ref={thread}
          className="flex-1 space-y-3 overflow-y-auto bg-surface-2/60 px-4 py-5 sm:px-5"
        >
          {bubbles.length === 0 ? (
            <Empty
              enabled={enabled}
              questions={preset?.questions ?? []}
              onPick={(question) => void send(question)}
              disabled={!canSend}
            />
          ) : (
            bubbles.map((bubble) => (
              <Message key={bubble.id} bubble={bubble} />
            ))
          )}

          {error && (
            <p
              role="alert"
              className="rounded-md border border-warning/40 bg-warning/10 px-3.5 py-2.5 text-[0.8125rem] text-ink"
            >
              {error}
            </p>
          )}
        </div>

        <p className="sr-only" aria-live="polite">
          {announcement}
        </p>

        <form
          onSubmit={onSubmit}
          className="border-t border-line-soft bg-surface px-4 py-3.5 sm:px-5"
        >
          {status && (
            <p className="mb-2.5 text-[0.8125rem] text-muted">{status}</p>
          )}
          <div className="flex items-center gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              maxLength={MAYA_LIMITS.messageChars}
              disabled={!canSend && !busy}
              placeholder="Ask what a customer would…"
              aria-label="Message Maya"
              className="min-w-0 flex-1 rounded-md border border-line bg-surface px-3.5 py-2.5 text-[0.9375rem] text-ink outline-none placeholder:text-muted focus:border-accent focus:ring-1 focus:ring-accent disabled:bg-surface-2"
            />
            <button
              type="submit"
              disabled={!canSend || !input.trim()}
              className="shrink-0 rounded-md bg-accent px-4 py-2.5 text-[0.875rem] font-medium text-accent-fg transition-colors hover:bg-accent-hover disabled:opacity-50"
            >
              {busy ? "Sending…" : "Send"}
            </button>
          </div>
          {/* Said where the typing happens, not buried in a policy: this
              text leaves the site. Kept to what is true of this route —
              it stores nothing and logs no message content. */}
          <p className="mt-2.5 text-[0.75rem] leading-relaxed text-muted">
            Messages are sent to Anthropic&rsquo;s API to write Maya&rsquo;s
            replies. Nebkern doesn&rsquo;t store them. Don&rsquo;t share
            anything private.
          </p>
        </form>
      </section>
    </div>
  );
}

/** The empty thread: a line on what to do, and questions to tap. */
function Empty({
  enabled,
  questions,
  onPick,
  disabled,
}: {
  enabled: boolean;
  questions: string[];
  onPick: (question: string) => void;
  disabled: boolean;
}) {
  if (!enabled) {
    return (
      <div className="grid h-full place-items-center px-6 text-center">
        <p className="max-w-xs text-[0.9375rem] leading-relaxed text-muted">
          The playground isn&rsquo;t switched on yet. Check back soon.
        </p>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col justify-end">
      <p className="text-[0.875rem] leading-relaxed text-muted">
        {questions.length
          ? "Ask anything a customer would — or start with one of these. The last one isn't in the knowledge base, so you'll see Maya hand it to a person."
          : "Ask anything a customer would. Try one question the text answers, and one it doesn't."}
      </p>
      {questions.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {questions.map((question) => (
            <button
              key={question}
              type="button"
              onClick={() => onPick(question)}
              disabled={disabled}
              className="rounded-md border border-line bg-surface px-3 py-2 text-left text-[0.8125rem] text-ink-soft transition-colors hover:border-(--hue) hover:text-ink disabled:opacity-50"
            >
              {question}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/**
 * One message. The customer's on the right, as on their own phone;
 * Maya's on the left, tinted in her colour and named, so a screenshot of
 * the thread still says who wrote what.
 */
function Message({ bubble }: { bubble: Bubble }) {
  if (bubble.role === "user") {
    return (
      <div className="flex justify-end">
        <p className="max-w-[85%] rounded-md bg-surface px-3.5 py-2.5 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink shadow-[0_1px_2px_rgb(0_0_0/0.06)]">
          {bubble.text}
        </p>
      </div>
    );
  }

  if (bubble.handoff && !bubble.text) {
    return <Handoff />;
  }

  return (
    <>
      <div className="flex justify-start">
        <div
          className="max-w-[85%] rounded-md border px-3.5 py-2.5"
          style={{
            background: "color-mix(in oklab, var(--hue) 7%, var(--surface))",
            borderColor: "color-mix(in oklab, var(--hue) 22%, transparent)",
          }}
        >
          <p
            className="text-[0.6875rem] font-semibold tracking-[0.08em] uppercase"
            style={{ color: "var(--hue)" }}
          >
            Maya
          </p>
          {bubble.streaming && !bubble.text ? (
            <Typing />
          ) : (
            <p className="mt-1 text-[0.9375rem] leading-relaxed whitespace-pre-wrap text-ink">
              {bubble.text}
              {bubble.truncated && "…"}
            </p>
          )}
        </div>
      </div>
      {bubble.handoff && <Handoff />}
    </>
  );
}

/** Three dots, pulsing in turn, while the reply has not started. */
function Typing() {
  return (
    <span
      className="mt-2 flex items-center gap-1.5 py-1"
      role="status"
      aria-label="Maya is typing"
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="size-1.5 animate-pulse rounded-full"
          style={{ background: "var(--hue)", animationDelay: `${i * 160}ms` }}
        />
      ))}
    </span>
  );
}

/** What a handoff looks like: the end of Maya's part in the chat. */
function Handoff() {
  return (
    <div className="flex items-center gap-3 py-2" role="note">
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
      <p className="max-w-[80%] text-center text-[0.8125rem] leading-snug text-muted">
        <span className="font-semibold text-ink">
          Maya handed this chat to a person.
        </span>{" "}
        In Instant, a teammate picks it up from here.
      </p>
      <span className="h-px flex-1 bg-line" aria-hidden="true" />
    </div>
  );
}
