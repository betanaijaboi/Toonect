-- ============================================================
-- TOONECT — Full Database Schema
-- Run this in: Supabase Dashboard → SQL Editor → New query
-- ============================================================

-- ─────────────────────────────────────────────────────────────
-- 0. Extensions
-- ─────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";


-- ─────────────────────────────────────────────────────────────
-- 1. PROFILES  (one row per auth user)
-- ─────────────────────────────────────────────────────────────
create table public.profiles (
  id            uuid        primary key references auth.users(id) on delete cascade,
  username      text        not null unique,
  display_name  text        not null,
  role          text        not null check (role in ('writer', 'artist')),
  bio           text,
  avatar_url    text,
  banner_url    text,
  location      text,
  website       text,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

-- enforce lowercase alphanumeric usernames
alter table public.profiles
  add constraint username_format check (username ~ '^[a-z0-9_]{3,24}$');


-- ─────────────────────────────────────────────────────────────
-- 2. ARTIST PROFILES  (extends profiles for role = 'artist')
-- ─────────────────────────────────────────────────────────────
create table public.artist_profiles (
  id              uuid    primary key references public.profiles(id) on delete cascade,
  art_styles      text[]  not null default '{}',
  work_types      text[]  not null default '{}',
  availability    text    not null default 'available'
                          check (availability in ('available', 'busy', 'closed')),
  price_range_min integer check (price_range_min >= 0),
  price_range_max integer check (price_range_max >= 0),
  genres          text[]  not null default '{}',
  languages       text[]  not null default '{}'
);


-- ─────────────────────────────────────────────────────────────
-- 3. WRITER PROFILES  (extends profiles for role = 'writer')
-- ─────────────────────────────────────────────────────────────
create table public.writer_profiles (
  id          uuid    primary key references public.profiles(id) on delete cascade,
  genres      text[]  not null default '{}',
  looking_for text[]  not null default '{}'
);


-- ─────────────────────────────────────────────────────────────
-- 4. PORTFOLIO ITEMS  (artist portfolio images)
-- ─────────────────────────────────────────────────────────────
create table public.portfolio_items (
  id          uuid        primary key default gen_random_uuid(),
  artist_id   uuid        not null references public.profiles(id) on delete cascade,
  image_url   text        not null,
  title       text        not null,
  description text,
  style       text        not null,
  created_at  timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- 5. PROJECTS  (story briefs posted by writers)
-- ─────────────────────────────────────────────────────────────
create table public.projects (
  id            uuid        primary key default gen_random_uuid(),
  writer_id     uuid        not null references public.profiles(id) on delete cascade,
  title         text        not null,
  description   text        not null,
  genre         text        not null,
  style_wanted  text[]      not null default '{}',
  work_type     text        not null check (work_type in ('free', 'commissioned', 'contracted')),
  status        text        not null default 'open'
                            check (status in ('open', 'in_progress', 'completed')),
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- 6. CONVERSATIONS  (one row per writer↔artist pair)
-- ─────────────────────────────────────────────────────────────
-- user1_id is always the lesser UUID to enforce uniqueness
create table public.conversations (
  id                      uuid        primary key default gen_random_uuid(),
  user1_id                uuid        not null references public.profiles(id) on delete cascade,
  user2_id                uuid        not null references public.profiles(id) on delete cascade,
  last_message            text,
  last_message_at         timestamptz not null default now(),
  last_message_sender_id  uuid        references public.profiles(id),
  unread_count_1          integer     not null default 0,  -- unread for user1
  unread_count_2          integer     not null default 0,  -- unread for user2
  created_at              timestamptz not null default now(),
  -- ensure user1_id < user2_id so each pair has exactly one conversation
  check (user1_id < user2_id),
  unique (user1_id, user2_id)
);


-- ─────────────────────────────────────────────────────────────
-- 7. MESSAGES
-- ─────────────────────────────────────────────────────────────
create table public.messages (
  id              uuid        primary key default gen_random_uuid(),
  conversation_id uuid        not null references public.conversations(id) on delete cascade,
  sender_id       uuid        not null references public.profiles(id) on delete cascade,
  content         text        not null,
  created_at      timestamptz not null default now()
);


-- ─────────────────────────────────────────────────────────────
-- 8. INDEXES  (for query performance)
-- ─────────────────────────────────────────────────────────────
create index on public.profiles (username);
create index on public.profiles (role);
create index on public.portfolio_items (artist_id);
create index on public.projects (writer_id);
create index on public.projects (status);
create index on public.conversations (user1_id);
create index on public.conversations (user2_id);
create index on public.messages (conversation_id, created_at);
create index on public.messages (sender_id);


-- ─────────────────────────────────────────────────────────────
-- 9. TRIGGERS
-- ─────────────────────────────────────────────────────────────

-- 9a. Auto-create profile + role sub-table on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  -- Create base profile
  insert into public.profiles (id, username, display_name, role)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'display_name',
    coalesce(new.raw_user_meta_data->>'role', 'writer')
  );

  -- Create role-specific sub-profile
  if new.raw_user_meta_data->>'role' = 'artist' then
    insert into public.artist_profiles (id) values (new.id);
  else
    insert into public.writer_profiles (id) values (new.id);
  end if;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();


-- 9b. Update conversations.last_message on new message
create or replace function public.handle_new_message()
returns trigger
language plpgsql
security definer set search_path = public
as $$
declare
  v_user1 uuid;
  v_user2 uuid;
begin
  select user1_id, user2_id
    into v_user1, v_user2
    from public.conversations
   where id = new.conversation_id;

  update public.conversations
     set last_message           = new.content,
         last_message_at        = new.created_at,
         last_message_sender_id = new.sender_id,
         -- increment unread for the *other* participant
         unread_count_1 = case
           when new.sender_id = v_user2 then unread_count_1 + 1
           else 0
         end,
         unread_count_2 = case
           when new.sender_id = v_user1 then unread_count_2 + 1
           else 0
         end
   where id = new.conversation_id;

  return new;
end;
$$;

create trigger on_message_created
  after insert on public.messages
  for each row execute procedure public.handle_new_message();


-- 9c. Keep profiles.updated_at current
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

create trigger projects_updated_at
  before update on public.projects
  for each row execute procedure public.set_updated_at();


-- ─────────────────────────────────────────────────────────────
-- 10. ROW-LEVEL SECURITY
-- ─────────────────────────────────────────────────────────────
alter table public.profiles          enable row level security;
alter table public.artist_profiles   enable row level security;
alter table public.writer_profiles   enable row level security;
alter table public.portfolio_items   enable row level security;
alter table public.projects          enable row level security;
alter table public.conversations     enable row level security;
alter table public.messages          enable row level security;

-- ── profiles ──
create policy "Profiles are publicly readable"
  on public.profiles for select using (true);

create policy "Users can insert their own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- ── artist_profiles ──
create policy "Artist profiles are publicly readable"
  on public.artist_profiles for select using (true);

create policy "Artists can insert their own artist profile"
  on public.artist_profiles for insert
  with check (auth.uid() = id);

create policy "Artists can update their own artist profile"
  on public.artist_profiles for update
  using (auth.uid() = id);

-- ── writer_profiles ──
create policy "Writer profiles are publicly readable"
  on public.writer_profiles for select using (true);

create policy "Writers can insert their own writer profile"
  on public.writer_profiles for insert
  with check (auth.uid() = id);

create policy "Writers can update their own writer profile"
  on public.writer_profiles for update
  using (auth.uid() = id);

-- ── portfolio_items ──
create policy "Portfolio items are publicly readable"
  on public.portfolio_items for select using (true);

create policy "Artists can manage their own portfolio"
  on public.portfolio_items for all
  using (auth.uid() = artist_id);

-- ── projects ──
create policy "Projects are publicly readable"
  on public.projects for select using (true);

create policy "Writers can create projects"
  on public.projects for insert
  with check (auth.uid() = writer_id);

create policy "Writers can update their own projects"
  on public.projects for update
  using (auth.uid() = writer_id);

create policy "Writers can delete their own projects"
  on public.projects for delete
  using (auth.uid() = writer_id);

-- ── conversations ──
create policy "Users can see their own conversations"
  on public.conversations for select
  using (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Users can create conversations they are part of"
  on public.conversations for insert
  with check (auth.uid() = user1_id or auth.uid() = user2_id);

create policy "Participants can update conversation metadata"
  on public.conversations for update
  using (auth.uid() = user1_id or auth.uid() = user2_id);

-- ── messages ──
create policy "Participants can read messages"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
    )
  );

create policy "Participants can send messages"
  on public.messages for insert
  with check (
    auth.uid() = sender_id
    and exists (
      select 1 from public.conversations c
       where c.id = conversation_id
         and (c.user1_id = auth.uid() or c.user2_id = auth.uid())
    )
  );


-- ─────────────────────────────────────────────────────────────
-- 11. STORAGE BUCKETS
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict do nothing;

insert into storage.buckets (id, name, public)
  values ('portfolio', 'portfolio', true)
  on conflict do nothing;

-- Allow anyone to read avatars and portfolio images
create policy "Avatars are publicly readable"
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Portfolio images are publicly readable"
  on storage.objects for select
  using (bucket_id = 'portfolio');

-- Only the owner can upload their avatar (path must start with their user ID)
create policy "Users can upload their own avatar"
  on storage.objects for insert
  with check (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  using (
    bucket_id = 'avatars'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

-- Artists can upload to their own portfolio folder
create policy "Artists can upload portfolio images"
  on storage.objects for insert
  with check (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Artists can delete their own portfolio images"
  on storage.objects for delete
  using (
    bucket_id = 'portfolio'
    and auth.uid()::text = (storage.foldername(name))[1]
  );


-- ─────────────────────────────────────────────────────────────
-- 12. REALTIME  (enable live subscriptions on key tables)
-- ─────────────────────────────────────────────────────────────
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.conversations;
