import { useState, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import { useData } from '../context/DataContext'
import { useCouple } from '../context/CoupleContext'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/PartnerContext'
import CalendarView from '../components/calendar/CalendarView'
import StatsPanel from '../components/stats/StatsPanel'
import AddTodoModal from '../components/todos/AddTodoModal'
import AddPlanModal from '../components/plans/AddPlanModal'
import EventDetailModal from '../components/shared/EventDetailModal'
import { FiPlus, FiCalendar, FiCheckSquare, FiHeart, FiArrowRight, FiSmile, FiClock, FiDollarSign, FiCheck, FiX, FiFlag, FiChevronDown, FiChevronUp } from 'react-icons/fi'
import { format, isToday, isTomorrow, isThisWeek, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Plan, Todo, Expense, DailyMood, MoodLevel } from '@/types'

// Takvimde boş alana tıklandığında gösterilecek mini menü
interface SlotActionPopoverProps {
  position: { x: number; y: number }
  onClose: () => void
  onAddPlan: () => void
  onAddTodo: () => void
}

function SlotActionPopover({ position, onClose, onAddPlan, onAddTodo }: SlotActionPopoverProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: -4 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9, y: -4 }}
      transition={{ duration: 0.15 }}
      className="fixed z-[60]"
      style={{ top: position.y, left: position.x }}
    >
      <div
        className="rounded-xl overflow-hidden"
        style={{
          background: '#FFFFFF',
          boxShadow: '0 12px 40px rgba(61,44,62,0.18), 0 0 0 1px rgba(232,223,245,0.3)',
          minWidth: 200,
        }}
      >
        <div className="px-4 py-3" style={{ borderBottom: '1px solid rgba(232,223,245,0.2)' }}>
          <p className="text-xs font-semibold" style={{ color: '#3D2C3E' }}>Yeni Oluştur</p>
        </div>
        <div className="p-2">
          <button
            onClick={onAddPlan}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{ color: '#3D2C3E' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(250,218,221,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(147,181,225,0.15)', color: '#93B5E1' }}>
              <FiCalendar size={16} />
            </span>
            <div className="text-left">
              <span className="block text-sm font-medium" style={{ color: '#3D2C3E' }}>Yeni Plan</span>
              <span className="block text-[11px]" style={{ color: '#B8A9BC' }}>Etkinlik veya plan ekle</span>
            </div>
          </button>
          <button
            onClick={onAddTodo}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all cursor-pointer"
            style={{ color: '#3D2C3E' }}
            onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,223,245,0.2)'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            <span className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: 'rgba(184,160,220,0.15)', color: '#B8A0DC' }}>
              <FiCheckSquare size={16} />
            </span>
            <div className="text-left">
              <span className="block text-sm font-medium" style={{ color: '#3D2C3E' }}>Yeni Görev</span>
              <span className="block text-[11px]" style={{ color: '#B8A9BC' }}>Yapılacak iş ekle</span>
            </div>
          </button>
        </div>
      </div>
      {/* Tıklama dışında kapatma */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </motion.div>
  )
}

