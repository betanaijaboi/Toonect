# Toonect — Product Requirements & Technical Specification

Version 1.0 · June 2026 · Manhwa · Manga · Manhua · Webtoon

> Converted from the original `Toonect.docx` specification.

## 1. Product Requirements Document (PRD)

### 1.1  Problem Statement

The global manga, manhwa, and manhua industry is a multi-billion-dollar market growing at 15%+ annually, yet independent writers and artists have no dedicated platform to find each other.

Writers with compelling stories have no structured way to browse artists by style (manhwa vs manga vs manhua), work type (free / commissioned / contracted), or availability. Artists have no central portfolio hub where writers can discover them.

Existing platforms like DeviantArt or social media are noisy and unstructured; freelance marketplaces like Fiverr take large commissions and are not comic-specific. Toonect solves this with a purpose-built discovery and collaboration platform — zero fees, role-based profiles, and real-time messaging.

### 1.2  Target Users

| User Type | Description | Age Range |
|---|---|---|
| Independent Writer (Primary) | Has original story ideas; looking for an artist collaborator or commissioned artist | 18–40 |
| Manga / Manhwa / Manhua Artist (Primary) | Seeking writing partners, paid commissions, or contracted projects | 16–40 |
| Small Studio / Self-Publisher (Secondary) | Sourcing talent for anthology or serialised work | 20–50 |

### 1.3  User Goals

#### Writers

- Find a skilled artist whose style matches their story genre

- Contact artists directly with no middleman fee

- Post open project briefs for artists to discover

- Manage ongoing collaborations through messaging

#### Artists

- Showcase portfolio images to a targeted audience of writers

- Set availability status and pricing information

- Discover open story briefs that match their preferred style

- Grow their client base organically through the platform

### 1.4  Business Goals

- Build a community of 10,000 creators in Year 1

- Maintain zero platform fees (revenue: optional premium profiles and featured listings in Year 2)

- Become the default discovery platform for the English-language manhwa/manga/manhua indie scene

- Achieve 70%+ email confirmation rate within the first 6 months

### 1.5  Success Metrics

| Metric | Target — 6 Months | Target — 12 Months |
|---|---|---|
| Registered Artists | 500 | 2,000 |
| Registered Writers | 300 | 1,500 |
| Open Projects | 100 | 500 |
| Messages Sent / Month | 1,000 | 10,000 |
| Monthly Active Users | 800 | 5,000 |
| Email Confirmation Rate | 70% | 80% |

### 1.6  Feature Prioritization

#### Must Have — MVP

| Feature | Priority | Status |
|---|---|---|
| User registration with role selection (artist / writer) | Must Have | Done |
| Email confirmation with resend | Must Have | Done |
| Artist profile with portfolio upload | Must Have | Done |
| Writer profile with project listings | Must Have | Done |
| Browse / search / filter artists and writers | Must Have | Done |
| Real-time 1:1 messaging | Must Have | Done |
| Open Project board | Must Have | Done |
| Availability status on artist profiles | Must Have | Done |
| Password reset flow | Should Have | Pending |
| Profile completeness indicator | Should Have | Pending |
| Email notifications for new messages | Should Have | Pending |
| Project application system | Should Have | Pending |
| Rating / review system | Could Have | Planned |
| Dark mode | Could Have | Planned |
| Public API | Could Have | Future |
| Mobile app (React Native) | Could Have | Future |

## 2. User Stories & Use Cases

Each story follows the format: As a [role], I want to [action] so that [benefit].

#### Story 1 — Registration

> As a writer, I want to create an account with my role, display name, and username so that I can post projects and message artists.

Acceptance Criteria:

- 2-step flow: role picker shown before details form

- Username validated: 3–24 chars, lowercase letters, numbers, underscores only

- Confirmation email sent within 30 seconds of form submission

- User redirected to /auth/verify-email page with resend option

#### Story 2 — Email Confirmation

> As a new user, I want to confirm my email so that my account is activated and I can log in.

Acceptance Criteria:

- Confirmation link functional within same browser session (PKCE flow)

- Link expires after 15 minutes; clear expiry message shown

- Resend button available on verify-email and login pages

- Callback passes real Supabase error message (not generic string)

- Different-browser case detected and explained to user

#### Story 3 — Artist Profile

> As an artist, I want to set my art styles, availability, and price range so that writers can find me by what they need.

Acceptance Criteria:

- Multiple art styles selectable: manhwa, manga, manhua, webtoon, comic, other

