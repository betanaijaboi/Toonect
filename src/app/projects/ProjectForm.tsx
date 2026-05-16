"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, AlertCircle, Trash2 } from "lucide-react";
import { createProject, updateProject, deleteProject } from "@/lib/project-actions";
import { ArtStyle, WorkType, ProjectStatus } from "@/lib/types";
import clsx from "clsx";

// ─── constants ───────────────────────────────────────────────
const ART_STYLES: ArtStyle[] = ["manhwa", "manga", "manhua", "webtoon", "comic", "other"];

const WORK_TYPES: { value: WorkType; label: string; desc: string }[] = [
  { value: "free",         label: "Free Collab",  desc: "No payment — shared passion project" },
  { value: "commissioned", label: "Commission",   desc: "Pay per chapter or milestone" },
  { value: "contracted",   label: "Contract",     desc: "Full project with agreed terms" },
];

const STATUSES: { value: ProjectStatus; label: string }[] = [
  { value: "open",        label: "Open — seeking artist" },
  { value: "in_progress", label: "In Progress — collaboration started" },
  { value: "completed",   label: "Completed" },
];

const COMMON_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical",
  "Horror", "Isekai", "Martial Arts", "Mystery", "Psychological",
  "Romance", "School Life", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller",
];

const STYLE_COLORS: Record<ArtStyle, string> = {
  manhwa:  "border-pink-300 data-[on=true]:bg-pink-500 data-[on=true]:border-pink-500 data-[on=true]:text-white",
  manga:   "border-blue-300 data-[on=true]:bg-blue-500 data-[on=true]:border-blue-500 data-[on=true]:text-white",
  manhua:  "border-amber-300 data-[on=true]:bg-amber-500 data-[on=true]:border-amber-500 data-[on=true]:text-white",
  webtoon: "border-purple-300 data-[on=true]:bg-purple-500 data-[on=true]:border-purple-500 data-[on=true]:text-white",
  comic:   "border-green-300 data-[on=true]:bg-green-500 data-[on=true]:border-green-500 data-[on=true]:text-white",
  other:   "border-gray-300 data-[on=true]:bg-gray-500 data-[on=true]:border-gray-500 data-[on=true]:text-white",
};

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition";

// ─── props ───────────────────────────────────────────────────
interface InitialValues {
  id: string;
  title: string;
  description: string;
  genre: string;
  style_wanted: ArtStyle[];
  work_type: WorkType;
  status: ProjectStatus;
}

interface ProjectFormProps {
  mode: "create" | "edit";
  initial?: InitialValues;
}

