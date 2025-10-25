'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGameSession } from '@/lib/game-utils'

export default function HomePage() {
  const [isCreating, setIsCreating] = useState(false)
  const router = useRouter()

  const handleCreateGame = async () => {
    setIsCreating(true)
    try {
      const sessionId = await createGameSession()
      router.push(`/game/${sessionId}`)
    } catch (error) {
      console.error('Failed to create game:', error)
      alert('Failed to create game. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex flex-col items-center justify-center p-4">
      {/* Header */}
      <div className="text-center mb-8 fade-in">
        <div className="flex items-center justify-center mb-4">
          <div className="text-6xl">💕</div>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-gray-800 mb-2">
          LDR Games
        </h1>
        <p className="text-lg text-gray-600 max-w-md">
          Play together, stay connected. Fun games designed for long-distance couples.
        </p>
      </div>

      {/* Game Selection */}
      <div className="w-full max-w-md space-y-4 fade-in">
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center mb-6">
            <div className="text-3xl mb-2">🚢</div>
            <h2 className="text-2xl font-semibold text-gray-800 mb-2">Battleship</h2>
            <p className="text-gray-600 text-sm">
              Classic naval warfare game. Sink your partner's ships!
            </p>
          </div>
          
          <button
            onClick={handleCreateGame}
            disabled={isCreating}
            className="w-full bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold py-4 px-6 rounded-xl hover:from-pink-600 hover:to-purple-700 transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
          >
            {isCreating ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                Creating Game...
              </div>
            ) : (
              'Create Game'
            )}
          </button>
        </div>

        {/* Coming Soon */}
        <div className="bg-white/40 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 opacity-60">
          <div className="text-center">
            <div className="text-3xl mb-2">🎮</div>
            <h2 className="text-xl font-semibold text-gray-700 mb-2">More Games Coming Soon</h2>
            <p className="text-gray-500 text-sm">
              Tic-tac-toe, Connect 4, and more games are on the way!
            </p>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Made with 💕 for couples who love to play together</p>
      </div>
    </div>
  )
}