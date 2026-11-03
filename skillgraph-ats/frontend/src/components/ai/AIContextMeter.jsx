import React, { useState } from 'react'
import { Sparkles, X } from 'lucide-react'

/**
 * Format numbers compactly: 1800 -> 1.8k, 48000 -> 48k, 1200000 -> 1.2M
 */
export function formatTokens(n) {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1).replace(/\.0$/, '')}M`
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, '')}k`
  return String(n)
}

/**
 * AIContextMeter Component (/docs/components/ai-context-meter)
 * Circular fraction fill (pathLength=1), tabular figures, hue shifts at warning/danger, breakdown popover.
 */
export default function AIContextMeter({
  used = 14800,
  limit = 128000,
  breakdown = [
    { label: 'System prompt & Ontology', tokens: 3200 },
    { label: 'Candidate Resume Nodes', tokens: 7400 },
    { label: 'Recruiter Chat History', tokens: 4200 }
  ],
  warningAt = 0.8,
  dangerAt = 0.95,
  className = ''
}) {
  const [isOpen, setIsOpen] = useState(false)

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const fraction = Math.min(1, Math.max(0, used / (limit || 1)))
  const percentage = Math.round(fraction * 100)

  // Hue shifts at thresholds (emerald -> amber -> rose)
  let statusColor = '#10b981' // emerald
  if (fraction >= dangerAt) {
    statusColor = '#ef4444' // rose/red
  } else if (fraction >= warningAt) {
    statusColor = '#f59e0b' // amber
  }

  const ariaLabel = `Context window: ${percentage}% full (${formatTokens(used)} of ${formatTokens(limit)} tokens)`

  return (
    <div className={`ai-context-meter-wrapper ${className}`} style={{ position: 'relative', display: 'inline-flex' }}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        aria-label={ariaLabel}
        title="View context window token breakdown"
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'var(--bg-surface-card)',
          border: '1px solid var(--border-subtle)',
          borderRadius: '9999px',
          padding: '0.25rem 0.65rem',
          cursor: 'pointer',
          color: 'var(--text-pure-white)',
          fontSize: '0.78rem',
          fontWeight: 600,
          boxShadow: '0 1px 4px rgba(0, 0, 0, 0.04)'
        }}
      >
        {/* SVG Ring with pathLength={1} */}
        <svg width="18" height="18" viewBox="0 0 24 24" style={{ transform: 'rotate(-90deg)', flexShrink: 0 }}>
          {/* Background track */}
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="transparent"
            stroke="rgba(148, 163, 184, 0.2)"
            strokeWidth="3.5"
          />
          {/* Active fill */}
          <circle
            cx="12"
            cy="12"
            r="9"
            fill="transparent"
            stroke={statusColor}
            strokeWidth="3.5"
            strokeLinecap="round"
            pathLength={1}
            strokeDasharray={`${fraction} ${1 - fraction}`}
            style={{
              transition: prefersReducedMotion ? 'none' : 'stroke 0.3s ease, stroke-dasharray 0.35s ease'
            }}
          />
        </svg>

        {/* Tabular figures: used / limit */}
        <span style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.01em' }}>
          {formatTokens(used)} / {formatTokens(limit)}
        </span>
      </button>

      {/* Breakdown Popover */}
      {isOpen && (
        <div
          role="dialog"
          aria-label="Token Breakdown"
          style={{
            position: 'absolute',
            top: 'calc(100% + 8px)',
            right: 0,
            width: '260px',
            background: 'var(--bg-surface-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: '14px',
            padding: '1rem',
            boxShadow: '0 10px 30px rgba(0, 0, 0, 0.15)',
            zIndex: 100,
            animation: prefersReducedMotion ? 'none' : 'popoverIn 0.18s cubic-bezier(0.16, 1, 0.3, 1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
            <span style={{ fontSize: '0.84rem', fontWeight: 700, color: 'var(--text-pure-white)' }}>
              Context Usage ({percentage}%)
            </span>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              style={{ background: 'transparent', border: 'none', color: 'var(--text-muted-gray)', cursor: 'pointer', padding: 0 }}
            >
              <X size={14} />
            </button>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {breakdown.map((item, i) => {
              const itemPercent = Math.round((item.tokens / (limit || 1)) * 100)
              return (
                <div key={i} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.76rem', color: 'var(--text-muted-gray)' }}>
                    <span>{item.label}</span>
                    <span style={{ fontVariantNumeric: 'tabular-nums', fontWeight: 600, color: 'var(--text-pure-white)' }}>
                      {formatTokens(item.tokens)} ({itemPercent}%)
                    </span>
                  </div>
                  <div style={{ width: '100%', height: '4px', background: 'var(--bg-surface-subtle)', borderRadius: '2px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${Math.min(100, (item.tokens / (used || 1)) * 100)}%`,
                        height: '100%',
                        background: '#8b5cf6',
                        borderRadius: '2px'
                      }}
                    />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

