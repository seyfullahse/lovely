import { motion } from 'framer-motion'
import { useState } from 'react'

const loveMessages = [
  {
    title: "Sen Çok Özelsin 💕",
    text: "Hayatıma girdiğin günden beri her şey daha güzel. Seninle geçen her an bir hediye.",
    emoji: "🌹"
  },
  {
    title: "Her Gün Seninle 🌟",
    text: "Seninle planladığımız her an, yaşadığımız her dakika kalbimde özel bir yere sahip.",
    emoji: "💫"
  },
  {
    title: "Birlikte Güçlüyüz 💪",
    text: "Birlikte yapamayacağımız hiçbir şey yok. Sen yanımda olduğun sürece her şey mümkün.",
    emoji: "🦋"
  },
  {
    title: "Gülüşün Her Şey 😊",
    text: "Gülüşünü gördüğüm an tüm dertlerimi unutuyorum. Sen benim güneşimsin.",
    emoji: "☀️"
  },
  {
    title: "Sonsuz Sevgi ♾️",
    text: "Seni sevmek dünyanın en güzel hissi. Bu his sonsuza kadar sürecek.",
    emoji: "💝"
  },
  {
    title: "Hayallerimiz 🌈",
    text: "Seninle kurduğumuz hayaller birer birer gerçek oluyor. Her planımız bir macera.",
    emoji: "🎠"
  }
]

export default function LoveCards() {
  const [flipped, setFlipped] = useState<Record<number, boolean>>({})

  const toggleFlip = (index: number) => {
    setFlipped(prev => ({ ...prev, [index]: !prev[index] }))
  }

  return (
    <div className="py-20 px-4">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="text-3xl md:text-5xl font-bold text-center mb-4 text-gradient"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        Sana Özel Notlar
      </motion.h2>
      
      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center text-pink-400 mb-12 text-lg"
      >
        Her karta tıkla ve sürprizini gör 💌
      </motion.p>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {loveMessages.map((msg, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            viewport={{ once: true }}
            whileHover={{ scale: 1.03, y: -5 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleFlip(i)}
            className="cursor-pointer perspective-1000"
          >
            <motion.div
              animate={{ rotateY: flipped[i] ? 180 : 0 }}
              transition={{ duration: 0.6 }}
              className="relative h-64 w-full"
              style={{ transformStyle: 'preserve-3d' }}
            >
              {/* Front */}
              <div 
                className="absolute inset-0 glass-card rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-pink-100"
                style={{ backfaceVisibility: 'hidden' }}
              >
                <span className="text-5xl mb-4">{msg.emoji}</span>
                <h3 
                  className="text-xl font-bold text-pink-500"
                  style={{ fontFamily: "'Dancing Script', cursive" }}
                >
                  {msg.title}
                </h3>
                <p className="text-pink-300 text-sm mt-2">Tıkla ve oku 💌</p>
              </div>

              {/* Back */}
              <div 
                className="absolute inset-0 glass-card rounded-2xl p-6 flex flex-col items-center justify-center shadow-lg border border-purple-100"
                style={{ 
                  backfaceVisibility: 'hidden', 
                  transform: 'rotateY(180deg)',
                  background: 'linear-gradient(135deg, rgba(236,72,153,0.1), rgba(192,132,252,0.1))'
                }}
              >
                <p className="text-center text-love-text leading-relaxed text-lg font-medium">
                  {msg.text}
                </p>
                <span className="text-3xl mt-4">💖</span>
              </div>
            </motion.div>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
