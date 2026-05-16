"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { Tag, Users } from "lucide-react";
import { WriterProject, WorkType } from "@/lib/types";
import clsx from "clsx";

const STYLE_COLORS: Record<string, string> = {
  manhwa: "bg-pink-100 text-pink-700",
  manga: "bg-blue-100 text-blue-700",
  manhua: "bg-amber-100 text-amber-700",
  webtoon: "bg-purple-100 text-purple-700",
  comic: "bg-green-100 text-green-700",
  other: "bg-gray-100 text-gray-600",
};

const WORK_TYPE_CONFIG: Record<WorkType, { label: string; className: string; bar: string }> = {
  free:         { label: "Free Collab", className: "bg-green-100 text-green-700 border-green-200",   bar: "bg-gradient-to-r from-green-400 to-emerald-400" },
  commissioned: { label: "Commission",  className: "bg-blue-100 text-blue-700 border-blue-200",     bar: "bg-gradient-to-r from-blue-400 to-indigo-400" },
  contracted:   { label: "Contract",    className: "bg-purple-100 text-purple-700 border-purple-200", bar: "bg-gradient-to-r from-purple-400 to-violet-400" },
};

const STATUS_CONFIG = {
  open:        { label: "Open",        className: "bg-emerald-100 text-emerald-700" },
  in_progress: { label: "In Progress", className: "bg-yellow-100 text-yellow-700"  },
  completed:   { label: "Completed",   className: "bg-gray-100 text-gray-500"      },
};

interface ProjectCardProps {
  project: WriterProject;
  writerUsername: string;
  writerName: string;
  compact?: boolean;
}

export default function ProjectCard({
  project,
  writerUsername,
  writerName,
  compact = false,
}: ProjectCardProps) {
  const workType = WORK_TYPE_CONFIG[project.work_type];
  const status   = STATUS_CONFIG[project.status];

  return (
    <motion.div
      whileHover={{ y: -5, boxShadow: "0 24px 52px rgba(0,0,0,0.11)" }}
      transition={{ type: "spring", stiffness: 420, damping: 26 }}
      className="rounded-2xl h-full"
      style={{ willChange: "transform" }}
    >
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] overflow-hidden hover:border-[var(--accent)] transition-colors duration-200 flex flex-col h-full">
        {/* Top accent bar — gradient by work type */}
        <div className={clsx("h-1 w-full", workType.bar)} />

        <div className="p-5 flex flex-col gap-4 flex-1">
          {/* Header row */}
          <div className="flex items-start justify-between gap-3">
            <div className="flex-1 min-w-0">
              <h3 className="font-bold text-base leading-tight line-clamp-1">{project.title}</h3>
              {!compact && (
                <Link
                  href={`/writers/${writerUsername}`}
                  className="text-xs text-[var(--muted)] hover:text-[var(--accent)] transition-colors mt-0.5 block"
                >
                  by {writerName}
                </Link>
              )}
            </div>
            <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full flex-shrink-0", status.className)}>
              {status.label}
            </span>
          </div>

          {/* Description */}
          <p className={clsx("text-sm text-[var(--muted)] leading-relaxed", compact ? "line-clamp-3" : "line-clamp-4")}>
            {project.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-auto">
            <span className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-[#fde8df] text-[var(--accent)] font-medium">
              <Tag className="w-3 h-3" />
              {project.genre}
            </span>
            {project.style_wanted.map((style) => (
              <span
                key={style}
                className={clsx("text-xs px-2.5 py-1 rounded-full font-semibold capitalize", STYLE_COLORS[style])}
              >
                {style}
              </span>
            ))}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between pt-3 border-t border-[var(--border)]">
            <span className={clsx("text-xs font-semibold px-2.5 py-1 rounded-full border", workType.className)}>
              {workType.label}
            </span>
            <Link
              href={`/writers/${writerUsername}`}
              className="flex items-center gap-1.5 text-xs font-medium text-[var(--accent)] hover:underline"
            >
              <Users className="w-3.5 h-3.5" />
              View Profile
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
