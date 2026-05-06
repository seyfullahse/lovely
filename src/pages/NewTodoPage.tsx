import { useState } from 'react'
import { motion } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useCouple } from '../context/CoupleContext'
import { useNavigate } from 'react-router-dom'
import { FiType, FiAlignLeft, FiCalendar, FiLink, FiUsers, FiUser, FiCheck, FiFlag, FiBell, FiRepeat } from 'react-icons/fi'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import TurkishDatePicker from '@/components/ui/TurkishDatePicker'
import TurkishDateTimePicker from '@/components/ui/TurkishDateTimePicker'
import toast from 'react-hot-toast'

import type { Priority, RecurrenceType } from '@/types'

export default function NewTodoPage() {
  const { currentUser } = useAuth()
  const { addTodo, plans } = useData()
  const { getAssignees } = useCouple()
  const navigate = useNavigate()

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [plannedDate, setPlannedDate] = useState('')
  const [linkedPlan, setLinkedPlan] = useState('')
  const [assignee, setAssignee] = useState('both')
  const [priority, setPriority] = useState<Priority | ''>('')
  const [reminderAt, setReminderAt] = useState('')
  const [recurrenceType, setRecurrenceType] = useState<RecurrenceType>('none')
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)

  const assignees = getAssignees().map(a => ({
    ...a,
    iconEl: a.icon === 'users' ? <FiUsers size={16} /> : <FiUser size={16} />,
  }))

  if (!currentUser) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center rounded-2xl p-12 max-w-md"
          style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <h2 className="text-2xl font-semibold mb-4" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Giriş Yapmalısın
          </h2>
          <p className="text-sm mb-6" style={{ color: '#9A949D' }}>Görev oluşturmak için giriş yap.</p>
          <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
            onClick={() => navigate('/login')}
            className="px-8 py-2.5 rounded-full font-medium text-sm cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}>
            Giriş Yap
          </motion.button>
        </motion.div>
      </div>
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !plannedDate) {
      toast.error('Başlık ve tarih zorunludur!')
      return
    }

    setSubmitting(true)
    try {
      await addTodo({
        title: title.trim(),
        description: description.trim(),
        plannedDate,
        linkedPlan: linkedPlan || null,
        assignee,
        priority: priority || null,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
        recurrence: recurrenceType !== 'none' ? { type: recurrenceType, interval: 1, endDate: undefined } : null,
      } as any)
      setSuccess(true)
      toast.success('Yeni görev oluşturuldu! ✅')
      setTimeout(() => navigate('/dashboard'), 1500)
    } catch (error) {
      console.error(error)
      toast.error('Bir hata oluştu')
    } finally {
      setSubmitting(false)
    }
  }

  // Başarı ekranı
  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: 'spring', damping: 20 }}
          className="text-center"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.2, type: 'spring' }}
            className="w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)' }}
          >
            <FiCheck size={32} style={{ color: '#3D2C3E' }} />
          </motion.div>
          <h2 className="text-2xl font-semibold mb-2" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Görev Oluşturuldu!
          </h2>
          <p className="text-sm" style={{ color: '#B8A9BC' }}>Dashboard'a yönlendiriliyorsun...</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen px-4 py-6 sm:px-10 md:py-8 lg:px-14 2xl:px-20">
      <div className="max-w-xl mx-auto">

        {/* Başlık */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
          <h1 className="text-2xl md:text-3xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
            Yeni Görev Oluştur
          </h1>
          <p className="text-sm mt-1" style={{ color: '#B8A9BC' }}>Yapılacaklar listesine yeni görev ekle</p>
        </motion.div>

        {/* Form */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="rounded-2xl p-6 sm:p-8"
          style={{ background: 'rgba(255,255,255,0.7)', border: '1px solid rgba(184,160,220,0.1)' }}
        >
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Başlık */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#6E5A73' }}>
                <FiType size={14} style={{ color: '#B8A0DC' }} />
                Görev Başlığı
              </label>
              <Input
                type="text"
                value={title}
                onChange={e => setTitle(e.target.value)}
                placeholder="Örn: Market alışverişi, Hediye al..."
                required
              />
            </div>

            {/* Açıklama */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#6E5A73' }}>
                <FiAlignLeft size={14} style={{ color: '#B8A0DC' }} />
                Açıklama
                <span className="text-xs font-normal" style={{ color: '#B8A9BC' }}>(Opsiyonel)</span>
              </label>
              <Textarea
                value={description}
                onChange={e => setDescription(e.target.value)}
                placeholder="Detayları ekleyin..."
                rows={3}
              />
            </div>

            {/* Tarih & Bağlı Plan */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#6E5A73' }}>
                  <FiCalendar size={14} style={{ color: '#B8A0DC' }} />
                  Tarih
                </label>
                <TurkishDatePicker
                  value={plannedDate}
                  onChange={setPlannedDate}
                  required
                />
              </div>
              <div>
                <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#6E5A73' }}>
                  <FiLink size={14} style={{ color: '#B8A0DC' }} />
                  Bağlı Plan
                </label>
                <select
                  value={linkedPlan}
                  onChange={e => setLinkedPlan(e.target.value)}
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

            {/* Kim Yapacak */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>
                <FiUsers size={14} style={{ color: '#B8A0DC' }} />
                Kim yapacak?
              </label>
              <div className="grid grid-cols-3 gap-3">
                {assignees.map(a => (
                  <motion.button
                    key={a.value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setAssignee(a.value)}
                    className="flex items-center justify-center gap-2.5 py-4 rounded-2xl text-sm font-medium transition-all cursor-pointer"
                    style={{
                      background: assignee === a.value ? a.color + '18' : 'rgba(253,246,240,0.6)',
                      border: assignee === a.value ? `2px solid ${a.color}` : '2px solid rgba(240,236,245,0.8)',
                      color: assignee === a.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: assignee === a.value ? `0 0 0 3px ${a.color}15` : 'none'
                    }}
                  >
                    {a.iconEl}
                    {a.label}
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Öncelik */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>
                <FiFlag size={14} style={{ color: '#B8A0DC' }} />
                Öncelik
                <span className="text-xs font-normal" style={{ color: '#B8A9BC' }}>(Opsiyonel)</span>
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: '', label: 'Yok', icon: '—', color: '#B8A9BC' },
                  { value: 'low', label: 'Düşük', icon: '🟢', color: '#7BC88C' },
                  { value: 'medium', label: 'Orta', icon: '🟡', color: '#E8C97D' },
                  { value: 'high', label: 'Yüksek', icon: '🔴', color: '#E8808C' },
                ].map(p => (
                  <motion.button
                    key={p.value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setPriority(p.value as Priority | '')}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: priority === p.value ? p.color + '18' : 'rgba(253,246,240,0.6)',
                      border: priority === p.value ? `2px solid ${p.color}` : '2px solid rgba(240,236,245,0.8)',
                      color: priority === p.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: priority === p.value ? `0 0 0 3px ${p.color}15` : 'none'
                    }}
                  >
                    <span>{p.icon}</span>
                    <span>{p.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Hatırlatma */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-2" style={{ color: '#6E5A73' }}>
                <FiBell size={14} style={{ color: '#B8A0DC' }} />
                Hatırlatma
                <span className="text-xs font-normal" style={{ color: '#B8A9BC' }}>(Opsiyonel)</span>
              </label>
              <TurkishDateTimePicker
                value={reminderAt}
                onChange={(val) => setReminderAt(val)}
              />
            </div>

            {/* Tekrar */}
            <div>
              <label className="flex items-center gap-2 text-xs font-semibold mb-3" style={{ color: '#6E5A73' }}>
                <FiRepeat size={14} style={{ color: '#B8A0DC' }} />
                Tekrar
                <span className="text-xs font-normal" style={{ color: '#B8A9BC' }}>(Opsiyonel)</span>
              </label>
              <div className="grid grid-cols-4 gap-2.5">
                {[
                  { value: 'none', label: 'Yok', icon: '—' },
                  { value: 'daily', label: 'Günlük', icon: '📆' },
                  { value: 'weekly', label: 'Haftalık', icon: '📅' },
                  { value: 'monthly', label: 'Aylık', icon: '🗓️' },
                ].map(r => (
                  <motion.button
                    key={r.value}
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setRecurrenceType(r.value as RecurrenceType)}
                    className="flex items-center justify-center gap-1.5 py-3 rounded-2xl text-xs font-medium transition-all cursor-pointer"
                    style={{
                      background: recurrenceType === r.value ? 'rgba(184,160,220,0.12)' : 'rgba(253,246,240,0.6)',
                      border: recurrenceType === r.value ? '2px solid #B8A0DC' : '2px solid rgba(240,236,245,0.8)',
                      color: recurrenceType === r.value ? '#3D2C3E' : '#9A949D',
                      boxShadow: recurrenceType === r.value ? '0 0 0 3px rgba(184,160,220,0.1)' : 'none'
                    }}
                  >
                    <span>{r.icon}</span>
                    <span>{r.label}</span>
                  </motion.button>
                ))}
              </div>
            </div>

            {/* Butonlar */}
            <div className="flex gap-3 pt-2">
              <Button type="submit" disabled={submitting} className="flex-1">
                {submitting ? 'Oluşturuluyor...' : 'Görev Oluştur'}
              </Button>
              <button type="button" onClick={() => navigate(-1)}
                className="px-6 py-3 rounded-xl text-sm font-medium cursor-pointer transition"
                style={{ background: 'rgba(184,160,220,0.08)', color: '#6E5A73' }}>
                İptal
              </button>
            </div>
          </form>
        </motion.div>
      </div>
    </div>
  )
}
