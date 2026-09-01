"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2, Mail, RefreshCw } from "lucide-react";
import { signIn, resendConfirmation } from "@/lib/auth-actions";

function LoginInner() {
  const searchParams = useSearchParams();
  const rawError = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";
  // Set by callback route when exchange fails, or by signIn when login credentials look like unconfirmed email
  const unconfirmedFromCallback = searchParams.get("unconfirmed") === "1";
  const unconfirmedEmail = searchParams.get("unconfirmed_email") ?? "";

  const [showPassword, setShowPassword] = useState(false);
  const [loginPending, setLoginPending] = useState(false);
  const [resendPending, setResendPending] = useState(false);
  const [resendEmail, setResendEmail] = useState(unconfirmedEmail);

  // Decide which banner variant to show
  const isUnconfirmedError =
    unconfirmedFromCallback ||
    !!unconfirmedEmail ||
    rawError?.toLowerCase().includes("not confirmed") ||
    rawError?.toLowerCase().includes("invalid login credentials");

  const errorMessage = rawError
    ? decodeURIComponent(rawError)
    : null;

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoginPending(true);
    await signIn(new FormData(e.currentTarget));
    setLoginPending(false);
  }

  async function handleResend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setResendPending(true);
    await resendConfirmation(new FormData(e.currentTarget));
    setResendPending(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-8">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
          Toonect
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-extrabold">Welcome back</h1>
          <p className="text-sm text-[var(--muted)] mt-1">Log in to your Toonect account</p>
        </div>

        {/* ── Error / unconfirmed email banner ─────────── */}
        {errorMessage && !isUnconfirmedError && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {errorMessage}
          </div>
        )}

        {isUnconfirmedError && (
          <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 overflow-hidden">
            <div className="flex items-start gap-3 px-4 py-3">
              <Mail className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-amber-800">Email not confirmed</p>
                <p className="text-xs text-amber-700 mt-0.5 leading-relaxed">
                  {unconfirmedFromCallback
                    ? (errorMessage ?? "The confirmation link failed. Try requesting a new one.")
                    : "You need to confirm your email before logging in."}
                </p>
              </div>
            </div>

            {/* Resend form */}
            <form onSubmit={handleResend} className="px-4 pb-4 flex flex-col gap-2">
              <input type="hidden" name="email" value={resendEmail} />
              {!resendEmail && (
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="Enter your email to resend"
                  value={resendEmail}
                  onChange={(e) => setResendEmail(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-amber-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-amber-400 focus:border-transparent"
                />
              )}
              <button
                type="submit"
                disabled={resendPending}
                className="flex items-center justify-center gap-2 w-full py-2 rounded-lg bg-amber-500 text-white text-xs font-semibold hover:bg-amber-600 transition-colors disabled:opacity-60"
              >
                {resendPending
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : <RefreshCw className="w-3.5 h-3.5" />}
                {resendPending ? "Sending…" : "Resend confirmation email"}
              </button>
            </form>
          </div>
        )}

        {/* ── Login form ────────────────────────────────── */}
        <form onSubmit={handleLogin} className="flex flex-col gap-5">
          <input type="hidden" name="next" value={next} />

          {/* Email */}
          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold" htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              required
              autoFocus
              autoComplete="email"
              defaultValue={resendEmail}
              onChange={(e) => setResendEmail(e.target.value)}
              placeholder="you@example.com"
              className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
            />
          </div>

          {/* Password */}
          <div className="flex flex-col gap-1.5">
            <div className="flex items-center justify-between">
              <label className="text-sm font-semibold" htmlFor="password">Password</label>
              <Link href="/auth/forgot-password" className="text-xs text-[var(--accent)] hover:underline">
                Forgot password?
              </Link>
            </div>
            <div className="relative">
              <input
                id="password"
                name="password"
                type={showPassword ? "text" : "password"}
                required
                autoComplete="current-password"
                placeholder="Your password"
                className="w-full px-4 pr-10 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                tabIndex={-1}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loginPending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {loginPending && <Loader2 className="w-4 h-4 animate-spin" />}
            {loginPending ? "Logging in…" : "Log in"}
          </button>
        </form>

        <p className="text-center text-sm text-[var(--muted)] mt-6">
          Don&apos;t have an account?{" "}
          <Link href="/auth/signup" className="font-semibold text-[var(--accent)] hover:underline">
            Join free
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginForm() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
