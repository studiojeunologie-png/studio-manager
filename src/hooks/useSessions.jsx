import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// ── Liste des sessions ────────────────────────────────────────
export function useSessions() {
  const { isAdmin, user } = useAuth()
  const qc = useQueryClient()

  const query = useQuery({
    queryKey: ['sessions'],
    queryFn: async () => {
      let q = supabase
        .from('sessions')
        .select('*, profiles:client_id(id, full_name, artist_name, email)')
        .order('start_time', { ascending: true })

      // Les clients ne voient que leurs sessions (RLS fait déjà le filtre, mais on est explicite)
      if (!isAdmin) {
        q = q.eq('client_id', user?.id)
      }

      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!user,
  })

  // Synchronisation temps réel via Supabase Realtime
  useEffect(() => {
    const channel = supabase
      .channel('sessions-realtime')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'sessions' }, () => {
        qc.invalidateQueries({ queryKey: ['sessions'] })
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [qc])

  return query
}

// ── Créer une session ─────────────────────────────────────────
export function useCreateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('sessions').insert({
        client_id: data.client_id,
        title: data.title,
        session_type: data.session_type,
        status: data.status,
        start_time: data.start_time,
        end_time: data.end_time,
        notes: data.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Session créée !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Modifier une session ──────────────────────────────────────
export function useUpdateSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('sessions')
        .update({
          client_id: data.client_id,
          title: data.title,
          session_type: data.session_type,
          status: data.status,
          start_time: data.start_time,
          end_time: data.end_time,
          notes: data.notes || null,
        })
        .eq('id', id)
      if (error) throw error
      return { id }
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      toast.success('Session mise à jour !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Déplacer/redimensionner (drag & drop) ────────────────────
export function useRescheduleSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, start_time, end_time }) => {
      const { error } = await supabase
        .from('sessions')
        .update({ start_time, end_time })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
    onError: (err) => {
      toast.error(err.message)
      qc.invalidateQueries({ queryKey: ['sessions'] })
    },
  })
}

// ── Supprimer une session ─────────────────────────────────────
export function useDeleteSession() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('sessions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['sessions'] })
      qc.invalidateQueries({ queryKey: ['clients'] })
      toast.success('Session supprimée.')
    },
    onError: (err) => toast.error(err.message),
  })
}
