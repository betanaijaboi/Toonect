"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Search, Send } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { getOrCreateConversationAction, sendMessageAction } from "@/lib/message-actions";
import clsx from "clsx";

type Recipient = {
  id: string;
  username: string;
  display_name: string;
  role: "artist" | "writer";
};

function AvatarPlaceholder({ name, role }: { name: string; role: "artist" | "writer" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const artistColors = ["bg-orange-200 text-orange-800", "bg-pink-200 text-pink-800", "bg-blue-200 text-blue-800"];
  const writerColors = ["bg-teal-200 text-teal-800", "bg-indigo-200 text-indigo-800", "bg-violet-200 text-violet-800"];
  const palette = role === "artist" ? artistColors : writerColors;
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className={clsx("w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", color)}>
      {initials}
    </div>
  );
}

function NewMessageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const toUsername = searchParams.get("to");

  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [recipient, setRecipient] = useState<Recipient | null>(null);
  const [userSearch, setUserSearch] = useState("");
  const [searchResults, setSearchResults] = useState<Recipient[]>([]);
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const supabase = createClient();

  // Get current user and optionally pre-load the ?to= recipient
  useEffect(() => {
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) { router.replace("/auth/login?next=/messages/new"); return; }
      setCurrentUserId(user.id);
    });

    if (toUsername) {
      supabase
        .from("profiles")
        .select("id, username, display_name, role")
        .eq("username", toUsername)
        .single()
        .then(({ data }) => {
          if (data) setRecipient(data as Recipient);
        });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toUsername]);

  // Debounced user search
  useEffect(() => {
    if (!userSearch.trim() || userSearch.length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      const { data } = await supabase
        .from("profiles")
        .select("id, username, display_name, role")
        .or(`display_name.ilike.%${userSearch}%,username.ilike.%${userSearch}%`)
        .neq("id", currentUserId ?? "")
        .limit(6);

      setSearchResults((data ?? []) as Recipient[]);
    }, 250);

    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userSearch, currentUserId]);

  async function handleSend() {
    if (!recipient || !message.trim() || sending) return;
    setSending(true);
    setError(null);

    try {
      const convResult = await getOrCreateConversationAction(recipient.id);
      if ("error" in convResult) { setError(convResult.error); setSending(false); return; }

      const msgResult = await sendMessageAction(convResult.id, message.trim());
      if ("error" in msgResult) { setError(msgResult.error); setSending(false); return; }

      router.push(`/messages/${convResult.id}`);
    } catch {
      setError("Something went wrong. Please try again.");
      setSending(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-[var(--border)] bg-[var(--surface)] flex-shrink-0">
        <Link href="/messages" className="p-1.5 -ml-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </Link>
        <h1 className="font-semibold text-sm">New Message</h1>
      </header>

      <div className="flex-1 flex flex-col gap-6 p-6 overflow-y-auto">
        {/* Error banner */}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3">
            {error}
          </div>
        )}

        {/* Recipient selector */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">To</label>

          {recipient ? (
            <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--accent)] bg-[#fde8df]">
              <AvatarPlaceholder name={recipient.display_name} role={recipient.role} />
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-sm">{recipient.display_name}</p>
                <p className="text-xs text-[var(--muted)] capitalize">@{recipient.username} · {recipient.role}</p>
              </div>
              <button
                onClick={() => { setRecipient(null); setUserSearch(""); setSearchResults([]); }}
                className="text-xs text-[var(--muted)] hover:text-red-500 transition-colors px-2 py-1 rounded-lg hover:bg-red-50"
              >
                Change
              </button>
            </div>
          ) : (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
              <input
                type="text"
                placeholder="Search by name or username…"
                value={userSearch}
                onChange={(e) => setUserSearch(e.target.value)}
                autoFocus
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
              />
              {searchResults.length > 0 && (
                <div className="absolute top-full mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-10 overflow-hidden">
                  {searchResults.map((u) => (
                    <button
                      key={u.id}
                      onClick={() => { setRecipient(u); setUserSearch(""); setSearchResults([]); }}
                      className="w-full flex items-center gap-3 px-4 py-3 hover:bg-[#fde8df] transition-colors text-left"
                    >
                      <AvatarPlaceholder name={u.display_name} role={u.role} />
                      <div>
                        <p className="font-medium text-sm">{u.display_name}</p>
                        <p className="text-xs text-[var(--muted)] capitalize">@{u.username} · {u.role}</p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
              {userSearch.length >= 2 && searchResults.length === 0 && (
                <div className="absolute top-full mt-1 w-full bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-lg z-10 px-4 py-3 text-sm text-[var(--muted)]">
                  No users found.
                </div>
              )}
            </div>
          )}
        </div>

        {/* Message composer */}
        {recipient && (
          <div className="flex flex-col gap-2 flex-1">
            <label className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Message</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={`Say something to ${recipient.display_name}…`}
              className="flex-1 min-h-40 w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition leading-relaxed"
              autoFocus
            />
          </div>
        )}

        {/* Send button */}
        {recipient && (
          <button
            onClick={handleSend}
            disabled={!message.trim() || sending}
            className={clsx(
              "self-end flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              message.trim() && !sending
                ? "bg-[var(--accent)] text-white hover:opacity-90"
                : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            )}
          >
            <Send className="w-4 h-4" />
            {sending ? "Sending…" : "Send Message"}
          </button>
        )}
      </div>
    </div>
  );
}

export default function NewMessagePage() {
  return (
    <Suspense>
      <NewMessageInner />
    </Suspense>
  );
}
