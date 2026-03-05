import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { supabaseAdmin } from '@/lib/supabase-admin'
import toast from 'react-hot-toast'

// ── Liste des clients avec compteurs ──────────────────────────
export function useClients(search = '') {
  return useQuery({
    queryKey: ['clients', search],
    queryFn: async () => {
      let query = supabase
        .from('profiles')
        .select('*, sessions(count), transactions(count)')
        .eq('role', 'client')
        .order('created_at', { ascending: false })

      if (search.trim()) {
        query = query.or(
          `full_name.ilike.%${search}%,email.ilike.%${search}%,artist_name.ilike.%${search}%,phone.ilike.%${search}%`
        )
      }

      const { data, error } = await query
      if (error) throw error
      return data
    },
  })
}

// ── Détail d'un client avec sessions + transactions ───────────
export function useClient(id) {
  return useQuery({
    queryKey: ['client', id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          sessions(id, title, session_type, status, start_time, end_time),
          transactions(id, type, category, amount, date, payment_status, description)
        `)
        .eq('id', id)
        .single()
      if (error) throw error
      return data
    },
    enabled: !!id,
  })
}

// ── Créer un client (invite Supabase Auth) ────────────────────
export function useCreateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Clé service_role manquante. Ajoute VITE_SUPABASE_SERVICE_ROLE_KEY dans ton .env'
        )
      }
      // Invite via Supabase Auth — envoie un email d'invitation au client
      const { data: authData, error: authError } =
        await supabaseAdmin.auth.admin.inviteUserByEmail(data.email, {
          data: { full_name: data.full_name, role: 'client' },
          redirectTo: `${window.location.origin}/login`,
        })
      if (authError) throw authError

      // Compléter le profil créé par le trigger
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          artist_name: data.artist_name || null,
          phone: data.phone || null,
          notes: data.notes || null,
          role: 'client',
        })
        .eq('id', authData.user.id)
      if (profileError) throw profileError

      return authData.user
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client créé — invitation envoyée par email !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Modifier un client ────────────────────────────────────────
export function useUpdateClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('profiles')
        .update({
          full_name: data.full_name,
          artist_name: data.artist_name || null,
          phone: data.phone || null,
          notes: data.notes || null,
        })
        .eq('id', id)
      if (error) throw error
      return { id }
    },
    onSuccess: ({ id }) => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      qc.invalidateQueries({ queryKey: ['client', id] })
      toast.success('Client mis à jour !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Supprimer un client ───────────────────────────────────────
export function useDeleteClient() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      if (!supabaseAdmin) {
        throw new Error(
          'Clé service_role manquante. Ajoute VITE_SUPABASE_SERVICE_ROLE_KEY dans ton .env'
        )
      }
      const { error } = await supabaseAdmin.auth.admin.deleteUser(id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Client supprimé.')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Réinitialiser le mot de passe ────────────────────────────
export function useResetClientPassword() {
  return useMutation({
    mutationFn: async (email) => {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) throw error
    },
    onSuccess: () => toast.success('Email de réinitialisation envoyé !'),
    onError: (err) => toast.error(err.message),
  })
}
