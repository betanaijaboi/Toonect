import { getCurrentUserProfile, getConversations } from "@/lib/supabase/queries";
import ConversationList from "@/components/ConversationList";

export const dynamic = "force-dynamic";

export default async function MessagesLayout({ children }: { children: React.ReactNode }) {
  const { user } = await getCurrentUserProfile();

  const conversations = user ? await getConversations(user.id) : [];

  return (
    <div className="max-w-7xl mx-auto h-[calc(100vh-4rem)] flex border-x border-[var(--border)]">
      {/* Sidebar — hidden on mobile when in a thread */}
      <aside className="w-80 flex-shrink-0 border-r border-[var(--border)] bg-[var(--surface)] hidden sm:flex flex-col">
        <ConversationList
          conversations={conversations}
          currentUserId={user?.id ?? ""}
        />
      </aside>

      {/* Main panel */}
      <div className="flex-1 min-w-0 flex flex-col bg-[var(--background)]">
        {children}
      </div>
    </div>
  );
}
