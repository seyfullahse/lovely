import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { useAuth } from '../../context/AuthContext'
import { FiCheck, FiEdit2, FiTrash2, FiClock, FiCalendar, FiFlag, FiBell, FiRepeat } from 'react-icons/fi'
import { SiGooglecalendar } from 'react-icons/si'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { openInGoogleCalendar } from '@/lib/googleCalendar'
import type { Plan } from '@/types'

interface PlanCardProps {
  plan: Plan
  onEdit: () => void
}

export default function PlanCard({ plan, onEdit }: PlanCardProps) {
  const { completePlan, deletePlan } = useData()
  const { getAssignees, resolveAssignee } = useCouple()
  const { currentUser } = useAuth()

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), "d MMM yyyy, HH:mm", { locale: tr })
    } catch {
      return dateStr
    }
  }

  const isLate = plan.status === 'planned' && new Date(plan.plannedDate) < new Date()

  // Dinamik assignee config
  const assigneeConfig: Record<string, { label: string; short: string; color: string }> = {}
  getAssignees().forEach(a => {
    assigneeConfig[a.value] = { label: a.label, short: a.short, color: a.color }
  })

  // Eski person1/person2 değerlerini UID'ye çevir
  const resolvedAssignee = resolveAssignee(plan.assignee)

  const isMyPlan = plan.createdBy === currentUser?.uid

  const categoryConfig = {
    spor: { label: 'Spor', icon: '⚽', color: '#93B5E1' },
    saglik: { label: 'Sağlık', icon: '❤', color: '#8ECFB0' },
    muzik: { label: 'Müzik', icon: '♫', color: '#B8A0DC' },
    yemek: { label: 'Yemek', icon: '☕', color: '#E8C97D' },
    seyahat: { label: 'Seyahat', icon: '✈', color: '#93B5E1' },
    etkinlik: { label: 'Etkinlik', icon: '★', color: '#FADADD' },
    egitim: { label: 'Eğitim', icon: '📚', color: '#7BAFCB' },
    diger: { label: 'Diğer', icon: '○', color: '#B0AAB3' },
  }

  const statusColors = {
    planned: '#93B5E1',
    completed: '#8ECFB0',
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ y: -2 }}
      className="rounded-xl p-5 transition-all hover:shadow-sm"
      style={{
        background: isLate
          ? 'rgba(232,128,140,0.06)'
          : plan.status === 'completed'
            ? 'rgba(142,207,176,0.06)'
            : 'rgba(255,255,255,0.7)',
        border: isLate
          ? '1px solid rgba(232,128,140,0.2)'
          : plan.status === 'completed'
            ? '1px solid rgba(142,207,176,0.2)'
            : '1px solid rgba(184,160,220,0.1)'
      }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2.5 h-2.5 rounded-full" style={{ background: statusColors[plan.status] || '#E8C97D' }} />
            <h3 className={`font-medium ${plan.status === 'completed' ? 'line-through' : ''}`}
              style={{ color: plan.status === 'completed' ? '#B8A9BC' : '#3D2C3E', fontSize: '0.95rem' }}>
              {plan.title}
            </h3>
            {isLate && <span className="text-xs px-2 py-0.5 rounded-full font-medium" style={{ background: 'rgba(232,128,140,0.1)', color: '#E8808C' }}>Gecikmiş</span>}
            {plan.priority && plan.priority !== 'low' && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{
                background: plan.priority === 'high' ? 'rgba(232,128,140,0.12)' : 'rgba(232,201,125,0.15)',
                color: plan.priority === 'high' ? '#E8808C' : '#C8A050'
              }}>
                {plan.priority === 'high' ? '🔴 Yüksek' : '🟡 Orta'}
              </span>
            )}
            {plan.recurrence && plan.recurrence.type !== 'none' && (
              <span className="text-[10px] font-medium px-1.5 py-0.5 rounded-md" style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
                <FiRepeat size={9} className="inline mr-0.5" />
                {plan.recurrence.type === 'daily' ? 'Günlük' : plan.recurrence.type === 'weekly' ? 'Haftalık' : 'Aylık'}
              </span>
            )}
            {plan.category && categoryConfig[plan.category] && (
              <span 
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ 
                  background: categoryConfig[plan.category].color + '25',
                  color: '#6E5A73'
                }}
              >
                {categoryConfig[plan.category].icon} {categoryConfig[plan.category].label}
              </span>
            )}
            {resolvedAssignee && assigneeConfig[resolvedAssignee] && (
              <span 
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md"
                style={{ 
                  background: assigneeConfig[resolvedAssignee].color + '30',
                  color: '#6E5A73'
                }}
              >
                {assigneeConfig[resolvedAssignee].short}
              </span>
            )}
          </div>

          {plan.description && (
            <p className="text-sm mb-3.5" style={{ color: '#9A949D' }}>{plan.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#B8A9BC' }}>
            <span className="flex items-center gap-1">
              <FiCalendar size={12} />
              {plan.plannedEndDate
                ? `${formatDate(plan.plannedDate)} → ${formatDate(plan.plannedEndDate)}`
                : `Plan: ${formatDate(plan.plannedDate)}`
              }
            </span>
            {plan.actualDate && (
              <span className="flex items-center gap-1" style={{ color: '#8ECFB0' }}>
                <FiCheck size={12} />
                Gerçek: {formatDate(plan.actualDate)}
              </span>
            )}
            {plan.createdByName && (
              <span style={{ color: isMyPlan ? '#B8A0DC' : '#E8808C' }}>
                {isMyPlan ? '✎ Ben' : `✎ ${plan.createdByName}`}
              </span>
            )}
            {plan.reminderAt && (
              <span className="flex items-center gap-1" style={{ color: '#E8C97D' }}>
                <FiBell size={11} />
                {formatDate(plan.reminderAt)}
              </span>
            )}
          </div>
        </div>

        <div className="flex gap-1 shrink-0">
          {/* Google Calendar'a aktar */}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => openInGoogleCalendar({
              title: plan.title,
              description: plan.description,
              startDate: plan.plannedDate,
              endDate: plan.plannedEndDate,
            })}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(66,133,244,0.1)', color: '#4285F4' }}
            title="Google Calendar'a Ekle"
          >
            <SiGooglecalendar size={14} />
          </motion.button>
          {plan.status === 'planned' && (
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={() => completePlan(plan.id)}
              className="p-2 rounded-lg transition cursor-pointer"
              style={{ background: 'rgba(142,207,176,0.15)', color: '#6FC09A' }}
              title="Tamamla"
            >
              <FiCheck size={15} />
            </motion.button>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(184,160,220,0.12)', color: '#B8A0DC' }}
            title="Düzenle"
          >
            <FiEdit2 size={15} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deletePlan(plan.id)}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(232,128,140,0.1)', color: '#E8808C' }}
            title="Sil"
          >
            <FiTrash2 size={15} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
