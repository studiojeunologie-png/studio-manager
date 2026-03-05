import { Receipt } from 'lucide-react'

export default function TransactionsPage() {
  return (
    <div className="space-y-6">
      <div className="card p-8 flex flex-col items-center justify-center text-center min-h-[400px]">
        <div className="w-16 h-16 rounded-2xl bg-amber-50 flex items-center justify-center mb-4">
          <Receipt size={32} className="text-amber-500" />
        </div>
        <h2 className="font-display text-xl font-bold text-brand-900 mb-2">
          Transactions
        </h2>
        <p className="text-brand-900/40 text-sm max-w-md">
          Le module transactions sera développé en Phase 4. Tu pourras gérer 
          les revenus et dépenses du studio, liés aux sessions et aux clients.
        </p>
        <span className="badge-info mt-4">Phase 4 — Semaines 7-8</span>
      </div>
    </div>
  )
}
