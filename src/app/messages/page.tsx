import Link from "next/link";
import { MessageCircle, Edit } from "lucide-react";
import { getCurrentUserProfile, getConversations } from "@/lib/supabase/queries";
import ConversationList from "@/components/ConversationList";

export const dynamic = "force-dynamic";

export default async function MessagesIndexPage() {
  const { user } = await getCurrentUserProfile();
  const conversations = user ? await getConversations(user.id) : [];

  return (
    <>
      {/* Mobile: show conversation list */}
      <div className="sm:hidden flex flex-col h-full">
        <ConversationList
          conversations={conversations}
          currentUserId={user?.id ?? ""}
        />
      </div>

      {/* Desktop: empty state prompting to pick a conversation */}
      <div className="hidden sm:flex flex-col items-center justify-center flex-1 gap-4 text-center px-6">
        <div className="w-16 h-16 rounded-2xl bg-[#fde8df] flex items-center justify-center">
          <MessageCircle className="w-8 h-8 text-[var(--accent)]" />
        </div>
        <div>
          <h2 className="font-bold text-lg">Your Messages</h2>
          <p className="text-sm text-[var(--muted)] mt-1 max-w-xs">
            Select a conversation from the sidebar, or start a new one by visiting an artist or writer&apos;s profile.
          </p>
        </div>
        <Link
          href="/messages/new"
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <Edit className="w-4 h-4" />
          New Message
        </Link>
      </div>
    </>
  );
}
