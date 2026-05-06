import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { FiCheckCircle, FiClock, FiAlertTriangle, FiTrendingUp, FiCalendar, FiList, FiTarget, FiZap, FiX, FiCheck, FiFlag } from 'react-icons/fi'
import { format, parseISO } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Plan, Todo } from '@/types'

// Kategori emojileri
const CAT_EMOJI: Record<string, string> = {
  spor: '🏃', saglik: '🏥', muzik: '🎵', yemek: '🍽️',
  seyahat: '✈️', etkinlik: '🎉', egitim: '📚', diger: '📌',
}
const PRI_COLOR: Record<string, string> = { high: '#E8808C', medium: '#E8C97D', low: '#85C88A' }

// Hangi kart tıklandığında ne gösterilecek
type StatFilter = 'totalPlans' | 'completedPlans' | 'totalTodos' | 'pendingTodos' | 'latePlans' | null

export default function StatsPanel() {
  const { getStats, plans, todos } = useData()
  const stats = getStats()
  const [activeFilter, setActiveFilter] = useState<StatFilter>(null)

  // Filtrelenmiş öğeler
  const filteredItems = useMemo(() => {
    if (!activeFilter) return []

    const todayStr = new Date().toISOString().slice(0, 10)

    switch (activeFilter) {
      case 'totalPlans':
        return plans.map(p => ({ ...p, _type: 'plan' as const }))
      case 'completedPlans':
        return plans.filter(p => p.status === 'completed').map(p => ({ ...p, _type: 'plan' as const }))
      case 'totalTodos':
        return todos.map(t => ({ ...t, _type: 'todo' as const }))
      case 'pendingTodos':
        return todos.filter(t => t.status === 'pending').map(t => ({ ...t, _type: 'todo' as const }))
      case 'latePlans':
        return plans
          .filter(p => p.status === 'planned' && p.plannedDate.slice(0, 10) < todayStr)
          .map(p => ({ ...p, _type: 'plan' as const }))
      default:
        return []
    }
  }, [activeFilter, plans, todos])

  // Filtre başlığı
  const filterTitle: Record<string, string> = {
    totalPlans: 'Tüm Planlar',
    completedPlans: 'Tamamlanan Planlar',
    totalTodos: 'Tüm Görevler',
    pendingTodos: 'Bekleyen Görevler',
    latePlans: 'Geciken Planlar',
  }

  const handleCardClick = (filter: StatFilter) => {
    if (filter === 'latePlans' && stats.latePlans === 0) return
    if (activeFilter === filter) {
      setActiveFilter(null)
    } else {
      setActiveFilter(filter)
    }
  }

  const cards: { label: string; value: number | string; icon: JSX.Element; color: string; bg: string; filter: StatFilter }[] = [
    {
      label: 'Toplam Plan',
      value: stats.totalPlans,
      icon: <FiCalendar size={18} />,
      color: '#93B5E1',
      bg: 'rgba(147,181,225,0.08)',
      filter: 'totalPlans',
    },
    {
      label: 'Tamamlanan',
      value: stats.completedPlans,
      icon: <FiCheckCircle size={18} />,
      color: '#8ECFB0',
      bg: 'rgba(142,207,176,0.08)',
      filter: 'completedPlans',
    },
    {
      label: 'Toplam Görev',
      value: stats.totalTodos,
      icon: <FiList size={18} />,
      color: '#B8A0DC',
      bg: 'rgba(184,160,220,0.08)',
      filter: 'totalTodos',
    },
    {
      label: 'Bekleyen',
      value: stats.pendingTodos,
      icon: <FiClock size={18} />,
      color: '#E8C97D',
      bg: 'rgba(232,201,125,0.08)',
      filter: 'pendingTodos',
    },
    {
      label: 'Geciken',
      value: stats.latePlans,
      icon: <FiAlertTriangle size={18} />,
      color: '#E8808C',
      bg: 'rgba(232,128,140,0.08)',
      filter: 'latePlans',
    },
    {
      label: 'Tamamlanma',
      value: `%${stats.completionRate}`,
      icon: <FiTarget size={18} />,
      color: '#B8A0DC',
      bg: 'rgba(184,160,220,0.08)',
      filter: null, // tıklanabilir değil
    }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.15 }}
    >
      {/* Kompakt stat kartları */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
        {cards.map((card, i) => {
          const isActive = activeFilter === card.filter && card.filter !== null
          const isClickable = card.filter !== null && (card.filter !== 'latePlans' || stats.latePlans > 0)
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.05 * i }}
              whileHover={isClickable ? { y: -4, scale: 1.04 } : { y: -2 }}
              whileTap={isClickable ? { scale: 0.95 } : undefined}
              onClick={() => handleCardClick(card.filter)}
              className="rounded-xl p-4 sm:p-5 text-center transition-all select-none"
              style={{
                background: isActive ? `${card.color}18` : 'rgba(255,255,255,0.7)',
                backdropFilter: 'blur(12px)',
                border: isActive ? `2px solid ${card.color}` : '1px solid rgba(232,223,245,0.15)',
                cursor: isClickable ? 'pointer' : 'default',
                boxShadow: isActive ? `0 4px 20px ${card.color}20` : 'none',
              }}
            >
              <div
                className="inline-flex p-2 rounded-lg mb-2"
                style={{ background: isActive ? `${card.color}20` : card.bg, color: card.color }}
              >
                {card.icon}
              </div>
              <p className="text-xl sm:text-2xl font-bold" style={{ color: '#3D2C3E' }}>{card.value}</p>
              <p className="text-[11px] font-medium mt-0.5" style={{ color: '#9A949D' }}>{card.label}</p>
              {isClickable && (
                <p className="text-[9px] mt-1" style={{ color: isActive ? card.color : '#C8C0CC' }}>
                  {isActive ? '▲ Kapat' : '▼ Detay'}
                </p>
              )}
            </motion.div>
          )
        })}
      </div>

      {/* Filtrelenmiş liste */}
      <AnimatePresence>
        {activeFilter && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="mt-6 rounded-2xl p-5"
              style={{
                background: 'rgba(255,255,255,0.75)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(232,223,245,0.2)',
              }}
            >
              {/* Başlık */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <h3 className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>
                    {filterTitle[activeFilter]}
                  </h3>
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(184,160,220,0.1)', color: '#9A949D' }}>
                    {filteredItems.length}
                  </span>
                </div>
                <button
                  onClick={() => setActiveFilter(null)}
                  className="p-1.5 rounded-lg transition-all cursor-pointer"
                  style={{ background: 'rgba(232,223,245,0.15)', color: '#9A949D' }}
                >
                  <FiX size={14} />
                </button>
              </div>

              {/* Liste */}
              {filteredItems.length === 0 ? (
                <p className="text-xs text-center py-6" style={{ color: '#B8A9BC' }}>
                  Bu kategoride öğe yok
                </p>
              ) : (
                <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
                  {filteredItems.map((item, idx) => {
                    const isPlan = item._type === 'plan'
                    const plan = isPlan ? (item as Plan & { _type: 'plan' }) : null
                    const todo = !isPlan ? (item as Todo & { _type: 'todo' }) : null
                    const isDone = item.status === 'completed'
                    const isCancelled = (item as any).status === 'cancelled'
                    const emoji = isPlan ? (CAT_EMOJI[(plan as Plan).category] || '📌') : '☑️'
                    const priColor = item.priority ? PRI_COLOR[item.priority] : null

                    let dateStr = ''
                    try {
                      dateStr = format(parseISO(item.plannedDate.slice(0, 10)), 'd MMM yyyy', { locale: tr })
                    } catch { dateStr = item.plannedDate.slice(0, 10) }

                    return (
                      <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.02 }}
                        className="flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all"
                        style={{
                          background: isDone
                            ? 'rgba(142,207,176,0.06)'
                            : isCancelled
                              ? 'rgba(176,170,179,0.06)'
                              : isPlan
                                ? 'rgba(147,181,225,0.05)'
                                : 'rgba(184,160,220,0.05)',
                          border: '1px solid rgba(232,223,245,0.1)',
                          opacity: isDone || isCancelled ? 0.7 : 1,
                        }}
                      >
                        {/* Durum ikonu */}
                        <div className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                          style={{
                            background: isDone ? 'rgba(142,207,176,0.2)' : isCancelled ? 'rgba(176,170,179,0.2)' : 'transparent',
                            border: !isDone && !isCancelled ? `1.5px solid ${isPlan ? '#93B5E1' : '#B8A0DC'}` : 'none',
                          }}>
                          {isDone && <FiCheck size={10} style={{ color: '#8ECFB0' }} />}
                          {isCancelled && <FiX size={10} style={{ color: '#9A949D' }} />}
                        </div>

                        {/* Başlık */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs">{emoji}</span>
                            <p className={`text-[13px] font-medium truncate ${isDone ? 'line-through' : ''}`}
                              style={{ color: isDone || isCancelled ? '#B8A9BC' : '#3D2C3E' }}>
                              {item.title}
                            </p>
                          </div>
                        </div>

                        {/* Öncelik */}
                        {priColor && (
                          <FiFlag size={10} style={{ color: priColor }} className="shrink-0" />
                        )}

                        {/* Tarih */}
                        <span className="text-[10px] font-medium shrink-0" style={{ color: '#9A949D' }}>
                          {dateStr}
                        </span>
                      </motion.div>
                    )
                  })}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* İlerleme çubuğu */}
      <div className="mt-6 px-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-xs font-medium" style={{ color: '#6E5A73' }}>Genel İlerleme</span>
          <span className="text-xs font-bold" style={{ color: '#B8A0DC' }}>%{stats.completionRate}</span>
        </div>
        <div className="w-full rounded-full h-2 overflow-hidden" style={{ background: 'rgba(184,160,220,0.08)' }}>
          <motion.div
            initial={{ width: 0 }}
            animate={{ width: `${stats.completionRate}%` }}
            transition={{ duration: 1, delay: 0.4 }}
            className="h-full rounded-full"
            style={{ background: 'linear-gradient(90deg, #B8A0DC, #FADADD)' }}
          />
        </div>
      </div>
    </motion.div>
  )
}
