import { createClient } from '@/lib/supabase/server'
import { getToday } from '@/lib/utils'
import WorkoutGenerator from '@/components/activity/WorkoutGenerator'
import WorkoutCard from '@/components/activity/WorkoutCard'
import BottomNav from '@/components/BottomNav'
import type { Workout } from '@/types'

export default async function ActivityPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return null

  const today = getToday()
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('performed_at', `${today}T00:00:00`)
    .lte('performed_at', `${today}T23:59:59`)
    .order('performed_at', { ascending: false })

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Activity</h1>

      <WorkoutGenerator />

      {workouts && workouts.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-3 text-lg font-semibold">Today&apos;s workouts</h2>
          <div className="space-y-3">
            {(workouts as Workout[]).map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
      )}

      <BottomNav />
    </div>
  )
}
