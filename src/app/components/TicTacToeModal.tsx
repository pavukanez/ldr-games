'use client'

import { useEffect, useState } from 'react'

interface TicTacToeModalProps {
  isVisible: boolean
  result: 'win' | 'lose' | 'draw'
  onClose?: () => void
}

export default function TicTacToeModal({ isVisible, result, onClose }: TicTacToeModalProps) {
  const [confetti, setConfetti] = useState<Array<{ id: number; left: number; delay: number; duration: number }>>([])

  useEffect(() => {
    if (isVisible && result === 'win') {
      // Generate confetti pieces
      const pieces = Array.from({ length: 50 }, (_, i) => ({
        id: i,
        left: Math.random() * 100,
        delay: Math.random() * 0.5,
        duration: 2 + Math.random() * 2
      }))
      setConfetti(pieces)
    }
  }, [isVisible, result])

  if (!isVisible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Darkened Background */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm animate-fadeIn"
        onClick={onClose}
      />

      {/* Confetti */}
      {result === 'win' && confetti.map((piece) => (
        <div
          key={piece.id}
          className="absolute top-0 w-2 h-2 animate-confetti"
          style={{
            left: `${piece.left}%`,
            animationDelay: `${piece.delay}s`,
            animationDuration: `${piece.duration}s`,
            backgroundColor: ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899'][piece.id % 5]
          }}
        />
      ))}

      {/* Modal Content */}
      <div className="relative bg-white rounded-2xl p-8 shadow-2xl max-w-md w-full mx-4 animate-scaleIn">
        <div className="text-center">
          {/* Icon */}
          <div className="mb-6">
            {result === 'win' ? (
              <div className="text-7xl animate-bounce">🎉</div>
            ) : result === 'lose' ? (
              <div className="text-7xl">😢</div>
            ) : (
              <div className="text-7xl">🤝</div>
            )}
          </div>

          {/* Message */}
          <h2 className="text-3xl font-bold mb-4">
            {result === 'win' ? (
              <span className="bg-gradient-to-r from-green-400 via-blue-500 to-purple-600 text-transparent bg-clip-text">
                Victory!
              </span>
            ) : result === 'lose' ? (
              <span className="text-gray-700">Game Over</span>
            ) : (
              <span className="bg-gradient-to-r from-yellow-400 to-orange-500 text-transparent bg-clip-text">
                Draw!
              </span>
            )}
          </h2>

          <p className="text-lg text-gray-600 mb-6">
            {result === 'win' 
              ? "Congratulations! You got 5 in a row!"
              : result === 'lose'
              ? "Better luck next time! Your opponent got 5 in a row."
              : "The board is full and no one got 5 in a row. It's a tie!"}
          </p>

          {/* Action Button */}
          <button
            onClick={() => window.location.href = '/'}
            className={`w-full py-3 px-6 rounded-xl font-semibold text-white transition-all transform hover:scale-105 ${
              result === 'win' 
                ? 'bg-gradient-to-r from-green-500 to-blue-600 hover:from-green-600 hover:to-blue-700'
                : result === 'lose'
                ? 'bg-gray-600 hover:bg-gray-700'
                : 'bg-gradient-to-r from-yellow-500 to-orange-600 hover:from-yellow-600 hover:to-orange-700'
            }`}
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  )
}

