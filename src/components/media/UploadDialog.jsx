import { useState, useRef } from 'react'
import { X, Upload, FileAudio, FileVideo, FileImage, File } from 'lucide-react'
import { useUploadMedia, ACCEPTED_TYPES } from '@/hooks/useMedia'
import { useClients } from '@/hooks/useClients'
import { useSessions } from '@/hooks/useSessions'
import { useAuth } from '@/hooks/useAuth'

const TYPE_ICONS = { audio: FileAudio, video: FileVideo, image: FileImage, document: File }
const ACCEPTED_ALL = Object.values(ACCEPTED_TYPES).join(',')

export default function UploadDialog({ defaultClientId = '', onClose }) {
  const { isAdmin } = useAuth()
  const upload = useUploadMedia()
  const { data: clients = [] } = useClients()
  const { data: sessions = [] } = useSessions()
  const inputRef = useRef(null)

  const [file, setFile] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [form, setForm] = useState({
    client_id: defaultClientId,
    session_id: '',
    notes: '',
  })

  const clientSessions = sessions.filter(
    (s) => !form.client_id || s.client_id === form.client_id
  )

  function set(field, value) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  function handleFile(f) {
    if (f) setFile(f)
  }

  function onDrop(e) {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files[0]
    if (f) handleFile(f)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!file) return
    await upload.mutateAsync({ file, ...form })
    onClose()
  }

  const FileIcon = file ? (TYPE_ICONS[getType(file.type)] || File) : Upload

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-surface-200">
          <h2 className="font-display font-bold text-lg text-brand-900">Uploader un fichier</h2>
          <button onClick={onClose} className="btn-ghost p-2 rounded-xl"><X size={18} /></button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {/* Zone de drop */}
          <div
            onClick={() => inputRef.current?.click()}
            onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
            onDragLeave={() => setDragOver(false)}
            onDrop={onDrop}
            className={`relative border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              dragOver
                ? 'border-brand-400 bg-brand-50'
                : file
                ? 'border-accent-green/40 bg-accent-green/5'
                : 'border-surface-300 hover:border-brand-300 hover:bg-brand-50/50'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept={ACCEPTED_ALL}
              className="hidden"
              onChange={(e) => handleFile(e.target.files[0])}
            />
            <FileIcon size={28} className={`mx-auto mb-2 ${file ? 'text-accent-green' : 'text-brand-300'}`} />
            {file ? (
              <>
                <p className="text-sm font-semibold text-brand-900 truncate px-4">{file.name}</p>
                <p className="text-xs text-brand-900/40 mt-1">
                  {(file.size / (1024 * 1024)).toFixed(2)} Mo · Cliquer pour changer
                </p>
              </>
            ) : (
              <>
                <p className="text-sm font-medium text-brand-900/60">Glisser un fichier ici</p>
                <p className="text-xs text-brand-900/30 mt-1">ou cliquer pour parcourir</p>
                <p className="text-[11px] text-brand-900/25 mt-2">Audio, vidéo, image, PDF, documents</p>
              </>
            )}
          </div>

          {/* Client */}
          {isAdmin && (
            <div>
              <label className="label">Client</label>
              <select className="input" value={form.client_id} onChange={(e) => set('client_id', e.target.value)}>
                <option value="">Aucun (fichier studio)</option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.full_name}{c.artist_name ? ` — ${c.artist_name}` : ''}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Session liée */}
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

          {/* Notes */}
          <div>
            <label className="label">Notes</label>
            <textarea
              className="input resize-none"
              rows={2}
              placeholder="Description du fichier..."
              value={form.notes}
              onChange={(e) => set('notes', e.target.value)}
            />
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <button type="button" className="btn-secondary" onClick={onClose}>Annuler</button>
            <button type="submit" className="btn-primary" disabled={!file || upload.isPending}>
              {upload.isPending ? (
                <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  <Upload size={15} />
                  Uploader
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

function getType(mimeType) {
  if (mimeType?.startsWith('audio/')) return 'audio'
  if (mimeType?.startsWith('video/')) return 'video'
  if (mimeType?.startsWith('image/')) return 'image'
  return 'document'
}
