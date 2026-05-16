"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  Search,
  SlidersHorizontal,
  X,
  ArrowUpDown,
  FileText,
  Brush,
  DollarSign,
  Gift,
  Plus,
  Pencil,
} from "lucide-react";
import ProjectCard from "@/components/ProjectCard";
import { ArtStyle, WorkType, ProjectStatus } from "@/lib/types";
import clsx from "clsx";

type SortKey = "newest" | "oldest" | "free_first" | "contracted_first";

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

interface ProjectsClientProps {
  projects: ProjectRow[];
  isWriter?: boolean;
  currentUserId?: string | null;
}

const ART_STYLES: ArtStyle[] = ["manhwa", "manga", "manhua", "webtoon", "comic"];
const WORK_TYPES: WorkType[] = ["free", "commissioned", "contracted"];

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  free: "Free Collab",
  commissioned: "Commission",
  contracted: "Contract",
};

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "free_first", label: "Free collabs first" },
  { value: "contracted_first", label: "Contracts first" },
];

export default function ProjectsClient({ projects, isWriter, currentUserId }: ProjectsClientProps) {
  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<ArtStyle[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [sort, setSort] = useState<SortKey>("newest");
  const [showFilters, setShowFilters] = useState(false);

  const allGenres = useMemo(
    () => [...new Set(projects.map((p) => p.genre))].sort(),
    [projects]
  );

  const toggleItem = <T,>(arr: T[], item: T, setter: (v: T[]) => void) =>
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);

  const filtered = useMemo(() => {
    let results = projects.filter((p) => {
      const q = search.toLowerCase();
      if (
        q &&
        !p.title.toLowerCase().includes(q) &&
        !p.description.toLowerCase().includes(q) &&
        !p.genre.toLowerCase().includes(q) &&
        !p.writerName.toLowerCase().includes(q)
      )
        return false;
      if (selectedStyles.length && !selectedStyles.some((s) => p.style_wanted.includes(s)))
        return false;
      if (selectedWorkTypes.length && !selectedWorkTypes.includes(p.work_type))
        return false;
      if (selectedGenres.length && !selectedGenres.includes(p.genre))
        return false;
      return true;
    });

    results = [...results].sort((a, b) => {
      if (sort === "newest") return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      if (sort === "oldest") return new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      if (sort === "free_first") {
        if (a.work_type === "free" && b.work_type !== "free") return -1;
        if (b.work_type === "free" && a.work_type !== "free") return 1;
        return 0;
      }
      if (sort === "contracted_first") {
        if (a.work_type === "contracted" && b.work_type !== "contracted") return -1;
        if (b.work_type === "contracted" && a.work_type !== "contracted") return 1;
        return 0;
      }
      return 0;
    });

    return results;
  }, [projects, search, selectedStyles, selectedWorkTypes, selectedGenres, sort]);

  const hasFilters = selectedStyles.length > 0 || selectedWorkTypes.length > 0 || selectedGenres.length > 0;

  function clearAll() {
    setSelectedStyles([]);
    setSelectedWorkTypes([]);
    setSelectedGenres([]);
    setSearch("");
    setSort("newest");
  }

  const freeCount = projects.filter((p) => p.work_type === "free").length;
  const commissionCount = projects.filter((p) => p.work_type === "commissioned").length;
  const contractCount = projects.filter((p) => p.work_type === "contracted").length;

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-extrabold mb-2">Open Projects</h1>
          <p className="text-[var(--muted)] max-w-2xl">
            Story briefs from writers actively looking for an artist. Filter by style, genre, or work
            type — then reach out directly.
          </p>
        </div>
        {isWriter && (
          <Link
            href="/projects/new"
            className="flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Plus className="w-4 h-4" />
            Post a Project
          </Link>
        )}
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-[var(--muted)]">
            <FileText className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Total Open</span>
          </div>
          <p className="text-2xl font-extrabold">{projects.length}</p>
        </div>
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-green-600">
            <Gift className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Free Collabs</span>
          </div>
          <p className="text-2xl font-extrabold text-green-700">{freeCount}</p>
        </div>
        <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-blue-600">
            <DollarSign className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Commissions</span>
          </div>
          <p className="text-2xl font-extrabold text-blue-700">{commissionCount}</p>
        </div>
        <div className="rounded-2xl border border-purple-200 bg-purple-50 p-4 flex flex-col gap-1">
          <div className="flex items-center gap-2 text-purple-600">
            <Brush className="w-4 h-4" />
            <span className="text-xs font-medium uppercase tracking-wide">Contracts</span>
          </div>
          <p className="text-2xl font-extrabold text-purple-700">{contractCount}</p>
        </div>
      </div>

      {/* Search + filter + sort */}
      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-52">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder="Search by title, genre, or writer…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
          />
        </div>

        <button
          onClick={() => setShowFilters(!showFilters)}
          className={clsx(
            "flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-medium transition-colors",
            showFilters || hasFilters
              ? "bg-[var(--accent)] text-white border-[var(--accent)]"
              : "border-[var(--border)] bg-[var(--surface)] hover:bg-[#f3f4f6]"
          )}
        >
          <SlidersHorizontal className="w-4 h-4" />
          Filters
          {hasFilters && (
            <span className="bg-white text-[var(--accent)] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
              {selectedStyles.length + selectedWorkTypes.length + selectedGenres.length}
            </span>
          )}
        </button>

        <div className="relative">
          <ArrowUpDown className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)] pointer-events-none" />
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as SortKey)}
            className="appearance-none pl-9 pr-8 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--accent)] cursor-pointer"
          >
            {SORT_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>

        {(hasFilters || search) && (
          <button
            onClick={clearAll}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl border border-[var(--border)] text-sm text-[var(--muted)] hover:text-red-500 hover:border-red-300 transition-colors"
          >
            <X className="w-4 h-4" />
            Clear
          </button>
        )}
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="mb-8 p-5 rounded-2xl border border-[var(--border)] bg-[var(--surface)] grid grid-cols-1 sm:grid-cols-3 gap-6">
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Style Wanted</h3>
            <div className="flex flex-wrap gap-2">
              {ART_STYLES.map((style) => (
                <button
                  key={style}
                  onClick={() => toggleItem(selectedStyles, style, setSelectedStyles)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm capitalize font-medium border transition-colors",
                    selectedStyles.includes(style)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[#fde8df] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                  )}
                >
                  {style}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Work Type</h3>
            <div className="flex flex-wrap gap-2">
              {WORK_TYPES.map((wt) => (
                <button
                  key={wt}
                  onClick={() => toggleItem(selectedWorkTypes, wt, setSelectedWorkTypes)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    selectedWorkTypes.includes(wt)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[#fde8df] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                  )}
                >
                  {WORK_TYPE_LABELS[wt]}
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Genre</h3>
            <div className="flex flex-wrap gap-2">
              {allGenres.map((genre) => (
                <button
                  key={genre}
                  onClick={() => toggleItem(selectedGenres, genre, setSelectedGenres)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                    selectedGenres.includes(genre)
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] hover:bg-[#fde8df] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                  )}
                >
                  {genre}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Active filter chips */}
      {hasFilters && (
        <div className="flex flex-wrap gap-2 mb-5">
          {selectedWorkTypes.map((wt) => (
            <button
              key={wt}
              onClick={() => toggleItem(selectedWorkTypes, wt, setSelectedWorkTypes)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--accent)] text-white font-medium"
            >
              {WORK_TYPE_LABELS[wt]}
              <X className="w-3 h-3" />
            </button>
          ))}
          {selectedStyles.map((s) => (
            <button
              key={s}
              onClick={() => toggleItem(selectedStyles, s, setSelectedStyles)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--accent)] text-white font-medium capitalize"
            >
              {s}
              <X className="w-3 h-3" />
            </button>
          ))}
          {selectedGenres.map((g) => (
            <button
              key={g}
              onClick={() => toggleItem(selectedGenres, g, setSelectedGenres)}
              className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-[var(--accent)] text-white font-medium"
            >
              {g}
              <X className="w-3 h-3" />
            </button>
          ))}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-[var(--muted)] mb-5">
        {filtered.length} project{filtered.length !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {filtered.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((project) => (
            <div key={project.id} className="relative group/card">
              <ProjectCard
                project={project}
                writerUsername={project.writerUsername}
                writerName={project.writerName}
              />
              {currentUserId && (project as { writer_id?: string }).writer_id === currentUserId && (
                <Link
                  href={`/projects/${project.id}/edit`}
                  className="absolute top-3 left-3 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white/90 border border-[var(--border)] text-xs font-semibold text-[var(--foreground)] hover:bg-[var(--accent)] hover:text-white hover:border-[var(--accent)] transition-all opacity-0 group-hover/card:opacity-100"
                >
                  <Pencil className="w-3 h-3" />
                  Edit
                </Link>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#fde8df] flex items-center justify-center mb-4">
            <FileText className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h3 className="font-bold text-lg mb-2">No projects found</h3>
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Try adjusting your filters or search terms to find more story briefs.
          </p>
          <button
            onClick={clearAll}
            className="mt-6 px-6 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  );
}
