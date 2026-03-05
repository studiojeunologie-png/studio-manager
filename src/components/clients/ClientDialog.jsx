import { useState, useEffect } from 'react'
import { X, UserPlus, Save } from 'lucide-react'
import { useCreateClient, useUpdateClient } from '@/hooks/useClients'

export default function ClientDialog({ client = null, onClose }) {
  const isEditing = !!client
  const createClient = useCreateClient()
  const updateClient = useUpdateClient()

  const [form, setForm] = useState({
    email: '',
    full_name: '',
    artist_name: '',
    phone: '',
    notes: '',
  })

  useEffect(() => {
    if (client) {
      setForm({
        email: client.email || '',
        full_name: client.full_name || '',
        artist_name: client.artist_name || '',
        phone: client.phone || '',
        notes: client.notes || '',
      })
    }
  }, [client])

  const isPending = createClient.isPending || updateClient.isPending

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.full_name.trim()) return
    if (!isEditing && !form.email.trim()) return

    if (isEditing) {
      await updateClient.mutateAsync({ id: client.id, ...form })
    } else {
      await createClient.mutateAsync(form)
    }
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-200">
          <h2 className="font-display font-bold text-lg text-brand-900">
            {isEditing ? 'Modifier le client' : 'Nouveau client'}
          </h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Email — visible uniquement à la création */}
          {!isEditing && (
            <div>
              <label className="label">Email *</label>
              <input
                type="email"
                className="input"
                placeholder="client@email.com"
                value={form.email}
                onChange={(e) => set('email', e.target.value)}
                required
                autoFocus
              />
            </div>
          )}

          {/* Nom complet */}
          <div>
            <label className="label">Nom complet *</label>
            <input
              type="text"
              className="input"
              placeholder="Jean Dupont"
              value={form.full_name}
              onChange={(e) => set('full_name', e.target.value)}
              required
              autoFocus={isEditing}
            />
          </div>

          {/* Nom d'artiste */}
          <div>
            <label className="label">Nom d'artiste</label>
            <input
              type="text"
              className="input"
              placeholder="DJ Shadow, MC Flow..."
              value={form.artist_name}
              onChange={(e) => set('artist_name', e.target.value)}
            />
          </div>

          {/* Téléphone */}
          <div>
            <label className="label">Téléphone</label>
            <input
              type="tel"
              className="input"
              placeholder="+33 6 12 34 56 78"
              value={form.phone}
              onChange={(e) => set('phone', e.target.value)}
            />
          </div>

          {/* Notes internes */}
          <div>
            <label className="label">Notes internes</label>
            <textarea
              className="input resize-none"
              rows={3}
              placeholder="Préférences, historique, informations importantes..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Annuler
            </button>
            <button type="submit" className="btn-primary" disabled={isPending}>
              {isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : isEditing ? (
                <>
                  <Save size={16} />
                  Enregistrer
                </>
              ) : (
                <>
                  <UserPlus size={16} />
                  Créer et inviter
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
