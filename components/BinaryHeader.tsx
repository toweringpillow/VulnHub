'use client'

import { useEffect, useRef, useCallback } from 'react'

// Use a seeded random function to generate consistent bits
// Improved to reduce patterns and correlations
function seededRandom(seed: number) {
  // Use multiple operations to break patterns
  let x = Math.sin(seed) * 10000
  x = x - Math.floor(x)
  // Add additional mixing
  x = Math.sin(x * 1000) * 10000
  x = x - Math.floor(x)
  return x
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
  circleAngle: number // Angle for circling around mouse
  circleRadius: number // Base distance to maintain while circling
  circleRadiusX: number // X radius (for oval variation)
  circleRadiusY: number // Y radius (for oval variation)
  circleSpeed: number // Speed of circling
  circleOffsetX: number // Horizontal offset from mouse
  circleOffsetY: number // Vertical offset from mouse
  nextPeckDelay: number // Random delay before next peck
  circling: boolean // Whether currently circling
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
    // Add version to force regeneration if algorithm changes
    const POSITION_VERSION = 'v2'
    const versionKey = `vulnhub-positions-version`
    const storedVersion = sessionStorage.getItem(versionKey)
    
    // If version changed, clear old positions and regenerate
    if (storedVersion !== POSITION_VERSION) {
      sessionStorage.removeItem('vulnhub-binary-bits')
      sessionStorage.setItem(versionKey, POSITION_VERSION)
    }
    
    const seed = sessionStart ? parseInt(sessionStart, 10) : Date.now()
    const bitValues = getBits()

    bitValues.forEach((value, index) => {
      // Use different large prime numbers for X and Y to avoid correlation
      const getSeededValueX = (idx: number, min: number, max: number) => {
        // Use a different prime multiplier for X
        const val = seededRandom(seed + idx * 7919)
        return min + val * (max - min)
      }
      
      const getSeededValueY = (idx: number, min: number, max: number) => {
        // Use a different prime multiplier for Y
        const val = seededRandom(seed + idx * 9973)
        return min + val * (max - min)
      }

      const baseX = getSeededValueX(index, 0.05, 0.95)
      const baseY = getSeededValueY(index, 0.05, 0.95)
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
        circleAngle: seededRandom(seed + index * 29) * Math.PI * 2,
        circleRadius: 0.06 + seededRandom(seed + index * 31) * 0.04, // 0.06 to 0.10
        // Random circle shape - more circular (less oval)
        circleRadiusX: 0.06 + seededRandom(seed + index * 43) * 0.03, // 0.06 to 0.09
        circleRadiusY: 0.06 + seededRandom(seed + index * 47) * 0.03, // 0.06 to 0.09
        circleSpeed: 0.8 + seededRandom(seed + index * 37) * 1.2, // 0.8 to 2.0 (faster)
        // Small random offsets for more varied patterns
        circleOffsetX: (seededRandom(seed + index * 53) - 0.5) * 0.01, // -0.005 to 0.005
        circleOffsetY: (seededRandom(seed + index * 59) - 0.5) * 0.01, // -0.005 to 0.005
        nextPeckDelay: 0.2 + seededRandom(seed + index * 41) * 1.3, // 0.2 to 1.5 seconds (shorter)
        circling: false,
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
      // Use CSS pixel dimensions for simplicity
      canvas.width = rect.width
      canvas.height = rect.height
    }

    resizeCanvas()
    const resizeObserver = new ResizeObserver(() => {
      resizeCanvas()
    })
    resizeObserver.observe(canvas)
    
    window.addEventListener('resize', resizeCanvas)

    const ATTRACTION_DISTANCE = 0.25 // Expanded from 0.15
    const CIRCLE_DISTANCE = 0.08 // Start circling at this distance
    const PECK_DISTANCE = 0.05 // Slightly increased
    const ATTRACTION_STRENGTH = 0.0005 // Reduced for smoother approach
    const CIRCLE_STRENGTH = 0.0008 // Force to maintain circle
    const RETREAT_STRENGTH = 0.0018 // Increased for faster retreat
    const FRICTION = 0.94 // Increased friction for less bouncing
    const MAX_SPEED = 0.0025 // Slightly reduced max speed
    const RETURN_STRENGTH = 0.00015 // Much reduced for slower, smoother return
    const RETURN_FRICTION = 0.98 // Higher friction when returning for gradual slowdown
    const FLOAT_AMPLITUDE = 0.02
    const PECK_DURATION = 0.1 // Quick peck duration
    const RETREAT_DURATION = 0.25 // Retreat duration before reset

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
          // Interactive behavior - fish-like attraction with circling
          const dx = mousePos.x - bit.x
          const dy = mousePos.y - bit.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          bit.peckTimer += deltaSeconds

          if (distance < ATTRACTION_DISTANCE && distance > CIRCLE_DISTANCE) {
            // Approaching phase - smooth swim toward mouse
            bit.circling = false
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
          } else if (distance <= CIRCLE_DISTANCE) {
            // Circling phase - circle around mouse, can peck at any time
            bit.circling = true
            
            // Update circle angle
            bit.circleAngle += bit.circleSpeed * deltaSeconds
            
            // Calculate desired position on circle with random shape and offset
            // Use different X and Y radii for slight variation, but keep it mostly circular
            const targetX = mousePos.x + bit.circleOffsetX + Math.cos(bit.circleAngle) * bit.circleRadiusX
            const targetY = mousePos.y + bit.circleOffsetY + Math.sin(bit.circleAngle) * bit.circleRadiusY
            
            // Move toward circle position (only if not pecking)
            if (bit.peckPhase === 0) {
              const circleDx = targetX - bit.x
              const circleDy = targetY - bit.y
              const circleDist = Math.sqrt(circleDx * circleDx + circleDy * circleDy)
              
              if (circleDist > 0.01) {
                const circleAngle = Math.atan2(circleDy, circleDx)
                const avgRadius = (bit.circleRadiusX + bit.circleRadiusY) / 2
                const circleForce = CIRCLE_STRENGTH * Math.min(circleDist / avgRadius, 1)
                bit.vx += Math.cos(circleAngle) * circleForce * deltaSeconds * 60
                bit.vy += Math.sin(circleAngle) * circleForce * deltaSeconds * 60
              }
            }
            
            // Random peck timing - truly random while circling
            if (bit.peckPhase === 0) {
              bit.peckTimer += deltaSeconds
              
              // Check if it's time to consider pecking
              if (bit.peckTimer >= bit.nextPeckDelay) {
                // Use truly random chance - increased probability
                const random1 = Math.random()
                const random2 = Math.random()
                const combinedRandom = (random1 + random2) / 2
                
                // 40% chance to peck when timer expires (increased from 25%)
                if (combinedRandom < 0.4) {
                  bit.peckPhase = 1
                  bit.peckTimer = 0
                  // Set next random delay (0.2 to 1.5 seconds - shorter)
                  bit.nextPeckDelay = 0.2 + Math.random() * 1.3
                } else {
                  // Didn't peck, reset timer with new random delay (shorter)
                  bit.peckTimer = 0
                  bit.nextPeckDelay = 0.2 + Math.random() * 1.3
                }
              }
            } else if (bit.peckPhase === 1) {
              // Brief peck forward toward mouse - recalculate angle each frame
              if (bit.peckTimer < PECK_DURATION) {
                // Recalculate angle to current mouse position
                const currentDx = mousePos.x - bit.x
                const currentDy = mousePos.y - bit.y
                const angle = Math.atan2(currentDy, currentDx)
                // Quick forward movement directly toward cursor
                bit.vx += Math.cos(angle) * 0.003 * deltaSeconds * 60
                bit.vy += Math.sin(angle) * 0.003 * deltaSeconds * 60
                bit.peckTimer += deltaSeconds
              } else {
                // Switch to retreat
                bit.peckPhase = 2
                bit.peckTimer = 0
              }
            } else if (bit.peckPhase === 2) {
              // Retreat phase - back away from current mouse position
              if (bit.peckTimer < RETREAT_DURATION) {
                // Recalculate angle to current mouse position
                const currentDx = mousePos.x - bit.x
                const currentDy = mousePos.y - bit.y
                const angle = Math.atan2(currentDy, currentDx)
                // Strong retreat force away from cursor
                bit.vx -= Math.cos(angle) * RETREAT_STRENGTH * deltaSeconds * 60
                bit.vy -= Math.sin(angle) * RETREAT_STRENGTH * deltaSeconds * 60
                bit.peckTimer += deltaSeconds
              } else {
                // Reset to circling - can peck again randomly
                bit.peckPhase = 0
                bit.peckTimer = 0
                // New random delay before next peck consideration (shorter)
                bit.nextPeckDelay = 0.2 + Math.random() * 1.3
              }
            }
          } else if (distance <= PECK_DISTANCE) {
            // Very close - peck immediately if not already pecking
            bit.circling = false
            
            if (bit.peckPhase === 0) {
              // Start pecking immediately when very close
              bit.peckPhase = 1
              bit.peckTimer = 0
            } else if (bit.peckPhase === 1) {
              // Brief peck forward toward cursor
              if (bit.peckTimer < PECK_DURATION) {
                // Recalculate angle to current mouse position
                const currentDx = mousePos.x - bit.x
                const currentDy = mousePos.y - bit.y
                const angle = Math.atan2(currentDy, currentDx)
                bit.vx += Math.cos(angle) * 0.003 * deltaSeconds * 60
                bit.vy += Math.sin(angle) * 0.003 * deltaSeconds * 60
                bit.peckTimer += deltaSeconds
              } else {
                bit.peckPhase = 2
                bit.peckTimer = 0
              }
            } else if (bit.peckPhase === 2) {
              // Retreat from cursor
              if (bit.peckTimer < RETREAT_DURATION) {
                // Recalculate angle to current mouse position
                const currentDx = mousePos.x - bit.x
                const currentDy = mousePos.y - bit.y
                const angle = Math.atan2(currentDy, currentDx)
                bit.vx -= Math.cos(angle) * RETREAT_STRENGTH * deltaSeconds * 60
                bit.vy -= Math.sin(angle) * RETREAT_STRENGTH * deltaSeconds * 60
                bit.peckTimer += deltaSeconds
              } else {
                // Reset
                bit.peckPhase = 0
                bit.peckTimer = 0
                bit.nextPeckDelay = 0.2 + Math.random() * 1.3
              }
            }
          } else {
            // Too far away - reset to normal
            bit.circling = false
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
          // Return to base position - very slow and gradual
          const dx = bit.baseX - bit.x
          const dy = bit.baseY - bit.y
          const distance = Math.sqrt(dx * dx + dy * dy)

          if (distance > 0.0005) {
            const angle = Math.atan2(dy, dx)
            // Very gentle return force - gets even gentler as we approach
            const easingFactor = Math.min(distance / 0.15, 1) // Ease out as we get closer
            const returnForce = RETURN_STRENGTH * easingFactor
            bit.vx += Math.cos(angle) * returnForce * deltaSeconds * 60
            bit.vy += Math.sin(angle) * returnForce * deltaSeconds * 60
            
            // High friction when returning for very smooth, gradual motion
            bit.vx *= Math.pow(RETURN_FRICTION, deltaSeconds * 60)
            bit.vy *= Math.pow(RETURN_FRICTION, deltaSeconds * 60)
            
            bit.x += bit.vx * deltaSeconds * 60
            bit.y += bit.vy * deltaSeconds * 60
            
            // Gradually slow down as we approach base
            if (distance < 0.02) {
              bit.vx *= 0.95
              bit.vy *= 0.95
            }
          } else {
            // Very close - very slowly settle to exact position
            bit.x += (bit.baseX - bit.x) * 0.05
            bit.y += (bit.baseY - bit.y) * 0.05
            bit.vx *= 0.9
            bit.vy *= 0.9
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
        const opacity = bit.isInteractive && mousePos ? (bit.circling ? 0.7 : 0.6) : 0.4

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
