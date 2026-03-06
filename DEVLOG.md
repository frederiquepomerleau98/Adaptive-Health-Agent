# DEVLOG — Adaptive Health Agent

> This file tracks every bug we fix, feature we ship, and insight we gain.
> Update this file after every meaningful change.
> Format: newest entries at the top.

---

## How to Add an Entry

Copy this template and paste it at the top of the relevant section:

```
### [YYYY-MM-DD] Short description of what happened
- **Type**: Bug Fix | Feature | Improvement | Discovery
- **What**: What was the problem or feature?
- **Why**: Why did it happen or why did we build it?
- **How**: What did we do to fix or build it?
- **Result**: What is the outcome?
```

---

## Bugs Fixed

_No bugs fixed yet — we haven't shipped anything!_

---

## Features Shipped

_No features shipped yet._

---

## Insights & Learnings

### [2026-03-06] Project initialized
- **Type**: Discovery
- **What**: Created the project foundation — PRD, CLAUDE.md, and DEVLOG.
- **Decisions made**:
  - Stack: Next.js 14 + Supabase + OpenAI + Vercel
  - Phase 1 is manual entry only (no Strava/Oura API integrations yet)
  - Auth via Supabase magic link (no password needed)
  - GPT-4o for all AI features (vision + text)
- **Result**: Ready to start building.

---

## Backlog (Ideas for Later)

> Things we want to build but are not in Phase 1.

- [ ] Strava integration (auto-import runs and rides)
- [ ] Oura Ring integration (auto-import sleep and HRV)
- [ ] Apple Health sync (via Shortcuts or HealthKit)
- [ ] Voice meal logging (browser microphone → speech-to-text)
- [ ] Weekly email summary (top patterns from the week)
- [ ] Streak tracking (consecutive days of hitting protein goal, etc.)
- [ ] Export data to CSV
- [ ] Multiple user profiles (for couples or family)
- [ ] Barcode scanner for packaged foods

---

## Decisions Log

> Major architectural or product decisions and the reasoning behind them.

| Date | Decision | Reasoning |
|---|---|---|
| 2026-03-06 | Use Supabase instead of Firebase | Better SQL support, Row Level Security built-in, generous free tier |
| 2026-03-06 | Use GPT-4o for all AI | Best vision model available; single API for all AI features reduces complexity |
| 2026-03-06 | No native app in Phase 1 | Web app is faster to ship; Next.js is mobile-responsive |
| 2026-03-06 | Magic link auth (no passwords) | Fewer friction points for a personal app; no password reset flows needed |
| 2026-03-06 | Phase 1: manual entry only | Ship fast; third-party APIs add complexity and rate limits |
