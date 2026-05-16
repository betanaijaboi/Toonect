"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, SlidersHorizontal, X, Brush, BookOpen } from "lucide-react";
import ArtistCard from "@/components/ArtistCard";
import WriterCard from "@/components/WriterCard";
import { ArtistProfile, WriterProfile, ArtStyle, WorkType, AvailabilityStatus } from "@/lib/types";
import clsx from "clsx";

type ViewRole = "artists" | "writers";

const ART_STYLES: ArtStyle[] = ["manhwa", "manga", "manhua", "webtoon", "comic", "other"];
const WORK_TYPES: WorkType[] = ["free", "commissioned", "contracted"];
const AVAILABILITY: AvailabilityStatus[] = ["available", "busy", "closed"];

const WORK_TYPE_LABELS: Record<WorkType, string> = {
  free: "Free",
  commissioned: "Commission",
  contracted: "Contract",
};

const AVAIL_LABELS: Record<AvailabilityStatus, string> = {
  available: "Available",
  busy: "Busy",
  closed: "Closed",
};

interface BrowseClientProps {
  initialArtists: ArtistProfile[];
  initialWriters: WriterProfile[];
}

export default function BrowseClient({ initialArtists, initialWriters }: BrowseClientProps) {
  const [role, setRole] = useState<ViewRole>("artists");
  const [search, setSearch] = useState("");
  const [selectedStyles, setSelectedStyles] = useState<ArtStyle[]>([]);
  const [selectedWorkTypes, setSelectedWorkTypes] = useState<WorkType[]>([]);
  const [selectedAvail, setSelectedAvail] = useState<AvailabilityStatus[]>([]);
  const [showFilters, setShowFilters] = useState(false);

  const toggleItem = <T,>(arr: T[], item: T, setter: (v: T[]) => void) => {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  };

  const filteredArtists = useMemo(() => {
    return initialArtists.filter((artist) => {
      const q = search.toLowerCase();
      if (
        q &&
        !artist.display_name.toLowerCase().includes(q) &&
        !artist.username.toLowerCase().includes(q) &&
        !artist.bio?.toLowerCase().includes(q) &&
        !artist.genres.some((g) => g.toLowerCase().includes(q))
      ) return false;
      if (selectedStyles.length && !selectedStyles.some((s) => artist.art_styles.includes(s))) return false;
      if (selectedWorkTypes.length && !selectedWorkTypes.some((wt) => artist.work_types.includes(wt))) return false;
      if (selectedAvail.length && !selectedAvail.includes(artist.availability)) return false;
      return true;
    });
  }, [initialArtists, search, selectedStyles, selectedWorkTypes, selectedAvail]);

  const filteredWriters = useMemo(() => {
    return initialWriters.filter((writer) => {
      const q = search.toLowerCase();
      if (
        q &&
        !writer.display_name.toLowerCase().includes(q) &&
        !writer.username.toLowerCase().includes(q) &&
        !writer.bio?.toLowerCase().includes(q) &&
        !writer.genres.some((g) => g.toLowerCase().includes(q)) &&
        !writer.projects.some((p) => p.title.toLowerCase().includes(q))
      ) return false;
      if (selectedStyles.length && !selectedStyles.some((s) => writer.looking_for.includes(s))) return false;
      if (selectedWorkTypes.length && !selectedWorkTypes.some((wt) => writer.projects.some((p) => p.work_type === wt))) return false;
      return true;
    });
  }, [initialWriters, search, selectedStyles, selectedWorkTypes]);

  const hasFilters = selectedStyles.length > 0 || selectedWorkTypes.length > 0 || selectedAvail.length > 0;
  const count = role === "artists" ? filteredArtists.length : filteredWriters.length;

  function clearAll() {
    setSelectedStyles([]);
    setSelectedWorkTypes([]);
    setSelectedAvail([]);
    setSearch("");
  }

  function switchRole(r: ViewRole) {
    setRole(r);
    setSelectedStyles([]);
    setSelectedWorkTypes([]);
    setSelectedAvail([]);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold mb-2">Browse</h1>
        <p className="text-[var(--muted)]">
          Find artists ready to draw your story, or writers with projects looking for an artist.
        </p>
      </div>

      {/* Role toggle */}
      <div className="flex gap-2 mb-6">
        <button
          onClick={() => switchRole("artists")}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all",
            role === "artists"
              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          )}
        >
          <Brush className="w-4 h-4" />
          Artists
          <span className={clsx("text-xs rounded-full px-1.5 py-0.5 font-bold", role === "artists" ? "bg-white/20" : "bg-[#f3f4f6]")}>
            {initialArtists.length}
          </span>
        </button>
        <button
          onClick={() => switchRole("writers")}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold border transition-all",
            role === "writers"
              ? "bg-[var(--accent)] text-white border-[var(--accent)] shadow-sm"
              : "border-[var(--border)] bg-[var(--surface)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          )}
        >
          <BookOpen className="w-4 h-4" />
          Writers
          <span className={clsx("text-xs rounded-full px-1.5 py-0.5 font-bold", role === "writers" ? "bg-white/20" : "bg-[#f3f4f6]")}>
            {initialWriters.length}
          </span>
        </button>
      </div>

      {/* Search + filter toggle */}
      <div className="flex gap-3 mb-6">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
          <input
            type="text"
            placeholder={
              role === "artists"
                ? "Search by name, style, or genre…"
                : "Search by name, genre, or project title…"
            }
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
              {selectedStyles.length + selectedWorkTypes.length + selectedAvail.length}
            </span>
          )}
        </button>
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
          {/* Art Style */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">
              {role === "artists" ? "Art Style" : "Style Wanted"}
            </h3>
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

          {/* Work Type */}
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

          {/* Availability — artists only */}
          {role === "artists" && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Availability</h3>
              <div className="flex flex-wrap gap-2">
                {AVAILABILITY.map((avail) => (
                  <button
                    key={avail}
                    onClick={() => toggleItem(selectedAvail, avail, setSelectedAvail)}
                    className={clsx(
                      "px-3 py-1.5 rounded-full text-sm font-medium border transition-colors",
                      selectedAvail.includes(avail)
                        ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                        : "border-[var(--border)] hover:bg-[#fde8df] hover:text-[var(--accent)] hover:border-[var(--accent)]"
                    )}
                  >
                    {AVAIL_LABELS[avail]}
                  </button>
                ))}
              </div>
            </div>
          )}

          {role === "writers" && (
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Projects</h3>
              <p className="text-xs text-[var(--muted)]">Showing all writers with open projects.</p>
            </div>
          )}
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-[var(--muted)] mb-5">
        {count} {role === "artists" ? "artist" : "writer"}{count !== 1 ? "s" : ""} found
      </p>

      {/* Grid */}
      {count > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          <AnimatePresence mode="popLayout">
            {role === "artists"
              ? filteredArtists.map((artist, i) => (
                  <motion.div
                    key={"artist-" + artist.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.045, 0.35) }}
                  >
                    <ArtistCard artist={artist} />
                  </motion.div>
                ))
              : filteredWriters.map((writer, i) => (
                  <motion.div
                    key={"writer-" + writer.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95, y: 12 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -8 }}
                    transition={{ duration: 0.22, delay: Math.min(i * 0.045, 0.35) }}
                  >
                    <WriterCard writer={writer} />
                  </motion.div>
                ))}
          </AnimatePresence>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#fde8df] flex items-center justify-center mb-4">
            <Search className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h3 className="font-bold text-lg mb-2">No {role} found</h3>
          <p className="text-sm text-[var(--muted)] max-w-xs">
            Try adjusting your filters or search terms.
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
