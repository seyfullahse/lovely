import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '../context/AuthContext'
import { useData } from '../context/DataContext'
import { useCouple } from '../context/CoupleContext'
import { usePartner } from '../context/PartnerContext'
import { useNavigate } from 'react-router-dom'
import { format, isSameMonth, parseISO, startOfMonth, endOfMonth } from 'date-fns'
import { tr } from 'date-fns/locale'
import {
  FiPlus, FiFilter, FiTrash2, FiEdit3, FiUser, FiUsers,
  FiChevronLeft, FiChevronRight, FiDollarSign, FiTrendingUp
} from 'react-icons/fi'
import AddExpenseModal from '../components/expenses/AddExpenseModal'
import toast from 'react-hot-toast'
import type { Expense, ExpenseCategory, ExpenseType } from '@/types'

// Kategori ayarları
const categoryConfig: Record<ExpenseCategory, { label: string; icon: string; color: string; bg: string }> = {
  yemek:     { label: 'Yemek',     icon: '🍕', color: '#E8808C', bg: 'rgba(232,128,140,0.1)' },
  alisveris: { label: 'Alışveriş', icon: '🛍️', color: '#B8A0DC', bg: 'rgba(184,160,220,0.1)' },
  ulasim:    { label: 'Ulaşım',    icon: '🚗', color: '#7BAFCB', bg: 'rgba(123,175,203,0.1)' },
  eglence:   { label: 'Eğlence',   icon: '🎬', color: '#D4A574', bg: 'rgba(212,165,116,0.1)' },
  saglik:    { label: 'Sağlık',    icon: '💊', color: '#7BC88C', bg: 'rgba(123,200,140,0.1)' },
  fatura:    { label: 'Fatura',    icon: '📄', color: '#9A949D', bg: 'rgba(154,148,157,0.1)' },
  hediye:    { label: 'Hediye',    icon: '🎁', color: '#E8A0C8', bg: 'rgba(232,160,200,0.1)' },
  egitim:    { label: 'Eğitim',    icon: '📚', color: '#7BAFCB', bg: 'rgba(123,175,203,0.1)' },
  diger:     { label: 'Diğer',     icon: '📦', color: '#B8A9BC', bg: 'rgba(184,169,188,0.1)' },
}