- Availability shows as Available (green) / Busy (yellow) / Closed (red) badge

- Price range displays 'Free' when price_range_min = 0

- Profile visible publicly at /artists/[username]

#### Story 4 — Portfolio Upload

> As an artist, I want to upload portfolio images so that writers can evaluate my style before messaging me.

Acceptance Criteria:

- Supports JPG, PNG, WebP up to 10 MB per image

- Images stored in Supabase Storage; public URL saved to portfolio_items table

- Grid display on profile page; caption and display order supported

- Delete button available on Portfolio Manager page

#### Story 5 — Browse & Filter

> As a writer, I want to filter artists by art style, work type, and availability so that I find only relevant matches.

Acceptance Criteria:

- Filter panel toggles open/closed; multiple values selectable per dimension

- Results update instantly client-side — no page reload

- AnimatePresence stagger animation on result grid changes

- Result count displayed above the grid

- Clear all button resets search and all filters

#### Story 6 — Post a Project Brief

> As a writer, I want to post a story brief with genre, style wanted, and work type so that artists can discover my project.

Acceptance Criteria:

- Required fields: title, description, genre, style_wanted (multi-select), work_type

- Status defaults to 'open' on creation

- Project appears on /projects board and writer's public profile

- Writer can edit or close the project from their profile

#### Story 7 — Direct Messaging

> As a writer, I want to message an artist directly so that we can discuss a collaboration without leaving the platform.

Acceptance Criteria:

- Conversation created on first message (no prior connection required)

- Real-time message delivery via Supabase Realtime postgres_changes

- Unread badge increments in the navbar; badge clears when conversation is opened

- Messages deduplicated: own sent messages are not duplicated by realtime event

#### Story 8 — Settings & Profile Editing

> As a user, I want to update my bio, avatar, and availability from a settings page so that my profile stays current.

Acceptance Criteria:

- Avatar uploadable from settings; stored in Supabase Storage

- All profile fields editable: display name, bio, location, art styles, genres, pricing

- Changes reflected immediately on public profile after save

- Auth is verified server-side before any update is applied

## 3. User Flow Diagrams

The following diagrams show the primary paths users take through the application.

### Flow A — Registration & Onboarding

```
Landing Page
    |
    v
Click 'Join Free'  (nav or hero CTA)
    |
    v
Role Picker  [Writer]  or  [Artist]
    |
    v
Details Form  (display name, username, email, password)
    |
    v
signUp() server action  ->  Supabase auth.signUp()
    |
    +--[error]--> /auth/signup?error=...  (shown in red banner)
    |
    v
/auth/verify-email  (check inbox message)
    |
    v
User clicks confirmation link in email
    |
    +--[different browser / expired]--+
    |                                  |
    v                                  v
GET /auth/callback?code=xxx     /auth/login?error=...&unconfirmed=1
    |                                  |
exchangeCodeForSession()         Amber banner + Resend button
    |                                  |
    +--[ok]-----> / (logged in)        v
                               resendConfirmation()
                                       |
                               /auth/verify-email?resent=1
```

### Flow B — Writer Posts a Project

```
Login  ->  Home Page
    |
    v
Click 'Post Project'  (Navbar or hero CTA button)
    |
    v  [requires auth — middleware redirects if not logged in]
/projects/new  (form page)
    |
    v
Fill: title, description, genre, style_wanted[], work_type
    |
    v
createProject() server action  ->  INSERT writer_projects
    |
    +--[error]--> /projects/new?error=...
    |
    v
/projects  (Open Projects board — new card visible)
    +
/writers/[username]  (project card in writer's profile)
```

### Flow C — Artist Discovers & Messages a Writer

```
/browse  (default view: Artists tab)
    |
    v
Click 'Writers' tab
    |
    v
Apply filters: Art Style = Manhwa; Work Type = Free
    |
    v  (client-side filter — instant, no reload)
Filtered Writer card grid
    |
    v
Click writer card  ->  /writers/[username]
    |
    v
View profile: bio, genres, open projects
    |
    v
Click 'Message'  ->  [requires auth]
    |
    v
/messages  (conversation created or existing opened)
    |
    v
Send message  ->  INSERT messages via server action
    |
    v
Writer receives message via Realtime WebSocket (no refresh)
    +  Writer's unread badge +1 in navbar
```

### Flow D — Artist Manages Portfolio

