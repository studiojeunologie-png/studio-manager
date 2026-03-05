import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// ── Liste des transactions avec filtres ───────────────────────
export function useTransactions(filters = {}) {
  const { isAdmin, user } = useAuth()

  return useQuery({
    queryKey: ['transactions', filters],
    queryFn: async () => {
      let q = supabase
        .from('transactions')
        .select('*, profiles:client_id(id, full_name, artist_name), sessions:session_id(id, title, session_type)')
        .order('date', { ascending: false })

      if (!isAdmin) {
        q = q.eq('client_id', user?.id)
      }

      if (filters.type) q = q.eq('type', filters.type)
      if (filters.category) q = q.eq('category', filters.category)
      if (filters.payment_status) q = q.eq('payment_status', filters.payment_status)
      if (filters.client_id) q = q.eq('client_id', filters.client_id)
      if (filters.date_from) q = q.gte('date', filters.date_from)
      if (filters.date_to) q = q.lte('date', filters.date_to)

      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// ── Totaux (CA, dépenses, bénéfice) ──────────────────────────
export function useTransactionsSummary() {
  const { isAdmin, user } = useAuth()

  return useQuery({
    queryKey: ['transactions-summary'],
    queryFn: async () => {
      let q = supabase
        .from('transactions')
        .select('type, amount, payment_status')

      if (!isAdmin) q = q.eq('client_id', user?.id)

      const { data, error } = await q
      if (error) throw error

      const revenus = data
        .filter((t) => t.type === 'revenu')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const depenses = data
        .filter((t) => t.type === 'depense')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const revenusPaids = data
        .filter((t) => t.type === 'revenu' && t.payment_status === 'paye')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      const enAttente = data
        .filter((t) => t.type === 'revenu' && t.payment_status === 'en_attente')
        .reduce((sum, t) => sum + Number(t.amount), 0)

      return {
        revenus,
        depenses,
        benefice: revenusPaids - depenses,
        enAttente,
        total: data.length,
      }
    },
    enabled: !!user,
  })
}

// ── Créer une transaction ─────────────────────────────────────
export function useCreateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (data) => {
      const { error } = await supabase.from('transactions').insert({
        client_id: data.client_id || null,
        session_id: data.session_id || null,
        type: data.type,
        category: data.category,
        amount: Number(data.amount),
        date: data.date,
        description: data.description,
        payment_status: data.payment_status,
        notes: data.notes || null,
      })
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      toast.success('Transaction enregistrée !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Modifier une transaction ──────────────────────────────────
export function useUpdateTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async ({ id, ...data }) => {
      const { error } = await supabase
        .from('transactions')
        .update({
          client_id: data.client_id || null,
          session_id: data.session_id || null,
          type: data.type,
          category: data.category,
          amount: Number(data.amount),
          date: data.date,
          description: data.description,
          payment_status: data.payment_status,
          notes: data.notes || null,
        })
        .eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      toast.success('Transaction mise à jour !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Supprimer une transaction ─────────────────────────────────
export function useDeleteTransaction() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase.from('transactions').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['transactions'] })
      qc.invalidateQueries({ queryKey: ['transactions-summary'] })
      toast.success('Transaction supprimée.')
    },
    onError: (err) => toast.error(err.message),
  })
}
