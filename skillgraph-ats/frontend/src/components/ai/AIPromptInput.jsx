import React, { useRef, useState, useEffect } from 'react'
import { ArrowUp, Square, Paperclip, X } from 'lucide-react'

/**
 * AIPromptInput Component (/docs/components/ai-prompt-input)
 * Autogrowing textarea (max 8 rows), send/stop morph, attachment chips, character counter.
 */
export default function AIPromptInput({
  value: controlledValue,
  onValueChange,
  onSubmit,
  onStop,
  state = 'idle', // 'idle' | 'streaming' | 'done' | 'error'
  maxLength = 2000,
  placeholder = 'Ask anything about candidate qualifications, projects, or ontology gaps...',
  attachments = [],
  onRemoveAttachment,
  children,
  className = '',
  disabled = false
}) {
  const [internalValue, setInternalValue] = useState('')
  const textareaRef = useRef(null)

  const isControlled = controlledValue !== undefined
  const value = isControlled ? controlledValue : internalValue

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  const isStreaming = state === 'streaming'

  // Auto-resize textarea up to 8 rows (~200px)
  const adjustHeight = () => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    const newHeight = Math.min(textarea.scrollHeight, 210)
    textarea.style.height = `${Math.max(44, newHeight)}px`
  }

  useEffect(() => {
    adjustHeight()
  }, [value])

  const handleChange = (e) => {
    const val = e.target.value
    if (val.length <= maxLength) {
      if (isControlled) {
        onValueChange && onValueChange(val)
      } else {
        setInternalValue(val)
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (isStreaming) {
        onStop && onStop()
      } else if (value.trim() && !disabled) {
        const textToSend = value.trim()
        onSubmit && onSubmit(textToSend)
        if (!isControlled) setInternalValue('')
      }
    }
  }

  const handleButtonClick = (e) => {
    e.preventDefault()
    if (isStreaming) {
      onStop && onStop()
    } else if (value.trim() && !disabled) {
      const textToSend = value.trim()
      onSubmit && onSubmit(textToSend)
      if (!isControlled) setInternalValue('')
    }
  }

  // Show char counter only past 80% of maxLength
  const showCounter = value.length >= maxLength * 0.8

  return (
    <div
      className={`ai-prompt-input-wrapper ${state === 'done' ? 'ring-done' : ''} ${state === 'error' ? 'ring-error' : ''} ${className}`}
      style={{
        position: 'relative',
        background: 'var(--bg-surface-card)',
        borderRadius: '16px',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 4px 20px -2px rgba(0, 0, 0, 0.05)',
        transition: prefersReducedMotion ? 'none' : 'border-color 0.2s ease, box-shadow 0.2s ease',
        display: 'flex',
        flexDirection: 'column'
      }}
    >
      {/* Attachment Chips */}
      {attachments.length > 0 && (
        <div
          className="ai-attachment-chips-row"
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '0.45rem',
            padding: '0.75rem 1rem 0.25rem 1rem'
          }}
        >
          {attachments.map((att, i) => (
            <div
              key={att.id || i}
              className="ai-attachment-chip"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.35rem',
                padding: '0.2rem 0.55rem',
                borderRadius: '8px',
                background: 'rgba(139, 92, 246, 0.12)',
                border: '1px solid rgba(139, 92, 246, 0.25)',
                fontSize: '0.75rem',
                fontWeight: 600,
                color: '#8b5cf6'
              }}
            >
              <Paperclip size={12} />
              <span className="chip-name">{att.name}</span>
              {onRemoveAttachment && (
                <button
                  type="button"
                  onClick={() => onRemoveAttachment(att)}
                  aria-label={`Remove attachment ${att.name}`}
                  style={{
                    background: 'transparent',
                    border: 'none',
                    padding: 0,
                    marginLeft: 2,
                    cursor: 'pointer',
                    color: 'inherit',
                    display: 'flex',
                    alignItems: 'center'
                  }}
                >
                  <X size={12} />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Main Textarea Area */}
      <div style={{ padding: '0.85rem 1rem 0.4rem 1rem', width: '100%', boxSizing: 'border-box' }}>
        <textarea
          ref={textareaRef}
          value={value}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          disabled={disabled}
          rows={1}
          style={{
            width: '100%',
            background: 'transparent',
            border: 'none',
            outline: 'none',
            resize: 'none',
            fontSize: '0.94rem',
            lineHeight: 1.5,
            color: 'var(--text-pure-white)',
            fontFamily: 'inherit',
            boxSizing: 'border-box',
            display: 'block'
          }}
        />
      </div>

      {/* Bottom Bar: Toolbar slots + Char Counter + Action Button */}
      <div
        className="ai-prompt-bottom-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.4rem 0.85rem 0.75rem 0.85rem',
          gap: '0.75rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Left Toolbar slot (model pickers, mode toggles) */}
        <div className="ai-prompt-toolbar-slot" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          {children}
        </div>

        {/* Right Actions: Counter + Send/Stop Button */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          {showCounter && (
            <span
              className="ai-prompt-char-counter"
              style={{
                fontSize: '0.74rem',
                fontVariantNumeric: 'tabular-nums',
                color: value.length >= maxLength ? '#ef4444' : 'var(--text-muted-gray)',
                fontWeight: 600
              }}
            >
              {value.length} / {maxLength}
            </span>
          )}

          <button
            type="button"
            onClick={handleButtonClick}
            disabled={!isStreaming && (!value.trim() || disabled)}
            aria-label={isStreaming ? 'Stop generating' : 'Send message'}
            title={isStreaming ? 'Stop generation' : 'Send message (Enter)'}
            style={{
              width: '34px',
              height: '34px',
              borderRadius: '9999px',
              background: isStreaming
                ? '#ef4444'
                : value.trim()
                ? 'linear-gradient(135deg, #7c3aed, #9333ea)'
                : 'var(--bg-surface-subtle)',
              color: isStreaming || value.trim() ? '#ffffff' : 'var(--text-muted-gray)',
              border: 'none',
              cursor: isStreaming || value.trim() ? 'pointer' : 'not-allowed',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: prefersReducedMotion ? 'none' : 'all 0.18s cubic-bezier(0.16, 1, 0.3, 1)',
              boxShadow: isStreaming
                ? '0 2px 10px rgba(239, 68, 68, 0.4)'
                : value.trim()
                ? '0 2px 10px rgba(124, 58, 237, 0.35)'
                : 'none',
              flexShrink: 0
            }}
          >
            {isStreaming ? (
              <Square size={13} fill="currentColor" />
            ) : (
              <ArrowUp size={16} strokeWidth={2.2} />
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

