'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import type { GeneratedWorkout } from '@/types'

const WORKOUT_TYPES = ['Strength', 'Cardio', 'HIIT', 'Flexibility']
const DURATIONS = [15, 30, 45, 60]

export default function WorkoutGenerator() {
  const router = useRouter()
  const [type, setType] = useState('Strength')
  const [duration, setDuration] = useState(30)
  const [prompt, setPrompt] = useState('')
  const [loading, setLoading] = useState(false)
  const [workout, setWorkout] = useState<GeneratedWorkout | null>(null)
  const [error, setError] = useState('')

  const handleGenerate = async () => {
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/generate-workout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ type, duration, prompt }),
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
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Workout type</label>
        <div className="flex flex-wrap gap-2">
          {WORKOUT_TYPES.map((t) => (
            <button
              key={t}
              onClick={() => setType(t)}
              className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                type === t
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">Duration</label>
        <div className="flex gap-2">
          {DURATIONS.map((d) => (
            <button
              key={d}
              onClick={() => setDuration(d)}
              className={`flex-1 rounded-xl py-2 text-sm font-medium transition-colors ${
                duration === d
                  ? 'bg-primary-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {d}min
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Additional notes (optional)
        </label>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g. Focus on upper body, no equipment needed"
          rows={2}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {!workout ? (
        <Button onClick={handleGenerate} loading={loading} className="w-full" size="lg">
          Generate workout
        </Button>
      ) : (
        <div className="space-y-3">
          <Card className="border-primary-200 bg-primary-50">
            <h3 className="mb-1 font-bold text-primary-800">{workout.name}</h3>
            <p className="mb-3 text-xs text-primary-600">
              {workout.duration_min} min &middot; ~{workout.estimated_calories} kcal
            </p>
            <div className="space-y-2">
              {workout.exercises.map((exercise, i) => (
                <div key={i} className="rounded-xl bg-white p-3">
                  <p className="font-medium text-sm">{exercise.name}</p>
                  <p className="text-xs text-gray-500">
                    {exercise.sets} sets x {exercise.reps} reps &middot; {exercise.rest_seconds}s rest
                  </p>
                  {exercise.notes && (
                    <p className="mt-1 text-xs text-gray-400">{exercise.notes}</p>
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
