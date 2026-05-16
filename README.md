# Toonect

A platform connecting comic writers with manga, manhwa, and manhua artists. Writers post story briefs; artists showcase their portfolios. Real-time messaging, availability filters, and zero platform fees.

**Stack:** Next.js 16 · Supabase · Tailwind CSS v4 · Framer Motion · TypeScript

---

## Table of Contents

- [Prerequisites](#prerequisites)
- [Local Setup](#local-setup)
- [Supabase Setup](#supabase-setup)
- [Environment Variables](#environment-variables)
- [Running the App](#running-the-app)
- [Deploying to Vercel](#deploying-to-vercel)
- [Project Structure](#project-structure)

---

## Prerequisites

Make sure the following are installed on your machine before starting:

| Tool | Version | Download |
|------|---------|----------|
| Node.js | 18.17 or later | https://nodejs.org |
| npm | comes with Node | — |
| Git | any recent version | https://git-scm.com |

---

## Local Setup

### 1. Clone the repository

```bash
git clone https://github.com/betanaijaboi/Toonect.git
cd Toonect
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up environment variables

Create a file called `.env.local` in the root of the project and fill it in — see the [Environment Variables](#environment-variables) section below for exactly what to put in it.

---

## Supabase Setup

Toonect uses [Supabase](https://supabase.com) for the database, authentication, file storage, and real-time messaging. You need a free Supabase project to run this app.

### 1. Create a Supabase project

1. Go to https://supabase.com and sign in (or create a free account).
2. Click **New project**.
3. Give it a name (e.g. `toonect`), set a database password, and choose a region close to you.
4. Wait for the project to finish setting up (~1 minute).

### 2. Apply the database schema

1. In your Supabase dashboard, click **SQL Editor** in the left sidebar.
2. Click **New query**.
3. Open the file `supabase/schema.sql` from this repo and paste the entire contents into the editor.
4. Click **Run** (or press `Ctrl+Enter`).

This creates all the tables (`artist_profiles`, `writer_profiles`, `conversations`, `messages`, etc.) and enables real-time subscriptions.

### 3. Configure authentication

1. In the Supabase dashboard go to **Authentication → URL Configuration**.
2. Set **Site URL** to `http://localhost:3000` for local development (update this to your production URL later).
3. Under **Redirect URLs** add:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback` *(add this when you deploy)*

### 4. Get your API keys

1. Go to **Project Settings → API** in the Supabase dashboard.
2. Copy the **Project URL** and the **anon / public** key — you'll need them next.

---

## Environment Variables

Create a file named `.env.local` in the root of the project with the following content:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Replace the placeholder values with the ones from your Supabase project (see step 4 above).

> **Important:** `.env.local` is git-ignored and will never be committed to GitHub. Never share your keys publicly.

---

## Running the App

### Development server

```bash
npm run dev
```

Open http://localhost:3000 in your browser. The page hot-reloads as you edit files.

### Production build (test locally before deploying)

```bash
npm run build
npm start
```

---

## Deploying to Vercel

Vercel is the recommended way to host Toonect. It's free for personal projects and integrates directly with GitHub.

### 1. Push your code to GitHub

Make sure your latest code is on GitHub:

```bash
git add .
git commit -m "ready to deploy"
git push
```

### 2. Import the project on Vercel

1. Go to https://vercel.com and sign in (you can use your GitHub account).
2. Click **Add New → Project**.
3. Find the **Toonect** repository in the list and click **Import**.
4. Vercel auto-detects Next.js — leave all the build settings as they are.

### 3. Add environment variables

Before clicking **Deploy**, scroll down to the **Environment Variables** section and add these three variables:

| Name | Value |
|------|-------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key |
| `NEXT_PUBLIC_SITE_URL` | `https://your-vercel-domain.vercel.app` |

### 4. Deploy

Click **Deploy**. Vercel builds and hosts the app. You'll get a live URL like `https://toonect.vercel.app`.

### 5. Update Supabase to allow your live URL

Once deployed, go back to **Supabase → Authentication → URL Configuration** and:
- Change **Site URL** to your Vercel URL (e.g. `https://toonect.vercel.app`).
- Add `https://toonect.vercel.app/auth/callback` to **Redirect URLs**.

### Automatic deployments

From this point on, every `git push` to the `main` branch will automatically trigger a new deployment on Vercel — no manual steps needed.

---

## Project Structure

```
Toonect/
├── src/
│   ├── app/                    # Next.js App Router pages
│   │   ├── page.tsx            # Homepage
│   │   ├── browse/             # Browse artists & writers
│   │   ├── artists/[username]/ # Artist profile page
│   │   ├── writers/[username]/ # Writer profile page
│   │   ├── projects/           # Open story briefs
│   │   ├── messages/           # Real-time messaging
│   │   ├── portfolio/          # Portfolio manager
│   │   ├── settings/           # Account settings
│   │   └── auth/               # Sign in / sign up + callback
│   ├── components/             # Shared UI components
│   ├── lib/
│   │   ├── supabase/           # Supabase clients & queries
│   │   ├── types.ts            # TypeScript types
│   │   └── mock-data.ts        # Fallback data shown when DB is empty
│   └── middleware.ts           # Auth session refresh on every request
├── supabase/
│   └── schema.sql              # Full database schema — run this in Supabase first
├── public/                     # Static assets
└── .env.local                  # Your local environment variables (never committed)
```

---

## Notes

- **Mock data fallback:** The app automatically shows sample artists and projects when the database tables are empty. Once you create real profiles through the UI, the mock data is replaced.
- **Real-time messaging:** Requires the schema to be applied. The `ALTER PUBLICATION` statements at the bottom of `schema.sql` enable Supabase Realtime on the `messages` and `conversations` tables.
- **Portfolio images:** Stored in Supabase Storage. If uploaded images aren't displaying, go to **Supabase → Storage**, create a bucket named `portfolio`, and set its policy to allow public reads.
