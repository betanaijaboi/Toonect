"use client";

import { useState, useRef, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Camera, Plus, X, CheckCircle, Loader2, AlertCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { updateProfile } from "@/lib/profile-actions";
import { DbProfile, DbArtistProfile, DbWriterProfile, ArtStyle, WorkType, AvailabilityStatus } from "@/lib/types";
import clsx from "clsx";

// ─── constants ───────────────────────────────────────────────
const ART_STYLES: ArtStyle[] = ["manhwa", "manga", "manhua", "webtoon", "comic", "other"];
const WORK_TYPES: WorkType[] = ["free", "commissioned", "contracted"];
const AVAILABILITY: AvailabilityStatus[] = ["available", "busy", "closed"];

const AVAIL_CONFIG: Record<AvailabilityStatus, { label: string; color: string; active: string }> = {
  available: { label: "Available", color: "border-green-300 text-green-700 bg-green-50", active: "border-green-500 bg-green-500 text-white" },
  busy:      { label: "Busy",      color: "border-yellow-300 text-yellow-700 bg-yellow-50", active: "border-yellow-500 bg-yellow-500 text-white" },
  closed:    { label: "Closed",    color: "border-red-300 text-red-600 bg-red-50", active: "border-red-500 bg-red-500 text-white" },
};

const WORK_LABELS: Record<WorkType, string> = {
  free: "Free Collab",
  commissioned: "Commission",
  contracted: "Contract",
};

const COMMON_GENRES = [
  "Action", "Adventure", "Comedy", "Drama", "Fantasy", "Historical",
  "Horror", "Isekai", "Martial Arts", "Mystery", "Psychological",
  "Romance", "School Life", "Sci-Fi", "Slice of Life", "Sports",
  "Supernatural", "Thriller",
];

const COMMON_LANGUAGES = [
  "Arabic", "Chinese", "English", "French", "German", "Indonesian",
  "Japanese", "Korean", "Portuguese", "Spanish", "Thai", "Vietnamese",
];

// ─── helpers ─────────────────────────────────────────────────
function Toggle({
  selected,
  onToggle,
  label,
  className,
}: {
  selected: boolean;
  onToggle: () => void;
  label: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onToggle}
      className={clsx(
        "px-3 py-1.5 rounded-full text-sm font-medium border transition-all capitalize",
        selected
          ? "bg-[var(--accent)] text-white border-[var(--accent)]"
          : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]",
        className
      )}
    >
      {label}
    </button>
  );
}

