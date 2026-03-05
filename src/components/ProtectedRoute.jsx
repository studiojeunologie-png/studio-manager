import { Navigate } from 'react-router-dom'
import { useAuth } from '@/hooks/useAuth'

/**
 * Route protégée — redirige vers /login si non connecté
 * Si adminOnly=true, redirige les clients vers /calendar
 */
export default function ProtectedRoute({ children, adminOnly = false }) {
  const { user, profile, loading } = useAuth()

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center bg-surface-50">
        <div className="flex flex-col items-center gap-4 animate-fade-in">
          <div className="w-10 h-10 border-3 border-brand-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-brand-900/40 font-medium">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (adminOnly && profile?.role !== 'admin') {
    return <Navigate to="/calendar" replace />
  }

  return children
}
