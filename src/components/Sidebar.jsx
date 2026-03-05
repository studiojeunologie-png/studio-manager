import { NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'
import {
  LayoutDashboard,
  Users,
  Calendar,
  Receipt,
  FolderOpen,
  LogOut,
  Music2,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react'
import { useState } from 'react'
import { cn } from '@/lib/utils'

export default function Sidebar() {
  const { profile, isAdmin, signOut } = useAuth()
  const [collapsed, setCollapsed] = useState(false)
  const location = useLocation()

  // Navigation admin
  const adminNav = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/clients', icon: Users, label: 'Clients' },
    { to: '/calendar', icon: Calendar, label: 'Calendrier' },
    { to: '/transactions', icon: Receipt, label: 'Transactions' },
    { to: '/media', icon: FolderOpen, label: 'Média' },
  ]

  // Navigation client
  const clientNav = [
    { to: '/calendar', icon: Calendar, label: 'Mes sessions' },
    { to: '/transactions', icon: Receipt, label: 'Mes transactions' },
    { to: '/media', icon: FolderOpen, label: 'Mes fichiers' },
  ]

  const navItems = isAdmin ? adminNav : clientNav

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 h-screen bg-brand-900 text-white flex flex-col z-40',
        'transition-all duration-300 ease-out shadow-sidebar',
        collapsed ? 'w-[72px]' : 'w-[260px]'
      )}
    >
      {/* ── Logo ── */}
      <div className={cn(
        'flex items-center gap-3 px-5 h-16 border-b border-white/10',
        collapsed && 'justify-center px-0'
      )}>
        <div className="w-9 h-9 rounded-xl bg-brand-500 flex items-center justify-center flex-shrink-0">
          <Music2 size={20} className="text-white" />
        </div>
        {!collapsed && (
          <span className="font-display font-bold text-lg tracking-tight animate-fade-in">
            Studio Manager
          </span>
        )}
      </div>

      {/* ── Navigation ── */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {!collapsed && (
          <p className="text-[11px] font-semibold uppercase tracking-widest text-white/30 px-3 mb-3">
            {isAdmin ? 'Gestion' : 'Mon espace'}
          </p>
        )}
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              cn(
                'flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
                'transition-all duration-150 group',
                collapsed && 'justify-center px-0',
                isActive
                  ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/25'
                  : 'text-white/60 hover:text-white hover:bg-white/8'
              )
            }
          >
            <item.icon size={20} className="flex-shrink-0" />
            {!collapsed && (
              <span className="animate-fade-in">{item.label}</span>
            )}
          </NavLink>
        ))}
      </nav>

      {/* ── Profil + actions ── */}
      <div className="border-t border-white/10 p-3 space-y-2">
        {/* Toggle sidebar */}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center gap-2 px-3 py-2 rounded-xl
                     text-white/40 hover:text-white hover:bg-white/8 transition-all text-sm"
        >
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!collapsed && <span>Réduire</span>}
        </button>

        {/* Profile card */}
        <div className={cn(
          'flex items-center gap-3 px-3 py-2.5 rounded-xl bg-white/5',
          collapsed && 'justify-center px-0'
        )}>
          <div className="w-8 h-8 rounded-lg bg-brand-500/60 flex items-center justify-center text-sm font-bold flex-shrink-0">
            {profile?.full_name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0 animate-fade-in">
              <p className="text-sm font-medium text-white truncate">
                {profile?.full_name || 'Utilisateur'}
              </p>
              <p className="text-[11px] text-white/40 capitalize">
                {profile?.role || 'client'}
              </p>
            </div>
          )}
        </div>

        {/* Déconnexion */}
        <button
          onClick={signOut}
          className={cn(
            'w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium',
            'text-accent-red/80 hover:text-accent-red hover:bg-accent-red/10 transition-all',
            collapsed && 'justify-center px-0'
          )}
        >
          <LogOut size={18} />
          {!collapsed && <span>Déconnexion</span>}
        </button>
      </div>
    </aside>
  )
}
