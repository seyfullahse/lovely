import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { FiX, FiUser, FiUsers, FiCalendar, FiLink, FiType, FiAlignLeft, FiFlag, FiBell, FiRepeat } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import TurkishDatePicker from '@/components/ui/TurkishDatePicker'
import TurkishDateTimePicker from '@/components/ui/TurkishDateTimePicker'
import { DialogHeader, DialogBody } from '@/components/ui/dialog'
import toast from 'react-hot-toast'
import type { Todo, Priority, RecurrenceType } from '@/types'

interface AddTodoModalProps {
  onClose: () => void
  editTodo?: Todo | null
  prefilledDate?: string | null
}

export default function AddTodoModal({ onClose, editTodo, prefilledDate }: AddTodoModalProps) {
  const { addTodo, updateTodo, plans } = useData()
  const { getAssignees, resolveAssignee } = useCouple()
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [plannedDate, setPlannedDate] = useState(prefilledDate || '')
  const [linkedPlan, setLinkedPlan] = useState('')
  const [assignee, setAssignee] = useState('both')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [reminderAt, setReminderAt] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [submitting, setSubmitting] = useState(false)

  const assignees = getAssignees().map(a => ({
    ...a,
    icon: a.icon === 'users' ? <FiUsers size={14} /> : <FiUser size={14} />,
  }))

  useEffect(() => {
    if (editTodo) {
      setTitle(editTodo.title || '')
      setDescription(editTodo.description || '')
      setPlannedDate(editTodo.plannedDate?.split('T')[0] || '')
      setLinkedPlan(editTodo.linkedPlan || '')
      setAssignee(resolveAssignee(editTodo.assignee) || 'both')
      setPriority(editTodo.priority || '')
      setRecurrenceType(editTodo.recurrence?.type || 'none')
      if (editTodo.reminderAt) {
        const r = new Date(editTodo.reminderAt)
        setReminderAt(r.toISOString().slice(0, 16))
      }
    }
  }, [editTodo])

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
        plannedDate,
        linkedPlan: linkedPlan || null,
        assignee,
        priority: priority || null,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
        recurrence: recurrenceType !== 'none' ? { type: recurrenceType, interval: 1, endDate: undefined } : null,
      }

      if (editTodo) {
        await updateTodo(editTodo.id, data)
        toast.success('Görev güncellendi!')
      } else {
        await addTodo(data)
        toast.success('Yeni görev eklendi!')
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
              <h2 className="text-[1.35rem] font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>{editTodo ? 'Görevi Düzenle' : 'Yeni Görev'}</h2>
              <p className="text-sm mt-1.5 text-[#B8A9BC]">
                {editTodo ? 'Görev detaylarını güncelleyin' : 'Yeni bir görev oluşturun'}
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
                Başlık
              </Label>
              <Input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Görev başlığını yazın..."
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
                placeholder="Detayları ekleyin..."
                rows={3}
              />
            </div>

            {/* Tarih & Bağlı Plan yan yana */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <Label>
                  <FiCalendar size={15} className="text-[#B8A0DC]" />
                  Tarih
                </Label>
                <TurkishDatePicker
                  value={plannedDate}
                  onChange={setPlannedDate}
                  required
                />
              </div>
              <div>
                <Label>
                  <FiLink size={15} className="text-[#B8A0DC]" />
                  Bağlı Plan
                </Label>
                <select
                  value={linkedPlan}
                  onChange={(e) => setLinkedPlan(e.target.value)}
                  className="flex w-full rounded-2xl bg-[#FAFAFA] px-5 py-4 text-[15px] text-[#3D2C3E] border-[1.5px] border-[#F0ECF5] outline-none transition-all duration-200 focus:border-[#B8A0DC] focus:shadow-[0_0_0_3px_rgba(184,160,220,0.1)]"
                  style={{ color: linkedPlan ? '#3D2C3E' : '#B8A9BC' }}
                >
                  <option value="">Seçiniz</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>{plan.title}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Görev Ataması */}
            <div>
              <Label>
                <FiUsers size={15} className="text-[#B8A0DC]" />
                Kim yapacak?
              </Label>
              <div className="grid grid-cols-3 gap-3">
                {assignees.map(a => (
                  <button
                    key={a.value}
                    type="button"
                    onClick={() => setAssignee(a.value)}
                    className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-medium transition-all cursor-pointer"
                    style={{
                      background: assignee === a.value ? a.color + '18' : '#FAFAFA',
                      border: assignee === a.value ? `2px solid ${a.color}` : '2px solid #F0ECF5',
                      color: assignee === a.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: assignee === a.value ? `0 0 0 3px ${a.color}15` : 'none'
                    }}
                  >
                    {a.icon}
                    {a.label}
                  </button>
                ))}
              </div>
            </div>

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

            {/* Tekrar */}
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
                {submitting ? 'Kaydediliyor...' : editTodo ? 'Güncelle' : 'Görev Oluştur'}
              </Button>
            </div>
          </form>
        </DialogBody>
      </motion.div>
    </motion.div>
  )
}
