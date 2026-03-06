import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const user = await getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const { prompt, duration, type } = await request.json()

    const systemPrompt = `You are a certified personal trainer creating workout plans.
The user's goal is: ${profile?.goal ?? 'maintenance'}.
Their activity preferences: ${(profile?.activity_preferences ?? []).join(', ') || 'general fitness'}.

Generate a workout and return ONLY valid JSON:
{
  "name": "Workout name",
  "type": "strength|cardio|flexibility|hiit",
  "duration_min": 30,
  "estimated_calories": 250,
  "exercises": [
    {
      "name": "Exercise name",
      "sets": 3,
      "reps": "12",
      "rest_seconds": 60,
      "notes": "Optional form tip"
    }
  ]
}`

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'user',
          content: prompt
            ? prompt
            : `Create a ${duration ?? 30}-minute ${type ?? 'strength'} workout.`,
        },
      ],
      max_tokens: 1000,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const workout = JSON.parse(jsonMatch[0])
    return NextResponse.json(workout)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Workout generation failed' },
      { status: 500 }
    )
  }
}
