'use client'

import { useState, useEffect, useRef, useCallback } from 'react'

// Use a seeded random function to generate consistent bits
function seededRandom(seed: number) {
  const x = Math.sin(seed) * 10000
  return x - Math.floor(x)
}

// Initialize bits using sessionStorage or generate new ones
function getBits(): string[] {
  if (typeof window === 'undefined') {
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
  // Increased from 14 to 30 bits
  const newBits = Array.from({ length: 30 }, (_, i) => 
    seededRandom(seed + i) > 0.5 ? '1' : '0'
  )
  
  sessionStorage.setItem(storageKey, JSON.stringify(newBits))
  return newBits
}

interface BitPosition {
  x: number
  y: number
  targetX: number
  targetY: number
  vx: number
  vy: number
  isInteractive: boolean
  peckPhase: number // 0 = approaching, 1 = pecking, 2 = retreating
  peckTimer: number
}

export default function BinaryHeader() {
  const [bits, setBits] = useState<string[]>([])
  const [mounted, setMounted] = useState(false)
  const [mousePos, setMousePos] = useState<{ x: number; y: number } | null>(null)
  const [animationTick, setAnimationTick] = useState(0) // Force re-render for position updates
  const headerRef = useRef<HTMLDivElement>(null)
  const bitPositionsRef = useRef<Map<number, BitPosition>>(new Map())
  const animationFrameRef = useRef<number>()

  // Only run on client to avoid hydration issues
  useEffect(() => {
    setMounted(true)
    const newBits = getBits()
    setBits(newBits)
    
    // Initialize positions for all bits with stable seeded values
    const positions = new Map<number, BitPosition>()
    const sessionStart = sessionStorage.getItem('vulnhub-session-start')
    const seed = sessionStart ? parseInt(sessionStart, 10) : Date.now()
    
    newBits.forEach((_, index) => {
      // Use seeded random for consistent initial positions
      const getSeededValue = (idx: number, min: number, max: number) => {
        const value = seededRandom(seed + idx * 137)
        return min + value * (max - min)
      }
      
      const initialX = getSeededValue(index, 5, 95)
      const initialY = getSeededValue(index, 5, 95)
      
      // 40% of bits are interactive (fish-like)
      const isInteractive = seededRandom(seed + index * 7) < 0.4
      
      positions.set(index, {
        x: initialX,
        y: initialY,
        targetX: initialX,
        targetY: initialY,
        vx: 0,
        vy: 0,
        isInteractive,
        peckPhase: 0,
        peckTimer: 0,
      })
    })
    bitPositionsRef.current = positions
  }, [])

  // Mouse tracking
  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!headerRef.current) return
    
    const header = headerRef.current.closest('header')
    if (!header) return
    
    const rect = header.getBoundingClientRect()
    const x = ((e.clientX - rect.left) / rect.width) * 100
    const y = ((e.clientY - rect.top) / rect.height) * 100
    setMousePos({ x, y })
  }, [])

  const handleMouseLeave = useCallback(() => {
    // Mark that bits need to return when mouse leaves
    const positions = bitPositionsRef.current
    const hasInteractive = Array.from(positions.values()).some(pos => pos.isInteractive)
    if (hasInteractive) {
      hasReturningBitsRef.current = true
    }
    setMousePos(null)
  }, [])

  useEffect(() => {
    if (!mounted) return

    const header = headerRef.current?.closest('header')
    if (!header) return

    header.addEventListener('mousemove', handleMouseMove)
    header.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      header.removeEventListener('mousemove', handleMouseMove)
      header.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [mounted, handleMouseMove, handleMouseLeave])

  // Track if any interactive bits need to return to base
  const hasReturningBitsRef = useRef(false)

  // Animation loop for fish-like behavior
  useEffect(() => {
    if (!mounted || bits.length === 0) return

    // Small delay to ensure positions are initialized
    const initTimeout = setTimeout(() => {
      // Check if we need to run the animation loop at all
      const positions = bitPositionsRef.current
      if (positions.size === 0) return
      
      const hasInteractiveBits = Array.from(positions.values()).some(pos => pos.isInteractive)
      
      if (!hasInteractiveBits) {
        return // No interactive bits, no need for physics
      }

      const needsReturn = hasReturningBitsRef.current
      
      // Only run if mouse is present or bits need to return
      if (!mousePos && !needsReturn) {
        return
      }

      let lastTime = performance.now()
      const FPS = 60
      const frameInterval = 1000 / FPS

      const animate = (currentTime: number) => {
      const deltaTime = currentTime - lastTime
      
      // Throttle to ~60fps
      if (deltaTime < frameInterval) {
        animationFrameRef.current = requestAnimationFrame(animate)
        return
      }
      
      lastTime = currentTime - (deltaTime % frameInterval)

      const currentPositions = bitPositionsRef.current
      const ATTRACTION_DISTANCE = 15 // Distance at which bits start being attracted
      const PECK_DISTANCE = 5 // Distance for pecking behavior
      const ATTRACTION_STRENGTH = 0.15 // How strong the attraction is
      const RETREAT_STRENGTH = 0.25 // How fast they retreat after pecking
      const FRICTION = 0.92 // Friction to slow down movement
      const MAX_SPEED = 2 // Maximum speed
      const RETURN_STRENGTH = 0.1 // How fast they return to base position
      const deltaSeconds = deltaTime / 1000 // Normalize to seconds

      let needsUpdate = false
      let stillReturning = false

      currentPositions.forEach((pos, index) => {
        if (!pos.isInteractive) return

        if (!mousePos) {
          // Return to base position when mouse leaves
          const dx = pos.targetX - pos.x
          const dy = pos.targetY - pos.y
          const distance = Math.sqrt(dx * dx + dy * dy)
          
          if (distance > 0.5) {
            stillReturning = true
            const angle = Math.atan2(dy, dx)
            pos.vx += Math.cos(angle) * RETURN_STRENGTH * deltaSeconds * 60
            pos.vy += Math.sin(angle) * RETURN_STRENGTH * deltaSeconds * 60
            needsUpdate = true
          } else {
            // Close enough, snap to target and stop
            if (Math.abs(pos.x - pos.targetX) > 0.1 || Math.abs(pos.y - pos.targetY) > 0.1) {
              pos.x = pos.targetX
              pos.y = pos.targetY
              pos.vx = 0
              pos.vy = 0
              needsUpdate = true
            }
          }
          
          if (needsUpdate) {
            // Apply friction
            pos.vx *= Math.pow(FRICTION, deltaSeconds * 60)
            pos.vy *= Math.pow(FRICTION, deltaSeconds * 60)
            
            // Update position
            pos.x += pos.vx * deltaSeconds * 60
            pos.y += pos.vy * deltaSeconds * 60
            
            // Keep within bounds
            pos.x = Math.max(2, Math.min(98, pos.x))
            pos.y = Math.max(2, Math.min(98, pos.y))
          }
          return
        }

        needsUpdate = true
        const dx = mousePos.x - pos.x
        const dy = mousePos.y - pos.y
        const distance = Math.sqrt(dx * dx + dy * dy)

        // Update peck timer
        pos.peckTimer += deltaSeconds

        if (distance < ATTRACTION_DISTANCE && distance > PECK_DISTANCE) {
          // Approaching phase - swim toward mouse
          pos.peckPhase = 0
          pos.peckTimer = 0
          
          const angle = Math.atan2(dy, dx)
          const force = ATTRACTION_STRENGTH * (1 - distance / ATTRACTION_DISTANCE)
          
          pos.vx += Math.cos(angle) * force * deltaSeconds * 60
          pos.vy += Math.sin(angle) * force * deltaSeconds * 60
        } else if (distance <= PECK_DISTANCE) {
          // Pecking phase - get close then retreat
          if (pos.peckPhase === 0 || pos.peckTimer < 0.3) {
            pos.peckPhase = 1
            // Small forward movement (pecking)
            const angle = Math.atan2(dy, dx)
            pos.vx += Math.cos(angle) * 0.3 * deltaSeconds * 60
            pos.vy += Math.sin(angle) * 0.3 * deltaSeconds * 60
          } else {
            // Retreat phase - back away
            pos.peckPhase = 2
            const angle = Math.atan2(dy, dx)
            pos.vx -= Math.cos(angle) * RETREAT_STRENGTH * deltaSeconds * 60
            pos.vy -= Math.sin(angle) * RETREAT_STRENGTH * deltaSeconds * 60
            
            // After retreating, reset phase
            if (pos.peckTimer > 0.8) {
              pos.peckPhase = 0
              pos.peckTimer = 0
            }
          }
        } else {
          // Too far away - return to normal behavior
          pos.peckPhase = 0
          pos.peckTimer = 0
        }

        // Apply friction and limit speed
        pos.vx *= Math.pow(FRICTION, deltaSeconds * 60)
        pos.vy *= Math.pow(FRICTION, deltaSeconds * 60)
        
        const speed = Math.sqrt(pos.vx * pos.vx + pos.vy * pos.vy)
        if (speed > MAX_SPEED) {
          pos.vx = (pos.vx / speed) * MAX_SPEED
          pos.vy = (pos.vy / speed) * MAX_SPEED
        }

        // Update position
        pos.x += pos.vx * deltaSeconds * 60
        pos.y += pos.vy * deltaSeconds * 60

        // Keep within bounds
        pos.x = Math.max(2, Math.min(98, pos.x))
        pos.y = Math.max(2, Math.min(98, pos.y))
      })

      // Update returning state
      hasReturningBitsRef.current = stillReturning

      // Only trigger re-render if positions actually changed
      if (needsUpdate) {
        setAnimationTick(t => t + 1)
      }

      // Continue animation if mouse is present or bits are still returning
      if (mousePos || stillReturning) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
      }

      // Only start animation if needed
      if (mousePos || needsReturn) {
        animationFrameRef.current = requestAnimationFrame(animate)
      }
    }, 100) // 100ms delay to ensure initialization

    return () => {
      clearTimeout(initTimeout)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [mounted, bits.length, mousePos])

  if (!mounted || bits.length === 0) {
    return null
  }

  // Generate random positions and animation variations for each bit
  const getRandomValue = (index: number, min: number, max: number) => {
    const seed = Date.now() % 10000 + index * 137
    return min + (Math.sin(seed) * 10000 % 1) * (max - min)
  }

  return (
    <div ref={headerRef} className="absolute inset-0 pointer-events-auto">
      {bits.map((bit, index) => {
        const pos = bitPositionsRef.current.get(index)
        const isInteractive = pos?.isInteractive ?? false
        
        // Random starting position within header (for non-interactive or initial state)
        const top = pos ? `${pos.y}%` : `${getRandomValue(index, 5, 95)}%`
        const left = pos ? `${pos.x}%` : `${getRandomValue(index, 5, 95)}%`
        
        // Very small random delay (0-0.3s) just to offset them slightly
        const delay = `${getRandomValue(index, 0, 0.3)}s`
        
        // Random animation duration for more variation (5-10 seconds)
        const duration = `${getRandomValue(index, 5, 10)}s`
        
        // Random animation name (will use different paths)
        const animationName = `float-${(index % 4) + 1}`
        
        // Interactive bits have reduced opacity and no animation when mouse is near
        const shouldAnimate = !isInteractive || !mousePos
        const isInteracting = isInteractive && mousePos
        
        return (
          <div 
            key={`bit-${index}`} 
            className="binary-bit pointer-events-none"
            style={{
              top,
              left,
              animation: shouldAnimate ? `${animationName} ${duration} ease-in-out infinite` : 'none',
              animationDelay: shouldAnimate ? delay : '0s',
              opacity: isInteracting ? 0.6 : 0.4,
              transition: isInteracting 
                ? 'top 0.05s linear, left 0.05s linear, opacity 0.2s ease' 
                : 'opacity 0.2s ease',
              // Disable CSS transform when using manual positioning
              transform: isInteracting ? 'none' : undefined,
              willChange: isInteracting ? 'top, left' : 'transform',
            }}
          >
            {bit}
          </div>
        )
      })}
    </div>
  )
}

