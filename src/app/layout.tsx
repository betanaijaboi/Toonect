import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Link from "next/link";
import { BookOpen, Brush, FileText, MessageCircle } from "lucide-react";
import "./globals.css";
import Navbar from "@/components/Navbar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Toonect — Where Stories Find Their Art",
  description:
    "Connect writers with manga, manhwa, and manhua artists. Find your perfect creative partner for free, commissioned, or contracted work.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        <Navbar />
        <main className="flex-1">{children}</main>

        {/* ── Footer ─────────────────────────────────────── */}
        <footer className="bg-[var(--foreground)] text-white border-t-4 border-[var(--accent)]">
          <div className="max-w-7xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">

            {/* Brand */}
            <div className="lg:col-span-1">
              <Link href="/" className="flex items-center gap-2 mb-4">
                <BookOpen className="w-5 h-5 text-[var(--accent)]" />
                <span className="font-black text-xl tracking-tight">Toonect</span>
              </Link>
              <p className="text-sm text-gray-400 leading-relaxed mb-4">
                The platform for manga, manhwa, and manhua creators to connect, collaborate, and create.
              </p>
              <div className="flex gap-2 flex-wrap">
                {["Manhwa", "Manga", "Manhua", "Webtoon"].map((s) => (
                  <span key={s} className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm border border-gray-700 text-gray-500">
                    {s}
                  </span>
                ))}
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Platform</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/browse",   icon: <Brush className="w-3.5 h-3.5" />,        label: "Browse Artists"  },
                  { href: "/projects", icon: <FileText className="w-3.5 h-3.5" />,     label: "Open Projects"   },
                  { href: "/messages", icon: <MessageCircle className="w-3.5 h-3.5" />, label: "Messages"        },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors">
                      {l.icon}
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Join links */}
            <div>
              <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-4">Join</h4>
              <ul className="space-y-2.5">
                {[
                  { href: "/auth/signup?role=artist", label: "Join as Artist" },
                  { href: "/auth/signup?role=writer", label: "Join as Writer" },
                  { href: "/auth/login",              label: "Log In"         },
                ].map((l) => (
                  <li key={l.href}>
                    <Link href={l.href} className="text-sm text-gray-400 hover:text-white transition-colors">
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Manga flavour panel */}
            <div className="border-2 border-gray-700 rounded-2xl p-4 flex flex-col justify-between" style={{ boxShadow: "3px 3px 0px #e8490f33" }}>
              <div>
                <div className="text-[10px] font-black uppercase tracking-widest text-[var(--accent)] mb-2">Free forever</div>
                <p className="text-sm font-bold leading-snug mb-3">
                  No platform fees.<br />No middlemen.<br />Just creativity.
                </p>
              </div>
              <Link
                href="/auth/signup"
                className="text-sm font-black text-center px-4 py-2.5 rounded-xl bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
              >
                Start for Free →
              </Link>
            </div>
          </div>

          {/* Bottom bar */}
          <div className="border-t border-gray-800 py-5 px-4">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-600">
              <p>© 2026 Toonect. Built for creators, by creators.</p>
              <div className="flex gap-4">
                <span>Manhwa · Manga · Manhua · Webtoon</span>
              </div>
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}
