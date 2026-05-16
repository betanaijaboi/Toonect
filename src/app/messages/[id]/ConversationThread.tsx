"use client";

import { useState, useRef, useEffect, useTransition } from "react";
import Link from "next/link";
import { ArrowLeft, Send, ExternalLink } from "lucide-react";
import { sendMessageAction } from "@/lib/message-actions";
import { createClient } from "@/lib/supabase/client";
import { ConversationWithParticipant, DbMessage } from "@/lib/types";
import clsx from "clsx";

function AvatarPlaceholder({ name, role, sm }: { name: string; role: "artist" | "writer"; sm?: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const artistColors = ["bg-orange-200 text-orange-800", "bg-pink-200 text-pink-800", "bg-blue-200 text-blue-800"];
  const writerColors = ["bg-teal-200 text-teal-800", "bg-indigo-200 text-indigo-800", "bg-violet-200 text-violet-800"];
  const palette = role === "artist" ? artistColors : writerColors;
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className={clsx("rounded-full flex items-center justify-center font-bold flex-shrink-0", color, sm ? "w-7 h-7 text-xs" : "w-9 h-9 text-sm")}>
      {initials}
    </div>
  );
}

function formatMessageTime(iso: string) {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function formatDaySeparator(iso: string) {
  const d = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - d.getTime()) / 86400000);
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });
}

function groupByDay(messages: DbMessage[]) {
  const groups: { dayLabel: string; messages: DbMessage[] }[] = [];
  let currentDay = "";
  for (const m of messages) {
    const day = new Date(m.created_at).toDateString();
    if (day !== currentDay) {
      currentDay = day;
      groups.push({ dayLabel: formatDaySeparator(m.created_at), messages: [] });
    }
    groups[groups.length - 1].messages.push(m);
  }
  return groups;
}

interface ConversationThreadProps {
  conversation: ConversationWithParticipant;
  initialMessages: DbMessage[];
  currentUserId: string;
}

export default function ConversationThread({
  conversation,
  initialMessages,
  currentUserId,
}: ConversationThreadProps) {
  const [messages, setMessages] = useState<DbMessage[]>(initialMessages);
  const [draft, setDraft] = useState("");
  const [isPending, startTransition] = useTransition();
  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  // Scroll to bottom whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Realtime: append messages sent by the other participant
  useEffect(() => {
    const supabase = createClient();
    const channel = supabase
      .channel(`messages:${conversation.id}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `conversation_id=eq.${conversation.id}`,
        },
        (payload) => {
          const incoming = payload.new as DbMessage;
          setMessages((prev) => {
            // Deduplicate: skip if we already have this id (our own sent messages)
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
        }
      )
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [conversation.id]);

  function handleSend() {
    const text = draft.trim();
    if (!text || isPending) return;

    // Optimistic update
    const optimistic: DbMessage = {
      id: `optimistic-${Date.now()}`,
      conversation_id: conversation.id,
      sender_id: currentUserId,
      content: text,
      created_at: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimistic]);
    setDraft("");
    inputRef.current?.focus();

    startTransition(async () => {
      const result = await sendMessageAction(conversation.id, text);
      if ("error" in result) {
        // Roll back optimistic message on error
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id));
        console.error("Failed to send:", result.error);
      } else {
        // Replace optimistic with real message
        setMessages((prev) =>
          prev.map((m) => (m.id === optimistic.id ? (result as DbMessage) : m))
        );
      }
    });
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  }

  const otherUser = conversation.other_user;
  const groups = groupByDay(messages);
  const profileHref =
    otherUser.role === "artist"
      ? `/artists/${otherUser.username}`
      : `/writers/${otherUser.username}`;

  return (
    <div className="flex flex-col h-full">
      {/* Top bar */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        {/* Mobile back */}
        <Link href="/messages" className="sm:hidden p-1.5 -ml-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>

        <AvatarPlaceholder name={otherUser.display_name} role={otherUser.role} />

        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm leading-tight truncate">{otherUser.display_name}</p>
          <p className="text-xs text-[var(--muted)] capitalize">{otherUser.role}</p>
        </div>

        <Link
          href={profileHref}
          className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline flex-shrink-0"
        >
          <ExternalLink className="w-3.5 h-3.5" />
          Profile
        </Link>
      </header>

      {/* Message list */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6">
        {groups.length === 0 && (
          <p className="text-center text-sm text-[var(--muted)] mt-12">
            No messages yet. Say hello!
          </p>
        )}
        {groups.map((group) => (
          <div key={group.dayLabel} className="flex flex-col gap-3">
            {/* Day separator */}
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[var(--border)]" />
              <span className="text-xs text-[var(--muted)] font-medium">{group.dayLabel}</span>
              <div className="flex-1 h-px bg-[var(--border)]" />
            </div>

            {group.messages.map((msg, idx) => {
              const isOwn = msg.sender_id === currentUserId;
              const prev = group.messages[idx - 1];
              const showAvatar = !isOwn && (!prev || prev.sender_id !== msg.sender_id);

              return (
                <div
                  key={msg.id}
                  className={clsx("flex items-end gap-2", isOwn ? "flex-row-reverse" : "flex-row")}
                >
                  {/* Avatar spacer */}
                  {!isOwn && (
                    <div className="w-7 flex-shrink-0">
                      {showAvatar && (
                        <AvatarPlaceholder name={otherUser.display_name} role={otherUser.role} sm />
                      )}
                    </div>
                  )}

                  <div className={clsx("flex flex-col gap-0.5 max-w-[75%]", isOwn ? "items-end" : "items-start")}>
                    <div
                      className={clsx(
                        "px-3.5 py-2.5 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap break-words",
                        isOwn
                          ? "bg-[var(--accent)] text-white rounded-br-sm"
                          : "bg-[var(--surface)] border border-[var(--border)] rounded-bl-sm",
                        msg.id.startsWith("optimistic-") && "opacity-70"
                      )}
                    >
                      {msg.content}
                    </div>
                    <span className="text-[10px] text-[var(--muted)] px-1">
                      {formatMessageTime(msg.created_at)}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input bar */}
      <div className="flex-shrink-0 border-t border-[var(--border)] bg-[var(--surface)] px-4 py-3">
        <div className="flex items-end gap-2 bg-[#f3f4f6] rounded-2xl px-4 py-2.5">
          <textarea
            ref={inputRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Message ${otherUser.display_name}…`}
            rows={1}
            className="flex-1 bg-transparent text-sm resize-none outline-none max-h-36 leading-relaxed placeholder:text-[var(--muted)]"
            style={{ height: "auto", minHeight: "1.5rem" }}
            onInput={(e) => {
              const el = e.currentTarget;
              el.style.height = "auto";
              el.style.height = `${el.scrollHeight}px`;
            }}
          />
          <button
            onClick={handleSend}
            disabled={!draft.trim() || isPending}
            className={clsx(
              "flex items-center justify-center w-8 h-8 rounded-full flex-shrink-0 transition-all",
              draft.trim() && !isPending
                ? "bg-[var(--accent)] text-white hover:opacity-90"
                : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            )}
            aria-label="Send"
          >
            <Send className="w-4 h-4" />
          </button>
        </div>
        <p className="text-[10px] text-[var(--muted)] mt-1.5 text-center">
          Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}