```
Login  ->  Any page
    |
    v
Click user avatar  ->  User Menu dropdown
    |
    v
Click 'My Portfolio'  ->  /portfolio  [auth required]
    |
    v
Portfolio Manager page
    |
    +-- Upload image (drag-drop or file picker)
    |       |
    |       v
    |   Supabase Storage upload  ->  public URL saved to portfolio_items
    |
    +-- Add / edit caption
    |
    +-- Delete image (removes from Storage + DB)
    |
    v
Changes reflected immediately on /artists/[username] public profile
```

## 4. Database Design / Entity Relationship Diagram

Toonect uses a PostgreSQL database hosted on Supabase. All tables use Row Level Security (RLS) policies to enforce data access rules at the database layer.

### 4.1  Table Definitions

#### auth.users  (managed by Supabase Auth)

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY |
| email | TEXT  UNIQUE NOT NULL |
| email_confirmed_at | TIMESTAMPTZ |
| created_at | TIMESTAMPTZ |

#### artist_profiles

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  FK → auth.users.id  ON DELETE CASCADE |
| username | TEXT  UNIQUE NOT NULL |
| display_name | TEXT  NOT NULL |
| bio | TEXT |
| avatar_url | TEXT |
| location | TEXT |
| art_styles | TEXT[]  e.g. {manhwa, manga, manhua, webtoon, comic, other} |
| work_types | TEXT[]  e.g. {free, commissioned, contracted} |
| availability | TEXT  CHECK IN ('available','busy','closed')  DEFAULT 'available' |
| price_range_min | INTEGER |
| price_range_max | INTEGER |
| genres | TEXT[] |
| updated_at | TIMESTAMPTZ  DEFAULT now() |
| created_at | TIMESTAMPTZ  DEFAULT now() |

#### writer_profiles

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  FK → auth.users.id  ON DELETE CASCADE |
| username | TEXT  UNIQUE NOT NULL |
| display_name | TEXT  NOT NULL |
| bio | TEXT |
| avatar_url | TEXT |
| location | TEXT |
| genres | TEXT[] |
| looking_for | TEXT[]  (art styles the writer wants from an artist) |
| updated_at | TIMESTAMPTZ  DEFAULT now() |
| created_at | TIMESTAMPTZ  DEFAULT now() |

#### writer_projects

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  DEFAULT gen_random_uuid() |
| writer_id | UUID  NOT NULL  FK → writer_profiles.id  ON DELETE CASCADE |
| title | TEXT  NOT NULL |
| description | TEXT |
| genre | TEXT |
| style_wanted | TEXT[] |
| work_type | TEXT  CHECK IN ('free','commissioned','contracted')  NOT NULL |
| status | TEXT  CHECK IN ('open','in_progress','completed')  DEFAULT 'open' |
| created_at | TIMESTAMPTZ  DEFAULT now() |
| updated_at | TIMESTAMPTZ  DEFAULT now() |

#### portfolio_items

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  DEFAULT gen_random_uuid() |
| artist_id | UUID  NOT NULL  FK → artist_profiles.id  ON DELETE CASCADE |
| image_url | TEXT  NOT NULL |
| caption | TEXT |
| display_order | INTEGER  DEFAULT 0 |
| created_at | TIMESTAMPTZ  DEFAULT now() |

#### conversations

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  DEFAULT gen_random_uuid() |
| user1_id | UUID  NOT NULL  FK → auth.users.id |
| user2_id | UUID  NOT NULL  FK → auth.users.id |
| unread_count_1 | INTEGER  DEFAULT 0 |
| unread_count_2 | INTEGER  DEFAULT 0 |
| updated_at | TIMESTAMPTZ  DEFAULT now() |
| created_at | TIMESTAMPTZ  DEFAULT now() |
| UNIQUE(user1_id, user2_id) |  |

#### messages

| Column | Type / Constraint |
|---|---|
| id | UUID  PRIMARY KEY  DEFAULT gen_random_uuid() |
| conversation_id | UUID  NOT NULL  FK → conversations.id  ON DELETE CASCADE |
| sender_id | UUID  NOT NULL  FK → auth.users.id |
| content | TEXT  NOT NULL |
| created_at | TIMESTAMPTZ  DEFAULT now() |

### 4.2  Relationships

| From | To | Cardinality | Foreign Key |
|---|---|---|---|
| auth.users | artist_profiles | 1 : 0..1 | artist_profiles.id → auth.users.id |
| auth.users | writer_profiles | 1 : 0..1 | writer_profiles.id → auth.users.id |
| writer_profiles | writer_projects | 1 : N | writer_projects.writer_id |
| artist_profiles | portfolio_items | 1 : N | portfolio_items.artist_id |
| auth.users | conversations | 1 : N | conversations.user1_id / user2_id |
| conversations | messages | 1 : N | messages.conversation_id |

