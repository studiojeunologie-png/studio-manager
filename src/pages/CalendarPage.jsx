import { useState, useRef } from 'react'
import FullCalendar from '@fullcalendar/react'
import dayGridPlugin from '@fullcalendar/daygrid'
import timeGridPlugin from '@fullcalendar/timegrid'
import interactionPlugin from '@fullcalendar/interaction'
import frLocale from '@fullcalendar/core/locales/fr.js'
import { Plus } from 'lucide-react'
import { useSessions, useRescheduleSession } from '@/hooks/useSessions'
import { useAuth } from '@/hooks/useAuth'
import { sessionTypeColors } from '@/lib/utils'
import SessionDialog from '@/components/sessions/SessionDialog'

// Couleurs FullCalendar par type de session
const FC_COLORS = {
  enregistrement: { backgroundColor: '#6C63FF', borderColor: '#5A52D9' },
  mixage:         { backgroundColor: '#54A0FF', borderColor: '#3d8fe0' },
  mastering:      { backgroundColor: '#a78bfa', borderColor: '#7c3aed' },
  composition:    { backgroundColor: '#FF9F43', borderColor: '#e08a2c' },
  autre:          { backgroundColor: '#9ca3af', borderColor: '#6b7280' },
}

export default function CalendarPage() {
  const { isAdmin } = useAuth()
  const { data: sessions = [], isLoading } = useSessions()
  const reschedule = useRescheduleSession()
  const calendarRef = useRef(null)

  const [dialog, setDialog] = useState(null)
  // dialog: null | { mode: 'create', start, end } | { mode: 'edit', session }

  // Convertit les sessions DB en events FullCalendar
  const events = sessions.map((s) => ({
    id: s.id,
    title: s.title || s.profiles?.full_name || 'Session',
    start: s.start_time,
    end: s.end_time,
    extendedProps: { session: s },
    ...FC_COLORS[s.session_type] || FC_COLORS.autre,
    textColor: '#ffffff',
    borderRadius: '8px',
    classNames: ['fc-session-event'],
  }))

  // Clic sur un créneau vide → créer
  function handleDateSelect(info) {
    if (!isAdmin) return
    setDialog({ mode: 'create', start: info.startStr, end: info.endStr })
    info.view.calendar.unselect()
  }

  // Clic sur un event → éditer
  function handleEventClick(info) {
    setDialog({ mode: 'edit', session: info.event.extendedProps.session })
  }

  // Drag & drop ou resize
  function handleEventChange(info) {
    if (!isAdmin) return
    reschedule.mutate({
      id: info.event.id,
      start_time: info.event.start.toISOString(),
      end_time: info.event.end ? info.event.end.toISOString() : info.event.start.toISOString(),
    }, {
      onError: () => info.revert(),
    })
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="font-display font-bold text-2xl text-brand-900">Calendrier</h1>
        {isAdmin && (
          <button className="btn-primary" onClick={() => setDialog({ mode: 'create', start: null, end: null })}>
            <Plus size={16} />
            Nouvelle session
          </button>
        )}
      </div>

      {/* Légende */}
      {isAdmin && (
        <div className="flex items-center gap-4 flex-wrap">
          {Object.entries(FC_COLORS).map(([type, colors]) => (
            <div key={type} className="flex items-center gap-1.5">
              <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: colors.backgroundColor }} />
              <span className="text-xs text-brand-900/50 capitalize">
                {{ enregistrement: 'Enregistrement', mixage: 'Mixage', mastering: 'Mastering', composition: 'Composition', autre: 'Autre' }[type]}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* Calendrier */}
      <div className="card p-0 overflow-hidden">
        {isLoading ? (
          <div className="h-[600px] flex items-center justify-center">
            <span className="w-8 h-8 border-2 border-brand-200 border-t-brand-500 rounded-full animate-spin" />
          </div>
        ) : (
          <div className="fc-wrapper p-4">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
              locale={frLocale}
              initialView="timeGridWeek"
              headerToolbar={{
                left: 'prev,next today',
                center: 'title',
                right: 'dayGridMonth,timeGridWeek,timeGridDay',
              }}
              height={620}
              events={events}
              selectable={isAdmin}
              selectMirror={isAdmin}
              editable={isAdmin}
              droppable={isAdmin}
              select={handleDateSelect}
              eventClick={handleEventClick}
              eventChange={handleEventChange}
              eventDisplay="block"
              slotMinTime="08:00:00"
              slotMaxTime="23:00:00"
              allDaySlot={false}
              nowIndicator={true}
              businessHours={{ daysOfWeek: [1, 2, 3, 4, 5, 6], startTime: '09:00', endTime: '22:00' }}
              slotLabelFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
              eventTimeFormat={{ hour: '2-digit', minute: '2-digit', hour12: false }}
            />
          </div>
        )}
      </div>

      {/* Modal session */}
      {dialog?.mode === 'create' && (
        <SessionDialog
          defaultStart={dialog.start}
          defaultEnd={dialog.end}
          onClose={() => setDialog(null)}
        />
      )}
      {dialog?.mode === 'edit' && (
        <SessionDialog
          session={dialog.session}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  )
}
