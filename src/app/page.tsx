import Link from "next/link";
import { ArrowRight, Brush, BookOpen, Zap, Shield, Globe, FileText, Users, Star } from "lucide-react";
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

const STATS = [
  { value: "1,200+", label: "Artists",       icon: <Brush className="w-3.5 h-3.5" /> },
  { value: "340+",   label: "Open Projects", icon: <FileText className="w-3.5 h-3.5" /> },
  { value: "42",     label: "Countries",     icon: <Globe className="w-3.5 h-3.5" /> },
  { value: "Free",   label: "Always",        icon: <Star className="w-3.5 h-3.5" /> },
];

const STYLE_SHOWCASE = [
  {
    key: "manhwa",
    label: "Manhwa",
    origin: "🇰🇷 Korea",
    gradientClass: "from-pink-500 to-rose-500",
    bgClass: "bg-pink-50",
    borderClass: "border-pink-200",
    desc: "Full-colour vertical webtoons with cinematic panel flow.",
  },
  {
    key: "manga",
    label: "Manga",
    origin: "🇯🇵 Japan",
    gradientClass: "from-blue-500 to-indigo-500",
    bgClass: "bg-blue-50",
    borderClass: "border-blue-200",
    desc: "Black & white ink mastery — expressive lines, speed, emotion.",
  },
  {
    key: "manhua",
    label: "Manhua",
    origin: "🇨🇳 China",
    gradientClass: "from-amber-500 to-orange-500",
    bgClass: "bg-amber-50",
    borderClass: "border-amber-200",
    desc: "Vibrant painted colour with rich historical & fantasy themes.",
  },
];

/* SVG speed lines radiating from centre — classic manga action bg */
function SpeedLines() {
  const count = 48;
  const cx = 450, cy = 210;
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 900 480"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      {Array.from({ length: count }).map((_, i) => {
        const angle = (i / count) * Math.PI * 2;
        return (
          <line
            key={i}
            x1={cx + Math.cos(angle) * 55}
            y1={cy + Math.sin(angle) * 55}
            x2={cx + Math.cos(angle) * 720}
            y2={cy + Math.sin(angle) * 720}
            stroke="#0f0f0f"
            strokeWidth={i % 4 === 0 ? "0.9" : "0.4"}
            opacity={i % 4 === 0 ? "0.06" : "0.025"}
          />
        );
      })}
    </svg>
  );
}

