import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { calculateDailyMacros, getToday } from '@/lib/utils'
import DailyStats from '@/components/dashboard/DailyStats'
import QuickActions from '@/components/dashboard/QuickActions'
import BottomNav from '@/components/BottomNav'
import type { DailyMacros } from '@/types'

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

  const totalCaloriesBurned = (workouts ?? []).reduce((sum, w) => sum + (w.calories_burned ?? 0), 0)

  return (
    <div className="px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">
          {getGreeting()}
        </h1>
        <p className="text-sm text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
        </p>
      </div>

      <div className="space-y-4">
        <DailyStats consumed={consumed} targets={targets} />

        {totalCaloriesBurned > 0 && (
          <div className="rounded-2xl bg-blue-50 p-4 text-center">
            <p className="text-sm text-blue-600">
              You&apos;ve burned <span className="font-bold">{totalCaloriesBurned} kcal</span> today
            </p>
          </div>
        )}

        <QuickActions />
      </div>

      <BottomNav />
    </div>
  )
}

function getGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}
