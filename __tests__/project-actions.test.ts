import { beforeEach, describe, expect, it, vi } from "vitest";

// --- fake Supabase ---------------------------------------------------------
type Row = Record<string, unknown>;
let currentUser: { id: string } | null;
let profile: Row | null;
let projectOwner: string | null;
let calls: Array<{ table: string; op: string; payload?: unknown; filters: Array<[string, unknown]> }>;

function queryBuilder(table: string) {
  const entry = { table, op: "select", payload: undefined as unknown, filters: [] as Array<[string, unknown]> };
  const b = {
    select: () => b,
    insert: (payload: unknown) => ((entry.op = "insert"), (entry.payload = payload), calls.push(entry), b),
    update: (payload: unknown) => ((entry.op = "update"), (entry.payload = payload), calls.push(entry), b),
    delete: () => ((entry.op = "delete"), calls.push(entry), b),
    eq: (col: string, val: unknown) => (entry.filters.push([col, val]), b),
    single: async () => {
      if (table === "profiles") return { data: profile, error: null };
      if (table === "projects" && entry.op === "insert") return { data: { id: "proj_new" }, error: null };
      if (table === "projects") return { data: projectOwner ? { writer_id: projectOwner } : null, error: null };
      return { data: null, error: null };
    },
    // `await builder` for update/delete chains
    then: (resolve: (v: { error: null }) => void) => resolve({ error: null }),
  };
  return b;
}

vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({
    auth: { getUser: async () => ({ data: { user: currentUser } }) },
    from: (table: string) => queryBuilder(table),
  }),
}));

const revalidatePath = vi.fn();
vi.mock("next/cache", () => ({ revalidatePath: (p: string) => revalidatePath(p) }));
vi.mock("next/navigation", () => ({
  redirect: (url: string) => {
    throw new Error(`REDIRECT ${url}`);
  },
}));

const { createProject, updateProject, deleteProject } = await import("@/lib/project-actions");

const form = {
  title: "  Crimson Ronin  ",
  description: "  A samurai revenge story.  ",
  genre: " action ",
  style_wanted: ["manhwa" as const],
  work_type: "commissioned" as const,
};

beforeEach(() => {
  currentUser = { id: "user_writer" };
  profile = { role: "writer", username: "ink_writer" };
  projectOwner = "user_writer";
  calls = [];
  revalidatePath.mockReset();
});

describe("createProject", () => {
  it("redirects anonymous users to login", async () => {
    currentUser = null;
    await expect(createProject(form)).rejects.toThrow("REDIRECT /auth/login");
  });

  it("only lets writers post projects", async () => {
    profile = { role: "artist", username: "pen_artist" };
    expect(await createProject(form)).toEqual({ error: "Only writers can post projects." });
    expect(calls.find((c) => c.op === "insert")).toBeUndefined();
  });

  it("inserts a trimmed, open project owned by the writer", async () => {
    expect(await createProject(form)).toEqual({ id: "proj_new" });
    const insert = calls.find((c) => c.op === "insert")!;
    expect(insert.payload).toEqual({
      writer_id: "user_writer",
      title: "Crimson Ronin",
      description: "A samurai revenge story.",
      genre: "action",
      style_wanted: ["manhwa"],
      work_type: "commissioned",
      status: "open",
    });
    expect(revalidatePath).toHaveBeenCalledWith("/projects");
    expect(revalidatePath).toHaveBeenCalledWith("/writers/ink_writer");
  });
});

describe("updateProject / deleteProject ownership", () => {
  it("refuses to edit someone else's project", async () => {
    projectOwner = "someone_else";
    expect(await updateProject("proj_1", { ...form, status: "completed" })).toEqual({
      error: "Not authorized to edit this project.",
    });
    expect(calls.find((c) => c.op === "update")).toBeUndefined();
  });

  it("refuses to delete someone else's project", async () => {
    projectOwner = "someone_else";
    expect(await deleteProject("proj_1")).toEqual({ error: "Not authorized to delete this project." });
    expect(calls.find((c) => c.op === "delete")).toBeUndefined();
  });

  it("lets the owner update and delete", async () => {
    expect(await updateProject("proj_1", { ...form, status: "in_progress" })).toEqual({ success: true });
    const update = calls.find((c) => c.op === "update")!;
    expect(update.payload).toMatchObject({ title: "Crimson Ronin", status: "in_progress" });
    expect(update.filters).toEqual([["id", "proj_1"]]);

    expect(await deleteProject("proj_1")).toEqual({ success: true });
    expect(calls.find((c) => c.op === "delete")!.filters).toEqual([["id", "proj_1"]]);
  });

  it("treats a missing project as not owned", async () => {
    projectOwner = null;
    expect(await deleteProject("missing")).toEqual({ error: "Not authorized to delete this project." });
  });
});
