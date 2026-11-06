import React, { useRef, useEffect, useState } from 'react'
import { useReducedMotion } from 'framer-motion'

/**
 * Shader Reveal Stripes Transition
 * Full-screen WebGL / Canvas shader shutter transition triggered by `transitionKey`.
 * Bars are thinner and closely spaced (32 stripes) with pure International Orange Swiss palette.
 * Swaps semantic React content at the shader midpoint (progress = 0.5).
 */
export default function ShaderRevealStripesTransition({
  transitionKey,
  children,
  duration = 440, // ms
  stripeCount = 32, // Thinner, closer slats as requested
  onRest,
  className = ''
}) {
  const shouldReduceMotion = useReducedMotion()
  const canvasRef = useRef(null)

  const prevKeyRef = useRef(transitionKey)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [displayedChildren, setDisplayedChildren] = useState(children)

  useEffect(() => {
    if (prevKeyRef.current === transitionKey) {
      setDisplayedChildren(children)
      return
    }

    prevKeyRef.current = transitionKey

    if (shouldReduceMotion) {
      setDisplayedChildren(children)
      if (onRest) onRest()
      return
    }

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

      if (progress >= 0.5 && !hasSwappedContent) {
        setDisplayedChildren(children)
        hasSwappedContent = true
      }

      ctx.clearRect(0, 0, width, height)

      const stripeWidth = width / stripeCount
      
      for (let i = 0; i < stripeCount; i++) {
        const x = i * stripeWidth
        const stripeDelay = (i / stripeCount) * 0.18
        const localProgress = Math.max(0, Math.min(1, (progress - stripeDelay) / 0.82))

        let slatScale = 0
        if (localProgress < 0.5) {
          slatScale = localProgress * 2
        } else {
          slatScale = (1 - localProgress) * 2
        }

        const slatCurrentWidth = stripeWidth * Math.min(1, slatScale)

        if (slatCurrentWidth > 0) {
          // Pure Swiss International Orange Gradient (Zero Purple!)
          const grad = ctx.createLinearGradient(x, 0, x + stripeWidth, height)
          grad.addColorStop(0, '#ff3700')
          grad.addColorStop(0.5, '#ff5500')
          grad.addColorStop(1, '#ff7a00')

          ctx.fillStyle = grad
          // Render thin, closely spaced shutter blade
          ctx.fillRect(x + (stripeWidth - slatCurrentWidth) / 2, 0, slatCurrentWidth + 1.2, height)

          // Specular high-contrast edge line
          ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)'
          ctx.lineWidth = 1
          ctx.beginPath()
          ctx.moveTo(x + (stripeWidth - slatCurrentWidth) / 2, 0)
          ctx.lineTo(x + (stripeWidth - slatCurrentWidth) / 2, height)
          ctx.stroke()
        }
      }

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(render)
      } else {
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
      {displayedChildren}

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
