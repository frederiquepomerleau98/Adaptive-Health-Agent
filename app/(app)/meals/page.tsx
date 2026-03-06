export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { getToday } from '@/lib/utils'
import MealLogForm from '@/components/meals/MealLogForm'
import MealCard from '@/components/meals/MealCard'
import type { Meal } from '@/types'

export default async function MealsPage() {
  const supabase = createServiceClient()
  const user = await getUser()

  const today = getToday()
  const { data: meals } = await supabase
    .from('meals')
    .select('*')
    .eq('user_id', user.id)
    .gte('logged_at', `${today}T00:00:00`)
    .lte('logged_at', `${today}T23:59:59`)
    .order('logged_at', { ascending: false })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Log a meal</h1>
        <p className="text-sm text-gray-500">Text, photo, or voice — AI does the rest</p>
      </div>

      <MealLogForm />

      {meals && meals.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-gray-400">Today&apos;s meals</h2>
          <div className="space-y-2">
            {(meals as Meal[]).map((meal) => (
              <MealCard key={meal.id} meal={meal} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
