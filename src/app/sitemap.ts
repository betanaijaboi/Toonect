import type { MetadataRoute } from "next";
import { getArtists, getWriters } from "@/lib/supabase/queries";
import { MOCK_ARTISTS, MOCK_WRITERS } from "@/lib/mock-data";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://toonect.vercel.app";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [dbArtists, dbWriters] = await Promise.all([
    getArtists().catch(() => []),
    getWriters().catch(() => []),
  ]);

  const artists = dbArtists.length > 0 ? dbArtists : MOCK_ARTISTS;
  const writers = dbWriters.length > 0 ? dbWriters : MOCK_WRITERS;

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${SITE_URL}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${SITE_URL}/browse`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/projects`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/auth/login`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/auth/signup`, changeFrequency: "yearly", priority: 0.5 },
    { url: `${SITE_URL}/terms`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const artistRoutes: MetadataRoute.Sitemap = artists.map((a) => ({
    url: `${SITE_URL}/artists/${a.username}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  const writerRoutes: MetadataRoute.Sitemap = writers.map((w) => ({
    url: `${SITE_URL}/writers/${w.username}`,
    changeFrequency: "weekly",
    priority: 0.6,
  }));

  return [...staticRoutes, ...artistRoutes, ...writerRoutes];
}
