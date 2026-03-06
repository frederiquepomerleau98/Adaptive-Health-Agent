'use client'

interface MiniMetricProps {
  label: string
  value: number | string
  target?: number | string
  unit?: string
  color?: string
  icon?: React.ReactNode
  className?: string
}

export default function MiniMetric({
  label,
  value,
  target,
  unit = '',
  color = 'text-gray-300',
  icon,
  className = '',
}: MiniMetricProps) {
  const numValue = typeof value === 'number' ? value : parseFloat(value) || 0
  const numTarget = typeof target === 'number' ? target : parseFloat(target ?? '0') || 0
  const ratio = numTarget > 0 ? Math.min(numValue / numTarget, 1) : 0

  return (
    <div className={`glass-card p-3 ${className}`}>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          {icon && <span className={`${color} opacity-60`}>{icon}</span>}
          <span className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">{label}</span>
        </div>
      </div>
      <div className="flex items-baseline gap-1">
        <span className={`text-base font-bold ${color}`}>{value}</span>
        {target && (
          <span className="text-[10px] text-gray-600">/ {target}{unit}</span>
        )}
        {!target && unit && (
          <span className="text-[10px] text-gray-600">{unit}</span>
        )}
      </div>
      {numTarget > 0 && (
        <div className="mt-2 h-1 overflow-hidden rounded-full bg-surface-300/50">
          <div
            className={`h-full rounded-full transition-all duration-700 ease-out ${
              color.replace('text-', 'bg-')
            }`}
            style={{ width: `${ratio * 100}%` }}
          />
        </div>
      )}
    </div>
  )
}
