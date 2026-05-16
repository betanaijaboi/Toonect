"use client";

import { useState, useRef, useTransition } from "react";
import Link from "next/link";
import {
  Upload, X, Loader2, Plus, Brush, AlertCircle, ExternalLink, Trash2,
} from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { addPortfolioItem, deletePortfolioItem } from "@/lib/portfolio-actions";
import { DbPortfolioItem, ArtStyle } from "@/lib/types";
import clsx from "clsx";

// ─── constants ───────────────────────────────────────────────
const ART_STYLES: ArtStyle[] = ["manhwa", "manga", "manhua", "webtoon", "comic", "other"];

const STYLE_COLORS: Record<ArtStyle, string> = {
  manhwa:  "bg-pink-100 text-pink-700",
  manga:   "bg-blue-100 text-blue-700",
  manhua:  "bg-amber-100 text-amber-700",
  webtoon: "bg-purple-100 text-purple-700",
  comic:   "bg-green-100 text-green-700",
  other:   "bg-gray-100 text-gray-600",
};

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition";

// ─── helpers ─────────────────────────────────────────────────
/** Extract the storage path from a Supabase public URL */
function storagePathFromUrl(url: string): string | null {
  try {
    const marker = "/object/public/portfolio/";
    const idx = url.indexOf(marker);
    return idx !== -1 ? url.slice(idx + marker.length) : null;
  } catch {
    return null;
  }
}

// ─── upload card ─────────────────────────────────────────────
interface UploadCardProps {
  artistId: string;
  onSave: (item: DbPortfolioItem) => void;
  onCancel: () => void;
}

