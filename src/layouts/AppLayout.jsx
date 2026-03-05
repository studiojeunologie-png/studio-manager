import { Outlet } from 'react-router-dom'
import Sidebar from '@/components/Sidebar'
import Header from '@/components/Header'

export default function AppLayout() {
  return (
    <div className="min-h-screen bg-surface-50">
      <Sidebar />
      {/* Contenu principal — décalé de la sidebar */}
      <div className="ml-[260px] transition-all duration-300">
        <Header />
        <main className="p-6 animate-fade-in">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
