'use client'

import { useEffect, useState } from 'react'

export default function BinaryHeader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  // Generate random mix of 1s and 0s
  const bits = Array.from({ length: 14 }, () => 
    Math.random() > 0.5 ? '1' : '0'
  )

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

