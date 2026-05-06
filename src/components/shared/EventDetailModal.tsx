import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { FiX, FiCalendar, FiClock, FiCheck, FiEdit2, FiTrash2, FiTag, FiUser, FiUsers, FiAlertTriangle, FiEdit3 } from 'react-icons/fi'
import { SiGooglecalendar } from 'react-icons/si'
import { format } from 'date-fns'
import { tr } from 'date-fns/locale'
import { useTheme, hexToRgba } from '@/context/ThemeContext'
import { openInGoogleCalendar } from '@/lib/googleCalendar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { DialogHeader, DialogBody } from '@/components/ui/dialog'
import InlineDateTimePicker from '@/components/ui/InlineDateTimePicker'
import toast from 'react-hot-toast'
import type { Plan, Todo } from '@/types'

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

const statusConfig = {
  planned: { label: 'Planlandı', color: '#93B5E1', bg: 'rgba(147,181,225,0.1)' },
  pending: { label: 'Bekliyor', color: '#E8C97D', bg: 'rgba(232,201,125,0.1)' },
  completed: { label: 'Tamamlandı', color: '#8ECFB0', bg: 'rgba(142,207,176,0.1)' },
  cancelled: { label: 'İptal', color: '#B0AAB3', bg: 'rgba(176,170,179,0.1)' },
}

interface EventDetailModalProps {
  event: Plan | Todo
  type: 'plan' | 'todo'
  onClose: () => void
  onEdit: (event: Plan | Todo) => void
}

