"use server";

import { getCurrentUserProfile, sendMessage, getOrCreateConversation } from "./supabase/queries";

export async function sendMessageAction(
  conversationId: string,
  content: string
): Promise<{ id: string; conversation_id: string; sender_id: string; content: string; created_at: string } | { error: string }> {
  const { user } = await getCurrentUserProfile();
  if (!user) return { error: "Not authenticated" };

  const message = await sendMessage(conversationId, user.id, content);
  if (!message) return { error: "Failed to send message" };

  return message;
}

export async function getOrCreateConversationAction(
  otherUserId: string
): Promise<{ id: string } | { error: string }> {
  const { user } = await getCurrentUserProfile();
  if (!user) return { error: "Not authenticated" };

  const id = await getOrCreateConversation(user.id, otherUserId);
  if (!id) return { error: "Failed to create conversation" };

  return { id };
}
