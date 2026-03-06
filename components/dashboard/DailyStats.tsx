import Card from '@/components/ui/Card'
import ProgressRing from '@/components/ui/ProgressRing'
import MacroProgressBar from './MacroProgressBar'
import type { DailyMacros } from '@/types'

interface DailyStatsProps {
  consumed: DailyMacros
  targets: DailyMacros
}

export default function DailyStats({ consumed, targets }: DailyStatsProps) {
  return (
    <Card>
      <div className="flex items-center justify-between">
        {/* Main calorie ring */}
        <ProgressRing
          value={consumed.calories}
          max={targets.calories}
          size={130}
          strokeWidth={10}
          color="stroke-accent-500"
          unit="kcal"
        />

        {/* Macro bars */}
        <div className="flex-1 space-y-3 pl-6">
          <MacroProgressBar
            label="Protein"
            current={Math.round(consumed.protein_g)}
            target={Math.round(targets.protein_g)}
            unit="g"
            color="bg-violet-500"
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
      </div>
    </Card>
  )
}
