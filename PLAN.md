# Revamp Plan: Chat-First AI Health Companion

## Core Philosophy
Chat is the primary interface. No forms, no manual data entry screens.
You talk to the AI, and it handles everything — onboarding, meal logging,
workout suggestions, profile updates. Other pages (calendar, stats) are
read-only views of data that was created through conversation.

## Architecture Changes

### 1. New Database: Chat Messages Table
```sql
create table chat_messages (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  role text check (role in ('user', 'assistant')) not null,
  content text not null,
  metadata jsonb default '{}',
  created_at timestamptz default now()
);
```
metadata stores structured actions (meal logged, workout saved, profile updated).

### 2. New API Route: /api/chat
- POST endpoint that receives user message + conversation history
- AI has full context: user profile, today's meals/workouts, recent chat
- AI can perform actions inline:
  - Log a meal (parse food description → estimate macros → save)
  - Save a workout
  - Update profile/goals
  - Show recommendations based on what's been logged today
- Returns assistant message + any actions taken

### 3. Page Structure (Revised)

| Route | Purpose | Type |
|-------|---------|------|
| `/` | Chat interface (main screen) | Client |
| `/calendar` | Calendar view (read-only, richer) | Server |
| `/stats` | Daily/weekly stats & trends | Server |
| `/profile` | View/edit profile (also editable via chat) | Client |

Remove: `/meals`, `/activity`, `/ideas`, `/onboarding`, `/login`
(All handled through chat now)

### 4. Chat Interface Components
- `ChatView.tsx` — main chat container with message list + input
- `ChatMessage.tsx` — renders a single message (user or assistant)
- `ChatInput.tsx` — text input + photo upload button
- `MealLoggedCard.tsx` — inline card when AI logs a meal
- `WorkoutCard.tsx` — inline card when AI suggests/saves a workout
- `ProfileCard.tsx` — inline card showing profile summary

### 5. AI System Prompt Strategy
The chat API builds a rich system prompt including:
- User profile (goals, macro targets, preferences)
- Today's consumed macros (from meals table)
- Today's workouts
- Time of day
- Recent conversation context
- Instructions for structured JSON actions

### 6. Files to Create
- `app/api/chat/route.ts` — main chat endpoint
- `components/chat/ChatView.tsx` — chat container
- `components/chat/ChatMessage.tsx` — message bubble
- `components/chat/ChatInput.tsx` — input bar
- `components/chat/ActionCard.tsx` — renders inline action cards (meal logged, workout, etc.)

### 7. Files to Modify
- `app/page.tsx` — replace dashboard with ChatView
- `app/layout.tsx` — update nav structure
- `components/BottomNav.tsx` — simplify to 3 tabs: Chat, Calendar, Profile
- `types/index.ts` — add ChatMessage, ChatAction types

### 8. Files to Remove
- `app/meals/page.tsx` — handled in chat
- `app/activity/page.tsx` — handled in chat
- `app/ideas/page.tsx` — handled in chat
- `app/onboarding/page.tsx` — handled in chat
- `app/login/page.tsx` — auth disabled
- `components/dashboard/*` — replaced by chat
- `components/meals/MealLogForm.tsx` — replaced by chat
- `components/meals/PhotoUpload.tsx` — integrated into ChatInput

### 9. Implementation Order
1. Add chat_messages type + ChatMessage/ChatAction types
2. Create chat API route with full context awareness
3. Build ChatView, ChatMessage, ChatInput components
4. Build ActionCard for inline meal/workout cards
5. Replace dashboard (/) with chat interface
6. Update BottomNav to Chat/Calendar/Profile
7. Enhance calendar page with richer data
8. Remove old pages and unused components
9. Clean up
