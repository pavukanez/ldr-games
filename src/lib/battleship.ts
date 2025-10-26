import { Ship, BattleshipBoard, Move } from './supabase'

export const BOARD_SIZE = 10
export const SHIP_SIZES = [5, 4, 3, 3, 2] // Carrier, Battleship, Cruiser, Submarine, Destroyer
export const SHIP_NAMES = ['Carrier', 'Battleship', 'Cruiser', 'Submarine', 'Destroyer']
export const SHIP_COLORS = [
  'bg-pink-200',     // Carrier (5)
  'bg-blue-200',     // Battleship (4)
  'bg-emerald-200',    // Cruiser (3)
  'bg-red-200',    // Submarine (3)
  'bg-purple-200'    // Destroyer (2)
]
export const SHIP_BORDER_COLORS = [
  'border-pink-300',     // Carrier
  'border-blue-300',    // Battleship
  'border-emerald-300',   // Cruiser
  'border-red-300',   // Submarine
  'border-purple-300'   // Destroyer
]

export class BattleshipGame {
  private board: BattleshipBoard
  private moves: Move[] = []
  private setupComplete: boolean = false

  constructor() {
    this.board = {
      grid: Array(BOARD_SIZE).fill(null).map(() => Array(BOARD_SIZE).fill(0)),
      ships: []
    }
    this.placeShips()
    this.setupComplete = true
  }

  private placeShips(): void {
    const ships: Ship[] = []
    
    SHIP_SIZES.forEach((size, index) => {
      let placed = false
      let attempts = 0
      
      while (!placed && attempts < 100) {
        const horizontal = Math.random() < 0.5
        const startRow = Math.floor(Math.random() * BOARD_SIZE)
        const startCol = Math.floor(Math.random() * BOARD_SIZE)
        
        if (this.canPlaceShip(startRow, startCol, size, horizontal)) {
          const positions = []
          for (let i = 0; i < size; i++) {
            const row = horizontal ? startRow : startRow + i
            const col = horizontal ? startCol + i : startCol
            positions.push({ row, col })
            this.board.grid[row][col] = 1
          }
          
          ships.push({
            id: `ship-${index}`,
            positions,
            sunk: false,
            size
          })
          placed = true
        }
        attempts++
      }
    })
    
    this.board.ships = ships
  }

  public canPlaceShip(startRow: number, startCol: number, size: number, horizontal: boolean): boolean {
    if (horizontal) {
      if (startCol + size > BOARD_SIZE) return false
      for (let i = 0; i < size; i++) {
        if (this.board.grid[startRow][startCol + i] !== 0) return false
      }
    } else {
      if (startRow + size > BOARD_SIZE) return false
      for (let i = 0; i < size; i++) {
        if (this.board.grid[startRow + i][startCol] !== 0) return false
      }
    }
    return true
  }

  public makeMove(row: number, col: number, player: number): { hit: boolean; shipSunk?: string; gameOver: boolean } {
    if (row < 0 || row >= BOARD_SIZE || col < 0 || col >= BOARD_SIZE) {
      throw new Error('Invalid coordinates')
    }

    // Check if this cell was already hit
    const existingMove = this.moves.find(m => m.row === row && m.col === col)
    if (existingMove) {
      throw new Error('Cell already hit')
    }

    const hit = this.board.grid[row][col] === 1
    let shipSunk: string | undefined

    if (hit) {
      // Mark the cell as hit
      this.board.grid[row][col] = 2
      
      // Check if any ship is sunk
      const ship = this.board.ships.find(s => 
        s.positions.some(p => p.row === row && p.col === col)
      )
      
      if (ship) {
        const allPositionsHit = ship.positions.every(pos => 
          this.board.grid[pos.row][pos.col] === 2
        )
        
        if (allPositionsHit && !ship.sunk) {
          ship.sunk = true
          shipSunk = ship.id
        }
      }
    } else {
      // Mark as miss
      this.board.grid[row][col] = 3
    }

    const move: Move = {
      player,
      row,
      col,
      hit,
      shipSunk,
      timestamp: new Date().toISOString()
    }

    this.moves.push(move)

    const gameOver = this.board.ships.every(ship => ship.sunk)

    return { hit, shipSunk, gameOver }
  }

