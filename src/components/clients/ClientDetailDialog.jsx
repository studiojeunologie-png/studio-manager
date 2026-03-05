import { useState } from 'react'
import {
  X, Mail, Phone, Music, StickyNote, Calendar, CreditCard,
  FolderOpen, Edit2, KeyRound, Trash2, Clock
} from 'lucide-react'
import { useClient, useResetClientPassword, useDeleteClient } from '@/hooks/useClients'
import { formatDate, formatDateTime, formatCurrency, sessionTypeColors, sessionTypeLabels, sessionStatusLabels, paymentStatusLabels } from '@/lib/utils'
import ClientDialog from './ClientDialog'

const TABS = [
  { id: 'infos', label: 'Infos', icon: StickyNote },
  { id: 'sessions', label: 'Sessions', icon: Calendar },
  { id: 'transactions', label: 'Transactions', icon: CreditCard },
  { id: 'fichiers', label: 'Fichiers', icon: FolderOpen },
]

export default function ClientDetailDialog({ clientId, onClose }) {
  const [activeTab, setActiveTab] = useState('infos')
  const [showEdit, setShowEdit] = useState(false)
  const [confirmDelete, setConfirmDelete] = useState(false)

  const { data: client, isLoading } = useClient(clientId)
  const resetPassword = useResetClientPassword()
  const deleteClient = useDeleteClient()

  const initials = client?.full_name
    ? client.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'

  async function handleDelete() {
    await deleteClient.mutateAsync(clientId)
    onClose()
  }

  if (showEdit && client) {
    return <ClientDialog client={client} onClose={() => setShowEdit(false)} />
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-brand-900/50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[88vh] flex flex-col animate-scale-in">

        {/* ── Bannière ── */}
        <div className="relative rounded-t-2xl bg-gradient-to-r from-brand-800 to-brand-500 px-6 pt-6 pb-4">
          <button
            onClick={onClose}
            className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
          >
            <X size={16} />
          </button>

          {isLoading ? (
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-white/10 animate-pulse" />
              <div className="space-y-2">
                <div className="w-32 h-4 bg-white/10 rounded animate-pulse" />
                <div className="w-24 h-3 bg-white/10 rounded animate-pulse" />
              </div>
            </div>
          ) : (
            <div className="flex items-end gap-4">
              {/* Avatar */}
              <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center text-white font-display font-bold text-xl flex-shrink-0">
                {initials}
              </div>
              {/* Infos */}
              <div className="flex-1 min-w-0 pb-1">
                <h2 className="font-display font-bold text-xl text-white truncate">
                  {client?.full_name}
                </h2>
                <div className="flex items-center gap-2 mt-1 flex-wrap">
                  {client?.artist_name && (
                    <span className="text-sm text-white/70 flex items-center gap-1">
                      <Music size={12} />
                      {client.artist_name}
                    </span>
                  )}
                  <span className="badge bg-white/20 text-white text-[11px]">Client</span>
                </div>
                <p className="text-xs text-white/50 mt-1 flex items-center gap-1">
                  <Clock size={11} />
                  Membre depuis {client?.created_at ? formatDate(client.created_at) : '—'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* ── Tabs ── */}
        <div className="flex border-b border-surface-200 px-6">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-brand-500 text-brand-500'
                  : 'border-transparent text-brand-900/40 hover:text-brand-900/70'
              }`}
            >
              <tab.icon size={14} />
              {tab.label}
              {tab.id === 'sessions' && client?.sessions?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-brand-50 text-brand-500 text-[10px] font-bold rounded-md">
                  {client.sessions.length}
                </span>
              )}
              {tab.id === 'transactions' && client?.transactions?.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 bg-brand-50 text-brand-500 text-[10px] font-bold rounded-md">
                  {client.transactions.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* ── Contenu ── */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-surface-100 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : (
            <>
              {activeTab === 'infos' && <InfosTab client={client} />}
              {activeTab === 'sessions' && <SessionsTab sessions={client?.sessions} />}
              {activeTab === 'transactions' && <TransactionsTab transactions={client?.transactions} />}
              {activeTab === 'fichiers' && <FichiersTab />}
            </>
          )}
        </div>

        {/* ── Actions ── */}
        <div className="border-t border-surface-200 px-6 py-4 flex items-center justify-between">
          {confirmDelete ? (
            <div className="flex items-center gap-3 w-full">
              <p className="text-sm text-accent-red font-medium flex-1">
                Supprimer définitivement ce client ?
              </p>
              <button className="btn-secondary text-sm py-2" onClick={() => setConfirmDelete(false)}>
                Annuler
              </button>
              <button
                className="btn-danger text-sm py-2"
                onClick={handleDelete}
                disabled={deleteClient.isPending}
              >
                {deleteClient.isPending ? (
                  <span className="w-4 h-4 border-2 border-accent-red/40 border-t-accent-red rounded-full animate-spin" />
                ) : (
                  'Confirmer la suppression'
                )}
              </button>
            </div>
          ) : (
            <>
              <button
                className="btn-danger py-2 text-sm"
                onClick={() => setConfirmDelete(true)}
              >
                <Trash2 size={15} />
                Supprimer
              </button>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary py-2 text-sm"
                  onClick={() => client && resetPassword.mutate(client.email)}
                  disabled={resetPassword.isPending || !client}
                >
                  <KeyRound size={15} />
                  Réinitialiser le mot de passe
                </button>
                <button
                  className="btn-primary py-2 text-sm"
                  onClick={() => setShowEdit(true)}
                >
                  <Edit2 size={15} />
                  Modifier
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}

// ── Onglet Infos ───────────────────────────────────────────────
function InfosTab({ client }) {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-900/30 mb-3">
          Informations personnelles
        </h3>
        <div className="grid grid-cols-2 gap-3">
          <InfoRow icon={Mail} label="Email" value={client?.email} />
          <InfoRow icon={Phone} label="Téléphone" value={client?.phone || '—'} />
          <InfoRow icon={Music} label="Nom d'artiste" value={client?.artist_name || '—'} />
        </div>
      </div>

      {client?.notes && (
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-900/30 mb-3">
            Notes internes
          </h3>
          <p className="text-sm text-brand-900/70 bg-surface-50 rounded-xl p-4 leading-relaxed">
            {client.notes}
          </p>
        </div>
      )}

      <div>
        <h3 className="text-xs font-semibold uppercase tracking-widest text-brand-900/30 mb-3">
          Statistiques
        </h3>
        <div className="grid grid-cols-3 gap-3">
          <StatCard
            label="Sessions"
            value={client?.sessions?.length ?? 0}
            color="text-brand-500"
          />
          <StatCard
            label="Transactions"
            value={client?.transactions?.length ?? 0}
            color="text-accent-blue"
          />
          <StatCard
            label="Membre depuis"
            value={client?.created_at ? formatDate(client.created_at, { year: 'numeric', month: 'short' }) : '—'}
            color="text-accent-green"
            small
          />
        </div>
      </div>
    </div>
  )
}

function InfoRow({ icon: Icon, label, value }) {
  return (
    <div className="flex items-start gap-3 p-3 rounded-xl bg-surface-50">
      <div className="w-8 h-8 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0 mt-0.5">
        <Icon size={14} className="text-brand-400" />
      </div>
      <div>
        <p className="text-[11px] text-brand-900/40 font-medium uppercase tracking-wide">{label}</p>
        <p className="text-sm text-brand-900 font-medium mt-0.5">{value}</p>
      </div>
    </div>
  )
}

function StatCard({ label, value, color, small = false }) {
  return (
    <div className="p-3 rounded-xl bg-surface-50 text-center">
      <p className={`font-display font-bold ${small ? 'text-base' : 'text-2xl'} ${color}`}>
        {value}
      </p>
      <p className="text-[11px] text-brand-900/40 mt-0.5">{label}</p>
    </div>
  )
}

// ── Onglet Sessions ────────────────────────────────────────────
function SessionsTab({ sessions }) {
  if (!sessions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <Calendar size={32} className="text-brand-200 mb-3" />
        <p className="text-sm text-brand-900/40">Aucune session pour ce client</p>
      </div>
    )
  }

  const sorted = [...sessions].sort(
    (a, b) => new Date(b.start_time) - new Date(a.start_time)
  )

  return (
    <div className="space-y-2">
      {sorted.map((session) => {
        const colors = sessionTypeColors[session.session_type] || sessionTypeColors.autre
        return (
          <div key={session.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div className={`w-2 h-2 rounded-full flex-shrink-0 ${colors.dot}`} />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-900 truncate">
                {session.title || sessionTypeLabels[session.session_type]}
              </p>
              <p className="text-xs text-brand-900/40 mt-0.5">
                {session.start_time ? formatDateTime(session.start_time) : '—'}
              </p>
            </div>
            <span className={`badge ${colors.bg} ${colors.text}`}>
              {sessionStatusLabels[session.status] || session.status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ── Onglet Transactions ────────────────────────────────────────
function TransactionsTab({ transactions }) {
  if (!transactions?.length) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <CreditCard size={32} className="text-brand-200 mb-3" />
        <p className="text-sm text-brand-900/40">Aucune transaction pour ce client</p>
      </div>
    )
  }

  const sorted = [...transactions].sort(
    (a, b) => new Date(b.date) - new Date(a.date)
  )

  return (
    <div className="space-y-2">
      {sorted.map((tx) => {
        const isRevenu = tx.type === 'revenu'
        return (
          <div key={tx.id} className="flex items-center gap-3 p-3 rounded-xl hover:bg-surface-50 transition-colors">
            <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 text-xs font-bold ${
              isRevenu ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'
            }`}>
              {isRevenu ? '+' : '−'}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-brand-900 truncate">
                {tx.description || tx.category}
              </p>
              <p className="text-xs text-brand-900/40 mt-0.5">
                {tx.date ? formatDate(tx.date) : '—'}
              </p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className={`text-sm font-bold ${isRevenu ? 'text-accent-green' : 'text-accent-red'}`}>
                {isRevenu ? '+' : '−'}{formatCurrency(tx.amount)}
              </p>
              <span className={`badge text-[10px] ${
                tx.payment_status === 'paye'
                  ? 'badge-success'
                  : tx.payment_status === 'annule'
                  ? 'badge-danger'
                  : 'badge-warning'
              }`}>
                {paymentStatusLabels[tx.payment_status] || tx.payment_status}
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Onglet Fichiers ────────────────────────────────────────────
function FichiersTab() {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="w-14 h-14 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <FolderOpen size={24} className="text-brand-300" />
      </div>
      <p className="text-sm font-medium text-brand-900/50">Module Média</p>
      <p className="text-xs text-brand-900/30 mt-1">Disponible en Phase 6</p>
      <span className="badge-info mt-3">Phase 6 — Semaines 11-12</span>
    </div>
  )
}
