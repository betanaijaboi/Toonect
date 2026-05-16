import Link from "next/link";
import { ArrowRight, Brush, BookOpen, Zap, Shield, Globe, FileText } from "lucide-react";
import ArtistCard from "@/components/ArtistCard";
import ProjectCard from "@/components/ProjectCard";
import AnimateIn from "@/components/AnimateIn";
import { getArtists, getOpenProjects } from "@/lib/supabase/queries";
import { MOCK_ARTISTS, MOCK_WRITERS } from "@/lib/mock-data";
import type { WriterProject } from "@/lib/types";

type ProjectWithMeta = WriterProject & { writerUsername: string; writerName: string; writerLocation: string | null };

export const revalidate = 60;

const MOCK_LATEST_PROJECTS = MOCK_WRITERS.flatMap((w) =>
  w.projects
    .filter((p) => p.status === "open")
    .map((p) => ({ ...p, writerUsername: w.username, writerName: w.display_name, writerLocation: w.location ?? null }))
).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 3);

const HOW_IT_WORKS = [
  {
    icon: <BookOpen className="w-7 h-7 text-[var(--accent)]" />,
    step: "01",
    title: "Post Your Story",
    desc: "Share your story idea, genre, preferred art style, and whether you're looking for free, commissioned, or contracted work.",
  },
  {
    icon: <Brush className="w-7 h-7 text-[var(--accent)]" />,
    step: "02",
    title: "Browse & Connect",
    desc: "Explore artists' portfolios filtered by style — manhwa, manga, manhua — and reach out directly with no middleman fees.",
  },
  {
    icon: <Zap className="w-7 h-7 text-[var(--accent)]" />,
    step: "03",
    title: "Create Together",
    desc: "Collaborate on your terms. Agree on scope, timeline, and payment directly. Toonect gets out of the way.",
  },
];

const VALUE_PROPS = [
  {
    icon: <Shield className="w-6 h-6 text-[var(--accent)]" />,
    title: "Zero Platform Fees",
    desc: "We never take a cut. What you negotiate is what you keep.",
  },
  {
    icon: <Globe className="w-6 h-6 text-[var(--accent)]" />,
    title: "Global Creative Pool",
    desc: "Artists and writers from Korea, Japan, China, and worldwide.",
  },
  {
    icon: <Zap className="w-6 h-6 text-[var(--accent)]" />,
    title: "All Work Types",
    desc: "Free collabs, paid commissions, and full contracted projects — all welcome.",
  },
];

