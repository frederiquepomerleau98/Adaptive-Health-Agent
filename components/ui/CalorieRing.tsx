'use client'

interface CalorieRingProps {
  consumed: number
  target: number
  size?: number
  className?: string
}

export default function CalorieRing({
  consumed,
  target,
  size = 200,
  className = '',
}: CalorieRingProps) {
  const strokeWidth = 14
  const radius = (size - strokeWidth) / 2
  const circumference = 2 * Math.PI * radius
  const ratio = target > 0 ? consumed / target : 0
  const isOver = ratio > 1
  const displayPercent = Math.min(ratio, 1)
  const overPercent = isOver ? Math.min(ratio - 1, 1) : 0
  const strokeDashoffset = circumference * (1 - displayPercent)
  const overDashoffset = circumference * (1 - overPercent)
  const remaining = Math.max(0, target - consumed)
  const overBy = consumed - target

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} className="-rotate-90">
        {/* Background track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          className="stroke-surface-300/50"
        />
        {/* Main progress arc */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className={`transition-all duration-1000 ease-out ${
            isOver ? 'stroke-amber-500' : 'stroke-accent-500'
          }`}
          style={isOver ? {} : { filter: 'drop-shadow(0 0 6px rgba(6, 182, 212, 0.4))' }}
        />
        {/* Over-goal arc (red overlay) */}
        {isOver && (
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius - strokeWidth - 2}
            fill="none"
            strokeWidth={6}
            strokeLinecap="round"
            strokeDasharray={circumference * ((radius - strokeWidth - 2) / radius)}
            strokeDashoffset={circumference * ((radius - strokeWidth - 2) / radius) * (1 - overPercent)}
            className="stroke-red-500 transition-all duration-1000 ease-out"
            style={{ filter: 'drop-shadow(0 0 8px rgba(239, 68, 68, 0.5))' }}
          />
        )}
      </svg>
      {/* Center text */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl font-bold ${isOver ? 'text-amber-400' : 'text-white'}`}>
          {consumed}
        </span>
        <span className="text-xs text-gray-500">of {target} kcal</span>
        {isOver ? (
          <span className="mt-1 rounded-full bg-red-500/10 px-2 py-0.5 text-[10px] font-medium text-red-400">
            +{overBy} over
          </span>
        ) : (
          <span className="mt-1 text-[10px] text-gray-500">
            {remaining} left
          </span>
        )}
      </div>
    </div>
  )
}
