import { useEffect, useState, useCallback } from 'react'

function Heart({ style }: { style: any }) {
  return (
    <div
      className="fixed pointer-events-none select-none"
      style={{
        ...style,
        fontSize: style.size || '20px',
        opacity: style.opacity || 0.6,
        animation: `floatUp ${style.duration || 8}s linear forwards`,
        zIndex: 0
      }}
    >
      {style.emoji || '💕'}
    </div>
  )
}

const heartEmojis = ['💕', '💖', '💗', '💝', '💘', '❤️', '💜', '🌸', '✨', '💫']

export default function FloatingHearts() {
  const [hearts, setHearts] = useState([])

  const createHeart = useCallback(() => {
    const id = Date.now() + Math.random()
    const heart = {
      id,
      style: {
        left: `${Math.random() * 100}%`,
        bottom: '-50px',
        size: `${Math.random() * 20 + 14}px`,
        opacity: Math.random() * 0.4 + 0.2,
        duration: Math.random() * 6 + 6,
        emoji: heartEmojis[Math.floor(Math.random() * heartEmojis.length)]
      }
    }
    setHearts(prev => [...prev.slice(-15), heart])

    setTimeout(() => {
      setHearts(prev => prev.filter(h => h.id !== id))
    }, (heart.style.duration) * 1000)
  }, [])

  useEffect(() => {
    // Initial hearts
    for (let i = 0; i < 5; i++) {
      setTimeout(createHeart, i * 800)
    }

    const interval = setInterval(createHeart, 2000)
    return () => clearInterval(interval)
  }, [createHeart])

  return (
    <>
      <style>{`
        @keyframes floatUp {
          0% {
            transform: translateY(0) rotate(0deg) scale(1);
            opacity: 0;
          }
          10% {
            opacity: 0.6;
          }
          50% {
            transform: translateY(-50vh) rotate(180deg) scale(1.2);
            opacity: 0.4;
          }
          100% {
            transform: translateY(-110vh) rotate(360deg) scale(0.5);
            opacity: 0;
          }
        }
      `}</style>
      {hearts.map(heart => (
        <Heart key={heart.id} style={heart.style} />
      ))}
    </>
  )
}
