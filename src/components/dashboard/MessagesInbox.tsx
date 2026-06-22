"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { cn, initials, timeAgo } from "@/lib/utils";

export interface ConvoMessage {
  id: string;
  body: string;
  mine: boolean;
  createdAt: string;
}

export interface Conversation {
  otherId: string;
  name: string;
  slug: string | null;
  role: string;
  messages: ConvoMessage[];
  unread: number;
  lastAt: string;
}

export function MessagesInbox({
  conversations,
  initialOtherId,
}: {
  conversations: Conversation[];
  initialOtherId: string | null;
}) {
  const router = useRouter();
  const [activeId, setActiveId] = useState<string | null>(initialOtherId);
  const [draft, setDraft] = useState("");
  const [sending, setSending] = useState(false);
  const [threadMsgs, setThreadMsgs] = useState<ConvoMessage[]>([]);
  const threadRef = useRef<HTMLDivElement>(null);
  const lastCountRef = useRef(0);

  const active = useMemo(
    () => conversations.find((c) => c.otherId === activeId) ?? null,
    [conversations, activeId],
  );

  // Seed the open thread from server data when the active conversation changes.
  useEffect(() => {
    const initial = conversations.find((c) => c.otherId === activeId)?.messages ?? [];
    setThreadMsgs(initial);
    lastCountRef.current = initial.length;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // Fetch the active thread; refresh the list/badges when activity changes.
  const poll = useCallback(async () => {
    if (!activeId || document.hidden) return;
    try {
      const res = await fetch(`/api/messages?with=${activeId}`, { cache: "no-store" });
      if (!res.ok) return;
      const data = await res.json();
      setThreadMsgs(data.messages);
      if (data.messages.length !== lastCountRef.current) {
        lastCountRef.current = data.messages.length;
        router.refresh();
      }
    } catch {
      /* transient network error — next tick will retry */
    }
  }, [activeId, router]);

  // Poll every few seconds while a conversation is open ("real-time-ish").
  useEffect(() => {
    if (!activeId) return;
    poll();
    const id = setInterval(poll, 4000);
    const onFocus = () => poll();
    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(id);
      window.removeEventListener("focus", onFocus);
    };
  }, [activeId, poll]);

  // Auto-scroll to the latest message.
  useEffect(() => {
    threadRef.current?.scrollTo({ top: threadRef.current.scrollHeight });
  }, [threadMsgs.length, activeId]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!active || !draft.trim()) return;
    const body = draft.trim();
    setDraft("");
    setSending(true);
    // Optimistically show the message immediately.
    const temp: ConvoMessage = {
      id: `temp-${Date.now()}`,
      body,
      mine: true,
      createdAt: new Date().toISOString(),
    };
    setThreadMsgs((prev) => [...prev, temp]);
    lastCountRef.current += 1;
    const res = await fetch("/api/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: active.otherId, body }),
    });
    if (res.ok) {
      await poll(); // reconcile with the server (real id, ordering)
      router.refresh();
    }
    setSending(false);
  }

  if (conversations.length === 0) {
    return (
      <div className="card p-10 text-center">
        <div className="text-3xl">✉️</div>
        <h1 className="mt-3 text-lg font-semibold">No messages yet</h1>
        <p className="mx-auto mt-1 max-w-sm text-sm text-subtle">
          Start a conversation from any venue or artist page. Your booking chats
          will show up here.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link href="/venues" className="btn-ghost">Find venues</Link>
          <Link href="/artists" className="btn-primary">Find artists</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="grid h-[70vh] grid-cols-1 gap-4 md:grid-cols-[280px_1fr]">
      {/* Conversation list */}
      <div className={cn("card overflow-y-auto thin-scroll", active && "hidden md:block")}>
        {conversations.map((c) => (
          <button
            key={c.otherId}
            onClick={() => setActiveId(c.otherId)}
            className={cn(
              "flex w-full items-center gap-3 border-b border-line px-4 py-3 text-left transition",
              c.otherId === activeId ? "bg-brand-500/10" : "hover:bg-elevated",
            )}
          >
            <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-full bg-brand-500/20 text-sm font-semibold text-brand-200">
              {initials(c.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center justify-between gap-2">
                <span className="truncate font-medium text-fg">{c.name}</span>
                {c.unread > 0 && (
                  <span className="grid h-5 min-w-5 place-items-center rounded-full bg-accent px-1.5 text-xs font-semibold text-white">
                    {c.unread}
                  </span>
                )}
              </div>
              <p className="truncate text-xs text-subtle">
                {c.messages.length > 0 ? c.messages[c.messages.length - 1].body : "Start the conversation"}
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Thread */}
      <div className={cn("card flex flex-col", !active && "hidden md:flex")}>
        {active ? (
          <>
            <div className="flex items-center justify-between gap-3 border-b border-line px-4 py-3">
              <div className="flex items-center gap-3">
                <button className="md:hidden text-subtle" onClick={() => setActiveId(null)} aria-label="Back">
                  ←
                </button>
                <div>
                  <p className="font-semibold text-fg">{active.name}</p>
                  <p className="flex items-center gap-1.5 text-xs text-subtle">
                    <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
                    Live · <span className="capitalize">{active.role.toLowerCase()}</span>
                  </p>
                </div>
              </div>
              {active.slug && (
                <Link
                  href={`/p/${active.slug}`}
                  target="_blank"
                  className="text-xs text-brand-300 hover:text-brand-200"
                >
                  View page ↗
                </Link>
              )}
            </div>

            <div ref={threadRef} className="flex-1 space-y-3 overflow-y-auto thin-scroll p-4">
              {threadMsgs.length === 0 ? (
                <p className="mt-8 text-center text-sm text-subtle">
                  Say hello to {active.name}.
                </p>
              ) : (
                threadMsgs.map((m) => (
                  <div key={m.id} className={cn("flex", m.mine ? "justify-end" : "justify-start")}>
                    <div
                      className={cn(
                        "max-w-[75%] rounded-2xl px-4 py-2 text-sm",
                        m.mine ? "bg-brand-500 text-white" : "bg-elevated text-fg",
                      )}
                    >
                      <p className="whitespace-pre-wrap break-words">{m.body}</p>
                      <p className={cn("mt-1 text-[10px]", m.mine ? "text-white/70" : "text-subtle")}>
                        {timeAgo(m.createdAt)}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>

            <form onSubmit={send} className="flex items-center gap-2 border-t border-line p-3">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                placeholder={`Message ${active.name}…`}
                className="input"
                aria-label={`Message ${active.name}`}
              />
              <button type="submit" disabled={sending || !draft.trim()} className="btn-primary px-5">
                Send
              </button>
            </form>
          </>
        ) : (
          <div className="grid flex-1 place-items-center text-sm text-subtle">
            Select a conversation
          </div>
        )}
      </div>
    </div>
  );
}
