"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, Search, Menu, X, MessageCircle, LogOut, User, ChevronDown, Images } from "lucide-react";
import { useState, useEffect, useRef } from "react";
import { createClient } from "@/lib/supabase/client";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import clsx from "clsx";

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/projects", label: "Open Projects" },
];

function UserMenu({ user }: { user: SupabaseUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  const displayName = (user.user_metadata?.display_name as string) ?? user.email ?? "You";
  const role = (user.user_metadata?.role as string) ?? "member";
  const username = (user.user_metadata?.username as string) ?? "";

  const initials = displayName
    .split(" ")
    .map((n: string) => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  async function handleLogout() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/");
    router.refresh();
  }

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-2 py-1.5 rounded-xl hover:bg-[#f3f4f6] transition-colors"
      >
        <div className="w-8 h-8 rounded-full bg-[var(--accent)] text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm font-medium max-w-24 truncate hidden lg:block">{displayName}</span>
        <ChevronDown className={clsx("w-3.5 h-3.5 text-[var(--muted)] transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1.5 w-56 bg-[var(--surface)] border border-[var(--border)] rounded-2xl shadow-lg py-1 z-50 overflow-hidden">
          {/* User info */}
          <div className="px-4 py-3 border-b border-[var(--border)]">
            <p className="font-semibold text-sm truncate">{displayName}</p>
            <p className="text-xs text-[var(--muted)] capitalize">{role}{username ? ` · @${username}` : ""}</p>
          </div>

          {/* Profile link */}
          <Link
            href={username ? `/${role}s/${username}` : "/"}
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#f3f4f6] transition-colors"
          >
            <User className="w-4 h-4 text-[var(--muted)]" />
            My Profile
          </Link>

          {/* Portfolio — artists only */}
          {role === "artist" && (
            <Link
              href="/portfolio"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#f3f4f6] transition-colors text-[var(--muted)]"
            >
              <Images className="w-4 h-4" />
              My Portfolio
            </Link>
          )}

          {/* Settings */}
          <Link
            href="/settings"
            onClick={() => setOpen(false)}
            className="flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-[#f3f4f6] transition-colors text-[var(--muted)]"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Settings
          </Link>

          <div className="border-t border-[var(--border)] my-1" />

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-500 hover:bg-red-50 transition-colors"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      )}
    </div>
  );
}

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [authLoading, setAuthLoading] = useState(true);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const supabase = createClient();
    // Mutable ref so the realtime callback always sees the current userId
    let userId: string | null = null;

    async function fetchUnread(uid: string) {
      const { data } = await supabase
        .from("conversations")
        .select("user1_id, unread_count_1, unread_count_2")
        .or(`user1_id.eq.${uid},user2_id.eq.${uid}`);
      const total = (data ?? []).reduce(
        (sum, c) => sum + (c.user1_id === uid ? (c.unread_count_1 ?? 0) : (c.unread_count_2 ?? 0)),
        0
      );
      setUnread(total);
    }

    // Initial auth load
    supabase.auth.getUser().then(({ data }) => {
      userId = data.user?.id ?? null;
      setUser(data.user);
      setAuthLoading(false);
      if (userId) fetchUnread(userId);
    });

    // Re-fetch badge whenever any new message is inserted
    const realtimeChannel = supabase
      .channel("nav-unread")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "messages" },
        () => { if (userId) fetchUnread(userId); }
      )
      .subscribe();

    // Keep userId and unread in sync on sign-in / sign-out
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) => {
      userId = session?.user?.id ?? null;
      setUser(session?.user ?? null);
      if (userId) fetchUnread(userId);
      else setUnread(0);
    });

    return () => {
      subscription.unsubscribe();
      supabase.removeChannel(realtimeChannel);
    };
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-[var(--surface)] border-b border-[var(--border)] shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl tracking-tight">
            <BookOpen className="w-6 h-6 text-[var(--accent)]" />
            <span>Toonect</span>
          </Link>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={clsx(
                  "text-sm font-medium transition-colors hover:text-[var(--accent)]",
                  pathname?.startsWith(link.href) ? "text-[var(--accent)]" : "text-[var(--muted)]"
                )}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Desktop right */}
          <div className="hidden md:flex items-center gap-2">
            <Link
              href="/browse"
              className="flex items-center gap-1.5 text-sm text-[var(--muted)] hover:text-[var(--foreground)] transition-colors px-2 py-1.5"
            >
              <Search className="w-4 h-4" />
              Search
            </Link>

            {/* Messages icon */}
            <Link
              href="/messages"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f3f4f6] transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className={clsx("w-5 h-5", pathname?.startsWith("/messages") ? "text-[var(--accent)]" : "text-[var(--muted)]")} />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>

            {/* Auth state */}
            {authLoading ? (
              <div className="w-24 h-8 rounded-lg bg-[#f3f4f6] animate-pulse" />
            ) : user ? (
              <UserMenu user={user} />
            ) : (
              <>
                <Link
                  href="/auth/login"
                  className="text-sm font-medium px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[#f3f4f6] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="text-sm font-medium px-4 py-2 rounded-lg bg-[var(--accent)] text-white hover:opacity-90 transition-opacity"
                >
                  Join free
                </Link>
              </>
            )}
          </div>

          {/* Mobile right */}
          <div className="md:hidden flex items-center gap-1">
            <Link
              href="/messages"
              className="relative flex items-center justify-center w-9 h-9 rounded-lg hover:bg-[#f3f4f6] transition-colors"
              aria-label="Messages"
            >
              <MessageCircle className="w-5 h-5 text-[var(--muted)]" />
              {unread > 0 && (
                <span className="absolute -top-0.5 -right-0.5 bg-[var(--accent)] text-white text-[10px] font-bold rounded-full w-4 h-4 flex items-center justify-center leading-none">
                  {unread > 9 ? "9+" : unread}
                </span>
              )}
            </Link>
            <button
              className="p-2 rounded-lg hover:bg-[#f3f4f6] transition-colors"
              onClick={() => setMobileOpen(!mobileOpen)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-[var(--border)] bg-[var(--surface)] px-4 py-4 space-y-1">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMobileOpen(false)}
              className={clsx(
                "block text-sm font-medium px-2 py-2.5 rounded-lg transition-colors hover:text-[var(--accent)]",
                pathname?.startsWith(link.href) ? "text-[var(--accent)]" : "text-[var(--muted)]"
              )}
            >
              {link.label}
            </Link>
          ))}
          <div className="pt-3 flex flex-col gap-2 border-t border-[var(--border)] mt-3">
            {user ? (
              <>
                <p className="px-2 text-xs text-[var(--muted)]">Signed in as <strong>{user.user_metadata?.display_name ?? user.email}</strong></p>
                <form action="/auth/logout" method="POST">
                  <button className="w-full text-sm font-medium px-4 py-2.5 rounded-lg border border-[var(--border)] text-left text-red-500 hover:bg-red-50 transition-colors">
                    Log out
                  </button>
                </form>
              </>
            ) : (
              <>
                <Link
                  href="/auth/login"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg border border-[var(--border)] text-center hover:bg-[#f3f4f6] transition-colors"
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  onClick={() => setMobileOpen(false)}
                  className="text-sm font-medium px-4 py-2.5 rounded-lg bg-[var(--accent)] text-white text-center hover:opacity-90 transition-opacity"
                >
                  Join free
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
