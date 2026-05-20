import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/";

  if (!code) {
    return NextResponse.redirect(
      `${origin}/auth/login?error=${encodeURIComponent("No confirmation code found. The link may be expired — try signing up again.")}`
    );
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (!error) {
    return NextResponse.redirect(`${origin}${next}`);
  }

  // Surface the real Supabase error so it's visible on the login page
  const message =
    error.message === "invalid request: both auth code and code verifier should be non-empty"
      ? "Confirmation link was opened in a different browser than where you signed up. Please use the same browser, or request a new confirmation email below."
      : error.message;

  return NextResponse.redirect(
    `${origin}/auth/login?error=${encodeURIComponent(message)}&unconfirmed=1`
  );
}
