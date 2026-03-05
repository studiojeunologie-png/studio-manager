import { useAuth } from '@/hooks/useAuth'
import { Search, Bell } from 'lucide-react'
import { useLocation } from 'react-router-dom'

const pageTitles = {
  '/dashboard': 'Dashboard',
  '/clients': 'Clients',
  '/calendar': 'Calendrier',
  '/transactions': 'Transactions',
  '/media': 'Média',
}

export default function Header() {
  const { profile } = useAuth()
  const location = useLocation()

  const title = pageTitles[location.pathname] || 'Studio Manager'

  // Message de bienvenue selon l'heure
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon après-midi' : 'Bonsoir'

  return (
    <header className="h-16 bg-white/80 backdrop-blur-lg border-b border-surface-200/60 
                        flex items-center justify-between px-6 sticky top-0 z-30">
      {/* Gauche : titre + salutation */}
      <div>
        <h1 className="font-display font-bold text-xl text-brand-900">
          {title}
        </h1>
        <p className="text-xs text-brand-900/40">
          {greeting}, {profile?.full_name?.split(' ')[0] || 'Utilisateur'}
        </p>
      </div>

      {/* Droite : recherche + notifications */}
      <div className="flex items-center gap-3">
        {/* Barre de recherche */}
        <div className="relative">
          <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-brand-900/30" />
          <input
            type="text"
            placeholder="Rechercher..."
            className="pl-9 pr-4 py-2 w-64 bg-surface-50 border border-surface-200 rounded-xl
                       text-sm text-brand-900 placeholder:text-brand-900/30
                       focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400
                       transition-all duration-150"
          />
        </div>

        {/* Notifications */}
        <button className="relative w-10 h-10 flex items-center justify-center rounded-xl
                           hover:bg-surface-100 transition-all">
          <Bell size={18} className="text-brand-900/50" />
          <span className="absolute top-2 right-2 w-2 h-2 bg-accent-red rounded-full" />
        </button>

        {/* Avatar */}
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center 
                        text-white text-sm font-bold cursor-pointer hover:bg-brand-600 transition-all">
          {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
        </div>
      </div>
    </header>
  )
}
