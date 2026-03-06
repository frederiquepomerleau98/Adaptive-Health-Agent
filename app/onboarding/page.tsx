'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
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
  const [goal, setGoal] = useState<Goal | null>(null)
  const [targetWeight, setTargetWeight] = useState('')
  const [timelineWeeks, setTimelineWeeks] = useState('12')
  const [dietaryPrefs, setDietaryPrefs] = useState<string[]>([])
  const [activityPrefs, setActivityPrefs] = useState<string[]>([])

  const togglePref = (list: string[], item: string, setter: (v: string[]) => void) => {
    setter(list.includes(item) ? list.filter((i) => i !== item) : [...list, item])
  }

  const handleFinish = async () => {
    if (!goal) return
    setLoading(true)

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

      const targets = DEFAULT_TARGETS[goal]

      const { error } = await supabase
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

      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-12">
      <div className="mb-8">
        <div className="mb-4 flex gap-2">
          {[0, 1, 2, 3].map((i) => (
            <div
              key={i}
              className={`h-1.5 flex-1 rounded-full ${i <= step ? 'bg-primary-600' : 'bg-gray-200'}`}
            />
          ))}
        </div>
        <h1 className="text-2xl font-bold">
          {step === 0 && "What's your goal?"}
          {step === 1 && 'Target details'}
          {step === 2 && 'Dietary preferences'}
          {step === 3 && 'Favorite activities'}
        </h1>
      </div>

      {step === 0 && (
        <div className="flex-1 space-y-3">
          {GOALS.map((g) => (
            <button
              key={g.value}
              onClick={() => setGoal(g.value)}
              className={`w-full rounded-2xl border-2 p-4 text-left transition-colors ${
                goal === g.value
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
            >
              <p className="font-semibold">{g.label}</p>
              <p className="text-sm text-gray-500">{g.description}</p>
            </button>
          ))}
        </div>
      )}

      {step === 1 && (
        <div className="flex-1 space-y-6">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Target weight (kg) — optional
            </label>
            <input
              type="number"
              value={targetWeight}
              onChange={(e) => setTargetWeight(e.target.value)}
              placeholder="e.g. 75"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Timeline (weeks)
            </label>
            <input
              type="number"
              value={timelineWeeks}
              onChange={(e) => setTimelineWeeks(e.target.value)}
              placeholder="12"
              className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  dietaryPrefs.includes(pref)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
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
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${
                  activityPrefs.includes(pref)
                    ? 'bg-primary-600 text-white'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {pref}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8 flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} className="flex-1">
            Back
          </Button>
        )}
        {step < 3 ? (
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
