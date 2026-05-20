"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, CheckCircle, Clock, XCircle } from "lucide-react";
import { ArtistProfile, AvailabilityStatus } from "@/lib/types";
import clsx from "clsx";

/* Top accent stripe by primary art style */
const STYLE_STRIPE: Record<string, string> = {
  manhwa:  "bg-gradient-to-r from-pink-400 to-rose-400",
  manga:   "bg-gradient-to-r from-blue-400 to-indigo-400",
  manhua:  "bg-gradient-to-r from-amber-400 to-orange-400",
  webtoon: "bg-gradient-to-r from-purple-400 to-violet-400",
  comic:   "bg-gradient-to-r from-green-400 to-emerald-400",
  other:   "bg-gradient-to-r from-gray-300 to-gray-400",
};

const STYLE_COLORS: Record<string, string> = {
  manhwa: "bg-pink-100 text-pink-700",
  manga: "bg-blue-100 text-blue-700",
  manhua: "bg-amber-100 text-amber-700",
  webtoon: "bg-purple-100 text-purple-700",
  comic: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-600",
};

const WORK_TYPE_LABELS: Record<string, string> = {
  free: "Free",
  commissioned: "Commission",
  contracted: "Contract",
};

const AVAILABILITY_CONFIG: Record<
  AvailabilityStatus,
  { label: string; icon: React.ElementType; className: string }
> = {
  available: { label: "Available", icon: CheckCircle, className: "text-green-600" },
  busy:      { label: "Busy",      icon: Clock,        className: "text-yellow-600" },
  closed:    { label: "Closed",    icon: XCircle,      className: "text-red-500"   },
};

function AvatarPlaceholder({ name }: { name: string }) {
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
    <div className={clsx("w-full h-full flex items-center justify-center text-2xl font-bold", color)}>
      {initials}
    </div>
  );
}

interface ArtistCardProps {
  artist: ArtistProfile;
}

export default function ArtistCard({ artist }: ArtistCardProps) {
  const avail = AVAILABILITY_CONFIG[artist.availability];
  const AvailIcon = avail.icon;

  const primaryStyle = artist.art_styles[0] ?? "other";
  const stripe = STYLE_STRIPE[primaryStyle] ?? STYLE_STRIPE.other;

  return (
    <motion.div
      whileHover={{ y: -3, x: -3, boxShadow: "4px 4px 0px #0f0f0f" }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      className="h-full rounded-2xl"
      style={{ willChange: "transform" }}
    >
      <Link
        href={`/artists/${artist.username}`}
        className="group flex flex-col rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--foreground)] transition-colors duration-150 h-full"
      >
        {/* Style stripe — top gradient bar */}
        <div className={clsx("h-1.5 w-full flex-shrink-0", stripe)} />

        {/* Avatar */}
        <div className="relative h-32 bg-[#f3f4f6] overflow-hidden">
          {artist.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={artist.avatar_url}
              alt={artist.display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
          ) : (
            <AvatarPlaceholder name={artist.display_name} />
          )}

          {/* Availability badge */}
          <div className={clsx(
            "absolute top-3 right-3 flex items-center gap-1 text-xs font-semibold bg-white rounded-full px-2 py-1 shadow-sm",
            avail.className
          )}>
            <AvailIcon className="w-3 h-3" />
            {avail.label}
          </div>
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-4 flex-1">
          <div>
            <h3 className="font-bold text-base leading-tight group-hover:text-[var(--accent)] transition-colors duration-200">
              {artist.display_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">@{artist.username}</p>
          </div>

          {artist.location && (
            <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {artist.location}
            </p>
          )}

          {artist.bio && (
            <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">{artist.bio}</p>
          )}

          <div className="flex flex-wrap gap-1.5">
            {artist.art_styles.map((style) => (
              <span
                key={style}
                className={clsx("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", STYLE_COLORS[style])}
              >
                {style}
              </span>
            ))}
          </div>

          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
            <div className="flex flex-wrap gap-1">
              {artist.work_types.map((wt) => (
                <span key={wt} className="text-xs text-[var(--muted)] bg-[#f3f4f6] px-2 py-0.5 rounded-full">
                  {WORK_TYPE_LABELS[wt]}
                </span>
              ))}
            </div>
            {artist.price_range_min !== null && (
              <span className="text-xs font-semibold text-[var(--foreground)]">
                {artist.price_range_min === 0 ? "Free" : `$${artist.price_range_min}+`}
              </span>
            )}
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
