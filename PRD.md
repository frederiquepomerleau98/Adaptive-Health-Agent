# Product Requirements Document (PRD)
## Product Name (Working): Adaptive Health Agent

---

## 1. Overview

Many people interested in maintaining a healthy lifestyle track parts of their health data across multiple tools—fitness apps (Strava, ClassPass), wearable devices (Oura Ring, Apple Health), and ad-hoc meal tracking via notes or LLMs. These data sources remain fragmented and are rarely used together to generate personalized, adaptive recommendations.

Traditional fitness and nutrition apps rely on rigid plans or generic surveys requiring users to commit to predefined schedules. These approaches fail because they are static, require high planning effort, and do not adapt to real-time activity or eating habits.

**Adaptive Health Agent** is an AI-powered web application that integrates a user's activity, nutrition, and lifestyle data into a single platform. Instead of static plans, it provides **dynamic daily insights and recommendations** based on the user's historical behavior, goals, and real-time inputs.

The product acts as a **personal health co-pilot** that learns from the user's habits and helps them make better day-to-day decisions about food, exercise, and recovery.

---

## 2. Target User

Health-conscious individuals who:

- Exercise regularly but do not follow rigid plans
- Use multiple apps (Strava, Oura, ClassPass, Apple Health)
- Informally track food using AI tools or notes
- Want insights into whether nutrition matches their activity level
- Prefer **flexible suggestions instead of strict programs**

---

## 3. Core Product Principles

1. **Reduce friction in tracking** — photo, voice, integrations
2. **Unify fragmented health data**
3. **Provide adaptive daily recommendations**
4. **Keep the interface simple and not overloaded**

---

## 4. Tech Stack (Non-Negotiable)

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 14 (App Router) + TypeScript |
| **Styling** | Tailwind CSS |
| **Backend / Database** | Supabase (PostgreSQL + Auth + Storage) |
| **AI** | OpenAI API (GPT-4o for vision, text, macro estimation) |
| **Deployment** | Vercel |
| **Auth** | Supabase Auth (magic link + Google OAuth) |

**No deviations from this stack.** Do not introduce other databases, CSS frameworks, or AI providers unless explicitly asked.

---

## 5. Database Schema

### `profiles`
| Column | Type | Notes |
|---|---|---|
| id | uuid | FK → auth.users |
| goal | text | `weight_loss`, `muscle_gain`, `maintenance` |
| target_weight_kg | float | |
| timeline_weeks | int | |
| dietary_preferences | text[] | `vegetarian`, `vegan`, `gluten_free`, etc. |
| activity_preferences | text[] | `running`, `lifting`, `yoga`, etc. |
| calorie_target | int | Calculated from goal |
| protein_target_g | int | |
| carbs_target_g | int | |
| fat_target_g | int | |
| created_at | timestamptz | |

### `meals`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → profiles |
| logged_at | timestamptz | |
| description | text | Free-text or AI-parsed description |
| calories | int | |
| protein_g | float | |
| carbs_g | float | |
| fat_g | float | |
| log_method | text | `photo`, `voice`, `text`, `menu_scan` |
| image_url | text | Supabase Storage URL (optional) |

### `workouts`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → profiles |
| performed_at | timestamptz | |
| source | text | `strava`, `apple_health`, `manual`, `ai_generated` |
| type | text | `run`, `ride`, `strength`, `yoga`, etc. |
| duration_min | int | |
| calories_burned | int | |
| muscle_groups | text[] | `legs`, `upper_body`, `core`, `full_body` |
| notes | text | |

### `sleep_records`
| Column | Type | Notes |
|---|---|---|
| id | uuid | |
| user_id | uuid | FK → profiles |
| date | date | |
| duration_hours | float | |
| readiness_score | int | 0–100 |
| hrv | int | |
| source | text | `oura`, `apple_health`, `manual` |

---

## 6. Key Features

### 6.1 Unified Health Data Integration

Integrations (Phase 1 = manual entry, Phase 2 = API):

| Integration | Data | Phase |
|---|---|---|
| **Strava** | Runs, rides | Phase 2 |
| **Oura Ring** | Sleep, readiness, HRV | Phase 2 |
| **Apple Health** | Steps, workouts | Phase 2 |
| **ClassPass / Gmail** | Booked workout classes | Phase 2 |

**Phase 1** ships with manual entry + AI-assisted logging only.

---

### 6.2 Frictionless Meal Logging

#### Input Methods

**Photo upload** — User uploads a food photo. GPT-4o Vision analyzes and returns:
- Calories, Protein (g), Carbs (g), Fat (g)
- Dish description
- Confidence level

**Voice description** — User speaks or types a free-text description (e.g., *"Chicken salad with quinoa, avocado and olive oil dressing"*). AI estimates macros.

**Text entry** — Manual logging with optional AI macro estimation.

**Menu scanning** — User uploads a restaurant menu image. AI identifies best options for their current macro goals.

#### Acceptance Criteria
- [ ] User can upload a photo and receive macro estimates within 10 seconds
- [ ] User can type a description and receive macro estimates within 5 seconds
- [ ] Meal is saved to the database and reflected in the dashboard immediately
- [ ] User can edit any AI-estimated values before saving

---

### 6.3 Daily Dashboard (Home)

