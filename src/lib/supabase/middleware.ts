import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  // Refresh session — must not run any logic between createServerClient and getUser
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Protect routes that require a session
  const path = request.nextUrl.pathname;
  const protectedPrefixes = ["/messages", "/profile", "/settings", "/portfolio"];
  const protectedExact = ["/projects/new"];
  const protectedPattern = /^\/projects\/[^/]+\/edit$/;
  const isProtected =
    protectedPrefixes.some((p) => path.startsWith(p)) ||
    protectedExact.includes(path) ||
    protectedPattern.test(path);

  if (isProtected && !user) {
    const loginUrl = new URL("/auth/login", request.url);
    loginUrl.searchParams.set("next", path);
    return NextResponse.redirect(loginUrl);
  }

  // Redirect already-authed users away from auth pages
  const authPaths = ["/auth/login", "/auth/signup"];
  const isAuthPage = authPaths.includes(path);
  if (isAuthPage && user) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  return supabaseResponse;
}
