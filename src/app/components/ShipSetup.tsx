'use client'

import { useState, useRef, useEffect } from 'react'
import { BattleshipGame, BOARD_SIZE, SHIP_SIZES, SHIP_NAMES, SHIP_COLORS, SHIP_BORDER_COLORS } from '@/lib/battleship'

interface ShipSetupProps {
  game: BattleshipGame
  onShipPlaced: (row: number, col: number, size: number, horizontal: boolean) => boolean
  onShipRemoved: (size: number) => boolean
  onShipRotated: (size: number) => boolean
  onSetupComplete: () => void
  playerNickname?: string
}

interface DraggedShip {
  size: number
  name: string
  startRow: number
  startCol: number
  horizontal: boolean
}

export default function ShipSetup({ game, onShipPlaced, onShipRemoved, onShipRotated, onSetupComplete, playerNickname }: ShipSetupProps) {
  const [draggedShip, setDraggedShip] = useState<DraggedShip | null>(null)
  const [hoveredCell, setHoveredCell] = useState<{ row: number; col: number } | null>(null)
  const [selectedShip, setSelectedShip] = useState<number | null>(null)
  const boardRef = useRef<HTMLDivElement>(null)

  const availableShips = game.getAvailableShips()

  const getShipColor = (size: number) => {
    const index = SHIP_SIZES.indexOf(size)
    return index >= 0 ? SHIP_COLORS[index] : 'bg-gray-200'
  }

  const getShipBorderColor = (size: number) => {
    const index = SHIP_SIZES.indexOf(size)
    return index >= 0 ? SHIP_BORDER_COLORS[index] : 'border-gray-300'
  }

  const getShipBySize = (size: number) => {
    return game.getShips().find(ship => ship.size === size)
  }

  const handleShipDragStart = (size: number, name: string) => {
    if (availableShips.find(s => s.size === size)?.placed) return
    
    setDraggedShip({
      size,
      name,
      startRow: 0,
      startCol: 0,
      horizontal: true
    })
  }

  const handleCellMouseEnter = (row: number, col: number) => {
    if (draggedShip) {
      setHoveredCell({ row, col })
    }
  }

  const handleCellMouseLeave = () => {
    setHoveredCell(null)
  }

  const handleCellClick = (row: number, col: number) => {
    if (selectedShip !== null) {
      const shipSize = SHIP_SIZES[selectedShip]
      const horizontal = true // Default to horizontal
      
      if (onShipPlaced(row, col, shipSize, horizontal)) {
        setSelectedShip(null)
      }
    }
  }

  const handleCellDoubleClick = (row: number, col: number) => {
    // Find which ship is at this position
    const ship = game.getShips().find(s => 
      s.positions.some(pos => pos.row === row && pos.col === col)
    )
    
    if (ship) {
      onShipRotated(ship.size)
    }
  }

  const handleShipClick = (index: number) => {
    const shipSize = SHIP_SIZES[index]
    const ship = game.getShips().find(s => s.size === shipSize)
    
    if (ship) {
      // Remove existing ship
      onShipRemoved(shipSize)
      setSelectedShip(null)
    } else {
      // Select ship for placement
      setSelectedShip(index)
    }
  }

  const rotateShip = () => {
    if (draggedShip) {
      setDraggedShip({
        ...draggedShip,
        horizontal: !draggedShip.horizontal
      })
    }
  }

  const getCellState = (row: number, col: number): { type: 'empty' | 'ship' | 'hover' | 'hover-invalid', ship?: any } => {
    // Check if this cell has a ship
    const ship = game.getShips().find(s => 
      s.positions.some(pos => pos.row === row && pos.col === col)
    )
    
    if (ship) return { type: 'ship', ship }
    
    // Check if this cell is in the hover preview
    if (hoveredCell && draggedShip) {
      const { row: hoverRow, col: hoverCol } = hoveredCell
      const { size, horizontal } = draggedShip
      
      for (let i = 0; i < size; i++) {
        const checkRow = horizontal ? hoverRow : hoverRow + i
        const checkCol = horizontal ? hoverCol + i : hoverCol
        
        if (checkRow === row && checkCol === col) {
          // Check if this position is valid
          const valid = game.canPlaceShip ? game.canPlaceShip(hoverRow, hoverCol, size, horizontal) : true
          return { type: valid ? 'hover' : 'hover-invalid' }
        }
      }
    }
    
    return { type: 'empty' }
  }

  const canPlaceAtPosition = (row: number, col: number, size: number, horizontal: boolean): boolean => {
    if (horizontal) {
      if (col + size > BOARD_SIZE) return false
      for (let i = 0; i < size; i++) {
        if (game.getBoard().grid[row][col + i] !== 0) return false
      }
    } else {
      if (row + size > BOARD_SIZE) return false
      for (let i = 0; i < size; i++) {
        if (game.getBoard().grid[row + i][col] !== 0) return false
      }
    }
    return true
  }

  const handleDrop = (row: number, col: number) => {
    if (!draggedShip) return
    
    const { size, horizontal } = draggedShip
    
    if (canPlaceAtPosition(row, col, size, horizontal)) {
      if (onShipPlaced(row, col, size, horizontal)) {
        setDraggedShip(null)
        setHoveredCell(null)
      }
    }
  }

  const handleDragEnd = () => {
    setDraggedShip(null)
    setHoveredCell(null)
  }

  useEffect(() => {
    if (game.isSetupComplete()) {
      onSetupComplete()
    }
  }, [game, onSetupComplete])

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          Ship Placement
        </h2>
        <p className="text-gray-600">
          {playerNickname ? `${playerNickname}, ` : ''}Place your ships on the grid below
        </p>
      </div>

      {/* Ship Selection */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4">Place Your Ships</h3>
        <div className="grid grid-cols-5 gap-2">
          {SHIP_SIZES.map((size, index) => {
            const ship = availableShips[index]
            const isPlaced = ship.placed
            const isSelected = selectedShip === index
            const shipColor = getShipColor(size)
            const borderColor = getShipBorderColor(size)
            
            return (
              <div
                key={size}
                className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                  isPlaced 
                    ? `${shipColor} ${borderColor} text-white` 
                    : isSelected
                    ? `${shipColor} ${borderColor} text-white opacity-80`
                    : 'bg-gray-100 border-gray-300 text-gray-700 hover:bg-gray-200'
                }`}
                onClick={() => handleShipClick(index)}
                draggable={!isPlaced}
                onDragStart={() => handleShipDragStart(size, ship.name)}
              >
                <div className="text-sm font-medium">{ship.name}</div>
                <div className="text-xs">Size: {size}</div>
                {isPlaced && <div className="text-xs">✓ Placed</div>}
              </div>
            )
          })}
        </div>
        
        {selectedShip !== null && (
          <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              Click on the board to place your {SHIP_NAMES[selectedShip]} (size {SHIP_SIZES[selectedShip]})
            </p>
          </div>
        )}
      </div>

      {/* Game Board */}
      <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 shadow-lg">
        <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">Your Fleet</h3>
        <div 
          ref={boardRef}
          className="grid grid-cols-10 gap-1 max-w-md mx-auto"
          onMouseLeave={handleDragEnd}
        >
          {Array.from({ length: BOARD_SIZE }, (_, row) =>
            Array.from({ length: BOARD_SIZE }, (_, col) => {
              const cellState = getCellState(row, col)
              const { type, ship } = cellState
              
              let cellClasses = 'w-8 h-8 rounded-xl border-2 transition-all duration-200 '
              let cellContent = ''
              
              if (type === 'ship' && ship) {
                const shipColor = getShipColor(ship.size)
                const borderColor = getShipBorderColor(ship.size)
                cellClasses += `${shipColor} ${borderColor} cursor-pointer hover:opacity-80`
                cellContent = '🚢'
              } else if (type === 'hover') {
                cellClasses += 'bg-blue-200 border-blue-300'
              } else if (type === 'hover-invalid') {
                cellClasses += 'bg-red-200 border-red-300'
              } else {
                cellClasses += 'bg-blue-100 border-blue-200 hover:bg-blue-200'
              }
              
              return (
                <div
                  key={`${row}-${col}`}
                  className={cellClasses}
                  onMouseEnter={() => handleCellMouseEnter(row, col)}
                  onMouseLeave={handleCellMouseLeave}
                  onClick={() => handleCellClick(row, col)}
                  onDoubleClick={() => handleCellDoubleClick(row, col)}
                  onDrop={() => handleDrop(row, col)}
                  onDragOver={(e) => e.preventDefault()}
                >
                  {cellContent}
                </div>
              )
            })
          )}
        </div>
        
        {/* Instructions */}
        <div className="mt-4 text-center text-sm text-gray-600">
          <p>Click on ships to place them, or drag and drop them onto the board</p>
          <p>Click on placed ships to remove them, double-click to rotate</p>
        </div>
      </div>

      {/* Setup Complete Button */}
      {game.isSetupComplete() && (
        <div className="text-center">
          <button
            onClick={onSetupComplete}
            className="bg-green-500 text-white px-8 py-3 rounded-xl font-semibold hover:bg-green-600 transition-colors"
          >
            Ready to Battle! 🚀
          </button>
        </div>
      )}
    </div>
  )
}