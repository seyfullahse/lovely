// Planora – Günlük Ruh Hali Sayfası (Bezelye tarzı günlük mood tracker)
// Her iki partner de günün nasıl geçtiğini seçer ve not bırakır
import { useState, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useData } from '../context/DataContext'
import { useAuth } from '../context/AuthContext'
import { usePartner } from '../context/PartnerContext'
import { useTheme, hexToRgba } from '../context/ThemeContext'
import { format, parseISO, isToday, differenceInCalendarDays, startOfDay, subDays } from 'date-fns'
import { tr } from 'date-fns/locale'
import { FiEdit3, FiChevronDown, FiChevronUp, FiAward, FiTrendingUp, FiTrendingDown, FiFilter } from 'react-icons/fi'
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ReferenceLine } from 'recharts'
import toast from 'react-hot-toast'
import type { MoodLevel, DailyMood } from '@/types'

// ═══════ Ruh hali seviyeleri ═══════
const MOOD_CONFIG: Record<MoodLevel, { emoji: string; label: string; color: string; bg: string }> = {
  1: { emoji: '😢', label: 'Çok Kötü', color: '#E8808C', bg: 'rgba(232,128,140,0.15)' },
  2: { emoji: '😔', label: 'Kötü', color: '#E8A87C', bg: 'rgba(232,168,124,0.15)' },
  3: { emoji: '😐', label: 'Normal', color: '#D4C878', bg: 'rgba(212,200,120,0.15)' },
  4: { emoji: '😊', label: 'Güzel', color: '#85C88A', bg: 'rgba(133,200,138,0.15)' },
  5: { emoji: '🥰', label: 'Çok Güzel', color: '#B8A0DC', bg: 'rgba(184,160,220,0.15)' },
}

// Bugünün tarihini YYYY-MM-DD olarak al
function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd')
}

// Giriş serisini (streak) hesapla
function calculateStreak(moods: DailyMood[], userId: string): number {
  const userDates = new Set(
    moods.filter(m => m.userId === userId).map(m => m.date)
  )
  let streak = 0
  let day = startOfDay(new Date())
  // Bugün girilmemişse dün'den başla
  if (!userDates.has(format(day, 'yyyy-MM-dd'))) {
    day = subDays(day, 1)
  }
  while (userDates.has(format(day, 'yyyy-MM-dd'))) {
    streak++
    day = subDays(day, 1)
  }
  return streak
}

type FilterMode = 'all' | 'best' | 'worst'

