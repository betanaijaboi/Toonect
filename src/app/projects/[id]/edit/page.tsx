import { notFound, redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import { createClient } from "@/lib/supabase/server";
import { ArtStyle, WorkType, ProjectStatus } from "@/lib/types";
import ProjectForm from "../../ProjectForm";

export const dynamic = "force-dynamic";

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile) redirect(`/auth/login?next=/projects/${id}/edit`);
  if (profile.role !== "writer") redirect("/projects");

  const supabase = await createClient();
  const { data: project } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .eq("writer_id", user.id) // enforce ownership at DB level too
    .single();

  if (!project) notFound();

  return (
    <ProjectForm
      mode="edit"
      initial={{
        id: project.id,
        title: project.title,
        description: project.description,
        genre: project.genre,
        style_wanted: (project.style_wanted ?? []) as ArtStyle[],
        work_type: project.work_type as WorkType,
        status: project.status as ProjectStatus,
      }}
    />
  );
}
