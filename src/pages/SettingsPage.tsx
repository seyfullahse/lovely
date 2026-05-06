// Planora – Ayarlar Sayfası (Tema renkleri, light/dark mod)
import { motion } from 'framer-motion'
import { useTheme, themes, hexToRgba, ThemeColor } from '../context/ThemeContext'
import { FiSun, FiMoon, FiCheck } from 'react-icons/fi'

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.04 } },
}
const item = {
  hidden: { opacity: 0, y: 12 },
  show: { opacity: 1, y: 0 },
}

export default function SettingsPage() {
  const { themeColor, themeMode, colors, setThemeColor, setThemeMode } = useTheme()
  const themeEntries = Object.entries(themes) as [ThemeColor, (typeof themes)[ThemeColor]][]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-8">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        {/* Başlık */}
        <div className="flex items-center gap-3 mb-8">
          <div
            className="w-11 h-11 rounded-2xl flex items-center justify-center text-lg"
            style={{ background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})` }}
          >
            ⚙️
          </div>
          <div>
            <h1
              className="text-2xl font-bold"
              style={{ fontFamily: "'Playfair Display', serif", color: colors.fg }}
            >
              Ayarlar
            </h1>
            <p className="text-xs mt-0.5" style={{ color: colors.mutedFg }}>
              Tema ve görünüm tercihlerini düzenle
            </p>
          </div>
        </div>

        {/* ── Tema Rengi ── */}
        <section
          className="rounded-2xl p-5 mb-5"
          style={{
            background: colors.card,
            border: `1px solid ${hexToRgba(colors.accent, 0.3)}`,
            boxShadow: `0 2px 12px ${hexToRgba(colors.fg, 0.04)}`,
          }}
        >
          <h2
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: colors.fg }}
          >
            🎨 Tema Rengi
          </h2>

          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="grid grid-cols-2 sm:grid-cols-3 gap-3"
          >
            {themeEntries.map(([key, theme]) => {
              const isSelected = themeColor === key
              const preview = theme[themeMode]
              return (
                <motion.button
                  key={key}
                  variants={item}
                  whileTap={{ scale: 0.96 }}
                  onClick={() => setThemeColor(key)}
                  className="relative rounded-xl p-3.5 text-left cursor-pointer transition-all"
                  style={{
                    background: isSelected
                      ? `linear-gradient(135deg, ${hexToRgba(preview.secondary, 0.35)}, ${hexToRgba(preview.accent, 0.3)})`
                      : hexToRgba(colors.muted, 0.5),
                    border: isSelected
                      ? `2px solid ${preview.primary}`
                      : `2px solid transparent`,
                  }}
                >
                  {/* Renk önizleme daireleri */}
                  <div className="flex gap-1.5 mb-2.5">
                    <div className="w-7 h-7 rounded-full shadow-sm" style={{ background: preview.primary }} />
                    <div className="w-7 h-7 rounded-full shadow-sm" style={{ background: preview.secondary }} />
                    <div
                      className="w-7 h-7 rounded-full shadow-sm"
                      style={{ background: `linear-gradient(135deg, ${preview.gradient[0]}, ${preview.gradient[1]})` }}
                    />
                  </div>

                  <div className="flex items-center gap-1.5">
                    <span className="text-base">{theme.emoji}</span>
                    <span
                      className="text-xs font-semibold"
                      style={{ color: isSelected ? preview.primary : colors.mutedFg }}
                    >
                      {theme.label}
                    </span>
                  </div>

                  {/* Seçim işareti */}
                  {isSelected && (
                    <motion.div
                      layoutId="theme-check"
                      className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: preview.primary, color: '#fff' }}
                      transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                    >
                      <FiCheck size={12} strokeWidth={3} />
                    </motion.div>
                  )}
                </motion.button>
              )
            })}
          </motion.div>
        </section>

        {/* ── Görünüm Modu ── */}
        <section
          className="rounded-2xl p-5 mb-5"
          style={{
            background: colors.card,
            border: `1px solid ${hexToRgba(colors.accent, 0.3)}`,
            boxShadow: `0 2px 12px ${hexToRgba(colors.fg, 0.04)}`,
          }}
        >
          <h2
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: colors.fg }}
          >
            🌓 Görünüm
          </h2>

          <div className="grid grid-cols-2 gap-3">
            {/* Aydınlık */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setThemeMode('light')}
              className="relative rounded-xl p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-all"
              style={{
                background: themeMode === 'light'
                  ? `linear-gradient(135deg, ${hexToRgba(colors.secondary, 0.35)}, ${hexToRgba(colors.accent, 0.3)})`
                  : hexToRgba(colors.muted, 0.5),
                border: themeMode === 'light'
                  ? `2px solid ${colors.primary}`
                  : `2px solid transparent`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: themeMode === 'light'
                    ? `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`
                    : hexToRgba(colors.muted, 0.6),
                }}
              >
                <FiSun size={22} style={{ color: themeMode === 'light' ? colors.fg : colors.mutedFg }} />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: themeMode === 'light' ? colors.fg : colors.mutedFg }}
              >
                Aydınlık
              </span>
              {themeMode === 'light' && (
                <motion.div
                  layoutId="mode-check"
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: colors.primary, color: '#fff' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <FiCheck size={12} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>

            {/* Karanlık */}
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={() => setThemeMode('dark')}
              className="relative rounded-xl p-4 flex flex-col items-center gap-2.5 cursor-pointer transition-all"
              style={{
                background: themeMode === 'dark'
                  ? `linear-gradient(135deg, ${hexToRgba(colors.secondary, 0.35)}, ${hexToRgba(colors.accent, 0.3)})`
                  : hexToRgba(colors.muted, 0.5),
                border: themeMode === 'dark'
                  ? `2px solid ${colors.primary}`
                  : `2px solid transparent`,
              }}
            >
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{
                  background: themeMode === 'dark'
                    ? `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})`
                    : hexToRgba(colors.muted, 0.6),
                }}
              >
                <FiMoon size={22} style={{ color: themeMode === 'dark' ? colors.fg : colors.mutedFg }} />
              </div>
              <span
                className="text-sm font-semibold"
                style={{ color: themeMode === 'dark' ? colors.fg : colors.mutedFg }}
              >
                Karanlık
              </span>
              {themeMode === 'dark' && (
                <motion.div
                  layoutId="mode-check"
                  className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full flex items-center justify-center"
                  style={{ background: colors.primary, color: '#fff' }}
                  transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                >
                  <FiCheck size={12} strokeWidth={3} />
                </motion.div>
              )}
            </motion.button>
          </div>
        </section>

        {/* ── Önizleme ── */}
        <section
          className="rounded-2xl p-5 mb-5"
          style={{
            background: colors.card,
            border: `1px solid ${hexToRgba(colors.accent, 0.3)}`,
            boxShadow: `0 2px 12px ${hexToRgba(colors.fg, 0.04)}`,
          }}
        >
          <h2
            className="text-sm font-semibold mb-4 flex items-center gap-2"
            style={{ color: colors.fg }}
          >
            👁️ Önizleme
          </h2>

          {/* Mini uygulama önizlemesi */}
          <div className="rounded-xl overflow-hidden" style={{ background: colors.bg, border: `1px solid ${hexToRgba(colors.accent, 0.2)}` }}>
            {/* Mini navbar */}
            <div
              className="px-4 py-2.5 flex items-center justify-between"
              style={{ background: colors.navBg, borderBottom: `1px solid ${hexToRgba(colors.accent, 0.2)}` }}
            >
              <span className="text-xs font-semibold" style={{ fontFamily: "'Playfair Display', serif", color: colors.fg }}>
                Planora
              </span>
              <div className="flex gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ background: colors.primary }} />
                <div className="w-2 h-2 rounded-full" style={{ background: colors.secondary }} />
                <div className="w-2 h-2 rounded-full" style={{ background: colors.destructive }} />
              </div>
            </div>

            {/* Mini içerik */}
            <div className="p-3 space-y-2">
              {/* Gradient banner */}
              <div
                className="rounded-lg p-3"
                style={{ background: `linear-gradient(135deg, ${colors.gradient[0]}, ${colors.gradient[1]})` }}
              >
                <p className="text-[10px] font-semibold" style={{ color: colors.fg }}>
                  Hoş geldin! 💕
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: colors.mutedFg }}>
                  Bugün harika bir gün
                </p>
              </div>

              {/* Kart */}
              <div
                className="rounded-lg p-2.5"
                style={{ background: colors.card, border: `1px solid ${hexToRgba(colors.accent, 0.2)}` }}
              >
                <p className="text-[10px] font-semibold" style={{ color: colors.fg }}>
                  Romantik Akşam Yemeği
                </p>
                <p className="text-[9px] mt-0.5" style={{ color: colors.mutedFg }}>
                  24 Mart 2026, Salı · 19:30
                </p>
              </div>

              {/* Butonlar */}
              <div className="flex gap-2">
                <div
                  className="flex-1 rounded-lg py-1.5 text-center text-[9px] font-semibold"
                  style={{ background: colors.primary, color: '#fff' }}
                >
                  Birincil
                </div>
                <div
                  className="flex-1 rounded-lg py-1.5 text-center text-[9px] font-semibold"
                  style={{ background: colors.secondary, color: colors.fg }}
                >
                  İkincil
                </div>
                <div
                  className="flex-1 rounded-lg py-1.5 text-center text-[9px] font-semibold"
                  style={{ background: colors.destructive, color: '#fff' }}
                >
                  Uyarı
                </div>
              </div>
            </div>
          </div>
        </section>
      </motion.div>
    </div>
  )
}
