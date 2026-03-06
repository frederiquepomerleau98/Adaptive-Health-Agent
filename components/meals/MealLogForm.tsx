'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getClientUser } from '@/lib/auth-client'
import Button from '@/components/ui/Button'
import Card from '@/components/ui/Card'
import VoiceInput from '@/components/ui/VoiceInput'
import type { MealAnalysis, LogMethod } from '@/types'

export default function MealLogForm() {
  const router = useRouter()
  const [description, setDescription] = useState('')
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [analysis, setAnalysis] = useState<MealAnalysis | null>(null)
  const [error, setError] = useState('')
  const [logMethod, setLogMethod] = useState<LogMethod>('text')
  const [voiceState, setVoiceState] = useState<'idle' | 'recording' | 'processing'>('idle')

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setImageFile(file)
      setLogMethod('photo')
      const reader = new FileReader()
      reader.onloadend = () => setImagePreview(reader.result as string)
      reader.readAsDataURL(file)
    }
  }

  const handleVoiceTranscription = (text: string) => {
    setDescription(text)
    setLogMethod('voice')
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
        log_method: logMethod,
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

  const handleReset = () => {
    setAnalysis(null)
    setDescription('')
    setImageFile(null)
    setImagePreview(null)
    setError('')
    setLogMethod('text')
  }

  return (
    <div className="space-y-4">
      {!analysis ? (
        <>
          {/* Voice status */}
          {voiceState === 'recording' && (
            <div className="flex items-center gap-2 rounded-xl bg-red-500/10 px-4 py-2">
              <span className="h-2 w-2 animate-pulse rounded-full bg-red-500" />
              <p className="text-xs text-red-400">Recording... tap mic to stop</p>
            </div>
          )}
          {voiceState === 'processing' && (
            <div className="flex items-center gap-2 rounded-xl bg-surface-200 px-4 py-2">
              <svg className="h-3 w-3 animate-spin text-accent-400" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              <p className="text-xs text-gray-400">Transcribing...</p>
            </div>
          )}

          {/* Input area with voice */}
          <div className="relative">
            <textarea
              value={description}
              onChange={(e) => {
                setDescription(e.target.value)
                if (logMethod !== 'photo') setLogMethod('text')
              }}
              placeholder="Describe what you ate... or use voice / photo"
              rows={3}
              className="w-full rounded-2xl border border-surface-300 bg-surface-100 px-4 py-3 pr-14 text-sm text-white placeholder-gray-500 transition-colors focus:border-accent-500 focus:outline-none focus:ring-2 focus:ring-accent-500/20 resize-none"
            />
            <div className="absolute bottom-3 right-3">
              <VoiceInput
                onTranscription={handleVoiceTranscription}
                onStateChange={setVoiceState}
                onError={(err) => setError(err)}
              />
            </div>
          </div>

          {/* Photo upload */}
          <div className="flex items-center gap-3">
            <label className="flex cursor-pointer items-center gap-2 rounded-xl bg-surface-200 px-4 py-2.5 text-sm text-gray-300 transition-colors hover:bg-surface-300">
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0z" />
              </svg>
              Add photo
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
                    if (logMethod === 'photo') setLogMethod('text')
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
            onClick={handleAnalyze}
            loading={loading}
            disabled={!description && !imageFile}
            className="w-full"
            size="lg"
          >
            Analyze with AI
          </Button>
        </>
      ) : (
        <div className="animate-slide-up space-y-4">
          <Card className="border-accent-500/20 bg-accent-500/5">
            <h3 className="mb-3 font-semibold text-white">{analysis.description}</h3>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-lg font-bold text-accent-400">{analysis.calories}</p>
                <p className="text-[10px] text-gray-500">kcal</p>
              </div>
              <div>
                <p className="text-lg font-bold text-violet-400">{analysis.protein_g}g</p>
                <p className="text-[10px] text-gray-500">protein</p>
              </div>
              <div>
                <p className="text-lg font-bold text-amber-400">{analysis.carbs_g}g</p>
                <p className="text-[10px] text-gray-500">carbs</p>
              </div>
              <div>
                <p className="text-lg font-bold text-rose-400">{analysis.fat_g}g</p>
                <p className="text-[10px] text-gray-500">fat</p>
              </div>
            </div>
            {analysis.confidence !== 'high' && analysis.notes && (
              <p className="mt-3 text-xs text-gray-500">{analysis.notes}</p>
            )}
          </Card>

          <div className="flex gap-3">
            <Button variant="secondary" onClick={handleReset} className="flex-1">
              Start over
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
