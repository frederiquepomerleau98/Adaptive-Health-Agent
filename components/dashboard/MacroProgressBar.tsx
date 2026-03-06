interface MacroProgressBarProps {
  label: string
  current: number
  target: number
  unit: string
  color: string
}

export default function MacroProgressBar({ label, current, target, unit, color }: MacroProgressBarProps) {
  const percentage = target > 0 ? Math.min(Math.round((current / target) * 100), 100) : 0
  const remaining = Math.max(0, target - current)

  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">{label}</span>
        <span className="text-gray-500">
          {current}{unit} / {target}{unit}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-gray-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-xs text-gray-400">
        {remaining > 0 ? `${remaining}${unit} remaining` : 'Target reached!'}
      </p>
    </div>
  )
}
