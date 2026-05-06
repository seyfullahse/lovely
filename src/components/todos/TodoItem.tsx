import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { useAuth } from '../../context/AuthContext'
import { FiCheck, FiX, FiEdit2, FiTrash2, FiClock, FiFlag, FiBell, FiRepeat } from 'react-icons/fi'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import type { Todo } from '@/types'

interface TodoItemProps {
  todo: Todo
  onEdit: () => void
}

export default function TodoItem({ todo, onEdit }: TodoItemProps) {
  const { completeTodo, cancelTodo, deleteTodo } = useData()
  const { getAssignees, resolveAssignee } = useCouple()
  const { currentUser } = useAuth()

  const isLate = todo.status === 'pending' && new Date(todo.plannedDate) < new Date()
  const isMyTodo = todo.createdBy === currentUser?.uid

  // Dinamik assignee config oluştur
  const assigneeConfig = {}
  getAssignees().forEach(a => {
    assigneeConfig[a.value] = { label: a.short, fullLabel: a.label, color: a.color }
  })

  // Eski person1/person2 değerlerini UID'ye çevir
  const resolvedAssignee = resolveAssignee(todo.assignee)

  const statusConfig = {
    pending: { bg: 'rgba(232,201,125,0.1)', border: '1px solid rgba(232,201,125,0.3)', icon: '◌', label: 'Bekliyor' },
    completed: { bg: 'rgba(142,207,176,0.1)', border: '1px solid rgba(142,207,176,0.3)', icon: '✓', label: 'Tamamlandı' },
    cancelled: { bg: 'rgba(176,170,179,0.1)', border: '1px solid rgba(176,170,179,0.3)', icon: '✕', label: 'İptal' },
  }

  const config = statusConfig[todo.status] || statusConfig.pending

  if (isLate) {
    config.bg = 'rgba(232,128,140,0.08)'
    config.border = '1px solid rgba(232,128,140,0.25)'
    config.icon = '!'
    config.label = 'Gecikmiş'
  }

  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-'
    try {
      return format(new Date(dateStr), 'd MMM yyyy', { locale: tr })
    } catch {
      return dateStr
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: 20 }}
      className="rounded-xl p-5 transition-all hover:shadow-sm"
      style={{ background: config.bg, border: config.border }}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="text-sm font-medium" style={{ color: '#B8A0DC' }}>{config.icon}</span>
            <h3 className={`font-medium text-sm truncate ${todo.status === 'completed' ? 'line-through' : ''}`}
              style={{ color: todo.status === 'completed' ? '#B8A9BC' : '#3D2C3E' }}>
              {todo.title}
            </h3>
            {resolvedAssignee && assigneeConfig[resolvedAssignee] && (
              <span 
                className="text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                style={{ 
                  background: assigneeConfig[resolvedAssignee].color + '30',
                  color: '#6E5A73'
                }}
              >
                {assigneeConfig[resolvedAssignee].label}
              </span>
            )}
            {/* Öncelik rozeti */}
            {todo.priority && todo.priority !== 'low' && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                style={{
                  background: todo.priority === 'high' ? 'rgba(232,128,140,0.15)' : 'rgba(232,201,125,0.15)',
                  color: todo.priority === 'high' ? '#E8808C' : '#D4A843'
                }}
              >
                <FiFlag size={10} />
                {todo.priority === 'high' ? 'Yüksek' : 'Orta'}
              </span>
            )}
            {/* Tekrar rozeti */}
            {todo.recurrence && todo.recurrence.type !== 'none' && (
              <span
                className="flex items-center gap-0.5 text-[10px] font-medium px-1.5 py-0.5 rounded-md shrink-0"
                style={{ background: 'rgba(184,160,220,0.15)', color: '#9B7FCC' }}
              >
                <FiRepeat size={10} />
                {{ daily: 'Günlük', weekly: 'Haftalık', monthly: 'Aylık' }[todo.recurrence.type]}
              </span>
            )}
          </div>

          {todo.description && (
            <p className="text-sm text-gray-500 mb-3 line-clamp-2">{todo.description}</p>
          )}

          <div className="flex flex-wrap gap-3 text-xs" style={{ color: '#B8A9BC' }}>
            <span className="flex items-center gap-1">
              <FiClock size={12} />
              Plan: {formatDate(todo.plannedDate)}
            </span>
            {todo.actualDate && (
              <span className="flex items-center gap-1" style={{ color: '#8ECFB0' }}>
                <FiCheck size={12} />
                Gerçek: {formatDate(todo.actualDate)}
              </span>
            )}
            {todo.linkedPlan && (
              <span style={{ color: '#B8A0DC' }}>◊ Plana bağlı</span>
            )}
            {todo.reminderAt && (
              <span className="flex items-center gap-1" style={{ color: '#D4A843' }}>
                <FiBell size={12} />
                {(() => { try { return format(new Date(todo.reminderAt), 'd MMM HH:mm', { locale: tr }) } catch { return '' } })()}
              </span>
            )}
            {todo.createdByName && (
              <span style={{ color: isMyTodo ? '#B8A0DC' : '#E8808C' }}>
                {isMyTodo ? '✎ Ben' : `✎ ${todo.createdByName}`}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-1 shrink-0">
          {todo.status === 'pending' && (
            <>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => completeTodo(todo.id)}
                className="p-2 rounded-lg transition cursor-pointer"
                style={{ background: 'rgba(142,207,176,0.15)', color: '#6FC09A' }}
                title="Tamamla"
              >
                <FiCheck size={15} />
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                onClick={() => cancelTodo(todo.id)}
                className="p-2 rounded-lg transition cursor-pointer"
                style={{ background: 'rgba(176,170,179,0.15)', color: '#9A949D' }}
                title="İptal Et"
              >
                <FiX size={15} />
              </motion.button>
            </>
          )}
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={onEdit}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(184,160,220,0.12)', color: '#B8A0DC' }}
            title="Düzenle"
          >
            <FiEdit2 size={16} />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => deleteTodo(todo.id)}
            className="p-2 rounded-lg transition cursor-pointer"
            style={{ background: 'rgba(232,128,140,0.12)', color: '#E8808C' }}
            title="Sil"
          >
            <FiTrash2 size={16} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  )
}
