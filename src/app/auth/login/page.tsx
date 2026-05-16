"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Eye, EyeOff, Loader2 } from "lucide-react";
import { signIn } from "@/lib/auth-actions";
import clsx from "clsx";

function LoginInner() {
  const searchParams = useSearchParams();
  const errorParam = searchParams.get("error");
  const next = searchParams.get("next") ?? "/";

  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    await signIn(new FormData(e.currentTarget));
    setPending(false);
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

        {/* Error banner */}
        {errorParam && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {decodeURIComponent(errorParam)}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
            disabled={pending}
            className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {pending && <Loader2 className="w-4 h-4 animate-spin" />}
            {pending ? "Logging in…" : "Log in"}
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

export default function LoginPage() {
  return (
    <Suspense>
      <LoginInner />
    </Suspense>
  );
}
