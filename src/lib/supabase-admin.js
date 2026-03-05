import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const serviceRoleKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY

// Client admin avec clé service_role — bypass RLS pour les opérations admin
// Ajoute VITE_SUPABASE_SERVICE_ROLE_KEY dans ton .env pour activer les invitations et suppressions
export const supabaseAdmin = serviceRoleKey
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null
