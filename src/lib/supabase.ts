import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Database types
export interface GameSession {
  id: string
  created_at: string
  updated_at: string
  game_type: 'battleship'
  status: 'waiting' | 'active' | 'finished'
  current_player: number
  player1_board?: string // JSON stringified board state
  player2_board?: string
  player1_ships?: string // JSON stringified ship positions
  player2_ships?: string
  moves?: string // JSON stringified move history
  winner?: number
}

export interface BattleshipBoard {
  grid: number[][]
  ships: Ship[]
}

export interface Ship {
  id: string
  positions: { row: number; col: number }[]
  sunk: boolean
  size: number
}

export interface Move {
  player: number
  row: number
  col: number
  hit: boolean
  shipSunk?: string
  timestamp: string
}

