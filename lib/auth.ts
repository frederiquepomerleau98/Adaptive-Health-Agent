import { createClient } from '@/lib/supabase/server'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000000'

interface AuthUser {
  id: string
}

/**
 * Returns the authenticated user, or a dev fallback when auth is disabled.
 * When auth is re-enabled, remove the fallback and enforce login.
 */
export async function getUser(): Promise<AuthUser> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return { id: user.id }
  } catch {
    // Auth not configured or failed — use dev fallback
  }
  return { id: DEV_USER_ID }
}

export { DEV_USER_ID }
