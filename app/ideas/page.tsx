'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import BottomNav from '@/components/BottomNav'
import type { MealIdea } from '@/types'

export default function IdeasPage() {
  const [ingredients, setIngredients] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [ideas, setIdeas] = useState<MealIdea[]>([])
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

  const handleGenerate = async () => {
    if (!ingredients && !imageFile) return
    setLoading(true)
    setError('')

    try {
      const formData = new FormData()
      if (ingredients) formData.append('ingredients', ingredients)
      if (imageFile) formData.append('image', imageFile)

      const response = await fetch('/api/analyze-fridge', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) throw new Error('Failed to generate ideas')

      const data = await response.json()
      setIdeas(data.ideas ?? [])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="px-4 py-6">
      <h1 className="mb-6 text-2xl font-bold">Meal ideas</h1>

      <div className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            What ingredients do you have?
          </label>
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="e.g. chicken, rice, broccoli, eggs, olive oil"
            rows={3}
            className="w-full rounded-xl border border-gray-300 px-4 py-2.5 text-sm placeholder-gray-400 focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
          />
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-gray-700">
            Or upload a photo of your fridge
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

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!ingredients && !imageFile}
          className="w-full"
          size="lg"
        >
          Get meal ideas
        </Button>

        {ideas.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-lg font-semibold">Suggestions</h2>
            {ideas.map((idea, i) => (
              <Card key={i}>
                <h3 className="font-bold">{idea.name}</h3>
                <p className="mt-1 text-sm text-gray-500">{idea.description}</p>
                <div className="mt-2 flex gap-3 text-xs text-gray-500">
                  <span>{idea.estimated_calories} kcal</span>
                  <span>{idea.estimated_protein_g}g P</span>
                  <span>{idea.estimated_carbs_g}g C</span>
                  <span>{idea.estimated_fat_g}g F</span>
                  <span>{idea.prep_time_min} min</span>
                </div>
                {idea.instructions.length > 0 && (
                  <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-gray-600">
                    {idea.instructions.map((step, j) => (
                      <li key={j}>{step}</li>
                    ))}
                  </ol>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>

      <BottomNav />
    </div>
  )
}
