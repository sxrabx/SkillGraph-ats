import React, { useEffect, useRef, useState } from 'react'

/**
 * PIXEL TRAIL CURSOR EFFECT
 * Vanilla JS + HTML5 Canvas cursor trail (zero external libraries).
 * 
 * Mechanics:
 * - Quantises pointer path to a 20px grid with 2px gap (22px step)
 * - Ignites each touched cell to full heat (1.0)
 * - Decays all active cells by 0.96 per animation frame
 * - Linear interpolation (LERP) between mouse frames so fast strokes stay solid
 * - Gradient: #e40000 -> #ff5e0e @ 90deg
 * - Interactive hover response: detects elements matching `a, button, input` via closest()
 * 
 * Accessibility:
 * - Never hides or alters native system cursor (NO cursor: none)
 * - Pure additive overlay: position: fixed, pointer-events: none, aria-hidden="true"
 * - Respects prefers-reduced-motion: disabled completely
 * - Disables on touch / coarse pointers: only mounts when `(hover: hover) and (pointer: fine)`
 * - Capped at devicePixelRatio 2, auto-pauses when idle
 */
export default function PixelTrailCursor() {
  const canvasRef = useRef(null)
  const [isSupported, setIsSupported] = useState(false)

  // 1. Accessibility & Capabilities Guard
  useEffect(() => {
    if (typeof window === 'undefined') return

    const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const pointerQuery = window.matchMedia('(hover: hover) and (pointer: fine)')

    const evaluateCapabilities = () => {
      const allowed = !motionQuery.matches && pointerQuery.matches
      setIsSupported(allowed)
    }

    evaluateCapabilities()

    motionQuery.addEventListener('change', evaluateCapabilities)
    pointerQuery.addEventListener('change', evaluateCapabilities)

    return () => {
      motionQuery.removeEventListener('change', evaluateCapabilities)
      pointerQuery.removeEventListener('change', evaluateCapabilities)
    }
  }, [])

  // 2. Canvas & Grid Simulation
  useEffect(() => {
    if (!isSupported) return

    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext('2d', { alpha: true })
    if (!ctx) return

    // Specification parameters
    const CELL_SIZE = 20
    const GRID_GAP = 2
    const STEP_SIZE = CELL_SIZE + GRID_GAP // 22px
    const DECAY_RATE = 0.96

    // Map of active cells: key -> { col, row, heat }
    const activeCells = new Map()

    let prevPointer = null
    let latestPointer = null
    let rafId = null
    let isLoopRunning = false

    // Resize & High-DPI handling
    const handleResize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2)
      const width = window.innerWidth
      const height = window.innerHeight

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)

      // CSS display size
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`

      // Coordinate scaling
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0)
    }

    handleResize()
    window.addEventListener('resize', handleResize)

    // Cell igniter helper
    const igniteCell = (col, row, heat = 1.0) => {
      const key = `${col},${row}`
      const existing = activeCells.get(key)
      if (existing) {
        existing.heat = Math.min(1.0, Math.max(existing.heat, heat))
      } else {
        activeCells.set(key, { col, row, heat })
      }
    }

    // Pointer event handler with interpolation
    const handlePointerMove = (e) => {
      const currX = e.clientX
      const currY = e.clientY

      // Detect interactive target via closest('a, button, input')
      const targetElement = document.elementFromPoint(currX, currY)
      const isInteractive = !!targetElement?.closest('a, button, input, [role="button"]')

      if (!prevPointer) {
        prevPointer = { x: currX, y: currY }
      }

      latestPointer = {
        prevX: prevPointer.x,
        prevY: prevPointer.y,
        currX,
        currY,
        isInteractive
      }

      prevPointer = { x: currX, y: currY }

      // Wake up render loop if stopped
      if (!isLoopRunning) {
        isLoopRunning = true
        rafId = requestAnimationFrame(renderLoop)
      }
    }

    const handlePointerLeave = () => {
      prevPointer = null
      latestPointer = null
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    document.addEventListener('mouseleave', handlePointerLeave)

    // Main single rAF simulation & render loop
    const renderLoop = () => {
      const width = window.innerWidth
      const height = window.innerHeight

      // 1. Process latest pointer segment & interpolate between frames
      if (latestPointer) {
        const { prevX, prevY, currX, currY, isInteractive } = latestPointer
        const dx = currX - prevX
        const dy = currY - prevY
        const dist = Math.hypot(dx, dy)

        // Interpolation sampling distance (approx 8px ensures solid trail without gaps)
        const steps = Math.max(1, Math.ceil(dist / 8))

        for (let i = 0; i <= steps; i++) {
          const t = i / steps
          const sampleX = prevX + dx * t
          const sampleY = prevY + dy * t

          const col = Math.floor(sampleX / STEP_SIZE)
          const row = Math.floor(sampleY / STEP_SIZE)

          igniteCell(col, row, 1.0)

          // Interactive expansion: ignite 4 cross-neighbors for hover responsiveness
          if (isInteractive) {
            igniteCell(col - 1, row, 0.65)
            igniteCell(col + 1, row, 0.65)
            igniteCell(col, row - 1, 0.65)
            igniteCell(col, row + 1, 0.65)
          }
        }

        latestPointer = null
      }

      // 2. Clear canvas
      ctx.clearRect(0, 0, width, height)

      // 3. Render and decay all active cells
      if (activeCells.size > 0) {
        // Horizontal gradient #e40000 -> #ff5e0e @ 90deg across viewport width
        const gradient = ctx.createLinearGradient(0, 0, width, 0)
        gradient.addColorStop(0, '#e40000')
        gradient.addColorStop(1, '#ff5e0e')
        ctx.fillStyle = gradient

        for (const [key, cell] of activeCells.entries()) {
          // Decay heat
          cell.heat *= DECAY_RATE

          if (cell.heat < 0.012) {
            activeCells.delete(key)
            continue
          }

          const x = cell.col * STEP_SIZE
          const y = cell.row * STEP_SIZE

          ctx.globalAlpha = cell.heat
          ctx.fillRect(x, y, CELL_SIZE, CELL_SIZE)
        }
      }

      // 4. Continue or suspend rAF loop when idle to save GPU/CPU
      if (activeCells.size > 0 || latestPointer) {
        rafId = requestAnimationFrame(renderLoop)
      } else {
        ctx.clearRect(0, 0, width, height)
        isLoopRunning = false
      }
    }

    return () => {
      if (rafId) cancelAnimationFrame(rafId)
      window.removeEventListener('resize', handleResize)
      window.removeEventListener('pointermove', handlePointerMove)
      document.removeEventListener('mouseleave', handlePointerLeave)
      activeCells.clear()
    }
  }, [isSupported])

  if (!isSupported) return null

  return (
    <canvas
      ref={canvasRef}
      className="pixel-trail-canvas-overlay"
      aria-hidden="true"
    />
  )
}

