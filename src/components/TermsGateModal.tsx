"use client";

import { useRef, useState } from "react";
import { CheckCircle, X } from "lucide-react";
import { LegalDocument, TERMS_DOC, PRIVACY_DOC } from "@/lib/legal-content";

interface TermsGateModalProps {
  onAccept: () => void;
  onDecline: () => void;
}

export function TermsGateModal({ onAccept, onDecline }: TermsGateModalProps) {
  const [reachedEnd, setReachedEnd] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  function handleScroll() {
    const el = scrollRef.current;
    if (!el) return;
    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    if (distanceFromBottom < 24) setReachedEnd(true);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 py-8">
      <div className="w-full max-w-2xl max-h-full flex flex-col rounded-2xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] flex-shrink-0">
          <h2 className="font-extrabold text-lg">Terms of Service &amp; Privacy Policy</h2>
          <button
            type="button"
            onClick={onDecline}
            aria-label="Close"
            className="p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable document */}
        <div ref={scrollRef} onScroll={handleScroll} className="overflow-y-auto flex-1">
          <LegalDocument doc={TERMS_DOC} />
          <div className="border-t border-[var(--border)]" />
          <LegalDocument doc={PRIVACY_DOC} />
          <p className="text-center text-xs text-[var(--muted)] pb-8">— End of documents —</p>
        </div>

        {/* Footer */}
        <div className="flex flex-col gap-3 px-6 py-4 border-t border-[var(--border)] flex-shrink-0">
          {!reachedEnd && (
            <p className="text-xs text-[var(--muted)] text-center">
              Scroll to the end of both documents to enable Agree.
            </p>
          )}
          <div className="flex gap-3">
            <button
              type="button"
              onClick={onDecline}
              className="flex-1 py-2.5 rounded-xl border-2 border-[var(--border)] font-semibold text-sm hover:bg-[#f3f4f6] transition-colors"
            >
              Decline
            </button>
            <button
              type="button"
              onClick={onAccept}
              disabled={!reachedEnd}
              className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[var(--accent)] text-white font-semibold text-sm hover:opacity-90 transition-opacity disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <CheckCircle className="w-4 h-4" />
              I Agree
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
