import { createClient } from "./server";
import type {
  ArtistProfile,
  WriterProfile,
  DbPortfolioItem,
  WriterProject,
  DbConversation,
  DbMessage,
  ConversationWithParticipant,
  ArtStyle,
  WorkType,
  AvailabilityStatus,
} from "@/lib/types";

// ─────────────────────────────────────────────────────────────
// ARTISTS
// ─────────────────────────────────────────────────────────────

export interface ArtistFilters {
  styles?:       ArtStyle[];
  workTypes?:    WorkType[];
  availability?: AvailabilityStatus[];
  search?:       string;
}

export async function getArtists(filters: ArtistFilters = {}): Promise<ArtistProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(`
      *,
      artist_profiles (
        art_styles, work_types, availability,
        price_range_min, price_range_max, genres, languages
      )
    `)
    .eq("role", "artist");

  if (filters.search) {
    query = query.or(
      `display_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) { console.error("getArtists:", error); return []; }

  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const ap = row.artist_profiles as Record<string, unknown> | null;
      if (!ap) return null;
      return {
        ...row,
        ...ap,
        portfolio_items: [],
      } as unknown as ArtistProfile;
    })
    .filter((a): a is ArtistProfile => {
      if (!a) return false;
      if (filters.styles?.length && !filters.styles.some((s) => (a.art_styles ?? []).includes(s))) return false;
      if (filters.workTypes?.length && !filters.workTypes.some((w) => (a.work_types ?? []).includes(w))) return false;
      if (filters.availability?.length && !filters.availability.includes(a.availability)) return false;
      return true;
    });
}

export async function getArtistByUsername(username: string): Promise<ArtistProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      artist_profiles (
        art_styles, work_types, availability,
        price_range_min, price_range_max, genres, languages
      ),
      portfolio_items (
        id, image_url, title, description, style, created_at
      )
    `)
    .eq("username", username)
    .eq("role", "artist")
    .single();

  if (error || !data) return null;

  const ap = data.artist_profiles as Record<string, unknown> | null;
  if (!ap) return null;

  return {
    ...data,
    ...ap,
    portfolio_items: (data.portfolio_items ?? []) as DbPortfolioItem[],
  } as ArtistProfile;
}


// ─────────────────────────────────────────────────────────────
// WRITERS
// ─────────────────────────────────────────────────────────────

export interface WriterFilters {
  styles?:    ArtStyle[];
  workTypes?: WorkType[];
  search?:    string;
}

export async function getWriters(filters: WriterFilters = {}): Promise<WriterProfile[]> {
  const supabase = await createClient();

  let query = supabase
    .from("profiles")
    .select(`
      *,
      writer_profiles ( genres, looking_for ),
      projects ( id, title, description, genre, style_wanted, work_type, status, created_at, writer_id )
    `)
    .eq("role", "writer");

  if (filters.search) {
    query = query.or(
      `display_name.ilike.%${filters.search}%,username.ilike.%${filters.search}%,bio.ilike.%${filters.search}%`
    );
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) { console.error("getWriters:", error); return []; }

  return (data ?? [])
    .map((row: Record<string, unknown>) => {
      const wp = row.writer_profiles as Record<string, unknown> | null;
      if (!wp) return null;
      return {
        ...row,
        genres:      wp.genres ?? [],
        looking_for: wp.looking_for ?? [],
        projects:    (row.projects ?? []) as WriterProject[],
      } as WriterProfile;
    })
    .filter((w): w is WriterProfile => {
      if (!w) return false;
      if (filters.styles?.length && !filters.styles.some((s) => (w.looking_for ?? []).includes(s))) return false;
      if (filters.workTypes?.length && !filters.workTypes.some((wt) => (w.projects ?? []).some((p) => p.work_type === wt))) return false;
      return true;
    });
}

export async function getWriterByUsername(username: string): Promise<WriterProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("profiles")
    .select(`
      *,
      writer_profiles ( genres, looking_for ),
      projects ( id, title, description, genre, style_wanted, work_type, status, created_at, writer_id )
    `)
    .eq("username", username)
    .eq("role", "writer")
    .single();

  if (error || !data) return null;

  const wp = data.writer_profiles as Record<string, unknown> | null;
  if (!wp) return null;

  return {
    ...data,
    genres:      wp.genres ?? [],
    looking_for: wp.looking_for ?? [],
    projects:    (data.projects ?? []) as WriterProject[],
  } as WriterProfile;
}


// ─────────────────────────────────────────────────────────────
// PROJECTS
// ─────────────────────────────────────────────────────────────