### 4.3  Row Level Security (RLS) Policies

| Table | SELECT (Read) | INSERT / UPDATE / DELETE (Write) |
|---|---|---|
| artist_profiles | Public — any authenticated or anonymous user | Owner only (auth.uid() = id) |
| writer_profiles | Public | Owner only |
| writer_projects | Public | Owner only (auth.uid() = writer_id via join) |
| portfolio_items | Public | Owner only (auth.uid() = artist_id via join) |
| conversations | Participants only (user1_id = auth.uid() OR user2_id = auth.uid()) | Participants only |
| messages | Participants only (via conversation join) | Sender only (auth.uid() = sender_id) |

## 5. System Architecture Diagram

Toonect is a full-stack web application built on Next.js 16 App Router, deployed to Vercel, with Supabase providing the database, authentication, file storage, and real-time subscriptions.

### 5.1  Architecture Layers

```
┌─────────────────────────────────────────────────────────────────┐
│  CLIENT LAYER                                                   │
│  Browser — Next.js 16 App Router (React 19)                    │
│  ├── Server Components  (SSR + ISR, revalidate=60)             │
│  ├── Client Components  ('use client' — forms, realtime, anim) │
│  └── Framer Motion animations + Tailwind CSS v4                │
└─────────────────────────────────────────┬───────────────────────┘
                                          │ HTTP / WebSocket
┌─────────────────────────────────────────v───────────────────────┐
│  EDGE LAYER                                                     │
│  Vercel Edge Network (CDN + Edge Middleware)                   │
│  └── Next.js Middleware  (session refresh, route protection)   │
└─────────────────────────────────────────┬───────────────────────┘
                                          │
┌─────────────────────────────────────────v───────────────────────┐
│  API / BACKEND LAYER                                            │
│  Next.js Route Handlers + Server Actions                       │
│  ├── GET /auth/callback       — PKCE code exchange             │
│  ├── Server Actions           — signUp, signIn, resend, CRUD   │
│  └── Route Handlers           — portfolio upload               │
└─────────────────────────────────────────┬───────────────────────┘
                                          │ Supabase JS SDK
┌─────────────────────────────────────────v───────────────────────┐
│  DATA LAYER                                                     │
│  Supabase (managed PostgreSQL on AWS)                          │
│  ├── Auth         — email/password, JWT, PKCE flow             │
│  ├── Database     — PostgreSQL with RLS policies               │
│  ├── Storage      — avatars + portfolio images (public bucket) │
│  └── Realtime     — postgres_changes on messages & convs       │
└─────────────────────────────────────────┬───────────────────────┘
                                          │
┌─────────────────────────────────────────v───────────────────────┐
│  EXTERNAL SERVICES                                              │
│  └── Supabase SMTP  — confirmation emails, password reset      │
└─────────────────────────────────────────────────────────────────┘
```

### 5.2  Request Lifecycle

- User visits page → Vercel CDN serves cached HTML (ISR, max 60 s stale)

- Middleware executes on every request → refreshes Supabase session cookie via getUser()

- Server Component fetches data via Supabase server client (cookie-based auth, no token exposed to client)

- HTML streams to browser; React 19 hydrates the client shell

- Client Components initialise Framer Motion animations, Realtime WebSocket subscriptions

- User submits form → Server Action invoked → Supabase mutation → redirect or error response

- Realtime event fires on INSERT/UPDATE → client components update state without page reload

### 5.3  Technology Stack

| Layer | Technology | Version | Purpose |
|---|---|---|---|
| Frontend Framework | Next.js | 16.2 | App Router, SSR, ISR, Server Actions |
| UI Library | React | 19 | Component model, Suspense, Server Components |
| Styling | Tailwind CSS | v4 | Utility-first CSS with custom design tokens |
| Animations | Framer Motion | 12 | Scroll reveal, hover effects, AnimatePresence |
| Language | TypeScript | 5 | Type safety across client and server |
| Database | Supabase / PostgreSQL | Latest | Relational data + RLS |
| Auth | Supabase Auth | Latest | Email/password + PKCE flow |
| Storage | Supabase Storage | Latest | Avatars, portfolio images |
| Realtime | Supabase Realtime | Latest | WebSocket push for messages |
| Hosting | Vercel | Latest | Edge CDN, CI/CD from GitHub |
| Icons | Lucide React | Latest | SVG icon library |

