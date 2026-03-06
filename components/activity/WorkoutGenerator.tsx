'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import VoiceInput from '@/components/ui/VoiceInput'
import type { GeneratedWorkout } from '@/types'

export default function WorkoutGenerator() {
  const router = useRouter()
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [error, setError] = useState('')

  const handleVoiceTranscription = (text: string) => {
    setPrompt(text)
  }

  const handleGenerate = async () => {
    if (!prompt.trim()) return
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) throw new Error('Failed to generate workout')

      const data: GeneratedWorkout = await response.json()
      setWorkout(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Generation failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!workout) return
    setLoading(true)

    try {
      const supabase = createClient()
      const user = await getClientUser()

      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        source: 'ai_generated',
        type: workout.type,
        duration_min: workout.duration_min,
        calories_burned: workout.estimated_calories,
        notes: workout.exercises.map((e) => `${e.name}: ${e.sets}x${e.reps}`).join(', '),
      })

      if (error) throw error
      router.refresh()
      setWorkout(null)
      setPrompt('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  const suggestions = [
    'I want a quick glutes workout',
    'Upper body, 30 minutes, dumbbells only',
    'Low energy day, light cardio',
    'Full body HIIT, 20 minutes',
  ]

  return (
    <div className="space-y-4">
      {!workout ? (
        <>
          <div className="relative">
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Tell me what you want... e.g. 'glutes today, I have 25 min and dumbbells'"
              rows={3}
              className="w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 pr-14 text-sm text-white placeholder-gray-500 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput onTranscription={handleVoiceTranscription} />
            </div>
          </div>

          {!prompt && (
            <div className="flex flex-wrap gap-2">
              {suggestions.map((s) => (
                <button
                  key={s}
                  onClick={() => setPrompt(s)}
                  className="rounded-full bg-surface-200 px-3 py-1.5 text-xs text-gray-400 transition-colors hover:bg-surface-300 hover:text-white"
                >
                  {s}
                </button>
              ))}
            </div>
          )}

          {error && (
            <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
          )}

          <Button
            onClick={handleGenerate}
            loading={loading}
            disabled={!prompt.trim()}
            className="w-full"
            size="lg"
          >
            Generate workout
          </Button>
        </>
      ) : (
        <div className="animate-slide-up space-y-4">
          <Card className="border-accent-500/20 bg-accent-500/5">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-bold text-white">{workout.name}</h3>
              <span className="text-xs text-gray-500">
                {workout.duration_min} min &middot; ~{workout.estimated_calories} kcal
              </span>
            </div>
            <div className="space-y-2">
              {workout.exercises.map((exercise, i) => (
                <div key={i} className="rounded-xl bg-surface-100 p-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-white">{exercise.name}</p>
                    <p className="text-xs text-gray-500">{exercise.rest_seconds}s rest</p>
                  </div>
                  <p className="mt-0.5 text-xs text-gray-400">
                    {exercise.sets} sets x {exercise.reps}
                  </p>
                  {exercise.notes && (
                    <p className="mt-1 text-xs text-gray-500">{exercise.notes}</p>
                  )}
                </div>
              ))}
            </div>
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setWorkout(null)} className="flex-1">
              Regenerate
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              Save workout
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