function UploadCard({ artistId, onSave, onCancel }: UploadCardProps) {
  const fileRef = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [title, setTitle] = useState("");
  const [style, setStyle] = useState<ArtStyle | null>(null);
  const [description, setDescription] = useState("");
  const [isSaving, startSave] = useTransition();
  const [saveError, setSaveError] = useState<string | null>(null);

  async function handleFile(file: File) {
    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File must be under 5 MB.");
      return;
    }

    setUploadError(null);
    setPreview(URL.createObjectURL(file));
    setUploading(true);

    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${artistId}/${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("portfolio").upload(path, file);
    if (error) {
      setUploadError(error.message);
      setUploading(false);
      return;
    }

    const { data: { publicUrl } } = supabase.storage.from("portfolio").getPublicUrl(path);
    setImageUrl(publicUrl);
    setUploading(false);
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleSave() {
    if (!imageUrl || !title.trim() || !style) return;
    setSaveError(null);

    startSave(async () => {
      const result = await addPortfolioItem({
        image_url: imageUrl,
        title: title.trim(),
        description: description.trim() || null,
        style,
      });

      if ("error" in result) {
        setSaveError(result.error);
        return;
      }

      onSave({
        id: result.id,
        artist_id: artistId,
        image_url: imageUrl,
        title: title.trim(),
        description: description.trim() || null,
        style,
        created_at: new Date().toISOString(),
      });
    });
  }

  const canSave = !!imageUrl && !!title.trim() && !!style;

  return (
    <div className="rounded-2xl border-2 border-dashed border-[var(--accent)] bg-[#fde8df]/30 p-6 flex flex-col gap-5">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-base">Add New Work</h3>
        <button
          type="button"
          onClick={onCancel}
          className="p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors text-[var(--muted)]"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Image drop zone */}
      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={(e) => e.preventDefault()}
          onClick={() => fileRef.current?.click()}
          className="flex flex-col items-center justify-center gap-3 h-48 rounded-xl border-2 border-dashed border-[var(--border)] bg-[var(--surface)] cursor-pointer hover:border-[var(--accent)] hover:bg-[#fde8df]/20 transition-all"
        >
          <Upload className="w-8 h-8 text-[var(--muted)]" />
          <div className="text-center">
            <p className="text-sm font-medium">Drop image here or click to browse</p>
            <p className="text-xs text-[var(--muted)] mt-0.5">JPG, PNG, GIF, WebP · Max 5 MB</p>
          </div>
        </div>
      ) : (
        <div className="relative rounded-xl overflow-hidden aspect-video bg-[#f3f4f6]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={preview} alt="Preview" className="w-full h-full object-cover" />
          {uploading && (
            <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
          )}
          {!uploading && (
            <button
              type="button"
              onClick={() => { setPreview(null); setImageUrl(null); }}
              className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center hover:bg-black/80 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      )}

      <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleInputChange} />

      {uploadError && (
        <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {uploadError}
        </div>
      )}

      {/* Metadata fields — only shown once image is staged */}
      {preview && !uploading && (
        <>
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">
              Title <span className="text-[var(--accent)]">*</span>
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={100}
              placeholder="e.g. Dragon Empress — Chapter 1 Cover"
              className={INPUT_CLS}
              autoFocus
            />
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-sm font-semibold">
              Style <span className="text-[var(--accent)]">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {ART_STYLES.map((s) => (
                <button
                  key={s}
                  type="button"
                  onClick={() => setStyle(s)}
                  className={clsx(
                    "px-3 py-1.5 rounded-full text-sm font-medium border capitalize transition-all",
                    style === s
                      ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                      : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
                  )}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold">Description <span className="text-[var(--muted)] font-normal">(optional)</span></label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={2}
              maxLength={300}
              placeholder="A brief note about this piece…"
              className={clsx(INPUT_CLS, "resize-none")}
            />
          </div>

          {saveError && (
            <div className="flex items-center gap-2 text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-3 py-2">
              <AlertCircle className="w-4 h-4 flex-shrink-0" />
              {saveError}
            </div>
          )}

          <div className="flex gap-3 justify-end">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium text-[var(--muted)] hover:bg-[#f3f4f6] transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={!canSave || isSaving}
              className={clsx(
                "flex items-center gap-2 px-5 py-2 rounded-xl text-sm font-semibold transition-all",
                canSave && !isSaving
                  ? "bg-[var(--accent)] text-white hover:opacity-90"
                  : "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              )}
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isSaving ? "Saving…" : "Add to Portfolio"}
            </button>
          </div>
        </>
      )}
    </div>
  );
}

// ─── portfolio item card ──────────────────────────────────────
interface ItemCardProps {
  item: DbPortfolioItem;
  onDelete: (id: string) => void;
}

function ItemCard({ item, onDelete }: ItemCardProps) {
  const [confirming, setConfirming] = useState(false);
  const [isDeleting, startDelete] = useTransition();

  function handleDelete() {
    startDelete(async () => {
      const path = storagePathFromUrl(item.image_url);
      const result = await deletePortfolioItem(item.id, path);
      if ("success" in result) onDelete(item.id);
    });
  }

  return (
    <div className="group relative rounded-2xl overflow-hidden border border-[var(--border)] bg-[var(--surface)]">
      {/* Image */}
      <div className="aspect-square bg-[#f3f4f6] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image_url}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
      </div>

      {/* Info */}
      <div className="p-3">
        <p className="font-semibold text-sm truncate">{item.title}</p>
        <span
          className={clsx(
            "inline-block mt-1 text-xs px-2 py-0.5 rounded-full font-medium capitalize",
            STYLE_COLORS[item.style]
          )}
        >
          {item.style}
        </span>
        {item.description && (
          <p className="text-xs text-[var(--muted)] mt-1.5 line-clamp-2 leading-relaxed">
            {item.description}
          </p>
        )}
      </div>

      {/* Delete overlay */}
      {!confirming ? (
        <button
          type="button"
          onClick={() => setConfirming(true)}
          className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-500"
          aria-label="Delete"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      ) : (
        <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3 p-4">
          <p className="text-white text-sm font-semibold text-center">Delete this piece?</p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleDelete}
              disabled={isDeleting}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-500 text-white text-sm font-semibold hover:bg-red-600 transition-colors disabled:opacity-60"
            >
              {isDeleting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {isDeleting ? "Deleting…" : "Delete"}
            </button>
            <button
              type="button"
              onClick={() => setConfirming(false)}
              className="px-4 py-2 rounded-xl bg-white/20 text-white text-sm font-semibold hover:bg-white/30 transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── main component ───────────────────────────────────────────
interface PortfolioManagerProps {
  initialItems: DbPortfolioItem[];
  artistId: string;
  artistUsername: string;
}

export default function PortfolioManager({
  initialItems,
  artistId,
  artistUsername,
}: PortfolioManagerProps) {
  const [items, setItems] = useState<DbPortfolioItem[]>(initialItems);
  const [showUpload, setShowUpload] = useState(false);

  function handleSave(item: DbPortfolioItem) {
    setItems((prev) => [item, ...prev]);
    setShowUpload(false);
  }

  function handleDelete(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">My Portfolio</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {items.length} {items.length === 1 ? "piece" : "pieces"} · visible on your public profile
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/artists/${artistUsername}`}
            className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
          >
            <ExternalLink className="w-4 h-4" />
            View Profile
          </Link>

          {!showUpload && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
            >
              <Plus className="w-4 h-4" />
              Add Work
            </button>
          )}
        </div>
      </div>

      {/* Upload card */}
      {showUpload && (
        <div className="mb-8">
          <UploadCard
            artistId={artistId}
            onSave={handleSave}
            onCancel={() => setShowUpload(false)}
          />
        </div>
      )}

      {/* Grid */}
      {items.length === 0 && !showUpload ? (
        <div className="flex flex-col items-center justify-center py-24 text-center">
          <div className="w-20 h-20 rounded-2xl bg-[#fde8df] flex items-center justify-center mb-4">
            <Brush className="w-10 h-10 text-[var(--accent)]" />
          </div>
          <h3 className="font-bold text-lg mb-2">Your portfolio is empty</h3>
          <p className="text-sm text-[var(--muted)] max-w-xs mb-6">
            Upload your artwork so writers can see your style and reach out for collaborations.
          </p>
          <button
            type="button"
            onClick={() => setShowUpload(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
          >
            <Upload className="w-4 h-4" />
            Upload Your First Piece
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onDelete={handleDelete} />
          ))}

          {/* Add tile at end of grid */}
          {!showUpload && (
            <button
              type="button"
              onClick={() => setShowUpload(true)}
              className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-2 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[#fde8df]/20 transition-all"
            >
              <Plus className="w-8 h-8" />
              <span className="text-xs font-semibold">Add Work</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
