import React, { useEffect, useRef, useState, useCallback } from 'react'
import { RotateCcw, ZoomIn, ZoomOut, Sparkles, Activity, Layers, Cpu } from 'lucide-react'
import { ParticleStudio } from '../lib/particle-field/engine.js'

const SETTINGS = {
  count: 250000,
  size: 1.45,
  speed: 0.2,
  opacity: 0.7,
  bloomStrength: 0.75,
  bloomRadius: 0.08,
  bloomThreshold: 0.21,
  colorA: '#ff8c00',
  colorB: '#ff2626',
  autorotate: false
}

const FORM = {
  kind: 'neuron',
  seed: 4020692067
}

const DPR_CAP = 2

export default function NeuronParticleField({ className = '' }) {
  const containerRef = useRef(null)
  const canvasRef = useRef(null)
  const studioRef = useRef(null)
  const [isLoaded, setIsLoaded] = useState(false)
  const [stats, setStats] = useState({
    fps: 60,
    particles: '250,000',
    archetype: 'Neuron',
    seed: '4020692067'
  })

  useEffect(() => {
    const container = containerRef.current
    const canvas = canvasRef.current
    if (!container || !canvas) return

    let studio = null
    let rafId = null
    let resizeObserver = null
    let intersectionObserver = null
    let isDisposed = false

    try {
      studio = new ParticleStudio(canvas, { ...SETTINGS })
      studioRef.current = studio

      // 1. Initial size & ResizeObserver
      const handleResize = () => {
        if (isDisposed || !container || !studio) return
        const w = container.clientWidth
        const h = container.clientHeight
        if (!w || !h) return
        const dpr = Math.min(window.devicePixelRatio || 1, DPR_CAP)
        studio.resize(w, h, dpr)
      }

      handleResize()
      resizeObserver = new ResizeObserver(handleResize)
      resizeObserver.observe(container)

      // 2. Initial form presentation: "gather" in from wide sphere (scale 4), morph 2.6s
      studio.showForm(FORM.kind, FORM.seed, 'gather').then(() => {
        if (!isDisposed) {
          setIsLoaded(true)
        }
      }).catch(err => {
        console.warn('Particle form showForm error:', err)
        if (!isDisposed) setIsLoaded(true)
      })

      // 3. Render loop with IntersectionObserver pause when offscreen
      let playing = true
      let last = performance.now()
      let frameCount = 0
      let lastFpsTime = performance.now()

      intersectionObserver = new IntersectionObserver(
        ([entry]) => {
          playing = entry.isIntersecting
          last = performance.now()
        },
        { threshold: 0.01 }
      )
      intersectionObserver.observe(container)

      const tick = (now) => {
        if (isDisposed) return
        const dt = Math.min(0.05, (now - last) / 1000)
        last = now

        if (playing && studio) {
          studio.renderFrame(dt)

          // FPS counter (sampled once per second)
          frameCount++
          if (now - lastFpsTime >= 1000) {
            const currentFps = Math.round((frameCount * 1000) / (now - lastFpsTime))
            setStats(prev => ({ ...prev, fps: currentFps }))
            frameCount = 0
            lastFpsTime = now
          }
        }

        rafId = requestAnimationFrame(tick)
      }

      rafId = requestAnimationFrame(tick)
    } catch (err) {
      console.error('Failed to initialize ParticleStudio:', err)
    }

    return () => {
      isDisposed = true
      if (rafId) cancelAnimationFrame(rafId)
      if (resizeObserver) resizeObserver.disconnect()
      if (intersectionObserver) intersectionObserver.disconnect()
      if (studio) {
        try {
          studio.dispose()
        } catch (e) {
          // ignore cleanup errors
        }
      }
      studioRef.current = null
    }
  }, [])

  const handleResetCamera = useCallback(() => {
    if (studioRef.current) {
      studioRef.current.resetView()
    }
  }, [])

  const handleZoomIn = useCallback(() => {
    if (studioRef.current) {
      studioRef.current.zoomBy(0.85) // closer
    }
  }, [])

  const handleZoomOut = useCallback(() => {
    if (studioRef.current) {
      studioRef.current.zoomBy(1.15) // further
    }
  }, [])

  return (
    <div className={`swiss-specimen-viewport ${className}`}>
      {/* Precision architectural corner crosshairs */}
      <div className="specimen-corner-marks" aria-hidden="true">
        <span className="specimen-corner top-left">+</span>
        <span className="specimen-corner top-right">+</span>
        <span className="specimen-corner bottom-left">+</span>
        <span className="specimen-corner bottom-right">+</span>
      </div>

      {/* Top Telemetry Header Bar */}
      <div className="specimen-header-bar">
        <div className="specimen-title-group">
          <span className="specimen-pulse-indicator"></span>
          <span className="specimen-sys-id">[ NEURO.DAG // SPECIMEN 01 ]</span>
          <span className="specimen-badge">GPU SHADER</span>
        </div>

        <div className="specimen-hud-metrics">
          <span className="hud-mini-stat">
            <Cpu size={11} className="hud-icon text-orange" />
            <span>250K PTS</span>
          </span>
          <span className="hud-mini-stat">
            <Activity size={11} className="hud-icon text-orange" />
            <span>{stats.fps} FPS</span>
          </span>
        </div>
      </div>

      {/* Main 3D Canvas Container */}
      <div 
        ref={containerRef} 
        className="specimen-canvas-container"
        title="Click and drag to rotate the 3D neural particle field"
      >
        <canvas 
          ref={canvasRef} 
          className="specimen-webgl-canvas"
        />

        {/* Floating Interactive Controls (Reset, Zoom In, Zoom Out) */}
        <div className="specimen-floating-toolbar" role="toolbar" aria-label="Specimen view controls">
          <button 
            type="button" 
            onClick={handleZoomIn} 
            className="specimen-tool-btn" 
            title="Zoom In"
            aria-label="Zoom in"
          >
            <ZoomIn size={14} />
          </button>
          <button 
            type="button" 
            onClick={handleZoomOut} 
            className="specimen-tool-btn" 
            title="Zoom Out"
            aria-label="Zoom out"
          >
            <ZoomOut size={14} />
          </button>
          <button 
            type="button" 
            onClick={handleResetCamera} 
            className="specimen-tool-btn" 
            title="Reset Perspective"
            aria-label="Reset perspective"
          >
            <RotateCcw size={13} />
          </button>
        </div>

        {/* Subtle Watermark Overlay */}
        <div className="specimen-overlay-label" aria-hidden="true">
          <span className="specimen-label-mono">ARCHETYPE: NEURON</span>
          <span className="specimen-label-sub">SEED: 4020692067 • BLOOM: 0.75</span>
        </div>
      </div>

      {/* Bottom Architectural Telemetry Strip */}
      <div className="specimen-footer-strip">
        <div className="footer-meta-item">
          <span className="meta-k">TOPOLOGY</span>
          <span className="meta-v">SYNAPTIC FILAMENTS</span>
        </div>
        <div className="footer-meta-sep">/</div>
        <div className="footer-meta-item">
          <span className="meta-k">SOLVER</span>
          <span className="meta-v text-orange">DETERMINISTIC GLSL1</span>
        </div>
        <div className="footer-meta-sep">/</div>
        <div className="footer-meta-item">
          <span className="meta-k">ORBIT</span>
          <span className="meta-v">INTERACTIVE DAMPED</span>
        </div>
      </div>
    </div>
  )
}