  public getBoard(): BattleshipBoard {
    return this.board
  }

  public getMoves(): Move[] {
    return this.moves
  }

  public getShips(): Ship[] {
    return this.board.ships
  }

  public getShipsRemaining(): number {
    return this.board.ships.filter(ship => !ship.sunk).length
  }

  public isSetupComplete(): boolean {
    return this.setupComplete
  }

  public getAvailableShips(): { size: number; name: string; placed: boolean }[] {
    return SHIP_SIZES.map((size, index) => ({
      size,
      name: SHIP_NAMES[index],
      placed: this.board.ships.some(ship => ship.size === size)
    }))
  }

  public placeShip(startRow: number, startCol: number, size: number, horizontal: boolean): boolean {
    if (this.setupComplete) return false
    
    // Check if ship of this size is already placed
    if (this.board.ships.some(ship => ship.size === size)) return false
    
    if (!this.canPlaceShip(startRow, startCol, size, horizontal)) return false
    
    const positions = []
    for (let i = 0; i < size; i++) {
      const row = horizontal ? startRow : startRow + i
      const col = horizontal ? startCol + i : startCol
      positions.push({ row, col })
      this.board.grid[row][col] = 1
    }
    
    const shipIndex = SHIP_SIZES.indexOf(size)
    this.board.ships.push({
      id: `ship-${shipIndex}`,
      positions,
      sunk: false,
      size
    })
    
    // Check if all ships are placed
    if (this.board.ships.length === SHIP_SIZES.length) {
      this.setupComplete = true
    }
    
    return true
  }

  public removeShip(size: number): boolean {
    if (this.setupComplete) return false
    
    const shipIndex = this.board.ships.findIndex(ship => ship.size === size)
    if (shipIndex === -1) return false
    
    const ship = this.board.ships[shipIndex]
    
    // Clear ship positions from grid
    ship.positions.forEach(pos => {
      this.board.grid[pos.row][pos.col] = 0
    })
    
    // Remove ship from ships array
    this.board.ships.splice(shipIndex, 1)
    
    return true
  }

  public rotateShip(size: number): boolean {
    if (this.setupComplete) return false
    
    const shipIndex = this.board.ships.findIndex(ship => ship.size === size)
    if (shipIndex === -1) return false
    
    const ship = this.board.ships[shipIndex]
    
    // Clear current ship positions
    ship.positions.forEach(pos => {
      this.board.grid[pos.row][pos.col] = 0
    })
    
    // Determine new orientation (toggle horizontal/vertical)
    const currentHorizontal = this.isShipHorizontal(ship)
    const newHorizontal = !currentHorizontal
    
    // Get the first position as anchor point
    const anchorRow = ship.positions[0].row
    const anchorCol = ship.positions[0].col
    
    // Check if rotation is possible
    if (!this.canPlaceShip(anchorRow, anchorCol, ship.size, newHorizontal)) {
      // If rotation not possible, restore original positions
      ship.positions.forEach(pos => {
        this.board.grid[pos.row][pos.col] = 1
      })
      return false
    }
    
    // Create new positions
    const newPositions = []
    for (let i = 0; i < ship.size; i++) {
      const row = newHorizontal ? anchorRow : anchorRow + i
      const col = newHorizontal ? anchorCol + i : anchorCol
      newPositions.push({ row, col })
      this.board.grid[row][col] = 1
    }
    
    // Update ship positions
    ship.positions = newPositions
    
    return true
  }

  private isShipHorizontal(ship: Ship): boolean {
    if (ship.positions.length <= 1) return true
    
    const firstPos = ship.positions[0]
    const secondPos = ship.positions[1]
    
    // If row is same, ship is horizontal
    return firstPos.row === secondPos.row
  }

  public static fromJSON(json: string): BattleshipGame {
    const data = JSON.parse(json)
    const game = new BattleshipGame()
    game.board = data.board
    game.moves = data.moves || []
    game.setupComplete = data.setupComplete || true
    return game
  }

  public toJSON(): string {
    return JSON.stringify({
      board: this.board,
      moves: this.moves,
      setupComplete: this.setupComplete
    })
  }
}

