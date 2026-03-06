import Card from '@/components/ui/Card'

interface MovementCardProps {
  steps: number
  stepsTarget: number
  workoutsDone: number
  caloriesBurned: number
}

export default function MovementCard({
  steps,
  stepsTarget,
  workoutsDone,
  caloriesBurned,
}: MovementCardProps) {
  const stepsRatio = stepsTarget > 0 ? Math.min(steps / stepsTarget, 1) : 0
  const ringSize = 56
  const strokeWidth = 5
  const radius = (ringSize - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const dashOffset = circumference * (1 - stepsRatio)

  return (
    <Card>
      <p className="mb-3 text-[10px] font-medium uppercase tracking-wider text-gray-500">Movement</p>
      <div className="flex items-center gap-4">
        {/* Steps mini ring */}
        <div className="relative shrink-0">
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              className="stroke-surface-300/40"
            />
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={radius}
              fill="none"
              strokeWidth={strokeWidth}
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={dashOffset}
              className="stroke-emerald-500 transition-all duration-700 ease-out"
              style={{ filter: 'drop-shadow(0 0 3px rgba(16, 185, 129, 0.3))' }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <svg className="h-4 w-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.362 5.214A8.252 8.252 0 0112 21 8.25 8.25 0 016.038 7.048 8.287 8.287 0 009 9.6a8.983 8.983 0 013.361-6.867 8.21 8.21 0 003 2.48z" />
            </svg>
          </div>
        </div>

        {/* Stats */}
        <div className="flex-1 space-y-1">
          <div className="flex items-baseline gap-1">
            <span className="text-base font-bold text-white">
              {steps > 0 ? steps.toLocaleString() : '—'}
            </span>
            <span className="text-[10px] text-gray-500">
              / {stepsTarget.toLocaleString()} steps
            </span>
          </div>
          <div className="flex items-center gap-3 text-xs text-gray-500">
            {workoutsDone > 0 ? (
              <>
                <span className="flex items-center gap-1">
                  <span className="h-1.5 w-1.5 rounded-full bg-accent-500" />
                  {workoutsDone} workout{workoutsDone !== 1 ? 's' : ''}
                </span>
                <span>{caloriesBurned} kcal burned</span>
              </>
            ) : (
              <span className="text-gray-600">No workouts yet today</span>
            )}
          </div>
        </div>
      </div>
    </Card>
  )
}
