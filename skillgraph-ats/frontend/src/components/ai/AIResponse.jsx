import React, { useRef, useMemo } from 'react'
import AICitation from './AICitation'

/**
 * AIResponse Component (/docs/components/ai-response)
 * Words fade and unblur as they arrive. Caret sits inline. [n] citations pop in.
 */
export default function AIResponse({
  text = '',
  isStreaming = false,
  citations = [],
  className = ''
}) {
  const prevWordCountRef = useRef(0)

  const prefersReducedMotion = typeof window !== 'undefined'
    && window.matchMedia('(prefers-reduced-motion: reduce)').matches

  // Parse text into tokens: words, spaces, newlines, and [n] citation markers
  // Clean raw markdown symbols (###, **, *) so text reads naturally and professionally
  const sanitizedText = useMemo(() => {
    if (!text) return ''
    return text
      .replace(/^#{1,6}\s+/gm, '')
      .replace(/\*\*(.*?)\*\*/g, '$1')
      .replace(/^[\*]\s+/gm, '• ')
      .replace(/[\*]{1,2}/g, '')
  }, [text])

  // Parse text into tokens: words, spaces, newlines, and [n] citation markers
  const tokens = useMemo(() => {
    if (!sanitizedText) return []
    // Match citation pattern [1], [2], or normal words/whitespace
    const regex = /(\[\d+\]|\n|\s+|[^\s\n\[]+)/g
    const matches = sanitizedText.match(regex) || []
    return matches
  }, [sanitizedText])

  const currentTokenCount = tokens.length
  const previousTokenCount = prevWordCountRef.current
  prevWordCountRef.current = currentTokenCount

  // Map citation markers to citation data
  const citationMap = useMemo(() => {
    const map = new Map()
    citations.forEach(c => {
      map.set(String(c.index), c)
      map.set(String(c.id), c)
    })
    return map
  }, [citations])

  return (
    <div className={`ai-response-container ${className}`} style={{ lineHeight: 1.6, wordBreak: 'break-word' }}>
      <p style={{ margin: 0, display: 'inline', color: 'var(--text-pure-white)' }}>
        {tokens.map((token, index) => {
          // Check if newly arrived word during streaming
          const isNewlyArrived = !prefersReducedMotion && isStreaming && index >= previousTokenCount

          // Check for line break
          if (token === '\n') {
            return <br key={index} />
          }

          // Check for citation marker [n]
          const citeMatch = token.match(/^\[(\d+)\]$/)
          if (citeMatch) {
            const citeIndex = citeMatch[1]
            const citeData = citationMap.get(citeIndex) || {
              id: citeIndex,
              index: parseInt(citeIndex, 10),
              title: `Source Evidence [${citeIndex}]`,
              host: 'Ontology Graph Node'
            }

            return (
              <AICitation
                key={index}
                citation={citeData}
              />
            )
          }

          // Normal token (word or space)
          if (isNewlyArrived) {
            return (
              <span
                key={index}
                className="ai-token-arriving"
                style={{
                  display: 'inline',
                  animation: 'tokenArrival 0.28s ease-out forwards'
                }}
              >
                {token}
              </span>
            )
          }

          return (
            <span key={index} style={{ display: 'inline' }}>
              {token}
            </span>
          )
        })}

        {/* Inline Caret sitting directly against the last glyph */}
        {isStreaming && (
          <span
            className="ai-inline-caret"
            aria-hidden="true"
            style={{
              display: 'inline-block',
              width: '2px',
              height: '1.05em',
              background: '#8b5cf6',
              marginLeft: '2px',
              verticalAlign: 'text-bottom',
              animation: prefersReducedMotion ? 'none' : 'caretBlink 0.9s infinite'
            }}
          />
        )}
      </p>
    </div>
  )
}

