'use client'

import { useEffect, useState } from 'react'

// Use a seeded random function to generate consistent bits
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

export default function BinaryHeader() {
  const [bits, setBits] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Generate bits once and store in sessionStorage to persist across navigations
    const storageKey = 'vulnhub-binary-bits'
    let storedBits = null
    
    if (typeof window !== 'undefined') {
      storedBits = sessionStorage.getItem(storageKey)
    }
    
    if (storedBits) {
      setBits(JSON.parse(storedBits))
    } else {
      // Generate random mix of 1s and 0s with a seed based on session start
      const seed = Date.now()
      const newBits = Array.from({ length: 14 }, (_, i) => 
        seededRandom(seed + i) > 0.5 ? '1' : '0'
      )
      setBits(newBits)
      if (typeof window !== 'undefined') {
        sessionStorage.setItem(storageKey, JSON.stringify(newBits))
      }
    }
    
    setMounted(true)
  }, [])

  if (!mounted || bits.length === 0) return null

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {bits.map((bit, index) => (
        <div key={index} className={`binary-bit bit-${index + 1}`}>
          {bit}
        </div>
      ))}
    </div>
  )
}

