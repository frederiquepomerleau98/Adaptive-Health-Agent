'use client'

import { useState } from 'react'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import VoiceInput from '@/components/ui/VoiceInput'
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

  const handleVoiceTranscription = (text: string) => {
    setIngredients(text)
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
    <div className="animate-fade-in space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Meal ideas</h1>
        <p className="text-sm text-gray-500">Based on what you have and what you need</p>
      </div>

      <div className="space-y-4">
        {/* Input area with voice */}
        <div className="relative">
          <textarea
            value={ingredients}
            onChange={(e) => setIngredients(e.target.value)}
            placeholder="What ingredients do you have? Or describe what you're craving..."
            rows={3}
            className="w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 pr-14 text-sm text-white placeholder-gray-500 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20"
          />
          <div className="absolute bottom-3 right-3">
            <VoiceInput onTranscription={handleVoiceTranscription} />
          </div>
        </div>

        {/* Photo upload */}
        <div className="flex items-center gap-3">
          <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-200 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-surface-300">
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
            </svg>
            Fridge photo
            <input
              type="file"
              accept="image/*"
              onChange={handleImageChange}
              className="hidden"
            />
          </label>
          {imagePreview && (
            <div className="relative">
              <img
                src={imagePreview}
                alt="Preview"
                className="h-12 w-12 rounded-xl object-cover"
              />
              <button
                onClick={() => {
                  setImageFile(null)
                  setImagePreview(null)
                }}
                className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-surface-400 text-xs text-white"
              >
                x
              </button>
            </div>
          )}
        </div>

        {error && (
          <p className="rounded-xl bg-red-500/10 p-3 text-sm text-red-400">{error}</p>
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
          <div className="animate-slide-up space-y-3">
            <h2 className="text-sm font-medium text-gray-400">Suggestions</h2>
            {ideas.map((idea, i) => (
              <Card key={i} hover>
                <h3 className="font-semibold text-white">{idea.name}</h3>
                <p className="mt-1 text-sm text-gray-400">{idea.description}</p>
                <div className="mt-3 flex flex-wrap gap-3 text-xs">
                  <span className="text-accent-400">{idea.estimated_calories} kcal</span>
                  <span className="text-violet-400">{idea.estimated_protein_g}g P</span>
                  <span className="text-amber-400">{idea.estimated_carbs_g}g C</span>
                  <span className="text-rose-400">{idea.estimated_fat_g}g F</span>
                  <span className="text-gray-500">{idea.prep_time_min} min prep</span>
                </div>
                {idea.instructions.length > 0 && (
                  <ol className="mt-3 list-inside list-decimal space-y-1 text-sm text-gray-400">
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
    </div>
  )
}