## 6. API Documentation

Toonect uses Next.js Server Actions for mutations and Page/Route Handlers for read operations. All data access goes through the Supabase JavaScript SDK with server-side session management via @supabase/ssr.

```
Authentication: Supabase JWT stored in an HttpOnly cookie. The Next.js middleware refreshes the session on every request. Protected routes redirect to /auth/login?next=<path> when no session is found.
```

### 6.1  Authentication Routes

```
SERVER ACTION  /auth/signup  [Public]
Description: Register a new user with role selection
Request: email, password, display_name, username, role (writer|artist)
Response: Redirect to /auth/verify-email on success, /auth/signup?error=... on failure
```

```
SERVER ACTION  /auth/signin  [Public]
Description: Authenticate existing user with email + password
Request: email, password, next (redirect path)
Response: Redirect to 'next' on success, /auth/login?error=...&unconfirmed_email=... on failure
```

```
GET  /auth/callback  [Public]
Description: PKCE code exchange — called by email confirmation link
Request: Query params: code (PKCE auth code), next (optional redirect)
Response: Redirect to / on success, /auth/login?error=...&unconfirmed=1 on failure
```

```
SERVER ACTION  /auth/resend-confirmation  [Public]
Description: Resend the email confirmation link to a given address
Request: email (string)
Response: Redirect to /auth/verify-email?resent=1&email=... on success
```

### 6.2  Profile Routes

```
GET  /artists/[username]  [Public]
Description: Public artist profile page with portfolio and contact button
Request: Path param: username (string)
Response: Rendered HTML — full artist profile, portfolio grid, art styles, availability
```

```
GET  /writers/[username]  [Public]
Description: Public writer profile page with project listings
Request: Path param: username (string)
Response: Rendered HTML — full writer profile, open projects, looking-for styles
```

```
SERVER ACTION  /settings (update)  [Auth Required]
Description: Update the authenticated user's profile
Request: display_name, bio, location, art_styles[], work_types[], availability, price_range_min, price_range_max, genres[]
Response: Redirect to /settings on success, /settings?error=... on failure
```

### 6.3  Project Routes

```
GET  /projects  [Public]
Description: Open Projects board — list all writer_projects with status='open'
Request: Query params: style (art style filter), work_type (filter)
Response: Rendered HTML — project card grid with writer metadata
```

```
SERVER ACTION  /projects/new  [Auth Required]
Description: Create a new story brief (writer only)
Request: title, description, genre, style_wanted[], work_type
Response: Redirect to /projects on success, /projects/new?error=... on failure
```

```
SERVER ACTION  /projects/[id]/edit  [Auth Required]
Description: Update a project's fields or status (owner only)
Request: title?, description?, genre?, style_wanted[]?, work_type?, status?
Response: Redirect to /projects/[id] on success
```

### 6.4  Messaging Routes

```
GET  /messages  [Auth Required]
Description: Conversations list — all conversations for authenticated user
Request: None (reads from session)
Response: Rendered HTML — conversation list sidebar with last message and unread count
```

```
GET  /messages/[id]  [Auth Required]
Description: Load a specific conversation thread (participant only)
Request: Path param: id (conversation UUID)
Response: Rendered HTML — message thread; 403 redirect if non-participant
```

```
SERVER ACTION  /messages/send  [Auth Required]
Description: Send a message in an existing conversation
Request: conversation_id (UUID), content (string)
Response: New message object inserted; client receives via Realtime WebSocket
```

### 6.5  Storage Routes

```
POST  /portfolio/upload (API Route)  [Auth Required]
Description: Upload a portfolio image to Supabase Storage
Request: multipart/form-data: file (image), caption (string, optional)
Response: { url: string, id: UUID } — public image URL and portfolio_items row ID
```

```
DELETE  /portfolio/[id] (API Route)  [Auth Required]
Description: Delete a portfolio image (owner only)
Request: Path param: id (portfolio_items UUID)
Response: 204 No Content on success
```

### 6.6  Realtime Subscriptions (Client-Side)

| Channel | Event | Filter | Used In | Purpose |
|---|---|---|---|---|
| messages:{conv_id} | INSERT | conversation_id = eq.{id} | ConversationThread | Append incoming messages in real-time |
| nav-unread | INSERT | None (all messages) | Navbar | Increment unread badge count |

## 7. UI Design — High-Fidelity Overview

