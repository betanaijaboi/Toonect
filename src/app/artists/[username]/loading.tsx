export default function ArtistProfileLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      {/* Back link */}
      <div className="h-4 w-28 bg-[#e5e7eb] rounded mb-8" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Sidebar */}
        <aside className="lg:col-span-1 flex flex-col gap-5">
          {/* Profile card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 flex flex-col items-center gap-4">
            <div className="w-24 h-24 rounded-full bg-[#e5e7eb]" />
            <div className="space-y-2 text-center w-full">
              <div className="h-5 bg-[#e5e7eb] rounded w-2/3 mx-auto" />
              <div className="h-3 bg-[#e5e7eb] rounded w-1/3 mx-auto" />
            </div>
            <div className="h-8 w-32 rounded-full bg-[#e5e7eb]" />
            <div className="h-10 w-full rounded-xl bg-[#e5e7eb]" />
          </div>

          {/* Details card */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-5 space-y-5">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-3 w-20 bg-[#e5e7eb] rounded" />
                <div className="flex gap-2 flex-wrap">
                  <div className="h-7 w-16 rounded-full bg-[#e5e7eb]" />
                  <div className="h-7 w-20 rounded-full bg-[#e5e7eb]" />
                </div>
              </div>
            ))}
          </div>
        </aside>

        {/* Main */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Bio */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-3">
            <div className="h-5 w-20 bg-[#e5e7eb] rounded" />
            <div className="space-y-2">
              <div className="h-3 bg-[#e5e7eb] rounded w-full" />
              <div className="h-3 bg-[#e5e7eb] rounded w-5/6" />
              <div className="h-3 bg-[#e5e7eb] rounded w-4/6" />
            </div>
          </div>

          {/* Portfolio grid */}
          <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6">
            <div className="h-5 w-24 bg-[#e5e7eb] rounded mb-4" />
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="aspect-square rounded-xl bg-[#e5e7eb]" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
