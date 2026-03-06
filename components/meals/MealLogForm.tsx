'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import type { MealAnalysis } from '@/types'

export default function MealLogForm() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [error, setError] = useState('')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleAnalyze = async () => {
    if (!description && !imageFile) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      if (description) formData.append('description', description)
      if (imageFile) formData.append('image', imageFile)

      const response = await fetch('/api/analyze-meal', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to analyze meal')

      const data: MealAnalysis = await response.json()
      setAnalysis(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!analysis) return
    setLoading(true)

    try {
      const supabase = createClient()
      const user = await getClientUser()

      let imageUrl: string | null = null
      if (imageFile) {
        const ext = imageFile.name.split('.').pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error: uploadError } = await supabase.storage
          .from('meal-photos')
          .upload(fileName, imageFile)

        if (!uploadError) {
          const { data: urlData } = supabase.storage
            .from('meal-photos')
            .getPublicUrl(fileName)
          imageUrl = urlData.publicUrl
        }
      }

      const { error } = await supabase.from('meals').insert({
        user_id: user.id,
        description: analysis.description,
        calories: analysis.calories,
        protein_g: analysis.protein_g,
        carbs_g: analysis.carbs_g,
        fat_g: analysis.fat_g,
        log_method: imageFile ? 'photo' : 'text',
        image_url: imageUrl,
      })

      if (error) throw error
      router.push('/')
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save meal')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Describe your meal
        </label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="e.g. Grilled chicken breast with rice and steamed broccoli"
          rows={3}
          className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm font-medium text-gray-700">
          Or upload a photo
        </label>
        <input
          type="file"
          accept="image/*"
          onChange={handleImageChange}
          className="w-full text-sm text-gray-500 file:mr-4 file:rounded-full file:border-0 file:bg-primary-50 file:px-4 file:py-2 file:text-sm file:font-medium file:text-primary-700 hover:file:bg-primary-100"
        />
        {imagePreview && (
          <img
            src={imagePreview}
            alt="Preview"
            className="mt-3 h-48 w-full rounded-xl object-cover"
          />
        )}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 p-3 text-sm text-red-600">{error}</p>
      )}

      {!analysis ? (
        <Button
          onClick={handleAnalyze}
          loading={loading}
          disabled={!description && !imageFile}
          className="w-full"
          size="lg"
        >
          Analyze with AI
        </Button>
      ) : (
        <div className="space-y-4">
          <div className="rounded-2xl border border-primary-200 bg-primary-50 p-4">
            <h3 className="mb-2 font-semibold text-primary-800">{analysis.description}</h3>
            <div className="grid grid-cols-4 gap-2 text-center text-sm">
              <div>
                <p className="font-bold text-gray-900">{analysis.calories}</p>
                <p className="text-xs text-gray-500">kcal</p>
              </div>
              <div>
                <p className="font-bold text-blue-600">{analysis.protein_g}g</p>
                <p className="text-xs text-gray-500">protein</p>
              </div>
              <div>
                <p className="font-bold text-amber-600">{analysis.carbs_g}g</p>
                <p className="text-xs text-gray-500">carbs</p>
              </div>
              <div>
                <p className="font-bold text-rose-600">{analysis.fat_g}g</p>
                <p className="text-xs text-gray-500">fat</p>
              </div>
            </div>
            {analysis.confidence !== 'high' && analysis.notes && (
              <p className="mt-2 text-xs text-gray-500">{analysis.notes}</p>
            )}
          </div>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => setAnalysis(null)} className="flex-1">
              Re-analyze
            </Button>
            <Button onClick={handleSave} loading={loading} className="flex-1">
              Save meal
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