Toonect's visual identity is inspired by the printed aesthetic of manga, manhwa, and manhua: halftone dot paper textures, speed-line SVG graphics, ink-panel card hover effects, and a bold orange-red accent color (#e8490f) that evokes action and energy.

### 7.1  Key Screens

| Screen | Route | Key UI Elements |
|---|---|---|
| Homepage | / | Hero with SVG speed lines + stats bar; Three Traditions section; Featured Artists + Story Briefs grids; How it Works; CTA banner |
| Browse | /browse | Role toggle (Artists / Writers); search bar; collapsible filter panel (style, work type, availability); AnimatePresence card grid; result count |
| Artist Profile | /artists/[username] | Style-gradient stripe; availability badge; art style pills; portfolio grid (lightbox); message / contact button; bio |
| Writer Profile | /writers/[username] | Looking-for style pills; open project cards; bio; message button; genres |
| Open Projects | /projects | Work-type gradient top stripe on cards; genre + style tags; writer byline; status badge; filter sidebar |
| Messages | /messages | Conversation list (left); real-time thread pane (right); send input with send button; unread indicator |
| Portfolio Manager | /portfolio | Upload dropzone; image grid with caption edit; display order drag; delete confirmation |
| Settings | /settings | Avatar upload with preview; all profile fields; art style multi-select chips; availability radio; price range inputs |
| Sign Up | /auth/signup | Step 1: role picker cards (Writer / Artist) with perk lists; Step 2: details form with username validation indicator |
| Log In | /auth/login | Email + password form; amber banner for unconfirmed email with inline resend; forgot-password link |
| Verify Email | /auth/verify-email | Mail icon; tips (same browser, spam, 15 min expiry); resend form; green success state after resend |

### 7.2  Responsive Breakpoints

| Breakpoint | Width | Layout Behaviour |
|---|---|---|
| Mobile | < 640 px | Single-column layout; hamburger menu; stacked forms; 1-col card grids |
| Tablet | 640 – 1024 px | 2-column card grids; side-by-side form steps; inline nav links |
| Desktop | > 1024 px | 3–4 column card grids; full navbar; sidebar messaging layout; max-w-7xl container |

## 8. Design System / Style Guide

### 8.1  Color Palette

| CSS Token | Hex Value | Usage |
|---|---|---|
| --background | #fafaf8 | Page background (with halftone dot CSS overlay) |
| --foreground | #0f0f0f | Primary text, ink elements, dark panel bg |
| --accent | #e8490f | CTAs, active states, badges, hover borders |
| --accent-soft | #fde8df | Soft accent bg, hover fills, warning banners |
| --muted | #6b7280 | Secondary text, placeholders, subtitles |
| --border | #e5e7eb | Card borders, dividers, input borders |
| --surface | #ffffff | Card backgrounds, inputs, nav bar |

Art style gradient stripes on cards:

