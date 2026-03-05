import { Users } from 'lucide-react'

export default function ClientsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
          <Users size={32} className="text-brand-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-brand-900 mb-2">
          Module CRM
        </h2>
        <p className="text-brand-900/40 text-sm max-w-md">
          La gestion des clients sera développée en Phase 2. Tu pourras rechercher, 
          créer, modifier et supprimer des fiches clients depuis cette section.
        </p>
        <span className="badge-info mt-4">Phase 2 — Semaines 3-4</span>
      </div>
    </div>
  )
}
