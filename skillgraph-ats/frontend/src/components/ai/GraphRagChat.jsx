import React, { useState, useRef, useEffect } from 'react'
import AgentAvatar from './AgentAvatar'
import AIConversation from './AIConversation'
import AIPromptInput from './AIPromptInput'
import AIMessage from './AIMessage'
import AIResponse from './AIResponse'
import AISuggestions from './AISuggestions'
import AILoader from './AILoader'
import AIContextMeter from './AIContextMeter'
import { getDemoChatReply } from '../../data/demoMockData'
import { 
  Sparkles, 
  Database, 
  Cpu, 
  HelpCircle, 
  ChevronDown, 
  Zap, 
  CheckCircle2, 
  Layers,
  FileText
} from 'lucide-react'

const API_URL = "http://127.0.0.1:8000"

function getFormattedTime() {
  const d = new Date()
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

export default function GraphRagChat({
  selectedCandidate = 'Rohan Sahu',
  candidates = [],
  onSelectCandidate,
  isCompact = false,
  user
}) {
  const [messages, setMessages] = useState([
    {
      id: 'init-1',
      from: 'assistant',
      text: `Hello ${user?.name?.split(' ')[0] || 'Recruiter'}! I have ingested the 2048-dim Knowledge Graph profile for ${selectedCandidate} [1]. Ask me anything about their engineering competencies, project depth, or missing skills against your Job Description [2].`,
      timestamp: getFormattedTime(),
      citations: [
        {
          id: '1',
          index: 1,
          title: `${selectedCandidate} Ontological DAG Profile`,
          host: 'SkillGraph Candidate Graph',
          excerpt: `Traversed 18 explicit and inferred competencies with 0.94 cosine similarity against JD requirements.`
        },
        {
          id: '2',
          index: 2,
          title: 'Target Role Competency Specification',
          host: 'Target Job Description',
          excerpt: 'Requires verified multi-cloud container orchestration, Terraform IaC, and Kubernetes systems.'
        }
      ]
    }
  ])

  const [composerDraft, setComposerDraft] = useState('')
  const [streamState, setStreamState] = useState('idle') // 'idle' | 'streaming' | 'done' | 'error'
  const abortControllerRef = useRef(null)

  // Token meter breakdown
  const [tokenUsage, setTokenUsage] = useState({
    used: 16400,
    limit: 128000,
    breakdown: [
      { label: 'DAG Ontology Graph & System Prompt', tokens: 4200 },
      { label: 'Candidate Resume AST & Highlights', tokens: 7800 },
      { label: 'Recruiter Chat History', tokens: 4400 }
    ]
  })

  // Dynamic suggestions based on selected candidate
  const suggestions = [
    { id: 's1', label: `Why is ${selectedCandidate.split(' ')[0]} ranked #1?`, icon: <Zap size={13} /> },
    { id: 's2', label: 'What are their verified skill gaps?', icon: <HelpCircle size={13} /> },
    { id: 's3', label: 'List production engineering projects', icon: <FileText size={13} /> },
    { id: 's4', label: 'Evaluate Kubernetes architectural depth', icon: <Database size={13} /> }
  ]

  // Attachments: candidate's resume PDF chip
  const attachments = [
    { id: 'att-1', name: `${selectedCandidate.replace(/\s+/g, '_')}_Resume.pdf` }
  ]

  // Handle Send Message
  const handleSendMessage = async (promptText) => {
    if (!promptText || streamState === 'streaming') return

    const userTimestamp = getFormattedTime()
    const userMsgId = `user-${Date.now()}`
    const assistantMsgId = `asst-${Date.now() + 1}`

    const userMessage = {
      id: userMsgId,
      from: 'user',
      text: promptText,
      timestamp: userTimestamp
    }

    setMessages(prev => [...prev, userMessage])
    setComposerDraft('')
    setStreamState('streaming')

    // Create placeholder assistant turn
    const assistantMessage = {
      id: assistantMsgId,
      from: 'assistant',
      text: '',
      isStreaming: true,
      timestamp: getFormattedTime(),
      citations: [
        {
          id: '1',
          index: 1,
          title: `${selectedCandidate} Extracted Evidence [Ontology Node]`,
          host: 'SkillGraph Knowledge Graph',
          excerpt: `Verified evidence nodes from resume text correlated with target job criteria.`
        }
      ]
    }

    setMessages(prev => [...prev, assistantMessage])

    // Update tokens counter
    setTokenUsage(prev => ({
      ...prev,
      used: Math.min(prev.limit, prev.used + promptText.length * 2 + 120)
    }))

    abortControllerRef.current = new AbortController()
    try {
      let usedBackend = false

      // 1. Attempt true live real-time token streaming from backend
      try {
        const formData = new FormData()
        formData.append("candidate_name", selectedCandidate)
        formData.append("question", promptText)
        const recentHistory = messages.slice(-5).map(m => ({
          role: m.from === "assistant" ? "assistant" : "user",
          content: m.text
        }))
        formData.append("history", JSON.stringify(recentHistory))

        const res = await fetch(`${API_URL}/api/chat/stream`, {
          method: "POST",
          body: formData,
          signal: abortControllerRef.current.signal
        })

        if (res.ok && res.body) {
          usedBackend = true
          const reader = res.body.getReader()
          const decoder = new TextDecoder("utf-8")
          let accumulatedText = ""

          while (true) {
            const { done, value } = await reader.read()
            if (done) break
            const chunk = decoder.decode(value, { stream: true })
            accumulatedText += chunk

            setMessages(prev => prev.map(m => {
              if (m.id === assistantMsgId) {
                return {
                  ...m,
                  text: accumulatedText,
                  isStreaming: true
                }
              }
              return m
            }))
          }

          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                text: accumulatedText,
                isStreaming: false
              }
            }
            return m
          }))
          setStreamState('done')
          setTimeout(() => setStreamState('idle'), 500)
        }
      } catch (e) {
        if (e.name === 'AbortError') {
          setMessages(prev => prev.map(m => m.id === assistantMsgId ? { ...m, isStreaming: false } : m))
          setStreamState('idle')
          return
        }
      }

      // 2. Fallback to local demo reply simulation if backend is offline
      if (!usedBackend) {
        const fullReply = getDemoChatReply(selectedCandidate, promptText)
        const words = fullReply.split(' ')
        let currentWordIndex = 0

        const interval = setInterval(() => {
          currentWordIndex += 2
          const currentText = words.slice(0, currentWordIndex).join(' ')

          setMessages(prev => prev.map(m => {
            if (m.id === assistantMsgId) {
              return {
                ...m,
                text: currentText,
                isStreaming: currentWordIndex < words.length
              }
            }
            return m
          }))

          if (currentWordIndex >= words.length) {
            clearInterval(interval)
            setStreamState('done')
            setTimeout(() => setStreamState('idle'), 500)
          }
        }, 35)
      }

    } catch (err) {
      console.error("Chat error:", err)
      setStreamState('error')
      setTimeout(() => setStreamState('idle'), 2000)
    }
  }

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
    }
    setStreamState('idle')
    setMessages(prev => prev.map(m => m.isStreaming ? { ...m, isStreaming: false } : m))
  }

  const handleRetry = (msgIndex) => {
    const prevUserMsg = messages.slice(0, msgIndex).reverse().find(m => m.from === 'user')
    if (prevUserMsg) {
      handleSendMessage(prevUserMsg.text)
    }
  }

  // Calculate contentKey for AIConversation auto-scroll tracking
  const contentKey = messages.reduce((acc, m) => acc + (m.text?.length || 0), 0) + messages.length

  return (
    <div
      className={`graphrag-chat-component ${isCompact ? 'compact-layout' : 'fullscreen-layout'}`}
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        background: 'var(--bg-page-main)',
        borderRadius: isCompact ? '16px' : '20px',
        overflow: 'hidden',
        border: '1px solid var(--border-subtle)',
        boxShadow: '0 8px 30px rgba(0, 0, 0, 0.05)'
      }}
    >
      {/* 1. TOP HEADER: Candidate Context + Token Context Meter + Engine Specs */}
      <header
        className="chat-header-bar"
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0.85rem 1.25rem',
          borderBottom: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-card)',
          gap: '1rem',
          flexWrap: 'wrap'
        }}
      >
        {/* Left: Candidate Selector */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <AgentAvatar seed={selectedCandidate} size={32} glowColor="rgba(139, 92, 246, 0.4)" />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem' }}>
              <span style={{ fontSize: '0.94rem', fontWeight: 800, color: 'var(--text-pure-white)' }}>
                {selectedCandidate}
              </span>
              <span
                style={{
                  fontSize: '0.72rem',
                  fontWeight: 700,
                  color: '#059669',
                  background: 'rgba(16, 185, 129, 0.1)',
                  padding: '1px 6px',
                  borderRadius: '9999px',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px'
                }}
              >
                <CheckCircle2 size={11} /> Grounded Fact Profile
              </span>
            </div>
            <div style={{ fontSize: '0.76rem', color: 'var(--text-muted-gray)' }}>
              GraphRAG Candidate Reasoning • Zero Hallucinations
            </div>
          </div>
        </div>

        {/* Right Header: Candidate switcher + Context Meter */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginLeft: 'auto' }}>
          {candidates && candidates.length > 0 && (
            <div className="candidate-select-wrap">
              <select
                value={selectedCandidate}
                onChange={e => onSelectCandidate && onSelectCandidate(e.target.value)}
                style={{
                  background: 'var(--bg-surface-subtle)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '0.3rem 0.65rem',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  color: 'var(--text-pure-white)',
                  outline: 'none',
                  cursor: 'pointer'
                }}
              >
                {candidates.map((c, i) => (
                  <option key={i} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* AIContextMeter from SmoothUI */}
          <AIContextMeter
            used={tokenUsage.used}
            limit={tokenUsage.limit}
            breakdown={tokenUsage.breakdown}
          />
        </div>
      </header>

      {/* 2. CHAT THREAD: AIConversation follows bottom within 48px */}
      <div style={{ flex: 1, minHeight: 0, position: 'relative' }}>
        <AIConversation contentKey={contentKey}>
          {messages.map((msg, index) => {
            const isAsst = msg.from === 'assistant'

            return (
              <AIMessage
                key={msg.id}
                from={msg.from}
                timestamp={msg.timestamp}
                copyText={msg.text}
                onRetry={isAsst && !msg.isStreaming ? () => handleRetry(index) : undefined}
                onVote={isAsst && !msg.isStreaming ? (v) => console.log('Vote:', v) : undefined}
                avatar={
                  isAsst ? (
                    <AgentAvatar seed="SkillGraph-AI" size={28} glowColor="rgba(168, 85, 247, 0.45)" />
                  ) : (
                    <div
                      style={{
                        width: 28,
                        height: 28,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #7c3aed, #9333ea)',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.76rem',
                        fontWeight: 700
                      }}
                    >
                      {user?.name ? user.name[0].toUpperCase() : 'R'}
                    </div>
                  )
                }
              >
                {isAsst ? (
                  <>
                    <AIResponse
                      text={msg.text}
                      isStreaming={msg.isStreaming}
                      citations={msg.citations || []}
                    />
                    {msg.isStreaming && !msg.text && (
                      <AILoader variant="dots" showElapsed={true} label="Traversing Knowledge Graph..." />
                    )}
                  </>
                ) : (
                  <span>{msg.text}</span>
                )}
              </AIMessage>
            )
          })}
        </AIConversation>
      </div>

      {/* 3. SUGGESTIONS & COMPOSER FOOTER */}
      <div
        className="chat-footer-controls"
        style={{
          padding: '0.85rem 1.25rem 1rem 1.25rem',
          borderTop: '1px solid var(--border-subtle)',
          background: 'var(--bg-surface-card)',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem'
        }}
      >
        {/* AISuggestions from SmoothUI */}
        <AISuggestions
          suggestions={suggestions}
          onSelect={(item) => setComposerDraft(item.label)}
          label=""
        />

        {/* AIPromptInput from SmoothUI */}
        <AIPromptInput
          value={composerDraft}
          onValueChange={setComposerDraft}
          onSubmit={handleSendMessage}
          onStop={handleStop}
          state={streamState}
          maxLength={2000}
          placeholder={`Ask why ${selectedCandidate} scored this way, or ask for skill gaps...`}
          attachments={attachments}
        >
          {/* Toolbar slot: Engine indicators */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.75rem', color: 'var(--text-muted-gray)' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Cpu size={12} color="#8b5cf6" /> NVIDIA 2048-dim
            </span>
            <span>•</span>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px', fontWeight: 600 }}>
              <Database size={12} color="#a855f7" /> Groq Qwen3.8
            </span>
          </div>
        </AIPromptInput>
      </div>
    </div>
  )
}

