import Link from "next/link";
import { BookOpen, Home, Brush } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 text-center">
      <BookOpen className="w-10 h-10 text-[var(--accent)] mb-4" />
      <h1 className="text-3xl font-extrabold mb-2">Page not found</h1>
      <p className="text-[var(--muted)] max-w-sm mb-8">
        This page doesn&apos;t exist — the story brief or profile you&apos;re looking for may have moved.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          href="/"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          <Home className="w-4 h-4" />
          Back home
        </Link>
        <Link
          href="/browse"
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--foreground)] font-semibold text-sm hover:bg-[var(--foreground)] hover:text-[var(--background)] transition-all"
        >
          <Brush className="w-4 h-4" />
          Browse artists
        </Link>
      </div>
    </div>
  );
}
