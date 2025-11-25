'use client'

import { useMemo } from 'react'

// Use a seeded random function to generate consistent bits
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Initialize bits immediately using sessionStorage or generate new ones
function getBits(): string[] {
  if (typeof window === 'undefined') {
    // Server-side: return empty array, will be populated on client
    return []
  }
  
  const storageKey = 'vulnhub-binary-bits'
  const storedBits = sessionStorage.getItem(storageKey)
  
  if (storedBits) {
    return JSON.parse(storedBits)
  }
  
  // Generate random mix of 1s and 0s with a seed based on session start
  // Use a session start time stored in sessionStorage to ensure consistency
  let sessionStart = sessionStorage.getItem('vulnhub-session-start')
  if (!sessionStart) {
    sessionStart = Date.now().toString()
    sessionStorage.setItem('vulnhub-session-start', sessionStart)
  }
  
  const seed = parseInt(sessionStart, 10)
  const newBits = Array.from({ length: 14 }, (_, i) => 
    seededRandom(seed + i) > 0.5 ? '1' : '0'
  )
  
  sessionStorage.setItem(storageKey, JSON.stringify(newBits))
  return newBits
}

export default function BinaryHeader() {
  // Initialize bits immediately on first render - no useEffect delay
  // This ensures the animation starts immediately
  const bits = typeof window !== 'undefined' ? getBits() : []

  if (bits.length === 0) {
    // Return empty div to prevent layout shift, animation will start when bits are ready
    return null
  }

  // Calculate positions to fill header area top to bottom (0% to 100% of container)
  // Use random delays so bits are always moving, never all starting from stop
  const getRandomDelay = (index: number) => {
    // Use seeded random based on bit index for consistency, but vary it
    const seed = Date.now() % 1000 + index
    return `${(Math.sin(seed) * 10000 % 8).toFixed(1)}s` // Random delay 0-8s
  }
  
  const positions = [
    { top: '2%', left: '5%' },
    { top: '8%', left: '85%' },
    { top: '15%', left: '10%' },
    { top: '22%', left: '90%' },
    { top: '30%', left: '15%' },
    { top: '38%', left: '70%' },
    { top: '45%', left: '25%' },
    { top: '52%', left: '80%' },
    { top: '60%', left: '50%' },
    { top: '68%', left: '60%' },
    { top: '75%', left: '40%' },
    { top: '82%', left: '65%' },
    { top: '90%', left: '35%' },
    { top: '95%', left: '95%' },
  ]

  return (
    <>
      {bits.map((bit, index) => {
        const position = positions[index]
        const randomDelay = getRandomDelay(index)
        return (
          <div 
            key={`bit-${index}`} 
            className={`binary-bit bit-${index + 1}`}
            style={{
              top: position?.top,
              left: position?.left,
              animationDelay: randomDelay,
            }}
          >
            {bit}
          </div>
        )
      })}
    </>
  )
}

