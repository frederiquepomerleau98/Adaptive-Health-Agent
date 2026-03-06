'use client'

import { useState, useEffect } from 'react'
import Card from '@/components/ui/Card'
import type { DailyMacros } from '@/types'

interface AIInsightCardProps {
  consumed: DailyMacros
  targets: DailyMacros
  workoutsDone: number
  caloriesBurned: number
}

export default function AIInsightCard({ consumed, targets, workoutsDone, caloriesBurned }: AIInsightCardProps) {
  const [insight, setInsight] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchInsight() {
      try {
        const response = await fetch('/api/ai-insight', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ consumed, targets, workoutsDone, caloriesBurned }),
        })

        if (!response.ok) throw new Error('Failed')
        const data = await response.json()
        setInsight(data.insight)
      } catch {
        setInsight(getLocalInsight(consumed, targets, workoutsDone))
      } finally {
        setLoading(false)
      }
    }

    fetchInsight()
  }, [consumed, targets, workoutsDone, caloriesBurned])

  return (
    <Card className="border-accent-500/20 bg-accent-500/5">
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-accent-500/10">
          <svg className="h-4 w-4 text-accent-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM18.259 8.715L18 9.75l-.259-1.035a3.375 3.375 0 00-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 002.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 002.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 00-2.455 2.456z" />
          </svg>
        </div>
        <div className="flex-1">
          <p className="mb-1 text-xs font-medium text-accent-400">AI Insight</p>
          {loading ? (
            <div className="space-y-2">
              <div className="h-3 w-3/4 animate-pulse rounded bg-surface-300" />
              <div className="h-3 w-1/2 animate-pulse rounded bg-surface-300" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-gray-300">{insight}</p>
          )}
        </div>
      </div>
    </Card>
  )
}

function getLocalInsight(consumed: DailyMacros, targets: DailyMacros, workoutsDone: number): string {
  const calPercent = targets.calories > 0 ? consumed.calories / targets.calories : 0
  const proteinRemaining = Math.max(0, targets.protein_g - consumed.protein_g)
  const hour = new Date().getHours()

  if (calPercent === 0 && hour < 12) {
    return "Start your day with a protein-rich breakfast to stay on track with your goals."
  }
  if (calPercent < 0.3 && hour > 14) {
    return "You're behind on calories today. Consider a balanced meal to fuel your afternoon."
  }
  if (proteinRemaining > 50) {
    return `You still need ${Math.round(proteinRemaining)}g of protein today. Consider chicken, fish, or a protein shake.`
  }
  if (calPercent > 0.9) {
    return "You're close to your calorie target. If you're still hungry, opt for a low-calorie snack."
  }
  if (workoutsDone === 0 && hour > 10) {
    return "You haven't logged a workout yet today. Even a quick 20-minute session makes a difference."
  }
  return "You're making good progress today. Keep it up!"
}
