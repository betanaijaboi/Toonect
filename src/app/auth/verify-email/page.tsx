"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Mail, ArrowRight, CheckCircle, Loader2, RefreshCw } from "lucide-react";
import { resendConfirmation } from "@/lib/auth-actions";

function VerifyEmailInner() {
  const searchParams = useSearchParams();
  const wasResent = searchParams.get("resent") === "1";
  const emailParam = searchParams.get("email") ?? "";

  const [resendPending, setResendPending] = useState(false);
  const [resendEmail, setResendEmail] = useState(emailParam);
  const [justResent, setJustResent] = useState(wasResent);

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResendPending(true);
    await resendConfirmation(new FormData(e.currentTarget));
    setResendPending(false);
    setJustResent(true);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
          Toonect
        </Link>

        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${justResent ? "bg-green-100" : "bg-[#fde8df]"}`}>
          {justResent
            ? <CheckCircle className="w-8 h-8 text-green-600" />
            : <Mail className="w-8 h-8 text-[var(--accent)]" />
          }
        </div>

        <div>
          <h1 className="text-2xl font-extrabold mb-2">
            {justResent ? "Email sent!" : "Check your email"}
          </h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
            {justResent
              ? `A fresh confirmation link has been sent${resendEmail ? ` to ${resendEmail}` : ""}. Click it to activate your account.`
              : "We've sent you a confirmation link. Click it to activate your account and start connecting."
            }
          </p>
        </div>

        {/* Tip box */}
        <div className="w-full p-4 rounded-xl bg-[#f3f4f6] border border-[var(--border)] text-sm text-[var(--muted)] text-left space-y-1.5">
          <p className="font-semibold text-[var(--foreground)] text-xs uppercase tracking-wide">Tips</p>
          <ul className="space-y-1 text-xs">
            <li>• Check your <strong>spam / junk</strong> folder</li>
            <li>• Open the link in the <strong>same browser</strong> you signed up in</li>
            <li>• The link expires after <strong>15 minutes</strong></li>
          </ul>
        </div>

        {/* Resend form */}
        {!justResent && (
          <form onSubmit={handleResend} className="w-full flex flex-col gap-2">
            {!resendEmail && (
              <input
                type="email"
                name="email"
                required
                placeholder="Your email address"
                value={resendEmail}
                onChange={(e) => setResendEmail(e.target.value)}
                className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
              />
            )}
            {resendEmail && <input type="hidden" name="email" value={resendEmail} />}
            <button
              type="submit"
              disabled={resendPending}
              className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl border-2 border-[var(--border)] text-sm font-semibold hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors disabled:opacity-60"
            >
              {resendPending
                ? <Loader2 className="w-4 h-4 animate-spin" />
                : <RefreshCw className="w-4 h-4" />
              }
              {resendPending ? "Sending…" : "Resend confirmation email"}
            </button>
          </form>
        )}

        <Link
          href="/auth/login"
          className="flex items-center gap-2 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          Back to log in <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense>
      <VerifyEmailInner />
    </Suspense>
  );
}
