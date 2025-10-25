'use client'

import { SHIP_NAMES, SHIP_SIZES, SHIP_COLORS, SHIP_BORDER_COLORS } from '@/lib/battleship'
import { Ship } from '@/lib/supabase'

interface ShipTrackerProps {
  destroyedShips: Ship[]
  enemyShips: Ship[]
}

export default function ShipTracker({ destroyedShips, enemyShips }: ShipTrackerProps) {
  const getShipColor = (size: number) => {
    const index = SHIP_SIZES.indexOf(size)
    return index >= 0 ? SHIP_COLORS[index] : 'bg-gray-500'
  }

  const getShipBorderColor = (size: number) => {
    const index = SHIP_SIZES.indexOf(size)
    return index >= 0 ? SHIP_BORDER_COLORS[index] : 'border-gray-600'
  }

  const getShipStatus = (size: number) => {
    const destroyedShip = destroyedShips.find(ship => ship.size === size)
    const totalShip = enemyShips.find(ship => ship.size === size)
    
    if (destroyedShip) {
      return { status: 'destroyed', ship: destroyedShip }
    } else if (totalShip) {
      return { status: 'active', ship: totalShip }
    }
    return { status: 'unknown', ship: null }
  }

  const getShipIcon = (size: number, status: string) => {
    switch (status) {
      case 'destroyed':
        return '●'
      case 'active':
        return '○'
      default:
        return '?'
    }
  }

  const getShipCardColor = (size: number, status: string) => {
    const shipColor = getShipColor(size)
    const borderColor = getShipBorderColor(size)
    
    switch (status) {
      case 'destroyed':
        return `${shipColor} ${borderColor} text-gray-700 opacity-60`
      case 'active':
        return `${shipColor} ${borderColor} text-gray-700`
      default:
        return 'bg-gray-100 border-gray-300 text-gray-600'
    }
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm rounded-xl p-4 shadow-lg">
      <h3 className="text-lg font-semibold text-gray-800 mb-4 text-center">
        Enemy Fleet Status
      </h3>
      
      <div className="grid grid-cols-1 gap-2">
        {SHIP_SIZES.map((size, index) => {
          const { status, ship } = getShipStatus(size)
          const shipName = SHIP_NAMES[index]
          
          return (
            <div
              key={size}
              className={`p-3 rounded-xl border-2 transition-all ${getShipCardColor(size, status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-2xl">{getShipIcon(size, status)}</span>
                  <div>
                    <div className="font-medium">{shipName}</div>
                    <div className="text-sm opacity-75">Size: {size}</div>
                  </div>
                </div>
                
                <div className="text-right">
                  {status === 'destroyed' && (
                    <div className="text-sm font-medium">
                      <div className="text-red-600">DESTROYED</div>
                      <div className="text-xs opacity-75">💥 Exploded!</div>
                    </div>
                  )}
                  {status === 'active' && (
                    <div className="text-sm font-medium">
                      <div className="text-blue-600">ACTIVE</div>
                      <div className="text-xs opacity-75">
                        Hits: {ship?.positions.filter(pos => 
                          // This would need to be calculated based on hit positions
                          false // Placeholder - would need hit tracking
                        ).length || 0}/{size}
                      </div>
                    </div>
                  )}
                  {status === 'unknown' && (
                    <div className="text-sm font-medium text-gray-500">
                      UNKNOWN
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>
      
      <div className="mt-4 text-center text-sm text-gray-600">
        <p>
          Ships Destroyed: {destroyedShips.length}/{enemyShips.length}
        </p>
      </div>
    </div>
  )
}
