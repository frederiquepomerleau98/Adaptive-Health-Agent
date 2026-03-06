import type { DailyMacros, Meal } from '@/types'

export function formatDate(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function formatTime(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  return d.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getToday(): string {
  return new Date().toISOString().split('T')[0]
}

export function calculateDailyMacros(meals: Meal[]): DailyMacros {
  return meals.reduce(
    (acc, meal) => ({
      calories: acc.calories + (meal.calories ?? 0),
      protein_g: acc.protein_g + (meal.protein_g ?? 0),
      carbs_g: acc.carbs_g + (meal.carbs_g ?? 0),
      fat_g: acc.fat_g + (meal.fat_g ?? 0),
    }),
    { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 }
  )
}

export function macroPercentage(consumed: number, target: number): number {
  if (target <= 0) return 0
  return Math.min(Math.round((consumed / target) * 100), 100)
}

export function getRemainingMacros(
  consumed: DailyMacros,
  targets: DailyMacros
): DailyMacros {
  return {
    calories: Math.max(0, targets.calories - consumed.calories),
    protein_g: Math.max(0, targets.protein_g - consumed.protein_g),
    carbs_g: Math.max(0, targets.carbs_g - consumed.carbs_g),
    fat_g: Math.max(0, targets.fat_g - consumed.fat_g),
  }
}

export function getTimeOfDay(): 'morning' | 'afternoon' | 'evening' {
  const hour = new Date().getHours()
  if (hour < 12) return 'morning'
  if (hour < 18) return 'afternoon'
  return 'evening'
}
