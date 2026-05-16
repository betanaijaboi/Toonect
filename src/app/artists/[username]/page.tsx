import { notFound } from "next/navigation";
import Link from "next/link";
import {
  MapPin,
  Globe,
  CheckCircle,
  Clock,
  XCircle,
  MessageCircle,
  ArrowLeft,
  Brush,
  Images,
} from "lucide-react";
import { getArtistByUsername, getCurrentUserProfile } from "@/lib/supabase/queries";
import { MOCK_ARTISTS } from "@/lib/mock-data";
import { ArtistProfile, AvailabilityStatus } from "@/lib/types";
import clsx from "clsx";

export const dynamic = "force-dynamic";

const STYLE_COLORS: Record<string, string> = {
  manhwa: "bg-pink-100 text-pink-700 border-pink-200",
  manga: "bg-blue-100 text-blue-700 border-blue-200",
  manhua: "bg-amber-100 text-amber-700 border-amber-200",
  webtoon: "bg-purple-100 text-purple-700 border-purple-200",
  comic: "bg-green-100 text-green-700 border-green-200",
  other: "bg-gray-100 text-gray-600 border-gray-200",
};

const AVAILABILITY_CONFIG: Record<
  AvailabilityStatus,
  { label: string; icon: React.ElementType; bg: string; text: string }
> = {
  available: { label: "Open for work", icon: CheckCircle, bg: "bg-green-50", text: "text-green-700" },
  busy: { label: "Currently busy", icon: Clock, bg: "bg-yellow-50", text: "text-yellow-700" },
  closed: { label: "Not taking work", icon: XCircle, bg: "bg-red-50", text: "text-red-600" },
};

