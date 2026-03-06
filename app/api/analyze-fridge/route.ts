import { NextResponse } from 'next/server'
import { getOpenAI } from '@/lib/openai'
import { createClient } from '@/lib/supabase/server'
import { calculateDailyMacros, getToday } from '@/lib/utils'

export async function POST(request: Request) {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

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
    const ingredients = formData.get('ingredients') as string | null
    const imageFile = formData.get('image') as File | null

    const remaining = {
      calories: Math.max(0, (profile?.calorie_target ?? 2200) - consumed.calories),
      protein: Math.max(0, (profile?.protein_target_g ?? 150) - consumed.protein_g),
      carbs: Math.max(0, (profile?.carbs_target_g ?? 220) - consumed.carbs_g),
      fat: Math.max(0, (profile?.fat_target_g ?? 75) - consumed.fat_g),
    }

    const systemPrompt = `You are a creative chef and nutrition expert.
The user needs to eat approximately: ${remaining.calories} kcal, ${remaining.protein}g protein, ${remaining.carbs}g carbs, ${remaining.fat}g fat more today.
Their dietary preferences: ${(profile?.dietary_preferences ?? []).join(', ') || 'none specified'}.
Their goal: ${profile?.goal ?? 'maintenance'}.

Suggest 2-3 meal ideas using the provided ingredients/photo and return ONLY valid JSON:
{
  "ideas": [
    {
      "name": "Meal name",
      "description": "Brief description",
      "estimated_calories": 450,
      "estimated_protein_g": 35,
      "estimated_carbs_g": 40,
      "estimated_fat_g": 12,
      "ingredients": ["ingredient 1", "ingredient 2"],
      "instructions": ["Step 1", "Step 2"],
      "prep_time_min": 20
    }
  ]
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
            text: ingredients
              ? `Here's a photo of my fridge/ingredients. I also have: ${ingredients}. Suggest meals I can make.`
              : 'Here\'s a photo of my fridge/ingredients. Suggest meals I can make.',
          },
        ],
      })
    } else {
      messages.push({
        role: 'user',
        content: `I have these ingredients: ${ingredients}. Suggest meals I can make.`,
      })
    }

    const openai = getOpenAI()
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages: messages as Parameters<typeof openai.chat.completions.create>[0]['messages'],
      max_tokens: 1500,
      temperature: 0.7,
    })

    const content = completion.choices[0]?.message?.content
    if (!content) throw new Error('No response from AI')

    const jsonMatch = content.match(/\{[\s\S]*\}/)
    if (!jsonMatch) throw new Error('Invalid AI response format')

    const result = JSON.parse(jsonMatch[0])
    return NextResponse.json(result)
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Analysis failed' },
      { status: 500 }
    )
  }
}
