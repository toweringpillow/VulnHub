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

  // Calculate positions relative to header area only (top 25% of viewport)
  const positions = [
    { top: '5%', left: '5%', delay: '0s' },
    { top: '8%', left: '85%', delay: '1s' },
    { top: '12%', left: '10%', delay: '2s' },
    { top: '15%', left: '90%', delay: '3s' },
    { top: '18%', left: '15%', delay: '4s' },
    { top: '10%', left: '70%', delay: '1.5s' },
    { top: '13%', left: '25%', delay: '2.5s' },
    { top: '16%', left: '80%', delay: '0.5s' },
    { top: '7%', left: '50%', delay: '3.5s' },
    { top: '20%', left: '60%', delay: '1.2s' },
    { top: '11%', left: '40%', delay: '2.8s' },
    { top: '14%', left: '65%', delay: '0.8s' },
    { top: '17%', left: '35%', delay: '3.2s' },
    { top: '9%', left: '95%', delay: '1.8s' },
  ]

  return (
    <>
      {bits.map((bit, index) => (
        <div 
          key={`bit-${index}`} 
          className={`binary-bit bit-${index + 1}`}
          style={{
            top: positions[index]?.top,
            left: positions[index]?.left,
            animationDelay: positions[index]?.delay,
          }}
        >
          {bit}
        </div>
      ))}
    </>
  )
}

