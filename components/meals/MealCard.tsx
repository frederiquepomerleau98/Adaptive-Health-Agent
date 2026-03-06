import Card from '@/components/ui/Card'
import { formatTime } from '@/lib/utils'
import type { Meal } from '@/types'

interface MealCardProps {
  meal: Meal
}

export default function MealCard({ meal }: MealCardProps) {
  const methodColors: Record<string, string> = {
    photo: 'bg-violet-500/10 text-violet-400',
    voice: 'bg-accent-500/10 text-accent-400',
    text: 'bg-surface-300 text-gray-400',
    menu_scan: 'bg-amber-500/10 text-amber-400',
  }

  return (
    <Card hover>
      <div className="flex items-start gap-4">
        {meal.image_url && (
          <img
            src={meal.image_url}
            alt={meal.description ?? 'Meal photo'}
            className="h-14 w-14 rounded-xl object-cover"
          />
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate text-sm font-medium text-white">
              {meal.description ?? 'Meal'}
            </h3>
            <span className="shrink-0 text-xs text-gray-500">
              {formatTime(meal.logged_at)}
            </span>
          </div>
          <div className="mt-1.5 flex gap-3 text-xs text-gray-500">
            <span className="text-accent-400">{meal.calories ?? 0} kcal</span>
            <span>{meal.protein_g ?? 0}g P</span>
            <span>{meal.carbs_g ?? 0}g C</span>
            <span>{meal.fat_g ?? 0}g F</span>
          </div>
          {meal.log_method && (
            <span className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] font-medium ${methodColors[meal.log_method] ?? 'bg-surface-300 text-gray-400'}`}>
              {meal.log_method}
            </span>
          )}
        </div>
      </div>
    </Card>
  )
}