export default function ExpensesPage() {
  const { currentUser } = useAuth()
  const { expenses, deleteExpense, updateExpense } = useData()
  const { couple } = useCouple()
  const { isPaired } = usePartner()
  const navigate = useNavigate()

  const [modalOpen, setModalOpen] = useState(false)
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null)
  const [filterCategory, setFilterCategory] = useState<ExpenseCategory | 'all'>('all')
  const [filterType, setFilterType] = useState<ExpenseType | 'all'>('all')
  const [filterPerson, setFilterPerson] = useState<'all' | 'mine' | 'partner'>('all')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [showFilters, setShowFilters] = useState(false)

  // Giriş yapılmamışsa
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
          <p className="text-sm mb-6" style={{ color: '#9A949D' }}>Harcamaları görmek için giriş yap.</p>
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

  // Ay filtresi
  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)

  // Filtrelenmiş harcamalar
  const filteredExpenses = useMemo(() => {
    return expenses.filter(exp => {
      const expDate = parseISO(exp.date)
      // Ay filtresi
      if (!isSameMonth(expDate, currentMonth)) return false
      // Kategori filtresi
      if (filterCategory !== 'all' && exp.category !== filterCategory) return false
      // Tür filtresi
      if (filterType !== 'all' && exp.type !== filterType) return false
      // Kişi filtresi
      if (filterPerson === 'mine' && exp.createdBy !== currentUser.uid) return false
      if (filterPerson === 'partner' && exp.createdBy === currentUser.uid) return false
      return true
    })
  }, [expenses, currentMonth, filterCategory, filterType, filterPerson, currentUser.uid])

  // İstatistikler
  const stats = useMemo(() => {
    const monthExpenses = expenses.filter(exp => isSameMonth(parseISO(exp.date), currentMonth))
    const totalMonth = monthExpenses.reduce((sum, e) => sum + e.amount, 0)
    const myTotal = monthExpenses.filter(e => e.createdBy === currentUser.uid).reduce((sum, e) => sum + e.amount, 0)
    const partnerTotal = monthExpenses.filter(e => e.createdBy !== currentUser.uid).reduce((sum, e) => sum + e.amount, 0)
    const sharedTotal = monthExpenses.filter(e => e.type === 'shared').reduce((sum, e) => sum + e.amount, 0)
    const personalTotal = monthExpenses.filter(e => e.type === 'personal').reduce((sum, e) => sum + e.amount, 0)

    // Kategori bazlı dağılım
    const byCategory = Object.keys(categoryConfig).map(cat => {
      const catExpenses = monthExpenses.filter(e => e.category === cat)
      const total = catExpenses.reduce((sum, e) => sum + e.amount, 0)
      return { category: cat as ExpenseCategory, total, count: catExpenses.length }
    }).filter(c => c.total > 0).sort((a, b) => b.total - a.total)

    return { totalMonth, myTotal, partnerTotal, sharedTotal, personalTotal, byCategory, count: monthExpenses.length }
  }, [expenses, currentMonth, currentUser.uid])

  const handleDelete = async (expenseId: string) => {
    if (!confirm('Bu harcamayı silmek istediğinden emin misin?')) return
    try {
      await deleteExpense(expenseId)
      toast.success('Harcama silindi')
    } catch {
      toast.error('Silinemedi')
    }
  }

  const handleEdit = (expense: Expense) => {
    setEditingExpense(expense)
    setModalOpen(true)
  }

  const prevMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  const nextMonth = () => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))

  return (
    <div className="min-h-screen pt-20 pb-10 px-4 sm:px-6">
      <div className="max-w-3xl mx-auto space-y-6">

        {/* Başlık */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between"
        >
          <div>
            <h1 className="text-2xl font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}>
              💸 Harcamalar
            </h1>
            <p className="text-xs mt-1" style={{ color: '#B8A9BC' }}>
              Bireysel ve ortak harcamalarınızı takip edin
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => { setEditingExpense(null); setModalOpen(true) }}
            className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer"
            style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
          >
            <FiPlus size={14} /> Harcama Ekle
          </motion.button>
        </motion.div>

        {/* Ay Navigasyonu */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
          className="flex items-center justify-center gap-4"
        >
          <motion.button whileTap={{ scale: 0.9 }} onClick={prevMonth} className="p-2 rounded-lg cursor-pointer" style={{ color: '#B8A9BC' }}>
            <FiChevronLeft size={18} />
          </motion.button>
          <span className="text-sm font-semibold min-w-[140px] text-center" style={{ color: '#3D2C3E', fontFamily: "'Playfair Display', serif" }}>
            {format(currentMonth, 'MMMM yyyy', { locale: tr })}
          </span>
          <motion.button whileTap={{ scale: 0.9 }} onClick={nextMonth} className="p-2 rounded-lg cursor-pointer" style={{ color: '#B8A9BC' }}>
            <FiChevronRight size={18} />
          </motion.button>
        </motion.div>

        {/* Özet Kartları */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-2 sm:grid-cols-4 gap-3"
        >
          {/* Toplam */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <FiDollarSign size={12} style={{ color: '#B8A0DC' }} />
              <span className="text-[10px] font-medium" style={{ color: '#B8A9BC' }}>Toplam</span>
            </div>
            <p className="text-lg font-bold" style={{ color: '#3D2C3E' }}>
              ₺{stats.totalMonth.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-[10px]" style={{ color: '#B8A9BC' }}>{stats.count} harcama</p>
          </div>

          {/* Benim */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <FiUser size={12} style={{ color: '#B8A0DC' }} />
              <span className="text-[10px] font-medium" style={{ color: '#B8A9BC' }}>Benim</span>
            </div>
            <p className="text-lg font-bold" style={{ color: '#3D2C3E' }}>
              ₺{stats.myTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>

          {/* Eş */}
          {isPaired && (
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}>
              <div className="flex items-center gap-1.5 mb-1">
                <FiUser size={12} style={{ color: '#E8808C' }} />
                <span className="text-[10px] font-medium" style={{ color: '#B8A9BC' }}>Eş</span>
              </div>
              <p className="text-lg font-bold" style={{ color: '#3D2C3E' }}>
                ₺{stats.partnerTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
              </p>
            </div>
          )}

          {/* Ortak */}
          <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}>
            <div className="flex items-center gap-1.5 mb-1">
              <FiUsers size={12} style={{ color: '#FADADD' }} />
              <span className="text-[10px] font-medium" style={{ color: '#B8A9BC' }}>Ortak</span>
            </div>
            <p className="text-lg font-bold" style={{ color: '#3D2C3E' }}>
              ₺{stats.sharedTotal.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </motion.div>

        {/* Kategori Dağılımı */}
        {stats.byCategory.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="rounded-xl p-4"
            style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.1)' }}
          >
            <div className="flex items-center gap-1.5 mb-3">
              <FiTrendingUp size={13} style={{ color: '#B8A0DC' }} />
              <span className="text-xs font-semibold" style={{ color: '#3D2C3E' }}>Kategori Dağılımı</span>
            </div>
            <div className="space-y-2">
              {stats.byCategory.map(item => {
                const cfg = categoryConfig[item.category]
                const pct = stats.totalMonth > 0 ? (item.total / stats.totalMonth) * 100 : 0
                return (
                  <div key={item.category} className="flex items-center gap-2">
                    <span className="text-sm w-6 text-center">{cfg.icon}</span>
                    <span className="text-xs font-medium w-16" style={{ color: '#3D2C3E' }}>{cfg.label}</span>
                    <div className="flex-1 h-2 rounded-full overflow-hidden" style={{ background: 'rgba(184,160,220,0.1)' }}>
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ delay: 0.2, duration: 0.6 }}
                        className="h-full rounded-full"
                        style={{ background: cfg.color }}
                      />
                    </div>
                    <span className="text-[11px] font-semibold w-20 text-right" style={{ color: '#3D2C3E' }}>
                      ₺{item.total.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </span>
                    <span className="text-[10px] w-10 text-right" style={{ color: '#B8A9BC' }}>
                      %{pct.toFixed(0)}
                    </span>
                  </div>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* Filtreler */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-1.5 text-xs font-medium cursor-pointer mb-2"
            style={{ color: '#B8A9BC' }}
          >
            <FiFilter size={12} /> Filtreler {showFilters ? '▴' : '▾'}
          </button>

          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="flex flex-wrap gap-2 mb-3">
                  {/* Kategori filtresi */}
                  <select
                    value={filterCategory}
                    onChange={e => setFilterCategory(e.target.value as ExpenseCategory | 'all')}
                    className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.15)', color: '#3D2C3E' }}
                  >
                    <option value="all">Tüm Kategoriler</option>
                    {Object.entries(categoryConfig).map(([key, val]) => (
                      <option key={key} value={key}>{val.icon} {val.label}</option>
                    ))}
                  </select>

                  {/* Tür filtresi */}
                  <select
                    value={filterType}
                    onChange={e => setFilterType(e.target.value as ExpenseType | 'all')}
                    className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.15)', color: '#3D2C3E' }}
                  >
                    <option value="all">Kişisel + Ortak</option>
                    <option value="personal">Kişisel</option>
                    <option value="shared">Ortak</option>
                  </select>

                  {/* Kişi filtresi */}
                  {isPaired && (
                    <select
                      value={filterPerson}
                      onChange={e => setFilterPerson(e.target.value as 'all' | 'mine' | 'partner')}
                      className="px-3 py-1.5 rounded-lg text-xs outline-none cursor-pointer"
                      style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.15)', color: '#3D2C3E' }}
                    >
                      <option value="all">Herkes</option>
                      <option value="mine">Benim</option>
                      <option value="partner">Eşim</option>
                    </select>
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>

        {/* Harcama Listesi */}
        <div className="space-y-2">
          {filteredExpenses.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-12 rounded-xl"
              style={{ background: 'rgba(255,255,255,0.4)', border: '1px dashed rgba(184,160,220,0.2)' }}
            >
              <p className="text-3xl mb-2">💸</p>
              <p className="text-sm font-medium" style={{ color: '#3D2C3E' }}>Henüz harcama yok</p>
              <p className="text-xs mt-1" style={{ color: '#B8A9BC' }}>
                İlk harcamanı ekleyerek başla
              </p>
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => { setEditingExpense(null); setModalOpen(true) }}
                className="mt-4 px-5 py-2 rounded-xl text-xs font-semibold cursor-pointer"
                style={{ background: 'linear-gradient(135deg, #FADADD, #E8DFF5)', color: '#3D2C3E' }}
              >
                <FiPlus size={12} className="inline mr-1" /> Harcama Ekle
              </motion.button>
            </motion.div>
          ) : (
            <AnimatePresence>
              {filteredExpenses.map((expense, index) => {
                const cfg = categoryConfig[expense.category] || categoryConfig.diger
                const isOwn = expense.createdBy === currentUser.uid
                const expDate = parseISO(expense.date)

                return (
                  <motion.div
                    key={expense.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -50 }}
                    transition={{ delay: index * 0.03 }}
                    className="group rounded-xl p-3 flex items-center gap-3"
                    style={{ background: 'rgba(255,255,255,0.6)', border: '1px solid rgba(184,160,220,0.08)' }}
                  >
                    {/* Kategori ikonu */}
                    <div
                      className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
                      style={{ background: cfg.bg }}
                    >
                      {cfg.icon}
                    </div>

                    {/* Detay */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-medium truncate" style={{ color: '#3D2C3E' }}>
                          {expense.title}
                        </span>
                        {expense.type === 'shared' && (
                          <span
                            className="text-[9px] px-1.5 py-0.5 rounded-full font-medium flex-shrink-0"
                            style={{ background: 'rgba(250,218,221,0.3)', color: '#E8808C' }}
                          >
                            Ortak
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-[10px]" style={{ color: '#B8A9BC' }}>
                          {format(expDate, 'd MMM yyyy', { locale: tr })}
                        </span>
                        <span className="text-[10px]" style={{ color: '#B8A9BC' }}>·</span>
                        <span className="text-[10px]" style={{ color: cfg.color }}>{cfg.label}</span>
                        <span className="text-[10px]" style={{ color: '#B8A9BC' }}>·</span>
                        <span className="text-[10px]" style={{ color: '#B8A9BC' }}>
                          {expense.createdByName}
                        </span>
                      </div>
                      {expense.note && (
                        <p className="text-[10px] mt-0.5 truncate" style={{ color: '#9A949D' }}>{expense.note}</p>
                      )}
                    </div>

                    {/* Tutar */}
                    <div className="text-right flex-shrink-0">
                      <p className="text-sm font-bold" style={{ color: '#3D2C3E' }}>
                        ₺{expense.amount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>

                    {/* Düzenle & Sil butonları — sadece kendi harcamasını */}
                    {isOwn && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleEdit(expense)}
                          className="p-1.5 rounded-md cursor-pointer"
                          style={{ color: '#B8A0DC' }}
                          title="Düzenle"
                        >
                          <FiEdit3 size={13} />
                        </motion.button>
                        <motion.button
                          whileTap={{ scale: 0.9 }}
                          onClick={() => handleDelete(expense.id)}
                          className="p-1.5 rounded-md cursor-pointer"
                          style={{ color: '#E8808C' }}
                          title="Sil"
                        >
                          <FiTrash2 size={13} />
                        </motion.button>
                      </div>
                    )}
                  </motion.div>
                )
              })}
            </AnimatePresence>
          )}
        </div>
      </div>

      {/* Modal */}
      <AddExpenseModal
        isOpen={modalOpen}
        onClose={() => { setModalOpen(false); setEditingExpense(null) }}
        editExpense={editingExpense}
      />
    </div>
  )
}
