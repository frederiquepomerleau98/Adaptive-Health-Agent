'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 text-5xl">✉️</div>
          <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
          <p className="mb-6 text-gray-500">
            We sent a magic link to <span className="font-medium text-gray-900">{email}</span>
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-primary-600 hover:text-primary-700"
          >
            Try a different email
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">Adaptive Health</h1>
          <p className="text-gray-500">Your AI-powered health co-pilot</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <Input
            label="Email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            error={error}
          />
          <Button type="submit" loading={loading} className="w-full" size="lg">
            Send magic link
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          No password needed. We&apos;ll email you a login link.
        </p>
      </div>
    </div>
  )
}
