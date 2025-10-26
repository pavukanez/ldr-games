'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { supabase, GameSession } from '@/lib/supabase'
import { BattleshipGame, BOARD_SIZE, SHIP_COLORS, SHIP_BORDER_COLORS } from '@/lib/battleship'
import { getGameSession, updateGameSession, copyToClipboard } from '@/lib/game-utils'
import ShipTracker from '@/app/components/ShipTracker'
import HitExplosion from '@/app/components/HitExplosion'

export default function GamePage() {
  const params = useParams()
  const router = useRouter()
  const sessionId = params.sessionId as string

  const [session, setSession] = useState<GameSession | null>(null)
  const [playerNumber, setPlayerNumber] = useState<number | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [gameLink, setGameLink] = useState('')
  const [linkCopied, setLinkCopied] = useState(false)
  const [showExplosion, setShowExplosion] = useState(false)
  const [lastDestroyedShip, setLastDestroyedShip] = useState<string | null>(null)
  const [hitExplosion, setHitExplosion] = useState<{ show: boolean; size: 'small' | 'large' }>({ show: false, size: 'small' })

  useEffect(() => {
    if (sessionId) {
      setGameLink(`${window.location.origin}/game/${sessionId}`)
      loadGameSession()
    }
  }, [sessionId])

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
        // Try to claim player 1 first, then player 2
        if (!gameSession.player1_id) {
          // Claim player 1 slot
          await updateGameSession(sessionId, { player1_id: browserId })
          setPlayerNumber(1)
          localStorage.setItem(`player-${sessionId}`, '1')
        } else if (!gameSession.player2_id) {
          // Claim player 2 slot
          await updateGameSession(sessionId, { player2_id: browserId })
          setPlayerNumber(2)
          localStorage.setItem(`player-${sessionId}`, '2')
        } else {
          // Both slots are taken, this shouldn't happen
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

  const handleJoinGame = async () => {
    if (!session) return

    try {
      const success = await joinGameSession(sessionId)
      if (success) {
        // Set as player 2
        setPlayerNumber(2)
        localStorage.setItem(`player-${sessionId}`, '2')
      }
    } catch (err) {
      console.error('Failed to join game:', err)
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
      // Get opponent's board
      const opponentBoard = playerNumber === 1 ? session.player2_board : session.player1_board
      if (!opponentBoard) return

      const game = BattleshipGame.fromJSON(opponentBoard)
      const result = game.makeMove(row, col, playerNumber)

      // Show explosion if ship was destroyed
      if (result.shipSunk) {
        setLastDestroyedShip(result.shipSunk)
        setShowExplosion(true)
        setHitExplosion({ show: true, size: 'large' })
      } else if (result.hit) {
        setHitExplosion({ show: true, size: 'small' })
      }

      // Update the session
      const boardKey = playerNumber === 1 ? 'player2_board' : 'player1_board'
      const moves = JSON.parse(session.moves || '[]')
      moves.push({
        player: playerNumber,
        row,
        col,
        hit: result.hit,
        shipSunk: result.shipSunk,
        timestamp: new Date().toISOString()
      })

      const updates: Partial<GameSession> = {
        [boardKey]: game.toJSON(),
        moves: JSON.stringify(moves),
        // Only switch players if it was a miss
        current_player: result.hit ? playerNumber : (playerNumber === 1 ? 2 : 1)
      }

      if (result.gameOver) {
        updates.status = 'finished'
        updates.winner = playerNumber
      }

      await updateGameSession(sessionId, updates)
    } catch (err) {
      console.error('Failed to make move:', err)
    }
  }

  const getCellState = (row: number, col: number): 'empty' | 'hit' | 'miss' | 'ship' => {
    if (!session || !playerNumber) return 'empty'

    const opponentBoard = playerNumber === 1 ? session.player2_board : session.player1_board
    if (!opponentBoard) return 'empty'

    const game = BattleshipGame.fromJSON(opponentBoard)
    const moves = JSON.parse(session.moves || '[]')
    
    const move = moves.find((m: any) => m.row === row && m.col === col)
    if (move) {
      return move.hit ? 'hit' : 'miss'
    }

    return 'empty'
  }

  const getDestroyedEnemyShips = () => {
    if (!session || !playerNumber) return []
    
    const opponentBoard = playerNumber === 1 ? session.player2_board : session.player1_board
    if (!opponentBoard) return []
    
    const game = BattleshipGame.fromJSON(opponentBoard)
    return game.getShips().filter(ship => ship.sunk)
  }

  const getEnemyShips = () => {
    if (!session || !playerNumber) return []
    
    const opponentBoard = playerNumber === 1 ? session.player2_board : session.player1_board
    if (!opponentBoard) return []
    
    const game = BattleshipGame.fromJSON(opponentBoard)
    return game.getShips()
  }

  const getCurrentPlayerGame = () => {
    if (!session || !playerNumber) return null
    
    const currentBoard = playerNumber === 1 ? session.player1_board : session.player2_board
    if (!currentBoard) return null
    
    return BattleshipGame.fromJSON(currentBoard)
  }

  const getShipColor = (size: number) => {
    const index = [5, 4, 3, 3, 2].indexOf(size)
    return index >= 0 ? SHIP_COLORS[index] : 'bg-gray-200'
  }

  const getShipBorderColor = (size: number) => {
    const index = [5, 4, 3, 3, 2].indexOf(size)
    return index >= 0 ? SHIP_BORDER_COLORS[index] : 'border-gray-300'
  }

  const getPlayerOwnBoardState = (row: number, col: number): { type: 'empty' | 'ship' | 'hit' | 'miss', ship?: any } => {
    if (!session || !playerNumber) return { type: 'empty' }

    const currentBoard = playerNumber === 1 ? session.player1_board : session.player2_board
    if (!currentBoard) return { type: 'empty' }

    const game = BattleshipGame.fromJSON(currentBoard)
    const moves = JSON.parse(session.moves || '[]')
    
    // Check if this cell has a ship
    const ship = game.getShips().find(s => 
      s.positions.some(pos => pos.row === row && pos.col === col)
    )
    
    if (ship) {
      // Check if this ship position was hit by opponent
      const move = moves.find((m: any) => m.row === row && m.col === col && m.player !== playerNumber)
      return { type: move ? 'hit' : 'ship', ship }
    }
    
    // Check if opponent missed here
    const missMove = moves.find((m: any) => m.row === row && m.col === col && m.player !== playerNumber && !m.hit)
    return { type: missMove ? 'miss' : 'empty' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading game...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="text-6xl mb-4">😢</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Oops!</h1>
          <p className="text-gray-600 mb-4">{error}</p>
          <button
            onClick={() => router.push('/')}
            className="bg-pink-500 text-white px-6 py-2 rounded-lg hover:bg-pink-600 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    )
  }

  if (!session) return null

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <button
            onClick={() => router.push('/')}
            className="text-gray-600 hover:text-gray-800 transition-colors"
          >
            ← Back to Home
          </button>
          
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-800">🚢 Battleship</h1>
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
                  Player {playerNumber} • Turn: Player {session.current_player}
                </p>
              </div>
            )}
            
            {session.status === 'finished' && (
              <div>
                <p className="text-lg text-gray-700 mb-2">
                  {session.winner === playerNumber ? '🎉 You won!' : '😢 You lost!'}
                </p>
                <p className="text-sm text-gray-500">Game Over</p>
              </div>
            )}
          </div>
        </div>

        {/* Enemy Fleet Status */}
        {session.status === 'active' && playerNumber && (
          <div className="mb-6">
            <ShipTracker
              destroyedShips={getDestroyedEnemyShips()}
              enemyShips={getEnemyShips()}
            />
          </div>
        )}

        {/* Game Boards */}
        {session.status === 'active' && playerNumber && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Player's Own Map */}
            <div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Your Fleet
                </h2>
                <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
                  {Array.from({ length: BOARD_SIZE }, (_, row) =>
                    Array.from({ length: BOARD_SIZE }, (_, col) => {
                      const cellState = getPlayerOwnBoardState(row, col)
                      const { type, ship } = cellState
                      
                      let cellClasses = 'game-cell w-8 h-8 rounded-xl border-2 transition-all duration-200 '
                      let cellContent = ''
                      
                      if (type === 'ship' && ship) {
                        const shipColor = getShipColor(ship.size)
                        const borderColor = getShipBorderColor(ship.size)
                        cellClasses += `${shipColor} ${borderColor}`
                        cellContent = '●'
                      } else if (type === 'hit') {
                        cellClasses += 'bg-red-200 border-red-300'
                        cellContent = '●'
                      } else if (type === 'miss') {
                        cellClasses += 'bg-gray-200 border-gray-300'
                        cellContent = '○'
                      } else {
                        cellClasses += 'bg-pink-50 border-pink-100'
                      }
                      
                      return (
                        <div
                          key={`own-${row}-${col}`}
                          className={cellClasses}
                        >
                          {cellContent}
                        </div>
                      )
                    })
                  )}
                </div>
              </div>
            </div>

            {/* Opponent's Map */}
            <div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
                <h2 className="text-xl font-semibold text-gray-800 mb-4 text-center">
                  Attack Grid
                </h2>
                <div className="grid grid-cols-10 gap-1 max-w-md mx-auto">
                  {Array.from({ length: BOARD_SIZE }, (_, row) =>
                    Array.from({ length: BOARD_SIZE }, (_, col) => {
                      const state = getCellState(row, col)
                      return (
                        <button
                          key={`attack-${row}-${col}`}
                          onClick={() => handleCellClick(row, col)}
                          disabled={session.current_player !== playerNumber || state !== 'empty'}
                          className={`game-cell w-8 h-8 rounded-xl border-2 transition-all duration-200 ${
                            state === 'hit' 
                              ? 'bg-pink-200 border-pink-300 scale-110' 
                              : state === 'miss'
                              ? 'bg-gray-200 border-gray-300'
                              : 'bg-pink-50 border-pink-100 hover:bg-pink-100 active:scale-95'
                          } ${session.current_player !== playerNumber || state !== 'empty' ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}
                        >
                          {state === 'hit' && '●'}
                          {state === 'miss' && '○'}
                        </button>
                      )
                    })
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Explosion Animations */}
        <HitExplosion
          isVisible={hitExplosion.show}
          onComplete={() => setHitExplosion({ show: false, size: 'small' })}
          size={hitExplosion.size}
        />
      </div>
    </div>
  )
}

async function joinGameSession(sessionId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error || !data) return false

  if (data.status === 'waiting') {
    await supabase
      .from('game_sessions')
      .update({ status: 'active', updated_at: new Date().toISOString() })
      .eq('id', sessionId)
    return true
  }

  return data.status === 'active'
}
