// Planora – Zaman Akışı Sayfası (Anı Kapsülü)
// Tüm etkinlikleri (planlar, görevler, harcamalar, mood) tarih bazlı akış olarak gösterir
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/PartnerContext'
import { useCouple } from '../context/CoupleContext'
import { useTheme, hexToRgba } from '../context/ThemeContext'
import { format, parseISO, startOfWeek, endOfWeek, subWeeks, addWeeks, isToday, isSameWeek, isBefore, startOfDay } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  FiCalendar, FiCheckSquare, FiDollarSign, FiSmile,
  FiChevronLeft, FiChevronRight, FiClock, FiUser,
  FiMapPin, FiTag, FiStar, FiChevronDown, FiChevronUp,
  FiArrowUp
} from 'react-icons/fi'
import type { Plan, Todo, Expense, DailyMood, MoodLevel, PlanCategory } from '@/types'

// ═══════ Sabitler ═══════

const MOOD_EMOJI: Record<MoodLevel, string> = { 1: '😢', 2: '😔', 3: '😐', 4: '😊', 5: '🥰' }
const MOOD_LABEL: Record<MoodLevel, string> = { 1: 'Çok Kötü', 2: 'Kötü', 3: 'Normal', 4: 'Güzel', 5: 'Çok Güzel' }

const CATEGORY_EMOJI: Record<PlanCategory, string> = {
  spor: '🏃', saglik: '💊', muzik: '🎵', yemek: '🍽️',
  seyahat: '✈️', etkinlik: '🎉', egitim: '📚', diger: '📌',
}

const PRIORITY_BADGE: Record<string, { label: string; color: string }> = {
  high: { label: 'Yüksek', color: '#E8808C' },
  medium: { label: 'Orta', color: '#E8A87C' },
  low: { label: 'Düşük', color: '#85C88A' },
}

// ═══════ Timeline öğesi tipi ═══════
type TimelineItemType = 'plan' | 'plan-completed' | 'todo' | 'todo-completed' | 'expense' | 'mood'

interface TimelineItem {
  id: string
  type: TimelineItemType
  date: string // YYYY-MM-DD
  time?: string // HH:mm
  title: string
  subtitle?: string
  emoji: string
  color: string
  bgColor: string
  userName?: string
  extra?: Record<string, any>
}

