import { useState, useRef } from 'react'
import { Upload, Search, FolderOpen, FileAudio, FileVideo, FileImage, File, Trash2, Download, Play, Pause } from 'lucide-react'
import { useMedia, useDeleteMedia, formatFileSize, FILE_TYPE_ICONS, FILE_TYPE_LABELS } from '@/hooks/useMedia'
import { useAuth } from '@/hooks/useAuth'
import { formatDate } from '@/lib/utils'
import UploadDialog from '@/components/media/UploadDialog'

const FILE_TYPE_FILTER = [
  { value: '', label: 'Tous' },
  { value: 'audio', label: 'Audio' },
  { value: 'video', label: 'Vidéo' },
  { value: 'image', label: 'Image' },
  { value: 'document', label: 'Document' },
]

export default function MediaPage() {
  const { isAdmin } = useAuth()
  const [fileTypeFilter, setFileTypeFilter] = useState('')
  const [search, setSearch] = useState('')
  const [showUpload, setShowUpload] = useState(false)
  const [preview, setPreview] = useState(null) // { url, type, name }

  const { data: files = [], isLoading } = useMedia({ file_type: fileTypeFilter || undefined })
  const deleteMedia = useDeleteMedia()

  const filtered = files.filter((f) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      f.file_name?.toLowerCase().includes(q) ||
      f.profiles?.full_name?.toLowerCase().includes(q) ||
      f.notes?.toLowerCase().includes(q)
    )
  })

  // Grouper par client
  const groups = {}
  filtered.forEach((f) => {
    const key = f.client_id || '__studio__'
    const label = f.profiles?.full_name || 'Fichiers studio'
    if (!groups[key]) groups[key] = { label, files: [] }
    groups[key].files.push(f)
  })

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-brand-900">Média</h1>
        <button className="btn-primary" onClick={() => setShowUpload(true)}>
          <Upload size={16} />
          Uploader
        </button>
      </div>

      {/* Filtres */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[180px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/30 pointer-events-none" />
          <input
            type="text"
            className="input pl-9 py-2 text-sm"
            placeholder="Rechercher un fichier..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        {FILE_TYPE_FILTER.map((t) => (
          <button
            key={t.value}
            onClick={() => setFileTypeFilter(t.value)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
              fileTypeFilter === t.value
                ? 'bg-brand-500 text-white border-brand-500'
                : 'text-brand-900/40 bg-surface-100 border-transparent hover:bg-surface-200'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Contenu */}
      {isLoading ? (
        <div className="card p-6 grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="h-32 bg-surface-100 rounded-xl animate-pulse" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="card flex flex-col items-center justify-center py-16 text-center">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
            <FolderOpen size={28} className="text-brand-300" />
          </div>
          <p className="text-sm font-medium text-brand-900/50">Aucun fichier</p>
          <p className="text-xs text-brand-900/30 mt-1">
            {search || fileTypeFilter ? 'Essaie de modifier les filtres' : 'Upload ton premier fichier'}
          </p>
          <button className="btn-primary mt-4 text-sm" onClick={() => setShowUpload(true)}>
            <Upload size={14} />
            Uploader un fichier
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groups).map(([key, group]) => (
            <div key={key}>
              {isAdmin && (
                <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-900/40 mb-3 px-1">
                  {group.label}
                </h3>
              )}
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3">
                {group.files.map((f) => (
                  <FileCard
                    key={f.id}
                    file={f}
                    isAdmin={isAdmin}
                    onPreview={() => setPreview({ url: f.file_url, type: f.file_type, name: f.file_name })}
                    onDelete={() => deleteMedia.mutate({ id: f.id, file_url: f.file_url })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload dialog */}
      {showUpload && <UploadDialog onClose={() => setShowUpload(false)} />}

      {/* Preview dialog */}
      {preview && <PreviewDialog preview={preview} onClose={() => setPreview(null)} />}
    </div>
  )
}

// ── Carte fichier ─────────────────────────────────────────────
function FileCard({ file, isAdmin, onPreview, onDelete }) {
  const canPreview = file.file_type === 'audio' || file.file_type === 'video' || file.file_type === 'image'

  return (
    <div className="card p-3 flex flex-col gap-2 group relative">
      {/* Zone aperçu */}
      <button
        onClick={canPreview ? onPreview : undefined}
        className={`w-full h-20 rounded-xl flex items-center justify-center bg-surface-50 ${canPreview ? 'cursor-pointer hover:bg-brand-50 transition-colors' : 'cursor-default'}`}
      >
        {file.file_type === 'image' ? (
          <img src={file.file_url} alt={file.file_name} className="w-full h-full object-cover rounded-xl" />
        ) : (
          <span className="text-3xl">{FILE_TYPE_ICONS[file.file_type] || '📄'}</span>
        )}
      </button>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-brand-900 truncate" title={file.file_name}>
          {file.file_name}
        </p>
        <p className="text-[11px] text-brand-900/40 mt-0.5">
          {formatFileSize(file.file_size)} · {formatDate(file.created_at)}
        </p>
      </div>

      {/* Actions hover */}
      <div className="flex items-center gap-1">
        <a
          href={file.file_url}
          download={file.file_name}
          className="flex-1 flex items-center justify-center gap-1 py-1 rounded-lg bg-surface-50 hover:bg-brand-50 text-brand-900/40 hover:text-brand-500 transition-colors text-xs"
          title="Télécharger"
        >
          <Download size={12} />
        </a>
        {isAdmin && (
          <button
            onClick={onDelete}
            className="flex items-center justify-center w-8 py-1 rounded-lg bg-surface-50 hover:bg-accent-red/10 text-brand-900/30 hover:text-accent-red transition-colors"
            title="Supprimer"
          >
            <Trash2 size={12} />
          </button>
        )}
      </div>
    </div>
  )
}

// ── Modal prévisualisation ────────────────────────────────────
function PreviewDialog({ preview, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/80 backdrop-blur-sm animate-fade-in" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[85vh] overflow-hidden animate-scale-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-surface-200">
          <p className="text-sm font-semibold text-brand-900 truncate flex-1">{preview.name}</p>
          <button onClick={onClose} className="btn-ghost p-2 ml-2"><span className="text-lg leading-none">×</span></button>
        </div>
        <div className="p-4 flex items-center justify-center min-h-[300px] bg-surface-50">
          {preview.type === 'image' && (
            <img src={preview.url} alt={preview.name} className="max-w-full max-h-[60vh] object-contain rounded-xl" />
          )}
          {preview.type === 'audio' && (
            <audio controls className="w-full" src={preview.url}>
              Ton navigateur ne supporte pas l'audio.
            </audio>
          )}
          {preview.type === 'video' && (
            <video controls className="max-w-full max-h-[60vh] rounded-xl" src={preview.url}>
              Ton navigateur ne supporte pas la vidéo.
            </video>
          )}
        </div>
      </div>
    </div>
  )
}
