import Card from '@/components/ui/Card'
import MacroProgressBar from './MacroProgressBar'
import type { DailyMacros } from '@/types'

interface DailyStatsProps {
  consumed: DailyMacros
  targets: DailyMacros
}

export default function DailyStats({ consumed, targets }: DailyStatsProps) {
  return (
    <Card>
      <h2 className="mb-4 text-lg font-semibold">Today&apos;s Progress</h2>
      <div className="space-y-4">
        <MacroProgressBar
          label="Calories"
          current={consumed.calories}
          target={targets.calories}
          unit=" kcal"
          color="bg-primary-500"
        />
        <MacroProgressBar
          label="Protein"
          current={Math.round(consumed.protein_g)}
          target={Math.round(targets.protein_g)}
          unit="g"
          color="bg-blue-500"
        />
        <MacroProgressBar
          label="Carbs"
          current={Math.round(consumed.carbs_g)}
          target={Math.round(targets.carbs_g)}
          unit="g"
          color="bg-amber-500"
        />
        <MacroProgressBar
          label="Fat"
          current={Math.round(consumed.fat_g)}
          target={Math.round(targets.fat_g)}
          unit="g"
          color="bg-rose-500"
        />
      </div>
    </Card>
  )
}