// Yaklaşan etkinlikler mini kartı
function UpcomingWidget({ plans, todos }: { plans: Plan[]; todos: Todo[] }) {
  const upcoming = [
    ...plans.filter(p => p.status === 'planned').map(p => ({ ...p, _type: 'plan' as const })),
    ...todos.filter(t => t.status === 'pending').map(t => ({ ...t, _type: 'todo' as const })),
  ]
    .sort((a, b) => new Date(a.plannedDate).getTime() - new Date(b.plannedDate).getTime())
    .slice(0, 5)

  const formatRelative = (dateStr: string) => {
    const d = new Date(dateStr)
    const now = new Date()
    const diff = Math.ceil((d.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    if (diff < 0) return 'Gecikmiş'
    if (diff === 0) return 'Bugün'
    if (diff === 1) return 'Yarın'
    if (diff <= 7) return `${diff} gün sonra`
    return `${Math.ceil(diff / 7)} hafta sonra`
  }

  const typeColors = {
    plan: { bg: 'rgba(147,181,225,0.1)', dot: '#93B5E1' },
    todo: { bg: 'rgba(184,160,220,0.1)', dot: '#B8A0DC' },
  }

  if (upcoming.length === 0) return null

  return (
    <div className="space-y-3">
      {upcoming.map((item, i) => {
        const isLate = new Date(item.plannedDate) < new Date()
        const colors = typeColors[item._type]
        return (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all"
            style={{
              background: isLate ? 'rgba(232,128,140,0.06)' : colors.bg,
              border: isLate ? '1px solid rgba(232,128,140,0.15)' : '1px solid transparent',
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: isLate ? '#E8808C' : colors.dot }} />
            <div className="flex-1 min-w-0">
              <p className="text-[14px] font-medium truncate" style={{ color: '#3D2C3E' }}>{item.title}</p>
            </div>
            <span className="text-xs font-medium shrink-0 px-2.5 py-1 rounded-lg"
              style={{
                color: isLate ? '#E8808C' : '#9A949D',
                background: isLate ? 'rgba(232,128,140,0.08)' : 'rgba(0,0,0,0.03)',
              }}
            >
              {formatRelative(item.plannedDate)}
            </span>
          </motion.div>
        )
      })}
    </div>
  )
}

// Mood emoji config (LandingPage için mini)
const MOOD_EMOJI: Record<MoodLevel, string> = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '🥰' }
const MOOD_LABEL: Record<MoodLevel, string> = { 1: 'Çok Kötü', 2: 'Kötü', 3: 'Normal', 4: 'Güzel', 5: 'Çok Güzel' }

// ═══════ Anı Kapsülü Widget ═══════
const CAPSULE_TYPE_CONFIG: Record<string, { emoji: string; color: string; label: string }> = {
  plan: { emoji: '📅', color: '#B8A0DC', label: 'Plan' },
  'plan-completed': { emoji: '✅', color: '#85C88A', label: 'Plan ✓' },
  todo: { emoji: '📋', color: '#E8A87C', label: 'Görev' },
  'todo-completed': { emoji: '✅', color: '#85C88A', label: 'Görev ✓' },
  expense: { emoji: '💰', color: '#D4A574', label: 'Harcama' },
  mood: { emoji: '💛', color: '#D4C878', label: 'Günlük' },
}

interface CapsuleItem {
  id: string
  type: string
  date: string
  title: string
  emoji: string
  color: string
}

function TimelineCapsuleWidget({ plans, todos, expenses, moods, navigate }: {
  plans: Plan[]
  todos: Todo[]
  expenses: Expense[]
  moods: DailyMood[]
  navigate: (path: string) => void
}) {
  // Son 5 etkinliği al (tarih sıralı)
  const recentItems = useMemo(() => {
    const items: CapsuleItem[] = []

    plans.forEach(p => {
      const done = p.status === 'completed'
      items.push({
        id: `p-${p.id}`,
        type: done ? 'plan-completed' : 'plan',
        date: done && p.actualDate ? p.actualDate.slice(0, 10) : p.plannedDate.slice(0, 10),
        title: p.title,
        emoji: done ? '✅' : '📅',
        color: done ? '#85C88A' : '#B8A0DC',
      })
    })

    todos.forEach(t => {
      const done = t.status === 'completed'
      items.push({
        id: `t-${t.id}`,
        type: done ? 'todo-completed' : 'todo',
        date: done && t.actualDate ? t.actualDate.slice(0, 10) : t.plannedDate.slice(0, 10),
        title: t.title,
        emoji: done ? '✅' : '📋',
        color: done ? '#85C88A' : '#E8A87C',
      })
    })

    expenses.forEach(e => {
      items.push({
        id: `e-${e.id}`,
        type: 'expense',
        date: e.date.slice(0, 10),
        title: `${e.title} — ₺${e.amount.toLocaleString('tr-TR')}`,
        emoji: '💰',
        color: '#D4A574',
      })
    })

    moods.forEach(m => {
      const moodEmoji: Record<number, string> = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '🥰' }
      items.push({
        id: `m-${m.id}`,
        type: 'mood',
        date: m.date,
        title: `${moodEmoji[m.mood] || '😐'} ${m.userName}`,
        emoji: moodEmoji[m.mood] || '😐',
        color: m.mood >= 4 ? '#85C88A' : m.mood === 3 ? '#D4C878' : '#E8808C',
      })
    })

    items.sort((a, b) => b.date.localeCompare(a.date))
    return items.slice(0, 5)
  }, [plans, todos, expenses, moods])

  // Bugünün tarihi
  const todayFormatted = format(new Date(), 'yyyy-MM-dd')

  function relativeDay(dateStr: string): string {
    if (dateStr === todayFormatted) return 'Bugün'
    const diff = Math.round(
      (new Date(todayFormatted).getTime() - new Date(dateStr).getTime()) / 86400000
    )
    if (diff === 1) return 'Dün'
    if (diff === 2) return 'Önceki gün'
    return format(new Date(dateStr), 'd MMM', { locale: tr })
  }

  if (recentItems.length === 0) return null

  return (
    <motion.div
      whileHover={{ y: -2 }}
      onClick={() => navigate('/timeline')}
      className="cursor-pointer rounded-2xl p-5 transition-all overflow-hidden relative"
      style={{
        background: 'linear-gradient(135deg, rgba(184,160,220,0.08), rgba(212,200,120,0.06), rgba(133,200,138,0.06))',
        border: '1px solid rgba(184,160,220,0.18)',
      }}
    >
      {/* Dekoratif arka plan */}
      <div className="absolute -top-6 -right-6 w-24 h-24 rounded-full opacity-[0.08]"
        style={{ background: 'radial-gradient(circle, #B8A0DC, transparent)' }} />

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-base">💫</span>
          <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>Anı Kapsülü</p>
        </div>
        <FiArrowRight size={14} style={{ color: '#B8A9BC' }} />
      </div>

      {/* Mini timeline */}
      <div className="space-y-2 relative">
        {/* Dikey çizgi */}
        <div
          className="absolute left-[7px] top-2 bottom-2 w-[2px] rounded-full"
          style={{ background: 'rgba(184,160,220,0.15)' }}
        />

        {recentItems.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.06 }}
            className="flex items-center gap-3 pl-0 relative"
          >
            {/* Nokta */}
            <div
              className="w-4 h-4 rounded-full flex items-center justify-center shrink-0 z-10 text-[8px]"
              style={{ background: `${item.color}25`, border: `2px solid ${item.color}` }}
            />

            {/* İçerik */}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate" style={{ color: '#3D2C3E' }}>
                {item.emoji} {item.title}
              </p>
            </div>

            {/* Tarih */}
            <span className="text-[10px] font-medium shrink-0" style={{ color: '#B8A9BC' }}>
              {relativeDay(item.date)}
            </span>
          </motion.div>
        ))}
      </div>

      {/* Alt bilgi */}
      <div className="flex items-center justify-center gap-1 mt-3 pt-2" style={{ borderTop: '1px solid rgba(184,160,220,0.1)' }}>
        <FiClock size={10} style={{ color: '#B8A9BC' }} />
        <span className="text-[10px] font-medium" style={{ color: '#B8A9BC' }}>
          Tüm akışı gör →
        </span>
      </div>
    </motion.div>
  )
}

