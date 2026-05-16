import { redirect } from "next/navigation";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import ProjectForm from "../ProjectForm";

export const dynamic = "force-dynamic";

export default async function NewProjectPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile) redirect("/auth/login?next=/projects/new");
  if (profile.role !== "writer") redirect("/projects");

  return <ProjectForm mode="create" />;
}
