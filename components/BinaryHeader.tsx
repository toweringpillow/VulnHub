'use client'

import { useEffect, useRef, useCallback } from 'react'

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
  
  let sessionStart = sessionStorage.getItem('vulnhub-session-start')
  if (!sessionStart) {
    sessionStart = Date.now().toString()
    sessionStorage.setItem('vulnhub-session-start', sessionStart)
  }
  
  const seed = parseInt(sessionStart, 10)
  const newBits = Array.from({ length: 30 }, (_, i) => 
    seededRandom(seed + i) > 0.5 ? '1' : '0'
  )
  
  sessionStorage.setItem(storageKey, JSON.stringify(newBits))
  return newBits
}

interface Bit {
  value: string
  x: number
  y: number
  baseX: number
  baseY: number
  vx: number
  vy: number
  isInteractive: boolean
  angle: number
  rotationSpeed: number
  animationOffset: number
  animationSpeed: number
  peckPhase: number
  peckTimer: number
}

export default function BinaryHeader() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const bitsRef = useRef<Bit[]>([])
  const mousePosRef = useRef<{ x: number; y: number } | null>(null)
  const animationFrameRef = useRef<number>()
  const lastTimeRef = useRef<number>(0)

  // Initialize bits
  useEffect(() => {
    const bits: Bit[] = []
    const sessionStart = sessionStorage.getItem('vulnhub-session-start')
    const seed = sessionStart ? parseInt(sessionStart, 10) : Date.now()
    const bitValues = getBits()

    bitValues.forEach((value, index) => {
      const getSeededValue = (idx: number, min: number, max: number) => {
        const val = seededRandom(seed + idx * 137)
        return min + val * (max - min)
      }

      const baseX = getSeededValue(index, 0.05, 0.95)
      const baseY = getSeededValue(index, 0.05, 0.95)
      const isInteractive = seededRandom(seed + index * 7) < 0.4

      bits.push({
        value,
        x: baseX,
        y: baseY,
        baseX,
        baseY,
        vx: 0,
        vy: 0,
        isInteractive,
        angle: seededRandom(seed + index * 13) * Math.PI * 2,
        rotationSpeed: (seededRandom(seed + index * 17) - 0.5) * 0.02,
        animationOffset: seededRandom(seed + index * 19) * Math.PI * 2,
        animationSpeed: 0.5 + seededRandom(seed + index * 23) * 0.5,
        peckPhase: 0,
        peckTimer: 0,
      })
    })

    bitsRef.current = bits
  }, [])

  // Mouse tracking - use header element for accurate coordinates
  const handleMouseMove = useCallback((e: MouseEvent) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const header = canvas.closest('header')
    if (!header) return

    const headerRect = header.getBoundingClientRect()
    const canvasRect = canvas.getBoundingClientRect()
    
    // Calculate mouse position relative to canvas, but using header bounds
    const relativeX = (e.clientX - headerRect.left) / headerRect.width
    const relativeY = (e.clientY - headerRect.top) / headerRect.height
    
    mousePosRef.current = {
      x: relativeX,
      y: relativeY,
    }
  }, [])

  const handleMouseLeave = useCallback(() => {
    mousePosRef.current = null
  }, [])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const header = canvas.closest('header')
    if (!header) return

    header.addEventListener('mousemove', handleMouseMove)
    header.addEventListener('mouseleave', handleMouseLeave)

    return () => {
      header.removeEventListener('mousemove', handleMouseMove)
      header.removeEventListener('mouseleave', handleMouseLeave)
    }
  }, [handleMouseMove, handleMouseLeave])

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    // Set canvas size
    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect()
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    window.addEventListener('resize', resizeCanvas)

    const ATTRACTION_DISTANCE = 0.15
    const PECK_DISTANCE = 0.04
    const ATTRACTION_STRENGTH = 0.0006 // Reduced for smoother approach
    const RETREAT_STRENGTH = 0.0015 // Increased for faster retreat
    const FRICTION = 0.94 // Increased friction for less bouncing
    const MAX_SPEED = 0.0025 // Slightly reduced max speed
    const RETURN_STRENGTH = 0.0003 // Reduced for smoother return
    const RETURN_FRICTION = 0.96 // Higher friction when returning
    const FLOAT_AMPLITUDE = 0.02
    const PECK_DURATION = 0.15 // Quick peck duration
    const RETREAT_DURATION = 0.3 // Retreat duration before reset

    const animate = (currentTime: number) => {
      if (!ctx) return

      const deltaTime = currentTime - lastTimeRef.current
      lastTimeRef.current = currentTime
      const deltaSeconds = Math.min(deltaTime / 1000, 0.1) // Cap at 100ms

      // Clear canvas
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      // Set font and style
      ctx.font = '24px monospace'
      ctx.textAlign = 'center'
      ctx.textBaseline = 'middle'

      const mousePos = mousePosRef.current
      const bits = bitsRef.current

      bits.forEach((bit) => {
        // Update rotation for floating effect
        bit.angle += bit.rotationSpeed * deltaSeconds * 60

        if (bit.isInteractive && mousePos) {
          // Interactive behavior - fish-like attraction
          const dx = mousePos.x - bit.x
          const dy = mousePos.y - bit.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          bit.peckTimer += deltaSeconds

          if (distance < ATTRACTION_DISTANCE && distance > PECK_DISTANCE) {
            // Approaching phase - smooth swim toward mouse
            if (bit.peckPhase !== 0) {
              // Reset if coming from peck/retreat
              bit.peckPhase = 0
              bit.peckTimer = 0
            }
            const angle = Math.atan2(dy, dx)
            // Smooth attraction that gets stronger as it gets closer
            const force = ATTRACTION_STRENGTH * (1 - distance / ATTRACTION_DISTANCE)
            bit.vx += Math.cos(angle) * force * deltaSeconds * 60
            bit.vy += Math.sin(angle) * force * deltaSeconds * 60
          } else if (distance <= PECK_DISTANCE) {
            // Pecking phase - quick approach, brief pause, then retreat
            if (bit.peckPhase === 0) {
              // Start pecking
              bit.peckPhase = 1
              bit.peckTimer = 0
            } else if (bit.peckPhase === 1) {
              // Brief peck forward
              if (bit.peckTimer < PECK_DURATION) {
                const angle = Math.atan2(dy, dx)
                // Quick forward movement
                bit.vx += Math.cos(angle) * 0.002 * deltaSeconds * 60
                bit.vy += Math.sin(angle) * 0.002 * deltaSeconds * 60
              } else {
                // Switch to retreat
                bit.peckPhase = 2
                bit.peckTimer = 0
              }
            } else if (bit.peckPhase === 2) {
              // Retreat phase - back away quickly
              if (bit.peckTimer < RETREAT_DURATION) {
                const angle = Math.atan2(dy, dx)
                // Strong retreat force
                bit.vx -= Math.cos(angle) * RETREAT_STRENGTH * deltaSeconds * 60
                bit.vy -= Math.sin(angle) * RETREAT_STRENGTH * deltaSeconds * 60
              } else {
                // Reset to approach phase
                bit.peckPhase = 0
                bit.peckTimer = 0
              }
            }
          } else {
            // Too far away - reset to normal
            if (bit.peckPhase !== 0) {
              bit.peckPhase = 0
              bit.peckTimer = 0
            }
          }

          // Apply friction (stronger during retreat to reduce bouncing)
          const currentFriction = bit.peckPhase === 2 ? FRICTION * 0.98 : FRICTION
          bit.vx *= Math.pow(currentFriction, deltaSeconds * 60)
          bit.vy *= Math.pow(currentFriction, deltaSeconds * 60)

          // Limit speed
          const speed = Math.sqrt(bit.vx * bit.vx + bit.vy * bit.vy)
          if (speed > MAX_SPEED) {
            bit.vx = (bit.vx / speed) * MAX_SPEED
            bit.vy = (bit.vy / speed) * MAX_SPEED
          }

          // Update position
          bit.x += bit.vx * deltaSeconds * 60
          bit.y += bit.vy * deltaSeconds * 60

          // Keep within bounds
          bit.x = Math.max(0.02, Math.min(0.98, bit.x))
          bit.y = Math.max(0.02, Math.min(0.98, bit.y))
        } else if (bit.isInteractive && !mousePos) {
          // Return to base position - smooth and gradual
          const dx = bit.baseX - bit.x
          const dy = bit.baseY - bit.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0.001) {
            const angle = Math.atan2(dy, dx)
            // Smooth return with easing - stronger when far, gentler when close
            const returnForce = RETURN_STRENGTH * (0.3 + 0.7 * Math.min(distance / 0.1, 1))
            bit.vx += Math.cos(angle) * returnForce * deltaSeconds * 60
            bit.vy += Math.sin(angle) * returnForce * deltaSeconds * 60
            
            // Higher friction when returning for smoother motion
            bit.vx *= Math.pow(RETURN_FRICTION, deltaSeconds * 60)
            bit.vy *= Math.pow(RETURN_FRICTION, deltaSeconds * 60)
            
            bit.x += bit.vx * deltaSeconds * 60
            bit.y += bit.vy * deltaSeconds * 60
            
            // Gradually slow down as we approach
            if (distance < 0.01) {
              bit.vx *= 0.9
              bit.vy *= 0.9
            }
          } else {
            // Very close - smoothly settle
            bit.x += (bit.baseX - bit.x) * 0.1
            bit.y += (bit.baseY - bit.y) * 0.1
            bit.vx *= 0.8
            bit.vy *= 0.8
          }
        } else {
          // Non-interactive: floating animation
          const time = currentTime / 1000
          bit.x = bit.baseX + Math.sin(time * bit.animationSpeed + bit.animationOffset) * FLOAT_AMPLITUDE
          bit.y = bit.baseY + Math.cos(time * bit.animationSpeed * 0.7 + bit.animationOffset) * FLOAT_AMPLITUDE
        }

        // Draw bit
        const pixelX = bit.x * canvas.width
        const pixelY = bit.y * canvas.height
        const opacity = bit.isInteractive && mousePos ? 0.6 : 0.4

        ctx.save()
        ctx.translate(pixelX, pixelY)
        ctx.rotate(bit.angle)
        ctx.globalAlpha = opacity
        ctx.fillStyle = 'rgba(249, 115, 22, 0.25)'
        ctx.fillText(bit.value, 0, 0)
        ctx.restore()
      })

      animationFrameRef.current = requestAnimationFrame(animate)
    }

    lastTimeRef.current = performance.now()
    animationFrameRef.current = requestAnimationFrame(animate)

    return () => {
      window.removeEventListener('resize', resizeCanvas)
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 0 }}
    />
  )
}
