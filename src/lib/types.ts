// ─────────────────────────────────────────────────────────────
// Domain enums
// ─────────────────────────────────────────────────────────────
export type UserRole           = "writer" | "artist";
export type ArtStyle           = "manhwa" | "manga" | "manhua" | "webtoon" | "comic" | "other";
export type WorkType           = "free" | "commissioned" | "contracted";
export type AvailabilityStatus = "available" | "busy" | "closed";
export type ProjectStatus      = "open" | "in_progress" | "completed";

// ─────────────────────────────────────────────────────────────
// Database row shapes  (match schema.sql exactly)
// ─────────────────────────────────────────────────────────────
export interface DbProfile {
  id:           string;
  username:     string;
  display_name: string;
  role:         UserRole;
  bio:          string | null;
  avatar_url:   string | null;
  banner_url:   string | null;
  location:     string | null;
  website:      string | null;
  created_at:   string;
  updated_at:   string;
}

export interface DbArtistProfile {
  id:              string;
  art_styles:      ArtStyle[];
  work_types:      WorkType[];
  availability:    AvailabilityStatus;
  price_range_min: number | null;
  price_range_max: number | null;
  genres:          string[];
  languages:       string[];
}

export interface DbWriterProfile {
  id:          string;
  genres:      string[];
  looking_for: ArtStyle[];
}

export interface DbPortfolioItem {
  id:          string;
  artist_id:   string;
  image_url:   string;
  title:       string;
  description: string | null;
  style:       ArtStyle;
  created_at:  string;
}

export interface DbProject {
  id:           string;
  writer_id:    string;
  title:        string;
  description:  string;
  genre:        string;
  style_wanted: ArtStyle[];
  work_type:    WorkType;
  status:       ProjectStatus;
  created_at:   string;
  updated_at:   string;
}

export interface DbConversation {
  id:                     string;
  user1_id:               string;
  user2_id:               string;
  last_message:           string | null;
  last_message_at:        string;
  last_message_sender_id: string | null;
  unread_count_1:         number;
  unread_count_2:         number;
  created_at:             string;
}

export interface DbMessage {
  id:              string;
  conversation_id: string;
  sender_id:       string;
  content:         string;
  created_at:      string;
}

// ─────────────────────────────────────────────────────────────
// Enriched shapes used by UI components
// ─────────────────────────────────────────────────────────────
export interface ArtistProfile extends DbProfile {
  role:            "artist";
  art_styles:      ArtStyle[];
  work_types:      WorkType[];
  availability:    AvailabilityStatus;
  price_range_min: number | null;
  price_range_max: number | null;
  genres:          string[];
  languages:       string[];
  portfolio_items: DbPortfolioItem[];
}

export interface WriterProfile extends DbProfile {
  role:        "writer";
  genres:      string[];
  looking_for: ArtStyle[];
  projects:    WriterProject[];
}

export interface WriterProject {
  id:           string;
  writer_id:    string;
  title:        string;
  description:  string;
  genre:        string;
  style_wanted: ArtStyle[];
  work_type:    WorkType;
  status:       ProjectStatus;
  created_at:   string;
}

export interface ConversationWithParticipant extends DbConversation {
  other_user: {
    id:           string;
    username:     string;
    display_name: string;
    role:         UserRole;
    avatar_url:   string | null;
  };
  unread_count: number;
}

// ─────────────────────────────────────────────────────────────
// Legacy aliases kept so existing components don't break
// ─────────────────────────────────────────────────────────────
export type Profile       = DbProfile;
export type Message       = DbMessage;
export type Conversation  = DbConversation;
export type PortfolioItem = DbPortfolioItem;
