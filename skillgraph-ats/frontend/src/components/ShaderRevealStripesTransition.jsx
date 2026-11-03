import React, { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Shader Reveal Stripes Transition
 * Full-screen WebGL / Canvas shader shutter transition triggered by `transitionKey`.
 * Swaps semantic React content at the shader midpoint (progress = 0.5).
 * Accessible: Honors `prefers-reduced-motion` and calls `onRest`.
 */
export default function ShaderRevealStripesTransition({
  transitionKey,
  children,
  duration = 480, // ms
  stripeCount = 14,
  onRest,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef(null)

  // Track key changes
  const prevKeyRef = useRef(transitionKey)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedChildren, setDisplayedChildren] = useState(children)

  useEffect(() => {
    // If key hasn't changed, keep children in sync
    if (prevKeyRef.current === transitionKey) {
      setDisplayedChildren(children)
      return
    }

    prevKeyRef.current = transitionKey

    // If reduced motion is preferred, swap immediately with no transition
    if (shouldReduceMotion) {
      setDisplayedChildren(children)
      if (onRest) onRest()
      return
    }

    // Start shader shutter transition
    setIsTransitioning(true)
    let animationFrameId
    const startTime = performance.now()
    let hasSwappedContent = false

    const canvas = canvasRef.current
    if (!canvas) {
      setDisplayedChildren(children)
      setIsTransitioning(false)
      return
    }

    const ctx = canvas.getContext('2d')
    const width = (canvas.width = window.innerWidth)
    const height = (canvas.height = window.innerHeight)

    const render = (now) => {
      const elapsed = now - startTime
      const progress = Math.min(1, elapsed / duration)

      // Midpoint swap: update React semantic children at progress >= 0.5
      if (progress >= 0.5 && !hasSwappedContent) {
        setDisplayedChildren(children)
        hasSwappedContent = true
      }

      // Draw Shader Shutter Stripes
      ctx.clearRect(0, 0, width, height)

      const stripeWidth = width / stripeCount
      
      // Calculate shutter closing and opening phase
      for (let i = 0; i < stripeCount; i++) {
        const x = i * stripeWidth
        // Stagger stripes from left to right with slight wave
        const stripeDelay = (i / stripeCount) * 0.2
        const localProgress = Math.max(0, Math.min(1, (progress - stripeDelay) / 0.8))

        let slatScale = 0
        if (localProgress < 0.5) {
          // Shutter closing (0 -> 1)
          slatScale = localProgress * 2
        } else {
          // Shutter opening (1 -> 0)
          slatScale = (1 - localProgress) * 2
        }

        const slatCurrentWidth = stripeWidth * Math.min(1, slatScale)

        if (slatCurrentWidth > 0) {
          // Purple gradient shutter slats
          const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, height)
          grad.addColorStop(0, '#7c3aed')
          grad.addColorStop(0.5, '#9d72ff')
          grad.addColorStop(1, '#4f46e5')

          ctx.fillStyle = grad
          // Draw shutter blade with rounded corner accents
          ctx.fillRect(x + (stripeWidth - slatCurrentWidth) / 2, 0, slatCurrentWidth + 1, height)

          // Specular highlight line along edge of shutter slat
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)'
          ctx.lineWidth = 1.5
          ctx.beginPath()
          ctx.moveTo(x + (stripeWidth - slatCurrentWidth) / 2, 0)
          ctx.lineTo(x + (stripeWidth - slatCurrentWidth) / 2, height)
          ctx.stroke()
        }
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render)
      } else {
        // Shutter transition finished
        ctx.clearRect(0, 0, width, height)
        setIsTransitioning(false)
        if (onRest) onRest()
      }
    }

    animationFrameId = requestAnimationFrame(render)

    return () => {
      cancelAnimationFrame(animationFrameId)
    }
  }, [transitionKey, children, duration, stripeCount, shouldReduceMotion, onRest])

  return (
    <div className={`shader-reveal-stripes-container ${className}`} style={{ position: 'relative' }}>
      {/* Semantic Content */}
      {displayedChildren}

      {/* Persistent Canvas Overlay */}
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        style={{
          position: 'fixed',
          inset: 0,
          width: '100vw',
          height: '100vh',
          pointerEvents: isTransitioning ? 'all' : 'none',
          zIndex: 999999,
          display: isTransitioning ? 'block' : 'none'
        }}
      />
    </div>
  )
}

