import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import {
  MapPin,
  Globe,
  MessageCircle,
  ArrowLeft,
  BookOpen,
  Brush,
  FileText,
  Plus,
  Pencil,
} from "lucide-react";
import { getWriterByUsername, getCurrentUserProfile } from "@/lib/supabase/queries";
import { MOCK_WRITERS } from "@/lib/mock-data";
import { WriterProfile } from "@/lib/types";
import ProjectCard from "@/components/ProjectCard";
import clsx from "clsx";

export const dynamic = "force-dynamic";

async function resolveWriter(username: string): Promise<WriterProfile | null> {
  const writer = await getWriterByUsername(username);
  if (writer) return writer;
  return MOCK_WRITERS.find((w) => w.username === username) ?? null;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ username: string }>;
}): Promise<Metadata> {
  const { username } = await params;
  const writer = await resolveWriter(username);
  if (!writer) return { title: "Writer Not Found" };

  const description = writer.bio
    ? writer.bio.slice(0, 155)
    : `${writer.display_name} is a writer on Toonect looking for artists in ${writer.looking_for.join(", ")}.`;

  return {
    title: writer.display_name,
    description,
    alternates: { canonical: `/writers/${writer.username}` },
    openGraph: { title: `${writer.display_name} (@${writer.username})`, description },
  };
}

