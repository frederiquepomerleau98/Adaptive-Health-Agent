import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { createServiceClient } from '@/lib/supabase/server'
import { getUser } from '@/lib/auth'
import { calculateDailyMacros, getToday } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const supabase = createServiceClient()
    const user = await getUser()

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    const today = getToday()
    const { data: todayMeals } = await supabase
      .from('meals')
      .select('*')
      .eq('user_id', user.id)
      .gte('logged_at', `${today}T00:00:00`)
      .lte('logged_at', `${today}T23:59:59`)

    const consumed = calculateDailyMacros(todayMeals ?? [])

    const formData = await request.formData()
    const description = formData.get('description') as string | null
    const imageFile = formData.get('image') as File | null

    const systemPrompt = `You are a nutrition expert analyzing food for a health tracking app.
The user's daily targets are: ${profile?.calorie_target ?? 2200} kcal, ${profile?.protein_target_g ?? 150}g protein, ${profile?.carbs_target_g ?? 220}g carbs, ${profile?.fat_target_g ?? 75}g fat.
They have consumed so far today: ${consumed.calories} kcal, ${consumed.protein_g}g protein, ${consumed.carbs_g}g carbs, ${consumed.fat_g}g fat.
Their dietary preferences: ${(profile?.dietary_preferences ?? []).join(', ') || 'none specified'}.

Analyze the provided food image or description and return ONLY valid JSON in this format:
{
  "description": "Brief dish name",
  "calories": 450,
  "protein_g": 35,
  "carbs_g": 40,
  "fat_g": 12,
  "fiber_g": 5,
  "confidence": "high|medium|low",
  "notes": "Optional note about estimation uncertainty"
}`

    const messages: Array<{ role: 'system' | 'user'; content: string | Array<{ type: string; text?: string; image_url?: { url: string } }> }> = [
      { role: 'system', content: systemPrompt },
    ]

    if (imageFile) {
      const bytes = await imageFile.arrayBuffer()
      const base64 = Buffer.from(bytes).toString('base64')
      const mimeType = imageFile.type || 'image/jpeg'

      messages.push({
        role: 'user',
        content: [
          {
            type: 'image_url',
            image_url: { url: `data:${mimeType};base64,${base64}` },
          },
          {
            type: 'text',
            text: description
              ? `The user describes this meal as: "${description}". Analyze the image and description.`
              : 'Analyze this meal image and estimate the macros.',
          },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: `Analyze this meal: "${description}"`,
      })
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
      max_tokens: 500,
      temperature: 0.3,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const analysis = JSON.parse(jsonMatch[0])
    return NextResponse.json(analysis)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
