import { describe, expect, it } from "vitest";
import {
  buildIlikeSearch,
  matchesArtistFilters,
  matchesProjectFilters,
  matchesWriterFilters,
  safeNextPath,
} from "@/lib/filters";

describe("safeNextPath", () => {
  it.each(["/", "/projects/new", "/projects/abc/edit?tab=2#top", "/messages/new"])("keeps same-site path %s", (p) => {
    expect(safeNextPath(p)).toBe(p);
  });

  it.each([
    ["absolute URL", "https://evil.example"],
    ["protocol-relative URL", "//evil.example/phish"],
    ["backslash trick", "/\\evil.example"],
    ["userinfo trick (origin@host)", "@evil.example"],
    ["javascript: URL", "javascript:alert(1)"],
    ["embedded newline", "/ok\n//evil.example"],
    ["tab", "/\t/evil.example"],
    ["empty", ""],
    ["null", null],
  ])("falls back to / for %s", (_label, value) => {
    expect(safeNextPath(value)).toBe("/");
  });
});

describe("buildIlikeSearch", () => {
  const cols = ["display_name", "username", "bio"];

  it("builds an OR of ILIKE clauses", () => {
    expect(buildIlikeSearch(cols, "  mika ")).toBe(
      "display_name.ilike.%mika%,username.ilike.%mika%,bio.ilike.%mika%"
    );
  });

  it("keeps underscores so usernames still match", () => {
    expect(buildIlikeSearch(["username"], "ink_master")).toBe("username.ilike.%ink_master%");
  });

  it("strips characters that could inject extra PostgREST filter clauses", () => {
    // Without sanitising, this would add `role.eq.writer` as its own OR clause.
    const filter = buildIlikeSearch(["username"], "x%,role.eq.writer,(id.not.is.null)")!;
    expect(filter).toBe("username.ilike.%x role.eq.writer id.not.is.null%");
    expect(filter.split(",")).toHaveLength(1);
  });

  it("returns null when nothing searchable is left", () => {
    expect(buildIlikeSearch(cols, undefined)).toBeNull();
    expect(buildIlikeSearch(cols, "   ")).toBeNull();
    expect(buildIlikeSearch(cols, "%%,()")).toBeNull();
  });
});

describe("matchesArtistFilters", () => {
  const artist = {
    art_styles: ["manhwa", "webtoon"] as const,
    work_types: ["commissioned"] as const,
    availability: "available" as const,
  };
  const a = { ...artist, art_styles: [...artist.art_styles], work_types: [...artist.work_types] };

  it("matches when no filters are set", () => {
    expect(matchesArtistFilters(a, {})).toBe(true);
  });

  it("matches if ANY selected style / work type overlaps", () => {
    expect(matchesArtistFilters(a, { styles: ["manga", "webtoon"] })).toBe(true);
    expect(matchesArtistFilters(a, { styles: ["manga"] })).toBe(false);
    expect(matchesArtistFilters(a, { workTypes: ["free", "commissioned"] })).toBe(true);
    expect(matchesArtistFilters(a, { workTypes: ["contracted"] })).toBe(false);
  });

  it("filters by availability", () => {
    expect(matchesArtistFilters(a, { availability: ["available", "busy"] })).toBe(true);
    expect(matchesArtistFilters(a, { availability: ["closed"] })).toBe(false);
  });

  it("requires every active filter to pass", () => {
    expect(matchesArtistFilters(a, { styles: ["manhwa"], availability: ["closed"] })).toBe(false);
  });

  it("treats missing arrays as empty", () => {
    expect(matchesArtistFilters({ availability: "busy", art_styles: null }, { styles: ["manga"] })).toBe(false);
  });
});

describe("matchesWriterFilters", () => {
  const writer = {
    looking_for: ["manga" as const],
    projects: [{ work_type: "free" as const }, { work_type: "contracted" as const }],
  };

  it("matches styles the writer is looking for", () => {
    expect(matchesWriterFilters(writer, { styles: ["manga"] })).toBe(true);
    expect(matchesWriterFilters(writer, { styles: ["manhua"] })).toBe(false);
  });

  it("matches work types across any of the writer's projects", () => {
    expect(matchesWriterFilters(writer, { workTypes: ["contracted"] })).toBe(true);
    expect(matchesWriterFilters(writer, { workTypes: ["commissioned"] })).toBe(false);
    expect(matchesWriterFilters({ looking_for: [], projects: null }, { workTypes: ["free"] })).toBe(false);
  });
});

describe("matchesProjectFilters", () => {
  const project = { style_wanted: ["webtoon" as const], work_type: "commissioned" as const };

  it("filters by wanted style and work type", () => {
    expect(matchesProjectFilters(project, { styles: ["webtoon"], workTypes: ["commissioned"] })).toBe(true);
    expect(matchesProjectFilters(project, { styles: ["manga"] })).toBe(false);
    expect(matchesProjectFilters(project, { workTypes: ["free"] })).toBe(false);
  });
});
