function ProjectCardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 animate-pulse">
      <div className="flex items-start justify-between gap-2">
        <div className="h-5 bg-[#e5e7eb] rounded w-2/3" />
        <div className="h-6 w-20 rounded-full bg-[#e5e7eb] flex-shrink-0" />
      </div>
      <div className="space-y-2">
        <div className="h-3 bg-[#e5e7eb] rounded w-full" />
        <div className="h-3 bg-[#e5e7eb] rounded w-5/6" />
        <div className="h-3 bg-[#e5e7eb] rounded w-3/4" />
      </div>
      <div className="flex gap-2 flex-wrap">
        <div className="h-6 w-16 rounded-full bg-[#e5e7eb]" />
        <div className="h-6 w-20 rounded-full bg-[#e5e7eb]" />
        <div className="h-6 w-14 rounded-full bg-[#e5e7eb]" />
      </div>
      <div className="flex items-center gap-2 pt-1">
        <div className="w-6 h-6 rounded-full bg-[#e5e7eb]" />
        <div className="h-3 w-28 bg-[#e5e7eb] rounded" />
      </div>
    </div>
  );
}

export default function ProjectsLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8 animate-pulse">
        <div className="space-y-2">
          <div className="h-8 w-48 rounded bg-[#e5e7eb]" />
          <div className="h-4 w-64 rounded bg-[#e5e7eb]" />
        </div>
        <div className="h-10 w-36 rounded-xl bg-[#e5e7eb]" />
      </div>

      {/* Filter bar */}
      <div className="flex flex-wrap gap-2 mb-8 animate-pulse">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="h-8 w-24 rounded-full bg-[#e5e7eb]" />
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {Array.from({ length: 6 }).map((_, i) => <ProjectCardSkeleton key={i} />)}
      </div>
    </div>
  );
}
