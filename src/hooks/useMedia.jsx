import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { supabase } from '@/lib/supabase'
import { useAuth } from '@/hooks/useAuth'
import toast from 'react-hot-toast'

// ── Liste des fichiers ────────────────────────────────────────
export function useMedia(filters = {}) {
  const { isAdmin, user } = useAuth()

  return useQuery({
    queryKey: ['media', filters],
    queryFn: async () => {
      let q = supabase
        .from('media')
        .select('*, profiles:client_id(id, full_name, artist_name), sessions:session_id(id, title, session_type)')
        .order('created_at', { ascending: false })

      if (!isAdmin) q = q.eq('client_id', user?.id)
      if (filters.client_id) q = q.eq('client_id', filters.client_id)
      if (filters.file_type) q = q.eq('file_type', filters.file_type)
      if (filters.session_id) q = q.eq('session_id', filters.session_id)

      const { data, error } = await q
      if (error) throw error
      return data
    },
    enabled: !!user,
  })
}

// ── Upload + création de l'entrée en base ─────────────────────
export function useUploadMedia() {
  const qc = useQueryClient()
  const { user } = useAuth()

  return useMutation({
    mutationFn: async ({ file, client_id, session_id, transaction_id, notes }) => {
      // Déterminer le type
      const fileType = getFileType(file.type)
      const ext = file.name.split('.').pop()
      const path = `${client_id || 'general'}/${Date.now()}-${file.name}`

      // Upload dans Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('studio-media')
        .upload(path, file, { upsert: false })
      if (uploadError) throw uploadError

      // URL publique (ou signée si bucket privé)
      const { data: { publicUrl } } = supabase.storage
        .from('studio-media')
        .getPublicUrl(path)

      // Enregistrement en base
      const { error: dbError } = await supabase.from('media').insert({
        uploaded_by: user.id,
        client_id: client_id || null,
        session_id: session_id || null,
        transaction_id: transaction_id || null,
        file_name: file.name,
        file_type: fileType,
        file_url: publicUrl,
        file_size: file.size,
        notes: notes || null,
      })
      if (dbError) throw dbError
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Fichier uploadé !')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── Supprimer un fichier ──────────────────────────────────────
export function useDeleteMedia() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: async ({ id, file_url }) => {
      // Extraire le path depuis l'URL
      const path = file_url.split('/studio-media/')[1]
      if (path) {
        await supabase.storage.from('studio-media').remove([path])
      }
      const { error } = await supabase.from('media').delete().eq('id', id)
      if (error) throw error
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['media'] })
      toast.success('Fichier supprimé.')
    },
    onError: (err) => toast.error(err.message),
  })
}

// ── URL signée pour téléchargement sécurisé ──────────────────
export async function getSignedUrl(file_url, expiresIn = 3600) {
  const path = file_url.split('/studio-media/')[1]
  if (!path) return file_url
  const { data } = await supabase.storage
    .from('studio-media')
    .createSignedUrl(path, expiresIn)
  return data?.signedUrl || file_url
}

// ── Helpers ───────────────────────────────────────────────────
function getFileType(mimeType) {
  if (mimeType.startsWith('audio/')) return 'audio'
  if (mimeType.startsWith('video/')) return 'video'
  if (mimeType.startsWith('image/')) return 'image'
  return 'document'
}

export function formatFileSize(bytes) {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} o`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`
}

export const FILE_TYPE_ICONS = {
  audio: '🎵',
  video: '🎬',
  image: '🖼',
  document: '📄',
}

export const FILE_TYPE_LABELS = {
  audio: 'Audio',
  video: 'Vidéo',
  image: 'Image',
  document: 'Document',
}

export const ACCEPTED_TYPES = {
  audio: '.mp3,.wav,.flac,.aac,.ogg,.m4a',
  video: '.mp4,.mov,.avi,.mkv',
  image: '.png,.jpg,.jpeg,.webp,.gif',
  document: '.pdf,.docx,.doc,.xlsx,.txt',
}
