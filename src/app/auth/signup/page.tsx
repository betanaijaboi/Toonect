"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { BookOpen, Brush, Eye, EyeOff, ArrowLeft, ArrowRight, CheckCircle, Loader2 } from "lucide-react";
import { signUp } from "@/lib/auth-actions";
import clsx from "clsx";

type Role = "writer" | "artist";
type Step = "role" | "details";

const ROLE_CONFIG = {
  writer: {
    icon: BookOpen,
    title: "I'm a Writer",
    tagline: "I have a story to tell",
    perks: ["Post story briefs artists can apply to", "Browse artists by style and availability", "Message artists directly — no middleman"],
    color: "border-indigo-300 bg-indigo-50",
    activeColor: "border-[var(--accent)] bg-[#fde8df]",
    iconColor: "text-indigo-600",
    activeIconColor: "text-[var(--accent)]",
  },
  artist: {
    icon: Brush,
    title: "I'm an Artist",
    tagline: "I bring stories to life",
    perks: ["Showcase your portfolio to writers worldwide", "Browse open story briefs and apply", "Set your own rates and availability"],
    color: "border-pink-300 bg-pink-50",
    activeColor: "border-[var(--accent)] bg-[#fde8df]",
    iconColor: "text-pink-600",
    activeIconColor: "text-[var(--accent)]",
  },
};

