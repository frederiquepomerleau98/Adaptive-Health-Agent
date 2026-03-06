'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import BottomNav from '@/components/BottomNav'
import type { Profile, Goal } from '@/types'

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
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

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
      setLoading(false)
    }
    loadProfile()
  }, [])

  const handleSave = async () => {
    setSaving(true)
    setError('')

    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Not authenticated')

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

  const goalLabels: Record<Goal, string> = {
    weight_loss: 'Lose Weight',
    muscle_gain: 'Build Muscle',
    maintenance: 'Maintain',
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Profile</h1>

      <div className="space-y-4">
        {profile?.goal && (
          <Card>
            <h2 className="mb-2 text-sm font-medium text-gray-500">Current Goal</h2>
            <p className="text-lg font-bold">{goalLabels[profile.goal]}</p>
            {profile.target_weight_kg && (
              <p className="text-sm text-gray-500">Target: {profile.target_weight_kg} kg</p>
            )}
            {profile.timeline_weeks && (
              <p className="text-sm text-gray-500">{profile.timeline_weeks} week timeline</p>
            )}
          </Card>
        )}

        <Card>
          <h2 className="mb-4 text-sm font-medium text-gray-500">Daily Macro Targets</h2>
          <div className="space-y-3">
            <div>
              <label className="mb-1 block text-xs font-medium text-gray-600">Calories (kcal)</label>
              <input
                type="number"
                value={calorieTarget}
                onChange={(e) => setCalorieTarget(e.target.value)}
                className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              />
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Protein (g)</label>
                <input
                  type="number"
                  value={proteinTarget}
                  onChange={(e) => setProteinTarget(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Carbs (g)</label>
                <input
                  type="number"
                  value={carbsTarget}
                  onChange={(e) => setCarbsTarget(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-gray-600">Fat (g)</label>
                <input
                  type="number"
                  value={fatTarget}
                  onChange={(e) => setFatTarget(e.target.value)}
                  className="w-full rounded-xl border border-gray-300 px-3 py-2 text-sm focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                />
              </div>
            </div>
          </div>

          {error && (
            <p className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
          )}

          <Button onClick={handleSave} loading={saving} className="mt-4 w-full">
            Save targets
          </Button>
        </Card>

        {profile?.dietary_preferences && profile.dietary_preferences.length > 0 && (
          <Card>
            <h2 className="mb-2 text-sm font-medium text-gray-500">Dietary Preferences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.dietary_preferences.map((pref) => (
                <span
                  key={pref}
                  className="rounded-full bg-green-50 px-3 py-1 text-sm text-green-700"
                >
                  {pref}
                </span>
              ))}
            </div>
          </Card>
        )}

        {profile?.activity_preferences && profile.activity_preferences.length > 0 && (
          <Card>
            <h2 className="mb-2 text-sm font-medium text-gray-500">Activity Preferences</h2>
            <div className="flex flex-wrap gap-2">
              {profile.activity_preferences.map((pref) => (
                <span
                  key={pref}
                  className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700"
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

      <BottomNav />
    </div>
  )
}