export default async function HomePage() {
  const [dbArtists, dbProjects] = await Promise.all([
    getArtists().catch(() => []),
    getOpenProjects().catch(() => []),
  ]);

  const featuredArtists = dbArtists.length > 0 ? dbArtists.slice(0, 8) : MOCK_ARTISTS.slice(0, 8);
  const latestProjects = (dbProjects.length > 0 ? dbProjects.slice(0, 3) : MOCK_LATEST_PROJECTS) as ProjectWithMeta[];

  return (
    <div className="flex flex-col">
      {/* ── Hero ─────────────────────────────────────────── */}
      <section className="hero-bg relative overflow-hidden px-4 py-20 sm:py-32 text-center">
        {/* Subtle grid overlay */}
        <div className="absolute inset-0 opacity-[0.04] pointer-events-none" aria-hidden>
          <div className="grid grid-cols-6 grid-rows-4 h-full w-full">
            {Array.from({ length: 24 }).map((_, i) => (
              <div key={i} className="border border-black" />
            ))}
          </div>
        </div>

        {/* Floating decorative blobs */}
        <div className="float-blob absolute top-16 left-8 w-32 h-32 rounded-full bg-[var(--accent)] opacity-5 blur-2xl pointer-events-none" aria-hidden />
        <div className="float-blob-2 absolute bottom-12 right-12 w-48 h-48 rounded-full bg-orange-300 opacity-10 blur-3xl pointer-events-none" aria-hidden />

        <div className="relative max-w-4xl mx-auto">
          <span className="animate-fade-up anim-delay-1 inline-block text-xs font-semibold uppercase tracking-widest text-[var(--accent)] bg-[#fde8df] px-3 py-1 rounded-full mb-6">
            For Writers &amp; Comic Artists
          </span>

          <h1 className="animate-fade-up anim-delay-2 text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Where Stories
            <br />
            <span className="text-[var(--accent)]">Find Their Art</span>
          </h1>

          <p className="animate-fade-up anim-delay-3 text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with talented manga, manhwa, and manhua artists ready to bring
            your story to life — free collaborations, commissioned pieces, or
            full contracted projects.
          </p>

          <div className="animate-fade-up anim-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:opacity-90 transition-opacity shadow-lg hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200"
            >
              Find an Artist
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/auth/signup?role=artist"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl border-2 border-[var(--foreground)] font-semibold text-base hover:bg-[var(--foreground)] hover:text-[var(--background)] hover:-translate-y-0.5 transition-all duration-200"
            >
              <Brush className="w-4 h-4" />
              Join as Artist
            </Link>
          </div>

          <p className="animate-fade-up anim-delay-5 mt-6 text-sm text-[var(--muted)]">
            Free to join · No commissions taken · Direct collaboration
          </p>
        </div>
      </section>

      {/* ── Style tags ───────────────────────────────────── */}
      <AnimateIn>
        <section className="py-8 border-y border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-3">
              {["Manhwa", "Manga", "Manhua", "Webtoon", "Fantasy", "Romance", "Action", "Sci-Fi", "Horror", "Slice of Life", "Thriller"].map(
                (tag) => (
                  <Link
                    key={tag}
                    href={`/browse?style=${tag.toLowerCase()}`}
                    className="px-4 py-1.5 rounded-full text-sm font-medium bg-[#f3f4f6] hover:bg-[#fde8df] hover:text-[var(--accent)] border border-[var(--border)] transition-colors hover:-translate-y-0.5 transition-transform duration-150"
                  >
                    {tag}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ── Featured Artists ─────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <AnimateIn className="flex items-center justify-between mb-10">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Artists</h2>
            <p className="text-[var(--muted)] mt-1">Talented creators ready for your next project</p>
          </div>
          <Link
            href="/browse"
            className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
          >
            View all <ArrowRight className="w-4 h-4" />
          </Link>
        </AnimateIn>

        <AnimateIn delay={0.1}>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {featuredArtists.map((artist) => (
              <ArtistCard key={artist.id} artist={artist} />
            ))}
          </div>
        </AnimateIn>

        <div className="mt-8 text-center sm:hidden">
          <Link href="/browse" className="inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline">
            View all artists <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Latest Story Briefs ──────────────────────────── */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <AnimateIn className="flex items-center justify-between mb-10">
            <div>
              <h2 className="text-2xl sm:text-3xl font-bold">Latest Story Briefs</h2>
              <p className="text-[var(--muted)] mt-1">Writers actively looking for an artist right now</p>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1 text-sm font-medium text-[var(--accent)] hover:underline"
            >
              View all <ArrowRight className="w-4 h-4" />
            </Link>
          </AnimateIn>

          <AnimateIn delay={0.1}>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {latestProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  writerUsername={project.writerUsername}
                  writerName={project.writerName}
                />
              ))}
            </div>
          </AnimateIn>

          <div className="mt-8 flex justify-center sm:hidden">
            <Link
              href="/projects"
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <FileText className="w-4 h-4" />
              Browse all projects
            </Link>
          </div>
        </div>
      </section>

      {/* ── How it works ─────────────────────────────────── */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <AnimateIn className="text-center mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold mb-4">How Toonect Works</h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto">
              From concept to panels in three simple steps
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <AnimateIn key={item.step} delay={i * 0.12}>
                <div className="flex flex-col items-start gap-4">
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#fde8df] hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-bold tracking-widest text-[var(--muted)]">STEP {item.step}</span>
                    <h3 className="text-lg font-bold mt-1">{item.title}</h3>
                    <p className="text-sm text-[var(--muted)] mt-2 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Value props ──────────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          {VALUE_PROPS.map((item, i) => (
            <AnimateIn key={item.title} delay={i * 0.1}>
              <div className="flex flex-col gap-3 p-6 rounded-2xl border border-[var(--border)] bg-[var(--surface)] hover:border-[var(--accent)] hover:shadow-md transition-all duration-200 group">
                <div className="w-10 h-10 rounded-xl bg-[#fde8df] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <h3 className="font-bold text-base">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── CTA Banner ───────────────────────────────────── */}
      <AnimateIn>
        <section className="mx-4 mb-16 rounded-3xl bg-[var(--foreground)] text-[var(--background)] p-10 sm:p-16 text-center max-w-7xl lg:mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
            Your story deserves to be seen.
          </h2>
          <p className="text-base sm:text-lg opacity-70 mb-8 max-w-xl mx-auto">
            Join thousands of writers and artists already building the next great manhwa, manga, or manhua.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/auth/signup?role=writer"
              className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              I&apos;m a Writer
            </Link>
            <Link
              href="/auth/signup?role=artist"
              className="px-8 py-3.5 rounded-xl bg-white text-[var(--foreground)] font-semibold hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
            >
              I&apos;m an Artist
            </Link>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}
