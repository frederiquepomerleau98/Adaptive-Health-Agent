import Card from '@/components/ui/Card'
import { formatTime } from '@/lib/utils'
import type { Workout } from '@/types'

interface WorkoutCardProps {
  workout: Workout
}

export default function WorkoutCard({ workout }: WorkoutCardProps) {
  return (
    <Card hover>
      <div className="flex items-start justify-between">
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-medium text-white">{workout.type ?? 'Workout'}</h3>
          <div className="mt-1 flex gap-3 text-xs text-gray-500">
            {workout.duration_min && <span>{workout.duration_min} min</span>}
            {workout.calories_burned && (
              <span className="text-accent-400">{workout.calories_burned} kcal</span>
            )}
          </div>
          {workout.muscle_groups.length > 0 && (
            <div className="mt-2 flex flex-wrap gap-1">
              {workout.muscle_groups.map((group) => (
                <span
                  key={group}
                  className="rounded-full bg-violet-500/10 px-2 py-0.5 text-[10px] font-medium text-violet-400"
                >
                  {group}
                </span>
              ))}
            </div>
          )}
          {workout.notes && (
            <p className="mt-2 truncate text-xs text-gray-500">{workout.notes}</p>
          )}
        </div>
        <span className="shrink-0 text-xs text-gray-500">{formatTime(workout.performed_at)}</span>
      </div>
    </Card>
  )
}
