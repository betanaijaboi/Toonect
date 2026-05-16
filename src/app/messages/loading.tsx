export default function MessagesLoading() {
  return (
    <div className="flex h-[calc(100vh-4rem)] max-w-6xl mx-auto border-x border-[var(--border)]">
      {/* Conversation list pane */}
      <aside className="w-full sm:w-80 border-r border-[var(--border)] flex flex-col">
        <div className="px-4 py-4 border-b border-[var(--border)] animate-pulse">
          <div className="h-6 w-28 bg-[#e5e7eb] rounded" />
        </div>
        <div className="flex-1 overflow-hidden divide-y divide-[var(--border)]">
          {Array.from({ length: 7 }).map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-4 py-3.5 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-[#e5e7eb] flex-shrink-0" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3.5 bg-[#e5e7eb] rounded w-3/4" />
                <div className="h-3 bg-[#e5e7eb] rounded w-full" />
              </div>
              <div className="h-3 w-8 bg-[#e5e7eb] rounded flex-shrink-0" />
            </div>
          ))}
        </div>
      </aside>

      {/* Thread pane */}
      <div className="hidden sm:flex flex-1 items-center justify-center">
        <div className="text-center space-y-3 animate-pulse">
          <div className="w-16 h-16 rounded-2xl bg-[#e5e7eb] mx-auto" />
          <div className="h-4 w-40 bg-[#e5e7eb] rounded mx-auto" />
          <div className="h-3 w-56 bg-[#e5e7eb] rounded mx-auto" />
        </div>
      </div>
    </div>
  );
}
