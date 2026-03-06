import { createClient } from '@/lib/supabase/client'

const DEV_USER_ID = '00000000-0000-0000-0000-000000000000'

interface AuthUser {
  id: string
}

/**
 * Client-side: returns the authenticated user, or a dev fallback when auth is disabled.
 */
export async function getClientUser(): Promise<AuthUser> {
  try {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (user) return { id: user.id }
  } catch {
    // Auth not configured or failed — use dev fallback
  }
  return { id: DEV_USER_ID }
}
