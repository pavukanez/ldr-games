export const GRID_SIZE = 15
export const WIN_LENGTH = 5

export interface TicTacToeMove {
  row: number
  col: number
  player: 1 | 2
}

export interface TicTacToeGame {
  grid: (1 | 2 | 0)[][] // 0 = empty, 1 = player 1, 2 = player 2
  moves: TicTacToeMove[]
  winner: 1 | 2 | 0 // 0 = no winner yet
  isDraw: boolean
}

export class TicTacToe {
  private grid: (1 | 2 | 0)[][]
  private moves: TicTacToeMove[] = []
  private winner: 1 | 2 | 0 = 0
  private isDraw: boolean = false

  constructor() {
    this.grid = Array(GRID_SIZE).fill(null).map(() => Array(GRID_SIZE).fill(0))
  }

  public getGrid(): (1 | 2 | 0)[][] {
    return this.grid
  }

  public getMoves(): TicTacToeMove[] {
    return this.moves
  }

  public getWinner(): 1 | 2 | 0 {
    return this.winner
  }

  public getIsDraw(): boolean {
    return this.isDraw
  }

  public isGameOver(): boolean {
    return this.winner !== 0 || this.isDraw
  }

  public makeMove(row: number, col: number, player: 1 | 2): boolean {
    // Check if game is already over
    if (this.isGameOver()) return false

    // Check if position is valid
    if (row < 0 || row >= GRID_SIZE || col < 0 || col >= GRID_SIZE) return false

    // Check if position is already taken
    if (this.grid[row][col] !== 0) return false

    // Make the move
    this.grid[row][col] = player
    this.moves.push({ row, col, player })

    // Check for winner
    if (this.checkWinner(row, col, player)) {
      this.winner = player
      return true
    }

    // Check for draw (all cells filled)
    if (this.moves.length === GRID_SIZE * GRID_SIZE) {
      this.isDraw = true
    }

    return true
  }

  private checkWinner(row: number, col: number, player: 1 | 2): boolean {
    // Check all four directions: horizontal, vertical, diagonal1, diagonal2
    return (
      this.checkDirection(row, col, player, 0, 1) || // Horizontal
      this.checkDirection(row, col, player, 1, 0) || // Vertical
      this.checkDirection(row, col, player, 1, 1) || // Diagonal \
      this.checkDirection(row, col, player, 1, -1)   // Diagonal /
    )
  }

  private checkDirection(row: number, col: number, player: 1 | 2, dRow: number, dCol: number): boolean {
    let count = 1 // Count the current piece

    // Check positive direction
    let r = row + dRow
    let c = col + dCol
    while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && this.grid[r][c] === player) {
      count++
      r += dRow
      c += dCol
    }

    // Check negative direction
    r = row - dRow
    c = col - dCol
    while (r >= 0 && r < GRID_SIZE && c >= 0 && c < GRID_SIZE && this.grid[r][c] === player) {
      count++
      r -= dRow
      c -= dCol
    }

    return count >= WIN_LENGTH
  }

  public toJSON(): string {
    return JSON.stringify({
      grid: this.grid,
      moves: this.moves,
      winner: this.winner,
      isDraw: this.isDraw
    })
  }

  public static fromJSON(json: string): TicTacToe {
    const data = JSON.parse(json)
    const game = new TicTacToe()
    game.grid = data.grid
    game.moves = data.moves || []
    game.winner = data.winner || 0
    game.isDraw = data.isDraw || false
    return game
  }
}

