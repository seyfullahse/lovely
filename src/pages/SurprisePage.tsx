import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import FloatingHearts from '../components/romantic/FloatingHearts'
import CursorHearts from '../components/romantic/CursorHearts'

const loveMessages = [
  {
    text: "Bu sadece bir planlama uygulaması değil.",
    delay: 0
  },
  {
    text: "Bu, seninle kurduğum hayatın küçük bir yansıması.",
    delay: 0.8
  },
  {
    text: "Her tarih, her plan, her not…",
    delay: 1.6
  },
  {
    text: "Aslında sana olan sevgimin farklı bir hali.",
    delay: 2.4
  }
]

const loveCards = [
  {
    emoji: "✦",
    title: "Sen Çok Özelsin",
    text: "Hayatıma girdiğin günden beri her şey daha güzel. Seninle geçen her an bir hediye.",
  },
  {
    emoji: "◌",
    title: "Her Gün Seninle",
    text: "Seninle planladığımız her an, yaşadığımız her dakika kalbimde özel bir yere sahip.",
  },
  {
    emoji: "∞",
    title: "Sonsuz Sevgi",
    text: "Seni sevmek dünyanın en güzel hissi. Bu his sonsuza kadar sürecek.",
  },
  {
    emoji: "◊",
    title: "Gülüşün Her Şey",
    text: "Gülüşünü gördüğüm an tüm dertlerimi unutuyorum. Sen benim güneşimsin.",
  },
  {
    emoji: "△",
    title: "Birlikte Güçlüyüz",
    text: "Birlikte yapamayacağımız hiçbir şey yok. Sen yanımda olduğun sürece her şey mümkün.",
  },
  {
    emoji: "☽",
    title: "Hayallerimiz",
    text: "Seninle kurduğumuz hayaller birer birer gerçek oluyor. Her planımız bir macera.",
  }
]

function MessageReveal() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-6 relative">
      <div className="max-w-xl text-center space-y-6">
        {loveMessages.map((msg, i) => (
          <motion.p
            key={i}
            initial={{ opacity: 0, y: 20, filter: 'blur(8px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            transition={{ duration: 1.2, delay: msg.delay, ease: 'easeOut' }}
            viewport={{ once: true }}
            className="text-lg md:text-xl leading-relaxed"
            style={{ 
              fontFamily: "'Playfair Display', serif",
              color: i === loveMessages.length - 1 ? '#E8808C' : '#3D2C3E',
              fontStyle: i === loveMessages.length - 1 ? 'italic' : 'normal',
              fontWeight: i === loveMessages.length - 1 ? 500 : 400
            }}
          >
            {msg.text}
          </motion.p>
        ))}
      </div>
    </div>
  )
}

