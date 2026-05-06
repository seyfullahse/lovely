import { useEffect, useState } from 'react'

export default function CursorHearts() {
  const [hearts, setHearts] = useState<{id: number; x: number; y: number; emoji: string}[]>([])

  useEffect(() => {
    let lastTime = 0

    const handleMouseMove = (e: MouseEvent) => {
      const now = Date.now()
      if (now - lastTime < 150) return // Throttle
      lastTime = now

      const id = now + Math.random()
      const heart = {
        id,
        x: e.clientX,
        y: e.clientY,
        emoji: ['💕', '💖', '✨', '💗', '🌸'][Math.floor(Math.random() * 5)]
      }

      setHearts(prev => [...prev.slice(-8), heart])

      setTimeout(() => {
        setHearts(prev => prev.filter(h => h.id !== id))
      }, 1500)
    }

    window.addEventListener('mousemove', handleMouseMove)
    return () => window.removeEventListener('mousemove', handleMouseMove)
  }, [])

  return (
    <>
      <style>{`
        @keyframes cursorHeart {
          0% {
            transform: translate(-50%, -50%) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 0.6;
          }
          100% {
            transform: translate(-50%, calc(-50% - 60px)) scale(1.2) rotate(20deg);
            opacity: 0;
          }
        }
      `}</style>
      {hearts.map(heart => (
        <div
          key={heart.id}
          className="fixed pointer-events-none select-none z-50"
          style={{
            left: heart.x,
            top: heart.y,
            fontSize: '16px',
            animation: 'cursorHeart 1.5s ease-out forwards'
          }}
        >
          {heart.emoji}
        </div>
      ))}
    </>
  )
}