export default function MoodPage() {
  const { moods, addMood, updateMood } = useData()
  const { currentUser, userProfile } = useAuth()
  const { partnerProfile, isPaired } = usePartner()
  const { colors } = useTheme()

  const [selectedMood, setSelectedMood] = useState<MoodLevel | null>(null)
  const [note, setNote] = useState('')
  const [saving, setSaving] = useState(false)
  const [filter, setFilter] = useState<FilterMode>('all')
  const [expandedDay, setExpandedDay] = useState<string | null>(null)

  // Bu kullanıcının bugün girişi var mı?
  const myTodayMood = useMemo(
    () => moods.find(m => m.date === todayStr() && m.userId === currentUser?.uid),
    [moods, currentUser]
  )
  // Partnerin bugünkü girişi
  const partnerTodayMood = useMemo(
    () => moods.find(m => m.date === todayStr() && m.userId === partnerProfile?.uid),
    [moods, partnerProfile]
  )

  // Streak hesapla
  const myStreak = useMemo(
    () => currentUser ? calculateStreak(moods, currentUser.uid) : 0,
    [moods, currentUser]
  )

  // Günlere göre grupla + her iki partnerin moodu
  const groupedByDate = useMemo(() => {
    const map = new Map<string, DailyMood[]>()
    moods.forEach(m => {
      const arr = map.get(m.date) || []
      arr.push(m)
      map.set(m.date, arr)
    })
    // Tarihe göre azalan sırala
    const entries = Array.from(map.entries()).sort((a, b) => b[0].localeCompare(a[0]))

    // Filtre uygula
    if (filter === 'best') {
      return entries.filter(([_, items]) => items.some(m => m.mood >= 4))
    }
    if (filter === 'worst') {
      return entries.filter(([_, items]) => items.some(m => m.mood <= 2))
    }
    return entries
  }, [moods, filter])

  // Mood kaydet
  async function handleSave() {
    if (!selectedMood) {
      toast.error('Lütfen bir ruh hali seç')
      return
    }
    setSaving(true)
    try {
      if (myTodayMood) {
        // Güncelle
        await updateMood(myTodayMood.id, { mood: selectedMood, note: note.trim() || undefined })
        toast.success('Günlük güncellendi ✨')
      } else {
        // Yeni ekle
        await addMood({ date: todayStr(), mood: selectedMood, note: note.trim() || undefined })
        toast.success('Bugünün ruh halin kaydedildi 💜')
      }
      setSelectedMood(null)
      setNote('')
    } catch (err) {
      console.error(err)
      toast.error('Kaydedilemedi')
    } finally {
      setSaving(false)
    }
  }

  // Düzenle moduna geçiş
  function startEdit() {
    if (myTodayMood) {
      setSelectedMood(myTodayMood.mood)
      setNote(myTodayMood.note || '')
    }
  }

  const isEditing = selectedMood !== null

  return (
    <div className="max-w-2xl mx-auto px-4 py-6 space-y-6">
      {/* ═══════ BAŞLIK + STREAK ═══════ */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ fontFamily: "'Dancing Script', cursive", color: colors.fg }}>
            Günlük
          </h1>
          <p className="text-sm mt-0.5" style={{ color: colors.softLight }}>
            Bugün nasıl geçti?
          </p>
        </div>
        <div className="flex items-center gap-2">
          {myStreak > 0 && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full"
            style={{ background: hexToRgba(colors.primary, 0.15), color: colors.primary }}
          >
            <FiAward size={16} />
            <span className="text-sm font-bold">{myStreak}</span>
            <span className="text-xs font-medium">gün seri</span>
          </motion.div>
        )}
        </div>
      </div>

      {/* ═══════ BUGÜNKÜ GİRİŞ ═══════ */}
      <motion.div
        layout
        className="rounded-2xl p-5 space-y-4"
        style={{ background: colors.card, boxShadow: `0 2px 20px ${hexToRgba(colors.accent, 0.15)}` }}
      >
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold" style={{ color: colors.fg }}>
            📅 {format(new Date(), "d MMMM yyyy, EEEE", { locale: tr })}
          </p>
          {myTodayMood && !isEditing && (
            <motion.button
              whileTap={{ scale: 0.9 }}
              onClick={startEdit}
              className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-lg transition cursor-pointer"
              style={{ color: colors.primary, background: hexToRgba(colors.primary, 0.1) }}
            >
              <FiEdit3 size={12} />
              Düzenle
            </motion.button>
          )}
        </div>

        {/* Eğer bugün zaten giriş yapılmışsa ve düzenleme modunda değilse */}
        {myTodayMood && !isEditing ? (
          <div className="space-y-3">
            {/* Partnerlerin mood'ları yan yana */}
            <div className={`grid ${isPaired ? 'grid-cols-2' : 'grid-cols-1'} gap-3`}>
              {/* Benim mood */}
              <MoodCard
                mood={myTodayMood}
                label={userProfile?.name || 'Ben'}
                colors={colors}
                isMine
              />
              {/* Partner mood */}
              {isPaired && (
                partnerTodayMood ? (
                  <MoodCard
                    mood={partnerTodayMood}
                    label={partnerProfile?.name || 'Partner'}
                    colors={colors}
                  />
                ) : (
                  <div
                    className="rounded-xl p-4 flex flex-col items-center justify-center gap-2 border-2 border-dashed"
                    style={{ borderColor: hexToRgba(colors.accent, 0.3) }}
                  >
                    <span className="text-2xl opacity-40">🫣</span>
                    <p className="text-xs text-center" style={{ color: colors.softLight }}>
                      {partnerProfile?.name || 'Partner'} henüz bugünü paylaşmadı
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        ) : (
          /* Mood seçici — bugün giriş yapılmamış veya düzenleme modu */
          <div className="space-y-4">
            <p className="text-sm" style={{ color: colors.softLight }}>
              Bugün nasıl hissettin?
            </p>

            {/* Mood seçim butonları */}
            <div className="flex items-center justify-between gap-2">
              {([1, 2, 3, 4, 5] as MoodLevel[]).map(level => {
                const config = MOOD_CONFIG[level]
                const isSelected = selectedMood === level
                return (
                  <motion.button
                    key={level}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setSelectedMood(level)}
                    className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all flex-1 cursor-pointer"
                    style={{
                      background: isSelected ? config.bg : 'transparent',
                      border: isSelected ? `2px solid ${config.color}` : '2px solid transparent',
                    }}
                  >
                    <motion.span
                      className="text-3xl"
                      animate={isSelected ? { scale: [1, 1.3, 1] } : {}}
                      transition={{ duration: 0.3 }}
                    >
                      {config.emoji}
                    </motion.span>
                    <span
                      className="text-[10px] font-semibold leading-tight"
                      style={{ color: isSelected ? config.color : colors.softLight }}
                    >
                      {config.label}
                    </span>
                  </motion.button>
                )
              })}
            </div>

            {/* Not alanı */}
            <AnimatePresence>
              {selectedMood && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  className="overflow-hidden"
                >
                  <textarea
                    value={note}
                    onChange={e => setNote(e.target.value)}
                    placeholder="Bugün neler oldu? (opsiyonel)"
                    rows={3}
                    className="w-full rounded-xl px-4 py-3 text-sm resize-none focus:outline-none transition-all"
                    style={{
                      background: hexToRgba(colors.accent, 0.08),
                      color: colors.fg,
                      border: `1px solid ${hexToRgba(colors.accent, 0.2)}`,
                    }}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            {/* Kaydet butonu */}
            <div className="flex gap-2">
              {isEditing && myTodayMood && (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => { setSelectedMood(null); setNote('') }}
                  className="px-4 py-2.5 rounded-xl text-sm font-medium cursor-pointer"
                  style={{ color: colors.softLight, background: hexToRgba(colors.accent, 0.1) }}
                >
                  Vazgeç
                </motion.button>
              )}
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleSave}
                disabled={!selectedMood || saving}
                className="flex-1 py-2.5 rounded-xl text-sm font-bold transition-all cursor-pointer disabled:opacity-50"
                style={{
                  background: selectedMood
                    ? `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`
                    : hexToRgba(colors.accent, 0.15),
                  color: selectedMood ? colors.fg : colors.softLight,
                }}
              >
                {saving ? 'Kaydediliyor…' : myTodayMood ? 'Güncelle' : 'Kaydet 💜'}
              </motion.button>
            </div>
          </div>
        )}
      </motion.div>

      {/* ═══════ İSTATİSTİKLER ═══════ */}
      {moods.length > 0 && (
        <MoodStats moods={moods} userId={currentUser?.uid} isPaired={isPaired} colors={colors} />
      )}

      {/* ═══════ MOOD GRAFİĞİ ═══════ */}
      {moods.length >= 2 && (
        <MoodChart
          moods={moods}
          myUid={currentUser?.uid}
          myName={userProfile?.name || 'Ben'}
          partnerUid={partnerProfile?.uid}
          partnerName={partnerProfile?.name || 'Partner'}
          isPaired={isPaired}
          colors={colors}
        />
      )}

      {/* ═══════ FİLTRE ═══════ */}
      <div className="flex items-center gap-2">
        <FiFilter size={14} style={{ color: colors.softLight }} />
        {([
          { key: 'all' as FilterMode, label: 'Tümü', icon: null },
          { key: 'best' as FilterMode, label: 'En Güzel Günler', icon: <FiTrendingUp size={13} /> },
          { key: 'worst' as FilterMode, label: 'Zor Günler', icon: <FiTrendingDown size={13} /> },
        ]).map(f => (
          <motion.button
            key={f.key}
            whileTap={{ scale: 0.95 }}
            onClick={() => setFilter(f.key)}
            className="flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer"
            style={{
              background: filter === f.key ? hexToRgba(colors.primary, 0.15) : hexToRgba(colors.accent, 0.08),
              color: filter === f.key ? colors.primary : colors.softLight,
              border: filter === f.key ? `1px solid ${hexToRgba(colors.primary, 0.3)}` : '1px solid transparent',
            }}
          >
            {f.icon}
            {f.label}
          </motion.button>
        ))}
      </div>

      {/* ═══════ GEÇMİŞ GÜNLERİN LİSTESİ ═══════ */}
      <div className="space-y-3">
        {groupedByDate.length === 0 && (
          <div className="text-center py-12">
            <span className="text-5xl block mb-3">🫗</span>
            <p className="text-sm font-medium" style={{ color: colors.softLight }}>
              {filter !== 'all'
                ? 'Bu filtreye uygun gün bulunamadı'
                : 'Henüz kayıt yok. İlk günlüğünü yaz!'}
            </p>
          </div>
        )}

        {groupedByDate.map(([date, items]) => {
          const dateObj = parseISO(date)
          const dayIsToday = isToday(dateObj)
          const daysAgo = differenceInCalendarDays(new Date(), dateObj)
          const isExpanded = expandedDay === date

          // Ortalama mood hesapla
          const avgMood = items.reduce((s, m) => s + m.mood, 0) / items.length
          const avgConfig = MOOD_CONFIG[Math.round(avgMood) as MoodLevel]

          return (
            <motion.div
              key={date}
              layout
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="rounded-xl overflow-hidden"
              style={{ background: colors.card, border: `1px solid ${hexToRgba(colors.accent, 0.1)}` }}
            >
              {/* Gün başlığı */}
              <button
                onClick={() => setExpandedDay(isExpanded ? null : date)}
                className="w-full flex items-center justify-between px-4 py-3 cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{avgConfig.emoji}</span>
                  <div className="text-left">
                    <p className="text-sm font-semibold" style={{ color: colors.fg }}>
                      {dayIsToday
                        ? 'Bugün'
                        : daysAgo === 1
                          ? 'Dün'
                          : format(dateObj, "d MMMM yyyy", { locale: tr })}
                    </p>
                    <p className="text-[11px]" style={{ color: colors.softLight }}>
                      {format(dateObj, 'EEEE', { locale: tr })}
                      {isPaired && ` • ${items.length} kişi`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {/* Mini mood göstergeleri */}
                  <div className="flex -space-x-1">
                    {items.map(m => (
                      <span
                        key={m.id}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-xs border-2"
                        style={{
                          background: MOOD_CONFIG[m.mood].bg,
                          borderColor: colors.card,
                        }}
                      >
                        {MOOD_CONFIG[m.mood].emoji}
                      </span>
                    ))}
                  </div>
                  {isExpanded
                    ? <FiChevronUp size={16} style={{ color: colors.softLight }} />
                    : <FiChevronDown size={16} style={{ color: colors.softLight }} />
                  }
                </div>
              </button>

              {/* Detay — açılır panel */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="px-4 pb-4 space-y-3" style={{ borderTop: `1px solid ${hexToRgba(colors.accent, 0.1)}` }}>
                      <div className="pt-3" />
                      {items.map(m => (
                        <div
                          key={m.id}
                          className="rounded-lg p-3 space-y-1.5"
                          style={{ background: MOOD_CONFIG[m.mood].bg }}
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-lg">{MOOD_CONFIG[m.mood].emoji}</span>
                            <div>
                              <p className="text-sm font-semibold" style={{ color: colors.fg }}>
                                {m.userName}
                              </p>
                              <p className="text-[11px] font-medium" style={{ color: MOOD_CONFIG[m.mood].color }}>
                                {MOOD_CONFIG[m.mood].label}
                              </p>
                            </div>
                          </div>
                          {m.note && (
                            <p className="text-sm leading-relaxed pl-8" style={{ color: colors.fg, opacity: 0.85 }}>
                              "{m.note}"
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )
        })}
      </div>
    </div>
  )
}

// ═══════ Mood Grafiği (Son 14 gün çizgi grafik) ═══════
function MoodChart({
  moods,
  myUid,
  myName,
  partnerUid,
  partnerName,
  isPaired,
  colors,
}: {
  moods: DailyMood[]
  myUid?: string
  myName: string
  partnerUid?: string
  partnerName: string
  isPaired: boolean
  colors: any
}) {
  const chartData = useMemo(() => {
    // Son 14 günü oluştur
    const days: { date: string; label: string; ben?: number; partner?: number }[] = []
    for (let i = 13; i >= 0; i--) {
      const d = subDays(new Date(), i)
      const dateStr = format(d, 'yyyy-MM-dd')
      const label = format(d, 'd MMM', { locale: tr })
      const myMood = moods.find(m => m.date === dateStr && m.userId === myUid)
      const partnerMood = moods.find(m => m.date === dateStr && m.userId === partnerUid)
      days.push({
        date: dateStr,
        label,
        ben: myMood?.mood,
        partner: partnerMood?.mood,
      })
    }
    return days
  }, [moods, myUid, partnerUid])

  // Emoji tooltip
  const emojiForMood = (val: number) => MOOD_CONFIG[Math.round(val) as MoodLevel]?.emoji || ''

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null
    return (
      <div
        className="rounded-xl px-3 py-2 text-xs shadow-lg"
        style={{ background: colors.card, border: `1px solid ${hexToRgba(colors.accent, 0.2)}` }}
      >
        <p className="font-semibold mb-1" style={{ color: colors.fg }}>{label}</p>
        {payload.map((p: any) => (
          <div key={p.dataKey} className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: p.stroke }}
            />
            <span style={{ color: colors.softLight }}>
              {p.dataKey === 'ben' ? myName : partnerName}:
            </span>
            <span className="font-medium" style={{ color: colors.fg }}>
              {emojiForMood(p.value)} {MOOD_CONFIG[Math.round(p.value) as MoodLevel]?.label}
            </span>
          </div>
        ))}
      </div>
    )
  }

  // Y ekseni emoji ticks
  const EmojiTick = ({ x, y, payload }: any) => (
    <text x={x - 4} y={y + 4} textAnchor="end" fontSize={14}>
      {MOOD_CONFIG[payload.value as MoodLevel]?.emoji || ''}
    </text>
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 sm:p-5"
      style={{ background: colors.card, boxShadow: `0 2px 20px ${hexToRgba(colors.accent, 0.1)}` }}
    >
      <p className="text-sm font-semibold mb-4" style={{ color: colors.fg }}>
        📈 Son 14 Gün
      </p>
      <div style={{ width: '100%', height: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={hexToRgba(colors.accent, 0.15)} />
            <XAxis
              dataKey="label"
              tick={{ fontSize: 10, fill: colors.softLight }}
              axisLine={{ stroke: hexToRgba(colors.accent, 0.2) }}
              tickLine={false}
              interval="preserveStartEnd"
            />
            <YAxis
              domain={[1, 5]}
              ticks={[1, 2, 3, 4, 5]}
              tick={EmojiTick}
              axisLine={false}
              tickLine={false}
              width={28}
            />
            <Tooltip content={<CustomTooltip />} />
            <ReferenceLine y={3} stroke={hexToRgba(colors.accent, 0.25)} strokeDasharray="4 4" />
            <Line
              type="monotone"
              dataKey="ben"
              stroke="#B8A0DC"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#B8A0DC', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#B8A0DC', strokeWidth: 2, stroke: '#fff' }}
              connectNulls={false}
              name={myName}
            />
            {isPaired && (
              <Line
                type="monotone"
                dataKey="partner"
                stroke="#FADADD"
                strokeWidth={2.5}
                dot={{ r: 4, fill: '#E8808C', strokeWidth: 0 }}
                activeDot={{ r: 6, fill: '#E8808C', strokeWidth: 2, stroke: '#fff' }}
                connectNulls={false}
                name={partnerName}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
      {/* Lejand */}
      <div className="flex items-center justify-center gap-4 mt-3">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-1.5 rounded-full" style={{ background: '#B8A0DC' }} />
          <span className="text-[11px] font-medium" style={{ color: colors.softLight }}>{myName}</span>
        </div>
        {isPaired && (
          <div className="flex items-center gap-1.5">
            <span className="w-3 h-1.5 rounded-full" style={{ background: '#E8808C' }} />
            <span className="text-[11px] font-medium" style={{ color: colors.softLight }}>{partnerName}</span>
          </div>
        )}
      </div>
    </motion.div>
  )
}

// ═══════ Mood İstatistik Paneli ═══════
function MoodStats({
  moods,
  userId,
  isPaired,
  colors,
}: {
  moods: DailyMood[]
  userId?: string
  isPaired: boolean
  colors: any
}) {
  const stats = useMemo(() => {
    // Benzersiz gün sayısı
    const uniqueDays = new Set(moods.map(m => m.date)).size
    // Ortalama mood
    const avg = moods.length > 0 ? moods.reduce((s, m) => s + m.mood, 0) / moods.length : 0
    const avgRound = Math.round(avg * 10) / 10
    // En güzel gün (en yüksek ortalama)
    const byDate = new Map<string, number[]>()
    moods.forEach(m => {
      const arr = byDate.get(m.date) || []
      arr.push(m.mood)
      byDate.set(m.date, arr)
    })
    let bestDay = '', bestAvg = 0, worstDay = '', worstAvg = 6
    byDate.forEach((vals, date) => {
      const dayAvg = vals.reduce((a, b) => a + b, 0) / vals.length
      if (dayAvg > bestAvg) { bestAvg = dayAvg; bestDay = date }
      if (dayAvg < worstAvg) { worstAvg = dayAvg; worstDay = date }
    })
    // Mevcut kullanıcının giriş sayısı
    const myEntries = moods.filter(m => m.userId === userId).length
    return { uniqueDays, avgRound, avg, bestDay, bestAvg, worstDay, worstAvg, myEntries }
  }, [moods, userId])

  const avgConfig = MOOD_CONFIG[Math.round(stats.avg || 3) as MoodLevel]

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
      <div className="rounded-xl p-3.5 text-center" style={{ background: hexToRgba(colors.accent, 0.08) }}>
        <p className="text-2xl mb-1">{avgConfig.emoji}</p>
        <p className="text-lg font-bold" style={{ color: colors.fg }}>{stats.avgRound}</p>
        <p className="text-[10px] font-medium" style={{ color: colors.softLight }}>Ortalama Mood</p>
      </div>
      <div className="rounded-xl p-3.5 text-center" style={{ background: hexToRgba(colors.accent, 0.08) }}>
        <p className="text-2xl mb-1">📅</p>
        <p className="text-lg font-bold" style={{ color: colors.fg }}>{stats.uniqueDays}</p>
        <p className="text-[10px] font-medium" style={{ color: colors.softLight }}>Toplam Gün</p>
      </div>
      <div className="rounded-xl p-3.5 text-center" style={{ background: 'rgba(133,200,138,0.08)' }}>
        <p className="text-2xl mb-1">🥰</p>
        <p className="text-xs font-bold" style={{ color: '#85C88A' }}>
          {stats.bestDay ? format(parseISO(stats.bestDay), 'd MMM', { locale: tr }) : '—'}
        </p>
        <p className="text-[10px] font-medium" style={{ color: colors.softLight }}>En Güzel Gün</p>
      </div>
      <div className="rounded-xl p-3.5 text-center" style={{ background: 'rgba(232,128,140,0.08)' }}>
        <p className="text-2xl mb-1">😢</p>
        <p className="text-xs font-bold" style={{ color: '#E8808C' }}>
          {stats.worstDay ? format(parseISO(stats.worstDay), 'd MMM', { locale: tr }) : '—'}
        </p>
        <p className="text-[10px] font-medium" style={{ color: colors.softLight }}>En Zor Gün</p>
      </div>
    </div>
  )
}

// ═══════ Mood kartı bileşeni (bugünkü giriş) ═══════
function MoodCard({
  mood,
  label,
  colors,
  isMine,
}: {
  mood: DailyMood
  label: string
  colors: any
  isMine?: boolean
}) {
  const config = MOOD_CONFIG[mood.mood]
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="rounded-xl p-4 space-y-2"
      style={{
        background: config.bg,
        border: isMine ? `2px solid ${hexToRgba(config.color, 0.4)}` : `1px solid ${hexToRgba(config.color, 0.2)}`,
      }}
    >
      <div className="flex items-center gap-2">
        <span className="text-2xl">{config.emoji}</span>
        <div>
          <p className="text-xs font-medium" style={{ color: colors.softLight }}>{label}</p>
          <p className="text-sm font-bold" style={{ color: config.color }}>{config.label}</p>
        </div>
      </div>
      {mood.note && (
        <p className="text-sm leading-relaxed" style={{ color: colors.fg, opacity: 0.8 }}>
          "{mood.note}"
        </p>
      )}
    </motion.div>
  )
}
