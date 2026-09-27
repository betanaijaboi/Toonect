import { beforeEach, describe, expect, it, vi } from "vitest";

const exchangeCodeForSession = vi.fn();
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { exchangeCodeForSession } }),
}));

const { GET } = await import("@/app/auth/callback/route");

const call = (query: string) => GET(new Request(`https://toonect.app/auth/callback${query}`));

beforeEach(() => {
  exchangeCodeForSession.mockReset();
  exchangeCodeForSession.mockResolvedValue({ error: null });
});

describe("GET /auth/callback", () => {
  it("exchanges the code and redirects to the requested same-site page", async () => {
    const res = await call("?code=abc&next=/portfolio");
    expect(exchangeCodeForSession).toHaveBeenCalledWith("abc");
    expect(res.headers.get("location")).toBe("https://toonect.app/portfolio");
  });

  it("defaults to the home page", async () => {
    const res = await call("?code=abc");
    expect(res.headers.get("location")).toBe("https://toonect.app/");
  });

  it.each(["@evil.example", "//evil.example", "https://evil.example"])(
    "never redirects off-site (next=%s)",
    async (next) => {
      // Regression: `${origin}${next}` with next=@evil.example produced
      // https://toonect.app@evil.example, i.e. a redirect to evil.example.
      const res = await call(`?code=abc&next=${encodeURIComponent(next)}`);
      const location = new URL(res.headers.get("location")!);
      expect(location.host).toBe("toonect.app");
      expect(location.pathname).toBe("/");
    }
  );

  it("sends users back to login when the code is missing", async () => {
    const res = await call("");
    expect(res.headers.get("location")).toMatch(/^https:\/\/toonect\.app\/auth\/login\?error=/);
    expect(exchangeCodeForSession).not.toHaveBeenCalled();
  });

  it("explains the different-browser PKCE failure in plain language", async () => {
    exchangeCodeForSession.mockResolvedValue({
      error: { message: "invalid request: both auth code and code verifier should be non-empty" },
    });
    const location = new URL((await call("?code=abc")).headers.get("location")!);
    expect(location.pathname).toBe("/auth/login");
    expect(location.searchParams.get("error")).toMatch(/different browser/);
    expect(location.searchParams.get("unconfirmed")).toBe("1");
  });
});
