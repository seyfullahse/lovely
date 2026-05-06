import { useRef } from 'react'
import { motion, useInView } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
  FiCalendar,
  FiCheckSquare,
  FiDollarSign,
  FiHeart,
  FiUsers,
  FiArrowRight,
  FiSmartphone,
  FiShield,
  FiStar,
  FiClock,
  FiZap,
  FiGift,
} from 'react-icons/fi'
import FloatingHearts from '../components/romantic/FloatingHearts'

// Animasyon varyantları
const fadeUp = {
  hidden: { opacity: 0, y: 40 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.6, ease: [0.22, 1, 0.36, 1] },
  }),
}

const scaleIn = {
  hidden: { opacity: 0, scale: 0.85 },
  visible: (i: number) => ({
    opacity: 1,
    scale: 1,
    transition: { delay: i * 0.12, duration: 0.5, ease: [0.22, 1, 0.36, 1] },
  }),
}

// Görünürlük hook'u ile animasyonlu section wrapper
function AnimatedSection({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  const ref = useRef(null)
  const isInView = useInView(ref, { once: true, margin: '-80px' })
  return (
    <div ref={ref} className={className}>
      <motion.div initial="hidden" animate={isInView ? 'visible' : 'hidden'}>
        {children}
      </motion.div>
    </div>
  )
}

// Özellik kartı bileşeni
function FeatureCard({
  icon,
  title,
  desc,
  color,
  gradient,
  index,
}: {
  icon: React.ReactNode
  title: string
  desc: string
  color: string
  gradient: string
  index: number
}) {
  return (
    <motion.div
      custom={index}
      variants={scaleIn}
      whileHover={{ y: -6, boxShadow: '0 20px 50px rgba(61,44,62,0.1)' }}
      className="group relative rounded-3xl p-7 sm:p-8 transition-all cursor-default"
      style={{
        background: 'rgba(255,255,255,0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(232,223,245,0.25)',
      }}
    >
      {/* Dekoratif gradient arka plan */}
      <div
        className="absolute top-0 right-0 w-32 h-32 rounded-full opacity-[0.07] -translate-y-8 translate-x-8"
        style={{ background: `radial-gradient(circle, ${color}, transparent)` }}
      />
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mb-5 transition-transform group-hover:scale-110"
        style={{ background: gradient }}
      >
        {icon}
      </div>
      <h3
        className="text-lg font-semibold mb-2"
        style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
      >
        {title}
      </h3>
      <p className="text-sm leading-relaxed" style={{ color: '#9A949D' }}>
        {desc}
      </p>
    </motion.div>
  )
}

// Nasıl çalışır adım bileşeni
function StepCard({
  step,
  title,
  desc,
  icon,
  index,
}: {
  step: number
  title: string
  desc: string
  icon: React.ReactNode
  index: number
}) {
  return (
    <motion.div
      custom={index}
      variants={fadeUp}
      className="flex flex-col items-center text-center"
    >
      <div className="relative mb-6">
        <div
          className="w-20 h-20 rounded-3xl flex items-center justify-center"
          style={{
            background: 'linear-gradient(135deg, rgba(184,160,220,0.12), rgba(250,218,221,0.12))',
            border: '2px solid rgba(184,160,220,0.15)',
          }}
        >
          {icon}
        </div>
        <div
          className="absolute -top-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold"
          style={{ background: 'linear-gradient(135deg, #B8A0DC, #FADADD)', color: '#fff' }}
        >
          {step}
        </div>
      </div>
      <h4
        className="text-base font-semibold mb-2"
        style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
      >
        {title}
      </h4>
      <p className="text-sm leading-relaxed max-w-[260px]" style={{ color: '#9A949D' }}>
        {desc}
      </p>
    </motion.div>
  )
}

export default function IntroPage() {
  const navigate = useNavigate()

  const features = [
    {
      icon: <FiCalendar size={24} color="#93B5E1" />,
      title: 'Ortak Takvim',
      desc: 'Planlarınızı ve görevlerinizi paylaşılan bir takvimde görün. Randevular, buluşmalar, özel günler — hepsi bir arada.',
      color: '#93B5E1',
      gradient: 'linear-gradient(135deg, rgba(147,181,225,0.2), rgba(147,181,225,0.05))',
    },
    {
      icon: <FiCheckSquare size={24} color="#B8A0DC" />,
      title: 'Görev Yönetimi',
      desc: 'Alışveriş listeleri, ev işleri, hatırlatmalar... Kimin yapacağını belirleyin, tamamlandığında kutlayın.',
      color: '#B8A0DC',
      gradient: 'linear-gradient(135deg, rgba(184,160,220,0.2), rgba(184,160,220,0.05))',
    },
    {
      icon: <FiHeart size={24} color="#E8808C" />,
      title: 'Plan Oluşturma',
      desc: 'Akşam yemeği, sinema gecesi, hafta sonu kaçamağı... Birlikte yapılacak planları organize edin.',
      color: '#E8808C',
      gradient: 'linear-gradient(135deg, rgba(232,128,140,0.2), rgba(232,128,140,0.05))',
    },
    {
      icon: <FiDollarSign size={24} color="#8ECFB0" />,
      title: 'Harcama Takibi',
      desc: 'Ortak harcamalarınızı kaydedin. Kim ne kadar harcadı, bakiye ne durumda — her şey şeffaf.',
      color: '#8ECFB0',
      gradient: 'linear-gradient(135deg, rgba(142,207,176,0.2), rgba(142,207,176,0.05))',
    },
    {
      icon: <FiGift size={24} color="#E8C97D" />,
      title: 'Sürpriz Kutusu',
      desc: 'Partnerinize gizli mesajlar ve sürprizler bırakın. Romantik anları özel kılın.',
      color: '#E8C97D',
      gradient: 'linear-gradient(135deg, rgba(232,201,125,0.2), rgba(232,201,125,0.05))',
    },
    {
      icon: <FiStar size={24} color="#D4A0E8" />,
      title: '7 Tema & Karanlık Mod',
      desc: 'Romantic, Ocean, Forest, Sunset, Lavender, Cherry, Apple — size uygun temayı seçin.',
      color: '#D4A0E8',
      gradient: 'linear-gradient(135deg, rgba(212,160,232,0.2), rgba(212,160,232,0.05))',
    },
  ]

  const steps = [
    {
      icon: <FiUsers size={28} color="#B8A0DC" />,
      title: 'Hesap Oluşturun',
      desc: 'Google ile veya e-posta ile hızlıca kayıt olun. Sadece birkaç saniye sürüyor.',
    },
    {
      icon: <FiSmartphone size={28} color="#E8808C" />,
      title: 'Partnerinizi Davet Edin',
      desc: 'Eşleşme kodu ile partnerinizi uygulamaya bağlayın. Artık her şey senkron.',
    },
    {
      icon: <FiCalendar size={28} color="#93B5E1" />,
      title: 'Birlikte Planlayın',
      desc: 'Takvimi paylaşın, görevler oluşturun, planlar yapın. Hayatı birlikte organize edin.',
    },
    {
      icon: <FiZap size={28} color="#8ECFB0" />,
      title: 'Keyfini Çıkarın',
      desc: 'İstatistikleri görün, sürprizler bırakın, hatıraları biriktirin. İlişkinizi güçlendirin.',
    },
  ]

  return (
    <div className="relative min-h-screen overflow-hidden">
      <FloatingHearts />

      {/* Dekoratif arka plan */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div
          className="absolute -top-40 -right-40 w-[600px] h-[600px] rounded-full opacity-[0.06]"
          style={{ background: 'radial-gradient(circle, #FADADD, transparent)' }}
        />
        <div
          className="absolute top-1/3 -left-60 w-[500px] h-[500px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #E8DFF5, transparent)' }}
        />
        <div
          className="absolute bottom-0 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.04]"
          style={{ background: 'radial-gradient(circle, #93B5E1, transparent)' }}
        />
      </div>

      <div className="relative z-10">
        {/* ═══════════════════════════════════════════
            HERO SECTION
        ═══════════════════════════════════════════ */}
        <section className="pt-8 sm:pt-16 pb-20 sm:pb-32 px-6 sm:px-10">
          <div className="max-w-4xl mx-auto text-center">
            {/* Logo / Brand mark */}
            <motion.div
              initial={{ opacity: 0, scale: 0.6, rotate: -10 }}
              animate={{ opacity: 1, scale: 1, rotate: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="inline-flex mb-8"
            >
              <div
                className="w-20 h-20 sm:w-24 sm:h-24 rounded-3xl flex items-center justify-center text-3xl sm:text-4xl"
                style={{
                  background: 'linear-gradient(135deg, #FADADD, #E8DFF5, #B8A0DC)',
                  boxShadow: '0 20px 60px rgba(184,160,220,0.25), 0 0 0 1px rgba(184,160,220,0.1)',
                }}
              >
                ✦
              </div>
            </motion.div>

            {/* Badge */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.5 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8"
              style={{
                background: 'rgba(184,160,220,0.08)',
                border: '1px solid rgba(184,160,220,0.15)',
              }}
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#8ECFB0' }} />
              <span className="text-xs font-medium" style={{ color: '#6E5A73' }}>
                Çiftler için tasarlandı
              </span>
            </motion.div>

            {/* Ana başlık */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
              className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight mb-6"
              style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
            >
              Aşkınızı{' '}
              <span
                className="relative"
                style={{
                  background: 'linear-gradient(135deg, #B8A0DC, #E8808C, #FADADD)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                }}
              >
                Planlayın
              </span>
            </motion.h1>

            {/* Alt başlık */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="text-base sm:text-lg md:text-xl leading-relaxed max-w-2xl mx-auto mb-10"
              style={{ color: '#9A949D' }}
            >
              Planora, çiftlerin hayatlarını birlikte organize etmeleri için tasarlanmış
              zarif bir planlama uygulamasıdır. Takvim, görevler, harcamalar ve sürprizler
              — hepsi tek bir yerde.
            </motion.p>

            {/* CTA Butonları */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.5 }}
              className="flex flex-col sm:flex-row items-center justify-center gap-4"
            >
              <motion.button
                whileHover={{ scale: 1.04, boxShadow: '0 12px 40px rgba(184,160,220,0.35)' }}
                whileTap={{ scale: 0.97 }}
                onClick={() => navigate('/login')}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-semibold cursor-pointer transition-all"
                style={{
                  background: 'linear-gradient(135deg, #B8A0DC, #E8808C)',
                  color: '#fff',
                  boxShadow: '0 8px 30px rgba(184,160,220,0.3)',
                }}
              >
                <FiHeart size={18} />
                Hemen Başla
                <FiArrowRight size={16} />
              </motion.button>
            </motion.div>

            {/* Güven sinyalleri */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1, duration: 0.6 }}
              className="flex items-center justify-center gap-6 mt-10"
            >
              {[
                { icon: <FiShield size={14} />, text: 'Güvenli & Gizli' },
                { icon: <FiSmartphone size={14} />, text: 'Her Cihazda' },
                { icon: <FiZap size={14} />, text: 'Ücretsiz' },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-1.5">
                  <span style={{ color: '#B8A0DC' }}>{item.icon}</span>
                  <span className="text-xs font-medium" style={{ color: '#B8A9BC' }}>
                    {item.text}
                  </span>
                </div>
              ))}
            </motion.div>
          </div>
        </section>

        {/* ═══════════════════════════════════════════
            PREVIEW / MOCKUP SECTION
        ═══════════════════════════════════════════ */}
        <AnimatedSection className="pb-20 sm:pb-32 px-6 sm:px-10">
          <motion.div custom={0} variants={fadeUp} className="max-w-5xl mx-auto">
            <div
              className="rounded-3xl p-4 sm:p-6"
              style={{
                background: 'linear-gradient(135deg, rgba(184,160,220,0.08), rgba(250,218,221,0.08))',
                border: '1px solid rgba(184,160,220,0.12)',
              }}
            >
              <div
                className="rounded-2xl overflow-hidden p-6 sm:p-10"
                style={{
                  background: 'rgba(255,255,255,0.8)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                {/* Mock Dashboard Preview */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 mb-6">
                  {/* Stat cards mockup */}
                  {[
                    { label: 'Aktif Planlar', value: '12', color: '#93B5E1', bg: 'rgba(147,181,225,0.1)' },
                    { label: 'Bekleyen Görevler', value: '8', color: '#B8A0DC', bg: 'rgba(184,160,220,0.1)' },
                    { label: 'Bu Ay Harcama', value: '₺2,450', color: '#8ECFB0', bg: 'rgba(142,207,176,0.1)' },
                  ].map((stat, i) => (
                    <motion.div
                      key={i}
                      custom={i + 1}
                      variants={scaleIn}
                      className="rounded-xl p-4 text-center"
                      style={{ background: stat.bg, border: `1px solid ${stat.color}22` }}
                    >
                      <p className="text-2xl font-bold mb-1" style={{ color: '#3D2C3E' }}>
                        {stat.value}
                      </p>
                      <p className="text-xs font-medium" style={{ color: stat.color }}>
                        {stat.label}
                      </p>
                    </motion.div>
                  ))}
                </div>

                {/* Calendar mock */}
                <div
                  className="rounded-xl p-5"
                  style={{ background: 'rgba(147,181,225,0.05)', border: '1px solid rgba(147,181,225,0.1)' }}
                >
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-sm font-semibold" style={{ color: '#3D2C3E', fontFamily: "'Playfair Display', serif" }}>
                      Mart 2026
                    </span>
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full" style={{ background: 'rgba(232,128,140,0.1)', color: '#E8808C' }}>
                      3 etkinlik
                    </span>
                  </div>
                  <div className="grid grid-cols-7 gap-2">
                    {['Pt', 'Sa', 'Ça', 'Pe', 'Cu', 'Ct', 'Pz'].map((d) => (
                      <div key={d} className="text-center text-[10px] font-semibold py-1" style={{ color: '#B8A9BC' }}>
                        {d}
                      </div>
                    ))}
                    {Array.from({ length: 35 }, (_, i) => {
                      const day = i - 5  // Mart 1 = Pazar (offset 6, 0-indexed = 5)
                      const dayNum = day + 1
                      const isValid = dayNum >= 1 && dayNum <= 31
                      const isToday = dayNum === 26
                      const hasEvent = [8, 14, 22, 28].includes(dayNum)
                      return (
                        <div
                          key={i}
                          className="text-center py-1.5 rounded-lg text-xs relative"
                          style={{
                            color: !isValid ? 'transparent' : isToday ? '#fff' : '#6E5A73',
                            background: isToday
                              ? 'linear-gradient(135deg, #B8A0DC, #E8808C)'
                              : hasEvent && isValid
                                ? 'rgba(250,218,221,0.3)'
                                : 'transparent',
                            fontWeight: isToday ? 700 : 400,
                          }}
                        >
                          {isValid ? dayNum : ''}
                          {hasEvent && isValid && !isToday && (
                            <div
                              className="absolute bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full"
                              style={{ background: '#E8808C' }}
                            />
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════
            ÖZELLİKLER SECTION
        ═══════════════════════════════════════════ */}
        <AnimatedSection className="pb-20 sm:pb-32 px-6 sm:px-10">
          <div className="max-w-6xl mx-auto">
            {/* Section header */}
            <motion.div custom={0} variants={fadeUp} className="text-center mb-14 sm:mb-18">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: 'rgba(232,128,140,0.08)', color: '#E8808C', border: '1px solid rgba(232,128,140,0.12)' }}
              >
                Özellikler
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
              >
                Her Şey Tek Yerde
              </h2>
              <p className="text-base sm:text-lg max-w-2xl mx-auto" style={{ color: '#9A949D' }}>
                İlişkinizi daha düzenli, daha eğlenceli ve daha özel kılmak için
                ihtiyacınız olan tüm araçlar.
              </p>
            </motion.div>

            {/* Feature grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {features.map((f, i) => (
                <FeatureCard key={i} index={i} {...f} />
              ))}
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════
            NASIL ÇALIŞIR SECTION
        ═══════════════════════════════════════════ */}
        <AnimatedSection className="pb-20 sm:pb-32 px-6 sm:px-10">
          <div className="max-w-5xl mx-auto">
            {/* Section header */}
            <motion.div custom={0} variants={fadeUp} className="text-center mb-14 sm:mb-18">
              <span
                className="inline-block px-4 py-1.5 rounded-full text-xs font-semibold mb-5"
                style={{ background: 'rgba(184,160,220,0.08)', color: '#B8A0DC', border: '1px solid rgba(184,160,220,0.12)' }}
              >
                Nasıl Çalışır?
              </span>
              <h2
                className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
                style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
              >
                4 Adımda Başlayın
              </h2>
              <p className="text-base sm:text-lg max-w-xl mx-auto" style={{ color: '#9A949D' }}>
                Kurulumu dakikalar sürer, etkisi ömür boyu devam eder.
              </p>
            </motion.div>

            {/* Steps grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 sm:gap-8">
              {steps.map((s, i) => (
                <StepCard key={i} index={i} step={i + 1} {...s} />
              ))}
            </div>

            {/* Bağlantı çizgisi — sadece large ekranda */}
            <div className="hidden lg:block relative -mt-[280px] mb-[200px] mx-auto" style={{ maxWidth: '70%' }}>
              <div
                className="h-px w-full"
                style={{ background: 'linear-gradient(90deg, transparent, rgba(184,160,220,0.2), rgba(232,128,140,0.2), transparent)' }}
              />
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════
            SHOWCASE / HIGHLIGHT SECTION
        ═══════════════════════════════════════════ */}
        <AnimatedSection className="pb-20 sm:pb-32 px-6 sm:px-10">
          <div className="max-w-5xl mx-auto">
            <div
              className="rounded-3xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(250,218,221,0.15), rgba(232,223,245,0.15), rgba(147,181,225,0.1))',
                border: '1px solid rgba(232,223,245,0.2)',
              }}
            >
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-0">
                {/* Sol: İçerik */}
                <div className="p-8 sm:p-12 lg:p-14 flex flex-col justify-center">
                  <motion.div custom={0} variants={fadeUp}>
                    <div
                      className="w-12 h-12 rounded-2xl flex items-center justify-center mb-6"
                      style={{ background: 'linear-gradient(135deg, rgba(232,128,140,0.15), rgba(250,218,221,0.15))' }}
                    >
                      <FiHeart size={22} color="#E8808C" />
                    </div>
                    <h3
                      className="text-2xl sm:text-3xl font-bold mb-4"
                      style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
                    >
                      İlişkinizi
                      <br />
                      Güçlendirin
                    </h3>
                    <p className="text-sm sm:text-base leading-relaxed mb-8" style={{ color: '#9A949D' }}>
                      Planora sadece bir planlama aracı değil — ilişkinizi daha güçlü kılan bir arkadaş.
                      Kim neyi yapacak? Bu ay ne kadar harcadık? Yarın ne planımız var?
                      Tüm bu sorulara net cevaplar.
                    </p>
                    <div className="space-y-3">
                      {[
                        'Gerçek zamanlı senkronizasyon',
                        'Kişiselleştirilebilir temalar',
                        'Detaylı istatistikler',
                        'Güvenli Firebase altyapısı',
                      ].map((item, i) => (
                        <div key={i} className="flex items-center gap-3">
                          <div
                            className="w-5 h-5 rounded-full flex items-center justify-center shrink-0"
                            style={{ background: 'rgba(142,207,176,0.15)' }}
                          >
                            <div className="w-2 h-2 rounded-full" style={{ background: '#8ECFB0' }} />
                          </div>
                          <span className="text-sm" style={{ color: '#6E5A73' }}>
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </motion.div>
                </div>

                {/* Sağ: Mini feature mockups */}
                <div className="p-6 sm:p-10 lg:p-12 flex items-center">
                  <motion.div custom={1} variants={fadeUp} className="w-full space-y-4">
                    {/* Sürpriz kutusu mockup */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(232,223,245,0.2)',
                      }}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center"
                          style={{ background: 'rgba(250,218,221,0.3)' }}
                        >
                          <FiGift size={18} color="#E8808C" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>
                            Sürpriz Kutusu
                          </p>
                          <p className="text-[11px]" style={{ color: '#B8A9BC' }}>
                            Yeni bir sürpriz bırakıldı!
                          </p>
                        </div>
                      </div>
                      <div
                        className="rounded-xl p-3 text-center"
                        style={{ background: 'rgba(250,218,221,0.15)', border: '1px dashed rgba(232,128,140,0.2)' }}
                      >
                        <p className="text-sm" style={{ color: '#E8808C', fontFamily: "'Dancing Script', cursive" }}>
                          "Seni çok seviyorum! 💕"
                        </p>
                      </div>
                    </div>

                    {/* Görev mockup */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(232,223,245,0.2)',
                      }}
                    >
                      <p className="text-xs font-semibold mb-3" style={{ color: '#B8A0DC' }}>
                        Bugünkü Görevler
                      </p>
                      {[
                        { text: 'Market alışverişi', done: true },
                        { text: 'Akşam yemeği rezervasyonu', done: false },
                        { text: 'Çiçek al 🌸', done: false },
                      ].map((task, i) => (
                        <div key={i} className="flex items-center gap-3 py-2">
                          <div
                            className="w-5 h-5 rounded-md flex items-center justify-center shrink-0"
                            style={{
                              background: task.done ? '#8ECFB0' : 'transparent',
                              border: task.done ? 'none' : '2px solid rgba(184,160,220,0.3)',
                            }}
                          >
                            {task.done && (
                              <span className="text-white text-[10px]">✓</span>
                            )}
                          </div>
                          <span
                            className="text-sm"
                            style={{
                              color: task.done ? '#B8A9BC' : '#3D2C3E',
                              textDecoration: task.done ? 'line-through' : 'none',
                            }}
                          >
                            {task.text}
                          </span>
                        </div>
                      ))}
                    </div>

                    {/* Harcama mockup */}
                    <div
                      className="rounded-2xl p-5"
                      style={{
                        background: 'rgba(255,255,255,0.7)',
                        backdropFilter: 'blur(12px)',
                        border: '1px solid rgba(232,223,245,0.2)',
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-10 h-10 rounded-xl flex items-center justify-center"
                            style={{ background: 'rgba(142,207,176,0.15)' }}
                          >
                            <FiDollarSign size={18} color="#8ECFB0" />
                          </div>
                          <div>
                            <p className="text-sm font-semibold" style={{ color: '#3D2C3E' }}>
                              Bu Hafta
                            </p>
                            <p className="text-[11px]" style={{ color: '#B8A9BC' }}>
                              Ortak harcamalar
                            </p>
                          </div>
                        </div>
                        <p className="text-lg font-bold" style={{ color: '#3D2C3E' }}>
                          ₺840
                        </p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════
            CTA SECTION
        ═══════════════════════════════════════════ */}
        <AnimatedSection className="pb-20 sm:pb-32 px-6 sm:px-10">
          <motion.div custom={0} variants={fadeUp} className="max-w-3xl mx-auto text-center">
            <div
              className="rounded-3xl p-10 sm:p-16 relative overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, #B8A0DC, #E8808C, #FADADD)',
              }}
            >
              {/* Dekoratif elementler */}
              <div
                className="absolute top-0 left-0 w-full h-full opacity-10"
                style={{
                  backgroundImage: 'radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 20%, white 1px, transparent 1px)',
                  backgroundSize: '60px 60px',
                }}
              />

              <div className="relative z-10">
                <motion.div
                  animate={{ scale: [1, 1.1, 1] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                  className="text-4xl mb-6 inline-block"
                >
                  💕
                </motion.div>
                <h2
                  className="text-3xl sm:text-4xl font-bold mb-4"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#fff' }}
                >
                  Birlikte Planlamaya
                  <br />
                  Hazır mısınız?
                </h2>
                <p className="text-base sm:text-lg mb-8 opacity-90" style={{ color: '#fff' }}>
                  Planora ile ilişkinizi daha düzenli ve eğlenceli hale getirin.
                  <br className="hidden sm:block" />
                  Tamamen ücretsiz, hemen başlayın!
                </p>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => navigate('/login')}
                  className="inline-flex items-center gap-2.5 px-8 py-3.5 rounded-2xl text-base font-semibold cursor-pointer transition-all"
                  style={{
                    background: '#fff',
                    color: '#3D2C3E',
                    boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
                  }}
                >
                  <FiHeart size={18} />
                  Ücretsiz Kayıt Ol
                  <FiArrowRight size={16} />
                </motion.button>
              </div>
            </div>
          </motion.div>
        </AnimatedSection>

        {/* ═══════════════════════════════════════════
            FOOTER
        ═══════════════════════════════════════════ */}
        <footer className="py-10 text-center px-6">
          <div className="max-w-4xl mx-auto">
            <div className="w-10 h-px mx-auto mb-4" style={{ background: 'rgba(232,223,245,0.4)' }} />
            <p className="text-sm font-medium mb-1" style={{ color: '#6E5A73', fontFamily: "'Playfair Display', serif" }}>
              Planora
            </p>
            <p className="text-[11px] tracking-wide" style={{ color: '#D4C5EB' }}>
              Designed with love · Çiftler için yapıldı ✦
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
