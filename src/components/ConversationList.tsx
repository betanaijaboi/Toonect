"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Edit } from "lucide-react";
import { ConversationWithParticipant } from "@/lib/types";
import clsx from "clsx";

function AvatarPlaceholder({ name, role }: { name: string; role: "artist" | "writer" }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const artistColors = ["bg-orange-200 text-orange-800", "bg-pink-200 text-pink-800", "bg-blue-200 text-blue-800"];
  const writerColors = ["bg-teal-200 text-teal-800", "bg-indigo-200 text-indigo-800", "bg-violet-200 text-violet-800"];
  const palette = role === "artist" ? artistColors : writerColors;
  const color = palette[name.charCodeAt(0) % palette.length];
  return (
    <div className={clsx("w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0", color)}>
      {initials}
    </div>
  );
}

function formatTime(iso: string) {
  const date = new Date(iso);
  const now = new Date();
  const diffDays = Math.floor((now.getTime() - date.getTime()) / 86400000);
  if (diffDays === 0) return date.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  if (diffDays === 1) return "Yesterday";
  if (diffDays < 7) return date.toLocaleDateString("en-US", { weekday: "short" });
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

interface ConversationListProps {
  conversations: ConversationWithParticipant[];
  currentUserId: string;
}

export default function ConversationList({ conversations, currentUserId }: ConversationListProps) {
  const pathname = usePathname();
  const totalUnread = conversations.reduce((n, c) => n + c.unread_count, 0);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-4 border-b border-[var(--border)]">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-base">Messages</h2>
          {totalUnread > 0 && (
            <span className="bg-[var(--accent)] text-white text-xs font-bold rounded-full px-1.5 py-0.5 leading-none">
              {totalUnread}
            </span>
          )}
        </div>
        <Link
          href="/messages/new"
          className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-[#f3f4f6] transition-colors"
          title="New message"
        >
          <Edit className="w-4 h-4 text-[var(--muted)]" />
        </Link>
      </div>

      {/* List */}
      <nav className="flex-1 overflow-y-auto">
        {conversations.length === 0 ? (
          <p className="text-sm text-[var(--muted)] text-center py-12 px-4">No conversations yet.</p>
        ) : (
          conversations.map((c) => {
            const isActive = pathname === `/messages/${c.id}`;
            const isOwnLast = c.last_message_sender_id === currentUserId;

            return (
              <Link
                key={c.id}
                href={`/messages/${c.id}`}
                className={clsx(
                  "flex items-start gap-3 px-4 py-3.5 border-b border-[var(--border)] transition-colors",
                  isActive ? "bg-[#fde8df]" : "hover:bg-[#f3f4f6]"
                )}
              >
                <AvatarPlaceholder name={c.other_user.display_name} role={c.other_user.role} />

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className={clsx("text-sm truncate", c.unread_count > 0 ? "font-bold" : "font-medium")}>
                      {c.other_user.display_name}
                    </span>
                    <span className="text-xs text-[var(--muted)] flex-shrink-0">
                      {formatTime(c.last_message_at)}
                    </span>
                  </div>

                  <div className="flex items-center justify-between gap-2 mt-0.5">
                    <p className={clsx("text-xs truncate", c.unread_count > 0 ? "text-[var(--foreground)] font-medium" : "text-[var(--muted)]")}>
                      {isOwnLast ? <span className="text-[var(--muted)]">You: </span> : null}
                      {c.last_message}
                    </p>
                    {c.unread_count > 0 && (
                      <span className="bg-[var(--accent)] text-white text-xs font-bold rounded-full w-4 h-4 flex items-center justify-center flex-shrink-0">
                        {c.unread_count}
                      </span>
                    )}
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </nav>
    </div>
  );
}
