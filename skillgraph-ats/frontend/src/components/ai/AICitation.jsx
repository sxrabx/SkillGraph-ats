import React, { useState, useRef, useId, useEffect } from 'react'
import { ExternalLink, FileText, Database } from 'lucide-react'

/**
 * AICitation Component (/docs/components/ai-citation)
 * Inline superscript pill that opens a preview card with title, host, excerpt.
 */
export default function AICitation({
  citation = {},
  className = '',
  onClick
}) {
  const {
    id = '1',
    index = 1,
    title = 'Document Evidence',
    url,
    host = 'SkillGraph Knowledge Graph',
    excerpt = 'Direct candidate ontology node matched against target criteria.'
  } = citation

  const [isOpen, setIsOpen] = useState(false)
  const popoverId = useId()
  const leaveTimerRef = useRef(null)

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const handleMouseEnter = () => {
    if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    setIsOpen(true)
  }

  const handleMouseLeave = () => {
    // Short grace period so pointer can cross the gap to card
    leaveTimerRef.current = setTimeout(() => {
      setIsOpen(false)
    }, 180)
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Escape') {
      setIsOpen(false)
    }
  }

  useEffect(() => {
    return () => {
      if (leaveTimerRef.current) clearTimeout(leaveTimerRef.current)
    }
  }, [])

  return (
    <span
      className={`ai-citation-wrapper ${className}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onFocus={handleMouseEnter}
      onBlur={handleMouseLeave}
      onKeyDown={handleKeyDown}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'baseline',
        verticalAlign: 'baseline',
        margin: '0 2px'
      }}
    >
      {/* Inline Superscript Pill */}
      {url ? (
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          className="ai-citation-pill"
          aria-describedby={isOpen ? popoverId : undefined}
          aria-label={`Citation [${index}]: ${title}`}
          onClick={onClick}
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '9999px',
            padding: '1px 6px',
            textDecoration: 'none',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '2px',
            cursor: 'pointer',
            lineHeight: 1.2
          }}
        >
          <span>[{index}]</span>
        </a>
      ) : (
        <button
          type="button"
          className="ai-citation-pill"
          aria-describedby={isOpen ? popoverId : undefined}
          aria-label={`Citation [${index}]: ${title}`}
          onClick={onClick}
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: '#8b5cf6',
            background: 'rgba(139, 92, 246, 0.12)',
            border: '1px solid rgba(139, 92, 246, 0.3)',
            borderRadius: '9999px',
            padding: '1px 6px',
            cursor: 'pointer',
            lineHeight: 1.2
          }}
        >
          <span>[{index}]</span>
        </button>
      )}

      {/* Popover Card (grows out of pill with bottom-center transform origin) */}
      {isOpen && (
        <div
          id={popoverId}
          role="tooltip"
          className="ai-citation-card"
          style={{
            position: 'absolute',
            bottom: 'calc(100% + 8px)',
            left: '50%',
            transform: 'translateX(-50%)',
            transformOrigin: 'bottom center',
            width: '270px',
            background: 'var(--bg-surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '12px',
            padding: '0.85rem 1rem',
            boxShadow: '0 10px 25px -4px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            pointerEvents: 'auto',
            animation: prefersReducedMotion ? 'none' : 'citationGrow 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
            textAlign: 'left'
          }}
        >
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <span style={{ color: '#8b5cf6', display: 'flex' }}>
              <Database size={13} />
            </span>
            <span style={{ fontSize: '0.72rem', fontWeight: 600, color: 'var(--text-muted-gray)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {host}
            </span>
            {url && (
              <a href={url} target="_blank" rel="noreferrer" style={{ marginLeft: 'auto', color: 'var(--text-muted-gray)' }}>
                <ExternalLink size={12} />
              </a>
            )}
          </div>

          {/* Title */}
          <div style={{ fontSize: '0.86rem', fontWeight: 700, color: 'var(--text-pure-white)', marginBottom: '0.35rem', lineHeight: 1.3 }}>
            {title}
          </div>

          {/* Excerpt */}
          {excerpt && (
            <p style={{ fontSize: '0.78rem', color: 'var(--text-muted-gray)', margin: 0, lineHeight: 1.45 }}>
              &ldquo;{excerpt}&rdquo;
            </p>
          )}
        </div>
      )}
    </span>
  )
}