// ═══════ Veriyi timeline öğelerine dönüştür ═══════
function buildTimelineItems(
  plans: Plan[],
  todos: Todo[],
  expenses: Expense[],
  moods: DailyMood[],
): TimelineItem[] {
  const items: TimelineItem[] = []

  // Planlar
  plans.forEach(p => {
    const isCompleted = p.status === 'completed'
    items.push({
      id: `plan-${p.id}`,
      type: isCompleted ? 'plan-completed' : 'plan',
      date: isCompleted && p.actualDate ? p.actualDate.slice(0, 10) : p.plannedDate.slice(0, 10),
      time: p.plannedDate.length > 10 ? p.plannedDate.slice(11, 16) : undefined,
      title: p.title,
      subtitle: p.description,
      emoji: CATEGORY_EMOJI[p.category] || '📌',
      color: isCompleted ? '#85C88A' : '#B8A0DC',
      bgColor: isCompleted ? 'rgba(133,200,138,0.12)' : 'rgba(184,160,220,0.12)',
      userName: p.createdByName,
      extra: {
        category: p.category,
        priority: p.priority,
        status: p.status,
        assignee: p.assignee,
        plannedEndDate: p.plannedEndDate,
      },
    })
  })

  // Görevler
  todos.forEach(t => {
    const isCompleted = t.status === 'completed'
    const isCancelled = t.status === 'cancelled'
    items.push({
      id: `todo-${t.id}`,
      type: isCompleted ? 'todo-completed' : 'todo',
      date: isCompleted && t.actualDate ? t.actualDate.slice(0, 10) : t.plannedDate.slice(0, 10),
      time: t.plannedDate.length > 10 ? t.plannedDate.slice(11, 16) : undefined,
      title: t.title,
      subtitle: t.description,
      emoji: isCompleted ? '✅' : isCancelled ? '❌' : '📋',
      color: isCompleted ? '#85C88A' : isCancelled ? '#E8808C' : '#E8A87C',
      bgColor: isCompleted ? 'rgba(133,200,138,0.12)' : isCancelled ? 'rgba(232,128,140,0.12)' : 'rgba(232,168,124,0.12)',
      userName: t.createdByName,
      extra: {
        priority: t.priority,
        status: t.status,
        assignee: t.assignee,
      },
    })
  })

  // Harcamalar
  expenses.forEach(e => {
    items.push({
      id: `expense-${e.id}`,
      type: 'expense',
      date: e.date.slice(0, 10),
      title: e.title,
      subtitle: e.note,
      emoji: '💰',
      color: '#D4A574',
      bgColor: 'rgba(212,165,116,0.12)',
      userName: e.createdByName,
      extra: {
        amount: e.amount,
        category: e.category,
        expenseType: e.type,
      },
    })
  })

  // Mood girişleri
  moods.forEach(m => {
    items.push({
      id: `mood-${m.id}`,
      type: 'mood',
      date: m.date,
      title: `${MOOD_EMOJI[m.mood]} ${MOOD_LABEL[m.mood]}`,
      subtitle: m.note,
      emoji: MOOD_EMOJI[m.mood],
      color: m.mood >= 4 ? '#85C88A' : m.mood === 3 ? '#D4C878' : '#E8808C',
      bgColor: m.mood >= 4 ? 'rgba(133,200,138,0.12)' : m.mood === 3 ? 'rgba(212,200,120,0.12)' : 'rgba(232,128,140,0.12)',
      userName: m.userName,
      extra: { mood: m.mood },
    })
  })

  // Tarihe göre sırala (yeni → eski)
  items.sort((a, b) => b.date.localeCompare(a.date))

  return items
}

// ═══════ Gün başlığı formatla ═══════
function formatDayHeader(dateStr: string): string {
  const d = parseISO(dateStr)
  if (isToday(d)) return 'Bugün'
  const diff = Math.round((startOfDay(new Date()).getTime() - startOfDay(d).getTime()) / 86400000)
  if (diff === 1) return 'Dün'
  if (diff === 2) return 'Önceki Gün'
  return format(d, 'd MMMM yyyy, EEEE', { locale: tr })
}

// Hafta aralığını formatla
function formatWeekRange(weekStart: Date): string {
  const end = endOfWeek(weekStart, { weekStartsOn: 1 })
  const s = format(weekStart, 'd MMM', { locale: tr })
  const e = format(end, 'd MMM yyyy', { locale: tr })
  return `${s} – ${e}`
}

// ═══════ Tür etiketi ═══════
function typeLabel(type: TimelineItemType): string {
  switch (type) {
    case 'plan': return 'Plan'
    case 'plan-completed': return 'Plan ✓'
    case 'todo': return 'Görev'
    case 'todo-completed': return 'Görev ✓'
    case 'expense': return 'Harcama'
    case 'mood': return 'Günlük'
  }
}

function typeIcon(type: TimelineItemType) {
  switch (type) {
    case 'plan': case 'plan-completed': return <FiCalendar size={12} />
    case 'todo': case 'todo-completed': return <FiCheckSquare size={12} />
    case 'expense': return <FiDollarSign size={12} />
    case 'mood': return <FiSmile size={12} />
  }
}

// ═══════ Filtre tipleri ═══════
type FilterType = 'all' | 'plan' | 'todo' | 'expense' | 'mood'
type ViewMode = 'day' | 'week'