| Style | Gradient | Applied To |
|---|---|---|
| Manhwa | pink-400 → rose-400   (#f472b6 → #fb7185) | ArtistCard + WriterCard top stripe |
| Manga | blue-400 → indigo-400 (#60a5fa → #818cf8) | ArtistCard + WriterCard top stripe |
| Manhua | amber-400 → orange-400 (#fbbf24 → #fb923c) | ArtistCard + WriterCard top stripe |
| Webtoon | purple-400 → violet-400 (#c084fc → #a78bfa) | ArtistCard + WriterCard top stripe |
| Comic | green-400 → emerald-400 (#4ade80 → #34d399) | ArtistCard + WriterCard top stripe |

### 8.2  Typography

| Role | Font | Weight | Size | Usage |
|---|---|---|---|---|
| Body | Geist Sans | 400 Regular | 12 pt (24 DXA) | General content, descriptions |
| Subheading | Geist Sans | 600 Semibold | 13 pt | Labels, section eyebrows |
| Heading | Geist Sans | 800 ExtraBold | 16–20 pt | H1–H3 section titles |
| Impact number | Geist Sans | 900 Black | 24–32 pt | Stats bar numbers |
| Monospace | Geist Mono | 400 Regular | 10–11 pt | Code paths, route names |

### 8.3  Spacing & Border Radius

| Token | Value | Usage |
|---|---|---|
| rounded-xl | 12 px | Buttons, inputs, small cards |
| rounded-2xl | 16 px | Standard cards, panels, dropdowns |
| rounded-3xl | 24 px | Hero sections, CTA banners |
| p-4 | 16 px | Compact card padding |
| p-5 | 20 px | Standard card padding |
| p-6 | 24 px | Feature cards, info boxes |
| py-16 px-4 | 64 px / 16 px | Section padding |
| gap-5 | 20 px | Card grid gap |

### 8.4  Component Patterns

#### Buttons

| Variant | Classes / Style | Usage |
|---|---|---|
| Primary | bg-[--accent] text-white rounded-xl font-semibold hover:opacity-90 | Main CTAs, form submits |
| Secondary | border-2 border-[--foreground] rounded-xl hover:bg-[--foreground] hover:text-white | Secondary actions, 'View all' |
| Ghost | border border-[--border] hover:bg-[#f3f4f6] | Filter chips, tag buttons |
| Danger | text-red-500 hover:bg-red-50 | Destructive actions, log out |
| Amber CTA | bg-amber-500 text-white hover:bg-amber-600 | Resend confirmation email |

#### Cards

- Standard card: rounded-2xl border-2 border-[--border] bg-[--surface]

- Ink-panel hover effect: translate(-2px, -2px) + box-shadow: 4px 4px 0px #0f0f0f

- Coloured top stripe: 6px gradient bar matching primary art style

- Hover border: transitions to --foreground (ink-black) on hover

#### Availability Badges

| Available | Busy | Closed |
|---|---|---|

### 8.5  Manga Visual Language

| Element | Implementation | Effect |
|---|---|---|
| Halftone paper | CSS radial-gradient dots, 20px grid, 5.5% opacity on body | Manga-printed paper texture on every page |
| Speed lines | SVG with 48 lines radiating from centre of hero | Manga action/energy in the hero section |
| Screentone | CSS repeating diagonal lines (-45deg) on alternate sections | Section background texture depth |
| Ink-panel hover | CSS translate(-2px,-2px) + 4px offset box-shadow | Comic panel being 'selected' effect on card hover |
| Action bursts | 12-point starburst SVG polygon in hero and CTA banner | Manga visual punctuation |
| Ink underline | SVG hand-drawn path under hero tagline text | Brush-stroke feel on key headline |
| Streak hero-bg | Diagonal repeating-linear-gradient at -58deg stacked on gradient | Speed-line streak on hero background |
| Section eyebrows | text-xs font-black uppercase tracking-widest text-[--accent] | Manga chapter label aesthetic |

## 9. Acceptance Criteria

Acceptance criteria use the Given/When/Then format. A feature is considered complete only when all criteria in its block are satisfied.

#### Feature: User Registration

| Step | Description |
|---|---|
| GIVEN | A visitor is on the /auth/signup page |
| WHEN | They complete the 2-step form (role picker → details form) with valid inputs and click 'Create account' |
| THEN | A Supabase confirmation email is dispatched and the user is redirected to /auth/verify-email |
| AND | The record exists in auth.users with email_confirmed_at = NULL |
| AND | Username is validated: 3–24 chars, lowercase, letters/numbers/underscores only |
| AND | Duplicate username or email shows a clear inline error |

#### Feature: Email Confirmation — Success

| Step | Description |
|---|---|
| GIVEN | A registered user with email_confirmed_at = NULL opens their inbox in the same browser |
| WHEN | They click the confirmation link within 15 minutes |
| THEN | Their session is established and they are redirected to / (homepage) |
| AND | email_confirmed_at is populated in auth.users |
| AND | The user is logged in with a valid Supabase JWT cookie |
| AND | The Navbar unread badge and user menu appear |

#### Feature: Email Confirmation — Failure

| Step | Description |
|---|---|
| GIVEN | A confirmation link is opened in a different browser, or the link has expired (> 15 min) |
| WHEN | The GET /auth/callback?code=... route fires |
| THEN | The user is redirected to /auth/login with the real Supabase error message visible |
| AND | An amber 'Email not confirmed' banner is shown — not a generic error string |
| AND | The banner contains a 'Resend confirmation email' button |
| AND | If the email address can be inferred it is pre-filled in the resend form |

#### Feature: Browse with Filters

| Step | Description |
|---|---|
| GIVEN | A visitor is on the /browse page with Artists tab active |
| WHEN | They select 'Manhwa' from Art Style and 'Free' from Work Type |
| THEN | Only artist cards matching BOTH filters are shown |
| AND | The result count above the grid updates immediately |
| AND | Cards enter/exit with AnimatePresence stagger animation |
| AND | A 'Clear' button appears and resets all filters and the search field |
| AND | Switching to the Writers tab resets art style and work type filters |

#### Feature: Real-time Messaging

| Step | Description |
|---|---|
| GIVEN | Two authenticated users have an open conversation in /messages/[id] |
| WHEN | User A types a message and clicks Send |
| THEN | The message appears in User A's thread immediately (optimistic insert) |
| AND | User B's thread updates within 1 second via Supabase Realtime WebSocket |
| AND | User B's unread badge in the Navbar increments by 1 |
| AND | When User B opens the conversation the unread count resets to 0 |
| AND | Duplicate messages are prevented by ID deduplication on realtime INSERT |

#### Feature: Portfolio Upload

| Step | Description |
|---|---|
| GIVEN | An authenticated artist is on /portfolio |
| WHEN | They select a valid JPG/PNG/WebP file ≤ 10 MB and click Upload |
| THEN | The image is stored in Supabase Storage and a portfolio_items row is created |
| AND | The image appears in the portfolio grid on the Portfolio Manager page |
| AND | The image is visible in the portfolio section of /artists/[username] |
| AND | An optional caption can be added and saved |
| AND | A file exceeding 10 MB or with unsupported format shows a clear error |

#### Feature: Project Creation

| Step | Description |
|---|---|
| GIVEN | An authenticated writer is on /projects/new |
| WHEN | They fill in title, description, genre, style_wanted, work_type and submit |
| THEN | A writer_projects row is created with status = 'open' |
| AND | The project card appears on the /projects Open Projects board |
| AND | The project appears in the projects section of the writer's /writers/[username] profile |
| AND | Missing required fields show inline validation errors before submission |

#### Feature: Settings Update

| Step | Description |
|---|---|
| GIVEN | An authenticated user is on /settings |
| WHEN | They change their bio, update their availability to 'Busy', and click Save |
| THEN | The artist_profiles (or writer_profiles) row is updated in the database |
| AND | The public profile page /artists/[username] reflects the new bio within 60 seconds (ISR revalidation) |
| AND | The availability badge on the artist card changes from 'Available' to 'Busy' |
| AND | Unauthenticated users cannot POST to the settings action (middleware protection) |

## 10. Project Roadmap

The roadmap is divided into four phases from MVP to scale. Each phase builds on the last without breaking existing functionality.

```
Phase 1 — MVP  Month 1–2    COMPLETE
- User authentication: sign up, log in, email confirmation, resend confirmation
- Artist profiles with portfolio image upload (Supabase Storage)
- Writer profiles with project brief creation and management
- Browse page: role toggle, search bar, filter panel (style / work type / availability)
- Real-time 1:1 messaging with unread badge (Supabase Realtime)
- Open Projects board
- Settings / profile editing with avatar upload
- ISR caching (revalidate=60) on public pages
- Loading skeleton screens on all routes
- Manga/manhwa/manhua visual design: halftone bg, speed lines, ink-panel cards
- Deployed to Vercel + Supabase; repository at github.com/betanaijaboi/Toonect
```

```
Phase 2 — Beta  Month 3–4    UPCOMING
- Password reset flow (/auth/forgot-password + /auth/reset-password)
- Email notifications for new messages (Supabase Edge Functions + SendGrid)
- Project application system: artist applies to writer's brief; writer reviews applicants
- Profile completeness indicator (% filled, nudge to complete)
- Full-text search via Supabase pg_trgm extension
- SEO: per-profile Open Graph metadata and structured data
- Public beta launch with waitlist invite system
```

```
Phase 3 — Public Launch  Month 5–6    PLANNED
- Rating & review system after collaboration is marked complete
- Featured artist spotlight on homepage (curated or paid placement)
- Genre and tag browsing pages (/genre/fantasy, /style/manhwa)
- Social share cards (dynamic Open Graph images per profile)
- Mobile-responsive polish pass and Lighthouse score audit (target: 90+)
- Analytics integration (Plausible or PostHog — privacy-first)
- Public press launch and creator community outreach
```

```
Phase 4 — Scale  Month 7–12    FUTURE
- Premium profiles: optional paid tier with featured placement (no fees on collaborations)
- Commission management dashboard: brief → negotiate → milestone tracking → completion
- Dark mode / theme toggle (CSS custom properties swap)
- Public creator API with OAuth for third-party integrations
- Mobile app (React Native) — iOS and Android
- Multi-language support: Korean, Japanese, Chinese (i18n with next-intl)
- Community features: public activity feed, creator blogs, collab showcases
```

End of Document

github.com/betanaijaboi/Toonect

Toonect v1.0  ·  June 2026