function SignupInner() {
  const searchParams = useSearchParams();
  const urlRole = searchParams.get("role") as Role | null;
  const errorParam = searchParams.get("error");

  const [step, setStep] = useState<Step>(urlRole ? "details" : "role");
  const [role, setRole] = useState<Role>(urlRole ?? "writer");
  const [showPassword, setShowPassword] = useState(false);
  const [pending, setPending] = useState(false);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Username validation
  const [username, setUsername] = useState("");
  const usernameValid = /^[a-z0-9_]{3,24}$/.test(username);

  useEffect(() => {
    if (urlRole) setRole(urlRole);
  }, [urlRole]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);

    // Client-side validation
    const errors: Record<string, string> = {};
    const pw = data.get("password") as string;
    if (pw.length < 8) errors.password = "Password must be at least 8 characters.";
    if (!usernameValid) errors.username = "3–24 chars, lowercase letters, numbers, underscores only.";
    if (Object.keys(errors).length) { setFieldErrors(errors); return; }

    setFieldErrors({});
    setPending(true);
    await signUp(data);
    setPending(false);
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 font-bold text-xl mb-8">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
          Toonect
        </Link>

        {/* Error banner */}
        {errorParam && (
          <div className="mb-6 px-4 py-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
            {decodeURIComponent(errorParam)}
          </div>
        )}

        {/* Step 1: Role picker */}
        {step === "role" && (
          <div className="flex flex-col gap-6">
            <div className="text-center">
              <h1 className="text-2xl font-extrabold mb-1">Join Toonect</h1>
              <p className="text-[var(--muted)] text-sm">How will you use Toonect?</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {(["writer", "artist"] as Role[]).map((r) => {
                const cfg = ROLE_CONFIG[r];
                const Icon = cfg.icon;
                const isSelected = role === r;
                return (
                  <button
                    key={r}
                    onClick={() => setRole(r)}
                    className={clsx(
                      "relative flex flex-col items-start gap-4 p-5 rounded-2xl border-2 text-left transition-all",
                      isSelected ? cfg.activeColor : cfg.color + " hover:border-gray-400"
                    )}
                  >
                    {isSelected && (
                      <CheckCircle className="absolute top-3 right-3 w-5 h-5 text-[var(--accent)]" />
                    )}
                    <div className={clsx("w-12 h-12 rounded-xl flex items-center justify-center", isSelected ? "bg-[var(--accent)]" : "bg-white")}>
                      <Icon className={clsx("w-6 h-6", isSelected ? "text-white" : cfg.iconColor)} />
                    </div>
                    <div>
                      <p className="font-bold text-base">{cfg.title}</p>
                      <p className="text-xs text-[var(--muted)] mt-0.5">{cfg.tagline}</p>
                    </div>
                    <ul className="flex flex-col gap-1.5 mt-1">
                      {cfg.perks.map((perk) => (
                        <li key={perk} className="flex items-start gap-2 text-xs text-[var(--muted)]">
                          <span className="text-[var(--accent)] mt-0.5 flex-shrink-0">✓</span>
                          {perk}
                        </li>
                      ))}
                    </ul>
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => setStep("details")}
              className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity"
            >
              Continue as {ROLE_CONFIG[role].title.replace("I'm a ", "").replace("I'm an ", "")}
              <ArrowRight className="w-4 h-4" />
            </button>

            <p className="text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-[var(--accent)] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}

        {/* Step 2: Details form */}
        {step === "details" && (
          <div className="flex flex-col gap-6">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep("role")}
                className="p-1.5 rounded-lg hover:bg-[#f3f4f6] transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-2xl font-extrabold leading-tight">Create your account</h1>
                <div className="flex items-center gap-1.5 mt-1">
                  {role === "writer"
                    ? <BookOpen className="w-3.5 h-3.5 text-[var(--accent)]" />
                    : <Brush className="w-3.5 h-3.5 text-[var(--accent)]" />}
                  <span className="text-xs text-[var(--muted)] capitalize">Joining as a {role}</span>
                  <button onClick={() => setStep("role")} className="text-xs text-[var(--accent)] hover:underline ml-1">Change</button>
                </div>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <input type="hidden" name="role" value={role} />

              {/* Display name */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" htmlFor="display_name">Display name</label>
                <input
                  id="display_name"
                  name="display_name"
                  type="text"
                  required
                  placeholder="e.g. Elara Voss"
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
                />
              </div>

              {/* Username */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" htmlFor="username">Username</label>
                <div className="relative">
                  <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] text-sm select-none">@</span>
                  <input
                    id="username"
                    name="username"
                    type="text"
                    required
                    value={username}
                    onChange={(e) => setUsername(e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, ""))}
                    placeholder="stormscribe"
                    maxLength={24}
                    className={clsx(
                      "w-full pl-8 pr-10 py-2.5 rounded-xl border bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition",
                      fieldErrors.username ? "border-red-400" : "border-[var(--border)]"
                    )}
                  />
                  {username.length >= 3 && (
                    <CheckCircle className={clsx("absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4", usernameValid ? "text-green-500" : "text-red-400")} />
                  )}
                </div>
                {fieldErrors.username
                  ? <p className="text-xs text-red-500">{fieldErrors.username}</p>
                  : <p className="text-xs text-[var(--muted)]">3–24 characters. Lowercase, numbers, underscores only.</p>
                }
              </div>

              {/* Email */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="you@example.com"
                  className="px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition"
                />
              </div>

              {/* Password */}
              <div className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold" htmlFor="password">Password</label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    placeholder="Min. 8 characters"
                    className={clsx(
                      "w-full px-4 pr-10 py-2.5 rounded-xl border bg-[var(--surface)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent transition",
                      fieldErrors.password ? "border-red-400" : "border-[var(--border)]"
                    )}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--foreground)] transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
              </div>

              {/* Terms */}
              <p className="text-xs text-[var(--muted)] leading-relaxed">
                By creating an account you agree to our{" "}
                <Link href="/terms" className="underline hover:text-[var(--foreground)]">Terms of Service</Link>{" "}
                and{" "}
                <Link href="/privacy" className="underline hover:text-[var(--foreground)]">Privacy Policy</Link>.
              </p>

              <button
                type="submit"
                disabled={pending}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded-xl bg-[var(--accent)] text-white font-semibold hover:opacity-90 transition-opacity disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pending ? <Loader2 className="w-4 h-4 animate-spin" /> : null}
                {pending ? "Creating account…" : "Create account"}
              </button>
            </form>

            <p className="text-center text-sm text-[var(--muted)]">
              Already have an account?{" "}
              <Link href="/auth/login" className="font-semibold text-[var(--accent)] hover:underline">
                Log in
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense>
      <SignupInner />
    </Suspense>
  );
}