/* Action burst star shape */
function ActionBurst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 80 80" className={`pointer-events-none select-none ${className ?? ""}`} aria-hidden>
      <polygon
        points="40,2 44,32 74,20 55,44 78,60 46,52 48,78 34,58 8,72 24,48 2,32 30,36"
        fill="currentColor"
      />
    </svg>
  );
}

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
        {/* Manga speed-lines radiating from centre */}
        <SpeedLines />

        {/* Halftone dot ring — left */}
        <div
          className="absolute -left-20 top-8 w-56 h-56 rounded-full pointer-events-none opacity-50"
          style={{ backgroundImage: "radial-gradient(circle, rgba(232,73,15,0.10) 1.5px, transparent 1.5px)", backgroundSize: "10px 10px" }}
          aria-hidden
        />
        {/* Halftone dot ring — right */}
        <div
          className="absolute -right-16 bottom-6 w-72 h-72 rounded-full pointer-events-none opacity-35"
          style={{ backgroundImage: "radial-gradient(circle, rgba(232,73,15,0.10) 1.5px, transparent 1.5px)", backgroundSize: "12px 12px" }}
          aria-hidden
        />

        {/* Action burst decorations */}
        <ActionBurst className="absolute top-10 right-[12%] w-16 h-16 text-[var(--accent)] opacity-[0.08] speed-ring" />
        <ActionBurst className="absolute bottom-12 left-[8%]  w-10 h-10 text-[var(--accent)] opacity-[0.12] float-blob" />

        {/* Subtle panel-frame border */}
        <div
          className="absolute inset-4 sm:inset-10 border-2 border-[var(--foreground)] opacity-[0.035] rounded-3xl pointer-events-none"
          aria-hidden
        />

        <div className="relative max-w-4xl mx-auto">
          {/* Manga-style label chip */}
          <div className="animate-ink-pop anim-delay-1 inline-flex items-center gap-2 mb-6">
            <span className="inline-block text-xs font-black uppercase tracking-widest text-[var(--accent)] bg-[var(--foreground)] px-3 py-1.5 rounded-sm" style={{ transform: "skewX(-4deg)" }}>
              ★ For Writers &amp; Comic Artists
            </span>
          </div>

          <h1 className="animate-fade-up anim-delay-2 text-4xl sm:text-6xl font-extrabold tracking-tight leading-tight mb-6">
            Where Stories
            <br />
            <span className="text-[var(--accent)] relative inline-block">
              Find Their Art
              {/* Handwritten underline stroke */}
              <svg className="absolute -bottom-2 left-0 w-full overflow-visible" viewBox="0 0 400 12" preserveAspectRatio="none" aria-hidden>
                <path
                  d="M2,8 Q100,2 200,7 Q300,12 398,5"
                  stroke="currentColor" strokeWidth="3.5" fill="none"
                  strokeLinecap="round" opacity="0.55"
                />
              </svg>
            </span>
          </h1>

          <p className="animate-fade-up anim-delay-3 text-lg sm:text-xl text-[var(--muted)] max-w-2xl mx-auto mb-10 leading-relaxed">
            Connect with talented manga, manhwa, and manhua artists ready to bring
            your story to life — free collaborations, commissioned pieces, or
            full contracted projects.
          </p>

          <div className="animate-fade-up anim-delay-4 flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/browse"
              className="inline-flex items-center justify-center gap-2 px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-base hover:opacity-90 shadow-lg hover:-translate-y-0.5 transition-all duration-200"
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

      {/* ── Stats — bold ink band ─────────────────────────── */}
      <section className="bg-[var(--foreground)] text-white py-7 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 divide-x-0 sm:divide-x sm:divide-white/10">
            {STATS.map((s, i) => (
              <AnimateIn key={s.label} delay={i * 0.07} className="text-center px-4 first:pl-0 last:pr-0">
                <div className="manga-impact text-3xl sm:text-4xl text-[var(--accent)] mb-1">{s.value}</div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold uppercase tracking-widest text-gray-400">
                  {s.icon}
                  {s.label}
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Style tags ───────────────────────────────────── */}
      <AnimateIn>
        <section className="py-7 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex flex-wrap justify-center gap-2.5">
              {["Manhwa", "Manga", "Manhua", "Webtoon", "Fantasy", "Romance", "Action", "Sci-Fi", "Horror", "Slice of Life", "Thriller"].map(
                (tag) => (
                  <Link
                    key={tag}
                    href={`/browse?style=${tag.toLowerCase()}`}
                    className="px-4 py-1.5 rounded-sm text-sm font-semibold bg-[#f3f4f6] hover:bg-[var(--foreground)] hover:text-white border border-[var(--border)] hover:border-[var(--foreground)] transition-all duration-150 hover:-translate-y-0.5"
                  >
                    {tag}
                  </Link>
                )
              )}
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ── Three Traditions showcase ─────────────────────── */}
      <section className="py-16 px-4 screentone-bg border-b border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <AnimateIn className="text-center mb-10">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2">Three Styles</p>
            <h2 className="text-2xl sm:text-3xl font-extrabold mb-3">Three Traditions. One Platform.</h2>
            <p className="text-[var(--muted)] max-w-lg mx-auto text-sm">
              Whether you create in ink, pixels, or paint — you belong here.
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STYLE_SHOWCASE.map((s, i) => (
              <AnimateIn key={s.key} delay={i * 0.1}>
                <div className={`rounded-2xl border-2 ${s.borderClass} ${s.bgClass} p-6 h-full ink-panel`}>
                  <div
                    className={`inline-block bg-gradient-to-r ${s.gradientClass} text-white text-xs font-black uppercase tracking-widest px-3 py-1 rounded-sm mb-4`}
                    style={{ transform: "skewX(-3deg)" }}
                  >
                    {s.label}
                  </div>
                  <div className="text-xl font-extrabold mb-1">{s.label}</div>
                  <div className="text-xs text-[var(--muted)] mb-3">{s.origin}</div>
                  <p className="text-sm text-[var(--muted)] leading-relaxed">{s.desc}</p>
                  <Link
                    href={`/browse?style=${s.key}`}
                    className="mt-4 inline-flex items-center gap-1 text-xs font-bold text-[var(--accent)] hover:underline"
                  >
                    Browse {s.label} artists <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </AnimateIn>
            ))}
          </div>
        </div>
      </section>

      {/* ── Featured Artists ─────────────────────────────── */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <AnimateIn className="flex items-center justify-between mb-10">
          <div>
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-1">Discover</p>
            <h2 className="text-2xl sm:text-3xl font-bold">Featured Artists</h2>
            <p className="text-[var(--muted)] mt-1 text-sm">Talented creators ready for your next project</p>
          </div>
          <Link
            href="/browse"
            className="hidden sm:inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-xl border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white transition-all duration-150"
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

      {/* ── Mid-page CTA strip — comic panel style ───────── */}
      <AnimateIn>
        <section className="mx-4 mb-4 rounded-2xl border-2 border-[var(--foreground)] overflow-hidden bg-[var(--accent)] text-white px-8 py-10 sm:py-12 max-w-7xl lg:mx-auto relative" style={{ boxShadow: "5px 5px 0px #0f0f0f" }}>
          {/* Background speed lines */}
          <svg className="absolute inset-0 w-full h-full opacity-[0.08] pointer-events-none" viewBox="0 0 800 200" preserveAspectRatio="xMidYMid slice" aria-hidden>
            {Array.from({ length: 24 }).map((_, i) => {
              const angle = (i / 24) * Math.PI * 2;
              return (
                <line key={i}
                  x1={400 + Math.cos(angle) * 30} y1={100 + Math.sin(angle) * 30}
                  x2={400 + Math.cos(angle) * 600} y2={100 + Math.sin(angle) * 600}
                  stroke="white" strokeWidth="1.5"
                />
              );
            })}
          </svg>
          <div className="relative flex flex-col sm:flex-row items-center justify-between gap-6">
            <div>
              <p className="text-xs font-black uppercase tracking-widest opacity-70 mb-1.5">Next Chapter</p>
              <h3 className="text-2xl sm:text-3xl font-extrabold leading-tight">
                Your story is waiting<br />for its artist.
              </h3>
            </div>
            <div className="flex gap-3 flex-shrink-0">
              <Link
                href="/browse"
                className="px-6 py-3 bg-white text-[var(--accent)] font-black rounded-xl text-sm hover:-translate-y-0.5 transition-transform border-2 border-white shadow-sm"
              >
                Find Artist
              </Link>
              <Link
                href="/auth/signup?role=writer"
                className="px-6 py-3 bg-transparent text-white font-black rounded-xl text-sm border-2 border-white hover:bg-white hover:text-[var(--accent)] transition-all duration-150"
              >
                Post Project
              </Link>
            </div>
          </div>
        </section>
      </AnimateIn>

      {/* ── Latest Story Briefs ──────────────────────────── */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <AnimateIn className="flex items-center justify-between mb-10">
            <div>
              <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-1">Open Now</p>
              <h2 className="text-2xl sm:text-3xl font-bold">Latest Story Briefs</h2>
              <p className="text-[var(--muted)] mt-1 text-sm">Writers actively looking for an artist right now</p>
            </div>
            <Link
              href="/projects"
              className="hidden sm:inline-flex items-center gap-1.5 text-sm font-black px-4 py-2 rounded-xl border-2 border-[var(--foreground)] hover:bg-[var(--foreground)] hover:text-white transition-all duration-150"
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
      <section className="py-16 px-4 screentone-bg border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto">
          <AnimateIn className="text-center mb-12">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-2">Simple Process</p>
            <h2 className="text-2xl sm:text-3xl font-bold mb-3">How Toonect Works</h2>
            <p className="text-[var(--muted)] max-w-xl mx-auto text-sm">
              From concept to panels in three simple steps
            </p>
          </AnimateIn>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {HOW_IT_WORKS.map((item, i) => (
              <AnimateIn key={item.step} delay={i * 0.12}>
                <div className="flex flex-col items-start gap-4 relative">
                  {/* Giant ghost step number */}
                  <div className="absolute -top-3 -left-1 text-7xl font-black text-[var(--foreground)] opacity-[0.04] select-none pointer-events-none leading-none">
                    {item.step}
                  </div>
                  <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[var(--foreground)] hover:scale-110 transition-transform duration-200">
                    {item.icon}
                  </div>
                  <div>
                    <span className="text-xs font-black tracking-widest text-[var(--accent)]">STEP {item.step}</span>
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
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
          {VALUE_PROPS.map((item, i) => (
            <AnimateIn key={item.title} delay={i * 0.1}>
              <div className="flex flex-col gap-3 p-6 rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] hover:border-[var(--foreground)] hover:-translate-x-0.5 hover:-translate-y-0.5 transition-all duration-150 group" style={{ transition: "box-shadow 0.14s, transform 0.14s, border-color 0.14s" }} onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = "4px 4px 0px #0f0f0f"; }} onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.boxShadow = ""; }}>
                <div className="w-10 h-10 rounded-xl bg-[var(--foreground)] flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                  {item.icon}
                </div>
                <h3 className="font-extrabold text-base">{item.title}</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed">{item.desc}</p>
              </div>
            </AnimateIn>
          ))}
        </div>
      </section>

      {/* ── Final CTA Banner ─────────────────────────────── */}
      <AnimateIn>
        <section className="mx-4 mb-16 rounded-3xl bg-[var(--foreground)] text-[var(--background)] p-10 sm:p-16 text-center max-w-7xl lg:mx-auto overflow-hidden relative">
          {/* Halftone dot overlay */}
          <div
            className="absolute inset-0 opacity-[0.06] pointer-events-none"
            style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "18px 18px" }}
            aria-hidden
          />
          {/* Corner bursts */}
          <ActionBurst className="absolute top-5 left-8 w-12 h-12 text-[var(--accent)] opacity-20 float-blob" />
          <ActionBurst className="absolute bottom-5 right-8 w-8 h-8 text-[var(--accent)] opacity-20 float-blob-2" />

          <div className="relative">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-3">Join the community</p>
            <h2 className="text-2xl sm:text-4xl font-extrabold mb-4">
              Your story deserves to be seen.
            </h2>
            <p className="text-base sm:text-lg opacity-60 mb-8 max-w-xl mx-auto">
              Join thousands of writers and artists already building the next great manhwa, manga, or manhua.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/auth/signup?role=writer"
                className="px-8 py-3.5 rounded-xl bg-[var(--accent)] text-white font-black hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              >
                I&apos;m a Writer
              </Link>
              <Link
                href="/auth/signup?role=artist"
                className="px-8 py-3.5 rounded-xl bg-white text-[var(--foreground)] font-black hover:opacity-90 hover:-translate-y-0.5 transition-all duration-200"
              >
                I&apos;m an Artist
              </Link>
            </div>
            <div className="mt-8 flex flex-wrap items-center justify-center gap-6 opacity-40 text-sm">
              <span className="flex items-center gap-1.5"><Users className="w-3.5 h-3.5" /> 1,200+ creators</span>
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> 42 countries</span>
              <span className="w-1 h-1 rounded-full bg-current" />
              <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5" /> Always free</span>
            </div>
          </div>
        </section>
      </AnimateIn>
    </div>
  );
}
