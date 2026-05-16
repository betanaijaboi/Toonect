"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export interface ProfileUpdateData {
  display_name: string;
  bio: string | null;
  location: string | null;
  website: string | null;
  avatar_url: string | null;
  // artist-only
  art_styles?: string[];
  work_types?: string[];
  availability?: string;
  price_range_min?: number | null;
  price_range_max?: number | null;
  genres?: string[];
  languages?: string[];
  // writer-only
  looking_for?: string[];
}

export async function updateProfile(
  data: ProfileUpdateData
): Promise<{ success: true; username: string } | { error: string }> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/auth/login");

  // Get role + username
  const { data: profile, error: profileFetchError } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .single();

  if (profileFetchError || !profile) return { error: "Profile not found." };

  // Update base profile
  const { error: baseError } = await supabase
    .from("profiles")
    .update({
      display_name: data.display_name.trim(),
      bio: data.bio?.trim() || null,
      location: data.location?.trim() || null,
      website: data.website?.trim() || null,
      ...(data.avatar_url !== null ? { avatar_url: data.avatar_url } : {}),
    })
    .eq("id", user.id);

  if (baseError) return { error: baseError.message };

  // Update role-specific sub-profile
  if (profile.role === "artist") {
    const { error: artistError } = await supabase
      .from("artist_profiles")
      .update({
        art_styles: data.art_styles ?? [],
        work_types: data.work_types ?? [],
        availability: data.availability ?? "available",
        price_range_min: data.price_range_min ?? null,
        price_range_max: data.price_range_max ?? null,
        genres: data.genres ?? [],
        languages: data.languages ?? [],
      })
      .eq("id", user.id);

    if (artistError) return { error: artistError.message };
  } else {
    const { error: writerError } = await supabase
      .from("writer_profiles")
      .update({
        genres: data.genres ?? [],
        looking_for: data.looking_for ?? [],
      })
      .eq("id", user.id);

    if (writerError) return { error: writerError.message };
  }

  revalidatePath("/settings");
  revalidatePath(`/${profile.role === "artist" ? "artists" : "writers"}/${profile.username}`);
  revalidatePath("/browse");

  return { success: true, username: profile.username };
}
