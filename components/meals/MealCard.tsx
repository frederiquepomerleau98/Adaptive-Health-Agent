import Card from '@/components/ui/Card'
import { formatTime } from '@/lib/utils'
import type { Meal } from '@/types'

interface MealCardProps {
  meal: Meal
}

export default function MealCard({ meal }: MealCardProps) {
  return (
    <Card className="flex items-start gap-4">
      {meal.image_url && (
        <img
          src={meal.image_url}
          alt={meal.description ?? 'Meal photo'}
          className="h-16 w-16 rounded-xl object-cover"
        />
      )}
      <div className="flex-1">
        <div className="flex items-start justify-between">
          <h3 className="font-medium">{meal.description ?? 'Meal'}</h3>
          <span className="text-xs text-gray-400">{formatTime(meal.logged_at)}</span>
        </div>
        <div className="mt-1 flex gap-3 text-xs text-gray-500">
          <span>{meal.calories ?? 0} kcal</span>
          <span>{meal.protein_g ?? 0}g P</span>
          <span>{meal.carbs_g ?? 0}g C</span>
          <span>{meal.fat_g ?? 0}g F</span>
        </div>
        {meal.log_method && (
          <span className="mt-2 inline-block rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-500">
            {meal.log_method}
          </span>
        )}
      </div>
    </Card>
  )
}
