import React, { useState, useEffect } from 'react'
import Logo from './Logo'

export default function FullScreenLoader({ onFinish }) {
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isUnmounted, setIsUnmounted] = useState(false)

  const safeProgress = Number.isFinite(progress) ? Math.max(0, Math.min(100, progress)) : 0
  const radius = 140
  const circumference = 2 * Math.PI * radius // ~879.64
  const strokeOffset = circumference - (safeProgress / 100) * circumference

  useEffect(() => {
    // Smooth progress animation from 0% to 100%
    const startTime = performance.now()
    const duration = 1800 // 1.8 seconds loading time

    const animateProgress = (currentTime) => {
      const elapsed = currentTime - startTime
      const currentProgress = Math.min(100, (elapsed / duration) * 100)
      
      // Easing curve for realistic loading (accelerates then decelerates to 100)
      const eased = Math.min(100, Math.pow(currentProgress / 100, 0.9) * 100)
      setProgress(eased)

      if (elapsed < duration) {
        requestAnimationFrame(animateProgress)
      } else {
        setProgress(100)
        // Hold at 100% for 200ms, then trigger flying upwards exit animation
        setTimeout(() => {
          setIsExiting(true)
          // Unmount after exit slide completes (750ms)
          setTimeout(() => {
            setIsUnmounted(true)
            if (onFinish) onFinish()
          }, 750)
        }, 220)
      }
    }

    const frameId = requestAnimationFrame(animateProgress)
    return () => cancelAnimationFrame(frameId)
  }, [onFinish])

  if (isUnmounted) return null

  return (
    <div 
      className={`fullscreen-loader-overlay ${isExiting ? 'flying-upwards' : ''}`}
      aria-hidden="true"
    >
      <div className="loader-ambient-glow"></div>

      <div className="loader-center-container">
        {/* SVG Loading Ring with exact 9px stroke */}
        <div className="loader-circle-wrapper">
          <svg 
            width="320" 
            height="320" 
            viewBox="0 0 320 320" 
            className="loader-svg-circle"
          >
            <defs>
              <linearGradient id="purpleRingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#c084fc" />
                <stop offset="50%" stopColor="#9d72ff" />
                <stop offset="100%" stopColor="#7c3aed" />
              </linearGradient>
            </defs>

            {/* Inactive Track (9px stroke) */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="transparent"
              stroke="rgba(255, 255, 255, 0.07)"
              strokeWidth="9"
            />

            {/* Animated Active Purple Ring (9px stroke) */}
            <circle
              cx="160"
              cy="160"
              r={radius}
              fill="transparent"
              stroke="url(#purpleRingGrad)"
              strokeWidth="9"
              strokeLinecap="round"
              strokeDasharray={circumference}
              strokeDashoffset={strokeOffset}
              style={{
                filter: 'drop-shadow(0 0 12px rgba(168, 85, 247, 0.65))',
                transformOrigin: 'center',
                transform: 'rotate(-90deg)',
                transition: 'stroke-dashoffset 0.05s linear'
              }}
            />
          </svg>

          {/* Logo Placed in the Center */}
          <div className="loader-logo-content">
            <Logo height={48} />
          </div>
        </div>

        {/* Loading status & percentage */}
        <div className="loader-status-info">
          <span className="loader-percentage">{Math.round(progress)}%</span>
          <span className="loader-status-text">
            {progress < 40 
              ? 'Initializing DAG Ontology...' 
              : progress < 85 
                ? 'Loading 2048-dim Cloud GPU Vectors...' 
                : 'Ready'}
          </span>
        </div>
      </div>
    </div>
  )
}

