import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
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
        <footer className="border-t border-[var(--border)] py-8 text-center text-sm text-[var(--muted)]">
          <p>© 2026 Toonect. Connecting stories with art.</p>
        </footer>
      </body>
    </html>
  );
}
