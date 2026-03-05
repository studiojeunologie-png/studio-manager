import { useState, useEffect } from 'react'
import { X, Save, Trash2, Receipt } from 'lucide-react'
import { useCreateTransaction, useUpdateTransaction, useDeleteTransaction } from '@/hooks/useTransactions'
import { useClients } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'
import { transactionTypeLabels, paymentStatusLabels } from '@/lib/utils'

const CATEGORIES_REVENU = [
  ['session', 'Session'],
  ['mixage', 'Mixage'],
  ['mastering', 'Mastering'],
  ['composition', 'Composition'],
  ['autre', 'Autre'],
]

const CATEGORIES_DEPENSE = [
  ['materiel', 'Matériel'],
  ['loyer', 'Loyer'],
  ['logiciel', 'Logiciel'],
  ['autre', 'Autre'],
]

export default function TransactionDialog({ transaction = null, onClose }) {
  const isEditing = !!transaction
  const create = useCreateTransaction()
  const update = useUpdateTransaction()
  const deleteT = useDeleteTransaction()
  const { data: clients = [] } = useClients()
  const { data: sessions = [] } = useSessions()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    type: 'revenu',
    category: 'session',
    client_id: '',
    session_id: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    description: '',
    payment_status: 'en_attente',
    notes: '',
  })

  useEffect(() => {
    if (transaction) {
      setForm({
        type: transaction.type || 'revenu',
        category: transaction.category || 'session',
        client_id: transaction.client_id || '',
        session_id: transaction.session_id || '',
        amount: transaction.amount?.toString() || '',
        date: transaction.date || new Date().toISOString().split('T')[0],
        description: transaction.description || '',
        payment_status: transaction.payment_status || 'en_attente',
        notes: transaction.notes || '',
      })
    }
  }, [transaction])

  const isPending = create.isPending || update.isPending

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  // Quand on change le type, reset la catégorie
  function setType(value) {
    setForm((prev) => ({
      ...prev,
      type: value,
      category: value === 'revenu' ? 'session' : 'materiel',
      client_id: value === 'depense' ? '' : prev.client_id,
      session_id: value === 'depense' ? '' : prev.session_id,
      payment_status: value === 'depense' ? 'paye' : 'en_attente',
    }))
  }

  const categories = form.type === 'revenu' ? CATEGORIES_REVENU : CATEGORIES_DEPENSE

  // Sessions filtrées par client sélectionné
  const clientSessions = sessions.filter(
    (s) => !form.client_id || s.client_id === form.client_id
  )

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.amount || !form.date) return

    if (isEditing) {
      await update.mutateAsync({ id: transaction.id, ...form })
    } else {
      await create.mutateAsync(form)
    }
    onClose()
  }

  async function handleDelete() {
    await deleteT.mutateAsync(transaction.id)
    onClose()
  }

  const isRevenu = form.type === 'revenu'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <Receipt size={18} className="text-brand-400" />
            <h2 className="font-display font-bold text-lg text-brand-900">
              {isEditing ? 'Modifier la transaction' : 'Nouvelle transaction'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Type revenu / dépense */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-surface-100 rounded-xl">
            <button
              type="button"
              onClick={() => setType('revenu')}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                form.type === 'revenu'
                  ? 'bg-white shadow-sm text-accent-green'
                  : 'text-brand-900/40 hover:text-brand-900/70'
              }`}
            >
              + Revenu
            </button>
            <button
              type="button"
              onClick={() => setType('depense')}
              className={`py-2.5 rounded-lg text-sm font-medium transition-all ${
                form.type === 'depense'
                  ? 'bg-white shadow-sm text-accent-red'
                  : 'text-brand-900/40 hover:text-brand-900/70'
              }`}
            >
              − Dépense
            </button>
          </div>

          {/* Montant + Date */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Montant (€) *</label>
              <div className="relative">
                <span className={`absolute left-4 top-1/2 -translate-y-1/2 text-sm font-semibold ${isRevenu ? 'text-accent-green' : 'text-accent-red'}`}>
                  {isRevenu ? '+' : '−'}
                </span>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  className="input pl-8"
                  placeholder="0.00"
                  value={form.amount}
                  onChange={(e) => set('amount', e.target.value)}
                  required
                />
              </div>
            </div>
            <div>
              <label className="label">Date *</label>
              <input
                type="date"
                className="input"
                value={form.date}
                onChange={(e) => set('date', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Catégorie + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Catégorie</label>
              <select className="input" value={form.category} onChange={(e) => set('category', e.target.value)}>
                {categories.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Statut paiement</label>
              <select className="input" value={form.payment_status} onChange={(e) => set('payment_status', e.target.value)}>
                {Object.entries(paymentStatusLabels).map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Client (uniquement pour les revenus) */}
          {isRevenu && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="label">Client</label>
                <select className="input" value={form.client_id} onChange={(e) => set('client_id', e.target.value)}>
                  <option value="">Aucun</option>
                  {clients.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.full_name}{c.artist_name ? ` — ${c.artist_name}` : ''}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">Session liée</label>
                <select className="input" value={form.session_id} onChange={(e) => set('session_id', e.target.value)}>
                  <option value="">Aucune</option>
                  {clientSessions.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title || s.profiles?.full_name || 'Session'}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Description */}
          <div>
            <label className="label">Description</label>
            <input
              type="text"
              className="input"
              placeholder={isRevenu ? 'Session enregistrement album...' : 'Achat interface audio...'}
              value={form.description}
              onChange={(e) => set('description', e.target.value)}
            />
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Informations complémentaires..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2">
            {isEditing ? (
              confirmDelete ? (
                <div className="flex items-center gap-2">
                  <span className="text-xs text-accent-red">Supprimer ?</span>
                  <button type="button" className="btn-danger text-xs py-1.5 px-3" onClick={handleDelete} disabled={deleteT.isPending}>
                    Confirmer
                  </button>
                  <button type="button" className="btn-ghost text-xs py-1.5 px-3" onClick={() => setConfirmDelete(false)}>
                    Annuler
                  </button>
                </div>
              ) : (
                <button type="button" className="btn-danger py-2 text-sm" onClick={() => setConfirmDelete(true)}>
                  <Trash2 size={14} />
                  Supprimer
                </button>
              )
            ) : (
              <div />
            )}
            <div className="flex items-center gap-2">
              <button type="button" className="btn-secondary py-2" onClick={onClose}>
                Annuler
              </button>
              <button type="submit" className="btn-primary py-2" disabled={isPending}>
                {isPending ? (
                  <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <Save size={15} />
                    {isEditing ? 'Enregistrer' : 'Ajouter'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  )
}
