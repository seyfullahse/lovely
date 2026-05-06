import { useState, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay } from 'date-fns'
import { tr } from 'date-fns/locale'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { FiCalendar } from 'react-icons/fi'
import { SiGooglecalendar } from 'react-icons/si'
import { openInGoogleCalendar } from '@/lib/googleCalendar'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import type { Plan, Todo } from '@/types'

const locales = { 'tr': tr }
const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { weekStartsOn: 1 }),
  getDay,
  locales,
})

const messages = {
  allDay: 'Tüm gün',
  previous: '‹',
  next: '›',
  today: 'Bugün',
  month: 'Ay',
  week: 'Hafta',
  day: 'Gün',
  agenda: 'Liste',
  date: 'Tarih',
  time: 'Saat',
  event: 'Etkinlik',
  noEventsInRange: 'Bu aralıkta etkinlik yok.',
  showMore: (total: number) => `+${total} daha`
}

// Kategori ikonları
const categoryIcons = {
  spor: '⚽',
  saglik: '❤',
  muzik: '♫',
  yemek: '☕',
  seyahat: '✈',
  etkinlik: '★',
  egitim: '📚',
  diger: '○',
}

interface CalendarViewProps {
  onSelectEvent?: (resource: Plan | Todo) => void
  onSelectSlot?: (slotInfo: any) => void
}

