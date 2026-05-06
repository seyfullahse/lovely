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
import { FiCalendar, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { useTheme, hexToRgba } from '@/context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'

interface InlineDateTimePickerProps {
  value: string          // "YYYY-MM-DDTHH:mm" formatı
  onChange: (value: string) => void
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

/**
 * Kompakt Türkçe tarih-saat seçici.
 * EventDetailModal gibi dar alanlarda inline kullanım için.
 */
export default function InlineDateTimePicker({ value, onChange }: InlineDateTimePickerProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [dateVal, setDateVal] = useState('')
  const [timeVal, setTimeVal] = useState('10:00')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const containerRef = useRef<HTMLDivElement>(null)
  const { colors } = useTheme()

  // value parse
  useEffect(() => {
    if (value) {
      const [d, t] = value.split('T')
      setDateVal(d || '')
      setTimeVal(t || '10:00')
      if (d) {
        const parsed = new Date(d + 'T00:00:00')
        if (!isNaN(parsed.getTime())) setCurrentMonth(parsed)
      }
    }
  }, [value])

  const selectedDate = useMemo(() => {
    if (!dateVal) return null
    const d = new Date(dateVal + 'T00:00:00')
    return isNaN(d.getTime()) ? null : d
  }, [dateVal])

  const formattedDisplay = useMemo(() => {
    if (!selectedDate) return null
    return format(selectedDate, 'd MMMM yyyy', { locale: tr }) + ', ' + (timeVal || '10:00')
  }, [selectedDate, timeVal])

  const [hour, minute] = useMemo(() => {
    const parts = (timeVal || '10:00').split(':')
    return [parseInt(parts[0]) || 10, parseInt(parts[1]) || 0]
  }, [timeVal])

  const calendarDays = useMemo(() => {
    const monthStart = startOfMonth(currentMonth)
    const monthEnd = endOfMonth(currentMonth)
    const calStart = startOfWeek(monthStart, { weekStartsOn: 1 })
    const calEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })
    return eachDayOfInterval({ start: calStart, end: calEnd })
  }, [currentMonth])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setIsOpen(false)
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const emitChange = useCallback((d: string, t: string) => {
    if (d) onChange(`${d}T${t}`)
  }, [onChange])

  const handleDayClick = useCallback((day: Date) => {
    const newDate = format(day, 'yyyy-MM-dd')
    setDateVal(newDate)
    emitChange(newDate, timeVal)
  }, [timeVal, emitChange])

  const adjustHour = (delta: number) => {
    const h = ((hour + delta) % 24 + 24) % 24
    const newTime = `${String(h).padStart(2, '0')}:${String(minute).padStart(2, '0')}`
    setTimeVal(newTime)
    emitChange(dateVal, newTime)
  }

  const adjustMinute = (delta: number) => {
    const m = ((minute + delta) % 60 + 60) % 60
    const newTime = `${String(hour).padStart(2, '0')}:${String(m).padStart(2, '0')}`
    setTimeVal(newTime)
    emitChange(dateVal, newTime)
  }

  return (
    <div className="relative" ref={containerRef}>
      <button
        type="button"
        onClick={() => {
          if (!isOpen && selectedDate) setCurrentMonth(selectedDate)
          setIsOpen(!isOpen)
        }}
        className="w-full rounded-xl px-3 py-2 text-sm text-left outline-none transition-all cursor-pointer"
        style={{
          background: hexToRgba(colors.card, 0.6),
          border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
          color: formattedDisplay ? colors.fg : colors.mutedFg,
        }}
      >
        {formattedDisplay || 'Tarih seçin'}
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.97 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.97 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 z-[60] mt-1 rounded-xl shadow-xl overflow-hidden"
            style={{
              background: colors.card,
              border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
              minWidth: '280px',
            }}
          >
            {/* Ay navigasyonu */}
            <div className="flex items-center justify-between px-3 py-2">
              <button type="button" onClick={() => setCurrentMonth(p => subMonths(p, 1))}
                className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                <FiChevronLeft size={14} />
              </button>
              <span className="text-xs font-semibold capitalize" style={{ color: colors.fg }}>
                {format(currentMonth, 'MMMM yyyy', { locale: tr })}
              </span>
              <button type="button" onClick={() => setCurrentMonth(p => addMonths(p, 1))}
                className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                <FiChevronRight size={14} />
              </button>
            </div>

            {/* Gün başlıkları */}
            <div className="grid grid-cols-7 px-2">
              {DAY_NAMES.map(d => (
                <div key={d} className="text-center text-[10px] font-medium py-0.5" style={{ color: colors.mutedFg }}>{d}</div>
              ))}
            </div>

            {/* Gün grid */}
            <div className="grid grid-cols-7 px-2 pb-2 gap-0.5">
              {calendarDays.map((day, i) => {
                const inMonth = isSameMonth(day, currentMonth)
                const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                const todayFlag = isToday(day)
                return (
                  <button key={i} type="button" onClick={() => handleDayClick(day)}
                    className="relative w-full aspect-square flex items-center justify-center rounded-md text-[12px] transition-all cursor-pointer hover:scale-105"
                    style={{
                      color: isSelected ? '#fff' : inMonth ? colors.fg : hexToRgba(colors.mutedFg, 0.35),
                      background: isSelected ? colors.primary : todayFlag ? hexToRgba(colors.primary, 0.1) : 'transparent',
                      fontWeight: isSelected || todayFlag ? 600 : 400,
                    }}>
                    {format(day, 'd')}
                    {todayFlag && !isSelected && (
                      <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-0.5 h-0.5 rounded-full" style={{ background: colors.primary }} />
                    )}
                  </button>
                )
              })}
            </div>

            {/* Saat seçici */}
            <div className="border-t px-3 py-2.5 flex items-center justify-between" style={{ borderColor: hexToRgba(colors.primary, 0.1) }}>
              <span className="text-[11px] font-medium" style={{ color: colors.mutedFg }}>Saat</span>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => adjustHour(-1)} className="p-0.5 rounded cursor-pointer" style={{ color: colors.primary }}>
                    <FiChevronDown size={13} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center" style={{ color: colors.fg }}>
                    {String(hour).padStart(2, '0')}
                  </span>
                  <button type="button" onClick={() => adjustHour(1)} className="p-0.5 rounded cursor-pointer" style={{ color: colors.primary }}>
                    <FiChevronUp size={13} />
                  </button>
                </div>
                <span className="text-sm font-bold" style={{ color: colors.mutedFg }}>:</span>
                <div className="flex items-center gap-0.5">
                  <button type="button" onClick={() => adjustMinute(-5)} className="p-0.5 rounded cursor-pointer" style={{ color: colors.primary }}>
                    <FiChevronDown size={13} />
                  </button>
                  <span className="text-sm font-semibold w-6 text-center" style={{ color: colors.fg }}>
                    {String(minute).padStart(2, '0')}
                  </span>
                  <button type="button" onClick={() => adjustMinute(5)} className="p-0.5 rounded cursor-pointer" style={{ color: colors.primary }}>
                    <FiChevronUp size={13} />
                  </button>
                </div>
              </div>
            </div>

            {/* Tamam */}
            <div className="px-2 pb-2">
              <button type="button" onClick={() => setIsOpen(false)}
                className="w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer"
                style={{ background: hexToRgba(colors.primary, 0.08), color: colors.primary }}>
                Tamam
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
