export const dynamic = 'force-dynamic'

import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { getToday } from '@/lib/utils'
import WorkoutGenerator from '@/components/activity/WorkoutGenerator'
import WorkoutCard from '@/components/activity/WorkoutCard'
import type { Workout } from '@/types'

export default async function ActivityPage() {
  const supabase = createServiceClient()
  const user = await getUser()

  const today = getToday()
  const { data: workouts } = await supabase
    .from('workouts')
    .select('*')
    .eq('user_id', user.id)
    .gte('performed_at', `${today}T00:00:00`)
    .lte('performed_at', `${today}T23:59:59`)
    .order('performed_at', { ascending: false })

  return (
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Activity</h1>
        <p className="text-sm text-gray-500">Tell the AI what you need — it builds the workout</p>
      </div>

      <WorkoutGenerator />

      {workouts && workouts.length > 0 && (
        <div>
          <h2 className="mb-3 text-sm font-medium text-gray-400">Today&apos;s workouts</h2>
          <div className="space-y-2">
            {(workouts as Workout[]).map((workout) => (
              <WorkoutCard key={workout.id} workout={workout} />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