export default function EventDetailModal({ event, type, onClose, onEdit }: EventDetailModalProps) {
  const { completePlan, completeTodo, cancelTodo, deletePlan, deleteTodo, updatePlan, updateTodo, isDemo } = useData()
  const { getAssignees, resolveAssignee } = useCouple()
  const { colors, mode } = useTheme()
  const [confirmDelete, setConfirmDelete] = useState(false)

  // Tarih düzenleme state'leri
  const [editingPlannedDate, setEditingPlannedDate] = useState(false)
  const [editingActualDate, setEditingActualDate] = useState(false)
  const [plannedDateVal, setPlannedDateVal] = useState(() => {
    if (!event.plannedDate) return ''
    try { return new Date(event.plannedDate).toISOString().slice(0, 16) } catch { return '' }
  })
  const [actualDateVal, setActualDateVal] = useState(() => {
    if (!event.actualDate) return ''
    try { return new Date(event.actualDate).toISOString().slice(0, 16) } catch { return '' }
  })

  const handleSavePlannedDate = async () => {
    if (!plannedDateVal) return
    try {
      const iso = new Date(plannedDateVal).toISOString()
      if (isPlan) await updatePlan(event.id, { plannedDate: iso })
      else await updateTodo(event.id, { plannedDate: iso })
      event.plannedDate = iso
      toast.success('Planlanan tarih güncellendi')
    } catch { toast.error('Tarih güncellenemedi') }
    setEditingPlannedDate(false)
  }

  const handleSaveActualDate = async () => {
    if (!actualDateVal) return
    try {
      const iso = new Date(actualDateVal).toISOString()
      if (isPlan) await updatePlan(event.id, { actualDate: iso })
      else await updateTodo(event.id, { actualDate: iso })
      event.actualDate = iso
      toast.success('Gerçekleşme tarihi güncellendi')
    } catch { toast.error('Tarih güncellenemedi') }
    setEditingActualDate(false)
  }

  // Dinamik assignee config oluştur
  const assigneeConfig = {}
  getAssignees().forEach(a => {
    assigneeConfig[a.value] = { label: a.label, icon: a.icon === 'users' ? <FiUsers size={14} /> : <FiUser size={14} />, color: a.color }
  })

  if (!event) return null

  const isPlan = type === 'plan'
  const isLate = (event.status === 'planned' || event.status === 'pending') && new Date(event.plannedDate) < new Date()
  const status = statusConfig[event.status] || statusConfig.planned

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '—'
    try {
      return format(new Date(dateStr), "d MMMM yyyy, HH:mm", { locale: tr })
    } catch {
      return dateStr
    }
  }

  const formatDateShort = (dateStr: string): string => {
    if (!dateStr) return '—'
    try {
      return format(new Date(dateStr), "d MMM yyyy", { locale: tr })
    } catch {
      return dateStr
    }
  }

  const handleComplete = async () => {
    if (isDemo) return
    if (isPlan) await completePlan(event.id)
    else await completeTodo(event.id)
    onClose()
  }

  const handleCancel = async () => {
    if (isDemo) return
    if (!isPlan) await cancelTodo(event.id)
    onClose()
  }

  const handleDelete = async () => {
    if (isDemo) return
    if (isPlan) await deletePlan(event.id)
    else await deleteTodo(event.id)
    onClose()
  }

  const cat = isPlan && event.category ? categoryConfig[event.category] : null
  const resolvedAssigneeValue = event.assignee ? resolveAssignee(event.assignee) : null
  const assignee = !isPlan && resolvedAssigneeValue ? assigneeConfig[resolvedAssigneeValue] : null

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.93, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.93, opacity: 0, y: 20 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-card rounded-3xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
      >
        {/* Üst renk bandı */}
        <div className="h-2.5" style={{ background: isLate ? '#E8808C' : status.color }} />

        {/* Header */}
        <div className="flex items-start justify-between px-7 sm:px-10 pt-7 sm:pt-9 pb-3">
          <div className="flex-1 pr-5">
            <div className="flex items-center gap-3 mb-4">
              {/* Durum badge */}
              <Badge
                variant={isLate ? 'destructive' : undefined}
                style={!isLate ? { background: status.bg, color: status.color } : undefined}
              >
                {isLate ? '⚠ Gecikmiş' : status.label}
              </Badge>
              {/* Tip badge */}
              <Badge variant={isPlan ? 'secondary' : 'default'}>
                {isPlan ? 'Plan' : 'Görev'}
              </Badge>
            </div>
            <h3 className="text-2xl sm:text-[1.7rem] font-semibold leading-snug"
              style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
              {event.title}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-3 rounded-xl transition cursor-pointer shrink-0 mt-0.5 hover:scale-105 text-[#B8A9BC] bg-[rgba(232,223,245,0.15)]"
          >
            <FiX size={20} />
          </button>
        </div>

        {/* Detay alanı */}
        <DialogBody className="pb-8 sm:pb-10 space-y-7">
          {/* Açıklama */}
          {event.description && (
            <p className="text-[15px] leading-relaxed" style={{ color: '#6E5A73' }}>
              {event.description}
            </p>
          )}

          {/* Meta bilgiler */}
          <div className="space-y-5">
            {/* Tarih */}
            <div className="flex items-center gap-5">
              <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                style={{ background: 'rgba(147,181,225,0.1)', color: '#93B5E1' }}>
                <FiCalendar size={20} />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium mb-1" style={{ color: '#9A949D' }}>Planlanan Tarih</p>
                {editingPlannedDate ? (
                  <div className="flex items-center gap-2">
                    <div className="flex-1 min-w-0">
                      <InlineDateTimePicker
                        value={plannedDateVal}
                        onChange={setPlannedDateVal}
                      />
                    </div>
                    <button onClick={handleSavePlannedDate}
                      className="p-2 rounded-lg cursor-pointer transition hover:scale-105"
                      style={{ background: 'rgba(142,207,176,0.15)', color: '#8ECFB0' }}>
                      <FiCheck size={16} />
                    </button>
                    <button onClick={() => setEditingPlannedDate(false)}
                      className="p-2 rounded-lg cursor-pointer transition hover:scale-105"
                      style={{ background: 'rgba(176,170,179,0.15)', color: '#B0AAB3' }}>
                      <FiX size={16} />
                    </button>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 group">
                    <p className="text-[15px] font-medium" style={{ color: '#3D2C3E' }}>
                      {isPlan ? formatDate(event.plannedDate) : formatDateShort(event.plannedDate)}
                    </p>
                    {!isDemo && (
                      <button onClick={() => setEditingPlannedDate(true)}
                        className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                        style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
                        <FiEdit3 size={13} />
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Gerçekleşme tarihi */}
            {event.actualDate && (
              <div className="flex items-center gap-5">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: 'rgba(142,207,176,0.1)', color: '#8ECFB0' }}>
                  <FiCheck size={20} />
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-medium mb-1" style={{ color: '#9A949D' }}>Gerçekleşme Tarihi</p>
                  {editingActualDate ? (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 min-w-0">
                        <InlineDateTimePicker
                          value={actualDateVal}
                          onChange={setActualDateVal}
                        />
                      </div>
                      <button onClick={handleSaveActualDate}
                        className="p-2 rounded-lg cursor-pointer transition hover:scale-105"
                        style={{ background: 'rgba(142,207,176,0.15)', color: '#8ECFB0' }}>
                        <FiCheck size={16} />
                      </button>
                      <button onClick={() => setEditingActualDate(false)}
                        className="p-2 rounded-lg cursor-pointer transition hover:scale-105"
                        style={{ background: 'rgba(176,170,179,0.15)', color: '#B0AAB3' }}>
                        <FiX size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 group">
                      <p className="text-[15px] font-medium" style={{ color: '#3D2C3E' }}>
                        {isPlan ? formatDate(event.actualDate) : formatDateShort(event.actualDate)}
                      </p>
                      {!isDemo && (
                        <button onClick={() => setEditingActualDate(true)}
                          className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg cursor-pointer transition-all hover:scale-105"
                          style={{ background: 'rgba(184,160,220,0.1)', color: '#B8A0DC' }}>
                          <FiEdit3 size={13} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Kategori (Plan) */}
            {cat && (
              <div className="flex items-center gap-5">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 text-xl"
                  style={{ background: cat.color + '15' }}>
                  {cat.icon}
                </span>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9A949D' }}>Kategori</p>
                  <p className="text-[15px] font-medium" style={{ color: '#3D2C3E' }}>{cat.label}</p>
                </div>
              </div>
            )}

            {/* Atama (Todo) */}
            {assignee && (
              <div className="flex items-center gap-5">
                <span className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0"
                  style={{ background: assignee.color + '15', color: assignee.color }}>
                  {assignee.icon}
                </span>
                <div>
                  <p className="text-xs font-medium mb-1" style={{ color: '#9A949D' }}>Sorumlu</p>
                  <p className="text-[15px] font-medium" style={{ color: '#3D2C3E' }}>{assignee.label}</p>
                </div>
              </div>
            )}
          </div>

          {/* Aksiyon butonları */}
          <div className="pt-6" style={{ borderTop: '1px solid rgba(232,223,245,0.25)' }}>
            {/* Silme onayı */}
            <AnimatePresence>
              {confirmDelete && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="mb-5 p-5 rounded-2xl"
                  style={{ background: 'rgba(232,128,140,0.06)', border: '1px solid rgba(232,128,140,0.15)' }}
                >
                  <p className="text-sm font-medium mb-4" style={{ color: '#E8808C' }}>
                    Silmek istediğinize emin misiniz?
                  </p>
                  <div className="flex gap-3">
                    <Button variant="destructive" size="sm" onClick={handleDelete} className="flex-1 py-3.5 bg-[#E8808C] text-white hover:bg-[#d6717d]">
                      Evet, Sil
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setConfirmDelete(false)} className="flex-1 py-3.5 bg-[rgba(232,223,245,0.15)] text-[#6E5A73]">
                      Vazgeç
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Ana butonlar - 2 satır */}
            <div className="space-y-3.5">
              {/* Üst satır: Tamamla (tam genişlik) */}
              {(event.status === 'planned' || event.status === 'pending') && (
                <Button variant="success" onClick={handleComplete} className="w-full gap-3">
                  <FiCheck size={19} /> Tamamla
                </Button>
              )}

              {/* Alt satır: İptal + Düzenle + Sil */}
              <div className="flex gap-3">
                {/* İptal (sadece todo) */}
                {!isPlan && event.status === 'pending' && (
                  <Button variant="muted" size="sm" onClick={handleCancel} className="flex-1 gap-2.5">
                    <FiX size={17} /> İptal Et
                  </Button>
                )}

                {/* Düzenle */}
                <Button variant="secondary" size="sm" onClick={() => { onEdit(event); onClose() }} className="flex-1 gap-2.5">
                  <FiEdit2 size={17} /> Düzenle
                </Button>

                {/* Google Calendar */}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => openInGoogleCalendar({
                    title: event.title,
                    description: (event as any).description,
                    startDate: event.plannedDate,
                    endDate: (event as Plan).plannedEndDate,
                  })}
                  title="Google Calendar'a Ekle"
                  style={{ color: '#4285F4', background: 'rgba(66,133,244,0.08)' }}
                >
                  <SiGooglecalendar size={17} />
                </Button>

                {/* Sil */}
                <Button variant="destructive" size="icon" onClick={() => setConfirmDelete(true)}>
                  <FiTrash2 size={17} />
                </Button>
              </div>
            </div>
          </div>

          {/* Demo uyarısı */}
          {isDemo && (
            <p className="text-xs text-center pt-3" style={{ color: '#B8A9BC' }}>
              Demo modunda düzenleme yapamazsınız
            </p>
          )}
        </DialogBody>
      </motion.div>
    </motion.div>
  )
}
