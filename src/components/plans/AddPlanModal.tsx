import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { usePartner } from '../../context/PartnerContext'
import { FiX, FiType, FiAlignLeft, FiCalendar, FiTag, FiUsers, FiUser, FiArrowRight, FiFlag, FiBell, FiRepeat } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import TurkishDateTimePicker from '@/components/ui/TurkishDateTimePicker'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { DialogHeader, DialogBody } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import type { Plan, Priority, RecurrenceType } from '@/types'

interface AddPlanModalProps {
  onClose: () => void
  editPlan?: Plan | null
  prefilledDate?: string | null
}

export default function AddPlanModal({ onClose, editPlan, prefilledDate }: AddPlanModalProps) {
  const { addPlan, updatePlan } = useData()
  const { getAssignees, resolveAssignee } = useCouple()
  const { isPaired } = usePartner()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [plannedDate, setPlannedDate] = useState(prefilledDate ? `${prefilledDate}T10:00` : '')
  const [plannedEndDate, setPlannedEndDate] = useState('')
  const [hasDateRange, setHasDateRange] = useState(false)
  const [category, setCategory] = useState('')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [reminderAt, setReminderAt] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [assignee, setAssignee] = useState('both')
  const [submitting, setSubmitting] = useState(false)

  const assignees = getAssignees().map(a => ({
    ...a,
    iconEl: a.icon === 'users' ? <FiUsers size={14} /> : <FiUser size={14} />,
  }))

  const categories = [
    { value: 'spor', label: 'Spor', icon: '⚽' },
    { value: 'saglik', label: 'Sağlık', icon: '❤' },
    { value: 'muzik', label: 'Müzik', icon: '♫' },
    { value: 'yemek', label: 'Yemek', icon: '☕' },
    { value: 'seyahat', label: 'Seyahat', icon: '✈' },
    { value: 'etkinlik', label: 'Etkinlik', icon: '★' },
    { value: 'egitim', label: 'Eğitim', icon: '📚' },
    { value: 'diger', label: 'Diğer', icon: '○' },
  ]

  useEffect(() => {
    if (editPlan) {
      setTitle(editPlan.title || '')
      setDescription(editPlan.description || '')
      setCategory(editPlan.category || '')
      setAssignee(resolveAssignee(editPlan.assignee) || 'both')
      setPriority(editPlan.priority || '')
      setRecurrenceType(editPlan.recurrence?.type || 'none')
      if (editPlan.reminderAt) {
        const r = new Date(editPlan.reminderAt)
        setReminderAt(r.toISOString().slice(0, 16))
      }
      if (editPlan.plannedDate) {
        const d = new Date(editPlan.plannedDate)
        setPlannedDate(d.toISOString().slice(0, 16))
      }
      if (editPlan.plannedEndDate) {
        setHasDateRange(true)
        const d = new Date(editPlan.plannedEndDate)
        setPlannedEndDate(d.toISOString().slice(0, 16))
      }
    }
  }, [editPlan])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !plannedDate) {
      toast.error('Başlık ve tarih zorunludur!')
      return
    }

    setSubmitting(true)
    try {
      const data: any = {
        title: title.trim(),
        description: description.trim(),
        plannedDate: new Date(plannedDate).toISOString(),
        plannedEndDate: hasDateRange && plannedEndDate ? new Date(plannedEndDate).toISOString() : null,
        category: category || 'diger',
        priority: priority || null,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
        recurrence: recurrenceType !== 'none' ? { type: recurrenceType, interval: 1, endDate: undefined } : null,
        assignee: assignee as any
      }

      if (editPlan) {
        await updatePlan(editPlan.id, data)
        toast.success('Plan güncellendi!')
      } else {
        await addPlan(data)
        toast.success('Yeni plan eklendi!')
      }
      onClose()
    } catch (error) {
      console.error(error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="modal-overlay fixed inset-0 z-50 flex items-center justify-center p-5 sm:p-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 16 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 16 }}
        transition={{ type: 'spring', damping: 24, stiffness: 260 }}
        onClick={(e) => e.stopPropagation()}
        className="modal-card rounded-3xl w-full max-w-xl overflow-hidden max-h-[90vh] overflow-y-auto animate-in fade-in-0 zoom-in-95"
      >
        {/* Header */}
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[1.35rem] font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>{editPlan ? 'Planı Düzenle' : 'Yeni Plan'}</h2>
              <p className="text-sm mt-1.5 text-[#B8A9BC]">
                {editPlan ? 'Plan detaylarını güncelleyin' : 'Yeni bir plan oluşturun'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="p-3 rounded-xl transition cursor-pointer hover:rotate-90 duration-200 hover:scale-105 text-[#B8A9BC] bg-[rgba(232,223,245,0.15)]"
            >
              <FiX size={20} />
            </button>
          </div>
        </DialogHeader>

        {/* Form */}
        <DialogBody>
          <form onSubmit={handleSubmit} className="space-y-7">
            {/* Başlık */}
            <div>
              <Label>
                <FiType size={15} className="text-[#B8A0DC]" />
                Plan Başlığı
              </Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Örn: Akşam Yemeği"
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <Label>
                <FiAlignLeft size={15} className="text-[#B8A0DC]" />
                Açıklama
                <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
              </Label>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Detaylar ve notlar..."
                rows={3}
              />
            </div>

            {/* Tarih + Bitiş Tarihi */}
            <div className="space-y-3">
              <div>
                <Label>
                  <FiCalendar size={15} className="text-[#B8A0DC]" />
                  {hasDateRange ? 'Başlangıç Tarihi' : 'Tarih ve Saat'}
                </Label>
                <TurkishDateTimePicker
                  value={plannedDate}
                  onChange={(val) => setPlannedDate(val)}
                  required
                />
              </div>

              {/* Bitiş Tarihi (Opsiyonel) */}
              {!hasDateRange ? (
                <button
                  type="button"
                  onClick={() => setHasDateRange(true)}
                  className="flex items-center gap-2 text-xs font-medium px-3 py-2 rounded-xl transition-all cursor-pointer"
                  style={{ color: '#B8A0DC', background: 'rgba(184,160,220,0.08)', border: '1px dashed rgba(184,160,220,0.3)' }}
                >
                  <FiArrowRight size={13} />
                  Bitiş tarihi ekle (opsiyonel)
                </button>
              ) : (
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <Label>
                      <FiArrowRight size={15} className="text-[#B8A0DC]" />
                      Bitiş Tarihi
                      <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
                    </Label>
                    <button
                      type="button"
                      onClick={() => { setHasDateRange(false); setPlannedEndDate('') }}
                      className="text-[10px] font-medium px-2 py-1 rounded-lg transition cursor-pointer"
                      style={{ color: '#E8808C', background: 'rgba(232,128,140,0.08)' }}
                    >
                      Kaldır
                    </button>
                  </div>
                  <TurkishDateTimePicker
                    value={plannedEndDate}
                    onChange={(val) => setPlannedEndDate(val)}
                  />
                </div>
              )}
            </div>

            {/* Kategori */}
            <div>
              <Label>
                <FiTag size={15} className="text-[#B8A0DC]" />
                Kategori
              </Label>
              <div className="grid grid-cols-4 sm:grid-cols-8 gap-2.5">
                {categories.map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    onClick={() => setCategory(cat.value)}
                    className="flex flex-col items-center gap-1.5 py-3.5 rounded-2xl text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: category === cat.value ? 'rgba(184,160,220,0.12)' : '#FAFAFA',
                      border: category === cat.value ? '2px solid #B8A0DC' : '2px solid #F0ECF5',
                      color: category === cat.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: category === cat.value ? '0 0 0 3px rgba(184,160,220,0.1)' : 'none'
                    }}
                  >
                    <span className="text-lg">{cat.icon}</span>
                    <span>{cat.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Kimin Planı — Eşleşme varsa göster */}
            {isPaired && (
              <div>
                <Label>
                  <FiUsers size={15} className="text-[#B8A0DC]" />
                  Kimin Planı?
                </Label>
                <div className="grid grid-cols-3 gap-2.5">
                  {assignees.map(a => (
                    <button
                      key={a.value}
                      type="button"
                      onClick={() => setAssignee(a.value)}
                      className="flex items-center justify-center gap-2 py-3.5 rounded-2xl text-xs font-medium transition-all cursor-pointer"
                      style={{
                        background: assignee === a.value ? a.color + '18' : '#FAFAFA',
                        border: assignee === a.value ? `2px solid ${a.color}` : '2px solid #F0ECF5',
                        color: assignee === a.value ? '#3D2C3E' : '#9A949D',
                        boxShadow: assignee === a.value ? `0 0 0 3px ${a.color}15` : 'none'
                      }}
                    >
                      {a.iconEl}
                      {a.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Öncelik */}
            <div>
              <Label>
                <FiFlag size={15} className="text-[#B8A0DC]" />
                Öncelik
                <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: '', label: 'Yok', icon: '—', color: '#B8A9BC' },
                  { value: 'low', label: 'Düşük', icon: '🟢', color: '#7BC88C' },
                  { value: 'medium', label: 'Orta', icon: '🟡', color: '#E8C97D' },
                  { value: 'high', label: 'Yüksek', icon: '🔴', color: '#E8808C' },
                ].map(p => (
                  <button
                    key={p.value}
                    type="button"
                    onClick={() => setPriority(p.value as Priority | '')}
                    className="flex items-center justify-center gap-1 py-2.5 rounded-2xl text-[11px] font-medium transition-all cursor-pointer"
                    style={{
                      background: priority === p.value ? p.color + '18' : '#FAFAFA',
                      border: priority === p.value ? `2px solid ${p.color}` : '2px solid #F0ECF5',
                      color: priority === p.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: priority === p.value ? `0 0 0 3px ${p.color}15` : 'none'
                    }}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Hatırlatma */}
            <div>
              <Label>
                <FiBell size={15} className="text-[#B8A0DC]" />
                Hatırlatma
                <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
              </Label>
              <TurkishDateTimePicker
                value={reminderAt}
                onChange={(val) => setReminderAt(val)}
              />
            </div>

            {/* Tekrarlayan Etkinlik */}
            <div>
              <Label>
                <FiRepeat size={15} className="text-[#B8A0DC]" />
                Tekrar
                <span className="text-xs font-normal text-[#B8A9BC]">(Opsiyonel)</span>
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { value: 'none', label: 'Yok', icon: '—' },
                  { value: 'daily', label: 'Günlük', icon: '📆' },
                  { value: 'weekly', label: 'Haftalık', icon: '📅' },
                  { value: 'monthly', label: 'Aylık', icon: '🗓️' },
                ].map(r => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRecurrenceType(r.value as RecurrenceType)}
                    className="flex items-center justify-center gap-1 py-2.5 rounded-2xl text-[11px] font-medium transition-all cursor-pointer"
                    style={{
                      background: recurrenceType === r.value ? 'rgba(184,160,220,0.12)' : '#FAFAFA',
                      border: recurrenceType === r.value ? '2px solid #B8A0DC' : '2px solid #F0ECF5',
                      color: recurrenceType === r.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: recurrenceType === r.value ? '0 0 0 3px rgba(184,160,220,0.1)' : 'none'
                    }}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <Button type="submit" disabled={submitting} className="w-full">
                {submitting ? 'Kaydediliyor...' : editPlan ? 'Güncelle' : 'Plan Oluştur'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </motion.div>
    </motion.div>
  )
}
