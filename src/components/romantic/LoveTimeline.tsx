import { motion } from 'framer-motion'
import { useNavigate } from 'react-router-dom'

export default function LoveTimeline() {
  const navigate = useNavigate()

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
        Birlikte Planlarımız
      </motion.h2>

      <motion.p
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
        viewport={{ once: true }}
        className="text-center text-pink-400 mb-16 text-lg"
      >
        Geçmişimiz, bugünümüz ve geleceğimiz 💫
      </motion.p>

      {/* Timeline */}
      <div className="max-w-2xl mx-auto relative">
        {/* Line */}
        <div className="absolute left-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-pink-300 via-purple-300 to-pink-300 transform -translate-x-1/2" />

        {[
          { date: "İlk Gün", text: "Birbirimizi tanıdığımız o güzel gün... 🌸", side: "left" },
          { date: "Bugün", text: "Her geçen gün daha çok seviyorum seni 💖", side: "right" },
          { date: "Gelecek", text: "Birlikte atacağımız nice adımlar var 🌈", side: "left" },
        ].map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: item.side === 'left' ? -50 : 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6, delay: i * 0.2 }}
            viewport={{ once: true }}
            className={`relative flex items-center mb-16 ${
              item.side === 'left' ? 'justify-start' : 'justify-end'
            }`}
          >
            {/* Dot */}
            <div className="absolute left-1/2 w-4 h-4 rounded-full bg-pink-400 transform -translate-x-1/2 z-10 shadow-lg" />
            
            {/* Card */}
            <div className={`w-5/12 glass-card rounded-2xl p-6 shadow-lg border border-pink-100 ${
              item.side === 'right' ? 'ml-auto' : ''
            }`}>
              <p 
                className="text-pink-500 font-bold text-lg mb-2"
                style={{ fontFamily: "'Dancing Script', cursive" }}
              >
                {item.date}
              </p>
              <p className="text-love-text">{item.text}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* CTA Button */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.5 }}
        viewport={{ once: true }}
        className="text-center mt-12"
      >
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => navigate('/dashboard')}
          className="romantic-gradient text-white px-10 py-4 rounded-full text-lg font-semibold shadow-lg cursor-pointer"
          style={{ fontFamily: "'Quicksand', sans-serif" }}
        >
          Planlarımızı Görelim 💕
        </motion.button>
      </motion.div>
    </div>
  )
}
