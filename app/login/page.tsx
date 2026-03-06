'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Button from '@/components/ui/Button'
import Input from '@/components/ui/Input'
import LoadingSpinner from '@/components/ui/LoadingSpinner'

const RATE_LIMIT_SECONDS = 60

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center">
        <LoadingSpinner />
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
          setError('Please wait before requesting another link.')
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
          <div className="mb-6 flex h-16 w-16 mx-auto items-center justify-center rounded-2xl bg-accent-500/10">
            <svg className="h-8 w-8 text-accent-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75" />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-white">Check your email</h1>
          <p className="mb-6 text-gray-500">
            We sent a magic link to <span className="font-medium text-white">{email}</span>
          </p>
          <p className="mb-6 text-sm text-gray-500">
            Click the link in the email to sign in. It expires in 10 minutes.
          </p>
          <button
            onClick={() => setSent(false)}
            className="text-sm text-accent-400 hover:text-accent-300"
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
          <h1 className="mb-1 text-3xl font-bold text-white">Adaptive</h1>
          <p className="text-sm text-gray-500">Your AI-powered health companion</p>
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

        <p className="mt-6 text-center text-xs text-gray-500">
          No password needed. We&apos;ll email you a login link.
        </p>
      </div>
    </div>
  )
}
