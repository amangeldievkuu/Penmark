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

// --- Public ---

export const getChangelogEntries = createServerFn({ method: 'GET' })
  .handler(async () => {
    const supabase = getServerSupabase()
    const { data, error } = await supabase
      .from('changelog_entries')
      .select('*')
      .order('published_at', { ascending: false })
    if (error) throw new Error('Failed to load changelog')
    return data ?? []
  })

// --- Admin (auth required) ---

export const createChangelogEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    title: z.string().min(1),
    content: z.string().min(1),
    version: z.string().default(''),
    type: z.enum(['feature', 'improvement', 'fix', 'breaking']),
    published_at: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = getServerSupabase()
    const { data: entry, error } = await supabase
      .from('changelog_entries')
      .insert(data)
      .select()
      .single()
    if (error) throw new Error('Failed to create entry')
    return entry
  })

export const updateChangelogEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({
    id: z.string().uuid(),
    title: z.string().min(1).optional(),
    content: z.string().min(1).optional(),
    version: z.string().optional(),
    type: z.enum(['feature', 'improvement', 'fix', 'breaking']).optional(),
    published_at: z.string().optional(),
  }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = getServerSupabase()
    const { id, ...updates } = data
    const { data: entry, error } = await supabase
      .from('changelog_entries')
      .update(updates)
      .eq('id', id)
      .select()
      .single()
    if (error) throw new Error('Failed to update entry')
    return entry
  })

export const deleteChangelogEntry = createServerFn({ method: 'POST' })
  .inputValidator(z.object({ id: z.string().uuid() }))
  .handler(async ({ data }) => {
    await requireAdmin()
    const supabase = getServerSupabase()
    const { error } = await supabase
      .from('changelog_entries')
      .delete()
      .eq('id', data.id)
    if (error) throw new Error('Failed to delete entry')
    return { success: true }
  })
