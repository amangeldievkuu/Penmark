import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { getRequest } from '@tanstack/react-start/server'

function getServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server config')
  return createClient(url, key)
}

/** Extract the access token from the Authorization header */
function getTokenFromRequest(): string | null {
  try {
    const request = getRequest()
    const auth = request.headers.get('authorization')
    if (auth?.startsWith('Bearer ')) return auth.slice(7)
  } catch {
    // not in a request context
  }
  return null
}

/**
 * Verify the caller is an authenticated admin.
 * Call this at the top of every mutating server function.
 * Returns the authenticated user's id.
 */
export async function requireAdmin(): Promise<string> {
  const token = getTokenFromRequest()
  if (!token) throw new Error('Unauthorized')

  const supabase = getServerSupabase()
  const { data: { user }, error } = await supabase.auth.getUser(token)
  if (error || !user) throw new Error('Unauthorized')

  // Verify the user is an admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') throw new Error('Forbidden')
  return user.id
}

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ email: z.string().email(), password: z.string().min(6) }))
  .handler(async ({ data }) => {
    const url = process.env.VITE_SUPABASE_URL
    const anonKey = process.env.VITE_SUPABASE_ANON_KEY
    if (!url || !anonKey) throw new Error('Missing Supabase config')

    const supabase = createClient(url, anonKey)
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password,
    })
    if (error) throw new Error('Invalid email or password')
    return { session: authData.session, user: authData.user }
  })

export const getSessionFn = createServerFn({ method: 'GET' })
  .handler(async () => {
    const token = getTokenFromRequest()
    if (!token) return null

    const supabase = getServerSupabase()
    const { data: { user }, error } = await supabase.auth.getUser(token)
    if (error || !user) return null
    return { id: user.id, email: user.email }
  })

export const getProfileFn = createServerFn({ method: 'GET' })
  .inputValidator(z.object({ userId: z.string().uuid() }))
  .handler(async ({ data }) => {
    const supabase = getServerSupabase()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.userId)
      .single()
    if (error) throw new Error('Profile not found')
    return profile
  })
