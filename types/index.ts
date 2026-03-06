export type Goal = 'weight_loss' | 'muscle_gain' | 'maintenance'

export type LogMethod = 'photo' | 'voice' | 'text' | 'menu_scan'

export type WorkoutSource = 'strava' | 'apple_health' | 'manual' | 'ai_generated'

export type SleepSource = 'oura' | 'apple_health' | 'manual'

export interface Profile {
  id: string
  goal: Goal | null
  target_weight_kg: number | null
  timeline_weeks: number | null
  dietary_preferences: string[]
  activity_preferences: string[]
  calorie_target: number | null
  protein_target_g: number | null
  carbs_target_g: number | null
  fat_target_g: number | null
  fiber_target_g: number | null
  hydration_target_ml: number | null
  steps_target: number | null
  created_at: string
}

export interface Meal {
  id: string
  user_id: string
  logged_at: string
  description: string | null
  calories: number | null
  protein_g: number | null
  carbs_g: number | null
  fat_g: number | null
  fiber_g: number | null
  log_method: LogMethod | null
  image_url: string | null
  created_at: string
}

export interface Workout {
  id: string
  user_id: string
  performed_at: string
  source: WorkoutSource | null
  type: string | null
  duration_min: number | null
  calories_burned: number | null
  muscle_groups: string[]
  notes: string | null
  created_at: string
}

export interface SleepRecord {
  id: string
  user_id: string
  date: string
  duration_hours: number | null
  readiness_score: number | null
  hrv: number | null
  source: SleepSource | null
  created_at: string
}

export interface MealAnalysis {
  description: string
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
  fiber_g: number
  confidence: 'high' | 'medium' | 'low'
  notes?: string
}

export interface DailyMacros {
  calories: number
  protein_g: number
  carbs_g: number
  fat_g: number
}

export interface DailyNutrition extends DailyMacros {
  fiber_g: number
  hydration_ml: number
  steps: number
}

export interface GeneratedWorkout {
  name: string
  type: string
  duration_min: number
  estimated_calories: number
  exercises: {
    name: string
    sets: number
    reps: string
    rest_seconds: number
    notes?: string
  }[]
}

export interface MealIdea {
  name: string
  description: string
  estimated_calories: number
  estimated_protein_g: number
  estimated_carbs_g: number
  estimated_fat_g: number
  ingredients: string[]
  instructions: string[]
  prep_time_min: number
}
