"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";
import { ArtStyle, WorkType, ProjectStatus } from "./types";

export interface ProjectFormData {
  title: string;
  description: string;
  genre: string;
  style_wanted: ArtStyle[];
  work_type: WorkType;
}

// ─── helpers ─────────────────────────────────────────────────

async function getWriterUsername(supabase: Awaited<ReturnType<typeof createClient>>, userId: string) {
  const { data } = await supabase
    .from("profiles")
    .select("username")
    .eq("id", userId)
    .single();
  return data?.username ?? null;
}

async function verifyOwnership(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string,
  userId: string
) {
  const { data } = await supabase
    .from("projects")
    .select("writer_id")
    .eq("id", projectId)
    .single();
  return data?.writer_id === userId;
}

// ─── actions ─────────────────────────────────────────────────

export async function createProject(
  data: ProjectFormData
): Promise<{ id: string } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, username")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "writer") {
    return { error: "Only writers can post projects." };
  }

  const { data: project, error } = await supabase
    .from("projects")
    .insert({
      writer_id: user.id,
      title: data.title.trim(),
      description: data.description.trim(),
      genre: data.genre.trim(),
      style_wanted: data.style_wanted,
      work_type: data.work_type,
      status: "open",
    })
    .select("id")
    .single();

  if (error) return { error: error.message };

  revalidatePath("/projects");
  revalidatePath(`/writers/${profile.username}`);

  return { id: project.id };
}

export async function updateProject(
  projectId: string,
  data: ProjectFormData & { status: ProjectStatus }
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const owned = await verifyOwnership(supabase, projectId, user.id);
  if (!owned) return { error: "Not authorized to edit this project." };

  const { error } = await supabase
    .from("projects")
    .update({
      title: data.title.trim(),
      description: data.description.trim(),
      genre: data.genre.trim(),
      style_wanted: data.style_wanted,
      work_type: data.work_type,
      status: data.status,
    })
    .eq("id", projectId);

  if (error) return { error: error.message };

  const username = await getWriterUsername(supabase, user.id);
  revalidatePath("/projects");
  if (username) revalidatePath(`/writers/${username}`);

  return { success: true };
}

export async function deleteProject(
  projectId: string
): Promise<{ success: true } | { error: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth/login");

  const owned = await verifyOwnership(supabase, projectId, user.id);
  if (!owned) return { error: "Not authorized to delete this project." };

  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", projectId);

  if (error) return { error: error.message };

  const username = await getWriterUsername(supabase, user.id);
  revalidatePath("/projects");
  if (username) revalidatePath(`/writers/${username}`);

  return { success: true };
}
