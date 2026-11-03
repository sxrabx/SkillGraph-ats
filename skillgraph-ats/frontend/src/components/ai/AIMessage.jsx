import React, { useState } from 'react'
import { Copy, Check, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'

/**
 * AIMessage Component (/docs/components/ai-message)
 * Mirrored user/assistant bubble geometry, timestamp on anchor edge, origin-aware actions with zero layout shift.
 */
export default function AIMessage({
  from = 'assistant', // 'user' | 'assistant'
  children,
  avatar,
  timestamp,
  copyText,
  onRetry,
  onVote,
  bubble = true,
  className = ''
}) {
  const [copied, setCopied] = useState(false)
  const [vote, setVote] = useState(null) // 'up' | 'down' | null

  const isUser = from === 'user'

  const handleCopy = async () => {
    try {
      const text = copyText || (typeof children === 'string' ? children : '')
      if (text && navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
      }
    } catch {
      // Swallowed per accessibility & resilient UI guidelines
    }
  }

  const handleVote = (dir) => {
    const nextVote = vote === dir ? null : dir
    setVote(nextVote)
    onVote && onVote(nextVote)
  }

  return (
    <div
      className={`ai-message-row from-${from} ${className}`}
      style={{
        display: 'flex',
        flexDirection: isUser ? 'row-reverse' : 'row',
        alignItems: 'flex-start',
        gap: '0.75rem',
        width: '100%',
        boxSizing: 'border-box'
      }}
    >
      {/* Avatar Slot */}
      {avatar && (
        <div className="ai-message-avatar-wrap" style={{ flexShrink: 0, marginTop: '2px' }}>
          {avatar}
        </div>
      )}

      {/* Main Content Column */}
      <div
        className="ai-message-content-col"
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: isUser ? 'flex-end' : 'flex-start',
          maxWidth: isUser ? '78%' : '88%',
          minWidth: 0
        }}
      >
        {/* Bubble Surface */}
        {bubble ? (
          <div
            className={`ai-message-bubble ${isUser ? 'bubble-user' : 'bubble-assistant'}`}
            style={{
              padding: '0.85rem 1.15rem',
              borderRadius: isUser ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
              background: isUser
                ? 'linear-gradient(135deg, #7c3aed 0%, #8b5cf6 100%)'
                : 'var(--bg-surface-card)',
              color: isUser ? '#ffffff' : 'var(--text-pure-white)',
              border: isUser ? 'none' : '1px solid var(--border-subtle)',
              boxShadow: isUser
                ? '0 4px 14px rgba(124, 58, 237, 0.25)'
                : '0 2px 10px rgba(0, 0, 0, 0.03)',
              fontSize: '0.92rem',
              lineHeight: 1.55,
              wordBreak: 'break-word'
            }}
          >
            {children}
          </div>
        ) : (
          /* bubble={false} for unboxed rich turns */
          <div className="ai-message-bare" style={{ width: '100%', fontSize: '0.92rem', lineHeight: 1.55 }}>
            {children}
          </div>
        )}

        {/* Meta Row: Timestamp first, then actions, pinned to anchor edge */}
        <div
          className="ai-message-meta-row"
          style={{
            display: 'flex',
            alignItems: 'center',
            flexDirection: isUser ? 'row-reverse' : 'row',
            gap: '0.65rem',
            marginTop: '0.35rem',
            paddingLeft: isUser ? '0' : '4px',
            paddingRight: isUser ? '4px' : '0'
          }}
        >
          {/* Timestamp with tabular figures */}
          {timestamp && (
            <span
              className="ai-message-timestamp"
              style={{
                fontSize: '0.74rem',
                color: 'var(--text-muted-gray)',
                fontVariantNumeric: 'tabular-nums',
                fontWeight: 500
              }}
            >
              {timestamp}
            </span>
          )}

          {/* Action slots: Always mounted to prevent layout shift! Faded until hover or :focus-within */}
          <div
            className="ai-message-actions-slot"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '0.25rem',
              transition: 'opacity 0.2s ease',
              opacity: 0.85
            }}
          >
            {/* Copy button */}
            <button
              type="button"
              onClick={handleCopy}
              className="btn-msg-action"
              aria-label="Copy message text"
              title={copied ? 'Copied!' : 'Copy to clipboard'}
              style={{
                background: 'transparent',
                border: 'none',
                color: copied ? '#10b981' : 'var(--text-muted-gray)',
                padding: '3px 5px',
                borderRadius: '4px',
                cursor: 'pointer',
                display: 'inline-flex',
                alignItems: 'center',
                transition: 'all 0.15s ease'
              }}
            >
              {copied ? <Check size={13} /> : <Copy size={13} />}
            </button>

            {/* Retry button */}
            {onRetry && (
              <button
                type="button"
                onClick={onRetry}
                className="btn-msg-action"
                aria-label="Retry generation"
                title="Retry prompt"
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: 'var(--text-muted-gray)',
                  padding: '3px 5px',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center'
                }}
              >
                <RotateCcw size={13} />
              </button>
            )}

            {/* Thumbs up / down feedback (assistant only per rule) */}
            {!isUser && onVote && (
              <>
                <button
                  type="button"
                  onClick={() => handleVote('up')}
                  className="btn-msg-action"
                  aria-pressed={vote === 'up'}
                  aria-label="Good response"
                  title="Helpful response"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: vote === 'up' ? '#8b5cf6' : 'var(--text-muted-gray)',
                    padding: '3px 5px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <ThumbsUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleVote('down')}
                  className="btn-msg-action"
                  aria-pressed={vote === 'down'}
                  aria-label="Poor response"
                  title="Inaccurate or unhelpful"
                  style={{
                    background: 'transparent',
                    border: 'none',
                    color: vote === 'down' ? '#ef4444' : 'var(--text-muted-gray)',
                    padding: '3px 5px',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    display: 'inline-flex',
                    alignItems: 'center'
                  }}
                >
                  <ThumbsDown size={13} />
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

