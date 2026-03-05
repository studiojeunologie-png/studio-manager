import { useState, useEffect } from 'react'
import { X, Save, Trash2, CalendarClock } from 'lucide-react'
import { useCreateSession, useUpdateSession, useDeleteSession } from '@/hooks/useSessions'
import { useClients } from '@/hooks/useClients'
import { sessionTypeLabels, sessionStatusLabels } from '@/lib/utils'

const SESSION_TYPES = Object.entries(sessionTypeLabels)
const SESSION_STATUSES = Object.entries(sessionStatusLabels)

// Formate une date JS en "YYYY-MM-DDTHH:MM" pour input datetime-local
function toLocalInput(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export default function SessionDialog({ session = null, defaultStart = null, defaultEnd = null, onClose }) {
  const isEditing = !!session
  const createSession = useCreateSession()
  const updateSession = useUpdateSession()
  const deleteSession = useDeleteSession()
  const { data: clients = [] } = useClients()

  const [confirmDelete, setConfirmDelete] = useState(false)
  const [form, setForm] = useState({
    client_id: '',
    title: '',
    session_type: 'enregistrement',
    status: 'planifiee',
    start_time: '',
    end_time: '',
    notes: '',
  })

  useEffect(() => {
    if (session) {
      setForm({
        client_id: session.client_id || '',
        title: session.title || '',
        session_type: session.session_type || 'enregistrement',
        status: session.status || 'planifiee',
        start_time: toLocalInput(session.start_time),
        end_time: toLocalInput(session.end_time),
        notes: session.notes || '',
      })
    } else if (defaultStart) {
      setForm((prev) => ({
        ...prev,
        start_time: toLocalInput(defaultStart),
        end_time: toLocalInput(defaultEnd || new Date(new Date(defaultStart).getTime() + 2 * 3600000)),
      }))
    }
  }, [session, defaultStart, defaultEnd])

  const isPending = createSession.isPending || updateSession.isPending

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.client_id || !form.start_time || !form.end_time) return

    const payload = {
      ...form,
      start_time: new Date(form.start_time).toISOString(),
      end_time: new Date(form.end_time).toISOString(),
    }

    if (isEditing) {
      await updateSession.mutateAsync({ id: session.id, ...payload })
    } else {
      await createSession.mutateAsync(payload)
    }
    onClose()
  }

  async function handleDelete() {
    await deleteSession.mutateAsync(session.id)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-200">
          <div className="flex items-center gap-2">
            <CalendarClock size={18} className="text-brand-400" />
            <h2 className="font-display font-bold text-lg text-brand-900">
              {isEditing ? 'Modifier la session' : 'Nouvelle session'}
            </h2>
          </div>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Client */}
          <div>
            <label className="label">Client *</label>
            <select
              className="input"
              value={form.client_id}
              onChange={(e) => set('client_id', e.target.value)}
              required
            >
              <option value="">Sélectionner un client...</option>
              {clients.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.full_name}{c.artist_name ? ` — ${c.artist_name}` : ''}
                </option>
              ))}
            </select>
          </div>

          {/* Titre */}
          <div>
            <label className="label">Titre de la session</label>
            <input
              type="text"
              className="input"
              placeholder="Album Debut, EP Vol.1..."
              value={form.title}
              onChange={(e) => set('title', e.target.value)}
            />
          </div>

          {/* Type + Statut */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Type *</label>
              <select
                className="input"
                value={form.session_type}
                onChange={(e) => set('session_type', e.target.value)}
              >
                {SESSION_TYPES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="label">Statut *</label>
              <select
                className="input"
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
              >
                {SESSION_STATUSES.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Dates */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Début *</label>
              <input
                type="datetime-local"
                className="input"
                value={form.start_time}
                onChange={(e) => set('start_time', e.target.value)}
                required
              />
            </div>
            <div>
              <label className="label">Fin *</label>
              <input
                type="datetime-local"
                className="input"
                value={form.end_time}
                onChange={(e) => set('end_time', e.target.value)}
                required
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Instruments, demandes spécifiques..."
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
                  <button type="button" className="btn-danger text-xs py-1.5 px-3" onClick={handleDelete} disabled={deleteSession.isPending}>
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
                    {isEditing ? 'Enregistrer' : 'Créer la session'}
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
