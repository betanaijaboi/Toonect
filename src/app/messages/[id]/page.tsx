import { notFound, redirect } from "next/navigation";
import {
  getCurrentUserProfile,
  getConversations,
  getMessages,
  markConversationRead,
} from "@/lib/supabase/queries";
import ConversationThread from "./ConversationThread";

export const dynamic = "force-dynamic";

export default async function ConversationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user } = await getCurrentUserProfile();

  if (!user) redirect("/auth/login?next=/messages");

  // Fetch conversations (to find this one) and messages in parallel
  const [conversations, messages] = await Promise.all([
    getConversations(user.id),
    getMessages(id),
  ]);

  const conversation = conversations.find((c) => c.id === id);
  if (!conversation) notFound();

  // Mark as read (fire and forget — no await needed in UI path)
  markConversationRead(id, user.id).catch(() => {});

  return (
    <ConversationThread
      conversation={conversation}
      initialMessages={messages}
      currentUserId={user.id}
    />
  );
}
