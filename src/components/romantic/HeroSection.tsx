import { motion } from 'framer-motion'

export default function HeroSection() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center relative px-4">
      {/* Big Heart */}
      <motion.div
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1.2, ease: "easeOut" }}
        className="text-8xl md:text-9xl mb-8"
      >
        <motion.span
          animate={{ 
            scale: [1, 1.2, 1, 1.2, 1],
          }}
          transition={{ 
            duration: 1.5, 
            repeat: Infinity,
            repeatDelay: 1
          }}
          className="inline-block"
        >
          💖
        </motion.span>
      </motion.div>

      {/* Greeting */}
      <motion.h1
        initial={{ y: 30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.5 }}
        className="text-4xl md:text-6xl lg:text-7xl font-bold mb-4 text-center"
        style={{ fontFamily: "'Dancing Script', cursive" }}
      >
        <span className="text-gradient">Merhaba Güzelim</span> 💛
      </motion.h1>

      {/* Subtitle */}
      <motion.p
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.8, delay: 0.9 }}
        className="text-xl md:text-2xl text-pink-400 font-medium text-center max-w-xl"
        style={{ fontFamily: "'Quicksand', sans-serif" }}
      >
        Seni çok seviyorum ve sen benim için çok özelsin ✨
      </motion.p>

      {/* Decorative line */}
      <motion.div
        initial={{ width: 0 }}
        animate={{ width: '200px' }}
        transition={{ duration: 1, delay: 1.3 }}
        className="h-0.5 bg-gradient-to-r from-transparent via-pink-400 to-transparent mt-8"
      />

      {/* Scroll indicator */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 2 }}
        className="absolute bottom-10"
      >
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="text-pink-300 text-sm flex flex-col items-center gap-2"
        >
          <span>Aşağı kaydır</span>
          <span className="text-2xl">↓</span>
        </motion.div>
      </motion.div>
    </div>
  )
}
