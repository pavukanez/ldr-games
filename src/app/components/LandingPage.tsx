'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createGameSession } from '@/lib/game-utils'

interface GamePanelProps {
  title: string
  description: string
  icon: string
  color: string
  hoverColor: string
  isAvailable: boolean
  onCreateGame: () => void
  isCreating: boolean
}

function GamePanel({ title, description, icon, color, hoverColor, isAvailable, onCreateGame, isCreating }: GamePanelProps) {
  return (
    <div className={`bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20 transition-all duration-200 ${
      isAvailable ? 'hover:shadow-xl hover:scale-105' : 'opacity-60'
    }`}>
      <div className="text-center">
        <div className="text-4xl mb-3">{icon}</div>
        <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-600 text-sm mb-4">{description}</p>
        
        {isAvailable ? (
          <button
            onClick={onCreateGame}
            disabled={isCreating}
            className={`w-full ${color} text-white font-semibold py-3 px-6 rounded-xl hover:${hoverColor} transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg`}
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
        ) : (
          <div className="w-full bg-gray-300 text-gray-600 font-semibold py-3 px-6 rounded-xl cursor-not-allowed">
            Coming Soon
          </div>
        )}
      </div>
    </div>
  )
}

export default function LandingPage() {
  const [creatingGame, setCreatingGame] = useState<string | null>(null)
  const [roomId, setRoomId] = useState('')
  const [isJoining, setIsJoining] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()

  const handleCreateGame = async (gameType: 'battleship' | 'tictactoe') => {
    setCreatingGame(gameType)
    setError('')

    try {
      const sessionId = await createGameSession(gameType)
      
      // Redirect to the game room
      router.push(`/game/${sessionId}`)
    } catch (err) {
      setError('Failed to create game. Please try again.')
      console.error('Failed to create game:', err)
    } finally {
      setCreatingGame(null)
    }
  }

  const handleJoinRoom = async () => {
    if (!roomId.trim()) {
      setError('Please enter a room ID')
      return
    }

    setIsJoining(true)
    setError('')

    try {
      // Redirect to the game room
      router.push(`/game/${roomId.trim()}`)
    } catch (err) {
      setError('Failed to join room. Please check the room ID.')
      console.error('Failed to join room:', err)
    } finally {
      setIsJoining(false)
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
      <div className="w-full max-w-6xl space-y-6 fade-in">
        {/* Available Games */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <GamePanel
            title="Battleship"
            description="Classic naval warfare game. Sink your partner's ships!"
            icon="🚢"
            color="bg-gradient-to-r from-blue-500 to-blue-600"
            hoverColor="from-blue-600 to-blue-700"
            isAvailable={true}
            onCreateGame={() => handleCreateGame('battleship')}
            isCreating={creatingGame === 'battleship'}
          />
          
          <GamePanel
            title="Tic-Tac-Toe"
            description="15x15 grid game. Get five in a row to win!"
            icon="⭕"
            color="bg-gradient-to-r from-green-500 to-green-600"
            hoverColor="from-green-600 to-green-700"
            isAvailable={true}
            onCreateGame={() => handleCreateGame('tictactoe')}
            isCreating={creatingGame === 'tictactoe'}
          />
          
          <GamePanel
            title="Connect 4"
            description="Drop discs to connect four in a row vertically, horizontally, or diagonally."
            icon="🔴"
            color="bg-gradient-to-r from-red-500 to-red-600"
            hoverColor="from-red-600 to-red-700"
            isAvailable={false}
            onCreateGame={() => {}}
            isCreating={false}
          />
          
          <GamePanel
            title="Chess"
            description="The classic strategy game. Checkmate your opponent's king!"
            icon="♟️"
            color="bg-gradient-to-r from-purple-500 to-purple-600"
            hoverColor="from-purple-600 to-purple-700"
            isAvailable={false}
            onCreateGame={() => {}}
            isCreating={false}
          />
          
          <GamePanel
            title="Checkers"
            description="Jump and capture pieces to become king!"
            icon="🔴"
            color="bg-gradient-to-r from-orange-500 to-orange-600"
            hoverColor="from-orange-600 to-orange-700"
            isAvailable={false}
            onCreateGame={() => {}}
            isCreating={false}
          />
          
          <GamePanel
            title="Snake"
            description="Control the snake, eat food, and avoid hitting walls or yourself!"
            icon="🐍"
            color="bg-gradient-to-r from-emerald-500 to-emerald-600"
            hoverColor="from-emerald-600 to-emerald-700"
            isAvailable={false}
            onCreateGame={() => {}}
            isCreating={false}
          />
        </div>

        {/* Join Room Section */}
        <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-2">Join Existing Room</h2>
            <p className="text-gray-600 text-sm mb-4">
              Have a room ID? Enter it below to join an existing game
            </p>
            
            {/* Error Message */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 border border-red-300 text-red-700 rounded-lg text-sm">
                {error}
              </div>
            )}
            
            <div className="flex gap-3 max-w-md mx-auto">
              <input
                type="text"
                value={roomId}
                onChange={(e) => setRoomId(e.target.value)}
                placeholder="Enter room ID"
                className="flex-1 px-4 py-3 rounded-lg border-2 border-gray-200 focus:border-pink-300 focus:outline-none transition-colors"
              />
              <button
                onClick={handleJoinRoom}
                disabled={isJoining || creatingGame !== null}
                className="bg-pink-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-pink-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {isJoining ? 'Joining...' : 'Join'}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="mt-12 text-center text-gray-500 text-sm">
        <p>Made with 💕 for couples who love to play together</p>
        <p className="mt-2">More games coming soon!</p>
      </div>
    </div>
  )
}
