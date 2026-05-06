import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FiX, FiDollarSign, FiTag, FiFileText, FiUsers, FiUser } from 'react-icons/fi'
import { useData } from '../../context/DataContext'
import { useCouple } from '../../context/CoupleContext'
import { usePartner } from '../../context/PartnerContext'
import { useTheme, hexToRgba } from '../../context/ThemeContext'
import TurkishDatePicker from '../ui/TurkishDatePicker'
import toast from 'react-hot-toast'
import type { Expense, ExpenseCategory, ExpenseType } from '@/types'

const expenseCategories: { value: ExpenseCategory; label: string; icon: string }[] = [
  { value: 'yemek', label: 'Yemek', icon: '🍕' },
  { value: 'alisveris', label: 'Alışveriş', icon: '🛍️' },
  { value: 'ulasim', label: 'Ulaşım', icon: '🚗' },
  { value: 'eglence', label: 'Eğlence', icon: '🎬' },
  { value: 'saglik', label: 'Sağlık', icon: '💊' },
  { value: 'fatura', label: 'Fatura', icon: '📄' },
  { value: 'hediye', label: 'Hediye', icon: '🎁' },
  { value: 'egitim', label: 'Eğitim', icon: '📚' },
  { value: 'diger', label: 'Diğer', icon: '📦' },
]

interface AddExpenseModalProps {
  isOpen: boolean
  onClose: () => void
  editExpense?: Expense | null
}

