import Link from "next/link";
import { BookOpen, Mail, ArrowRight } from "lucide-react";

export default function VerifyEmailPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4 py-12 text-center">
      <div className="w-full max-w-sm flex flex-col items-center gap-6">
        <Link href="/" className="flex items-center gap-2 font-bold text-xl">
          <BookOpen className="w-6 h-6 text-[var(--accent)]" />
          Toonect
        </Link>

        <div className="w-16 h-16 rounded-2xl bg-[#fde8df] flex items-center justify-center">
          <Mail className="w-8 h-8 text-[var(--accent)]" />
        </div>

        <div>
          <h1 className="text-2xl font-extrabold mb-2">Check your email</h1>
          <p className="text-sm text-[var(--muted)] leading-relaxed max-w-xs">
            We&apos;ve sent you a confirmation link. Click it to activate your account and start connecting.
          </p>
        </div>

        <div className="w-full p-4 rounded-xl bg-[#f3f4f6] border border-[var(--border)] text-sm text-[var(--muted)] text-left space-y-1">
          <p className="font-medium text-[var(--foreground)]">Didn&apos;t get the email?</p>
          <p>Check your spam folder, or wait a minute and try again.</p>
        </div>

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
