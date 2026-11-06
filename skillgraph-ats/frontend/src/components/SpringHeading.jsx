import React from 'react'
import TextEngine from 'spring-text-engine'

/**
 * SpringHeading Component
 * Reproduces the "Blur In" text animation via `spring-text-engine` and `@react-spring/web`.
 * Spring-driven, interruptible per-letter stagger animation.
 * 
 * Rules strictly followed:
 * - Matching unit types across In/Out (opacity: 0/1 numbers, filter: 'blur(8px)'/'blur(0px)' unit strings)
 * - mode="once"
 * - Centered using justify-content: center (flex container)
 * - tension: 157, friction: 12
 * - letterStagger: 46, delayIn: 50
 */
export default function SpringHeading({
  tag = 'h2',
  children,
  className = '',
  align = 'left', // 'center' | 'left'
  style = {},
  enabled = true,
  delayIn = 50,
  ...props
}) {
  if (children == null) return null

  const isCenter = align === 'center' || className.includes('justify-center') || className.includes('text-center')
  const alignmentClass = isCenter ? 'justify-center' : 'justify-start'
  const alignmentStyle = isCenter ? { justifyContent: 'center' } : { justifyContent: 'flex-start' }

  return (
    <TextEngine
      tag={tag}
      mode="once"
      enabled={enabled}
      letterOut={{ opacity: 0, filter: 'blur(8px)' }}
      letterIn={{ opacity: 1, filter: 'blur(0px)' }}
      letterConfig={{ tension: 157, friction: 12 }}
      letterStagger={46}
      delayIn={delayIn}
      className={`${alignmentClass} ${className}`.trim()}
      style={{ ...alignmentStyle, ...style }}
      {...props}
    >
      {children}
    </TextEngine>
  )
}
