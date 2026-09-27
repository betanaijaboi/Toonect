import type { ArtStyle, AvailabilityStatus, WorkType } from "./types";

// Pure helpers shared by queries and auth, kept free of Supabase/Next imports
// so they can be unit-tested directly.

/**
 * Where to send the user after login / email confirmation. Only same-site
 * paths are allowed: anything else (absolute URLs, protocol-relative
 * `//host`, `/\host`, or `@host` which becomes `origin@host`) falls back to
 * "/", so a crafted `?next=` link can't redirect users off-site.
 */
export function safeNextPath(next: string | null | undefined): string {
  if (!next || !next.startsWith("/")) return "/";
  if (next.startsWith("//") || next.startsWith("/\\")) return "/";
  // Control characters (tab, newline, ...) can make browsers reinterpret the URL.
  if (/[\u0000-\u001f\u007f]/.test(next)) return "/";
  return next;
}

/**
 * Builds a PostgREST `.or()` filter matching `term` against each column with
 * ILIKE. The term is sanitised first: `,` `(` `)` would otherwise let a
 * search inject extra filter clauses, `%` and `*` are wildcards, and `"`
 * and `\` are quoting/escape characters. (`_` is kept: it's common in
 * usernames and only matches a single character.) Returns null when nothing
 * searchable is left.
 */
export function buildIlikeSearch(columns: string[], term: string | undefined): string | null {
  const cleaned = (term ?? "")
    .replace(/[,()%*\\"]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!cleaned) return null;
  return columns.map((col) => `${col}.ilike.%${cleaned}%`).join(",");
}

const overlaps = <T>(wanted: T[] | undefined, have: T[] | null | undefined) =>
  !wanted?.length || wanted.some((w) => (have ?? []).includes(w));

export interface ArtistFilterable {
  art_styles?: ArtStyle[] | null;
  work_types?: WorkType[] | null;
  availability: AvailabilityStatus;
}

export function matchesArtistFilters(
  artist: ArtistFilterable,
  filters: { styles?: ArtStyle[]; workTypes?: WorkType[]; availability?: AvailabilityStatus[] },
): boolean {
  return (
    overlaps(filters.styles, artist.art_styles) &&
    overlaps(filters.workTypes, artist.work_types) &&
    (!filters.availability?.length || filters.availability.includes(artist.availability))
  );
}

export interface WriterFilterable {
  looking_for?: ArtStyle[] | null;
  projects?: { work_type: WorkType }[] | null;
}

export function matchesWriterFilters(
  writer: WriterFilterable,
  filters: { styles?: ArtStyle[]; workTypes?: WorkType[] },
): boolean {
  return (
    overlaps(filters.styles, writer.looking_for) &&
    overlaps(filters.workTypes, (writer.projects ?? []).map((p) => p.work_type))
  );
}

export interface ProjectFilterable {
  style_wanted?: ArtStyle[] | null;
  work_type: WorkType;
}

export function matchesProjectFilters(
  project: ProjectFilterable,
  filters: { styles?: ArtStyle[]; workTypes?: WorkType[] },
): boolean {
  return (
    overlaps(filters.styles, project.style_wanted) &&
    (!filters.workTypes?.length || filters.workTypes.includes(project.work_type))
  );
}
