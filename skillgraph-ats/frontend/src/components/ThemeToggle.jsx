import React, { useId } from 'react'
import { motion, useReducedMotion } from 'framer-motion'
import { useTheme } from '../context/ThemeContext'
import { Sun, Moon, Laptop } from 'lucide-react'

/**
 * Theme Toggle Component
 * Supports:
 * 1. 'sun-moon' variant: A single filled disc carved by a masking circle that slides across it.
 *    Eight rays retract into the disc with a stagger while the whole ray group rotates.
 * 2. 'pill' variant: A segmented control with layoutId animated thumb elevation.
 */
export default function ThemeToggle({
  variant = 'sun-moon', // 'sun-moon' | 'pill'
  size = 'md',          // 'sm' | 'md' | 'lg'
  showSystem = false,
  className = '',
  onThemeChange
}) {
  const { theme, toggleTheme, setTheme } = useTheme()
  const shouldReduceMotion = useReducedMotion()
  const maskId = useId()

  const isDark = theme === 'dark'

  const handleToggle = () => {
    const nextTheme = isDark ? 'light' : 'dark'
    if (onThemeChange) {
      onThemeChange(nextTheme)
    } else {
      toggleTheme()
    }
  }

  const handleSelect = (selectedTheme) => {
    if (onThemeChange) {
      onThemeChange(selectedTheme)
    } else {
      setTheme(selectedTheme)
    }
  }

  // Precomputed exact 8 ray coordinates around center (12, 12) from r=8 to r=10.5
  const rays = [
    { x1: 12, y1: 4, x2: 12, y2: 1.5 },             // 0° (Top)
    { x1: 17.66, y1: 6.34, x2: 19.42, y2: 4.58 },   // 45° (Top-Right)
    { x1: 20, y1: 12, x2: 22.5, y2: 12 },           // 90° (Right)
    { x1: 17.66, y1: 17.66, x2: 19.42, y2: 19.42 }, // 135° (Bottom-Right)
    { x1: 12, y1: 20, x2: 12, y2: 22.5 },           // 180° (Bottom)
    { x1: 6.34, y1: 17.66, x2: 4.58, y2: 19.42 },   // 225° (Bottom-Left)
    { x1: 4, y1: 12, x2: 1.5, y2: 12 },             // 270° (Left)
    { x1: 6.34, y1: 6.34, x2: 4.58, y2: 4.58 }      // 315° (Top-Left)
  ]

  /* ============================================================
     VARIANT 1: SUN MOON
     ============================================================ */
  if (variant === 'sun-moon') {
    return (
      <div className={`theme-toggle-wrap ${className}`} style={{ display: 'inline-flex', alignItems: 'center' }}>
        <button
          type="button"
          onClick={handleToggle}
          className="theme-toggle-sun-moon-btn"
          aria-label={`Current theme is ${theme}. Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          style={{
            width: '38px',
            height: '38px',
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            border: isDark ? '1px solid rgba(255, 255, 255, 0.16)' : '1px solid #e2e8f0',
            background: isDark ? '#12121c' : '#f8fafc',
            cursor: 'pointer',
            padding: 0,
            boxShadow: isDark ? '0 2px 8px rgba(0, 0, 0, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.05)',
            transition: 'all 0.2s ease',
            flexShrink: 0
          }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            style={{ overflow: 'visible', display: 'block' }}
          >
            <defs>
              <mask id={maskId} maskUnits="userSpaceOnUse" x="0" y="0" width="24" height="24">
                {/* White base allows disc to show */}
                <rect x="0" y="0" width="24" height="24" fill="white" />
                {/* Black circle cuts out the crescent when sliding in */}
                <motion.circle
                  animate={{
                    cx: isDark ? 16 : 30,
                    cy: isDark ? 8 : -4,
                    r: isDark ? 6.2 : 4
                  }}
                  fill="black"
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { type: 'spring', stiffness: 360, damping: 28 }
                  }
                />
              </mask>
            </defs>

            {/* Central Disc (Sun or Crescent Moon) */}
            <motion.circle
              cx="12"
              cy="12"
              mask={`url(#${maskId})`}
              animate={{
                r: isDark ? 7.2 : 5,
                fill: isDark ? '#c084fc' : '#f59e0b'
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { type: 'spring', stiffness: 360, damping: 28 }
              }
            />

            {/* 8 Sun Rays extending & rotating in Light Mode, retracting in Dark Mode */}
            <motion.g
              animate={{
                rotate: isDark ? 90 : 0,
                opacity: isDark ? 0 : 1
              }}
              transition={
                shouldReduceMotion
                  ? { duration: 0 }
                  : { duration: 0.35, ease: [0.22, 1, 0.36, 1] }
              }
              style={{ transformOrigin: '12px 12px' }}
            >
              {rays.map((ray, i) => (
                <motion.line
                  key={i}
                  x1={ray.x1}
                  y1={ray.y1}
                  x2={ray.x2}
                  y2={ray.y2}
                  stroke="#f59e0b"
                  strokeWidth="2"
                  strokeLinecap="round"
                  animate={{
                    opacity: isDark ? 0 : 1,
                    scale: isDark ? 0 : 1
                  }}
                  transition={
                    shouldReduceMotion
                      ? { duration: 0 }
                      : { duration: 0.25, delay: i * 0.015, ease: 'easeOut' }
                  }
                  style={{ transformOrigin: '12px 12px' }}
                />
              ))}
            </motion.g>
          </svg>
        </button>

        {/* Screen reader only status */}
        <span className="sr-only">
          Theme switched to {theme} mode
        </span>
      </div>
    )
  }

  /* ============================================================
     VARIANT 2: PILL
     ============================================================ */
  const options = showSystem
    ? [
        { id: 'light', label: 'Light', icon: Sun, color: '#f59e0b' },
        { id: 'dark', label: 'Dark', icon: Moon, color: '#a78bfa' },
        { id: 'system', label: 'System', icon: Laptop, color: '#94a3b8' }
      ]
    : [
        { id: 'light', label: 'Light', icon: Sun, color: '#f59e0b' },
        { id: 'dark', label: 'Dark', icon: Moon, color: '#a78bfa' }
      ]

  return (
    <div
      role="radiogroup"
      aria-label="Theme preference"
      className={`theme-toggle-pill-group ${className}`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px',
        borderRadius: '9999px',
        background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
        border: isDark ? '1px solid rgba(255, 255, 255, 0.12)' : '1px solid #e2e8f0',
        position: 'relative'
      }}
    >
      {options.map((option) => {
        const isSelected = theme === option.id
        const IconComponent = option.icon

        return (
          <button
            key={option.id}
            role="radio"
            type="button"
            aria-checked={isSelected}
            onClick={() => handleSelect(option.id)}
            style={{
              position: 'relative',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              padding: '0.35rem 0.8rem',
              borderRadius: '9999px',
              border: 'none',
              background: 'transparent',
              fontSize: '0.82rem',
              fontWeight: 600,
              cursor: 'pointer',
              zIndex: 1,
              color: isSelected
                ? isDark ? '#ffffff' : '#0f172a'
                : isDark ? '#94a3b8' : '#64748b',
              transition: 'color 0.2s ease'
            }}
          >
            {isSelected && (
              <motion.div
                layoutId="theme-pill-active-thumb"
                style={{
                  position: 'absolute',
                  inset: 0,
                  borderRadius: '9999px',
                  background: isDark ? '#1e1e2d' : '#ffffff',
                  boxShadow: isDark
                    ? '0 2px 8px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.12)'
                    : '0 2px 6px rgba(0, 0, 0, 0.08), inset 0 1px 0 rgba(255, 255, 255, 0.9)',
                  zIndex: -1
                }}
                transition={shouldReduceMotion ? { duration: 0 } : { type: 'spring', stiffness: 420, damping: 32 }}
              />
            )}

            <IconComponent
              size={13}
              style={{
                color: isSelected ? option.color : 'inherit',
                transition: 'color 0.2s'
              }}
              aria-hidden="true"
            />
            <span>{option.label}</span>
          </button>
        )
      })}

      <span className="sr-only">
        Current theme: {theme}
      </span>
    </div>
  )
}
