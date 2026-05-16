export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      {/* Header */}
      <div className="mb-8 space-y-2">
        <div className="h-8 w-40 bg-[#e5e7eb] rounded" />
        <div className="h-4 w-64 bg-[#e5e7eb] rounded" />
      </div>

      {/* Avatar */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 mb-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-full bg-[#e5e7eb]" />
        <div className="space-y-2">
          <div className="h-9 w-32 rounded-xl bg-[#e5e7eb]" />
          <div className="h-3 w-48 bg-[#e5e7eb] rounded" />
        </div>
      </div>

      {/* Form fields */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 space-y-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-28 bg-[#e5e7eb] rounded" />
            <div className="h-10 w-full rounded-xl bg-[#e5e7eb]" />
          </div>
        ))}

        {/* Bio textarea */}
        <div className="space-y-2">
          <div className="h-3.5 w-10 bg-[#e5e7eb] rounded" />
          <div className="h-28 w-full rounded-xl bg-[#e5e7eb]" />
        </div>
      </div>

      {/* Role-specific section */}
      <div className="rounded-2xl border border-[var(--border)] bg-[var(--surface)] p-6 mt-6 space-y-5">
        <div className="h-5 w-36 bg-[#e5e7eb] rounded" />
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="h-3.5 w-24 bg-[#e5e7eb] rounded" />
            <div className="flex gap-2 flex-wrap">
              {Array.from({ length: 4 }).map((_, j) => (
                <div key={j} className="h-8 w-20 rounded-full bg-[#e5e7eb]" />
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Save button */}
      <div className="mt-6 flex justify-end">
        <div className="h-11 w-32 rounded-xl bg-[#e5e7eb]" />
      </div>
    </div>
  );
}
