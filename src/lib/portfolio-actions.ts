"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { ArtStyle } from "./types";

export interface PortfolioItemInput {
  image_url: string;
  title: string;
  description: string | null;
  style: ArtStyle;
}

export async function addPortfolioItem(
  data: PortfolioItemInput
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: item, error } = await supabase
    .from("portfolio_items")
    .insert({
      artist_id: user.id,
      image_url: data.image_url,
      title: data.title.trim(),
      description: data.description?.trim() || null,
      style: data.style,
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  // Revalidate the artist's public profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/portfolio");
  if (profile) revalidatePath(`/artists/${profile.username}`);

  return { id: item.id };
}

export async function deletePortfolioItem(
  itemId: string,
  storagePath: string | null
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  // Verify ownership (RLS also enforces this)
  const { data: item } = await supabase
    .from("portfolio_items")
    .select("artist_id")
    .eq("id", itemId)
    .single();

  if (!item || item.artist_id !== user.id) {
    return { error: "Not authorized." };
  }

  // Delete DB record
  const { error: dbError } = await supabase
    .from("portfolio_items")
    .delete()
    .eq("id", itemId);

  if (dbError) return { error: dbError.message };

  // Best-effort: also remove from storage
  if (storagePath) {
    await supabase.storage.from("portfolio").remove([storagePath]);
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", user.id)
    .single();

  revalidatePath("/portfolio");
  if (profile) revalidatePath(`/artists/${profile.username}`);

  return { success: true };
}
