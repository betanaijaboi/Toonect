// Homepage skeleton — shows while the server component fetches artists + projects
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

export default function HomeLoading() {
  return (
    <div className="flex flex-col">
      {/* Hero skeleton */}
      <section className="px-4 py-20 sm:py-32 flex flex-col items-center gap-5 animate-pulse">
        <div className="h-6 w-48 rounded-full bg-[#e5e7eb]" />
        <div className="h-12 w-80 rounded-xl bg-[#e5e7eb]" />
        <div className="h-8 w-56 rounded-xl bg-[#e5e7eb]" />
        <div className="h-5 w-96 max-w-full rounded bg-[#e5e7eb]" />
        <div className="flex gap-4 mt-2">
          <div className="h-12 w-40 rounded-xl bg-[#e5e7eb]" />
          <div className="h-12 w-40 rounded-xl bg-[#e5e7eb]" />
        </div>
      </section>

      {/* Featured Artists */}
      <section className="py-16 px-4 max-w-7xl mx-auto w-full">
        <div className="flex items-center justify-between mb-10">
          <div className="space-y-2 animate-pulse">
            <div className="h-7 w-48 rounded bg-[#e5e7eb]" />
            <div className="h-4 w-64 rounded bg-[#e5e7eb]" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {Array.from({ length: 8 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      </section>

      {/* Latest Projects */}
      <section className="py-16 px-4 bg-[var(--surface)] border-y border-[var(--border)]">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div className="space-y-2 animate-pulse">
              <div className="h-7 w-48 rounded bg-[#e5e7eb]" />
              <div className="h-4 w-64 rounded bg-[#e5e7eb]" />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {Array.from({ length: 3 }).map((_, i) => <CardSkeleton key={i} />)}
          </div>
        </div>
      </section>
    </div>
  );
}
