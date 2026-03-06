export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { calculateDailyNutrition, getToday } from '@/lib/utils'
import CalorieRing from '@/components/ui/CalorieRing'
import ArcGauge from '@/components/ui/ArcGauge'
import MiniMetric from '@/components/ui/MiniMetric'
import MovementCard from '@/components/dashboard/MovementCard'
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

  const nutrition = calculateDailyNutrition(meals ?? [])
  const targets: DailyMacros = {
    calories: profile?.calorie_target ?? 2200,
    protein_g: profile?.protein_target_g ?? 150,
    carbs_g: profile?.carbs_target_g ?? 220,
    fat_g: profile?.fat_target_g ?? 75,
  }
  const fiberTarget = profile?.fiber_target_g ?? 30
  const hydrationTarget = profile?.hydration_target_ml ?? 2500
  const stepsTarget = profile?.steps_target ?? 8000

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
        consumed={targets}
        targets={targets}
        workoutsDone={(workouts ?? []).length}
        caloriesBurned={totalCaloriesBurned}
      />

      {/* ═══════════════════════════════════════════
          HERO TRACKER — Primary Metrics
          ═══════════════════════════════════════════ */}
      <Card className="overflow-hidden">
        <p className="mb-4 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Today&apos;s Nutrition
        </p>

        {/* Calorie Ring + Primary Arc Gauges */}
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:justify-around">
          {/* Central calorie ring */}
          <CalorieRing
            consumed={nutrition.calories}
            target={targets.calories}
            size={180}
          />

          {/* Primary metric arcs: Protein, Fiber, Hydration */}
          <div className="flex gap-4 sm:flex-col sm:gap-3">
            <ArcGauge
              value={nutrition.protein_g}
              max={targets.protein_g}
              label="Protein"
              unit="g"
              color="stroke-violet-500"
              glowColor="rgba(139, 92, 246, 0.3)"
              size={90}
            />
            <ArcGauge
              value={nutrition.fiber_g}
              max={fiberTarget}
              label="Fiber"
              unit="g"
              color="stroke-emerald-500"
              glowColor="rgba(16, 185, 129, 0.3)"
              size={90}
            />
            <ArcGauge
              value={nutrition.hydration_ml > 0 ? Math.round(nutrition.hydration_ml / 100) : 0}
              max={Math.round(hydrationTarget / 100)}
              label="Hydration"
              unit="dl"
              color="stroke-sky-500"
              glowColor="rgba(14, 165, 233, 0.3)"
              size={90}
            />
          </div>
        </div>
      </Card>

      {/* ═══════════════════════════════════════════
          SECONDARY NUTRITION — Compact Grid
          ═══════════════════════════════════════════ */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Nutrition Details
        </p>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5">
          <MiniMetric
            label="Carbs"
            value={Math.round(nutrition.carbs_g)}
            target={Math.round(targets.carbs_g)}
            unit="g"
            color="text-amber-400"
          />
          <MiniMetric
            label="Fat"
            value={Math.round(nutrition.fat_g)}
            target={Math.round(targets.fat_g)}
            unit="g"
            color="text-rose-400"
          />
          <MiniMetric
            label="Omega-3"
            value="—"
            unit=""
            color="text-sky-400"
          />
          <MiniMetric
            label="Electrolytes"
            value="—"
            unit=""
            color="text-teal-400"
          />
          <MiniMetric
            label="Vitamins"
            value="—"
            unit=""
            color="text-purple-400"
          />
        </div>
      </div>

      {/* ═══════════════════════════════════════════
          MOVEMENT & FITNESS
          ═══════════════════════════════════════════ */}
      <MovementCard
        steps={nutrition.steps}
        stepsTarget={stepsTarget}
        workoutsDone={(workouts ?? []).length}
        caloriesBurned={totalCaloriesBurned}
      />

      {/* Quick Actions */}
      <div>
        <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
          Quick Actions
        </p>
        <QuickActions />
      </div>

      {/* Recent meals */}
      {recentMeals.length > 0 && (
        <div>
          <p className="mb-2 text-[10px] font-medium uppercase tracking-wider text-gray-500">
            Recent Meals
          </p>
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
                      {meal.fiber_g ? ` · ${Math.round(meal.fiber_g)}g fiber` : ''}
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
