import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import { DbPortfolioItem } from "@/lib/types";
import PortfolioManager from "./PortfolioManager";

export const dynamic = "force-dynamic";

export default async function PortfolioPage() {
  const { user, profile } = await getCurrentUserProfile();

  if (!user || !profile) redirect("/auth/login?next=/portfolio");
  if (profile.role !== "artist") redirect("/settings");

  const supabase = await createClient();
  const { data: items } = await supabase
    .from("portfolio_items")
    .select("*")
    .eq("artist_id", user.id)
    .order("created_at", { ascending: false });

  return (
    <PortfolioManager
      initialItems={(items ?? []) as DbPortfolioItem[]}
      artistId={user.id}
      artistUsername={profile.username}
    />
  );
}
