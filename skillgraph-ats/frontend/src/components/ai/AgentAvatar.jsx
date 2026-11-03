import React, { useRef, useEffect } from 'react'

/**
 * Simple string hash for deterministic pattern generation
 */
function hashString(str) {
  let hash = 5381
  for (let i = 0; i < str.length; i++) {
    hash = ((hash << 5) + hash) + str.charCodeAt(i)
    hash = hash & hash
  }
  return Math.abs(hash)
}

/**
 * AgentAvatar Component (/docs/components/agent-avatar)
 * Deterministic pixel patterns from seed, animated color oscillation, retina-ready, circular clipping.
 */
export default function AgentAvatar({
  seed = 'SkillGraph-AI',
  size = 36,
  gridSize = 7,
  className = '',
  glowColor = 'rgba(168, 85, 247, 0.45)',
  style = {}
}) {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = Math.min(2, window.devicePixelRatio || 1)
    canvas.width = size * dpr
    canvas.height = size * dpr
    canvas.style.width = `${size}px`
    canvas.style.height = `${size}px`
    ctx.scale(dpr, dpr)

    // Check prefers-reduced-motion
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

    // Generate deterministic grid pattern from seed
    const hash = hashString(seed)
    const grid = []
    const half = Math.ceil(gridSize / 2)

    for (let y = 0; y < gridSize; y++) {
      grid[y] = []
      for (let x = 0; x < half; x++) {
        // Pseudo-random bit based on position and hash
        const bitHash = hashString(`${seed}-${x}-${y}-${hash}`)
        const active = (bitHash % 100) > 42
        const phase = (bitHash % 360) * (Math.PI / 180)
        grid[y][x] = { active, phase }
        grid[y][gridSize - 1 - x] = { active, phase } // Horizontal symmetry
      }
    }

    const cellSize = size / gridSize

    // Render function
    const render = (time = 0) => {
      ctx.clearRect(0, 0, size, size)

      // Circular clipping path
      ctx.save()
      ctx.beginPath()
      ctx.arc(size / 2, size / 2, size / 2 - 1, 0, Math.PI * 2)
      ctx.clip()

      // Dark background disc
      ctx.fillStyle = '#0f172a'
      ctx.fillRect(0, 0, size, size)

      // Draw pixel pattern with color oscillation
      const t = time * 0.002
      for (let y = 0; y < gridSize; y++) {
        for (let x = 0; x < gridSize; x++) {
          const cell = grid[y][x]
          if (cell.active) {
            // Oscillate hue & lightness around purple/violet palette
            const osc = Math.sin(t + cell.phase)
            const hue = 265 + osc * 25 // 240 (indigo) to 290 (magenta)
            const light = 58 + osc * 18 // 40% to 76%
            ctx.fillStyle = `hsl(${hue}, 85%, ${light}%)`

            const px = x * cellSize
            const py = y * cellSize
            ctx.fillRect(px, py, cellSize, cellSize)
          }
        }
      }

      ctx.restore()
    }

    if (prefersReducedMotion) {
      render(0)
      return
    }

    let animId
    const loop = (timestamp) => {
      render(timestamp)
      animId = requestAnimationFrame(loop)
    }

    animId = requestAnimationFrame(loop)

    return () => {
      if (animId) cancelAnimationFrame(animId)
    }
  }, [seed, size, gridSize])

  return (
    <div
      className={`agent-avatar-wrapper ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: '50%',
        boxShadow: `0 0 12px ${glowColor}, 0 2px 6px rgba(0, 0, 0, 0.2)`,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0,
        overflow: 'hidden',
        border: '1.5px solid rgba(168, 85, 247, 0.5)',
        ...style
      }}
    >
      <canvas
        ref={canvasRef}
        role="img"
        aria-label={`Agent avatar for ${seed}`}
        style={{ display: 'block' }}
      />
    </div>
  )
}

