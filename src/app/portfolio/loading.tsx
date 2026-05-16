export default function PortfolioLoading() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="space-y-2">
          <div className="h-8 w-36 bg-[#e5e7eb] rounded" />
          <div className="h-4 w-56 bg-[#e5e7eb] rounded" />
        </div>
        <div className="h-10 w-32 rounded-xl bg-[#e5e7eb]" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {/* Upload card placeholder */}
        <div className="aspect-square rounded-2xl border-2 border-dashed border-[var(--border)] bg-[#f9fafb]" />
        {/* Item skeletons */}
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="aspect-square rounded-2xl bg-[#e5e7eb]" />
        ))}
      </div>
    </div>
  );
}
