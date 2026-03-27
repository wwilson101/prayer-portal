import { createClient } from '@supabase/supabase-js'

const supabaseUrl     = import.meta.env.VITE_SUPABASE_URL     || 'https://placeholder.supabase.co'
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || 'placeholder-anon-key'

// True only when real (non-placeholder) credentials are present
export const isConfigured = Boolean(
  import.meta.env.VITE_SUPABASE_URL &&
  !import.meta.env.VITE_SUPABASE_URL.includes('placeholder')
)

if (!isConfigured) {
  console.warn(
    '[Prayer Portal] Supabase is not configured.\n' +
    'Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env.local file.\n' +
    'See .env.example for reference. Auth and data will not work until configured.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