export default function CalendarView({ onSelectEvent, onSelectSlot }: CalendarViewProps) {
  const { plans, todos } = useData()
  const [view, setView] = useState('month')
  const [date, setDate] = useState(new Date())

  const events = useMemo(() => {
    const planEvents = plans.map(plan => {
      const start = new Date(plan.plannedDate)
      // Bitiş tarihi varsa, takvimde birden fazla gün boyunca göster
      // react-big-calendar end date exclusive olduğu için +1 gün ekliyoruz
      let end: Date
      let allDay = false
      if (plan.plannedEndDate) {
        end = new Date(plan.plannedEndDate)
        end.setDate(end.getDate() + 1) // exclusive end
        allDay = true
      } else {
        end = new Date(plan.plannedDate)
      }
      return {
        id: plan.id,
        title: `${categoryIcons[plan.category] || '○'} ${plan.title}`,
        start,
        end,
        allDay,
        type: 'plan',
        status: plan.status,
        category: plan.category,
        resource: plan,
      }
    })

    const completedPlanEvents = plans
      .filter(p => p.actualDate)
      .map(plan => ({
        id: `${plan.id}-actual`,
        title: `✓ ${plan.title}`,
        start: new Date(plan.actualDate),
        end: new Date(plan.actualDate),
        type: 'plan-completed',
        status: 'completed',
        resource: plan
      }))

    const todoEvents = todos.map(todo => ({
      id: todo.id,
      title: `☐ ${todo.title}`,
      start: new Date(todo.plannedDate),
      end: new Date(todo.plannedDate),
      type: 'todo',
      status: todo.status,
      assignee: todo.assignee,
      resource: todo
    }))

    return [...planEvents, ...completedPlanEvents, ...todoEvents]
  }, [plans, todos])

  const eventStyleGetter = (event: any) => {
    let backgroundColor = '#93B5E1'
    let borderLeft = '3px solid #7AA3D4'

    if (event.status === 'completed') {
      backgroundColor = '#8ECFB0'
      borderLeft = '3px solid #6DBF9A'
    } else if (event.status === 'cancelled') {
      backgroundColor = '#C4BFC7'
      borderLeft = '3px solid #A8A1AD'
    } else if (event.type === 'todo' && event.status === 'pending') {
      backgroundColor = '#E8C97D'
      borderLeft = '3px solid #D4B465'
    }

    // Gecikmiş
    if (event.status !== 'completed' && event.status !== 'cancelled') {
      if (new Date(event.start) < new Date()) {
        backgroundColor = '#E8808C'
        borderLeft = '3px solid #D0606E'
      }
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '6px',
        border: 'none',
        borderLeft,
        color: 'white',
        fontSize: '0.72rem',
        fontWeight: 500,
        padding: '2px 6px',
        lineHeight: '1.5',
        cursor: 'pointer',
      }
    }
  }

  // Bugünün toplam etkinlik sayısı
  const todayCount = events.filter(e => {
    const today = new Date()
    return e.start.toDateString() === today.toDateString()
  }).length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl overflow-hidden"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(232,223,245,0.2)',
        boxShadow: '0 4px 24px rgba(61,44,62,0.04)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4"
        style={{ borderBottom: '1px solid rgba(232,223,245,0.15)' }}>
        <div className="flex items-center gap-3">
          <span className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: 'rgba(147,181,225,0.12)', color: '#93B5E1' }}>
            <FiCalendar size={18} />
          </span>
          <div>
            <h2 className="text-lg font-semibold"
              style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
              Takvim
            </h2>
            {todayCount > 0 && (
              <p className="text-[11px]" style={{ color: '#9A949D' }}>
                Bugün {todayCount} etkinlik
              </p>
            )}
          </div>
        </div>
        {/* Google Calendar'a Aktar butonu */}
        <motion.button
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          onClick={() => {
            // Gelecek plan ve görevleri Google Calendar'a tek tek aç
            const upcoming = events.filter(e => e.start >= new Date() && e.type !== 'plan-completed')
            if (upcoming.length === 0) {
              return
            }
            // İlk 1 tanesini aç (kullanıcı tek tek eklesin)
            const ev = upcoming[0]
            const resource = ev.resource as Plan | Todo
            openInGoogleCalendar({
              title: resource.title,
              description: (resource as any).description,
              startDate: resource.plannedDate,
              endDate: (resource as Plan).plannedEndDate,
            })
          }}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all"
          style={{ background: 'rgba(66,133,244,0.08)', color: '#4285F4', border: '1px solid rgba(66,133,244,0.15)' }}
          title="Gelecek etkinliği Google Calendar'a ekle"
        >
          <SiGooglecalendar size={13} />
          <span className="hidden sm:inline">Google'a Aktar</span>
        </motion.button>

        {/* Legend */}
        <div className="hidden md:flex gap-3">
          {[
            { color: '#93B5E1', border: '#7AA3D4', label: 'Plan' },
            { color: '#8ECFB0', border: '#6DBF9A', label: 'Tamam' },
            { color: '#E8C97D', border: '#D4B465', label: 'Görev' },
            { color: '#E8808C', border: '#D0606E', label: 'Geciken' },
          ].map(legend => (
            <span key={legend.label} className="inline-flex items-center gap-1.5 text-[11px] font-medium" style={{ color: '#8A7B8E' }}>
              <span className="w-3 h-3 rounded" style={{ background: legend.color, borderLeft: `2px solid ${legend.border}` }} />
              {legend.label}
            </span>
          ))}
        </div>
      </div>

      {/* Takvim gövdesi — Google Calendar boyutunda */}
      <div className="px-3 sm:px-4 pb-4 pt-2">
        <div className="calendar-wrapper" style={{ height: 'clamp(420px, 60vh, 680px)' }}>
          <Calendar
            localizer={localizer}
            events={events}
            view={view}
            onView={setView}
            date={date}
            onNavigate={setDate}
            eventPropGetter={eventStyleGetter}
            onSelectEvent={(event) => onSelectEvent?.(event.resource)}
            onSelectSlot={onSelectSlot}
            selectable
            popup
            messages={messages}
            views={['month', 'week', 'day', 'agenda']}
            culture="tr"
            style={{ fontFamily: "'Inter', sans-serif" }}
          />
        </div>
      </div>

      {/* Mobil legend */}
      <div className="flex md:hidden justify-center gap-3 px-4 pb-4">
        {[
          { color: '#93B5E1', label: 'Plan' },
          { color: '#8ECFB0', label: 'Tamam' },
          { color: '#E8C97D', label: 'Görev' },
          { color: '#E8808C', label: 'Geciken' },
        ].map(legend => (
          <span key={legend.label} className="inline-flex items-center gap-1 text-[10px] font-medium" style={{ color: '#9A949D' }}>
            <span className="w-2 h-2 rounded-sm" style={{ background: legend.color }} />
            {legend.label}
          </span>
        ))}
      </div>
    </motion.div>
  )
}
