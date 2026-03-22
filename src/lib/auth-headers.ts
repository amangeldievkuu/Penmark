import { supabase } from './supabase'

export async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession()
  const token = session?.access_token
  if (!token) return {}
  return { Authorization: `Bearer ${token}` }
}
