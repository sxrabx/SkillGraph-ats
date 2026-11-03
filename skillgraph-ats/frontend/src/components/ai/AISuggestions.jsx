import React from 'react'

/**
 * AISuggestions Component (/docs/components/ai-suggestions)
 * Centre-out stagger entrance, reflow layout animation, button scale on press.
 */
export default function AISuggestions({
  suggestions = [],
  onSelect,
  label = 'Suggested Inquiries',
  className = ''
}) {
  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  if (!suggestions || suggestions.length === 0) return null

  // Calculate centre-out stagger delay index
  const total = suggestions.length
  const mid = (total - 1) / 2

  return (
    <div className={`ai-suggestions-container ${className}`} style={{ width: '100%' }}>
      {label && (
        <span
          className="ai-suggestions-label"
          style={{
            fontSize: '0.74rem',
            fontWeight: 700,
            color: 'var(--text-muted-gray)',
            textTransform: 'uppercase',
            letterSpacing: '0.04em',
            display: 'block',
            marginBottom: '0.5rem'
          }}
        >
          {label}
        </span>
      )}

      <ul
        role="list"
        className="ai-suggestions-list"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '0.5rem',
          padding: 0,
          margin: 0,
          listStyle: 'none'
        }}
      >
        {suggestions.map((item, index) => {
          // Centre-out delay calculation
          const distFromCenter = Math.abs(index - mid)
          const delay = distFromCenter * 0.06 // seconds

          const itemLabel = typeof item === 'string' ? item : item.label

          return (
            <li key={item.id || itemLabel || index} role="listitem">
              <button
                type="button"
                onClick={() => onSelect && onSelect(item)}
                className="btn-suggestion-chip"
                style={{
                  background: 'var(--bg-surface-card)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '9999px',
                  padding: '0.38rem 0.85rem',
                  fontSize: '0.82rem',
                  fontWeight: 600,
                  color: 'var(--text-pure-white)',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 6px rgba(0, 0, 0, 0.03)',
                  transition: prefersReducedMotion ? 'none' : 'transform 0.12s ease, border-color 0.15s ease, background 0.15s ease',
                  animation: prefersReducedMotion ? 'none' : `chipFadeIn 0.3s cubic-bezier(0.16, 1, 0.3, 1) ${delay}s both`
                }}
              >
                {item.icon && <span style={{ color: '#8b5cf6', display: 'flex' }}>{item.icon}</span>}
                <span>{itemLabel}</span>
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

