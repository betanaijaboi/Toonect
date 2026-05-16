function CardSkeleton() {
  return (
    <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-3 animate-pulse">
      <div className="flex items-center gap-3">
        <div className="w-14 h-14 rounded-full bg-[#e5e7eb] flex-shrink-0" />
        <div className="flex-1 space-y-2">
          <div className="h-4 bg-[#e5e7eb] rounded w-3/4" />
          <div className="h-3 bg-[#e5e7eb] rounded w-1/2" />
        </div>
      </div>
      <div className="h-3 bg-[#e5e7eb] rounded w-full" />
      <div className="h-3 bg-[#e5e7eb] rounded w-4/5" />
      <div className="flex gap-2 pt-1">
        <div className="h-6 w-16 rounded-full bg-[#e5e7eb]" />
        <div className="h-6 w-16 rounded-full bg-[#e5e7eb]" />
      </div>
    </div>
  );
}

export default function BrowseLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Tab / filter bar */}
      <div className="flex gap-2 mb-6 animate-pulse">
        {Array.from({ length: 2 }).map((_, i) => (
          <div key={i} className="h-10 w-24 rounded-xl bg-[#e5e7eb]" />
        ))}
        <div className="ml-auto h-10 w-64 rounded-xl bg-[#e5e7eb]" />
      </div>

      {/* Filter chips */}
      <div className="flex flex-wrap gap-2 mb-8 animate-pulse">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-8 w-20 rounded-full bg-[#e5e7eb]" />
        ))}
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
      </div>
    </div>
  );
}
