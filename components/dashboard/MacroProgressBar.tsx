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
      <div className="mb-1.5 flex items-center justify-between">
        <span className="text-xs font-medium text-gray-400">{label}</span>
        <span className="text-xs text-gray-500">
          {current} / {target}{unit}
        </span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-surface-300">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="mt-1 text-[10px] text-gray-500">
        {remaining > 0 ? `${remaining}${unit} left` : 'Target reached'}
      </p>
    </div>
  )
}