function TagList({
  items,
  presets,
  onAdd,
  onRemove,
  placeholder,
}: {
  items: string[];
  presets: string[];
  onAdd: (tag: string) => void;
  onRemove: (tag: string) => void;
  placeholder: string;
}) {
  const [input, setInput] = useState("");

  function commit() {
    const tag = input.trim();
    if (tag && !items.includes(tag)) onAdd(tag);
    setInput("");
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Predefined options */}
      <div className="flex flex-wrap gap-2">
        {presets.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => (items.includes(p) ? onRemove(p) : onAdd(p))}
            className={clsx(
              "px-3 py-1.5 rounded-full text-sm font-medium border transition-all",
              items.includes(p)
                ? "bg-[var(--accent)] text-white border-[var(--accent)]"
                : "border-[var(--border)] text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
            )}
          >
            {p}
          </button>
        ))}
      </div>

      {/* Custom tag input */}
      <div className="flex gap-2 items-center">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); commit(); } }}
          placeholder={placeholder}
          className="flex-1 px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
        />
        <button
          type="button"
          onClick={commit}
          disabled={!input.trim()}
          className="flex items-center justify-center w-9 h-9 rounded-xl border border-[var(--border)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-40"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Custom tags that aren't in presets */}
      {items.filter((t) => !presets.includes(t)).length > 0 && (
        <div className="flex flex-wrap gap-2">
          {items
            .filter((t) => !presets.includes(t))
            .map((t) => (
              <span
                key={t}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full text-sm bg-[var(--accent)] text-white font-medium"
              >
                {t}
                <button type="button" onClick={() => onRemove(t)} className="ml-0.5 opacity-70 hover:opacity-100">
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
        </div>
      )}
    </div>
  );
}

function SectionHeader({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-4">
      {children}
    </h2>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold">{label}</label>
      {hint && <p className="text-xs text-[var(--muted)]">{hint}</p>}
      {children}
    </div>
  );
}

const INPUT_CLS =
  "w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition";

// ─── props ───────────────────────────────────────────────────
interface Props {
  profile: DbProfile;
  artistProfile: DbArtistProfile | null;
  writerProfile: DbWriterProfile | null;
  userId: string;
}

// ─── component ───────────────────────────────────────────────
export default function SettingsForm({ profile, artistProfile, writerProfile, userId }: Props) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [saveStatus, setSaveStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  // Base fields
  const [displayName, setDisplayName] = useState(profile.display_name);
  const [bio, setBio] = useState(profile.bio ?? "");
  const [location, setLocation] = useState(profile.location ?? "");
  const [website, setWebsite] = useState(profile.website ?? "");
  const [avatarUrl, setAvatarUrl] = useState<string | null>(profile.avatar_url);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Artist fields
  const [artStyles, setArtStyles] = useState<ArtStyle[]>((artistProfile?.art_styles ?? []) as ArtStyle[]);
  const [workTypes, setWorkTypes] = useState<WorkType[]>((artistProfile?.work_types ?? []) as WorkType[]);
  const [availability, setAvailability] = useState<AvailabilityStatus>(
    (artistProfile?.availability ?? "available") as AvailabilityStatus
  );
  const [priceMin, setPriceMin] = useState<string>(artistProfile?.price_range_min?.toString() ?? "");
  const [priceMax, setPriceMax] = useState<string>(artistProfile?.price_range_max?.toString() ?? "");
  const [artistGenres, setArtistGenres] = useState<string[]>(artistProfile?.genres ?? []);
  const [languages, setLanguages] = useState<string[]>(artistProfile?.languages ?? []);

  // Writer fields
  const [writerGenres, setWriterGenres] = useState<string[]>(writerProfile?.genres ?? []);
  const [lookingFor, setLookingFor] = useState<ArtStyle[]>((writerProfile?.looking_for ?? []) as ArtStyle[]);

  const isArtist = profile.role === "artist";

  // ── avatar upload ─────────────────────────────────────────
  async function handleAvatarChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setAvatarUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/avatar.${ext}`;

    const { error } = await supabase.storage
      .from("avatars")
      .upload(path, file, { upsert: true });

    if (!error) {
      const { data: { publicUrl } } = supabase.storage.from("avatars").getPublicUrl(path);
      setAvatarUrl(publicUrl);
    }
    setAvatarUploading(false);
  }

  // ── toggle helpers ────────────────────────────────────────
  function toggle<T>(arr: T[], item: T, setter: (v: T[]) => void) {
    setter(arr.includes(item) ? arr.filter((x) => x !== item) : [...arr, item]);
  }

  // ── save ─────────────────────────────────────────────────
  function handleSave() {
    if (!displayName.trim()) return;

    startTransition(async () => {
      setSaveStatus("idle");

      const result = await updateProfile({
        display_name: displayName,
        bio: bio || null,
        location: location || null,
        website: website || null,
        avatar_url: avatarUrl,
        ...(isArtist
          ? {
              art_styles: artStyles,
              work_types: workTypes,
              availability,
              price_range_min: priceMin ? parseInt(priceMin) : null,
              price_range_max: priceMax ? parseInt(priceMax) : null,
              genres: artistGenres,
              languages,
            }
          : {
              genres: writerGenres,
              looking_for: lookingFor,
            }),
      });

      if ("error" in result) {
        setSaveStatus("error");
        setErrorMsg(result.error);
      } else {
        setSaveStatus("success");
        // Refresh router so Navbar reflects new display name / avatar
        router.refresh();
      }
    });
  }

  // ── render ────────────────────────────────────────────────
  const initials = displayName
    .split(" ")
    .map((n) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-extrabold">Edit Profile</h1>
          <p className="text-sm text-[var(--muted)] mt-0.5">
            {isArtist ? "Artist" : "Writer"} · @{profile.username}
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={isPending || !displayName.trim()}
          className={clsx(
            "flex items-center gap-2 px-5 py-2.5 rounded-xl font-semibold text-sm transition-all",
            isPending || !displayName.trim()
              ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
              : "bg-[var(--accent)] text-white hover:opacity-90"
          )}
        >
          {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
          {isPending ? "Saving…" : "Save Changes"}
        </button>
      </div>

      {/* Status banners */}
      {saveStatus === "success" && (
        <div className="flex items-center gap-2 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm px-4 py-3 mb-6">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          Profile saved successfully.
        </div>
      )}
      {saveStatus === "error" && (
        <div className="flex items-center gap-2 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 mb-6">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="flex flex-col gap-8">

        {/* ── Avatar ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
          <SectionHeader>Photo</SectionHeader>
          <div className="flex items-center gap-5">
            <div className="relative">
              {avatarUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-20 h-20 rounded-full object-cover"
                />
              ) : (
                <div className="w-20 h-20 rounded-full bg-orange-200 text-orange-800 flex items-center justify-center text-2xl font-bold">
                  {initials}
                </div>
              )}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={avatarUploading}
                className="absolute -bottom-1 -right-1 w-7 h-7 rounded-full bg-[var(--accent)] text-white flex items-center justify-center shadow-md hover:opacity-90 transition-opacity disabled:opacity-60"
              >
                {avatarUploading ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Camera className="w-3.5 h-3.5" />
                )}
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleAvatarChange}
              />
            </div>
            <div>
              <p className="text-sm font-medium">Profile photo</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">
                JPG, PNG or GIF · Max 5 MB
              </p>
              {avatarUrl && (
                <button
                  type="button"
                  onClick={() => setAvatarUrl(null)}
                  className="text-xs text-red-500 hover:underline mt-1"
                >
                  Remove photo
                </button>
              )}
            </div>
          </div>
        </div>

        {/* ── Basic Info ── */}
        <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-5">
          <SectionHeader>Basic Info</SectionHeader>

          <Field label="Display Name" hint="This is how you appear across Toonect.">
            <input
              type="text"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              maxLength={64}
              className={INPUT_CLS}
              placeholder="Your name"
            />
          </Field>

          <Field label="Bio" hint="Tell people about yourself and your work style.">
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              rows={4}
              maxLength={500}
              className={clsx(INPUT_CLS, "resize-none leading-relaxed")}
              placeholder={
                isArtist
                  ? "e.g. I draw fast-paced action manhwa with expressive characters…"
                  : "e.g. I write dark fantasy stories with complex world-building…"
              }
            />
            <p className="text-xs text-[var(--muted)] text-right">{bio.length}/500</p>
          </Field>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <Field label="Location" hint="City, country, or region.">
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                className={INPUT_CLS}
                placeholder="e.g. Seoul, South Korea"
              />
            </Field>

            <Field label="Website" hint="Portfolio, social media, or personal site.">
              <input
                type="url"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
                className={INPUT_CLS}
                placeholder="https://…"
              />
            </Field>
          </div>
        </div>

        {/* ── Artist-specific ── */}
        {isArtist && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-6">
            <SectionHeader>Artist Details</SectionHeader>

            {/* Availability */}
            <Field label="Availability" hint="Let writers know if you're open to new projects.">
              <div className="flex gap-2 flex-wrap">
                {AVAILABILITY.map((a) => {
                  const cfg = AVAIL_CONFIG[a];
                  const active = availability === a;
                  return (
                    <button
                      key={a}
                      type="button"
                      onClick={() => setAvailability(a)}
                      className={clsx(
                        "px-4 py-2 rounded-xl text-sm font-semibold border transition-all",
                        active ? cfg.active : cfg.color
                      )}
                    >
                      {cfg.label}
                    </button>
                  );
                })}
              </div>
            </Field>

            {/* Art Styles */}
            <Field label="Art Styles" hint="Select all styles you can draw.">
              <div className="flex flex-wrap gap-2">
                {ART_STYLES.map((s) => (
                  <Toggle
                    key={s}
                    label={s}
                    selected={artStyles.includes(s)}
                    onToggle={() => toggle(artStyles, s, setArtStyles)}
                  />
                ))}
              </div>
            </Field>

            {/* Work Types */}
            <Field label="Work Types" hint="What kinds of work do you accept?">
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map((wt) => (
                  <Toggle
                    key={wt}
                    label={WORK_LABELS[wt]}
                    selected={workTypes.includes(wt)}
                    onToggle={() => toggle(workTypes, wt, setWorkTypes)}
                  />
                ))}
              </div>
            </Field>

            {/* Price Range */}
            <Field label="Price Range (USD)" hint="Per chapter or negotiable. Leave blank if free.">
              <div className="flex items-center gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={priceMin}
                    onChange={(e) => setPriceMin(e.target.value)}
                    placeholder="Min"
                    className={clsx(INPUT_CLS, "pl-7")}
                  />
                </div>
                <span className="text-[var(--muted)] text-sm flex-shrink-0">to</span>
                <div className="relative flex-1">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-[var(--muted)]">$</span>
                  <input
                    type="number"
                    min={0}
                    value={priceMax}
                    onChange={(e) => setPriceMax(e.target.value)}
                    placeholder="Max"
                    className={clsx(INPUT_CLS, "pl-7")}
                  />
                </div>
              </div>
            </Field>

            {/* Genres */}
            <Field label="Genres" hint="Select genres you enjoy drawing. Add custom ones too.">
              <TagList
                items={artistGenres}
                presets={COMMON_GENRES}
                onAdd={(t) => setArtistGenres((prev) => [...prev, t])}
                onRemove={(t) => setArtistGenres((prev) => prev.filter((x) => x !== t))}
                placeholder="Add a genre…"
              />
            </Field>

            {/* Languages */}
            <Field label="Languages" hint="Languages you can communicate in.">
              <TagList
                items={languages}
                presets={COMMON_LANGUAGES}
                onAdd={(t) => setLanguages((prev) => [...prev, t])}
                onRemove={(t) => setLanguages((prev) => prev.filter((x) => x !== t))}
                placeholder="Add a language…"
              />
            </Field>
          </div>
        )}

        {/* ── Writer-specific ── */}
        {!isArtist && (
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col gap-6">
            <SectionHeader>Writer Details</SectionHeader>

            {/* Genres */}
            <Field label="Genres You Write" hint="What kinds of stories do you write?">
              <TagList
                items={writerGenres}
                presets={COMMON_GENRES}
                onAdd={(t) => setWriterGenres((prev) => [...prev, t])}
                onRemove={(t) => setWriterGenres((prev) => prev.filter((x) => x !== t))}
                placeholder="Add a genre…"
              />
            </Field>

            {/* Looking For */}
            <Field label="Art Style Looking For" hint="What styles are you seeking for your stories?">
              <div className="flex flex-wrap gap-2">
                {ART_STYLES.map((s) => (
                  <Toggle
                    key={s}
                    label={s}
                    selected={lookingFor.includes(s)}
                    onToggle={() => toggle(lookingFor, s, setLookingFor)}
                  />
                ))}
              </div>
            </Field>
          </div>
        )}

        {/* Bottom save button */}
        <div className="flex justify-end gap-3 pb-4">
          <button
            onClick={handleSave}
            disabled={isPending || !displayName.trim()}
            className={clsx(
              "flex items-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-all",
              isPending || !displayName.trim()
                ? "bg-[var(--border)] text-[var(--muted)] cursor-not-allowed"
                : "bg-[var(--accent)] text-white hover:opacity-90"
            )}
          >
            {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
            {isPending ? "Saving…" : "Save Changes"}
          </button>
        </div>
      </div>
    </div>
  );
}
