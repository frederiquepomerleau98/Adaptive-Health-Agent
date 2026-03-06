# CLAUDE.md — Adaptive Health Agent

> This file is read automatically by Claude Code at the start of every session.
> It tells Claude everything it needs to know to build this app correctly.
> **Do not delete or rename this file.**

---

## Workflow Rule

**After each sizeable change, always commit and push to GitHub/Vercel.** Let the user know where to check the latest changes (the Vercel preview URL or GitHub branch). The user wants to review the app iteratively — do not batch many changes without committing and pushing. Keep changes small and reviewable.

**When the user gives multiple changes, spin out a team of agents to work on them in parallel** so we can attack things concurrently and move faster.

**Supabase and Vercel are connected as connectors to Claude.ai.** You can push, pull, and deploy natively without the user prompting you.

---

## What This App Is

**Adaptive Health Agent** is a personal health co-pilot web app. Users log meals (via photo, voice, or text), track workouts, and get AI-powered daily recommendations based on their goals. Think of it as a smart, flexible alternative to rigid fitness apps.

**The app is for one person to use (you, the owner).** It is not a SaaS product yet — no payments, no multi-tenancy complications, just a clean personal health tracker.

---

## Tech Stack — Never Deviate From This

| Layer | Technology | Why |
|---|---|---|
| Framework | **Next.js 14 App Router** | Server components, file-based routing |
| Language | **TypeScript** (strict mode) | Catch errors before they happen |
| Styling | **Tailwind CSS only** | No custom CSS files, no CSS modules |
| Database | **Supabase** (PostgreSQL) | Auth + database + file storage in one |
| AI | **OpenAI API** (GPT-4o) | Vision + text for macro estimation |
| Deployment | **Vercel** | One-click deploy, works perfectly with Next.js |
| Auth | **Supabase Auth** | Magic link + Google OAuth |

**If you are tempted to add another library, ask first.** Keep it simple.

---

## Coding Rules

1. **TypeScript strict mode.** Always define types. Never use `any`.
2. **Tailwind CSS only.** No inline `style={{}}` objects, no CSS files.
3. **Server Components by default.** Only add `"use client"` when you need browser APIs (onClick, useState, useEffect).
4. **Environment variables.** Never hardcode API keys. Always use `process.env.VARIABLE_NAME`.
5. **Supabase RLS.** Every table must have Row Level Security enabled. Users can only access their own data.
6. **Mobile-first.** Write Tailwind classes for mobile first, then `md:` and `lg:` for larger screens.
7. **No console.log in production code.** Use it for debugging only, remove before committing.
8. **Error handling.** Wrap all API calls and database queries in try/catch. Show user-friendly error messages.
9. **Loading states.** Every async action needs a loading state (spinner or skeleton).
10. **File naming.** Components in PascalCase (`MealCard.tsx`). Utilities in camelCase (`formatMacros.ts`). Routes follow Next.js conventions.

---

## Project File Structure

