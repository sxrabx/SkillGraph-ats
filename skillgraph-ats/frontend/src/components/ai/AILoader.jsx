import React, { useState, useEffect } from 'react'

export const AI_LOADER_CYCLE_SECONDS = 1.4

/**
 * AILoader Component (/docs/components/ai-loader)
 * Variants: 'dots' | 'bar' | 'grid'. Shared cycle length. Honest live elapsed counter.
 */
export default function AILoader({
  variant = 'dots', // 'dots' | 'bar' | 'grid'
  showElapsed = false,
  label = 'Traversing Knowledge Graph...',
  className = ''
}) {
  const [elapsed, setElapsed] = useState(0)

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  useEffect(() => {
    if (!showElapsed) return
    const start = performance.now()
    const timer = setInterval(() => {
      setElapsed(((performance.now() - start) / 1000).toFixed(1))
    }, 100)

    return () => clearInterval(timer)
  }, [showElapsed])

  return (
    <div
      role="status"
      aria-live="polite"
      className={`ai-loader-container variant-${variant} ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.65rem',
        fontSize: '0.84rem',
        color: 'var(--text-muted-gray)',
        fontWeight: 600
      }}
    >
      {/* Variant 1: Dots */}
      {variant === 'dots' && (
        <div
          className="ai-loader-dots"
          aria-hidden="true"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
        >
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              style={{
                width: '6px',
                height: '6px',
                borderRadius: '50%',
                background: '#8b5cf6',
                display: 'inline-block',
                animation: prefersReducedMotion
                  ? 'none'
                  : `loaderDot ${AI_LOADER_CYCLE_SECONDS}s infinite ease-in-out ${i * 0.18}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Variant 2: Bar (sweeps, never fills with fake percent) */}
      {variant === 'bar' && (
        <div
          className="ai-loader-bar-track"
          aria-hidden="true"
          style={{
            width: '120px',
            height: '4px',
            borderRadius: '2px',
            background: 'rgba(139, 92, 246, 0.15)',
            overflow: 'hidden',
            position: 'relative'
          }}
        >
          <div
            className="ai-loader-bar-sweep"
            style={{
              position: 'absolute',
              top: 0,
              bottom: 0,
              width: '35%',
              borderRadius: '2px',
              background: 'linear-gradient(90deg, #7c3aed, #c084fc)',
              animation: prefersReducedMotion
                ? 'none'
                : `barSweep ${AI_LOADER_CYCLE_SECONDS}s infinite ease-in-out`
            }}
          />
        </div>
      )}

      {/* Variant 3: Grid */}
      {variant === 'grid' && (
        <div
          className="ai-loader-grid"
          aria-hidden="true"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 5px)',
            gap: '3px'
          }}
        >
          {[0, 1, 2, 3].map((i) => (
            <span
              key={i}
              style={{
                width: '5px',
                height: '5px',
                borderRadius: '1.5px',
                background: '#8b5cf6',
                animation: prefersReducedMotion
                  ? 'none'
                  : `gridPulse ${AI_LOADER_CYCLE_SECONDS}s infinite ease-in-out ${i * 0.12}s`
              }}
            />
          ))}
        </div>
      )}

      {/* Label */}
      {label && <span>{label}</span>}

      {/* Live Elapsed Counter */}
      {showElapsed && (
        <span
          className="ai-loader-elapsed"
          style={{
            fontVariantNumeric: 'tabular-nums',
            fontSize: '0.76rem',
            color: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.1)',
            padding: '1px 6px',
            borderRadius: '4px'
          }}
        >
          {elapsed}s
        </span>
      )}
    </div>
  )
}

