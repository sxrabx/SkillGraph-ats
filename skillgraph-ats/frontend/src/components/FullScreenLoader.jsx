import React, { useState, useEffect, useRef } from 'react'
import { motion, useReducedMotion } from 'framer-motion'

/**
 * REIMAGINED SWISS BRUTALIST CALIBRATION LOADER
 * 
 * Aesthetic:
 * - High-density Swiss technical telemetry
 * - Giant tabular grotesque numeral counter
 * - Heavy-duty monolithic progress bar with 25% / 50% / 75% ruler ticks
 * - Live terminal telemetry steps with blinking cursor
 * - 4 Corner coordinate stamps
 * - Alternating architectural guillotine column exit reveal
 */
export default function FullScreenLoader({ onFinish, onStartExit }) {
  const shouldReduceMotion = useReducedMotion()
  const [progress, setProgress] = useState(0)
  const [isExiting, setIsExiting] = useState(false)
  const [isUnmounted, setIsUnmounted] = useState(false)
  
  const hasTriggeredExitRef = useRef(false)
  const hasFinishedRef = useRef(false)

  // 1. Progress Counter Simulation (0% -> 100%)
  useEffect(() => {
    if (shouldReduceMotion) {
      setProgress(100)
      if (onStartExit && !hasTriggeredExitRef.current) {
        hasTriggeredExitRef.current = true
        onStartExit()
      }
      const t = setTimeout(() => {
        setIsUnmounted(true)
        if (onFinish && !hasFinishedRef.current) {
          hasFinishedRef.current = true
          onFinish()
        }
      }, 300)
      return () => clearTimeout(t)
    }

    const duration = 1600 // High-speed, authoritative telemetry pacing
    const startTime = performance.now()
    let frameId

    const step = (now) => {
      const elapsed = now - startTime
      const p = Math.min(1, elapsed / duration)
      // Swiss Brutalist pacing: purposeful acceleration, deliberate mechanical brake into 100
      const eased = p < 0.6 ? Math.pow(p / 0.6, 1.2) * 0.7 : 0.7 + (1 - Math.pow(1 - (p - 0.6) / 0.4, 2.5)) * 0.3
      const current = Math.min(100, Math.floor(eased * 100))

      setProgress(current)

      if (p < 1) {
        frameId = requestAnimationFrame(step)
      } else {
        setProgress(100)
        // Brief hold at 100%, then trigger heavy architectural exit
        setTimeout(() => {
          setIsExiting(true)
          if (onStartExit && !hasTriggeredExitRef.current) {
            hasTriggeredExitRef.current = true
            onStartExit()
          }

          // Complete exit after columns finish animating
          setTimeout(() => {
            setIsUnmounted(true)
            if (onFinish && !hasFinishedRef.current) {
              hasFinishedRef.current = true
              onFinish()
            }
          }, 850)
        }, 220)
      }
    }

    frameId = requestAnimationFrame(step)
    return () => cancelAnimationFrame(frameId)
  }, [shouldReduceMotion, onStartExit, onFinish])

  if (isUnmounted) return null

  // Tabular number string
  const formattedProgress = `${String(progress).padStart(2, '0')}%`

  // Live Terminal Telemetry Step Description
  const getStatusText = (val) => {
    if (val < 25) return 'INDEXING DIRECTED ACYCLIC GRAPH ONTOLOGY...'
    if (val < 55) return 'VECTORIZING 2048-D NVIDIA NIM CLOUD EMBEDDINGS...'
    if (val < 85) return 'MOUNTING GROQ LPU INFERENCE ENGINE (<45MS)...'
    if (val < 100) return 'VERIFYING PYMUPDF VISUAL EVIDENCE PIPELINE...'
    return 'CALIBRATION COMPLETE // ALL SYSTEMS OPERATIONAL'
  }

  // 4 Alternating Vertical Architectural Guillotine Columns
  const columns = [
    { id: 0, direction: -1, delay: 0.0 },   // shoots UP
    { id: 1, direction: 1, delay: 0.05 },    // shoots DOWN
    { id: 2, direction: -1, delay: 0.09 },   // shoots UP
    { id: 3, direction: 1, delay: 0.13 }     // shoots DOWN
  ]

  const shutterEase = [0.85, 0, 0.15, 1] // Heavy architectural guillotine acceleration

  return (
    <div className="brutalist-loader-root" aria-hidden="true">
      {/* 4 REVEAL PANELS (Guillotine Columns) */}
      <div className="brutalist-shutter-columns">
        {columns.map((col) => (
          <motion.div
            key={col.id}
            className={`shutter-column col-${col.id}`}
            initial={{ y: '0%' }}
            animate={isExiting ? { y: col.direction === -1 ? '-101%' : '101%' } : { y: '0%' }}
            transition={{
              duration: 0.75,
              delay: col.delay,
              ease: shutterEase
            }}
          />
        ))}
      </div>

      {/* FOREGROUND HUD CONTENT (Fades out just as shutters fly apart) */}
      <motion.div 
        className="brutalist-loader-hud"
        animate={isExiting ? { opacity: 0, scale: 0.98 } : { opacity: 1, scale: 1 }}
        transition={{ duration: 0.18, ease: 'easeOut' }}
      >
        {/* 4 Structural Corner Coordinate Brackets */}
        <div className="hud-corner top-left">
          <span className="corner-cross">+</span>
          <span className="corner-coord">[ 00.00 // SYS.INIT ]</span>
        </div>

        <div className="hud-corner top-right">
          <span className="corner-coord">[ 2048-D // NVIDIA.NIM ]</span>
          <span className="corner-cross">+</span>
        </div>

        <div className="hud-corner bottom-left">
          <span className="corner-cross">+</span>
          <span className="corner-coord">[ GROQ // &lt;45MS ]</span>
        </div>

        <div className="hud-corner bottom-right">
          <span className="corner-coord">[ KERNEL // v2.4 ]</span>
          <span className="corner-cross">+</span>
        </div>

        {/* Center Stage: Hero Numeral + Chunky Progress Bar */}
        <div className="hud-center-stage">
          {/* Top Stamp */}
          <div className="hud-system-stamp">
            <span className="stamp-badge">SYS.CALIBRATION</span>
            <span className="stamp-line"></span>
            <span className="stamp-channel">CH-01 // REALTIME</span>
          </div>

          {/* Massive Tabular Numeral */}
          <div className="hud-number-row">
            <span className="hud-big-num">{formattedProgress}</span>
          </div>

          {/* Monolithic Chunky Progress Bar */}
          <div className="hud-progress-block">
            <div className="hud-bar-frame">
              {/* Internal Tick Dividers */}
              <div className="bar-tick tick-25"></div>
              <div className="bar-tick tick-50"></div>
              <div className="bar-tick tick-75"></div>

              {/* Animated Solid Orange Fill */}
              <div 
                className="hud-bar-fill" 
                style={{ width: `${progress}%` }}
              >
                <div className="fill-edge-indicator"></div>
              </div>
            </div>

            {/* Ruler Markings */}
            <div className="hud-ruler-row">
              <span className="ruler-mark">| 00%</span>
              <span className="ruler-mark">| 25%</span>
              <span className="ruler-mark">| 50%</span>
              <span className="ruler-mark">| 75%</span>
              <span className="ruler-mark">| 100%</span>
            </div>
          </div>

          {/* Dynamic Console Telemetry */}
          <div className="hud-telemetry-box">
            <span className="telemetry-prompt">&gt;</span>
            <span className="telemetry-text">{getStatusText(progress)}</span>
            <span className="telemetry-cursor">▮</span>
          </div>
        </div>

        {/* Bottom Status Ticker */}
        <div className="hud-bottom-bar">
          <div className="hud-status-item">
            <span className="item-dot"></span>
            <span>MEMORY: 0x7FFF98A2</span>
          </div>
          <div className="hud-status-item">
            <span>PIPELINE: DETERMINISTIC</span>
          </div>
          <div className="hud-status-item">
            <span>STATE: {progress === 100 ? 'ARMED' : 'CALIBRATING'}</span>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
