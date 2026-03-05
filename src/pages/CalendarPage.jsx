import { Calendar } from 'lucide-react'

export default function CalendarPage() {
  return (
    <div className="space-y-6">
      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mb-4">
          <Calendar size={32} className="text-blue-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-brand-900 mb-2">
          Calendrier interactif
        </h2>
        <p className="text-brand-900/40 text-sm max-w-md">
          Le calendrier avec FullCalendar.js sera développé en Phase 3. 
          Tu pourras ajouter, modifier et déplacer des sessions par drag & drop.
        </p>
        <span className="badge-info mt-4">Phase 3 — Semaines 5-6</span>
      </div>
    </div>
  )
}
