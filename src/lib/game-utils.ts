import { supabase, GameSession } from './supabase'
import { BattleshipGame } from './battleship'
import { TicTacToe } from './tictactoe'

export function generateSessionId(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
}

export async function createGameSession(gameType: 'battleship' | 'tictactoe' = 'battleship'): Promise<string> {
  const sessionId = generateSessionId()
  
  if (gameType === 'tictactoe') {
    // Create tic-tac-toe game
    const game = new TicTacToe()
    
    const session: Omit<GameSession, 'id' | 'created_at' | 'updated_at'> = {
      game_type: gameType,
      status: 'active',
      current_player: 1,
      player1_board: game.toJSON(),
      player2_board: game.toJSON(), // Same board for both players
      moves: JSON.stringify([])
    }

    const { error } = await supabase
      .from('game_sessions')
      .insert({ id: sessionId, ...session })

    if (error) {
      throw new Error(`Failed to create game session: ${error.message}`)
    }

    return sessionId
  }
  
  // Create games with random ship placement
  const game1 = new BattleshipGame()
  const game2 = new BattleshipGame()
  
  const session: Omit<GameSession, 'id' | 'created_at' | 'updated_at'> = {
    game_type: gameType,
    status: 'active',
    current_player: 1,
    player1_board: game1.toJSON(),
    player2_board: game2.toJSON(),
    player1_ships: JSON.stringify(game1.getShips()),
    player2_ships: JSON.stringify(game2.getShips()),
    moves: JSON.stringify([])
  }

  const { error } = await supabase
    .from('game_sessions')
    .insert({ id: sessionId, ...session })

  if (error) {
    throw new Error(`Failed to create game session: ${error.message}`)
  }

  return sessionId
}

export async function getGameSession(sessionId: string): Promise<GameSession | null> {
  const { data, error } = await supabase
    .from('game_sessions')
    .select('*')
    .eq('id', sessionId)
    .single()

  if (error) {
    if (error.code === 'PGRST116') {
      return null // Session not found
    }
    throw new Error(`Failed to get game session: ${error.message}`)
  }

  return data
}

export async function updateGameSession(sessionId: string, updates: Partial<GameSession>): Promise<void> {
  const { error } = await supabase
    .from('game_sessions')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', sessionId)

  if (error) {
    throw new Error(`Failed to update game session: ${error.message}`)
  }
}

export async function joinGameSession(sessionId: string): Promise<boolean> {
  const session = await getGameSession(sessionId)
  
  if (!session) {
    return false
  }

  // Game is always active, player can join immediately
  return session.status === 'active'
}

export function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard) {
    return navigator.clipboard.writeText(text)
  } else {
    // Fallback for older browsers
    const textArea = document.createElement('textarea')
    textArea.value = text
    document.body.appendChild(textArea)
    textArea.select()
    document.execCommand('copy')
    document.body.removeChild(textArea)
    return Promise.resolve()
  }
}

