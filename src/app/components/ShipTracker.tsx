'use client'

import { SHIP_NAMES, SHIP_SIZES, SHIP_COLORS, SHIP_BORDER_COLORS } from '@/lib/battleship'
import { Ship } from '@/lib/supabase'

interface ShipTrackerProps {
  destroyedShips: Ship[]
  enemyShips: Ship[]
}

export default function ShipTracker({ destroyedShips, enemyShips }: ShipTrackerProps) {
  const getShipColor = (index: number) => {
    return SHIP_COLORS[index] || 'bg-gray-500'
  }

  const getShipBorderColor = (index: number) => {
    return SHIP_BORDER_COLORS[index] || 'border-gray-600'
  }

  const getShipStatus = (index: number) => {
    const size = SHIP_SIZES[index]
    const shipId = `ship-${index}`
    const destroyedShip = destroyedShips.find(ship => ship.id === shipId)
    
    if (destroyedShip) {
      return 'destroyed'
    }
    return 'active'
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-3 shadow-lg">
      <div className="flex items-center justify-between gap-4">
        <h3 className="text-sm font-semibold text-gray-700">Enemy Fleet:</h3>
        
        <div className="flex items-center gap-2">
          {SHIP_SIZES.map((size, index) => {
            const status = getShipStatus(index)
            const shipColor = getShipColor(index)
            const borderColor = getShipBorderColor(index)
            const shipName = SHIP_NAMES[index]
            
            return (
              <div
                key={index}
                className={`px-2 py-1 rounded-lg border transition-all ${
                  status === 'destroyed' 
                    ? 'bg-gray-300 border-gray-400 opacity-50' 
                    : `${shipColor} ${borderColor}`
                }`}
                title={`${shipName} (${size})`}
              >
                <span className="text-xs font-medium">
                  {status === 'destroyed' ? '✕' : '●'} {shipName[0]}
                </span>
              </div>
            )
          })}
        </div>
        
        <span className="text-xs text-gray-500">
          {destroyedShips.length}/{enemyShips.length}
        </span>
      </div>
    </div>
  )
}
