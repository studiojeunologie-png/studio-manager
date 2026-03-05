import { useState } from 'react'
import { Plus, Search, TrendingUp, TrendingDown, Wallet, Clock, Receipt, AlertCircle } from 'lucide-react'
import { useTransactions, useTransactionsSummary } from '@/hooks/useTransactions'
import { useAuth } from '@/hooks/useAuth'
import { formatCurrency, formatDate, paymentStatusLabels, transactionTypeLabels } from '@/lib/utils'
import TransactionDialog from '@/components/transactions/TransactionDialog'

const CATEGORY_LABELS = {
  session: 'Session', mixage: 'Mixage', mastering: 'Mastering',
  composition: 'Composition', materiel: 'Matériel', loyer: 'Loyer',
  logiciel: 'Logiciel', autre: 'Autre',
}

export default function TransactionsPage() {
  const { isAdmin } = useAuth()
  const [filters, setFilters] = useState({ type: '', payment_status: '' })
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [editing, setEditing] = useState(null)

  const { data: transactions = [], isLoading } = useTransactions(filters)
  const { data: summary } = useTransactionsSummary()

  // Filtrage par recherche côté client
  const filtered = transactions.filter((t) => {
    if (!search.trim()) return true
    const q = search.toLowerCase()
    return (
      t.description?.toLowerCase().includes(q) ||
      t.profiles?.full_name?.toLowerCase().includes(q) ||
      CATEGORY_LABELS[t.category]?.toLowerCase().includes(q)
    )
  })

  function setFilter(key, value) {
    setFilters((prev) => ({ ...prev, [key]: prev[key] === value ? '' : value }))
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-brand-900">Transactions</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setShowCreate(true)}>
            <Plus size={16} />
            Nouvelle transaction
          </button>
        )}
      </div>

      {/* KPI cards */}
      {isAdmin && summary && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <KpiCard
            label="Revenus"
            value={formatCurrency(summary.revenus)}
            icon={TrendingUp}
            color="text-accent-green"
            bg="bg-accent-green/10"
          />
          <KpiCard
            label="Dépenses"
            value={formatCurrency(summary.depenses)}
            icon={TrendingDown}
            color="text-accent-red"
            bg="bg-accent-red/10"
          />
          <KpiCard
            label="Bénéfice net"
            value={formatCurrency(summary.benefice)}
            icon={Wallet}
            color={summary.benefice >= 0 ? 'text-brand-500' : 'text-accent-red'}
            bg={summary.benefice >= 0 ? 'bg-brand-50' : 'bg-accent-red/10'}
          />
          <KpiCard
            label="En attente"
            value={formatCurrency(summary.enAttente)}
            icon={Clock}
            color="text-accent-orange"
            bg="bg-accent-orange/10"
          />
        </div>
      )}

      {/* Filtres rapides */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/30 pointer-events-none" />
          <input
            type="text"
            className="input pl-9 py-2 text-sm"
            placeholder="Rechercher..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <FilterChip label="Revenus" active={filters.type === 'revenu'} onClick={() => setFilter('type', 'revenu')} color="text-accent-green" />
        <FilterChip label="Dépenses" active={filters.type === 'depense'} onClick={() => setFilter('type', 'depense')} color="text-accent-red" />
        <FilterChip label="En attente" active={filters.payment_status === 'en_attente'} onClick={() => setFilter('payment_status', 'en_attente')} color="text-accent-orange" />
        <FilterChip label="Payées" active={filters.payment_status === 'paye'} onClick={() => setFilter('payment_status', 'paye')} color="text-accent-green" />
      </div>

      {/* Liste */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-surface-200">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-surface-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-48 h-3.5 bg-surface-100 rounded animate-pulse" />
                  <div className="w-32 h-3 bg-surface-100 rounded animate-pulse" />
                </div>
                <div className="w-24 h-5 bg-surface-100 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
              <Receipt size={24} className="text-brand-300" />
            </div>
            <p className="text-sm font-medium text-brand-900/50">Aucune transaction</p>
            <p className="text-xs text-brand-900/30 mt-1">
              {search || filters.type || filters.payment_status
                ? 'Essaie de modifier les filtres'
                : 'Commence par ajouter une transaction'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-surface-200">
            {filtered.map((tx) => (
              <TransactionRow
                key={tx.id}
                tx={tx}
                isAdmin={isAdmin}
                onClick={() => isAdmin && setEditing(tx)}
              />
            ))}
          </div>
        )}
      </div>

      {showCreate && <TransactionDialog onClose={() => setShowCreate(false)} />}
      {editing && <TransactionDialog transaction={editing} onClose={() => setEditing(null)} />}
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, bg }) {
  return (
    <div className="card p-4">
      <div className="flex items-center justify-between mb-3">
        <p className="text-xs font-semibold uppercase tracking-wider text-brand-900/40">{label}</p>
        <div className={`w-8 h-8 rounded-lg ${bg} flex items-center justify-center`}>
          <Icon size={16} className={color} />
        </div>
      </div>
      <p className={`font-display font-bold text-xl ${color}`}>{value}</p>
    </div>
  )
}

function FilterChip({ label, active, onClick, color }) {
  return (
    <button
      onClick={onClick}
      className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all border ${
        active
          ? `${color} bg-current/10 border-current/20`
          : 'text-brand-900/40 bg-surface-100 border-transparent hover:bg-surface-200'
      }`}
      style={active ? { backgroundColor: 'color-mix(in srgb, currentColor 10%, transparent)', borderColor: 'color-mix(in srgb, currentColor 20%, transparent)' } : {}}
    >
      {label}
    </button>
  )
}

function TransactionRow({ tx, isAdmin, onClick }) {
  const isRevenu = tx.type === 'revenu'

  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-4 px-4 py-3.5 transition-colors text-left ${isAdmin ? 'hover:bg-surface-50 cursor-pointer' : 'cursor-default'}`}
    >
      {/* Icône type */}
      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 text-sm font-bold ${
        isRevenu ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
      }`}>
        {isRevenu ? '+' : '−'}
      </div>

      {/* Infos */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-brand-900 truncate">
          {tx.description || CATEGORY_LABELS[tx.category] || tx.category}
        </p>
        <div className="flex items-center gap-2 mt-0.5 flex-wrap">
          <span className="text-xs text-brand-900/40">{formatDate(tx.date)}</span>
          {tx.profiles?.full_name && (
            <span className="text-xs text-brand-900/40">· {tx.profiles.full_name}</span>
          )}
          <span className="badge bg-surface-100 text-brand-900/50 text-[10px]">
            {CATEGORY_LABELS[tx.category] || tx.category}
          </span>
        </div>
      </div>

      {/* Montant + statut */}
      <div className="text-right flex-shrink-0">
        <p className={`text-base font-bold ${isRevenu ? 'text-accent-green' : 'text-accent-red'}`}>
          {isRevenu ? '+' : '−'}{formatCurrency(tx.amount)}
        </p>
        <span className={`badge text-[10px] mt-0.5 ${
          tx.payment_status === 'paye' ? 'badge-success'
          : tx.payment_status === 'annule' ? 'badge-danger'
          : 'badge-warning'
        }`}>
          {paymentStatusLabels[tx.payment_status]}
        </span>
      </div>
    </button>
  )
}
