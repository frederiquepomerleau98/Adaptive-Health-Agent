'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import type { Profile, Goal } from '@/types'

const goalLabels: Record<Goal, string> = {
  weight_loss: 'Lose Weight',
  muscle_gain: 'Build Muscle',
  maintenance: 'Maintain',
}

export default function ProfilePage() {
  const router = useRouter()
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const [calorieTarget, setCalorieTarget] = useState('')
  const [proteinTarget, setProteinTarget] = useState('')
  const [carbsTarget, setCarbsTarget] = useState('')
  const [fatTarget, setFatTarget] = useState('')

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const supabase = createClient()
        const user = await getClientUser()

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (data) {
          const p = data as Profile
          setProfile(p)
          setCalorieTarget(String(p.calorie_target ?? ''))
          setProteinTarget(String(p.protein_target_g ?? ''))
          setCarbsTarget(String(p.carbs_target_g ?? ''))
          setFatTarget(String(p.fat_target_g ?? ''))
        }
      } catch {
        setError('Failed to load profile')
      } finally {
        setLoading(false)
      }
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const user = await getClientUser()

      const { error } = await supabase
        .from('profiles')
        .update({
          calorie_target: parseInt(calorieTarget) || null,
          protein_target_g: parseInt(proteinTarget) || null,
          carbs_target_g: parseInt(carbsTarget) || null,
          fat_target_g: parseInt(fatTarget) || null,
        })
        .eq('id', user.id)

      if (error) throw error
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  return (
    <div className="animate-fade-in space-y-6">
      <h1 className="text-2xl font-bold text-white">Profile</h1>

      {/* Current goal */}
      {profile?.goal && (
        <Card>
          <p className="mb-1 text-xs font-medium text-gray-500">Current Goal</p>
          <p className="text-lg font-bold text-white">{goalLabels[profile.goal]}</p>
          <div className="mt-1 flex gap-4 text-sm text-gray-500">
            {profile.target_weight_kg && <span>Target: {profile.target_weight_kg} kg</span>}
            {profile.timeline_weeks && <span>{profile.timeline_weeks} weeks</span>}
          </div>
        </Card>
      )}

      {/* Macro targets */}
      <Card>
        <p className="mb-4 text-xs font-medium text-gray-500">Daily Macro Targets</p>
        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-gray-400">Calories (kcal)</label>
            <input
              type="number"
              value={calorieTarget}
              onChange={(e) => setCalorieTarget(e.target.value)}
              className="w-full rounded-xl border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
            />
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="mb-1 block text-xs text-gray-400">Protein (g)</label>
              <input
                type="number"
                value={proteinTarget}
                onChange={(e) => setProteinTarget(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Carbs (g)</label>
              <input
                type="number"
                value={carbsTarget}
                onChange={(e) => setCarbsTarget(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-gray-400">Fat (g)</label>
              <input
                type="number"
                value={fatTarget}
                onChange={(e) => setFatTarget(e.target.value)}
                className="w-full rounded-xl border border-surface-300 bg-surface-100 px-3 py-2 text-sm text-white focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
              />
            </div>
          </div>
        </div>

        {error && (
          <p className="mt-3 rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
        )}

        <Button onClick={handleSave} loading={saving} className="mt-4 w-full">
          Save targets
        </Button>
      </Card>

      {/* Preferences */}
      {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
        <Card>
          <p className="mb-2 text-xs font-medium text-gray-500">Dietary Preferences</p>
          <div className="flex flex-wrap gap-2">
            {profile.dietary_preferences.map((pref) => (
              <span
                key={pref}
                className="rounded-full bg-accent-500/10 px-3 py-1 text-xs font-medium text-accent-400"
              >
                {pref}
              </span>
            ))}
          </div>
        </Card>
      )}

      {profile?.activity_preferences && profile.activity_preferences.length > 0 && (
        <Card>
          <p className="mb-2 text-xs font-medium text-gray-500">Activity Preferences</p>
          <div className="flex flex-wrap gap-2">
            {profile.activity_preferences.map((pref) => (
              <span
                key={pref}
                className="rounded-full bg-violet-500/10 px-3 py-1 text-xs font-medium text-violet-400"
              >
                {pref}
              </span>
            ))}
          </div>
        </Card>
      )}

      <Button variant="danger" onClick={handleSignOut} className="w-full">
        Sign out
      </Button>
    </div>
  )
}
