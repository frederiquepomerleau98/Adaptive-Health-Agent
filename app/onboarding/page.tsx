'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import VoiceInput from '@/components/ui/VoiceInput'
import type { Goal } from '@/types'

const GOALS: { value: Goal; label: string; description: string }[] = [
  { value: 'weight_loss', label: 'Lose Weight', description: 'Reduce body fat while preserving muscle' },
  { value: 'muscle_gain', label: 'Build Muscle', description: 'Gain lean mass with a caloric surplus' },
  { value: 'maintenance', label: 'Maintain', description: 'Stay at your current weight and composition' },
]

const DIETARY_OPTIONS = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Keto', 'Paleo', 'No restrictions']
const ACTIVITY_OPTIONS = ['Running', 'Weight training', 'Yoga', 'Cycling', 'Swimming', 'Walking', 'HIIT', 'Pilates']

const DEFAULT_TARGETS: Record<Goal, { calories: number; protein: number; carbs: number; fat: number }> = {
  weight_loss: { calories: 1800, protein: 140, carbs: 150, fat: 65 },
  muscle_gain: { calories: 2800, protein: 180, carbs: 300, fat: 80 },
  maintenance: { calories: 2200, protein: 150, carbs: 220, fat: 75 },
}

export default function OnboardingPage() {
  const router = useRouter()
  const [step, setStep] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [goal, setGoal] = useState<Goal | null>(null)
  const [targetWeight, setTargetWeight] = useState('')
  const [timelineWeeks, setTimelineWeeks] = useState('12')
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [activityPrefs, setActivityPrefs] = useState<string[]>([])
  const [additionalNotes, setAdditionalNotes] = useState('')

  const togglePref = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const handleVoiceTranscription = (text: string) => {
    setAdditionalNotes(text)
  }

  const handleFinish = async () => {
    if (!goal) return
    setLoading(true)

    try {
      const supabase = createClient()
      const user = await getClientUser()
      const targets = DEFAULT_TARGETS[goal]

      const { error: dbError } = await supabase
        .from('profiles')
        .update({
          goal,
          target_weight_kg: targetWeight ? parseFloat(targetWeight) : null,
          timeline_weeks: parseInt(timelineWeeks) || 12,
          dietary_preferences: dietaryPrefs,
          activity_preferences: activityPrefs,
          calorie_target: targets.calories,
          protein_target_g: targets.protein,
          carbs_target_g: targets.carbs,
          fat_target_g: targets.fat,
        })
        .eq('id', user.id)

      if (dbError) throw dbError
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  const stepTitles = [
    "What's your goal?",
    'A few details',
    'Dietary preferences',
    'What do you enjoy?',
    'Anything else?',
  ]

  return (
    <div className="mx-auto flex min-h-screen max-w-lg flex-col px-6 py-12">
      {/* Progress */}
      <div className="mb-8">
        <div className="mb-4 flex gap-1.5">
          {stepTitles.map((_, i) => (
            <div
              key={i}
              className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                i <= step ? 'bg-accent-500' : 'bg-surface-300'
              }`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold text-white">{stepTitles[step]}</h1>
        <p className="mt-1 text-sm text-gray-500">
          {step === 0 && 'This helps us personalize your experience'}
          {step === 1 && 'Optional — helps calibrate your targets'}
          {step === 2 && 'Select all that apply'}
          {step === 3 && "We'll tailor workout suggestions"}
          {step === 4 && 'Use voice or text to tell us more about you'}
        </p>
      </div>

      {step === 0 && (
        <div className="flex-1 space-y-3">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`w-full rounded-2xl border p-4 text-left transition-all ${
                goal === g.value
                  ? 'border-accent-500 bg-accent-500/5'
                  : 'border-surface-300 hover:border-surface-400'
              }`}
            >
              <p className="font-semibold text-white">{g.label}</p>
              <p className="text-sm text-gray-500">{g.description}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Target weight (kg) — optional
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="e.g. 75"
              className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-300">
              Timeline (weeks)
            </label>
            <input
              type="number"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="12"
              className="w-full rounded-xl border border-surface-300 bg-surface-100 px-4 py-2.5 text-sm text-white placeholder-gray-500 focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {DIETARY_OPTIONS.map((pref) => (
              <button
                key={pref}
                onClick={() => togglePref(dietaryPrefs, pref, setDietaryPrefs)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  dietaryPrefs.includes(pref)
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface-200 text-gray-400 hover:bg-surface-300 hover:text-white'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="flex-1">
          <div className="flex flex-wrap gap-2">
            {ACTIVITY_OPTIONS.map((pref) => (
              <button
                key={pref}
                onClick={() => togglePref(activityPrefs, pref, setActivityPrefs)}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-all ${
                  activityPrefs.includes(pref)
                    ? 'bg-accent-500 text-white'
                    : 'bg-surface-200 text-gray-400 hover:bg-surface-300 hover:text-white'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      {step === 4 && (
        <div className="flex-1 space-y-4">
          <div className="relative">
            <textarea
              value={additionalNotes}
              onChange={(e) => setAdditionalNotes(e.target.value)}
              placeholder="Tell us about your schedule, equipment, injuries, preferences... anything that helps us help you better."
              rows={5}
              className="w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 pr-14 text-sm text-white placeholder-gray-500 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput onTranscription={handleVoiceTranscription} />
            </div>
          </div>
          <p className="text-xs text-gray-500">
            This is optional but helps the AI give you better recommendations.
          </p>
        </div>
      )}

      {error && (
        <p className="mt-4 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < 4 ? (
          <Button
            onClick={() => setStep(step + 1)}
            disabled={step === 0 && !goal}
            className="flex-1"
          >
            Continue
          </Button>
        ) : (
          <Button onClick={handleFinish} loading={loading} className="flex-1">
            Get started
          </Button>
        )}
      </div>
    </div>
  )
}
