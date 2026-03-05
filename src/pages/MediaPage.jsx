import { FolderOpen } from 'lucide-react'

export default function MediaPage() {
  return (
    <div className="space-y-6">
      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-emerald-50 flex items-center justify-center mb-4">
          <FolderOpen size={32} className="text-emerald-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-brand-900 mb-2">
          Média / Drive
        </h2>
        <p className="text-brand-900/40 text-sm max-w-md">
          Le module média sera développé en Phase 6. Tu pourras uploader, 
          organiser et partager des fichiers audio, vidéo et documents avec tes clients.
        </p>
        <span className="badge-info mt-4">Phase 6 — Semaines 11-12</span>
      </div>
    </div>
  )
}
