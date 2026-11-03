import React, { useRef, useState, useEffect, useLayoutEffect, useCallback } from 'react'
import { ArrowDown } from 'lucide-react'

/**
 * AIConversation Component (/docs/components/ai-conversation)
 * Follows the bottom while pinned (within 48px), provides "Jump to latest" pill when detached.
 */
export default function AIConversation({
  contentKey,
  children,
  className = '',
  style = {},
  threshold = 48
}) {
  const containerRef = useRef(null)
  const [isAtBottom, setIsAtBottom] = useState(true)
  const isPinnedRef = useRef(true)

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Check scroll position relative to bottom
  const handleScroll = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    const distanceFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight
    const pinned = distanceFromBottom <= threshold
    isPinnedRef.current = pinned
    setIsAtBottom(pinned)
  }, [threshold])

  const scrollToBottom = useCallback((instant = false) => {
    const el = containerRef.current
    if (!el) return

    const behavior = instant || prefersReducedMotion ? 'auto' : 'smooth'
    el.scrollTo({
      top: el.scrollHeight,
      behavior
    })
    isPinnedRef.current = true
    setIsAtBottom(true)
  }, [prefersReducedMotion])

  // Scroll in layout effect so content growth never flashes the old position
  useLayoutEffect(() => {
    if (isPinnedRef.current) {
      scrollToBottom(true)
    }
  }, [contentKey, scrollToBottom])

  // ResizeObserver catches content growth that happens without contentKey changing
  useEffect(() => {
    const el = containerRef.current
    if (!el) return

    const ro = new ResizeObserver(() => {
      if (isPinnedRef.current) {
        scrollToBottom(true)
      } else {
        handleScroll()
      }
    })

    ro.observe(el)
    // Also observe the inner wrapper to catch content expansion
    if (el.firstElementChild) {
      ro.observe(el.firstElementChild)
    }

    return () => ro.disconnect()
  }, [scrollToBottom, handleScroll])

  return (
    <div
      className={`ai-conversation-wrapper ${className}`}
      style={{
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        minHeight: 0,
        overflow: 'hidden',
        ...style
      }}
    >
      <div
        ref={containerRef}
        onScroll={handleScroll}
        className="ai-conversation-scroll-area"
        style={{
          flex: 1,
          overflowY: 'auto',
          overflowX: 'hidden',
          overscrollBehavior: 'contain',
          scrollBehavior: prefersReducedMotion ? 'auto' : 'smooth',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.25rem'
        }}
      >
        <div className="ai-conversation-inner-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {children}
        </div>
      </div>

      {/* Jump to latest pill (appears only when detached from bottom) */}
      {!isAtBottom && (
        <div
          className="jump-to-bottom-wrap"
          style={{
            position: 'absolute',
            bottom: '1rem',
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 10,
            pointerEvents: 'auto'
          }}
        >
          <button
            type="button"
            onClick={() => scrollToBottom(false)}
            className="btn-jump-to-latest"
            aria-label="Jump to latest messages"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.45rem',
              background: '#0f172a',
              color: '#ffffff',
              border: '1px solid rgba(168, 85, 247, 0.4)',
              boxShadow: '0 4px 14px rgba(0, 0, 0, 0.25)',
              padding: '0.4rem 0.95rem',
              borderRadius: '9999px',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer',
              transform: 'none',
              transition: 'background 0.15s ease, box-shadow 0.15s ease'
            }}
          >
            <span>Jump to latest</span>
            <ArrowDown size={14} />
          </button>
        </div>
      )}
    </div>
  )
}

