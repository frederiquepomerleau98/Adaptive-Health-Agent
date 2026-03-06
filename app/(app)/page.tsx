export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { calculateDailyMacros, getToday } from '@/lib/utils'
import DailyStats from '@/components/dashboard/DailyStats'
import QuickActions from '@/components/dashboard/QuickActions'
import AIInsightCard from '@/components/dashboard/AIInsightCard'
import Card from '@/components/ui/Card'
import type { DailyMacros, Meal } from '@/types'

export default async function DashboardPage() {
  const supabase = createServiceClient()
  const user = await getUser()

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  const today = getToday()
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false })

  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('performed_at', `${today}T00:00:00`)
    .lte('performed_at', `${today}T23:59:59`)

  const consumed = calculateDailyMacros(meals ?? [])
  const targets: DailyMacros = {
    calories: profile?.calorie_target ?? 2200,
    protein_g: profile?.protein_target_g ?? 150,
    carbs_g: profile?.carbs_target_g ?? 220,
    fat_g: profile?.fat_target_g ?? 75,
  }

  const totalCaloriesBurned = (workouts ?? []).reduce(
    (sum: number, w: { calories_burned: number | null }) => sum + (w.calories_burned ?? 0),
    0
  )

  const recentMeals = (meals ?? []).slice(0, 3) as Meal[]

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">{getGreeting()}</h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', {
            weekday: 'long',
            month: 'long',
            day: 'numeric',
          })}
        </p>
      </div>

      {/* AI Insight */}
      <AIInsightCard
        consumed={consumed}
        targets={targets}
        workoutsDone={(workouts ?? []).length}
        caloriesBurned={totalCaloriesBurned}
      />

      {/* Today's Progress */}
      <DailyStats consumed={consumed} targets={targets} />

      {/* Activity summary */}
      {totalCaloriesBurned > 0 && (
        <Card>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10">
              <svg className="h-5 w-5 text-violet-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-medium text-white">
                {totalCaloriesBurned} kcal burned
              </p>
              <p className="text-xs text-gray-500">
                {(workouts ?? []).length} workout{(workouts ?? []).length !== 1 ? 's' : ''} today
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Quick Actions */}
      <div>
        <h2 className="mb-3 text-sm font-medium text-gray-400">Quick Actions</h2>
        <QuickActions />
      </div>

      {/* Recent meals */}
      {recentMeals.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-gray-400">Recent Meals</h2>
          <div className="space-y-2">
            {recentMeals.map((meal) => (
              <Card key={meal.id} hover>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-white">
                      {meal.description ?? 'Meal'}
                    </p>
                    <p className="text-xs text-gray-500">
                      {meal.calories ?? 0} kcal &middot; {Math.round(meal.protein_g ?? 0)}g protein
                    </p>
                  </div>
                  <p className="text-xs text-gray-500">
                    {new Date(meal.logged_at).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
