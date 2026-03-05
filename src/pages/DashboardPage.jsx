import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line
} from 'recharts'
import {
  TrendingUp, TrendingDown, Calendar, Users, Clock,
  ArrowRight, ChevronRight, Wallet
} from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { useTransactions, useTransactionsSummary } from '@/hooks/useTransactions'
import { useSessions } from '@/hooks/useSessions'
import { useClients } from '@/hooks/useClients'
import { formatCurrency, formatDate, formatDateTime, sessionTypeColors, sessionTypeLabels, sessionStatusLabels, paymentStatusLabels } from '@/lib/utils'

// Génère les données mensuelles pour le graphique (12 derniers mois)
function buildMonthlyChart(transactions) {
  const months = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    months.push({
      name: d.toLocaleDateString('fr-FR', { month: 'short' }),
      key: `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`,
      revenus: 0,
      depenses: 0,
    })
  }
  transactions?.forEach((t) => {
    const key = t.date?.slice(0, 7)
    const m = months.find((m) => m.key === key)
    if (!m) return
    if (t.type === 'revenu') m.revenus += Number(t.amount)
    else m.depenses += Number(t.amount)
  })
  return months
}

export default function DashboardPage() {
  const { profile } = useAuth()
  const navigate = useNavigate()
  const [period, setPeriod] = useState('mois')

  const { data: transactions = [] } = useTransactions({})
  const { data: summary } = useTransactionsSummary()
  const { data: sessions = [] } = useSessions()
  const { data: clients = [] } = useClients()

  const chartData = buildMonthlyChart(transactions)

  // Prochaines sessions (à venir, triées)
  const now = new Date()
  const upcoming = sessions
    .filter((s) => new Date(s.start_time) > now && s.status !== 'annulee')
    .sort((a, b) => new Date(a.start_time) - new Date(b.start_time))
    .slice(0, 5)

  // Dernières transactions
  const recentTx = [...transactions]
    .sort((a, b) => new Date(b.date) - new Date(a.date))
    .slice(0, 5)

  // Sessions ce mois
  const sessionsThisMonth = sessions.filter((s) => {
    const d = new Date(s.start_time)
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear()
  })

  return (
    <div className="space-y-6">
      {/* Bannière */}
      <div className="rounded-2xl p-6 bg-gradient-to-r from-brand-800 to-brand-500 text-white relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-5%] w-56 h-56 rounded-full bg-white/10" />
        <div className="absolute bottom-[-50%] right-[12%] w-36 h-36 rounded-full bg-white/5" />
        <div className="relative z-10">
          <p className="text-white/60 text-sm mb-1">
            {new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}
          </p>
          <h2 className="font-display text-2xl font-bold mb-1">
            Bonjour, {profile?.full_name?.split(' ')[0]} !
          </h2>
          <p className="text-white/70 text-sm">
            {upcoming.length > 0
              ? `${upcoming.length} session${upcoming.length > 1 ? 's' : ''} à venir cette semaine.`
              : 'Aucune session à venir prochainement.'}
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard
          label="Chiffre d'affaires"
          value={summary ? formatCurrency(summary.revenus) : '—'}
          icon={TrendingUp}
          color="text-accent-green"
          bg="bg-accent-green/10"
          onClick={() => navigate('/transactions')}
        />
        <KpiCard
          label="Dépenses"
          value={summary ? formatCurrency(summary.depenses) : '—'}
          icon={TrendingDown}
          color="text-accent-red"
          bg="bg-accent-red/10"
          onClick={() => navigate('/transactions')}
        />
        <KpiCard
          label="Sessions ce mois"
          value={String(sessionsThisMonth.length)}
          icon={Calendar}
          color="text-brand-500"
          bg="bg-brand-50"
          onClick={() => navigate('/calendar')}
        />
        <KpiCard
          label="En attente"
          value={summary ? formatCurrency(summary.enAttente) : '—'}
          icon={Clock}
          color="text-accent-orange"
          bg="bg-accent-orange/10"
          onClick={() => navigate('/transactions')}
        />
      </div>

      {/* Graphique CA + Prochaines sessions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Graphique */}
        <div className="card p-5 lg:col-span-2">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-display font-semibold text-brand-900">Chiffre d'affaires</h3>
            <span className="text-xs text-brand-900/40">12 derniers mois</span>
          </div>
          {chartData.every((m) => m.revenus === 0 && m.depenses === 0) ? (
            <div className="flex items-center justify-center h-48 text-brand-900/20 text-sm">
              Aucune donnée financière
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={chartData} barSize={10} barGap={2}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EBEBF0" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: 'rgba(26,26,46,0.4)' }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: 'rgba(26,26,46,0.4)' }} axisLine={false} tickLine={false} tickFormatter={(v) => `${(v/1000).toFixed(0)}k`} />
                <Tooltip
                  formatter={(v, name) => [formatCurrency(v), name === 'revenus' ? 'Revenus' : 'Dépenses']}
                  contentStyle={{ borderRadius: '12px', border: '1px solid #EBEBF0', fontSize: '12px' }}
                />
                <Bar dataKey="revenus" fill="#6C63FF" radius={[4, 4, 0, 0]} />
                <Bar dataKey="depenses" fill="#FF6B6B" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </div>

        {/* Prochaines sessions */}
        <div className="card p-5 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-brand-900">Sessions à venir</h3>
            <button onClick={() => navigate('/calendar')} className="btn-ghost py-1 px-2 text-xs flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </button>
          </div>
          {upcoming.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-sm text-brand-900/25">
              Aucune session à venir
            </div>
          ) : (
            <div className="space-y-2 flex-1">
              {upcoming.map((s) => {
                const colors = sessionTypeColors[s.session_type] || sessionTypeColors.autre
                return (
                  <div key={s.id} className="flex items-start gap-3 p-2.5 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${colors.dot}`} />
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-brand-900 truncate">
                        {s.title || s.profiles?.full_name || 'Session'}
                      </p>
                      <p className="text-xs text-brand-900/40 mt-0.5">
                        {formatDateTime(s.start_time)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dernières transactions + Clients */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Dernières transactions */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-brand-900">Dernières transactions</h3>
            <button onClick={() => navigate('/transactions')} className="btn-ghost py-1 px-2 text-xs flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </button>
          </div>
          {recentTx.length === 0 ? (
            <div className="flex items-center justify-center h-32 text-sm text-brand-900/25">
              Aucune transaction
            </div>
          ) : (
            <div className="space-y-1">
              {recentTx.map((tx) => {
                const isRevenu = tx.type === 'revenu'
                return (
                  <div key={tx.id} className="flex items-center gap-3 py-2 px-2 rounded-xl hover:bg-surface-50 transition-colors">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${isRevenu ? 'bg-accent-green/10 text-accent-green' : 'bg-accent-red/10 text-accent-red'}`}>
                      {isRevenu ? '+' : '−'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-brand-900 truncate">
                        {tx.description || tx.category}
                      </p>
                      <p className="text-xs text-brand-900/40">{formatDate(tx.date)}</p>
                    </div>
                    <p className={`text-sm font-bold flex-shrink-0 ${isRevenu ? 'text-accent-green' : 'text-accent-red'}`}>
                      {isRevenu ? '+' : '−'}{formatCurrency(tx.amount)}
                    </p>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Résumé clients */}
        <div className="card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display font-semibold text-brand-900">Clients</h3>
            <button onClick={() => navigate('/clients')} className="btn-ghost py-1 px-2 text-xs flex items-center gap-1">
              Voir tout <ChevronRight size={12} />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="p-3 rounded-xl bg-surface-50 text-center">
              <p className="font-display font-bold text-2xl text-brand-500">{clients.length}</p>
              <p className="text-xs text-brand-900/40 mt-0.5">Clients total</p>
            </div>
            <div className="p-3 rounded-xl bg-surface-50 text-center">
              <p className="font-display font-bold text-2xl text-accent-green">{sessionsThisMonth.length}</p>
              <p className="text-xs text-brand-900/40 mt-0.5">Sessions ce mois</p>
            </div>
          </div>
          {/* Derniers clients */}
          <div className="space-y-1">
            {clients.slice(0, 4).map((c) => {
              const initials = c.full_name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || '?'
              return (
                <div key={c.id} className="flex items-center gap-3 py-1.5 px-2 rounded-xl hover:bg-surface-50 transition-colors">
                  <div className="w-7 h-7 rounded-lg bg-brand-100 flex items-center justify-center text-xs font-bold text-brand-600 flex-shrink-0">
                    {initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-brand-900 truncate">{c.full_name}</p>
                    {c.artist_name && <p className="text-xs text-brand-900/40 truncate">{c.artist_name}</p>}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}

function KpiCard({ label, value, icon: Icon, color, bg, onClick }) {
  return (
    <div className="card p-5 cursor-pointer group" onClick={onClick}>
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl ${bg} flex items-center justify-center`}>
          <Icon size={20} className={color} />
        </div>
        <ChevronRight size={14} className="text-brand-900/20 group-hover:text-brand-400 transition-colors mt-1" />
      </div>
      <p className={`font-display text-2xl font-bold ${color}`}>{value}</p>
      <p className="text-xs text-brand-900/40 mt-1">{label}</p>
    </div>
  )
}