export default function AddExpenseModal({ isOpen, onClose, editExpense }: AddExpenseModalProps) {
  const { addExpense, updateExpense } = useData()
  const { couple } = useCouple()
  const { isPaired } = usePartner()
  const { colors } = useTheme()

  const isEditing = !!editExpense

  const [title, setTitle] = useState('')
  const [amount, setAmount] = useState('')
  const [category, setCategory] = useState<ExpenseCategory>('diger')
  const [type, setType] = useState<ExpenseType>('personal')
  const [date, setDate] = useState(new Date().toISOString().split('T')[0])
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)

  // Düzenleme modunda formu doldur
  useEffect(() => {
    if (editExpense) {
      setTitle(editExpense.title)
      setAmount(String(editExpense.amount))
      setCategory(editExpense.category)
      setType(editExpense.type)
      setDate(new Date(editExpense.date).toISOString().split('T')[0])
      setNote(editExpense.note || '')
    } else {
      resetForm()
    }
  }, [editExpense])

  const resetForm = () => {
    setTitle('')
    setAmount('')
    setCategory('diger')
    setType('personal')
    setDate(new Date().toISOString().split('T')[0])
    setNote('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !amount || parseFloat(amount) <= 0) {
      toast.error('Başlık ve geçerli bir tutar giriniz!')
      return
    }

    setSubmitting(true)
    try {
      const data: Record<string, any> = {
        title: title.trim(),
        amount: parseFloat(amount),
        category,
        type,
        date: new Date(date).toISOString(),
      }
      if (note.trim()) data.note = note.trim()
      else data.note = ''

      if (isEditing && editExpense) {
        await updateExpense(editExpense.id, data)
        toast.success('Harcama güncellendi! ✏️')
      } else {
        await addExpense(data)
        toast.success('Harcama eklendi! 💸')
      }
      resetForm()
      onClose()
    } catch (err) {
      console.error(err)
      toast.error(isEditing ? 'Güncellenemedi' : 'Harcama eklenemedi')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: hexToRgba(colors.fg, 0.4), backdropFilter: 'blur(8px)' }}
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            transition={{ type: 'spring', damping: 25 }}
            onClick={e => e.stopPropagation()}
            className="w-full max-w-md rounded-2xl shadow-xl overflow-hidden max-h-[90vh] overflow-y-auto"
            style={{ background: colors.bg, border: `1px solid ${hexToRgba(colors.primary, 0.15)}` }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 pt-5 pb-3">
              <div>
                <h2 className="text-lg font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: colors.fg }}>
                  {isEditing ? 'Harcama Düzenle' : 'Yeni Harcama'}
                </h2>
                <p className="text-xs mt-0.5" style={{ color: colors.softLight }}>
                  {isEditing ? 'Harcama detaylarını güncelle' : 'Harcama detaylarını gir'}
                </p>
              </div>
              <motion.button
                whileTap={{ scale: 0.9 }}
                onClick={onClose}
                className="p-2 rounded-lg cursor-pointer"
                style={{ color: colors.softLight }}
              >
                <FiX size={18} />
              </motion.button>
            </div>

            <form onSubmit={handleSubmit} className="px-6 pb-6 space-y-4">
              {/* Başlık */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  <FiFileText size={12} /> Başlık
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  placeholder="Örn: Market alışverişi"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: hexToRgba(colors.card, 0.6),
                    border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
                    color: colors.fg,
                  }}
                />
              </div>

              {/* Tutar */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  <FiDollarSign size={12} /> Tutar (₺)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={e => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none"
                  style={{
                    background: hexToRgba(colors.card, 0.6),
                    border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
                    color: colors.fg,
                  }}
                />
              </div>

              {/* Kategori */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  <FiTag size={12} /> Kategori
                </label>
                <div className="grid grid-cols-4 gap-1.5">
                  {expenseCategories.map(cat => (
                    <motion.button
                      key={cat.value}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setCategory(cat.value)}
                      className="flex flex-col items-center gap-0.5 py-2 px-1 rounded-lg text-[11px] font-medium cursor-pointer transition-all"
                      style={{
                        background: category === cat.value ? hexToRgba(colors.primary, 0.15) : hexToRgba(colors.card, 0.4),
                        border: `1px solid ${category === cat.value ? hexToRgba(colors.primary, 0.3) : hexToRgba(colors.primary, 0.08)}`,
                        color: category === cat.value ? colors.fg : colors.softLight,
                      }}
                    >
                      <span className="text-base">{cat.icon}</span>
                      {cat.label}
                    </motion.button>
                  ))}
                </div>
              </div>

              {/* Tür: Kişisel / Ortak */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  <FiUsers size={12} /> Tür
                </label>
                <div className="flex gap-2">
                  <motion.button
                    type="button"
                    whileTap={{ scale: 0.95 }}
                    onClick={() => setType('personal')}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                    style={{
                      background: type === 'personal' ? hexToRgba(colors.primary, 0.15) : hexToRgba(colors.card, 0.4),
                      border: `1px solid ${type === 'personal' ? hexToRgba(colors.primary, 0.3) : hexToRgba(colors.primary, 0.08)}`,
                      color: type === 'personal' ? colors.fg : colors.softLight,
                    }}
                  >
                    <FiUser size={13} /> Kişisel
                  </motion.button>
                  {isPaired && (
                    <motion.button
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setType('shared')}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs font-medium cursor-pointer transition-all"
                      style={{
                      background: type === 'shared' ? hexToRgba(colors.secondary, 0.3) : hexToRgba(colors.card, 0.4),
                      border: `1px solid ${type === 'shared' ? hexToRgba(colors.secondary, 0.4) : hexToRgba(colors.primary, 0.08)}`,
                      color: type === 'shared' ? colors.fg : colors.softLight,
                      }}
                    >
                      <FiUsers size={13} /> Ortak
                    </motion.button>
                  )}
                </div>
              </div>

              {/* Tarih */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  Tarih
                </label>
                <TurkishDatePicker
                  value={date}
                  onChange={setDate}
                  compact
                />
              </div>

              {/* Not */}
              <div>
                <label className="text-xs font-medium mb-1.5 flex items-center gap-1.5" style={{ color: colors.mutedFg }}>
                  <FiFileText size={12} /> Not (opsiyonel)
                </label>
                <textarea
                  value={note}
                  onChange={e => setNote(e.target.value)}
                  placeholder="Ek bir not..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg text-sm outline-none resize-none"
                  style={{
                    background: hexToRgba(colors.card, 0.6),
                    border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
                    color: colors.fg,
                  }}
                />
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                disabled={submitting}
                className="w-full py-2.5 rounded-xl text-sm font-semibold cursor-pointer disabled:opacity-60"
                style={{
                  background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`,
                  color: colors.fg,
                }}
              >
                {submitting ? (isEditing ? 'Güncelleniyor...' : 'Ekleniyor...') : (isEditing ? 'Güncelle ✏️' : 'Harcama Ekle 💸')}
              </motion.button>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