const FILTER_OPTIONS: { value: FilterType; label: string; icon: JSX.Element }[] = [
  { value: 'all', label: 'Tümü', icon: <FiStar size={14} /> },
  { value: 'plan', label: 'Planlar', icon: <FiCalendar size={14} /> },
  { value: 'todo', label: 'Görevler', icon: <FiCheckSquare size={14} /> },
  { value: 'expense', label: 'Harcamalar', icon: <FiDollarSign size={14} /> },
  { value: 'mood', label: 'Günlük', icon: <FiSmile size={14} /> },
]

// ═══════ ANA BİLEŞEN ═══════
export default function TimelinePage() {
  const { plans, todos, expenses, moods } = useData()
  const { currentUser, userProfile } = useAuth()
  const { partnerProfile } = usePartner()
  const { couple } = useCouple()
  const { colors } = useTheme()

  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [filter, setFilter] = useState<FilterType>('all')
  const [weekOffset, setWeekOffset] = useState(0) // 0 = bu hafta, -1 = geçen hafta, vb.
  const [expandedItem, setExpandedItem] = useState<string | null>(null)

  // Tüm timeline öğelerini oluştur
  const allItems = useMemo(
    () => buildTimelineItems(plans, todos, expenses, moods),
    [plans, todos, expenses, moods],
  )

  // Filtrelenmiş öğeler
  const filteredItems = useMemo(() => {
    if (filter === 'all') return allItems
    return allItems.filter(item => {
      if (filter === 'plan') return item.type === 'plan' || item.type === 'plan-completed'
      if (filter === 'todo') return item.type === 'todo' || item.type === 'todo-completed'
      return item.type === filter
    })
  }, [allItems, filter])

  // Aktif hafta aralığı
  const currentWeekStart = useMemo(() => {
    const now = new Date()
    const base = startOfWeek(now, { weekStartsOn: 1 })
    return weekOffset === 0 ? base : weekOffset > 0 ? addWeeks(base, weekOffset) : subWeeks(base, Math.abs(weekOffset))
  }, [weekOffset])

  const currentWeekEnd = useMemo(() => endOfWeek(currentWeekStart, { weekStartsOn: 1 }), [currentWeekStart])

  // Haftaya göre filtrele (viewMode === 'week' ise)
  const visibleItems = useMemo(() => {
    if (viewMode === 'day') return filteredItems // gün modunda tamamını göster (gruplama yapılacak)
    return filteredItems.filter(item => {
      const d = parseISO(item.date)
      return d >= currentWeekStart && d <= currentWeekEnd
    })
  }, [filteredItems, viewMode, currentWeekStart, currentWeekEnd])

  // Tarihe göre grupla
  const groupedByDate = useMemo(() => {
    const map = new Map<string, TimelineItem[]>()
    visibleItems.forEach(item => {
      const existing = map.get(item.date) || []
      existing.push(item)
      map.set(item.date, existing)
    })
    // Tarihleri sırala (yeni → eski)
    const sorted = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))
    return sorted
  }, [visibleItems])

  // Gün modunda sadece son N gün göster (sayfalama için)
  const [dayLimit, setDayLimit] = useState(14)
  const displayedGroups = useMemo(() => {
    if (viewMode === 'week') return groupedByDate
    return groupedByDate.slice(0, dayLimit)
  }, [groupedByDate, viewMode, dayLimit])

  const hasMore = viewMode === 'day' && groupedByDate.length > dayLimit

  // Toplam istatistikler
  const weekStats = useMemo(() => {
    const items = viewMode === 'week' ? visibleItems : filteredItems
    const planCount = items.filter(i => i.type === 'plan' || i.type === 'plan-completed').length
    const todoCount = items.filter(i => i.type === 'todo' || i.type === 'todo-completed').length
    const moodCount = items.filter(i => i.type === 'mood').length
    const expenseCount = items.filter(i => i.type === 'expense').length
    const totalExpense = items
      .filter(i => i.type === 'expense')
      .reduce((sum, i) => sum + (i.extra?.amount || 0), 0)
    return { planCount, todoCount, moodCount, expenseCount, totalExpense }
  }, [visibleItems, filteredItems, viewMode])

  // Kullanıcı isimlerini kısalt
  const myName = userProfile?.name?.split(' ')[0] || 'Ben'
  const partnerName = partnerProfile?.name?.split(' ')[0] || 'Partner'

  function resolveUserName(userName?: string): string {
    if (!userName) return ''
    if (userName === userProfile?.name || userName === currentUser?.displayName) return myName
    if (userName === partnerProfile?.name) return partnerName
    return userName.split(' ')[0]
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6 space-y-5 pb-28">

      {/* ═══════ BAŞLIK ═══════ */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center space-y-1"
      >
        <h1
          className="text-2xl sm:text-3xl font-bold"
          style={{ fontFamily: "'Dancing Script', cursive", color: colors.primary }}
        >
          💫 Anı Kapsülü
        </h1>
        <p className="text-sm" style={{ color: colors.mutedFg }}>
          {couple.coupleName || 'Birlikte'} — Günlerinizin hikâyesi
        </p>
      </motion.div>

      {/* ═══════ GÖRÜNÜM + FİLTRE ═══════ */}
      <div className="space-y-3">
        {/* Görünüm modu */}
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => setViewMode('day')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: viewMode === 'day' ? colors.primary : hexToRgba(colors.primary, 0.1),
              color: viewMode === 'day' ? '#fff' : colors.primary,
            }}
          >
            📅 Gün Gün
          </button>
          <button
            onClick={() => setViewMode('week')}
            className="px-4 py-1.5 rounded-full text-xs font-semibold transition-all cursor-pointer"
            style={{
              background: viewMode === 'week' ? colors.primary : hexToRgba(colors.primary, 0.1),
              color: viewMode === 'week' ? '#fff' : colors.primary,
            }}
          >
            📆 Haftalık
          </button>
        </div>

        {/* Hafta navigasyonu (sadece haftalık modda) */}
        <AnimatePresence>
          {viewMode === 'week' && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex items-center justify-center gap-3"
            >
              <button
                onClick={() => setWeekOffset(o => o - 1)}
                className="p-2 rounded-full cursor-pointer transition-all hover:scale-110"
                style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.1) }}
              >
                <FiChevronLeft size={18} />
              </button>
              <span
                className="text-sm font-semibold min-w-[200px] text-center"
                style={{ color: colors.fg }}
              >
                {isSameWeek(currentWeekStart, new Date(), { weekStartsOn: 1 })
                  ? '📍 Bu Hafta'
                  : formatWeekRange(currentWeekStart)}
              </span>
              <button
                onClick={() => setWeekOffset(o => o + 1)}
                disabled={weekOffset >= 0}
                className="p-2 rounded-full cursor-pointer transition-all hover:scale-110 disabled:opacity-30"
                style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.1) }}
              >
                <FiChevronRight size={18} />
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Filtre butonları */}
        <div className="flex items-center justify-center gap-1.5 flex-wrap">
          {FILTER_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => setFilter(opt.value)}
              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
              style={{
                background: filter === opt.value ? colors.primary : hexToRgba(colors.primary, 0.08),
                color: filter === opt.value ? '#fff' : colors.mutedFg,
              }}
            >
              {opt.icon}
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* ═══════ ÖZET KARTLARI ═══════ */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        {[
          { label: 'Plan', count: weekStats.planCount, emoji: '📅', color: '#B8A0DC' },
          { label: 'Görev', count: weekStats.todoCount, emoji: '✅', color: '#85C88A' },
          { label: 'Günlük', count: weekStats.moodCount, emoji: '💛', color: '#D4C878' },
          { label: 'Harcama', count: weekStats.expenseCount, emoji: '💰', color: '#D4A574',
            sub: weekStats.totalExpense > 0 ? `₺${weekStats.totalExpense.toLocaleString('tr-TR')}` : undefined },
        ].map(s => (
          <motion.div
            key={s.label}
            whileHover={{ scale: 1.03 }}
            className="rounded-xl p-3 text-center"
            style={{ background: hexToRgba(s.color, 0.1), border: `1px solid ${hexToRgba(s.color, 0.2)}` }}
          >
            <div className="text-lg">{s.emoji}</div>
            <div className="text-lg font-bold" style={{ color: s.color }}>{s.count}</div>
            <div className="text-[10px] font-medium" style={{ color: colors.mutedFg }}>{s.label}</div>
            {s.sub && (
              <div className="text-[10px] font-semibold mt-0.5" style={{ color: s.color }}>{s.sub}</div>
            )}
          </motion.div>
        ))}
      </div>

      {/* ═══════ ZAMAN AKIŞI ═══════ */}
      {displayedGroups.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center py-16 space-y-3"
        >
          <div className="text-5xl">📭</div>
          <p className="text-sm font-medium" style={{ color: colors.mutedFg }}>
            Bu dönemde hiç kayıt yok
          </p>
          <p className="text-xs" style={{ color: colors.mutedFg }}>
            Plan, görev veya günlük ekleyerek anılarınızı oluşturun ✨
          </p>
        </motion.div>
      ) : (
        <div className="relative">
          {/* Dikey çizgi (timeline çubuğu) */}
          <div
            className="absolute left-5 sm:left-6 top-0 bottom-0 w-0.5 rounded-full"
            style={{ background: hexToRgba(colors.primary, 0.15) }}
          />

          {displayedGroups.map(([dateStr, items], groupIdx) => (
            <motion.div
              key={dateStr}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: groupIdx * 0.05, duration: 0.3 }}
              className="relative mb-6"
            >
              {/* ── Gün başlığı ── */}
              <div className="flex items-center gap-3 mb-3">
                {/* Nokta */}
                <div
                  className="relative z-10 w-10 h-10 sm:w-12 sm:h-12 rounded-full flex items-center justify-center shrink-0"
                  style={{
                    background: isToday(parseISO(dateStr))
                      ? `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`
                      : hexToRgba(colors.primary, 0.15),
                  }}
                >
                  <span className={`font-bold ${isToday(parseISO(dateStr)) ? 'text-white' : ''}`} style={{
                    color: isToday(parseISO(dateStr)) ? '#fff' : colors.primary,
                    fontSize: '13px',
                  }}>
                    {format(parseISO(dateStr), 'd', { locale: tr })}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold" style={{ color: colors.fg }}>
                    {formatDayHeader(dateStr)}
                  </h3>
                  <p className="text-[10px]" style={{ color: colors.mutedFg }}>
                    {items.length} kayıt
                  </p>
                </div>
              </div>

              {/* ── O gündeki öğeler ── */}
              <div className="ml-5 sm:ml-6 pl-6 sm:pl-8 space-y-2.5 border-l-0">
                {items.map((item, idx) => {
                  const isExpanded = expandedItem === item.id
                  return (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: idx * 0.03 }}
                      onClick={() => setExpandedItem(isExpanded ? null : item.id)}
                      className="rounded-xl p-3.5 cursor-pointer transition-all hover:shadow-md"
                      style={{
                        background: colors.card,
                        border: `1px solid ${hexToRgba(item.color, 0.2)}`,
                        boxShadow: isExpanded ? `0 4px 20px ${hexToRgba(item.color, 0.15)}` : undefined,
                      }}
                    >
                      <div className="flex items-start gap-3">
                        {/* Sol emoji */}
                        <div
                          className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-lg"
                          style={{ background: item.bgColor }}
                        >
                          {item.emoji}
                        </div>

                        {/* İçerik */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            {/* Tür badge */}
                            <span
                              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
                              style={{ background: hexToRgba(item.color, 0.15), color: item.color }}
                            >
                              {typeIcon(item.type)}
                              {typeLabel(item.type)}
                            </span>
                            {/* Saat */}
                            {item.time && (
                              <span className="text-[10px] flex items-center gap-0.5" style={{ color: colors.mutedFg }}>
                                <FiClock size={10} /> {item.time}
                              </span>
                            )}
                            {/* Kişi */}
                            {item.userName && (
                              <span className="text-[10px] flex items-center gap-0.5" style={{ color: colors.mutedFg }}>
                                <FiUser size={10} /> {resolveUserName(item.userName)}
                              </span>
                            )}
                          </div>

                          <p className="text-sm font-semibold mt-1 truncate" style={{ color: colors.fg }}>
                            {item.type === 'mood' ? item.title : item.title}
                          </p>

                          {item.subtitle && !isExpanded && (
                            <p className="text-xs mt-0.5 truncate" style={{ color: colors.mutedFg }}>
                              {item.subtitle}
                            </p>
                          )}

                          {/* Genişletilmiş detay */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-2 space-y-1.5"
                              >
                                {item.subtitle && (
                                  <p className="text-xs leading-relaxed" style={{ color: colors.mutedFg }}>
                                    {item.subtitle}
                                  </p>
                                )}

                                {/* Harcama tutarı */}
                                {item.type === 'expense' && item.extra?.amount && (
                                  <div className="flex items-center gap-1">
                                    <span className="text-xs font-bold" style={{ color: '#D4A574' }}>
                                      ₺{item.extra.amount.toLocaleString('tr-TR')}
                                    </span>
                                    {item.extra.expenseType === 'shared' && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(184,160,220,0.15)', color: '#B8A0DC' }}>
                                        Ortak
                                      </span>
                                    )}
                                  </div>
                                )}

                                {/* Öncelik */}
                                {item.extra?.priority && PRIORITY_BADGE[item.extra.priority] && (
                                  <span
                                    className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                                    style={{
                                      background: hexToRgba(PRIORITY_BADGE[item.extra.priority].color, 0.15),
                                      color: PRIORITY_BADGE[item.extra.priority].color,
                                    }}
                                  >
                                    <FiTag size={10} />
                                    {PRIORITY_BADGE[item.extra.priority].label} Öncelik
                                  </span>
                                )}

                                {/* Kategori */}
                                {item.extra?.category && (item.type === 'plan' || item.type === 'plan-completed') && (
                                  <span className="text-[10px]" style={{ color: colors.mutedFg }}>
                                    📂 {item.extra.category}
                                  </span>
                                )}
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>

                        {/* Genişlet/daralt ikonu */}
                        <div className="shrink-0 mt-1" style={{ color: colors.mutedFg }}>
                          {isExpanded ? <FiChevronUp size={14} /> : <FiChevronDown size={14} />}
                        </div>
                      </div>
                    </motion.div>
                  )
                })}
              </div>
            </motion.div>
          ))}

          {/* Daha fazla yükle (gün modunda) */}
          {hasMore && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-center py-4"
            >
              <button
                onClick={() => setDayLimit(l => l + 14)}
                className="px-6 py-2.5 rounded-full text-sm font-semibold cursor-pointer transition-all hover:scale-105"
                style={{
                  background: hexToRgba(colors.primary, 0.1),
                  color: colors.primary,
                  border: `1px solid ${hexToRgba(colors.primary, 0.2)}`,
                }}
              >
                ⏳ Daha Eski Günlere Git
              </button>
            </motion.div>
          )}
        </div>
      )}

      {/* Yukarı kaydır butonu */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className="fixed bottom-24 right-4 sm:bottom-8 sm:right-8 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer z-30 shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${colors.primary}, ${colors.accent})`,
          color: '#fff',
        }}
      >
        <FiArrowUp size={18} />
      </motion.button>
    </div>
  )
}