const STYLE_COLORS: Record<string, string> = {
  manhwa: "bg-pink-100 text-pink-700 border-pink-200",
  manga: "bg-blue-100 text-blue-700 border-blue-200",
  manhua: "bg-amber-100 text-amber-700 border-amber-200",
  webtoon: "bg-purple-100 text-purple-700 border-purple-200",
  comic: "bg-green-100 text-green-700 border-green-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

function AvatarPlaceholder({ name, large }: { name: string; large?: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const colors = [
    "bg-teal-200 text-teal-800",
    "bg-indigo-200 text-indigo-800",
    "bg-rose-200 text-rose-800",
    "bg-cyan-200 text-cyan-800",
    "bg-lime-200 text-lime-800",
    "bg-violet-200 text-violet-800",
  ];
  const color = colors[name.charCodeAt(0) % colors.length];
  return (
    <div
      className={clsx(
        "flex items-center justify-center font-bold rounded-full",
        color,
        large ? "w-24 h-24 text-3xl" : "w-16 h-16 text-xl"
      )}
    >
      {initials}
    </div>
  );
}

export default async function WriterProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  const writer = await resolveWriter(username);
  if (!writer) notFound();

  // Check if the current viewer owns this profile
  const { profile: viewerProfile } = await getCurrentUserProfile();
  const isOwner = viewerProfile?.id === writer.id;

  const openProjects = writer.projects.filter((p) => p.status === "open");
  const otherProjects = writer.projects.filter((p) => p.status !== "open");

  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    mainEntity: {
      "@type": "Person",
      name: writer.display_name,
      alternateName: writer.username,
      description: writer.bio ?? undefined,
      url: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://toonect.vercel.app"}/writers/${writer.username}`,
      image: writer.avatar_url ?? undefined,
      jobTitle: "Writer",
    },
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

      {/* Breadcrumb */}
      <nav aria-label="Breadcrumb" className="flex items-center gap-1.5 text-sm text-[var(--muted)] mb-8">
        <Link href="/browse?role=writers" className="hover:text-[var(--foreground)] transition-colors flex items-center gap-1.5">
          <ArrowLeft className="w-4 h-4" />
          Browse
        </Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page" className="text-[var(--foreground)] font-medium">{writer.display_name}</span>
      </nav>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-5">
          {/* Profile card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center text-center gap-4">
            {writer.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={writer.avatar_url}
                alt={writer.display_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <AvatarPlaceholder name={writer.display_name} large />
            )}

            <div>
              <div className="flex items-center justify-center gap-1.5 mb-1">
                <BookOpen className="w-4 h-4 text-[var(--accent)]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[var(--accent)]">Writer</span>
              </div>
              <h1 className="text-xl font-bold">{writer.display_name}</h1>
              <p className="text-sm text-[var(--muted)]">@{writer.username}</p>
            </div>

            {/* Project count */}
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium bg-[#fde8df] text-[var(--accent)]">
              <FileText className="w-4 h-4" />
              {openProjects.length} open project{openProjects.length !== 1 ? "s" : ""}
            </div>

            {/* Location & website */}
            <div className="flex flex-col gap-1.5 w-full text-sm text-[var(--muted)]">
              {writer.location && (
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {writer.location}
                </div>
              )}
              {writer.website && (
                <a
                  href={writer.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-1.5 hover:text-[var(--accent)] transition-colors"
                >
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  Website
                </a>
              )}
            </div>

            <Link
              href={`/messages/new?to=${writer.username}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </Link>
          </div>

          {/* Details card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
            {/* Genres */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Genres Written</h2>
              <div className="flex flex-wrap gap-2">
                {writer.genres.map((g) => (
                  <span key={g} className="px-3 py-1 rounded-full text-sm bg-[#fde8df] text-[var(--accent)] font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Looking for */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Looking for</h2>
              <div className="flex flex-wrap gap-2">
                {writer.looking_for.map((style) => (
                  <span
                    key={style}
                    className={clsx("px-3 py-1 rounded-full text-sm font-semibold capitalize border", STYLE_COLORS[style])}
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Work types across projects */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Offering</h2>
              <div className="flex flex-wrap gap-2">
                {[...new Set(writer.projects.map((p) => p.work_type))].map((wt) => (
                  <span key={wt} className="px-3 py-1 rounded-full text-sm bg-[#f3f4f6] border border-[var(--border)] capitalize">
                    {wt === "commissioned" ? "Commission" : wt === "contracted" ? "Contract" : "Free Collab"}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </aside>

        {/* Main content */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Bio */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <h2 className="font-bold text-lg mb-3">About</h2>
            <p className="text-[var(--muted)] leading-relaxed">{writer.bio ?? "No bio yet."}</p>
          </div>

          {/* Open Projects */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between mb-5">
              <div>
                <h2 className="font-bold text-lg">Open Projects</h2>
                <p className="text-sm text-[var(--muted)] mt-0.5">Stories looking for an artist</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-[var(--accent)] bg-[#fde8df] px-3 py-1 rounded-full">
                  {openProjects.length} open
                </span>
                {isOwner && (
                  <Link
                    href="/projects/new"
                    className="flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[var(--accent)] text-white text-xs font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    New
                  </Link>
                )}
              </div>
            </div>

            {openProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-14 h-14 rounded-2xl bg-[#fde8df] flex items-center justify-center mb-3">
                  <Brush className="w-7 h-7 text-[var(--accent)]" />
                </div>
                <p className="font-medium text-[var(--muted)]">No open projects</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {isOwner
                    ? "Post your first story brief to start finding artists."
                    : "This writer isn't actively seeking an artist right now."}
                </p>
                {isOwner && (
                  <Link
                    href="/projects/new"
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Plus className="w-4 h-4" />
                    Post a Project
                  </Link>
                )}
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {openProjects.map((project) => (
                  <div key={project.id} className="relative group/proj">
                    <ProjectCard
                      project={project}
                      writerUsername={writer!.username}
                      writerName={writer!.display_name}
                      compact
                    />
                    {isOwner && (
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all opacity-0 group-hover/proj:opacity-100"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Past / in-progress projects */}
          {otherProjects.length > 0 && (
            <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
              <h2 className="font-bold text-lg mb-5">Other Projects</h2>
              <div className="flex flex-col gap-4">
                {otherProjects.map((project) => (
                  <div key={project.id} className="relative group/proj">
                    <ProjectCard
                      project={project}
                      writerUsername={writer!.username}
                      writerName={writer!.display_name}
                      compact
                    />
                    {isOwner && (
                      <Link
                        href={`/projects/${project.id}/edit`}
                        className="absolute top-3 right-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 border border-[var(--border)] text-xs font-semibold hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all opacity-0 group-hover/proj:opacity-100"
                      >
                        <Pencil className="w-3 h-3" />
                        Edit
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-[var(--muted)] text-right">
            Member since {new Date(writer.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
