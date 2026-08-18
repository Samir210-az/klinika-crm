import { createClient } from '@supabase/supabase-js'

// DİQQƏT: bu fayl yalnız /api route-larında (server-side) import olunmalıdır.
// SUPABASE_SERVICE_ROLE_KEY heç vaxt client bundle-a düşməməlidir.
export function getSupabaseAdmin() {
  const url = process.env.SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error('Supabase server konfiqurasiyası çatışmır (env variables).')
  }

  return createClient(url, key, {
    auth: { persistSession: false },
  })
}
