'use client'

import { useState, useEffect } from 'react'

interface HitExplosionProps {
  isVisible: boolean
  onComplete: () => void
  size?: 'small' | 'large'
  position?: { row: number; col: number }
}

export default function HitExplosion({ isVisible, onComplete, size = 'small', position }: HitExplosionProps) {
  const [animationPhase, setAnimationPhase] = useState<'hidden' | 'exploding' | 'fading'>('hidden')

  useEffect(() => {
    if (isVisible) {
      setAnimationPhase('exploding')
      
      const timer1 = setTimeout(() => {
        setAnimationPhase('fading')
      }, size === 'small' ? 200 : 400)
      
      const timer2 = setTimeout(() => {
        setAnimationPhase('hidden')
        onComplete()
      }, size === 'small' ? 600 : 1200)
      
      return () => {
        clearTimeout(timer1)
        clearTimeout(timer2)
      }
    }
  }, [isVisible, onComplete, size])

  if (animationPhase === 'hidden') return null

  const isLarge = size === 'large'
  const baseSize = isLarge ? 24 : 12
  const ringCount = isLarge ? 4 : 2

  return (
    <div className="fixed inset-0 pointer-events-none z-50 flex items-center justify-center">
      <div 
        className={`hit-explosion-container transition-all duration-300 ${
          isLarge ? 'large' : ''
        } ${
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
          <div 
            className={`bg-orange-400 rounded-full animate-pulse flex items-center justify-center ${
              isLarge ? 'w-24 h-24' : 'w-12 h-12'
            }`}
          >
            <div 
              className={`bg-red-500 rounded-full flex items-center justify-center ${
                isLarge ? 'w-20 h-20' : 'w-8 h-8'
              }`}
            >
              <div 
                className={`bg-yellow-400 rounded-full ${
                  isLarge ? 'w-16 h-16' : 'w-6 h-6'
                }`}
              ></div>
            </div>
          </div>
          
          {/* Explosion rings */}
          {Array.from({ length: ringCount }, (_, i) => (
            <div 
              key={i}
              className={`absolute inset-0 border-2 border-orange-300 rounded-full animate-ping ${
                isLarge ? 'w-24 h-24' : 'w-12 h-12'
              }`}
              style={{ 
                animationDelay: `${i * 0.1}s`,
                transform: `scale(${1 + i * 0.3})`
              }}
            />
          ))}
          
          {/* Debris particles */}
          {Array.from({ length: isLarge ? 12 : 6 }, (_, i) => (
            <div
              key={i}
              className="absolute w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
              style={{
                transform: `rotate(${i * (360 / (isLarge ? 12 : 6))}deg) translateX(${isLarge ? 20 : 10}px)`,
                animationDelay: `${i * 0.05}s`,
                animationDuration: '0.4s'
              }}
            />
          ))}
        </div>
        
        {/* Explosion text for large explosions */}
        {isLarge && (
          <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2">
            <div className="text-lg font-bold text-red-600 animate-bounce">
              BOOM!
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
