import { NextRequest, NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import type { DailyMacros } from '@/types'

interface InsightRequest {
  consumed: DailyMacros
  targets: DailyMacros
  workoutsDone: number
  caloriesBurned: number
}

export async function POST(request: NextRequest) {
  try {
    const body: InsightRequest = await request.json()
    const { consumed, targets, workoutsDone, caloriesBurned } = body

    const hour = new Date().getHours()
    const timeOfDay = hour < 12 ? 'morning' : hour < 18 ? 'afternoon' : 'evening'

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: `You are a concise, encouraging health companion. Give ONE short, actionable insight (1-2 sentences max). Be specific and helpful, not generic. No emojis. Sound like a knowledgeable friend, not a robot.`,
        },
        {
          role: 'user',
          content: `Time: ${timeOfDay}
Daily targets: ${targets.calories} kcal, ${targets.protein_g}g protein, ${targets.carbs_g}g carbs, ${targets.fat_g}g fat
Consumed so far: ${consumed.calories} kcal, ${consumed.protein_g}g protein, ${consumed.carbs_g}g carbs, ${consumed.fat_g}g fat
Workouts today: ${workoutsDone} (${caloriesBurned} kcal burned)

What's the single best next action for this person right now?`,
        },
      ],
      max_tokens: 100,
      temperature: 0.7,
    })

    const insight = completion.choices[0]?.message?.content?.trim() ?? 'Keep going — you\'re on track today.'

    return NextResponse.json({ insight })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to generate insight'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