```
adaptive-health-agent/
├── app/                          # Next.js App Router pages
│   ├── layout.tsx                # Root layout (fonts, providers)
│   ├── page.tsx                  # Dashboard (/)
│   ├── meals/
│   │   └── page.tsx              # Meal log (/meals)
│   ├── ideas/
│   │   └── page.tsx              # Meal ideas (/ideas)
│   ├── activity/
│   │   └── page.tsx              # Activity & workouts (/activity)
│   ├── calendar/
│   │   └── page.tsx              # Calendar view (/calendar)
│   ├── profile/
│   │   └── page.tsx              # Profile & goals (/profile)
│   ├── onboarding/
│   │   └── page.tsx              # First-time setup (/onboarding)
│   └── api/
│       ├── analyze-meal/
│       │   └── route.ts          # POST: AI meal analysis
│       ├── analyze-fridge/
│       │   └── route.ts          # POST: AI fridge/recipe suggestions
│       └── generate-workout/
│           └── route.ts          # POST: AI workout generation
├── components/
│   ├── dashboard/
│   │   ├── MacroProgressBar.tsx
│   │   ├── DailyStats.tsx
│   │   └── QuickActions.tsx
│   ├── meals/
│   │   ├── MealLogForm.tsx
│   │   ├── MealCard.tsx
│   │   └── PhotoUpload.tsx
│   ├── activity/
│   │   ├── WorkoutCard.tsx
│   │   └── WorkoutGenerator.tsx
│   └── ui/
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Input.tsx
│       └── LoadingSpinner.tsx
├── lib/
│   ├── supabase/
│   │   ├── client.ts             # Browser Supabase client
│   │   └── server.ts             # Server Supabase client
│   ├── openai.ts                 # OpenAI client + helper functions
│   └── utils.ts                  # General utilities (date formatting, macro math)
├── types/
│   └── index.ts                  # All TypeScript types (Profile, Meal, Workout, etc.)
├── .env.local                    # ← You create this (see setup below). NEVER commit this file.
├── .env.example                  # Template showing which vars are needed (no real values)
├── CLAUDE.md                     # This file
├── PRD.md                        # Product requirements
├── DEVLOG.md                     # Bug tracker and feature log
└── next.config.ts
```

---

## Environment Variables

The app needs these environment variables to function. They go in a file called `.env.local` in the project root.

**Never commit `.env.local` to git.** It's already in `.gitignore`.

```bash
# .env.local

# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# OpenAI
OPENAI_API_KEY=your_openai_api_key

# App
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

---

## How to Get Each API Key / Credential

### Step 1: Create a Supabase Account and Project

> Supabase is your database. It stores all user data, meals, workouts, and files.

1. Go to **[supabase.com](https://supabase.com)**
2. Click the green **"Start your project"** button in the top right
3. Sign up with GitHub or your email
4. Once logged in, click **"New project"**
5. Fill in:
   - **Organization**: your name or "Personal"
   - **Project name**: `adaptive-health-agent`
   - **Database password**: Create a strong password and **save it somewhere safe** (like a notes app). You'll need it later.
   - **Region**: Choose the one closest to you (e.g., US East, EU West)
6. Click **"Create new project"** — it takes about 1 minute to set up
7. Once the project loads, click **"Project Settings"** in the left sidebar (gear icon ⚙️)
8. Click **"API"** in the settings submenu
9. You will see:
   - **Project URL** → copy this → this is `NEXT_PUBLIC_SUPABASE_URL`
   - **anon / public key** → copy this → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role / secret key** → copy this → this is `SUPABASE_SERVICE_ROLE_KEY` ⚠️ keep this private

### Step 2: Create the Database Tables

> After getting your Supabase project, you need to create the tables where data will be stored.

1. In your Supabase project, click **"SQL Editor"** in the left sidebar (looks like `</>`  or a terminal icon)
2. Click **"New query"**
3. Paste the following SQL and click **"Run"** (or press Cmd+Enter / Ctrl+Enter):

```sql
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  goal text check (goal in ('weight_loss', 'muscle_gain', 'maintenance')),
  target_weight_kg float,
  timeline_weeks int,
  dietary_preferences text[] default '{}',
  activity_preferences text[] default '{}',
  calorie_target int,
  protein_target_g int,
  carbs_target_g int,
  fat_target_g int,
  created_at timestamptz default now()
);

-- Meals table
create table meals (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  logged_at timestamptz default now(),
  description text,
  calories int,
  protein_g float,
  carbs_g float,
  fat_g float,
  log_method text check (log_method in ('photo', 'voice', 'text', 'menu_scan')),
  image_url text,
  created_at timestamptz default now()
);

-- Workouts table
create table workouts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  performed_at timestamptz default now(),
  source text check (source in ('strava', 'apple_health', 'manual', 'ai_generated')),
  type text,
  duration_min int,
  calories_burned int,
  muscle_groups text[] default '{}',
  notes text,
  created_at timestamptz default now()
);

