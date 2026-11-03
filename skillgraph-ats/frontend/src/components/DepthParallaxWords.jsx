import React, { useRef } from 'react'
import { motion, useInView, useReducedMotion } from 'framer-motion'

/**
 * Depth Parallax Words
 * Per-word depth motion: fade-in, upward drift (18px), scale (0.92 -> 1), and soft blur (3px -> 0px)
 * Uses Apple signature ease-out: cubic-bezier(0.22, 1, 0.36, 1)
 * Accessible: Respects prefers-reduced-motion with aria-label on parent and aria-hidden on words.
 */
export default function DepthParallaxWords({
  text,
  words: wordsProp,
  className = '',
  wordClassName = '',
  delay = 0.1,
  stagger = 0.05,
  driftDistance = 18,
  initialScale = 0.92,
  initialBlur = 3,
  triggerOnView = false,
  as: Component = 'div',
  children,
  style = {}
}) {
  const ref = useRef(null)
  const shouldReduceMotion = useReducedMotion()
  const inView = useInView(ref, { once: true, margin: '-40px' })

  const shouldAnimate = triggerOnView ? inView : true

  // If text is provided, split by space while preserving structure
  const rawText = typeof text === 'string' ? text : ''
  const words = wordsProp || (rawText ? rawText.split(/\s+/) : [])

  const appleEase = [0.22, 1, 0.36, 1]

  if (shouldReduceMotion) {
    return (
      <Component ref={ref} className={className} style={style} aria-label={rawText || undefined}>
        {children || rawText}
      </Component>
    )
  }

  // If children is provided directly (e.g., button content or rich nodes)
  if (children) {
    return (
      <motion.div
        ref={ref}
        className={className}
        style={style}
        initial={{ opacity: 0, y: driftDistance, scale: initialScale, filter: `blur(${initialBlur}px)` }}
        animate={shouldAnimate ? { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' } : {}}
        transition={{ duration: 0.75, delay, ease: appleEase }}
      >
        {children}
      </motion.div>
    )
  }

  return (
    <Component
      ref={ref}
      className={`depth-parallax-words-container ${className}`}
      style={{ display: 'inline-flex', flexWrap: 'wrap', gap: '0.3em', ...style }}
      aria-label={rawText}
    >
      {words.map((word, index) => {
        const wordDelay = delay + index * stagger

        return (
          <motion.span
            key={index}
            className={`depth-parallax-word ${wordClassName}`}
            aria-hidden="true"
            style={{ display: 'inline-block', willChange: 'transform, opacity, filter' }}
            initial={{
              opacity: 0,
              y: driftDistance,
              scale: initialScale,
              filter: `blur(${initialBlur}px)`
            }}
            animate={
              shouldAnimate
                ? {
                    opacity: 1,
                    y: 0,
                    scale: 1,
                    filter: 'blur(0px)'
                  }
                : {}
            }
            transition={{
              duration: 0.8,
              delay: wordDelay,
              ease: appleEase
            }}
          >
            {word}
          </motion.span>
        )
      })}
    </Component>
  )
}

