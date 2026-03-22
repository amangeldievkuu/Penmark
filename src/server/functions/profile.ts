import { createServerFn } from '@tanstack/react-start'
import { createClient } from '@supabase/supabase-js'
import { z } from 'zod'
import { requireAdmin } from './auth'

function getServerSupabase() {
  const url = process.env.VITE_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !key) throw new Error('Missing Supabase server config')
  return createClient(url, key)
}

export const getAdminProfile = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('role', 'admin')
      .limit(1)
      .single()
    if (error && error.code !== 'PGRST116') throw new Error('Failed to load profile')
    return data
  })

export const updateProfile = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().uuid(),
    full_name: z.string().min(1),
    bio: z.string().default(''),
    avatar_url: z.string().default(''),
    website: z.string().default(''),
    twitter: z.string().default(''),
    github: z.string().default(''),
  }))
  .handler(async ({ data }) => {
    const userId = await requireAdmin()
    // Ensure user can only update their own profile
    if (data.id !== userId) throw new Error('Forbidden')
    const supabase = getServerSupabase()
    const { id, ...updates } = data
    const { data: profile, error } = await supabase
      .from('profiles')
      .upsert({ id, role: 'admin', ...updates })
      .select()
      .single()
    if (error) throw new Error('Failed to update profile')
    return profile
  })
