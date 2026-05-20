"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, BookOpen } from "lucide-react";
import { WriterProfile } from "@/lib/types";
import clsx from "clsx";

/* Top accent stripe by primary style wanted */
const STYLE_STRIPE: Record<string, string> = {
  manhwa:  "bg-gradient-to-r from-pink-400 to-rose-400",
  manga:   "bg-gradient-to-r from-blue-400 to-indigo-400",
  manhua:  "bg-gradient-to-r from-amber-400 to-orange-400",
  webtoon: "bg-gradient-to-r from-purple-400 to-violet-400",
  comic:   "bg-gradient-to-r from-green-400 to-emerald-400",
  other:   "bg-gradient-to-r from-gray-300 to-gray-400",
};

const STYLE_COLORS: Record<string, string> = {
  manhwa:  "bg-pink-100 text-pink-700",
  manga:   "bg-blue-100 text-blue-700",
  manhua:  "bg-amber-100 text-amber-700",
  webtoon: "bg-purple-100 text-purple-700",
  comic:   "bg-green-100 text-green-700",
  other:   "bg-gray-100 text-gray-600",
};

const WORK_TYPE_DOT: Record<string, string> = {
  free:        "bg-green-400",
  commissioned:"bg-blue-400",
  contracted:  "bg-purple-400",
};

function AvatarPlaceholder({ name }: { name: string }) {
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
    <div className={clsx("w-full h-full flex items-center justify-center text-2xl font-bold", color)}>
      {initials}
    </div>
  );
}

interface WriterCardProps {
  writer: WriterProfile;
}

export default function WriterCard({ writer }: WriterCardProps) {
  const openProjects = writer.projects.filter((p) => p.status === "open");
  const workTypes = [...new Set(writer.projects.map((p) => p.work_type))];
  const primaryStyle = writer.looking_for[0] ?? "other";
  const stripe = STYLE_STRIPE[primaryStyle] ?? STYLE_STRIPE.other;

  return (
    <motion.div
      whileHover={{ y: -3, x: -3, boxShadow: "4px 4px 0px #0f0f0f" }}
      transition={{ type: "spring", stiffness: 480, damping: 28 }}
      className="h-full rounded-2xl"
      style={{ willChange: "transform" }}
    >
      <Link
        href={`/writers/${writer.username}`}
        className="group flex flex-col rounded-2xl border-2 border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--foreground)] transition-colors duration-150 h-full"
      >
        {/* Style stripe */}
        <div className={clsx("h-1.5 w-full flex-shrink-0", stripe)} />

        {/* Avatar */}
        <div className="relative h-32 bg-[#f3f4f6] overflow-hidden">
          {writer.avatar_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={writer.avatar_url}
              alt={writer.display_name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <AvatarPlaceholder name={writer.display_name} />
          )}

          {/* Open projects badge */}
          {openProjects.length > 0 && (
            <div className="absolute top-3 right-3 flex items-center gap-1 text-xs font-bold bg-white rounded-full px-2 py-1 shadow-sm text-[var(--accent)] border border-[var(--accent-soft)]">
              <BookOpen className="w-3 h-3" />
              {openProjects.length} open
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex flex-col gap-3 p-4 flex-1">
          <div>
            <h3 className="font-extrabold text-base leading-tight group-hover:text-[var(--accent)] transition-colors">
              {writer.display_name}
            </h3>
            <p className="text-xs text-[var(--muted)]">@{writer.username}</p>
          </div>

          {writer.location && (
            <p className="flex items-center gap-1 text-xs text-[var(--muted)]">
              <MapPin className="w-3 h-3 flex-shrink-0" />
              {writer.location}
            </p>
          )}

          {writer.bio && (
            <p className="text-xs text-[var(--muted)] leading-relaxed line-clamp-2">{writer.bio}</p>
          )}

          {/* Styles wanted */}
          <div className="flex flex-wrap gap-1.5">
            {writer.looking_for.map((style) => (
              <span
                key={style}
                className={clsx("px-2 py-0.5 rounded-full text-xs font-semibold capitalize", STYLE_COLORS[style])}
              >
                {style}
              </span>
            ))}
          </div>

          {/* Work types & genres */}
          <div className="flex items-center justify-between mt-auto pt-2 border-t border-[var(--border)]">
            <div className="flex gap-1.5 items-center">
              {workTypes.map((wt) => (
                <span
                  key={wt}
                  className={clsx("w-2 h-2 rounded-full", WORK_TYPE_DOT[wt])}
                  title={wt}
                />
              ))}
              <span className="text-xs text-[var(--muted)]">
                {workTypes.map((wt) =>
                  wt === "commissioned" ? "Commission" : wt === "contracted" ? "Contract" : "Free"
                ).join(", ")}
              </span>
            </div>
            <span className="text-xs text-[var(--muted)]">{writer.genres[0]}</span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
