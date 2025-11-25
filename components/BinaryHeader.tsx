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

  // Generate random positions and animation variations for each bit
  const getRandomValue = (index: number, min: number, max: number) => {
    const seed = Date.now() % 10000 + index * 137
    return min + (Math.sin(seed) * 10000 % 1) * (max - min)
  }

  return (
    <>
      {bits.map((bit, index) => {
        // Random starting position within header
        const top = `${getRandomValue(index, 5, 95)}%`
        const left = `${getRandomValue(index, 5, 95)}%`
        
        // Very small random delay (0-0.3s) just to offset them slightly, but all start immediately
        const delay = `${getRandomValue(index, 0, 0.3)}s`
        
        // Random animation duration for more variation (5-10 seconds)
        const duration = `${getRandomValue(index, 5, 10)}s`
        
        // Random animation name (will use different paths)
        const animationName = `float-${(index % 4) + 1}`
        
        return (
          <div 
            key={`bit-${index}`} 
            className="binary-bit"
            style={{
              top,
              left,
              animation: `${animationName} ${duration} ease-in-out infinite`,
              animationDelay: delay,
              opacity: 0.4, // Start visible, no fade-in
            }}
          >
            {bit}
          </div>
        )
      })}
    </>
  )
}

