import { useState } from 'react'
import { Search, UserPlus, Users, Mail, Phone, Music, AlertCircle } from 'lucide-react'
import { useClients } from '@/hooks/useClients'
import { supabaseAdmin } from '@/lib/supabase-admin'
import ClientDialog from '@/components/clients/ClientDialog'
import ClientDetailDialog from '@/components/clients/ClientDetailDialog'

export default function ClientsPage() {
  const [search, setSearch] = useState('')
  const [showCreate, setShowCreate] = useState(false)
  const [selectedId, setSelectedId] = useState(null)

  const { data: clients = [], isLoading, error } = useClients(search)

  return (
    <div className="space-y-5">
      {/* Avertissement si pas de clé admin */}
      {!supabaseAdmin && (
        <div className="flex items-start gap-3 p-4 rounded-xl bg-accent-orange/10 border border-accent-orange/20">
          <AlertCircle size={18} className="text-accent-orange flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-accent-orange">Clé service_role manquante</p>
            <p className="text-xs text-accent-orange/70 mt-0.5">
              Ajoute{' '}
              <code className="bg-accent-orange/10 px-1 rounded">VITE_SUPABASE_SERVICE_ROLE_KEY</code>{' '}
              dans ton <code className="bg-accent-orange/10 px-1 rounded">.env</code> pour activer la création et suppression de clients.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="font-display font-bold text-2xl text-brand-900">Clients</h1>
          {!isLoading && <span className="badge-info">{clients.length}</span>}
        </div>
        <button
          className="btn-primary"
          onClick={() => setShowCreate(true)}
          disabled={!supabaseAdmin}
          title={!supabaseAdmin ? 'Clé service_role requise' : undefined}
        >
          <UserPlus size={16} />
          Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-900/30 pointer-events-none" />
        <input
          type="text"
          className="input pl-10"
          placeholder="Rechercher par nom, email, artiste, téléphone..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="divide-y divide-surface-200">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 rounded-xl bg-surface-100 animate-pulse flex-shrink-0" />
                <div className="flex-1 space-y-2">
                  <div className="w-40 h-3.5 bg-surface-100 rounded animate-pulse" />
                  <div className="w-56 h-3 bg-surface-100 rounded animate-pulse" />
                </div>
                <div className="w-16 h-6 bg-surface-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <AlertCircle size={32} className="text-accent-red/40 mb-3" />
            <p className="text-sm text-brand-900/50">Erreur lors du chargement</p>
            <p className="text-xs text-brand-900/30 mt-1">{error.message}</p>
          </div>
        ) : clients.length === 0 ? (
          <EmptyState search={search} onAdd={() => setShowCreate(true)} hasAdmin={!!supabaseAdmin} />
        ) : (
          <>
            <div className="grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-4 px-4 py-2.5 bg-surface-50 border-b border-surface-200 text-xs font-semibold uppercase tracking-wider text-brand-900/40">
              <div className="w-10" />
              <div>Nom</div>
              <div>Email</div>
              <div>Téléphone</div>
              <div className="text-center">Sessions</div>
              <div className="w-8" />
            </div>
            <div className="divide-y divide-surface-200">
              {clients.map((client) => (
                <ClientRow key={client.id} client={client} onClick={() => setSelectedId(client.id)} />
              ))}
            </div>
          </>
        )}
      </div>

      {showCreate && <ClientDialog onClose={() => setShowCreate(false)} />}
      {selectedId && (
        <ClientDetailDialog clientId={selectedId} onClose={() => setSelectedId(null)} />
      )}
    </div>
  )
}

function ClientRow({ client, onClick }) {
  const initials = client.full_name
    ? client.full_name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  const sessionsCount = client.sessions?.[0]?.count ?? 0

  return (
    <button
      onClick={onClick}
      className="w-full grid grid-cols-[auto_1fr_1fr_1fr_auto_auto] items-center gap-4 px-4 py-3.5 hover:bg-surface-50 transition-colors text-left group"
    >
      <div className="w-10 h-10 rounded-xl bg-brand-100 flex items-center justify-center font-display font-bold text-sm text-brand-600 flex-shrink-0">
        {initials}
      </div>
      <div className="min-w-0">
        <p className="text-sm font-semibold text-brand-900 truncate group-hover:text-brand-600 transition-colors">
          {client.full_name}
        </p>
        {client.artist_name && (
          <p className="text-xs text-brand-900/40 truncate flex items-center gap-1 mt-0.5">
            <Music size={10} />
            {client.artist_name}
          </p>
        )}
      </div>
      <div className="min-w-0">
        <p className="text-sm text-brand-900/60 truncate flex items-center gap-1.5">
          <Mail size={12} className="flex-shrink-0" />
          {client.email}
        </p>
      </div>
      <div className="min-w-0">
        {client.phone ? (
          <p className="text-sm text-brand-900/60 truncate flex items-center gap-1.5">
            <Phone size={12} className="flex-shrink-0" />
            {client.phone}
          </p>
        ) : (
          <p className="text-sm text-brand-900/20">—</p>
        )}
      </div>
      <div className="text-center">
        <span className={`badge ${sessionsCount > 0 ? 'badge-info' : 'bg-surface-100 text-brand-900/30'}`}>
          {sessionsCount}
        </span>
      </div>
      <div className="w-8 flex justify-end">
        <svg className="w-4 h-4 text-brand-900/20 group-hover:text-brand-400 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
        </svg>
      </div>
    </button>
  )
}

function EmptyState({ search, onAdd, hasAdmin }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mb-4">
        <Users size={28} className="text-brand-300" />
      </div>
      {search ? (
        <>
          <p className="text-sm font-medium text-brand-900/60">Aucun résultat pour « {search} »</p>
          <p className="text-xs text-brand-900/30 mt-1">Essaie un autre nom, email ou numéro</p>
        </>
      ) : (
        <>
          <p className="text-sm font-medium text-brand-900/60">Aucun client pour l'instant</p>
          <p className="text-xs text-brand-900/30 mt-1">Crée ton premier client pour commencer</p>
          {hasAdmin && (
            <button className="btn-primary mt-4 text-sm" onClick={onAdd}>
              <UserPlus size={15} />
              Ajouter un client
            </button>
          )}
        </>
      )}
    </div>
  )
}
