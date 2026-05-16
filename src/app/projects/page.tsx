import { getOpenProjects, getCurrentUserProfile } from "@/lib/supabase/queries";
import { MOCK_WRITERS } from "@/lib/mock-data";
import { ArtStyle, WorkType, ProjectStatus } from "@/lib/types";
import ProjectsClient from "./ProjectsClient";

export const dynamic = "force-dynamic";

interface ProjectRow {
  id: string;
  writer_id: string;
  title: string;
  description: string;
  genre: string;
  style_wanted: ArtStyle[];
  work_type: WorkType;
  status: ProjectStatus;
  created_at: string;
  writerUsername: string;
  writerName: string;
  writerLocation: string | null;
}

function mockProjects(): ProjectRow[] {
  return MOCK_WRITERS.flatMap((writer) =>
    writer.projects
      .filter((p) => p.status === "open")
      .map((p) => ({
        ...p,
        writerUsername: writer.username,
        writerName: writer.display_name,
        writerLocation: writer.location ?? null,
      }))
  );
}

export default async function ProjectsBoardPage() {
  const [rows, { profile }] = await Promise.all([
    getOpenProjects(),
    getCurrentUserProfile(),
  ]);

  const projects: ProjectRow[] =
    rows.length > 0 ? (rows as ProjectRow[]) : mockProjects();

  return (
    <ProjectsClient
      projects={projects}
      isWriter={profile?.role === "writer"}
      currentUserId={profile?.id ?? null}
    />
  );
}
