'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'

const RATE_LIMIT_SECONDS = 60

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-600 border-t-transparent" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const [cooldown, setCooldown] = useState(0)

  useEffect(() => {
    const errorParam = searchParams.get('error_description')
    if (errorParam) {
      const message = errorParam.replace(/\+/g, ' ')
      if (message.toLowerCase().includes('expired') || message.toLowerCase().includes('invalid')) {
        setError('Your magic link has expired. Please request a new one.')
      } else {
        setError(message)
      }
    }
  }, [searchParams])

  useEffect(() => {
    if (cooldown <= 0) return
    const timer = setTimeout(() => setCooldown(cooldown - 1), 1000)
    return () => clearTimeout(timer)
  }, [cooldown])

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    if (cooldown > 0) return
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

      if (error) {
        if (error.message.toLowerCase().includes('rate') || error.message.toLowerCase().includes('security')) {
          setCooldown(RATE_LIMIT_SECONDS)
          setError(`Please wait before requesting another link.`)
          return
        }
        throw error
      }
      setSent(true)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong')
    } finally {
      setLoading(false)
    }
  }, [email, cooldown])

  if (sent) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center px-6">
        <div className="w-full max-w-sm text-center">
          <div className="mb-6 text-5xl">✉️</div>
          <h1 className="mb-2 text-2xl font-bold">Check your email</h1>
          <p className="mb-6 text-gray-500">
            We sent a magic link to <span className="font-medium text-gray-900">{email}</span>
          </p>
          <p className="mb-6 text-sm text-gray-400">
            Click the link in the email to sign in. It expires in 10 minutes.
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
          <Button
            type="submit"
            loading={loading}
            disabled={cooldown > 0}
            className="w-full"
            size="lg"
          >
            {cooldown > 0 ? `Wait ${cooldown}s` : 'Send magic link'}
          </Button>
        </form>

        <p className="mt-6 text-center text-xs text-gray-400">
          No password needed. We&apos;ll email you a login link.
        </p>
      </div>
    </div>
  )
}
