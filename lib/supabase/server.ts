import { createClient } from '@supabase/supabase-js'

export function getSupabaseUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() ||
    process.env.SUPABASE_URL?.trim() ||
    ''
  )
}

export function createSupabaseServerClient() {
  const url = getSupabaseUrl()
  const key =
    process.env.SUPABASE_SERVICE_ROLE_KEY?.trim() ||
    process.env.SUPABASE_SECRET_KEY?.trim()

  if (!url || !key) {
    throw new Error('Supabase is not configured')
  }

  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

export function isSupabaseConfigured(): boolean {
  return Boolean(
    getSupabaseUrl() &&
      (process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY)
  )
}
