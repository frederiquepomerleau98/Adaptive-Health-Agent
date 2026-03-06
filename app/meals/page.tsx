import { createClient } from '@/lib/supabase/server'
import { getToday } from '@/lib/utils'
import MealLogForm from '@/components/meals/MealLogForm'
import MealCard from '@/components/meals/MealCard'
import BottomNav from '@/components/BottomNav'
import type { Meal } from '@/types'

export default async function MealsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = getToday()
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false })

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Log a meal</h1>

      <MealLogForm />

      {meals && meals.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Today&apos;s meals</h2>
          <div className="space-y-3">
            {(meals as Meal[]).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