#### What it shows
- Calories consumed vs. target
- Protein consumed vs. target (g)
- Carbs consumed vs. target (g)
- Fat consumed vs. target (g)
- Calories burned (from logged workouts)
- Net calories (consumed − burned)
- Activity summary (today's workouts)
- Sleep score (if available)

#### Visual Macro Tracker
Progress bars fill relative to daily targets. Color coding:
- Green: on track (70–100% of target)
- Yellow: under (< 70%)
- Red: over (> 110%)

#### Quick Actions (floating or top-of-page buttons)
- `+ Log Meal`
- `+ Log Workout`
- `View Insights`

#### Acceptance Criteria
- [ ] Dashboard loads in under 2 seconds
- [ ] All macro progress bars are accurate to today's logged meals
- [ ] Quick action buttons are visible without scrolling on mobile

---

### 6.4 Meal Planning & Food Inspiration Tab

Separate from the dashboard. Accessed via the **"Meal Ideas"** tab.

#### Features

**Fridge photo input** — User uploads a fridge or pantry photo. AI suggests:
- 3 recipe ideas using visible ingredients
- Estimated macros for each

**Meal recommendation engine** — Based on:
- Remaining macros for the day
- Recent workouts (e.g., post-leg day → high protein)
- Time of day
- User dietary preferences

**Example recommendation:**
> *"You still need ~30g of protein today. Consider a salmon bowl, Greek yogurt with nuts, or grilled chicken wrap."*

**Restaurant assistance** — Upload a menu photo. AI highlights best choices for goals + estimates macros.

#### Acceptance Criteria
- [ ] AI returns at least 3 recipe suggestions from fridge photo
- [ ] Meal recommendations update dynamically based on remaining daily macros
- [ ] Restaurant menu analysis returns at least 3 recommended dishes with macro estimates

---

### 6.5 Activity & Workout Tab

#### Activity History
Pulled from logged workouts. Shows:
- Weekly activity heatmap
- Workout type distribution
- Muscle group distribution

#### Workout Recommendation Engine
Logic:
- If legs trained yesterday → suggest upper body or rest
- If no workout in 2+ days → suggest full-body
- If readiness score < 60 → suggest recovery/yoga

#### Custom Workout Generation
User inputs via text:
- Goal: muscle group focus
- Equipment: dumbbells, barbell, bodyweight, none
- Duration: 20–60 min
- Location: gym / home

AI returns a structured workout plan with sets, reps, and rest times.

#### Acceptance Criteria
- [ ] Workout history displays last 30 days of activity
- [ ] Custom workout generator returns a complete workout within 10 seconds
- [ ] Muscle group tracking updates after each logged workout

---

### 6.6 Calendar / Timeline

Calendar view (monthly) showing:
- Meals logged (dot indicator)
- Workouts (dot indicator)
- Daily calorie status (color-coded: surplus / deficit / on target)
- Sleep score (optional)

Clicking a day shows the full breakdown for that day.

#### Acceptance Criteria
- [ ] Calendar renders all 30 days of history
- [ ] Clicking a day opens a detail panel with meals and workouts
- [ ] Color coding is consistent with dashboard status colors

---

### 6.7 Profile & Goal Setup (Onboarding)

Step-by-step onboarding flow (4 screens max):

1. **Goal** — Weight loss / Muscle gain / Maintenance
2. **Details** — Current weight, target weight, timeline
3. **Diet** — Dietary preferences (multi-select)
4. **Activity** — Activity preferences (multi-select), typical workout frequency

System calculates:
- Calorie target (TDEE-based formula)
- Protein target (2g per kg bodyweight for muscle gain, 1.6g for others)
- Carbs / fat split from remaining calories

#### Acceptance Criteria
- [ ] Onboarding completes in under 2 minutes
- [ ] Macro targets are saved to the profile and visible on the dashboard immediately
- [ ] User can update goals from the Profile tab at any time

---

## 7. AI Agent Capabilities

All AI calls go through the OpenAI API (GPT-4o):

| Capability | Input | Output |
|---|---|---|
| Food photo analysis | Image (JPEG/PNG) | Macros + description |
| Meal description → macros | Text | Calories, protein, carbs, fat |
| Fridge photo → recipes | Image | 3 recipe suggestions with macros |
| Menu analysis | Image | Top 3 dish recommendations |
| Custom workout generation | Text prompt | Structured workout plan |
| Daily recommendation | User data context | 1-3 personalized suggestions |

**Prompts must always include the user's macro targets and today's logged data as context.**

---

## 8. App Navigation

| Tab | Route | Purpose |
|---|---|---|
| Dashboard | `/` | Daily overview and macro tracker |
| Meals | `/meals` | Meal log and nutrition breakdown |
| Meal Ideas | `/ideas` | Fridge photos, recipes, restaurant help |
| Activity | `/activity` | Workout history and custom workouts |
| Calendar | `/calendar` | Timeline view of activity and nutrition |
| Profile | `/profile` | Goals, preferences, integrations |

---

## 9. Non-Functional Requirements

- **Mobile-first** — Must be fully functional on a 375px wide screen (iPhone SE)
- **Dark mode** — Support system-level dark/light preference
- **Performance** — Lighthouse score ≥ 80 on mobile
- **Security** — All database rows protected by Supabase Row Level Security (RLS). Users can only read/write their own data.
- **No personal data leaks** — Never log user data to console in production

---

## 10. Success Metrics (Phase 1)

- User can complete full onboarding in < 2 minutes
- User can log a meal via photo in < 30 seconds
- Dashboard loads in < 2 seconds
- AI macro estimates are within ±15% of actual (validated manually)

---

## 11. Out of Scope (Phase 1)

- Native iOS / Android apps
- Third-party API integrations (Strava, Oura, Apple Health)
- Social features (sharing, friends)
- Payments / subscriptions
- Meal prep calendar / weekly planning

---

## 12. Differentiation

| Traditional Apps | Adaptive Health Agent |
|---|---|
| Static plans | Adaptive recommendations |
| Manual logging | Photo + voice input |
| Limited integrations | Multi-platform data (Phase 2) |
| Weekly planning | Real-time daily insights |