function AvatarPlaceholder({ name, large }: { name: string; large?: boolean }) {
  const initials = name.split(" ").map((n) => n[0]).slice(0, 2).join("").toUpperCase();
  const colors = [
    "bg-orange-200 text-orange-800",
    "bg-pink-200 text-pink-800",
    "bg-blue-200 text-blue-800",
    "bg-purple-200 text-purple-800",
    "bg-green-200 text-green-800",
    "bg-amber-200 text-amber-800",
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

export default async function ArtistProfilePage({
  params,
}: {
  params: Promise<{ username: string }>;
}) {
  const { username } = await params;

  // Try real DB first, fall back to mock data
  let artist: ArtistProfile | null = await getArtistByUsername(username);
  if (!artist) {
    const mock = MOCK_ARTISTS.find((a) => a.username === username);
    artist = mock ?? null;
  }

  if (!artist) notFound();

  // Check if the current viewer owns this profile
  const { profile: viewerProfile } = await getCurrentUserProfile();
  const isOwner = viewerProfile?.id === artist.id;

  const avail = AVAILABILITY_CONFIG[artist.availability];
  const AvailIcon = avail.icon;

  const priceLabel =
    artist.price_range_min === 0 || artist.price_range_min === null
      ? "Free"
      : artist.price_range_max
      ? `$${artist.price_range_min} – $${artist.price_range_max}`
      : `From $${artist.price_range_min}`;

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {/* Back */}
      <Link
        href="/browse"
        className="inline-flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors mb-8"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Browse
      </Link>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-5">
          {/* Profile card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center text-center gap-4">
            {artist.avatar_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={artist.avatar_url}
                alt={artist.display_name}
                className="w-24 h-24 rounded-full object-cover"
              />
            ) : (
              <AvatarPlaceholder name={artist.display_name} large />
            )}

            <div>
              <h1 className="text-xl font-bold">{artist.display_name}</h1>
              <p className="text-sm text-[var(--muted)]">@{artist.username}</p>
            </div>

            {/* Availability */}
            <div className={clsx("flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium", avail.bg, avail.text)}>
              <AvailIcon className="w-4 h-4" />
              {avail.label}
            </div>

            {/* Location & website */}
            <div className="flex flex-col gap-1.5 w-full text-sm text-[var(--muted)]">
              {artist.location && (
                <div className="flex items-center justify-center gap-1.5">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  {artist.location}
                </div>
              )}
              {artist.website && (
                <a
                  href={artist.website}
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
              href={`/messages/new?to=${artist.username}`}
              className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
            >
              <MessageCircle className="w-4 h-4" />
              Send Message
            </Link>
          </div>

          {/* Details card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 flex flex-col gap-5">
            {/* Art styles */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Art Style</h2>
              <div className="flex flex-wrap gap-2">
                {artist.art_styles.map((style) => (
                  <span
                    key={style}
                    className={clsx("px-3 py-1 rounded-full text-sm font-semibold capitalize border", STYLE_COLORS[style])}
                  >
                    {style}
                  </span>
                ))}
              </div>
            </div>

            {/* Work types */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Work Types</h2>
              <div className="flex flex-wrap gap-2">
                {artist.work_types.map((wt) => (
                  <span key={wt} className="px-3 py-1 rounded-full text-sm bg-[#f3f4f6] border border-[var(--border)] capitalize">
                    {wt === "commissioned" ? "Commission" : wt === "contracted" ? "Contract" : "Free"}
                  </span>
                ))}
              </div>
            </div>

            {/* Price */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Pricing</h2>
              <p className="text-base font-bold">{priceLabel}</p>
              <p className="text-xs text-[var(--muted)] mt-0.5">per chapter / negotiable</p>
            </div>

            {/* Genres */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Genres</h2>
              <div className="flex flex-wrap gap-1.5">
                {artist.genres.map((g) => (
                  <span key={g} className="text-xs px-2.5 py-1 rounded-full bg-[#fde8df] text-[var(--accent)] font-medium">
                    {g}
                  </span>
                ))}
              </div>
            </div>

            {/* Languages */}
            <div>
              <h2 className="text-xs font-bold uppercase tracking-widest text-[var(--muted)] mb-2">Languages</h2>
              <div className="flex flex-wrap gap-1.5">
                {artist.languages.map((lang) => (
                  <span key={lang} className="text-xs px-2.5 py-1 rounded-full bg-[#f3f4f6] border border-[var(--border)]">
                    {lang}
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
            <p className="text-[var(--muted)] leading-relaxed">{artist.bio ?? "No bio yet."}</p>
          </div>

          {/* Portfolio */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-bold text-lg">Portfolio</h2>
              {isOwner && (
                <Link
                  href="/portfolio"
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-[var(--border)] text-xs font-semibold text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors"
                >
                  <Images className="w-3.5 h-3.5" />
                  Manage
                </Link>
              )}
            </div>

            {artist.portfolio_items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="w-16 h-16 rounded-2xl bg-[#fde8df] flex items-center justify-center mb-4">
                  <Brush className="w-8 h-8 text-[var(--accent)]" />
                </div>
                <p className="font-medium text-[var(--muted)]">No portfolio items yet</p>
                <p className="text-sm text-[var(--muted)] mt-1">
                  {isOwner
                    ? "Upload your artwork so writers can find you."
                    : "This artist hasn't uploaded any work yet."}
                </p>
                {isOwner && (
                  <Link
                    href="/portfolio"
                    className="mt-4 flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--accent)] text-white text-sm font-semibold hover:opacity-90 transition-opacity"
                  >
                    <Images className="w-4 h-4" />
                    Upload Work
                  </Link>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {artist.portfolio_items.map((item) => (
                  <div key={item.id} className="rounded-xl overflow-hidden aspect-square bg-[#f3f4f6] group relative">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    />
                    <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <p className="text-white text-xs font-semibold truncate">{item.title}</p>
                    </div>
                  </div>
                ))}
                {isOwner && (
                  <Link
                    href="/portfolio"
                    className="aspect-square rounded-xl border-2 border-dashed border-[var(--border)] flex flex-col items-center justify-center gap-1 text-[var(--muted)] hover:border-[var(--accent)] hover:text-[var(--accent)] hover:bg-[#fde8df]/20 transition-all"
                  >
                    <Images className="w-6 h-6" />
                    <span className="text-xs font-semibold">Manage</span>
                  </Link>
                )}
              </div>
            )}
          </div>

          {/* Member since */}
          <p className="text-xs text-[var(--muted)] text-right">
            Member since {new Date(artist.created_at).toLocaleDateString("en-US", { month: "long", year: "numeric" })}
          </p>
        </div>
      </div>
    </div>
  );
}