function LoveCardGrid() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})

  const toggleFlip = (index: number) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-semibold text-center mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
      >
        Sana Özel Notlar
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center mb-14 text-sm tracking-wide"
        style={{ color: '#B8A9BC' }}
      >
        Her karta tıkla ve sürprizini gör
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 max-w-5xl mx-auto">
        {loveCards.map((card, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            viewport={{ once: true }}
            whileHover={{ y: -4 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleFlip(i)}
            className="cursor-pointer"
            style={{ perspective: '1000px' }}
          >
            <motion.div
              animate={{ rotateY: flipped[i] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-56 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Ön yüz */}
              <div 
                className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/50 shadow-sm"
                style={{ 
                  backfaceVisibility: 'hidden',
                  background: 'rgba(255,255,255,0.6)',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <span className="text-3xl mb-4 block" style={{ color: '#B8A0DC' }}>{card.emoji}</span>
                <h3 
                  className="text-lg font-semibold mb-2"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
                >
                  {card.title}
                </h3>
                <p className="text-xs" style={{ color: '#B8A9BC' }}>Tıkla ve oku</p>
              </div>

              {/* Arka yüz */}
              <div 
                className="absolute inset-0 rounded-2xl p-6 flex flex-col items-center justify-center border border-white/50"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(250,218,221,0.4), rgba(232,223,245,0.4))',
                  backdropFilter: 'blur(12px)'
                }}
              >
                <p 
                  className="text-center leading-relaxed"
                  style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E', fontSize: '0.95rem' }}
                >
                  {card.text}
                </p>
                <span className="text-lg mt-4" style={{ color: '#E8808C' }}>♡</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

function Timeline() {
  const items = [
    { date: "İlk Gün", text: "Birbirimizi tanıdığımız o güzel gün...", side: "left" },
    { date: "Bugün", text: "Her geçen gün daha çok seviyorum seni", side: "right" },
    { date: "Gelecek", text: "Birlikte atacağımız nice adımlar var", side: "left" },
  ]

  return (
    <div className="py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="text-3xl md:text-4xl font-semibold text-center mb-3"
        style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
      >
        Bizim Hikayemiz
      </motion.h2>
      <motion.div
        initial={{ width: 0 }}
        whileInView={{ width: 40 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="h-px mx-auto mb-16"
        style={{ background: '#FADADD' }}
      />

      <div className="max-w-2xl mx-auto relative">
        {/* Merkez çizgi */}
        <div className="absolute left-1/2 top-0 bottom-0 w-px transform -translate-x-1/2"
          style={{ background: 'linear-gradient(to bottom, #FADADD, #E8DFF5, #FADADD)' }} />

        {items.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: item.side === 'left' ? -40 : 40 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: i * 0.15 }}
            viewport={{ once: true }}
            className={`relative flex items-center mb-16 ${item.side === 'left' ? 'justify-start' : 'justify-end'}`}
          >
            {/* Nokta */}
            <div className="absolute left-1/2 w-3 h-3 rounded-full transform -translate-x-1/2 z-10"
              style={{ background: '#FADADD', boxShadow: '0 0 12px rgba(250,218,221,0.5)' }} />
            
            {/* Kart */}
            <div className={`w-5/12 rounded-xl p-5 border border-white/50 ${item.side === 'right' ? 'ml-auto' : ''}`}
              style={{ background: 'rgba(255,255,255,0.6)', backdropFilter: 'blur(12px)' }}>
              <p className="font-semibold text-sm mb-1"
                style={{ fontFamily: "'Playfair Display', serif", color: '#E8808C' }}>
                {item.date}
              </p>
              <p className="text-sm" style={{ color: '#8A7B8E' }}>{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}

export default function SurprisePage() {
  const navigate = useNavigate()

  return (
    <div className="relative min-h-screen overflow-hidden" style={{ background: '#FDF6F0' }}>
      <FloatingHearts />
      <CursorHearts />

      {/* Arka plan */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] rounded-full opacity-[0.12]"
          style={{ background: 'radial-gradient(circle, #FADADD, transparent)' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] rounded-full opacity-[0.10]"
          style={{ background: 'radial-gradient(circle, #E8DFF5, transparent)' }} />
      </div>

      <div className="relative z-10 max-w-[1400px] mx-auto px-6 sm:px-10 lg:px-14 2xl:px-20">
        {/* Mesaj bölümü */}
        <MessageReveal />

        {/* Sevgi kartları */}
        <LoveCardGrid />

        {/* Timeline */}
        <Timeline />

        {/* Sonuç + geri butonu */}
        <div className="py-20 text-center px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="max-w-md mx-auto"
          >
            <motion.div
              animate={{ scale: [1, 1.08, 1] }}
              transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
              className="text-5xl mb-6 inline-block"
            >
              ♡
            </motion.div>
            
            <p 
              className="text-xl md:text-2xl italic mb-8"
              style={{ fontFamily: "'Playfair Display', serif", color: '#3D2C3E' }}
            >
              Seni çok seviyorum.
            </p>

            <div className="w-8 h-px mx-auto mb-6" style={{ background: '#FADADD' }} />

            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => navigate('/')}
              className="px-8 py-3 rounded-full text-sm font-medium cursor-pointer transition-all border"
              style={{ 
                background: 'rgba(250,218,221,0.3)',
                borderColor: 'rgba(250,218,221,0.5)',
                color: '#8A7B8E'
              }}
            >
              ← Planlarımıza Dönelim
            </motion.button>
          </motion.div>

          {/* Footer */}
          <div className="mt-20">
            <p className="text-xs tracking-widest" style={{ color: '#D4C5EB', letterSpacing: '0.2em' }}>
              Designed by us. Built with love.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