// ─── component ───────────────────────────────────────────────
export default function ProjectForm({ mode, initial }: ProjectFormProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [isDeleting, startDeleteTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const [title, setTitle]             = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [genre, setGenre]             = useState(initial?.genre ?? "");
  const [styleWanted, setStyleWanted] = useState<ArtStyle[]>(initial?.style_wanted ?? []);
  const [workType, setWorkType]       = useState<WorkType>(initial?.work_type ?? "free");
  const [status, setStatus]           = useState<ProjectStatus>(initial?.status ?? "open");

  const canSubmit = title.trim() && description.trim() && genre.trim() && styleWanted.length > 0;

  function toggleStyle(s: ArtStyle) {
    setStyleWanted((prev) =>
      prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]
    );
  }

  function handleSubmit() {
    if (!canSubmit) return;
    setError(null);

    startTransition(async () => {
      const data = {
        title,
        description,
        genre: genre.trim(),
        style_wanted: styleWanted,
        work_type: workType,
      };

      if (mode === "create") {
        const result = await createProject(data);
        if ("error" in result) { setError(result.error); return; }
        router.push(`/projects`);
        router.refresh();
      } else {
        const result = await updateProject(initial!.id, { ...data, status });
        if ("error" in result) { setError(result.error); return; }
        router.push(`/projects`);
        router.refresh();
      }
    });
  }

  function handleDelete() {
    if (!initial) return;
    setError(null);

    startDeleteTransition(async () => {
      const result = await deleteProject(initial.id);
      if ("error" in result) { setError(result.error); return; }
      router.push("/projects");
      router.refresh();
    });
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">
            {mode === "create" ? "Post a Project" : "Edit Project"}
          </h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {mode === "create"
              ? "Describe your story so the right artist finds you."
              : "Update your story brief."}
          </p>
        </div>

        <button
          onClick={handleSubmit}
          disabled={!canSubmit || isPending}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
            canSubmit && !isPending
              ? "bg-[var(--accent)] text-white hover:opacity-90"
              : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
          )}
        >
          {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
          {isPending ? "Saving…" : mode === "create" ? "Post Project" : "Save Changes"}
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {error}
        </div>
      )}

      <div className="flex flex-col gap-6">

        {/* ── Title ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Story Brief</h2>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Title <span className="text-[var(--accent)]">*</span></label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              className={INPUT_CLS}
              placeholder="e.g. Echoes of the Fallen Kingdom"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">
              Description <span className="text-[var(--accent)]">*</span>
            </label>
            <p className="text-xs text-[var(--muted)]">
              Tell artists about your story — plot, tone, target audience, chapter length, and anything else relevant.
            </p>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={6}
              maxLength={2000}
              className={clsx(INPUT_CLS, "resize-none leading-relaxed")}
              placeholder={
                "e.g. A dark fantasy manhwa set in a crumbling empire. " +
                "The story follows a disgraced general who discovers his executed king was framed. " +
                "Tone: gritty, morally complex. Target: weekly releases, 60 panels/chapter."
              }
            />
            <p className="text-xs text-[var(--muted)] text-right">{description.length}/2000</p>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Genre <span className="text-[var(--accent)]">*</span></label>
            <input
              type="text"
              list="genre-suggestions"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
              className={INPUT_CLS}
              placeholder="e.g. Fantasy"
            />
            <datalist id="genre-suggestions">
              {COMMON_GENRES.map((g) => <option key={g} value={g} />)}
            </datalist>
          </div>
        </div>

        {/* ── Art Style ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">
              Art Style Wanted <span className="text-[var(--accent)]">*</span>
            </h2>
            <p className="text-xs text-[var(--muted)]">Select every style you&apos;d be happy with.</p>
          </div>

          <div className="flex flex-wrap gap-2">
            {ART_STYLES.map((s) => {
              const on = styleWanted.includes(s);
              return (
                <button
                  key={s}
                  type="button"
                  data-on={String(on)}
                  onClick={() => toggleStyle(s)}
                  className={clsx(
                    "px-4 py-2 rounded-full text-sm font-semibold border capitalize transition-all",
                    on
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
                    STYLE_COLORS[s]
                  )}
                >
                  {s}
                </button>
              );
            })}
          </div>

          {styleWanted.length === 0 && (
            <p className="text-xs text-[var(--accent)]">Pick at least one style.</p>
          )}
        </div>

        {/* ── Work Type ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)]">Work Type</h2>

          <div className="flex flex-col gap-3">
            {WORK_TYPES.map(({ value, label, desc }) => (
              <button
                key={value}
                type="button"
                onClick={() => setWorkType(value)}
                className={clsx(
                  "flex items-start gap-4 p-4 rounded-xl border-2 text-left transition-all",
                  workType === value
                    ? "border-[var(--accent)] bg-[#fde8df]"
                    : "border-[var(--border)] hover:border-[var(--accent)]/50"
                )}
              >
                <div
                  className={clsx(
                    "w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 transition-colors",
                    workType === value
                      ? "border-[var(--accent)] bg-[var(--accent)]"
                      : "border-[var(--muted)]"
                  )}
                />
                <div>
                  <p className="font-semibold text-sm">{label}</p>
                  <p className="text-xs text-[var(--muted)] mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* ── Status (edit only) ── */}
        {mode === "edit" && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-4">
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-0.5">Project Status</h2>
              <p className="text-xs text-[var(--muted)]">Change this once you start collaborating or wrap up.</p>
            </div>
            <div className="flex flex-col gap-2">
              {STATUSES.map(({ value, label }) => (
                <button
                  key={value}
                  type="button"
                  onClick={() => setStatus(value)}
                  className={clsx(
                    "flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all text-sm font-medium",
                    status === value
                      ? "border-[var(--accent)] bg-[#fde8df] text-[var(--foreground)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)]/50"
                  )}
                >
                  <div
                    className={clsx(
                      "w-3.5 h-3.5 rounded-full border-2 flex-shrink-0 transition-colors",
                      status === value ? "border-[var(--accent)] bg-[var(--accent)]" : "border-[var(--muted)]"
                    )}
                  />
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* ── Bottom actions ── */}
        <div className="flex items-center justify-between gap-3 pb-4">
          {/* Delete (edit mode only) */}
          {mode === "edit" && !showDeleteConfirm && (
            <button
              type="button"
              onClick={() => setShowDeleteConfirm(true)}
              className="flex items-center gap-1.5 text-sm text-red-500 hover:text-red-600 hover:underline transition-colors"
            >
              <Trash2 className="w-4 h-4" />
              Delete project
            </button>
          )}

          {mode === "edit" && showDeleteConfirm && (
            <div className="flex items-center gap-3">
              <p className="text-sm font-medium text-red-600">Are you sure?</p>
              <button
                type="button"
                onClick={handleDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
              >
                {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                {isDeleting ? "Deleting…" : "Yes, delete"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
              >
                Cancel
              </button>
            </div>
          )}

          {mode === "create" && <span />}

          <button
            onClick={handleSubmit}
            disabled={!canSubmit || isPending}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all ml-auto",
              canSubmit && !isPending
                ? "bg-[var(--accent)] text-white hover:opacity-90"
                : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
            )}
          >
            {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {isPending ? "Saving…" : mode === "create" ? "Post Project" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