-- Sleep records table
create table sleep_records (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  date date not null,
  duration_hours float,
  readiness_score int,
  hrv int,
  source text check (source in ('oura', 'apple_health', 'manual')),
  created_at timestamptz default now()
);

-- Row Level Security: users can only access their own data
alter table profiles enable row level security;
alter table meals enable row level security;
alter table workouts enable row level security;
alter table sleep_records enable row level security;

create policy "Users can manage their own profile" on profiles
  for all using (auth.uid() = id);

create policy "Users can manage their own meals" on meals
  for all using (auth.uid() = user_id);

create policy "Users can manage their own workouts" on workouts
  for all using (auth.uid() = user_id);

create policy "Users can manage their own sleep records" on sleep_records
  for all using (auth.uid() = user_id);

-- Auto-create profile when user signs up
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
```

4. You should see **"Success. No rows returned"** — that means it worked.

### Step 3: Enable Supabase Storage (for meal photos)

1. In your Supabase project, click **"Storage"** in the left sidebar
2. Click **"New bucket"**
3. Name it: `meal-photos`
4. Check the box **"Public bucket"** — this lets photos be displayed in the app
5. Click **"Save"**

### Step 4: Enable Google OAuth (optional, for "Sign in with Google")

1. In Supabase, go to **"Authentication"** → **"Providers"** in the left sidebar
2. Find **"Google"** and click the toggle to enable it
3. You'll need a Google OAuth Client ID and Secret — follow the on-screen instructions to get these from Google Cloud Console
4. If this feels complicated, skip it for now — magic link (email) login works without any extra setup

### Step 5: Get Your OpenAI API Key

> OpenAI powers the AI features: meal photo analysis, macro estimation, recipe suggestions, and workout generation.

1. Go to **[platform.openai.com](https://platform.openai.com)**
2. Click **"Sign up"** if you don't have an account, or **"Log in"** if you do
3. After logging in, click your profile icon in the top right → **"API keys"**
   - Or go directly to: **platform.openai.com/api-keys**
4. Click **"Create new secret key"**
5. Give it a name like `adaptive-health-agent`
6. Click **"Create secret key"**
7. **Copy the key immediately** — you can only see it once. It looks like: `sk-proj-abc123...`
8. This is your `OPENAI_API_KEY`

> **Cost note:** GPT-4o charges per use. For personal use (a few meals logged per day), expect to spend less than $5/month. You can set spending limits at platform.openai.com/account/limits.

### Step 6: Create a Vercel Account and Connect Your Project

> Vercel is where the app lives on the internet. It automatically deploys every time you push code to GitHub.

1. First, make sure your code is in a GitHub repository:
   - Go to **[github.com](https://github.com)** and sign in (or create a free account)
   - Click **"New repository"** (the green button or the `+` icon)
   - Name it `adaptive-health-agent`
   - Set it to **Private**
   - Click **"Create repository"**
   - Follow the instructions to push your local code to GitHub

2. Go to **[vercel.com](https://vercel.com)**
3. Click **"Sign up"** → **"Continue with GitHub"** (recommended — links your repos automatically)
4. Click **"Add New..."** → **"Project"**
5. Find `adaptive-health-agent` in the list and click **"Import"**
6. Under **"Environment Variables"**, add each key from your `.env.local`:
   - Click **"Add"** for each variable
   - Name: `NEXT_PUBLIC_SUPABASE_URL` → Value: paste your Supabase URL
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY` → Value: paste your anon key
   - Name: `SUPABASE_SERVICE_ROLE_KEY` → Value: paste your service role key
   - Name: `OPENAI_API_KEY` → Value: paste your OpenAI key
   - Name: `NEXT_PUBLIC_APP_URL` → Value: `https://your-project-name.vercel.app` (Vercel will show you the URL)
7. Click **"Deploy"**
8. Vercel builds and deploys your app. In 1–2 minutes you'll get a live URL.

