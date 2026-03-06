'use client'

interface ArcGaugeProps {
  value: number
  max: number
  label: string
  unit?: string
  color: string
  glowColor?: string
  size?: number
  className?: string
}

export default function ArcGauge({
  value,
  max,
  label,
  unit = 'g',
  color,
  glowColor,
  size = 100,
  className = '',
}: ArcGaugeProps) {
  const strokeWidth = 8
  const radius = (size - strokeWidth) / 2
  // 270 degree arc (3/4 of circle), open at the bottom
  const arcLength = (3 / 4) * 2 * Math.PI * radius
  const ratio = max > 0 ? Math.min(value / max, 1) : 0
  const dashOffset = arcLength * (1 - ratio)
  const remaining = Math.max(0, max - value)

  // Rotate so the gap is at the bottom center
  // Arc starts at -225deg and spans 270deg
  const startAngle = 135

  return (
    <div className={`relative inline-flex flex-col items-center ${className}`}>
      <svg width={size} height={size} style={{ transform: `rotate(${startAngle}deg)` }}>
        {/* Track */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${2 * Math.PI * radius - arcLength}`}
          className="stroke-surface-300/40"
        />
        {/* Progress */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${arcLength} ${2 * Math.PI * radius - arcLength}`}
          strokeDashoffset={dashOffset}
          className={`${color} transition-all duration-700 ease-out`}
          style={glowColor ? { filter: `drop-shadow(0 0 4px ${glowColor})` } : {}}
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center pt-1">
        <span className="text-lg font-bold text-white">{Math.round(value)}</span>
        <span className="text-[9px] text-gray-500">{unit}</span>
      </div>
      <div className="-mt-2 text-center">
        <p className="text-[11px] font-medium text-gray-300">{label}</p>
        <p className="text-[9px] text-gray-500">
          {remaining > 0 ? `${Math.round(remaining)}${unit} left` : 'Goal hit'}
        </p>
      </div>
    </div>
  )
}
