import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error(
    '⚠️ Variables Supabase manquantes !\n' +
    'Crée un fichier .env à la racine avec :\n' +
    'VITE_SUPABASE_URL=https://xxx.supabase.co\n' +
    'VITE_SUPABASE_ANON_KEY=eyJ...'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
})