---

## Running the App Locally

After setup, run the app on your computer:

```bash
# Install dependencies (only needed once, or after adding new packages)
npm install

# Start the development server
npm run dev
```

Then open your browser and go to: **http://localhost:3000**

Any changes you save to files will automatically update in the browser.

---

## OpenAI Prompt Guidelines

When calling the OpenAI API for meal analysis, always include:
- The user's macro targets for the day
- How many macros they've already consumed
- Their dietary preferences (from profile)
- The current time of day

**Example system prompt for meal analysis:**
```
You are a nutrition expert analyzing food for a health tracking app.
The user's daily targets are: {calories} kcal, {protein}g protein, {carbs}g carbs, {fat}g fat.
They have consumed so far today: {consumed_calories} kcal, {consumed_protein}g protein.
Their dietary preferences: {dietary_preferences}.

Analyze the provided food image or description and return ONLY valid JSON in this format:
{
  "description": "Brief dish name",
  "calories": 450,
  "protein_g": 35,
  "carbs_g": 40,
  "fat_g": 12,
  "confidence": "high|medium|low",
  "notes": "Optional note about estimation uncertainty"
}
```

---

## Supabase Usage Patterns

### Client-side (in components with "use client")
```typescript
import { createClient } from '@/lib/supabase/client'

const supabase = createClient()
const { data, error } = await supabase.from('meals').select('*')
```

### Server-side (in Server Components and API routes)
```typescript
import { createClient } from '@/lib/supabase/server'

const supabase = createClient()
const { data: { user } } = await supabase.auth.getUser()
```

**Always check for errors.** Never assume a query succeeded.

---

## Deployment Checklist

Before every deploy, confirm:

- [ ] `.env.local` is NOT committed to git (check `.gitignore`)
- [ ] All environment variables are set in Vercel dashboard
- [ ] `npm run build` passes with no errors locally
- [ ] All new database tables have RLS enabled
- [ ] No `console.log` calls left in production code

---

## Common Issues and Fixes

### "Cannot find module" error
Run `npm install` — a dependency is missing.

### "Invalid API key" from OpenAI
Check that `OPENAI_API_KEY` in `.env.local` starts with `sk-` and has no extra spaces.

### Supabase "permission denied" error
RLS is blocking the query. Make sure:
1. The user is logged in
2. The table has a policy that allows the operation
3. You're using the correct Supabase client (browser vs. server)

### Build fails on Vercel but works locally
Almost always an environment variable issue. Check that all vars from `.env.local` are added in the Vercel dashboard.

### Images not loading after upload
Check that the `meal-photos` bucket is set to Public in Supabase Storage.

---

## What to Build First (Suggested Order)

1. **Auth** — Sign up / login with Supabase Auth (magic link)
2. **Onboarding** — 4-step goal setup, saves to `profiles` table
3. **Dashboard** — Read from `profiles` for targets, `meals` and `workouts` for today's data
4. **Meal Logging** — Text input → OpenAI API → save to `meals` table
5. **Photo Logging** — Photo upload → Supabase Storage → OpenAI Vision → save to `meals`
6. **Workout Logging** — Manual entry form → save to `workouts` table
7. **AI Workout Generator** — Text prompt → OpenAI → display structured workout
8. **Meal Ideas** — Fridge photo → OpenAI Vision → recipe suggestions
9. **Calendar** — Aggregate `meals` and `workouts` by date
10. **Polish** — Dark mode, loading states, error messages, mobile tweaks

Build in this order. Do not skip ahead to fancy features before core data flows work.

---

## Tone and UX Guidelines

- **Clean and minimal.** If a page feels crowded, remove something.
- **Encouraging, not punishing.** Never show the user they "failed" — frame it as "you have 30g of protein left to hit your goal."
- **Fast feedback.** Every user action (logging a meal, saving a workout) should show confirmation within 1 second.
- **Mobile-first, always.** The primary use case is logging a meal on your phone right after eating.
