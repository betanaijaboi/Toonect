import { getArtists, getWriters } from "@/lib/supabase/queries";
import { MOCK_ARTISTS, MOCK_WRITERS } from "@/lib/mock-data";
import BrowseClient from "./BrowseClient";

export const revalidate = 60;

export default async function BrowsePage() {
  const [artists, writers] = await Promise.all([
    getArtists(),
    getWriters(),
  ]);

  // Fall back to mock data when the schema hasn't been applied yet
  const resolvedArtists = artists.length > 0 ? artists : MOCK_ARTISTS;
  const resolvedWriters = writers.length > 0 ? writers : MOCK_WRITERS;

  return <BrowseClient initialArtists={resolvedArtists} initialWriters={resolvedWriters} />;
}
