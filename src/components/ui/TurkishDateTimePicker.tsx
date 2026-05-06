import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
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
import { FiCalendar, FiClock, FiChevronLeft, FiChevronRight, FiChevronUp, FiChevronDown } from 'react-icons/fi'
import { useTheme, hexToRgba } from '@/context/ThemeContext'
import { AnimatePresence, motion } from 'framer-motion'

interface TurkishDateTimePickerProps {
  value: string          // "YYYY-MM-DDTHH:mm" formatı
  onChange: (value: string) => void
  required?: boolean
}

const DAY_NAMES = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz']

/**
 * Tamamen Türkçe tarih ve saat seçici.
 * Native input kullanmaz, kendi takvim ve saat dropdown'unu açar.
 */
export default function TurkishDateTimePicker({ value, onChange, required }: TurkishDateTimePickerProps) {
  const [dateVal, setDateVal] = useState('')
  const [timeVal, setTimeVal] = useState('10:00')
  const [calOpen, setCalOpen] = useState(false)
  const [timeOpen, setTimeOpen] = useState(false)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const calRef = useRef<HTMLDivElement>(null)
  const timeRef = useRef<HTMLDivElement>(null)
  const { colors } = useTheme()

  // value prop'undan date ve time değerlerini ayır
  useEffect(() => {
    if (value) {
      const [d, t] = value.split('T')
      setDateVal(d || '')
      setTimeVal(t || '10:00')
    }
  }, [value])

  // Seçili tarih
  const selectedDate = useMemo(() => {
    if (!dateVal) return null
    const d = new Date(`${dateVal}T${timeVal || '10:00'}`)
    return isNaN(d.getTime()) ? null : d
  }, [dateVal, timeVal])

  // Türkçe formatlı tarih
  const formattedDate = useMemo(() => {
    if (!selectedDate) return null
    return format(selectedDate, "d MMMM yyyy, EEEE", { locale: tr })
  }, [selectedDate])

  // Saat parçaları
  const [hour, minute] = useMemo(() => {
    const parts = (timeVal || '10:00').split(':')
    return [parseInt(parts[0]) || 10, parseInt(parts[1]) || 0]
  }, [timeVal])

  // Takvim günleri
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
      if (calRef.current && !calRef.current.contains(e.target as Node)) setCalOpen(false)
      if (timeRef.current && !timeRef.current.contains(e.target as Node)) setTimeOpen(false)
    }
    if (calOpen || timeOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [calOpen, timeOpen])

  const emitChange = useCallback((d: string, t: string) => {
    if (d) onChange(`${d}T${t}`)
  }, [onChange])

  const handleDayClick = useCallback((day: Date) => {
    const newDate = format(day, 'yyyy-MM-dd')
    setDateVal(newDate)
    emitChange(newDate, timeVal)
    setCalOpen(false)
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

  const toggleCal = () => {
    if (!calOpen && selectedDate) setCurrentMonth(selectedDate)
    setCalOpen(!calOpen)
    setTimeOpen(false)
  }

  const toggleTime = () => {
    setTimeOpen(!timeOpen)
    setCalOpen(false)
  }

  return (
    <div className="space-y-2.5">
      {/* Tarih & Saat satırı */}
      <div className="flex gap-3">
        {/* Tarih */}
        <div className="relative flex-1" ref={calRef}>
          <button
            type="button"
            onClick={toggleCal}
            className="flex w-full items-center gap-2 rounded-2xl px-4 py-3.5 text-[15px] outline-none transition-all duration-200 text-left relative pl-10 cursor-pointer"
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
          {required && <input type="text" value={dateVal || ''} required onChange={() => {}} className="absolute inset-0 opacity-0 pointer-events-none" tabIndex={-1} />}

          {/* Takvim dropdown */}
          <AnimatePresence>
            {calOpen && (
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
                  <button type="button" onClick={() => setCurrentMonth(p => subMonths(p, 1))}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer"
                    style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                    <FiChevronLeft size={16} />
                  </button>
                  <span className="text-sm font-semibold capitalize" style={{ color: colors.fg }}>
                    {format(currentMonth, 'MMMM yyyy', { locale: tr })}
                  </span>
                  <button type="button" onClick={() => setCurrentMonth(p => addMonths(p, 1))}
                    className="p-1.5 rounded-lg transition-all hover:scale-110 cursor-pointer"
                    style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                    <FiChevronRight size={16} />
                  </button>
                </div>

                {/* Gün başlıkları */}
                <div className="grid grid-cols-7 px-2 pb-1">
                  {DAY_NAMES.map(d => (
                    <div key={d} className="text-center text-[11px] font-medium py-1" style={{ color: colors.mutedFg }}>{d}</div>
                  ))}
                </div>

                {/* Gün grid'i */}
                <div className="grid grid-cols-7 px-2 pb-2.5 gap-0.5">
                  {calendarDays.map((day, i) => {
                    const inMonth = isSameMonth(day, currentMonth)
                    const isSelected = selectedDate ? isSameDay(day, selectedDate) : false
                    const todayFlag = isToday(day)
                    return (
                      <button key={i} type="button" onClick={() => handleDayClick(day)}
                        className="relative w-full aspect-square flex items-center justify-center rounded-lg text-[13px] transition-all cursor-pointer hover:scale-105"
                        style={{
                          color: isSelected ? '#fff' : inMonth ? colors.fg : hexToRgba(colors.mutedFg, 0.4),
                          background: isSelected ? colors.primary : todayFlag ? hexToRgba(colors.primary, 0.1) : 'transparent',
                          fontWeight: isSelected || todayFlag ? 600 : 400,
                        }}>
                        {format(day, 'd')}
                        {todayFlag && !isSelected && (
                          <span className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full" style={{ background: colors.primary }} />
                        )}
                      </button>
                    )
                  })}
                </div>

                <div className="px-2 pb-2.5">
                  <button type="button"
                    onClick={() => { const t = new Date(); setCurrentMonth(t); handleDayClick(t) }}
                    className="w-full py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:scale-[1.01]"
                    style={{ background: hexToRgba(colors.primary, 0.08), color: colors.primary }}>
                    Bugün
                  </button>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Saat */}
        <div className="relative w-[120px] shrink-0" ref={timeRef}>
          <button
            type="button"
            onClick={toggleTime}
            className="flex w-full items-center gap-2 rounded-2xl px-4 py-3.5 text-[15px] outline-none transition-all duration-200 text-left relative pl-10 cursor-pointer"
            style={{
              background: hexToRgba(colors.card, 0.5),
              border: `1.5px solid ${hexToRgba(colors.primary, 0.15)}`,
              color: timeVal ? colors.fg : colors.mutedFg,
            }}
          >
            <span className="absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: colors.primary }}>
              <FiClock size={15} />
            </span>
            {timeVal || '10:00'}
          </button>

          {/* Saat dropdown */}
          <AnimatePresence>
            {timeOpen && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -8, scale: 0.97 }}
                transition={{ duration: 0.18 }}
                className="absolute right-0 z-50 mt-1.5 rounded-xl shadow-xl overflow-hidden p-4"
                style={{
                  background: colors.card,
                  border: `1px solid ${hexToRgba(colors.primary, 0.15)}`,
                  minWidth: '140px',
                }}
              >
                <p className="text-[11px] font-medium mb-3 text-center" style={{ color: colors.mutedFg }}>Saat Seçin</p>
                <div className="flex items-center justify-center gap-3">
                  {/* Saat */}
                  <div className="flex flex-col items-center gap-1">
                    <button type="button" onClick={() => adjustHour(1)}
                      className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                      style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                      <FiChevronUp size={16} />
                    </button>
                    <span className="text-xl font-semibold w-8 text-center" style={{ color: colors.fg }}>
                      {String(hour).padStart(2, '0')}
                    </span>
                    <button type="button" onClick={() => adjustHour(-1)}
                      className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                      style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                      <FiChevronDown size={16} />
                    </button>
                  </div>

                  <span className="text-xl font-bold" style={{ color: colors.mutedFg }}>:</span>

                  {/* Dakika */}
                  <div className="flex flex-col items-center gap-1">
                    <button type="button" onClick={() => adjustMinute(5)}
                      className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                      style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                      <FiChevronUp size={16} />
                    </button>
                    <span className="text-xl font-semibold w-8 text-center" style={{ color: colors.fg }}>
                      {String(minute).padStart(2, '0')}
                    </span>
                    <button type="button" onClick={() => adjustMinute(-5)}
                      className="p-1 rounded-md transition-all hover:scale-110 cursor-pointer"
                      style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.08) }}>
                      <FiChevronDown size={16} />
                    </button>
                  </div>
                </div>

                {/* Tamam butonu */}
                <button type="button" onClick={() => setTimeOpen(false)}
                  className="w-full mt-3 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer hover:scale-[1.01]"
                  style={{ background: hexToRgba(colors.primary, 0.08), color: colors.primary }}>
                  Tamam
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Türkçe önizleme */}
      {formattedDate && (
        <div
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-[13px] font-medium"
          style={{
            background: hexToRgba(colors.primary, 0.08),
            color: colors.mutedFg,
            border: `1px solid ${hexToRgba(colors.primary, 0.12)}`
          }}
        >
          <span style={{ color: colors.primary }}>📅</span>
          {formattedDate} · {timeVal || '10:00'}
        </div>
      )}
    </div>
  )
}
