'use client'

import { useState, useEffect } from 'react'

interface ExplosionProps {
  isVisible: boolean
  onComplete: () => void
  position?: { row: number; col: number }
}

export default function Explosion({ isVisible, onComplete, position }: ExplosionProps) {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'exploding' | 'fading'>('hidden')

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('exploding')
      
      const timer1 = setTimeout(() => {
        setAnimationPhase('fading')
      }, 300)
      
      const timer2 = setTimeout(() => {
        setAnimationPhase('hidden')
        onComplete()
      }, 1000)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isVisible, onComplete])

  if (animationPhase === 'hidden') return null

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div 
        className={`explosion-container transition-all duration-300 ${
          animationPhase === 'exploding' 
            ? 'scale-100 opacity-100' 
            : animationPhase === 'fading'
            ? 'scale-150 opacity-0'
            : 'scale-0 opacity-0'
        }`}
      >
        {/* Main explosion */}
        <div className="relative">
          {/* Core explosion */}
          <div className="w-16 h-16 bg-yellow-400 rounded-full animate-pulse flex items-center justify-center">
            <div className="w-12 h-12 bg-orange-500 rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-500 rounded-full"></div>
            </div>
          </div>
          
          {/* Explosion rings */}
          <div className="absolute inset-0 w-16 h-16 border-4 border-yellow-300 rounded-full animate-ping"></div>
          <div className="absolute inset-0 w-20 h-20 border-2 border-orange-300 rounded-full animate-ping" style={{ animationDelay: '0.1s' }}></div>
          <div className="absolute inset-0 w-24 h-24 border border-red-300 rounded-full animate-ping" style={{ animationDelay: '0.2s' }}></div>
          
          {/* Debris particles */}
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 bg-yellow-400 rounded-full animate-bounce"
              style={{
                transform: `rotate(${i * 45}deg) translateX(40px)`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: '0.6s'
              }}
            />
          ))}
        </div>
        
        {/* Explosion text */}
        <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
          <div className="text-2xl font-bold text-red-600 animate-bounce">
            BOOM!
          </div>
        </div>
      </div>
    </div>
  )
}

// CSS animations (add to globals.css)
export const explosionStyles = `
@keyframes explosion-pulse {
  0% { transform: scale(0.8); opacity: 1; }
  50% { transform: scale(1.2); opacity: 0.8; }
  100% { transform: scale(1.5); opacity: 0; }
}

@keyframes explosion-debris {
  0% { transform: scale(1) rotate(0deg); opacity: 1; }
  100% { transform: scale(0.5) rotate(180deg); opacity: 0; }
}

.explosion-container {
  animation: explosion-pulse 1s ease-out forwards;
}
`
