import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentUserProfile } from "@/lib/supabase/queries";
import SettingsForm from "./SettingsForm";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const { user, profile } = await getCurrentUserProfile();
  if (!user || !profile) redirect("/auth/login?next=/settings");

  const supabase = await createClient();

  let artistProfile = null;
  let writerProfile = null;

  if (profile.role === "artist") {
    const { data } = await supabase
      .from("artist_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    artistProfile = data;
  } else {
    const { data } = await supabase
      .from("writer_profiles")
      .select("*")
      .eq("id", user.id)
      .single();
    writerProfile = data;
  }

  return (
    <SettingsForm
      profile={profile}
      artistProfile={artistProfile}
      writerProfile={writerProfile}
      userId={user.id}
    />
  );
}
