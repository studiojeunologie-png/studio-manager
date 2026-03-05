import { useAuth } from '@/hooks/useAuth'
import { 
  TrendingUp, Calendar, Users, Receipt, 
  ArrowUpRight, ArrowDownRight 
} from 'lucide-react'

export default function DashboardPage() {
  const { profile } = useAuth()

  // Données placeholder — sera connecté à Supabase en Phase 5
  const kpiCards = [
    {
      label: "Chiffre d'affaires",
      value: '—',
      change: null,
      icon: TrendingUp,
      color: 'brand',
      bgClass: 'bg-brand-50',
      iconClass: 'text-brand-500',
    },
    {
      label: 'Sessions ce mois',
      value: '—',
      change: null,
      icon: Calendar,
      color: 'blue',
      bgClass: 'bg-blue-50',
      iconClass: 'text-blue-500',
    },
    {
      label: 'Clients actifs',
      value: '—',
      change: null,
      icon: Users,
      color: 'green',
      bgClass: 'bg-emerald-50',
      iconClass: 'text-emerald-500',
    },
    {
      label: 'Transactions en attente',
      value: '—',
      change: null,
      icon: Receipt,
      color: 'orange',
      bgClass: 'bg-amber-50',
      iconClass: 'text-amber-500',
    },
  ]

  return (
    <div className="space-y-6">
      {/* Bannière de bienvenue */}
      <div className="card p-6 bg-gradient-to-r from-brand-500 to-brand-600 border-none text-white relative overflow-hidden">
        <div className="absolute top-[-30%] right-[-5%] w-48 h-48 rounded-full bg-white/10" />
        <div className="absolute bottom-[-40%] right-[10%] w-32 h-32 rounded-full bg-white/5" />
        <div className="relative z-10">
          <h2 className="font-display text-2xl font-bold mb-1">
            Bienvenue, {profile?.full_name?.split(' ')[0]} !
          </h2>
          <p className="text-white/70 text-sm">
            Voici un aperçu de l'activité de ton studio.
          </p>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <div key={kpi.label} className="card p-5 cursor-pointer group">
            <div className="flex items-start justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${kpi.bgClass} flex items-center justify-center`}>
                <kpi.icon size={20} className={kpi.iconClass} />
              </div>
              {kpi.change !== null && (
                <span className={`flex items-center gap-0.5 text-xs font-semibold ${
                  kpi.change >= 0 ? 'text-accent-green' : 'text-accent-red'
                }`}>
                  {kpi.change >= 0 ? <ArrowUpRight size={14} /> : <ArrowDownRight size={14} />}
                  {Math.abs(kpi.change)}%
                </span>
              )}
            </div>
            <p className="font-display text-2xl font-bold text-brand-900">{kpi.value}</p>
            <p className="text-xs text-brand-900/40 mt-1">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Placeholder sections */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="card p-6">
          <h3 className="font-display font-semibold text-brand-900 mb-4">Prochaines sessions</h3>
          <div className="flex items-center justify-center h-40 text-brand-900/20 text-sm">
            Les sessions apparaîtront ici après la Phase 3
          </div>
        </div>
        <div className="card p-6">
          <h3 className="font-display font-semibold text-brand-900 mb-4">Dernières transactions</h3>
          <div className="flex items-center justify-center h-40 text-brand-900/20 text-sm">
            Les transactions apparaîtront ici après la Phase 4
          </div>
        </div>
      </div>
    </div>
  )
}
