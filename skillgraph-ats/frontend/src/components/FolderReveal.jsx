import React, { useState, useRef, useEffect, useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { FileText, Download, Eye, ExternalLink } from 'lucide-react'

/**
 * Bright, theme-resilient color palettes (visible in both light & dark themes)
 */
export const FOLDER_PALETTES = {
  brand: {
    back: '#7c3aed',
    tab: '#6d28d9',
    flap: '#8b5cf6',
    well: '#5b21b6',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(139, 92, 246, 0.35)'
  },
  blue: {
    back: '#0284c7',
    tab: '#0369a1',
    flap: '#0ea5e9',
    well: '#075985',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(14, 165, 233, 0.35)'
  },
  green: {
    back: '#059669',
    tab: '#047857',
    flap: '#10b981',
    well: '#065f46',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(16, 185, 129, 0.35)'
  },
  amber: {
    back: '#d97706',
    tab: '#b45309',
    flap: '#f59e0b',
    well: '#92400e',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(245, 158, 11, 0.35)'
  },
  rose: {
    back: '#e11d48',
    tab: '#be123c',
    flap: '#f43f5e',
    well: '#9f1239',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(244, 63, 94, 0.35)'
  },
  violet: {
    back: '#4f46e5',
    tab: '#4338ca',
    flap: '#6366f1',
    well: '#3730a3',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(99, 102, 241, 0.35)'
  },
  cyan: {
    back: '#0891b2',
    tab: '#0e7490',
    flap: '#06b6d4',
    well: '#155e75',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(6, 182, 212, 0.35)'
  },
  pink: {
    back: '#db2777',
    tab: '#be185d',
    flap: '#ec4899',
    well: '#9d174d',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(236, 72, 153, 0.35)'
  },
  manila: {
    back: '#d97706',
    tab: '#b45309',
    flap: '#f59e0b',
    well: '#92400e',
    tabText: '#ffffff',
    highlight: 'rgba(255, 255, 255, 0.45)',
    glow: 'rgba(245, 158, 11, 0.35)'
  }
}

/**
 * FolderReveal Component (/docs/components/folder-reveal)
 * Realistic folder silhouette, two shaded planes, inner well, contact shadow, peek & fan card physics.
 */
export default function FolderReveal({
  label = 'Candidate Dossier',
  items = [],
  color = 'brand',
  size = 280, // width in pixels
  trigger = 'hover', // 'hover' | 'click'
  open: controlledOpen,
  onOpenChange,
  className = '',
  onItemClick,
  badge
}) {
  const [internalOpen, setInternalOpen] = useState(false)
  const [canHover, setCanHover] = useState(false)
  const containerRef = useRef(null)
  const isControlled = controlledOpen !== undefined
  const isOpen = isControlled ? controlledOpen : internalOpen
  const shouldReduceMotion = useReducedMotion()

  // Real folders are wider than tall (aspect ratio roughly 1.32 : 1)
  const width = size
  const height = Math.round(size / 1.34)
  const tabHeight = Math.round(height * 0.17)
  const tabWidth = Math.round(width * 0.42)
  const flapHeight = height - tabHeight + 8

  // Resolve color palette
  const palette = FOLDER_PALETTES[color] || FOLDER_PALETTES.brand

  // Check if pointer fine hover is available
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const mq = window.matchMedia('(hover: hover) and (pointer: fine)')
      setCanHover(mq.matches)
      const handler = (e) => setCanHover(e.matches)
      mq.addEventListener('change', handler)
      return () => mq.removeEventListener('change', handler)
    }
  }, [])

  const handleToggle = (nextOpen) => {
    const updated = nextOpen !== undefined ? nextOpen : !isOpen
    if (isControlled) {
      onOpenChange && onOpenChange(updated)
    } else {
      setInternalOpen(updated)
      onOpenChange && onOpenChange(updated)
    }
  }

  // Pointer hover interactions
  const handleMouseEnter = () => {
    if (trigger === 'hover' && canHover) {
      handleToggle(true)
    }
  }

  const handleMouseLeave = () => {
    if (trigger === 'hover' && canHover) {
      handleToggle(false)
    }
  }

  // Keyboard navigation
  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      handleToggle()
    } else if (e.key === 'Escape' && isOpen) {
      e.preventDefault()
      handleToggle(false)
    }
  }

  // Back panel silhouette SVG path with top-left tab
  const cornerRadius = 14
  const tabJoinRadius = 10
  const backPath = `
    M 0 ${cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${cornerRadius} 0
    L ${tabWidth - tabJoinRadius} 0
    Q ${tabWidth} 0 ${tabWidth + 4} ${tabJoinRadius * 0.5}
    L ${tabWidth + 14} ${tabHeight - 4}
    Q ${tabWidth + 18} ${tabHeight} ${tabWidth + 26} ${tabHeight}
    L ${width - cornerRadius} ${tabHeight}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width} ${tabHeight + cornerRadius}
    L ${width} ${height - cornerRadius}
    A ${cornerRadius} ${cornerRadius} 0 0 1 ${width - cornerRadius} ${height}
    L ${cornerRadius} ${height}
    A ${cornerRadius} ${cornerRadius} 0 0 1 0 ${height - cornerRadius}
    Z
  `

  return (
    <div
      ref={containerRef}
      className={`folder-reveal-component ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={() => trigger === 'hover' && handleToggle(true)}
      onBlur={(e) => {
        if (!containerRef.current?.contains(e.relatedTarget)) {
          trigger === 'hover' && handleToggle(false)
        }
      }}
      style={{
        position: 'relative',
        width: `${width}px`,
        height: `${height + 52}px`, // extra space for cards fanning out
        display: 'inline-flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        perspective: shouldReduceMotion ? 'none' : '900px',
        userSelect: 'none',
        margin: '0.5rem 0'
      }}
    >
      {/* Growing Contact Shadow */}
      <div
        aria-hidden="true"
        style={{
          position: 'absolute',
          bottom: 2,
          left: '5%',
          width: '90%',
          height: '16px',
          borderRadius: '50%',
          background: 'rgba(0, 0, 0, 0.45)',
          filter: 'blur(10px)',
          transform: isOpen ? 'scale(1.12) translateY(8px)' : 'scale(0.95)',
          opacity: isOpen ? 0.75 : 0.35,
          transition: shouldReduceMotion ? 'none' : 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
          pointerEvents: 'none',
          zIndex: 0
        }}
      />

      {/* Main Folder Geometry Container */}
      <div
        style={{
          position: 'relative',
          width: `${width}px`,
          height: `${height}px`,
          zIndex: 1
        }}
      >
        {/* 1. BACK PANEL (Single SVG silhouette with tab) */}
        <svg
          aria-hidden="true"
          width={width}
          height={height}
          viewBox={`0 0 ${width} ${height}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            filter: `drop-shadow(0 4px 14px ${palette.glow})`,
            display: 'block',
            zIndex: 1
          }}
        >
          <path d={backPath} fill={palette.back} />
        </svg>

        {/* Tab Label (Rendered decoratively inside the raised tab) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: 2,
            left: 14,
            width: tabWidth - 28,
            height: tabHeight - 2,
            display: 'flex',
            alignItems: 'center',
            gap: '0.35rem',
            color: palette.tabText,
            fontSize: '0.78rem',
            fontWeight: 700,
            letterSpacing: '0.02em',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        >
          <span>📁</span>
          <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{label}</span>
        </div>

        {/* 2. INNER WELL (Inset shadow where papers sit) */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            top: tabHeight + 2,
            left: 8,
            width: width - 16,
            height: height - tabHeight - 8,
            borderRadius: '8px',
            background: palette.well,
            boxShadow: 'inset 0 3px 10px rgba(0, 0, 0, 0.45)',
            zIndex: 2,
            pointerEvents: 'none'
          }}
        />

        {/* 3. ITEM CARDS (Peek when closed, fan out when open) */}
        <div
          aria-hidden={!isOpen}
          className="folder-cards-wrapper"
          style={{
            position: 'absolute',
            top: tabHeight + 4,
            left: 12,
            width: width - 24,
            height: height - tabHeight - 12,
            zIndex: 3,
            pointerEvents: isOpen ? 'auto' : 'none'
          }}
        >
          {items.map((item, index) => {
            const count = items.length
            // Calculate fanning angles and offsets
            // Stagger angles: e.g. for 3 items: -7deg, 0deg, +7deg
            const centerIdx = (count - 1) / 2
            const angleStep = count > 1 ? 14 / (count - 1) : 0
            const fanAngle = count > 1 ? (index - centerIdx) * angleStep : 0
            const fanLift = -38 - (count - 1 - index) * 6 // lift higher when open

            // Closed state peek: top card peeks slightly above flap
            const peekY = index === count - 1 ? -10 : index === count - 2 ? -6 : -2
            const peekRotate = index === count - 1 ? 1.5 : -1

            const cardY = isOpen ? fanLift : peekY
            const cardRotate = isOpen ? fanAngle : peekRotate
            const cardScale = isOpen ? 1 : 0.98

            const delay = shouldReduceMotion ? 0 : index * 0.035 // 35ms stagger

            return (
              <motion.div
                key={item.id || index}
                onClick={(e) => {
                  e.stopPropagation()
                  onItemClick && onItemClick(item)
                }}
                initial={false}
                animate={{
                  y: shouldReduceMotion ? (isOpen ? -25 : 0) : cardY,
                  rotate: shouldReduceMotion ? 0 : cardRotate,
                  scale: shouldReduceMotion ? 1 : cardScale
                }}
                transition={{
                  duration: shouldReduceMotion ? 0.1 : 0.38,
                  delay: isOpen ? delay : (count - 1 - index) * 0.02,
                  ease: [0.22, 1, 0.36, 1]
                }}
                className="folder-item-card"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9px',
                  background: '#ffffff',
                  color: '#0f172a',
                  boxShadow: isOpen
                    ? '0 12px 28px -4px rgba(0, 0, 0, 0.28), 0 2px 8px rgba(0, 0, 0, 0.12)'
                    : '0 4px 10px rgba(0, 0, 0, 0.15)',
                  border: '1px solid rgba(0, 0, 0, 0.1)',
                  overflow: 'hidden',
                  cursor: 'pointer',
                  transformOrigin: 'bottom center',
                  zIndex: index + 1
                }}
              >
                {item.content || (
                  <div
                    style={{
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      justifyContent: 'space-between',
                      boxSizing: 'border-box'
                    }}
                  >
                    {/* Card Thumbnail / Header */}
                    <div
                      style={{
                        flex: 1,
                        padding: '0.65rem 0.85rem',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.55rem',
                        background: '#f8fafc'
                      }}
                    >
                      <div
                        style={{
                          width: '28px',
                          height: '28px',
                          borderRadius: '6px',
                          background: palette.flap,
                          color: '#ffffff',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          flexShrink: 0
                        }}
                      >
                        <FileText size={15} />
                      </div>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 700,
                            color: '#0f172a',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}
                        >
                          {item.name || 'Document.pdf'}
                        </div>
                        <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                          {item.type || 'Verified ATS File'}
                        </div>
                      </div>
                    </div>

                    {/* Card Footer Bar */}
                    <div
                      style={{
                        padding: '0.4rem 0.85rem',
                        borderTop: '1px solid #e2e8f0',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: '#ffffff'
                      }}
                    >
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontVariantNumeric: 'tabular-nums',
                          color: '#64748b',
                          fontWeight: 600
                        }}
                      >
                        {item.size || '320 KB'}
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          color: palette.back,
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '2px'
                        }}
                      >
                        View <Eye size={11} />
                      </span>
                    </div>
                  </div>
                )}
              </motion.div>
            )
          })}
        </div>

        {/* 4. FRONT FLAP BUTTON (A real accessible button with tilt physics) */}
        <motion.button
          type="button"
          onClick={() => handleToggle()}
          onKeyDown={handleKeyDown}
          aria-expanded={isOpen}
          aria-label={`${label} folder (${items.length} documents)`}
          initial={false}
          animate={{
            rotateX: shouldReduceMotion ? 0 : (isOpen ? -42 : 0),
            y: shouldReduceMotion ? 0 : (isOpen ? 4 : 0)
          }}
          transition={{
            duration: shouldReduceMotion ? 0.1 : 0.38,
            ease: [0.22, 1, 0.36, 1]
          }}
          className="folder-front-flap-btn"
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: `${width}px`,
            height: `${flapHeight}px`,
            borderRadius: `0 0 ${cornerRadius}px ${cornerRadius}px`,
            background: `linear-gradient(180deg, ${palette.flap} 0%, ${palette.back} 100%)`,
            border: 'none',
            borderTop: `1.5px solid ${palette.highlight}`,
            boxShadow: `0 -2px 10px rgba(0, 0, 0, 0.12), inset 0 1px 2px ${palette.highlight}`,
            cursor: 'pointer',
            padding: '1rem',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            alignItems: 'flex-start',
            transformOrigin: 'bottom center',
            zIndex: 4,
            outline: 'none'
          }}
        >
          {/* Top Edge Notch / Highlight */}
          <div
            style={{
              width: '100%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between'
            }}
          >
            <span
              style={{
                fontSize: '0.86rem',
                fontWeight: 800,
                color: '#ffffff',
                textShadow: '0 1px 3px rgba(0, 0, 0, 0.3)',
                letterSpacing: '-0.01em',
                textAlign: 'left'
              }}
            >
              {label}
            </span>

            {badge && (
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  background: 'rgba(255, 255, 255, 0.25)',
                  color: '#ffffff',
                  padding: '2px 7px',
                  borderRadius: '9999px',
                  backdropFilter: 'blur(4px)'
                }}
              >
                {badge}
              </span>
            )}
          </div>

          {/* Bottom Flap Hint */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              width: '100%',
              fontSize: '0.74rem',
              fontWeight: 600,
              color: 'rgba(255, 255, 255, 0.88)'
            }}
          >
            <span>{items.length} uploaded files</span>
            <span style={{ fontSize: '0.7rem', opacity: 0.85 }}>
              {isOpen ? 'Click to close ▲' : 'Hover / click to fan ▼'}
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  )
}
