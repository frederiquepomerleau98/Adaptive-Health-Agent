# Adaptive Health Agent

A personal AI health companion. Chat with the AI to log meals, get workout plans, and track your health goals — all through natural conversation.

---

## Table of Contents

1. [What You Need to Install](#1-what-you-need-to-install)
2. [Create Your Accounts](#2-create-your-accounts)
3. [Clone the Project](#3-clone-the-project)
4. [Set Up Environment Variables](#4-set-up-environment-variables)
5. [Run the App Locally](#5-run-the-app-locally)
6. [Invite Teammates](#6-invite-teammates)
7. [GitHub: Branches & Pull Requests](#7-github-branches--pull-requests)
8. [Deploying with Vercel](#8-deploying-with-vercel)
9. [Troubleshooting](#9-troubleshooting)

---

## 1. What You Need to Install

Install these on your computer before doing anything else.

### Node.js (required to run the app)

1. Go to **https://nodejs.org**
2. Download the **LTS** version (the big green button)
3. Open the downloaded file and follow the installer
4. To verify it worked, open your terminal and type:
   ```bash
   node --version
   ```
   You should see something like `v20.x.x`

**How to open a terminal:**
- **Mac:** Press `Cmd + Space`, type "Terminal", press Enter
- **Windows:** Press `Windows key`, type "cmd" or "PowerShell", press Enter

### Git (required to download and share code)

1. Go to **https://git-scm.com/downloads**
2. Download for your operating system (Mac / Windows)
3. Open the downloaded file and follow the installer (use all default settings)
4. To verify it worked, open your terminal and type:
   ```bash
   git --version
   ```
   You should see something like `git version 2.x.x`

### VS Code (recommended code editor)

1. Go to **https://code.visualstudio.com**
2. Download for your operating system
3. Install it

---

## 2. Create Your Accounts

You need accounts on **three** services. All are free.

### A. GitHub (where the code lives)

1. Go to **https://github.com**
2. Click **Sign up** and create an account
3. Verify your email
4. Done — you'll be invited to the project repo (see [Invite Teammates](#6-invite-teammates))

### B. Supabase (the database)

1. Go to **https://supabase.com**
2. Click **Start your project**
3. Sign up with your **GitHub account** (easiest)
4. You'll be invited to the team project (see [Invite Teammates](#6-invite-teammates))

### C. Vercel (where the app is deployed)

1. Go to **https://vercel.com**
2. Click **Sign Up** → **Continue with GitHub**
3. You'll be invited to the team (see [Invite Teammates](#6-invite-teammates))

### D. OpenAI (the AI that powers the app)

1. Go to **https://platform.openai.com**
2. Click **Sign up** (or **Log in** if you already have a ChatGPT account)
3. After logging in, click your profile icon (top right) → **API keys**
   - Or go to: **https://platform.openai.com/api-keys**
4. Click **Create new secret key**
5. Name it something like `adaptive-health-agent`
6. Click **Create secret key**
7. **COPY THE KEY IMMEDIATELY** — you can only see it once!
   - It looks like: `sk-proj-abc123...`
   - Save it somewhere safe (notes app, password manager)
8. This is your `OPENAI_API_KEY` — you'll need it in step 4

> **Cost:** OpenAI charges per use. For testing, expect less than $5/month. Set spending limits at https://platform.openai.com/settings/organization/limits

---

## 3. Clone the Project

This downloads the code to your computer.

1. Open your terminal
2. Navigate to where you want the project folder (e.g., Desktop):
   ```bash
   cd ~/Desktop
   ```
3. Clone the repository:
   ```bash
   git clone https://github.com/frederiquepomerleau98/Adaptive-Health-Agent.git
   ```
4. Go into the project folder:
   ```bash
   cd Adaptive-Health-Agent
   ```
5. Install dependencies:
   ```bash
   npm install
   ```
   This may take 1-2 minutes. Wait for it to finish.

---

## 4. Set Up Environment Variables

The app needs secret keys to connect to Supabase and OpenAI. These go in a file called `.env.local`.

1. In the project folder, create a new file called `.env.local`:
   ```bash
   cp .env.example .env.local
   ```
2. Open `.env.local` in VS Code (or any text editor)
3. Fill in each value:

```bash
# Supabase — get these from Supabase dashboard → Project Settings → API
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGci...your-anon-key
SUPABASE_SERVICE_ROLE_KEY=eyJhbGci...your-service-role-key

# OpenAI — the key you created in step 2D
OPENAI_API_KEY=sk-proj-your-key-here

# App URL — keep this as-is for local development
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Where to find your Supabase keys:

1. Go to **https://supabase.com** → open the project
2. Click the **gear icon** (Project Settings) in the left sidebar
3. Click **API**
4. Copy:
   - **Project URL** → paste as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public key** → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role secret key** → paste as `SUPABASE_SERVICE_ROLE_KEY`

> **IMPORTANT:** Never share `.env.local` or commit it to GitHub. It's already in `.gitignore`.

---

## 5. Run the App Locally

1. Make sure you're in the project folder in your terminal
2. Run:
   ```bash
   npm run dev
   ```
3. Open your browser and go to: **http://localhost:3000**
4. You should see the app!

To stop the app, press `Ctrl + C` in the terminal.

---

## 6. Invite Teammates

### GitHub (code access)

**Owner does this:**
1. Go to your repo: **https://github.com/frederiquepomerleau98/Adaptive-Health-Agent**
2. Click **Settings** (top tab bar, far right)
3. Click **Collaborators** in the left sidebar
4. Click **Add people**
5. Type their **GitHub username** or **email**
6. Click **Add collaborator**
7. They'll receive an email invitation — they must click **Accept**

**What to share with a teammate:**
- The **repository URL**: `https://github.com/frederiquepomerleau98/Adaptive-Health-Agent`
- They need a GitHub account first
- After accepting the invite, they can clone the repo (step 3 above)

### Supabase (database access)

**Owner does this:**
1. Go to **https://supabase.com** → open the project
2. Click the **gear icon** (Project Settings)
3. Click **Members** in the left sidebar (under "Team")
4. Click **Invite member**
5. Enter their email
6. Choose role: **Developer** (can view and edit, but not delete the project)
7. Click **Send invite**

### Vercel (deployment access)

**Owner does this:**
1. Go to **https://vercel.com**
2. Click your team name (top left)
3. Click **Settings** → **Members**
4. Click **Invite Member**
5. Enter their email
6. Choose role: **Member**
7. Click **Invite**

---

## 7. GitHub: Branches & Pull Requests

### Why branches?

Nobody commits directly to `main`. Instead:
1. You create a **branch** for your work
2. You make your changes on that branch
3. You create a **Pull Request (PR)** to merge into `main`
4. Someone reviews and approves
5. Then it merges

This prevents bugs from going straight to production.

### How to create a branch and make a PR

```bash
# 1. Make sure you're on main and up to date
git checkout main
git pull origin main

# 2. Create a new branch (name it after what you're working on)
git checkout -b your-name/feature-description
# Example: git checkout -b sarah/add-chat-ui

# 3. Make your code changes in VS Code...

# 4. See what files you changed
git status

# 5. Stage your changes
git add .

# 6. Commit with a message describing what you did
git commit -m "Add chat UI component with message list"

# 7. Push your branch to GitHub
git push -u origin your-name/feature-description

# 8. Go to GitHub — it will show a yellow banner saying
#    "your-name/feature-description had recent pushes"
#    Click "Compare & pull request"

# 9. Write a short description of what you changed, then click
#    "Create pull request"

# 10. Ask a teammate to review it. Once approved, click "Merge pull request"
```

### Protect the main branch (Owner does this once)

This prevents anyone from pushing directly to `main` — they must use a Pull Request.

1. Go to **https://github.com/frederiquepomerleau98/Adaptive-Health-Agent**
2. Click **Settings** (top tab bar)
3. Click **Branches** in the left sidebar (under "Code and automation")
4. Click **Add branch ruleset**
5. Fill in:
   - **Ruleset name:** `Protect main`
   - **Enforcement status:** `Active`
   - Under **Target branches**, click **Add target** → **Include by pattern** → type `main`
   - Check these boxes:
     - **Restrict deletions**
     - **Require a pull request before merging**
       - Set "Required approvals" to **1**
     - **Block force pushes**
6. Click **Create**

Now nobody (including you) can push directly to `main`. All changes go through Pull Requests.

---

## 8. Deploying with Vercel

Vercel automatically deploys every time code is merged to `main`.

### First-time setup (Owner does this once)

1. Go to **https://vercel.com**
2. Click **Add New...** → **Project**
3. Find `Adaptive-Health-Agent` in the list → click **Import**
4. Under **Environment Variables**, add each key from your `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `OPENAI_API_KEY`
   - `NEXT_PUBLIC_APP_URL` → set to `https://your-project.vercel.app`
5. Click **Deploy**
6. In 1-2 minutes you get a live URL

### After that

- Every time a PR is merged to `main`, Vercel automatically rebuilds and deploys
- Every open PR gets its own **Preview URL** so you can test before merging

---

## 9. Troubleshooting

### "command not found: node"
You haven't installed Node.js yet. Go back to [step 1](#1-what-you-need-to-install).

### "command not found: git"
You haven't installed Git yet. Go back to [step 1](#1-what-you-need-to-install).

### "npm install" fails
- Make sure you're inside the project folder (`cd Adaptive-Health-Agent`)
- Try deleting `node_modules` and reinstalling:
  ```bash
  rm -rf node_modules
  npm install
  ```

### "Cannot find module" error when running the app
Run `npm install` — a dependency is missing.

### "Invalid API key" from OpenAI
Check that `OPENAI_API_KEY` in `.env.local` starts with `sk-` and has no extra spaces or quotes around it.

### "supabaseUrl is required" error
Your `.env.local` file is missing or the Supabase URL isn't set. Double-check step 4.

### Supabase "permission denied" error
The database Row Level Security (RLS) is blocking the query. Ask the project owner to check the RLS policies.

### App works locally but not on Vercel
Almost always a missing environment variable. Go to Vercel → Project → Settings → Environment Variables and make sure all 5 variables are set.

### "I can't push to main"
That's intentional! Create a branch instead. See [step 7](#7-github-branches--pull-requests).

### Something else?
Ask in the team chat or open a GitHub Issue on the repository.

---

## Quick Reference

| What | Where |
|------|-------|
| Code | https://github.com/frederiquepomerleau98/Adaptive-Health-Agent |
| Database | https://supabase.com (project dashboard) |
| Live App | Your Vercel URL (check Vercel dashboard) |
| AI Keys | https://platform.openai.com/api-keys |
| Run locally | `npm run dev` → http://localhost:3000 |
