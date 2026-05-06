import { useState, useRef, useEffect, useMemo, useCallback } from 'react'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  eachDayOfInterval,
  addMonths,
  subMonths,
  isSameMonth,
  isSameDay,
  isToday,
} from 'date-fns'
import { tr } from 'date-fns/locale'
import { FiCalendar, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import { useTheme, hexToRgba } from '@/context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'

interface TurkishDatePickerProps {
  value: string          // "YYYY-MM-DD" formatı
  onChange: (value: string) => void
  required?: boolean
  className?: string
  /** Kompakt mod — modal içi gibi dar alanlar için */
  compact?: boolean
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

/**
 * Tamamen Türkçe özel takvim bileşeni.
 * Native date input kullanmaz, kendi dropdown takvimini açar.
 */
export default function TurkishDatePicker({ value, onChange, required, className, compact }: TurkishDatePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00')
      return isNaN(d.getTime()) ? new Date() : d
    }
    return new Date()
  })
  const containerRef = useRef<HTMLDivElement>(null)
  const { colors } = useTheme()

  // Seçili tarihi parse et
  const selectedDate = useMemo(() => {
    if (!value) return null
    const d = new Date(value + 'T00:00:00')
    return isNaN(d.getTime()) ? null : d
  }, [value])

  // Türkçe formatlı tarih
  const formattedDate = useMemo(() => {
    if (!selectedDate) return null
    return format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })
  }, [selectedDate])

  // Takvim günlerini hesapla
  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  // Dışarı tıklayınca kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleDayClick = useCallback((day: Date) => {
    const dateStr = format(day, 'yyyy-MM-dd')
    onChange(dateStr)
    setIsOpen(false)
  }, [onChange])

  const toggleOpen = () => {
    if (!isOpen && selectedDate) setCurrentMonth(selectedDate)
    setIsOpen(!isOpen)
  }

  const CalendarDropdown = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0, y: -8, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -8, scale: 0.97 }}
          transition={{ duration: 0.18 }}
          className="absolute left-0 right-0 z-50 mt-1.5 rounded-xl shadow-xl overflow-hidden"
          style={{
            background: colors.card,
            border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
          }}
        >
          {/* Ay navigasyonu */}
          <div className="flex items-center justify-between px-3 py-2.5">
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => subMonths(prev, 1))}
              className="p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer"
              style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}
            >
              <FiChevronLeft size={16} />
            </button>
            <span className="text-sm font-semibold capitalize" style={{ color: colors.fg }}>
              {format(currentMonth, 'MMMM yyyy', { locale: tr })}
            </span>
            <button
              type="button"
              onClick={() => setCurrentMonth(prev => addMonths(prev, 1))}
              className="p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer"
              style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}
            >
              <FiChevronRight size={16} />
            </button>
          </div>

          {/* Gün başlıkları */}
          <div className="grid grid-cols-7 px-2 pb-1">
            {DAY_NAMES.map(d => (
              <div key={d} className="text-center text-[11px] font-medium py-1" style={{ color: colors.mutedFg }}>
                {d}
              </div>
            ))}
          </div>

          {/* Gün grid'i */}
          <div className="grid grid-cols-7 px-2 pb-2.5 gap-0.5">
            {calendarDays.map((day, i) => {
              const inMonth = isSameMonth(day, currentMonth)
              const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
              const todayFlag = isToday(day)

              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleDayClick(day)}
                  className="relative w-full aspect-square flex items-center justify-center rounded-lg text-[13px] transition-all cursor-pointer hover:scale-105"
                  style={{
                    color: isSelected ? '#fff' : inMonth ? colors.fg : hexToRgba(colors.mutedFg, 0.4),
                    background: isSelected ? colors.primary : todayFlag ? hexToRgba(colors.primary, 0.1) : 'transparent',
                    fontWeight: isSelected || todayFlag ? 600 : 400,
                  }}
                >
                  {format(day, 'd')}
                  {todayFlag && !isSelected && (
                    <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: colors.primary }} />
                  )}
                </button>
              )
            })}
          </div>

          {/* Bugün butonu */}
          <div className="px-2 pb-2.5">
            <button
              type="button"
              onClick={() => { const t = new Date(); setCurrentMonth(t); handleDayClick(t) }}
              className="w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:scale-[1.01]"
              style={{ background: hexToRgba(colors.primary, 0.08), color: colors.primary }}
            >
              Bugün
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )

  if (compact) {
    return (
      <div className="relative" ref={containerRef}>
        <button
          type="button"
          onClick={toggleOpen}
          className={`w-full flex items-center gap-2 pl-9 pr-3 py-2 rounded-lg text-sm outline-none transition-all duration-200 text-left relative cursor-pointer ${className || ''}`}
          style={{
            background: hexToRgba(colors.card, 0.6),
            border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
            color: formattedDate ? colors.fg : colors.mutedFg,
          }}
        >
          <span className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.primary }}>
            <FiCalendar size={13} />
          </span>
          {formattedDate || 'Tarih seçin'}
        </button>
        {required && <input type="text" value={value || ''} required onChange={() => {}} className="absolute inset-0 opacity-0 pointer-events-none" tabIndex={-1} />}
        {CalendarDropdown}
      </div>
    )
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={toggleOpen}
        className={`flex w-full items-center gap-3 rounded-2xl pl-11 pr-5 py-4 text-[15px] outline-none transition-all duration-200 text-left relative cursor-pointer ${className || ''}`}
        style={{
          background: hexToRgba(colors.card, 0.5),
          border: `1.5px solid ${hexToRgba(colors.primary, 0.15)}`,
          color: formattedDate ? colors.fg : colors.mutedFg,
        }}
      >
        <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.primary }}>
          <FiCalendar size={15} />
        </span>
        {formattedDate || 'Tarih seçin'}
      </button>
      {required && <input type="text" value={value || ''} required onChange={() => {}} className="absolute inset-0 opacity-0 pointer-events-none" tabIndex={-1} />}
      {CalendarDropdown}
    </div>
  )
}