// ═══════ Günlük Program Bölümü ═══════
const CATEGORY_EMOJI: Record<string, string> = {
  spor: '🏃', saglik: '🏥', muzik: '🎵', yemek: '🍽️',
  seyahat: '✈️', etkinlik: '🎉', egitim: '📚', diger: '📌',
}
const PRIORITY_CONFIG: Record<string, { label: string; color: string }> = {
  high: { label: 'Yüksek', color: '#E8808C' },
  medium: { label: 'Orta', color: '#E8C97D' },
  low: { label: 'Düşük', color: '#85C88A' },
}

interface DailyItem {
  id: string
  type: 'plan' | 'todo'
  title: string
  date: string
  status: string
  priority?: string
  category?: string
  assigneeLabel?: string
  createdByName?: string
  original: Plan | Todo
}

function DailyProgramSection({ plans, todos, onAddPlan, onAddTodo, onEditPlan, onEditTodo }: {
  plans: Plan[]
  todos: Todo[]
  onAddPlan: () => void
  onAddTodo: () => void
  onEditPlan: (p: Plan) => void
  onEditTodo: (t: Todo) => void
}) {
  const { updatePlan, updateTodo } = useData()
  const todayStr = format(new Date(), 'yyyy-MM-dd')

  // Tüm aktif öğeleri birleştir
  const allItems = useMemo(() => {
    const items: DailyItem[] = []

    plans.forEach(p => {
      items.push({
        id: p.id,
        type: 'plan',
        title: p.title,
        date: p.plannedDate.slice(0, 10),
        status: p.status,
        priority: p.priority,
        category: p.category,
        createdByName: p.createdByName,
        original: p,
      })
    })

    todos.forEach(t => {
      items.push({
        id: t.id,
        type: 'todo',
        title: t.title,
        date: t.plannedDate.slice(0, 10),
        status: t.status,
        priority: t.priority,
        createdByName: t.createdByName,
        original: t,
      })
    })

    // Tarihe göre sırala
    items.sort((a, b) => a.date.localeCompare(b.date))
    return items
  }, [plans, todos])

  // Gruplama: Bugün, Yarın, Bu Hafta, Gelecek, Tamamlanan
  const groups = useMemo(() => {
    const today: DailyItem[] = []
    const tomorrow: DailyItem[] = []
    const thisWeek: DailyItem[] = []
    const upcoming: DailyItem[] = []
    const completed: DailyItem[] = []

    allItems.forEach(item => {
      if (item.status === 'completed' || item.status === 'cancelled') {
        completed.push(item)
        return
      }
      const d = parseISO(item.date)
      if (isToday(d)) today.push(item)
      else if (isTomorrow(d)) tomorrow.push(item)
      else if (isThisWeek(d, { weekStartsOn: 1 }) && item.date > todayStr) thisWeek.push(item)
      else if (item.date > todayStr) upcoming.push(item)
      else today.push(item) // Geçmiş ama hala aktif → bugüne at (gecikmiş)
    })

    return { today, tomorrow, thisWeek, upcoming, completed }
  }, [allItems, todayStr])

  const [showCompleted, setShowCompleted] = useState(false)

  // Görev tamamla
  const handleComplete = async (item: DailyItem) => {
    const nowStr = new Date().toISOString().slice(0, 10)
    if (item.type === 'plan') {
      await updatePlan(item.id, { status: 'completed', actualDate: nowStr })
    } else {
      await updateTodo(item.id, { status: 'completed', actualDate: nowStr })
    }
  }

  // Tek öğe render
  const renderItem = (item: DailyItem, isLate = false) => {
    const isDone = item.status === 'completed' || item.status === 'cancelled'
    const emoji = item.type === 'plan' ? (CATEGORY_EMOJI[item.category || 'diger'] || '📌') : '☑️'
    const pri = item.priority ? PRIORITY_CONFIG[item.priority] : null

    return (
      <motion.div
        key={`${item.type}-${item.id}`}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        className="flex items-center gap-3 px-4 py-3 rounded-xl transition-all group"
        style={{
          background: isLate
            ? 'rgba(232,128,140,0.06)'
            : isDone
              ? 'rgba(142,207,176,0.06)'
              : item.type === 'plan'
                ? 'rgba(147,181,225,0.06)'
                : 'rgba(184,160,220,0.06)',
          border: isLate
            ? '1px solid rgba(232,128,140,0.15)'
            : '1px solid rgba(232,223,245,0.15)',
          opacity: isDone ? 0.6 : 1,
        }}
      >
        {/* Sol: Tamamla butonu veya durum */}
        {!isDone ? (
          <button
            onClick={(e) => { e.stopPropagation(); handleComplete(item) }}
            className="w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 cursor-pointer transition-all hover:scale-110"
            style={{
              borderColor: isLate ? '#E8808C' : item.type === 'plan' ? '#93B5E1' : '#B8A0DC',
              background: 'transparent',
            }}
            title="Tamamla"
          >
            <FiCheck size={11} className="opacity-0 group-hover:opacity-60 transition-opacity"
              style={{ color: item.type === 'plan' ? '#93B5E1' : '#B8A0DC' }} />
          </button>
        ) : (
          <div className="w-6 h-6 rounded-full flex items-center justify-center shrink-0"
            style={{ background: item.status === 'cancelled' ? 'rgba(176,170,179,0.2)' : 'rgba(142,207,176,0.2)' }}>
            {item.status === 'cancelled'
              ? <FiX size={12} style={{ color: '#9A949D' }} />
              : <FiCheck size={12} style={{ color: '#8ECFb0' }} />}
          </div>
        )}

        {/* Orta: Icon + Başlık */}
        <div
          className="flex-1 min-w-0 cursor-pointer"
          onClick={() => item.type === 'plan' ? onEditPlan(item.original as Plan) : onEditTodo(item.original as Todo)}
        >
          <div className="flex items-center gap-2">
            <span className="text-sm">{emoji}</span>
            <p className={`text-sm font-medium truncate ${isDone ? 'line-through' : ''}`}
              style={{ color: isDone ? '#B8A9BC' : '#3D2C3E' }}>
              {item.title}
            </p>
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <span className="text-[10px] font-medium px-1.5 py-0.5 rounded"
              style={{
                background: item.type === 'plan' ? 'rgba(147,181,225,0.12)' : 'rgba(184,160,220,0.12)',
                color: item.type === 'plan' ? '#7BA3D1' : '#9B7FC7',
              }}>
              {item.type === 'plan' ? 'Plan' : 'Görev'}
            </span>
            {pri && (
              <span className="text-[10px] font-medium flex items-center gap-0.5"
                style={{ color: pri.color }}>
                <FiFlag size={8} /> {pri.label}
              </span>
            )}
            {isLate && (
              <span className="text-[10px] font-medium" style={{ color: '#E8808C' }}>
                Gecikmiş
              </span>
            )}
            {item.createdByName && (
              <span className="text-[10px]" style={{ color: '#B8A9BC' }}>
                ✎ {item.createdByName}
              </span>
            )}
          </div>
        </div>

        {/* Sağ: Tarih */}
        <span className="text-[11px] font-medium shrink-0" style={{ color: isLate ? '#E8808C' : '#9A949D' }}>
          {format(parseISO(item.date), 'd MMM', { locale: tr })}
        </span>
      </motion.div>
    )
  }

  // Grup başlığı render
  const renderGroup = (title: string, items: DailyItem[], dotColor: string, isLateGroup = false) => {
    if (items.length === 0) return null
    return (
      <div className="mb-6 last:mb-0">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-2 h-2 rounded-full" style={{ background: dotColor }} />
          <h3 className="text-xs font-semibold tracking-wide uppercase" style={{ color: '#6E5A73' }}>
            {title}
          </h3>
          <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-full"
            style={{ background: 'rgba(232,223,245,0.3)', color: '#9A949D' }}>
            {items.length}
          </span>
        </div>
        <div className="space-y-2">
          <AnimatePresence>
            {items.map(item => renderItem(item, isLateGroup || item.date < todayStr))}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  const activeTotal = groups.today.length + groups.tomorrow.length + groups.thisWeek.length + groups.upcoming.length

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.35 }}
      className="rounded-2xl p-5 sm:p-6 md:p-7 mb-12 sm:mb-20"
      style={{
        background: 'rgba(255,255,255,0.65)',
        backdropFilter: 'blur(16px)',
        border: '1px solid rgba(232,223,245,0.2)',
      }}
    >
      {/* Başlık */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-lg sm:text-xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Günlük Program
          </h2>
          <p className="text-xs mt-1" style={{ color: '#B8A9BC' }}>
            {format(new Date(), "d MMMM EEEE", { locale: tr })} · {activeTotal} aktif
          </p>
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddPlan}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all"
            style={{ background: 'rgba(147,181,225,0.15)', color: '#7BA3D1', border: '1px solid rgba(147,181,225,0.25)' }}
          >
            <FiPlus size={12} /> Plan
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onAddTodo}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-medium cursor-pointer transition-all"
            style={{ background: 'rgba(184,160,220,0.15)', color: '#9B7FC7', border: '1px solid rgba(184,160,220,0.25)' }}
          >
            <FiPlus size={12} /> Görev
          </motion.button>
        </div>
      </div>

      {/* Boş durum */}
      {activeTotal === 0 && groups.completed.length === 0 && (
        <div className="text-center py-12">
          <div className="text-4xl mb-3">📋</div>
          <p className="text-sm font-medium mb-1" style={{ color: '#3D2C3E' }}>Henüz bir şey yok</p>
          <p className="text-xs mb-5" style={{ color: '#B8A9BC' }}>
            Plan veya görev ekleyerek günlük programınızı oluşturun
          </p>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={onAddPlan}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              style={{ background: 'linear-gradient(135deg, #B8A0DC, #FADADD)', color: '#fff' }}
            >
              <FiCalendar size={13} /> Plan Ekle
            </button>
            <button
              onClick={onAddTodo}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-semibold cursor-pointer transition-all"
              style={{ background: 'rgba(255,255,255,0.8)', color: '#3D2C3E', border: '1px solid rgba(184,160,220,0.25)' }}
            >
              <FiCheckSquare size={13} /> Görev Ekle
            </button>
          </div>
        </div>
      )}

      {/* Gruplar */}
      <div className="max-h-[600px] overflow-y-auto pr-1">
        {renderGroup('Bugün', groups.today, '#E8808C')}
        {renderGroup('Yarın', groups.tomorrow, '#E8C97D')}
        {renderGroup('Bu Hafta', groups.thisWeek, '#93B5E1')}
        {renderGroup('Gelecek', groups.upcoming, '#B8A0DC')}
      </div>

      {/* Tamamlananlar toggle */}
      {groups.completed.length > 0 && (
        <div className="mt-4 pt-4" style={{ borderTop: '1px solid rgba(232,223,245,0.15)' }}>
          <button
            onClick={() => setShowCompleted(!showCompleted)}
            className="flex items-center gap-2 text-xs font-medium cursor-pointer transition-all w-full"
            style={{ color: '#9A949D' }}
          >
            {showCompleted ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
            Tamamlanan / İptal ({groups.completed.length})
          </button>
          <AnimatePresence>
            {showCompleted && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden mt-3 space-y-2"
              >
                {groups.completed.map(item => renderItem(item))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  )
}

export default function LandingPage() {
  const navigate = useNavigate()
  const { plans, todos, expenses, moods, isDemo } = useData()
  const { couple, getDaysTogether } = useCouple()
  const { currentUser, userProfile } = useAuth()
  const { partnerProfile, isPaired } = usePartner()

  // Bugünkü mood durumu
  const todayStr = format(new Date(), 'yyyy-MM-dd')
  const myTodayMood = useMemo(() => moods.find(m => m.date === todayStr && m.userId === currentUser?.uid), [moods, currentUser, todayStr])
  const partnerTodayMood = useMemo(() => moods.find(m => m.date === todayStr && m.userId === partnerProfile?.uid), [moods, partnerProfile, todayStr])

  // Takvimden tıklama ile modal açma
  const [slotPopover, setSlotPopover] = useState<{ x: number; y: number } | null>(null)
  const [showAddPlan, setShowAddPlan] = useState(false)
  const [showAddTodo, setShowAddTodo] = useState(false)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [editingPlan, setEditingPlan] = useState<Plan | null>(null)
  const [editingTodo, setEditingTodo] = useState<Todo | null>(null)
  // Etkinlik detay modal
  const [detailEvent, setDetailEvent] = useState<Plan | Todo | null>(null)
  const [detailType, setDetailType] = useState<'plan' | 'todo' | null>(null)

  // Takvimde boş alana tıklandığında
  const handleSelectSlot = useCallback((slotInfo: any) => {
    // Takvimden gelen tarih bilgisi
    const dateStr = new Date(slotInfo.start).toISOString().slice(0, 10)
    setSelectedDate(dateStr)

    // Popover pozisyonu
    const box = slotInfo.box || slotInfo.bounds
    if (box) {
      setSlotPopover({
        x: Math.min(box.x || box.left || 200, window.innerWidth - 220),
        y: Math.min((box.y || box.top || 200) + 20, window.innerHeight - 200),
      })
    } else {
      // Fallback merkez pozisyon
      setSlotPopover({
        x: window.innerWidth / 2 - 100,
        y: window.innerHeight / 2 - 100,
      })
    }
  }, [])

  const handleSlotAddPlan = () => {
    setSlotPopover(null)
    setShowAddPlan(true)
  }

  const handleSlotAddTodo = () => {
    setSlotPopover(null)
    setShowAddTodo(true)
  }

  // Takvimde etkinliğe tıklandığında → detay modal aç
  const handleSelectEvent = useCallback((resource: Plan | Todo) => {
    // resource plan mı todo mu belirle
    if (resource.category !== undefined) {
      // Plan
      setDetailEvent(resource)
      setDetailType('plan')
    } else {
      // Todo
      setDetailEvent(resource)
      setDetailType('todo')
    }
  }, [])

  // Detay modal'dan düzenleme
  const handleEditFromDetail = (event: Plan | Todo) => {
    if (detailType === 'plan') {
      setEditingPlan(event)
      setShowAddPlan(true)
    } else {
      setEditingTodo(event)
      setShowAddTodo(true)
    }
    setDetailEvent(null)
    setDetailType(null)
  }

  // Saat selamlaması
  const getGreeting = () => {
    const h = new Date().getHours()
    if (h < 6) return 'İyi geceler'
    if (h < 12) return 'Günaydın'
    if (h < 18) return 'İyi günler'
    return 'İyi akşamlar'
  }

  const pendingCount = todos.filter(t => t.status === 'pending').length
  const upcomingPlans = plans.filter(p => p.status === 'planned').length

  return (
    <div className="relative min-h-screen">
      {/* Arka plan dekoratif öğeler */}
      <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-32 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #FADADD, transparent)' }} />
        <div className="absolute top-1/2 -left-48 w-[400px] h-[400px] rounded-full opacity-[0.03]"
          style={{ background: 'radial-gradient(circle, #E8DFF5, transparent)' }} />
      </div>

      <div className="relative z-10">
        {/* Üst bölüm: Selamlama + Demo banner + Hızlı aksiyonlar */}
        <div className="max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">

          {/* Demo bildirimi */}
          <AnimatePresence>
            {isDemo && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mb-8 px-6 py-4.5 rounded-xl flex items-center justify-between flex-wrap gap-3"
                style={{ background: 'linear-gradient(135deg, rgba(184,160,220,0.1), rgba(250,218,221,0.1))', border: '1px solid rgba(184,160,220,0.15)' }}
              >
                <p className="text-sm" style={{ color: '#6E5A73' }}>
                  <span className="font-semibold">Demo modu</span> – Örnek verilerle görüntülüyorsunuz
                </p>
                <button
                  onClick={() => navigate('/login')}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #B8A0DC, #FADADD)', color: '#fff' }}
                >
                  Giriş Yap <FiArrowRight size={12} />
                </button>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Selamlama satırı */}
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-end justify-between gap-5 sm:gap-6 mb-10 sm:mb-12"
          >
            <div>
              <h1 className="text-xl sm:text-2xl lg:text-3xl font-semibold mb-2"
                style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
                {getGreeting()}, <span style={{ color: '#9B7FC7' }}>{couple.coupleShort}</span>
              </h1>
              <p className="text-xs sm:text-sm" style={{ color: '#9A949D' }}>
                {getDaysTogether() ? `${getDaysTogether()} gündür birlikte 💕 · ` : ''}
                {upcomingPlans > 0 ? `${upcomingPlans} yaklaşan plan` : 'Yeni planlar oluşturun'}
                {pendingCount > 0 ? ` · ${pendingCount} bekleyen görev` : ''}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setEditingPlan(null); setShowAddPlan(true) }}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all"
                style={{
                  background: 'linear-gradient(135deg, #B8A0DC, #FADADD)',
                  color: '#FFFFFF',
                  boxShadow: '0 4px 14px rgba(184,160,220,0.25)',
                }}
              >
                <FiPlus size={15} /> Yeni Plan
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => { setEditingTodo(null); setShowAddTodo(true) }}
                className="flex items-center gap-1.5 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold cursor-pointer transition-all"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  color: '#3D2C3E',
                  border: '1.5px solid rgba(184,160,220,0.25)',
                  boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
                }}
              >
                <FiPlus size={15} /> Yeni Görev
              </motion.button>
            </div>
          </motion.div>

          {/* İstatistik özet satırı (compact) */}
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="mb-10 sm:mb-14"
          >
            <StatsPanel />
          </motion.div>

          {/* Ana grid: Takvim (büyük) + Yan panel */}
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-8 sm:gap-10 mb-10 sm:mb-14">
            {/* Takvim — ana odak noktası (Google Calendar gibi geniş) */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="xl:col-span-8"
            >
              <CalendarView
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
              />
            </motion.div>

            {/* Yan panel: Yaklaşanlar + Sürpriz + Kısa eylemleri */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="xl:col-span-4 space-y-7"
            >
              {/* Günlük Mood Widget */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => navigate('/mood')}
                className="cursor-pointer rounded-2xl p-5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(184,160,220,0.12), rgba(133,200,138,0.10))',
                  border: '1px solid rgba(184,160,220,0.2)',
                }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <FiSmile size={16} style={{ color: '#B8A0DC' }} />
                    <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>Bugünün Günlüğü</p>
                  </div>
                  <FiArrowRight size={14} style={{ color: '#B8A9BC' }} />
                </div>
                <div className="space-y-2">
                  {/* Ben */}
                  <div className="flex items-center gap-2">
                    {myTodayMood ? (
                      <>
                        <span className="text-lg">{MOOD_EMOJI[myTodayMood.mood]}</span>
                        <span className="text-xs font-medium" style={{ color: '#3D2C3E' }}>
                          {userProfile?.name || 'Ben'}
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(133,200,138,0.15)', color: '#85C88A' }}>
                          {MOOD_LABEL[myTodayMood.mood]}
                        </span>
                      </>
                    ) : (
                      <>
                        <span className="text-lg opacity-40">😶</span>
                        <span className="text-xs" style={{ color: '#B8A9BC' }}>
                          {userProfile?.name || 'Ben'} — henüz girmedi
                        </span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto font-medium" style={{ background: 'rgba(232,128,140,0.1)', color: '#E8808C' }}>
                          Bekliyor
                        </span>
                      </>
                    )}
                  </div>
                  {/* Partner */}
                  {isPaired && (
                    <div className="flex items-center gap-2">
                      {partnerTodayMood ? (
                        <>
                          <span className="text-lg">{MOOD_EMOJI[partnerTodayMood.mood]}</span>
                          <span className="text-xs font-medium" style={{ color: '#3D2C3E' }}>
                            {partnerProfile?.name || 'Partner'}
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto" style={{ background: 'rgba(133,200,138,0.15)', color: '#85C88A' }}>
                            {MOOD_LABEL[partnerTodayMood.mood]}
                          </span>
                        </>
                      ) : (
                        <>
                          <span className="text-lg opacity-40">😶</span>
                          <span className="text-xs" style={{ color: '#B8A9BC' }}>
                            {partnerProfile?.name || 'Partner'} — henüz girmedi
                          </span>
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full ml-auto font-medium" style={{ background: 'rgba(232,128,140,0.1)', color: '#E8808C' }}>
                            Bekliyor
                          </span>
                        </>
                      )}
                    </div>
                  )}
                </div>
              </motion.div>

              {/* Anı Kapsülü Widget */}
              <TimelineCapsuleWidget plans={plans} todos={todos} expenses={expenses} moods={moods} navigate={navigate} />

              {/* Sürpriz butonu */}
              <motion.div
                whileHover={{ y: -2 }}
                onClick={() => navigate('/surprise')}
                className="cursor-pointer rounded-2xl p-5 transition-all"
                style={{
                  background: 'linear-gradient(135deg, rgba(250,218,221,0.3), rgba(232,223,245,0.3))',
                  border: '1px solid rgba(232,223,245,0.25)',
                }}
              >
                <div className="flex items-center gap-3">
                  <span className="w-10 h-10 rounded-xl flex items-center justify-center"
                    style={{ background: 'rgba(250,218,221,0.5)', color: '#E8808C' }}>
                    <FiHeart size={20} />
                  </span>
                  <div>
                    <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>Sürpriz Kutusu</p>
                    <p className="text-xs" style={{ color: '#B8A9BC' }}>Sana özel bir şey var ✦</p>
                  </div>
                  <FiArrowRight size={16} className="ml-auto" style={{ color: '#B8A9BC' }} />
                </div>
              </motion.div>

            </motion.div>
          </div>

          {/* Günlük Program – Bugünün etkinlikleri ve görevleri */}
          <DailyProgramSection
            plans={plans}
            todos={todos}
            onAddPlan={() => { setEditingPlan(null); setShowAddPlan(true) }}
            onAddTodo={() => { setEditingTodo(null); setShowAddTodo(true) }}
            onEditPlan={(p) => { setEditingPlan(p); setShowAddPlan(true) }}
            onEditTodo={(t) => { setEditingTodo(t); setShowAddTodo(true) }}
          />
        </div>

        {/* Footer */}
        <footer className="py-8 text-center">
          <div className="w-8 h-px mx-auto mb-3" style={{ background: 'rgba(232,223,245,0.4)' }} />
          <p className="text-[11px] tracking-wide" style={{ color: '#D4C5EB' }}>
            Planora – Designed with love
          </p>
        </footer>
      </div>

      {/* Takvim slot tıklama popover */}
      <AnimatePresence>
        {slotPopover && (
          <SlotActionPopover
            position={slotPopover}
            onClose={() => setSlotPopover(null)}
            onAddPlan={handleSlotAddPlan}
            onAddTodo={handleSlotAddTodo}
          />
        )}
      </AnimatePresence>

      {/* Etkinlik detay modal */}
      <AnimatePresence>
        {detailEvent && detailType && (
          <EventDetailModal
            event={detailEvent}
            type={detailType}
            onClose={() => { setDetailEvent(null); setDetailType(null) }}
            onEdit={handleEditFromDetail}
          />
        )}
      </AnimatePresence>

      {/* Modaller */}
      <AnimatePresence>
        {showAddPlan && (
          <AddPlanModal
            onClose={() => { setShowAddPlan(false); setSelectedDate(null); setEditingPlan(null) }}
            editPlan={editingPlan}
            prefilledDate={selectedDate}
          />
        )}
      </AnimatePresence>
      <AnimatePresence>
        {showAddTodo && (
          <AddTodoModal
            onClose={() => { setShowAddTodo(false); setSelectedDate(null); setEditingTodo(null) }}
            editTodo={editingTodo}
            prefilledDate={selectedDate}
          />
        )}
      </AnimatePresence>
    </div>
  )
}
