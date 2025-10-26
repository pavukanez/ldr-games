'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, GameSession } from '@/lib/supabase'
import { TicTacToe, GRID_SIZE } from '@/lib/tictactoe'
import { getGameSession, updateGameSession, copyToClipboard } from '@/lib/game-utils'
import VictoryModal from '@/app/components/VictoryModal'
import TicTacToeModal from '@/app/components/TicTacToeModal'

export default function TicTacToePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<GameSession | null>(null)
  const [playerNumber, setPlayerNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameLink, setGameLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [showVictoryModal, setShowVictoryModal] = useState(false)
  const [modalResult, setModalResult] = useState<'win' | 'lose' | 'draw'>('win')

  useEffect(() => {
    if (sessionId) {
      setGameLink(`${window.location.origin}/game/${sessionId}`)
      loadGameSession()
    }
  }, [sessionId])

  useEffect(() => {
    // Show victory modal when game is finished
    if (session?.status === 'finished' && playerNumber) {
      if (session.winner === 0) {
        // Draw
        setModalResult('draw')
      } else if (session.winner === playerNumber) {
        // Win
        setModalResult('win')
      } else {
        // Lose
        setModalResult('lose')
      }
      setShowVictoryModal(true)
    }
  }, [session?.status, session?.winner, playerNumber])

  useEffect(() => {
    if (session) {
      // Subscribe to real-time updates
      const channel = supabase
        .channel(`game-${sessionId}`)
        .on('postgres_changes', {
          event: 'UPDATE',
          schema: 'public',
          table: 'game_sessions',
          filter: `id=eq.${sessionId}`
        }, (payload) => {
          setSession(payload.new as GameSession)
        })
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
      }
    }
  }, [session, sessionId])

  const loadGameSession = async () => {
    try {
      const gameSession = await getGameSession(sessionId)
      
      if (!gameSession) {
        setError('Game session not found')
        return
      }

      setSession(gameSession)

      // Generate or retrieve a unique browser ID
      let browserId = localStorage.getItem('browser-id')
      if (!browserId) {
        browserId = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
        localStorage.setItem('browser-id', browserId)
      }

      // Check if this browser has already claimed a player slot
      if (gameSession.player1_id === browserId) {
        setPlayerNumber(1)
        localStorage.setItem(`player-${sessionId}`, '1')
      } else if (gameSession.player2_id === browserId) {
        setPlayerNumber(2)
        localStorage.setItem(`player-${sessionId}`, '2')
      } else {
        // This browser hasn't claimed a slot yet
        if (!gameSession.player1_id) {
          await updateGameSession(sessionId, { player1_id: browserId })
          setPlayerNumber(1)
          localStorage.setItem(`player-${sessionId}`, '1')
        } else if (!gameSession.player2_id) {
          await updateGameSession(sessionId, { player2_id: browserId })
          setPlayerNumber(2)
          localStorage.setItem(`player-${sessionId}`, '2')
        } else {
          setError('Game is full')
        }
      }

    } catch (err) {
      setError('Failed to load game session')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = async () => {
    try {
      await copyToClipboard(gameLink)
      setLinkCopied(true)
      setTimeout(() => setLinkCopied(false), 2000)
    } catch (err) {
      console.error('Failed to copy link:', err)
    }
  }

  const handleCellClick = async (row: number, col: number) => {
    if (!session || !playerNumber || session.status !== 'active') return
    if (session.current_player !== playerNumber) return

    try {
      const game = TicTacToe.fromJSON(session.player1_board!)
      
      // Make the move
      const success = game.makeMove(row, col, playerNumber as 1 | 2)
      if (!success) return

      // Update session
      const updates: Partial<GameSession> = {
        player1_board: game.toJSON(),
        player2_board: game.toJSON(), // Same board for both
        current_player: playerNumber === 1 ? 2 : 1
      }

      // Check for winner
      if (game.getWinner() !== 0) {
        updates.status = 'finished'
        updates.winner = game.getWinner()
      } else if (game.getIsDraw()) {
        updates.status = 'finished'
      }

      await updateGameSession(sessionId, updates)
    } catch (err) {
      console.error('Failed to make move:', err)
    }
  }

  const getCellState = (row: number, col: number): 0 | 1 | 2 => {
    if (!session?.player1_board) return 0
    const game = TicTacToe.fromJSON(session.player1_board)
    return game.getGrid()[row][col]
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Game not found'}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-purple-500 text-white px-6 py-2 rounded-lg hover:bg-purple-600"
          >
            Return Home
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6 bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Tic-Tac-Toe</h1>
            <p className="text-sm text-gray-600">Session: {sessionId.slice(0, 8)}...</p>
          </div>

          <button
            onClick={handleCopyLink}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              linkCopied 
                ? 'bg-green-500 text-white' 
                : 'bg-white/80 text-gray-700 hover:bg-white'
            }`}
          >
            {linkCopied ? '✓ Copied!' : '📋 Copy Link'}
          </button>
        </div>

        {/* Game Status */}
        <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 mb-6 shadow-lg">
          <div className="text-center">
            {session.status === 'active' && playerNumber && (
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  {session.current_player === playerNumber ? 'Your turn!' : 'Waiting for opponent...'}
                </p>
                <p className="text-sm text-gray-500">
                  You: Player {playerNumber} ({playerNumber === 1 ? '❌' : '⭕'}) • Turn: Player {session.current_player}
                </p>
              </div>
            )}
            
            {session.status === 'finished' && (
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  {session.winner === playerNumber ? '🎉 You won!' : session.winner ? '😢 You lost!' : '🤝 Draw!'}
                </p>
                <p className="text-sm text-gray-500">Game Over</p>
              </div>
            )}
          </div>
        </div>

        {/* Game Board */}
        {session.status === 'active' && playerNumber && (
          <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
            <div 
              className="grid gap-1 mx-auto"
              style={{ 
                gridTemplateColumns: `repeat(${GRID_SIZE}, minmax(0, 1fr))`,
                maxWidth: '800px'
              }}
            >
              {Array.from({ length: GRID_SIZE }, (_, row) =>
                Array.from({ length: GRID_SIZE }, (_, col) => {
                  const cellState = getCellState(row, col)
                  
                  return (
                    <div
                      key={`${row}-${col}`}
                      onClick={() => handleCellClick(row, col)}
                      className={`aspect-square flex items-center justify-center text-xs font-bold cursor-pointer transition-all border ${
                        cellState === 0 
                          ? 'bg-gray-100 hover:bg-gray-200 border-gray-300'
                          : cellState === 1
                          ? 'bg-red-100 border-red-300 cursor-default'
                          : 'bg-blue-100 border-blue-300 cursor-default'
                      }`}
                    >
                      {cellState === 1 ? '❌' : cellState === 2 ? '⭕' : ''}
                    </div>
                  )
                })
              )}
            </div>
          </div>
        )}

        {/* Victory Modal */}
        <TicTacToeModal
          isVisible={showVictoryModal}
          result={modalResult}
          onClose={() => setShowVictoryModal(false)}
        />
      </div>
    </div>
  )
}

