'use client'

import { useEffect, useState } from 'react'

interface VictoryModalProps {
  isVisible: boolean
  isWinner: boolean
  onClose?: () => void
}

export default function VictoryModal({ isVisible, isWinner, onClose }: VictoryModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    if (isVisible && isWinner) {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2
      }))
      setConfetti(pieces)
    }
  }, [isVisible, isWinner])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darkened Background */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Confetti */}
      {isWinner && confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-2 h-2 animate-confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: ['#fbbf24', '#f472b6', '#a78bfa', '#34d399', '#60a5fa'][piece.id % 5]
          }}
        />
      ))}

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6">
            {isWinner ? (
              <div className="text-7xl animate-bounce">🎉</div>
            ) : (
              <div className="text-7xl">😢</div>
            )}
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold mb-4">
            {isWinner ? (
              <span className="bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 text-transparent bg-clip-text">
                Victory!
              </span>
            ) : (
              <span className="text-gray-700">Game Over</span>
            )}
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            {isWinner 
              ? "Congratulations! You've destroyed all enemy ships!"
              : "Better luck next time! All your ships were destroyed."}
          </p>

          {/* Action Button */}
          <button
            onClick={() => window.location.href = '/'}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
              isWinner 
                ? 'bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700'
                : 'bg-gray-600 hover:bg-gray-700'
            }`}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