export interface ProjectFilters {
  styles?:    ArtStyle[];
  workTypes?: WorkType[];
  genres?:    string[];
  search?:    string;
}

export async function getOpenProjects(filters: ProjectFilters = {}) {
  const supabase = await createClient();

  let query = supabase
    .from("projects")
    .select(`
      *,
      profiles ( id, username, display_name, avatar_url, location )
    `)
    .eq("status", "open");

  if (filters.search) {
    query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,genre.ilike.%${filters.search}%`);
  }
  if (filters.genres?.length) {
    query = query.in("genre", filters.genres);
  }

  const { data, error } = await query.order("created_at", { ascending: false });
  if (error) { console.error("getOpenProjects:", error); return []; }

  return (data ?? [])
    .filter((row: Record<string, unknown>) => {
      if (filters.styles?.length && !filters.styles.some((s) => ((row.style_wanted as string[]) ?? []).includes(s))) return false;
      if (filters.workTypes?.length && !filters.workTypes.includes(row.work_type as WorkType)) return false;
      return true;
    })
    .map((row: Record<string, unknown>) => ({
      ...row,
      writerUsername: (row.profiles as Record<string, string>)?.username ?? "",
      writerName:     (row.profiles as Record<string, string>)?.display_name ?? "",
      writerLocation: (row.profiles as Record<string, string>)?.location ?? null,
    }));
}


// ─────────────────────────────────────────────────────────────
// CONVERSATIONS  (requires auth)
// ─────────────────────────────────────────────────────────────

export async function getConversations(userId: string): Promise<ConversationWithParticipant[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("conversations")
    .select(`
      *,
      user1:profiles!conversations_user1_id_fkey ( id, username, display_name, role, avatar_url ),
      user2:profiles!conversations_user2_id_fkey ( id, username, display_name, role, avatar_url )
    `)
    .or(`user1_id.eq.${userId},user2_id.eq.${userId}`)
    .order("last_message_at", { ascending: false });

  if (error) { console.error("getConversations:", error); return []; }

  return (data ?? []).map((row: Record<string, unknown>) => {
    const isUser1 = row.user1_id === userId;
    const other = (isUser1 ? row.user2 : row.user1) as {
      id: string; username: string; display_name: string; role: "artist" | "writer"; avatar_url: string | null;
    };
    return {
      ...(row as unknown as DbConversation),
      other_user:   other,
      unread_count: isUser1 ? (row.unread_count_1 as number) : (row.unread_count_2 as number),
    } as ConversationWithParticipant;
  });
}

export async function getOrCreateConversation(currentUserId: string, otherUserId: string): Promise<string | null> {
  const supabase = await createClient();

  // Enforce user1_id < user2_id
  const [user1_id, user2_id] = [currentUserId, otherUserId].sort();

  // Try to get existing
  const { data: existing } = await supabase
    .from("conversations")
    .select("id")
    .eq("user1_id", user1_id)
    .eq("user2_id", user2_id)
    .single();

  if (existing) return existing.id;

  // Create new
  const { data: created, error } = await supabase
    .from("conversations")
    .insert({ user1_id, user2_id })
    .select("id")
    .single();

  if (error) { console.error("getOrCreateConversation:", error); return null; }
  return created?.id ?? null;
}

export async function getMessages(conversationId: string): Promise<DbMessage[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) { console.error("getMessages:", error); return []; }
  return (data ?? []) as DbMessage[];
}

export async function sendMessage(conversationId: string, senderId: string, content: string): Promise<DbMessage | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("messages")
    .insert({ conversation_id: conversationId, sender_id: senderId, content })
    .select()
    .single();

  if (error) { console.error("sendMessage:", error); return null; }
  return data as DbMessage;
}

export async function markConversationRead(conversationId: string, userId: string): Promise<void> {
  const supabase = await createClient();

  const { data: conv } = await supabase
    .from("conversations")
    .select("user1_id")
    .eq("id", conversationId)
    .single();

  if (!conv) return;

  const field = conv.user1_id === userId ? "unread_count_1" : "unread_count_2";
  await supabase
    .from("conversations")
    .update({ [field]: 0 })
    .eq("id", conversationId);
}

// ─────────────────────────────────────────────────────────────
// AUTH HELPERS
// ─────────────────────────────────────────────────────────────

export async function getCurrentUserProfile(): Promise<{ user: import("@supabase/supabase-js").User | null; profile: import("@/lib/types").DbProfile | null }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { user: null, profile: null };

  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single();

  return { user, profile: profile ?? null };
}
