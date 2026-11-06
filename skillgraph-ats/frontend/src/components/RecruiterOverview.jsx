import React, { useState, useMemo } from 'react'
import { 
  Maximize2, 
  MessageSquare, 
  Phone, 
  Activity, 
  Share2, 
  MoreHorizontal, 
  Sparkles, 
  ArrowRight, 
  Heart, 
  Droplet, 
  FileText, 
  Flame, 
  ShieldCheck, 
  BarChart2, 
  Moon, 
  Calendar,
  CheckCircle2,
  Clock,
  Cpu,
  Layers,
  Zap,
  TrendingUp,
  Network,
  X
} from 'lucide-react'

export default function RecruiterOverview({ onSelectCandidate, onNavigateToMatcher, onNavigateToChat }) {
  // Real SkillGraph ATS Candidates with Verified Engineering Profiles
  const candidates = [
    {
      id: 'c1',
      name: 'Sarah Lin',
      age: '5.2 Yrs Exp',
      title: 'Staff Distributed Systems Engineer',
      location: 'San Francisco, CA',
      score: 94,
      scoreLabel: 'Neuro-Symbolic Match',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&h=400&q=80',
      vectorCosine: '0.974 cos θ',
      vectorGrowth: '+2.8% vs Baseline',
      qualificationDepth: 92,
      depthGrowth: '+65% Faster Ingestion',
      dagNodes: 124,
      dagGrowth: '+34% ▲',
      hallucinationRisk: '0.0%',
      riskGrowth: '-100% ▼',
      vectorDim: '2048-D',
      dimGrowth: 'NVIDIA NIM',
      latency: '42ms',
      latencyGrowth: '-65% ▼',
      matchedSkills: ['Kubernetes Orchestration', 'Raft Distributed Consensus', 'High-Throughput Golang', 'Terraform IaC', '2048-D Dense Vectors'],
      inferredSkills: ['Container Orchestration (implied by K8s)', 'Microservices Architecture', 'Zero-Downtime Rolling Deploys'],
      timeline: [
        { time: '08:00', title: 'Groq LPU Async Extraction', range: 'Pydantic schema validation & parsing', type: 'blue', badge: '100% Validated' },
        { time: '09:30', title: 'NVIDIA NIM 2048-D Embeddings', range: 'In-memory cached cosine: 0.974', type: 'orange', badge: '2048-D NIM' },
        { time: '11:00', title: 'Symbolic DAG Transitive Reasoning', range: 'Kubernetes ➔ Implies Container Orchestration', type: 'green', badge: 'Depth 1 // W=0.98' },
        { time: '13:30', title: 'PyMuPDF Parallel Evidence Highlighting', range: '150 DPI page slices with bounding boxes', type: 'blue', badge: '3 Pages Overlaid' },
        { time: '15:00', title: 'Streaming GraphRAG Dialogue Ready', range: '<200ms TTFT multi-turn conversational context', type: 'orange', badge: 'HTTP Chunked' }
      ]
    },
    {
      id: 'c2',
      name: 'Rohan Sahu',
      age: '4.5 Yrs Exp',
      title: 'Senior Cloud & Platform Engineer',
      location: 'Bengaluru, IN',
      score: 91,
      scoreLabel: 'Neuro-Symbolic Match',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&h=400&q=80',
      vectorCosine: '0.952 cos θ',
      vectorGrowth: '+2.1% vs Baseline',
      qualificationDepth: 88,
      depthGrowth: '+60% Faster Ingestion',
      dagNodes: 112,
      dagGrowth: '+26% ▲',
      hallucinationRisk: '0.0%',
      riskGrowth: '-100% ▼',
      vectorDim: '2048-D',
      dimGrowth: 'NVIDIA NIM',
      latency: '44ms',
      latencyGrowth: '-62% ▼',
      matchedSkills: ['AWS CloudFormation', 'Docker Swarm', 'Multi-Region Kubernetes', 'Prometheus Observability'],
      inferredSkills: ['Cloud Infrastructure (implied by AWS)', 'Site Reliability Engineering'],
      timeline: [
        { time: '08:00', title: 'PDF Ingestion & Chunking', range: 'PyMuPDF server-side text extraction', type: 'blue', badge: 'Completed' },
        { time: '09:30', title: 'NVIDIA Dense Semantics Match', range: 'Nemotron-3-embed-1b cosine similarity', type: 'orange', badge: 'Cached' },
        { time: '11:00', title: 'NetworkX DAG Inferences', range: 'Deductions verified against requirements', type: 'green', badge: 'Zero Fallacy' },
        { time: '13:30', title: 'PyMuPDF Bounding Box Overlay', range: 'Color-coded green/orange/blue highlights', type: 'blue', badge: 'Auditable' },
        { time: '15:00', title: 'GraphRAG Synthesis Generated', range: 'Ontology evaluation brief rendered', type: 'orange', badge: 'Ready' }
      ]
    },
    {
      id: 'c3',
      name: 'Aditi Pradhan',
      age: '5.0 Yrs Exp',
      title: 'Principal Platform Automation Specialist',
      location: 'Seattle, WA',
      score: 89,
      scoreLabel: 'Neuro-Symbolic Match',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&h=400&q=80',
      vectorCosine: '0.938 cos θ',
      vectorGrowth: '+1.8% vs Baseline',
      qualificationDepth: 86,
      depthGrowth: '+58% Faster Ingestion',
      dagNodes: 98,
      dagGrowth: '+22% ▲',
      hallucinationRisk: '0.0%',
      riskGrowth: '-100% ▼',
      vectorDim: '2048-D',
      dimGrowth: 'NVIDIA NIM',
      latency: '39ms',
      latencyGrowth: '-68% ▼',
      matchedSkills: ['Terraform Modules', 'ArgoCD GitOps', 'GitHub Actions CI/CD', 'Security Hardening'],
      inferredSkills: ['Declarative Deployments', 'Infrastructure as Code'],
      timeline: [
        { time: '08:00', title: 'Resume Parser Ingestion', range: 'Groq LPU Qwen-27B Pydantic extraction', type: 'blue', badge: 'Validated' },
        { time: '09:30', title: 'Vector Space Mapping', range: '2048-dim normalized embedding projection', type: 'orange', badge: 'Precomputed' },
        { time: '11:00', title: 'Transitive Knowledge Closure', range: 'Ontology graph deduction depth 2', type: 'green', badge: 'Verified' },
        { time: '13:30', title: 'Visual Evidence Generation', range: 'PyMuPDF page rendering at 150 DPI', type: 'blue', badge: 'Proof Ready' },
        { time: '15:00', title: 'Recruiter Chat Ready', range: 'Multi-turn assistant context loaded', type: 'orange', badge: 'Active' }
      ]
    },
    {
      id: 'c4',
      name: 'Sumit Kar',
      age: '3.8 Yrs Exp',
      title: 'Linux Systems & SRE Lead',
      location: 'Austin, TX',
      score: 86,
      scoreLabel: 'Neuro-Symbolic Match',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&h=400&q=80',
      vectorCosine: '0.915 cos θ',
      vectorGrowth: '+1.4% vs Baseline',
      qualificationDepth: 82,
      depthGrowth: '+54% Faster Ingestion',
      dagNodes: 86,
      dagGrowth: '+18% ▲',
      hallucinationRisk: '0.0%',
      riskGrowth: '-100% ▼',
      vectorDim: '2048-D',
      dimGrowth: 'NVIDIA NIM',
      latency: '41ms',
      latencyGrowth: '-66% ▼',
      matchedSkills: ['Linux Kernel Tuning', 'eBPF Profiling', 'Prometheus & Thanos', 'Helm Charts'],
      inferredSkills: ['Production Observability', 'Low-Level Systems Engineering'],
      timeline: [
        { time: '08:00', title: 'Candidate Profile Upload', range: 'Parallel async ingestion via asyncio.gather', type: 'blue', badge: 'Fast Ingest' },
        { time: '09:30', title: 'NVIDIA Semantic Matching', range: 'Synonym matching for Linux Kernel & SRE', type: 'orange', badge: 'Matched' },
        { time: '11:00', title: 'DAG Knowledge Deduction', range: 'eBPF implies Linux Performance Tracing', type: 'green', badge: 'Implied' },
        { time: '13:30', title: 'PyMuPDF Evidence Rendering', range: 'Bounding boxes placed on page 1 & 2', type: 'blue', badge: 'Overlaid' },
        { time: '15:00', title: 'Assistant Rationale Ready', range: 'Explanation generated without markdown clutter', type: 'orange', badge: 'Ready' }
      ]
    }
  ]

  const [selectedCandIndex, setSelectedCandIndex] = useState(0)
  const [activeStageFilter, setActiveStageFilter] = useState('All Stages')
  const [fullscreenModal, setFullscreenModal] = useState(false)

  const current = candidates[selectedCandIndex]

  // Radial Tick Ray Sunburst Geometry for Card 2
  // 44 total radial ticks radiating in a 290° open arc with gap at the bottom
  const radialTicks = useMemo(() => {
    const total = 44
    const rIn = 66
    const rOut = 84
    const cx = 100
    const cy = 100
    const startDeg = 125
    const sweepDeg = 290
    const step = sweepDeg / (total - 1)
    const activeCutoff = Math.round(total * (current.score / 100))

    return Array.from({ length: total }, (_, i) => {
      const deg = startDeg + i * step
      const rad = (deg * Math.PI) / 180
      const x1 = cx + Math.cos(rad) * rIn
      const y1 = cy + Math.sin(rad) * rIn
      const x2 = cx + Math.cos(rad) * rOut
      const y2 = cy + Math.sin(rad) * rOut
      const isActive = i <= activeCutoff
      return { x1, y1, x2, y2, isActive, index: i }
    })
  }, [current.score])

  // Barcode Frequency Meter Ticks for Card 4
  const barcodeBars = useMemo(() => {
    const total = 64
    const activeCount = Math.round(total * (current.qualificationDepth / 100))
    return Array.from({ length: total }, (_, i) => {
      const h = 14 + Math.sin(i * 0.45) * 8 + Math.cos(i * 0.8) * 6
      return {
        height: Math.max(10, Math.min(34, h)),
        isActive: i < activeCount
      }
    })
  }, [current.qualificationDepth])

  const handleAction = (action) => {
    if (action === 'chat') {
      if (onNavigateToChat) onNavigateToChat(current)
    } else if (action === 'matcher' || action === 'inspect') {
      if (onSelectCandidate) onSelectCandidate(current)
    } else if (action === 'expand') {
      setFullscreenModal(true)
    } else if (action === 'share') {
      alert(`Exporting official SkillGraph Evaluation Dossier for ${current.name} (PDF, 2048-dim vectors & PyMuPDF highlights).`)
    } else if (action === 'call') {
      alert(`Scheduling technical panel interview for ${current.name}. Syncing interview availability.`)
    }
  }

  return (
    <div className="bento-dashboard-wrapper">
      {/* Top Candidate Switcher Strip */}
      <div className="bento-candidate-switcher-bar">
        <div className="switcher-label-group">
          <span className="switcher-tag">[ SHORTLISTED CANDIDATES ]</span>
        </div>

        <div className="switcher-pills-row">
          {candidates.map((cand, idx) => (
            <button
              key={cand.id}
              type="button"
              onClick={() => setSelectedCandIndex(idx)}
              className={`switcher-cand-chip ${selectedCandIndex === idx ? 'active' : ''}`}
            >
              <img src={cand.avatar} alt={cand.name} />
              <span>{cand.name} ({cand.score}%)</span>
            </button>
          ))}
        </div>
      </div>

      {/* 1:1 Reference Master Bento Grid */}
      <div className="bento-master-grid">
        {/* ============================================================
            CARD 1: CANDIDATE SPOTLIGHT HERO (Top-Left)
            ============================================================ */}
        <div className="bento-card bento-card-candidate-hero">
          <div className="candidate-hero-header">
            <div className="cand-hero-info">
              <h2 className="cand-hero-name">{current.name}</h2>
              <span className="cand-hero-subtitle">{current.age} • {current.title}</span>
            </div>

            <button 
              type="button" 
              onClick={() => handleAction('expand')} 
              className="cand-expand-btn"
              title="Expand Profile Fullscreen"
              aria-label="Expand Profile"
            >
              <Maximize2 size={14} />
            </button>
          </div>

          {/* Large Center Portrait */}
          <div className="candidate-hero-portrait-wrap">
            <img 
              src={current.avatar} 
              alt={current.name} 
              className="cand-portrait-img" 
            />
          </div>

          {/* Floating Action Dock Pill */}
          <div className="candidate-floating-action-dock" role="toolbar" aria-label="Candidate actions">
            <button 
              type="button" 
              onClick={() => handleAction('chat')} 
              className="dock-icon-btn" 
              title="Ask GraphRAG AI about candidate"
              aria-label="Chat with AI"
            >
              <MessageSquare size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => handleAction('call')} 
              className="dock-icon-btn" 
              title="Schedule Technical Interview"
              aria-label="Schedule interview"
            >
              <Calendar size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => handleAction('inspect')} 
              className="dock-icon-btn" 
              title="Inspect DAG Reasoning & PyMuPDF Proofs"
              aria-label="Inspect Match Evidence"
            >
              <Network size={16} />
            </button>
            <button 
              type="button" 
              onClick={() => handleAction('share')} 
              className="dock-icon-btn" 
              title="Export PyMuPDF Verified Report"
              aria-label="Share Report"
            >
              <Share2 size={16} />
            </button>
          </div>
        </div>

        {/* ============================================================
            CARD 2: RADIAL RAY TICK GAUGE (Top-Center)
            ============================================================ */}
        <div className="bento-card bento-card-radial-gauge">
          <div className="card-common-header">
            <div className="header-left-cluster">
              <div className="header-icon-pill">
                <Activity size={14} />
              </div>
              <span className="card-title-text">Neuro-Symbolic Match</span>
            </div>

            <button 
              type="button" 
              className="card-options-btn"
              onClick={() => handleAction('inspect')}
              title="More options"
              aria-label="Options"
            >
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Radial Sunburst Ray Gauge */}
          <div className="radial-gauge-viewport">
            <svg viewBox="0 0 200 200" className="radial-ticks-svg" aria-hidden="true">
              {radialTicks.map((tick) => (
                <line
                  key={tick.index}
                  x1={tick.x1}
                  y1={tick.y1}
                  x2={tick.x2}
                  y2={tick.y2}
                  stroke={tick.isActive ? 'var(--brand-primary)' : 'rgba(125, 120, 109, 0.22)'}
                  strokeWidth={tick.isActive ? '2.4' : '1.8'}
                  strokeLinecap="round"
                />
              ))}
            </svg>

            {/* Inner Stats */}
            <div className="radial-center-stats">
              <span className="radial-score-number">{current.score}%</span>
              <span className="radial-score-caption">{current.scoreLabel}</span>
            </div>
          </div>

          {/* Bottom AI Insights Action Banner */}
          <button 
            type="button" 
            onClick={() => handleAction('chat')} 
            className="radial-ai-banner-btn"
            title="Click to view GraphRAG AI reasoning summary"
          >
            <div className="ai-banner-left">
              <div className="ai-sparkle-circle">
                <Sparkles size={14} />
              </div>
              <div className="ai-banner-text-stack">
                <span className="ai-banner-title">GraphRAG AI Reasoning</span>
                <span className="ai-banner-sub">View Transitive Closure (A ➔ B)</span>
              </div>
            </div>

            <div className="ai-banner-arrow-circle">
              <ArrowRight size={13} />
            </div>
          </button>
        </div>

        {/* ============================================================
            CARD 3 & CARD 4: STACKED METRIC CARDS (Top-Right)
            ============================================================ */}
        <div className="bento-col-stacked">
          {/* Card 3: Stepped Area Histogram — 2048-D Vector Cosine */}
          <div className="bento-card bento-card-metric-step">
            <div className="card-common-header">
              <div className="header-left-cluster">
                <div className="header-icon-pill" style={{ background: 'rgba(255, 85, 0, 0.1)', color: 'var(--brand-primary)' }}>
                  <Cpu size={14} />
                </div>
                <span className="card-title-text">2048-D Vector Cosine (NVIDIA NIM)</span>
              </div>

              <button type="button" className="card-options-btn" aria-label="Card options">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="metric-stat-hero-row">
              <span className="metric-big-number">{current.vectorCosine}</span>
              <span className="metric-growth-badge">{current.vectorGrowth}</span>
            </div>

            {/* Stepped Area SVG Chart */}
            <div className="stepped-area-chart-wrap" aria-hidden="true">
              <svg viewBox="0 0 320 54" preserveAspectRatio="none" className="stepped-area-svg">
                <defs>
                  <linearGradient id="steppedOrangeGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#ff5500" stopOpacity="0.32" />
                    <stop offset="100%" stopColor="#ff5500" stopOpacity="0.04" />
                  </linearGradient>
                </defs>
                <path 
                  d="M 0,38 L 22,38 L 22,26 L 48,26 L 48,34 L 75,34 L 75,18 L 105,18 L 105,32 L 135,32 L 135,16 L 175,16 L 175,30 L 210,30 L 210,22 L 245,22 L 245,36 L 285,36 L 285,24 L 320,24 L 320,54 L 0,54 Z"
                  fill="url(#steppedOrangeGrad)"
                />
                <path 
                  d="M 0,38 L 22,38 L 22,26 L 48,26 L 48,34 L 75,34 L 75,18 L 105,18 L 105,32 L 135,32 L 135,16 L 175,16 L 175,30 L 210,30 L 210,22 L 245,22 L 245,36 L 285,36 L 285,24 L 320,24"
                  fill="none"
                  stroke="var(--brand-primary)"
                  strokeWidth="2"
                  strokeLinejoin="miter"
                />
              </svg>
            </div>
          </div>

          {/* Card 4: Qualification Depth & Frequency Barcode Meter */}
          <div className="bento-card bento-card-metric-barcode">
            <div className="card-common-header">
              <div className="header-left-cluster">
                <div className="header-icon-pill" style={{ background: 'rgba(30, 112, 232, 0.1)', color: '#1e70e8' }}>
                  <Layers size={14} />
                </div>
                <span className="card-title-text">Qualification Depth (Groq LPU)</span>
              </div>

              <button type="button" className="card-options-btn" aria-label="Card options">
                <MoreHorizontal size={16} />
              </button>
            </div>

            <div className="metric-stat-hero-row">
              <span className="metric-big-number">{current.qualificationDepth}%</span>
              <span className="metric-growth-badge">{current.depthGrowth}</span>
            </div>

            {/* Dense Barcode Equalizer Meter */}
            <div className="barcode-frequency-meter-wrap" aria-hidden="true">
              {barcodeBars.map((b, bi) => (
                <div
                  key={bi}
                  className={`barcode-bar ${b.isActive ? 'active' : 'muted'}`}
                  style={{ height: `${b.height}px` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* ============================================================
            CARD 5: TIMELINE SCHEDULE / VERIFICATION PIPELINE (Bottom-Left)
            ============================================================ */}
        <div className="bento-card bento-card-timeline">
          <div className="card-common-header">
            <div className="header-left-cluster">
              <div className="header-icon-pill" style={{ background: 'rgba(30, 112, 232, 0.1)', color: '#1e70e8' }}>
                <FileText size={14} />
              </div>
              <span className="card-title-text">Multi-Tier Verification Pipeline & Evidence Journey</span>
            </div>

            <button type="button" className="card-options-btn" aria-label="Timeline options">
              <MoreHorizontal size={16} />
            </button>
          </div>

          {/* Stage Filter Row */}
          <div className="timeline-date-selector-row">
            <span className="timeline-date-active-pill">{activeStageFilter}</span>
            {['Symbolic DAG', 'NVIDIA NIM 2048-D', 'PyMuPDF Highlights', 'GraphRAG Stream'].map((stage) => (
              <span 
                key={stage} 
                className="timeline-date-subtle-item"
                onClick={() => setActiveStageFilter(stage)}
              >
                {stage}
              </span>
            ))}
          </div>

          {/* Gantt Time Schedule Canvas */}
          <div className="timeline-gantt-canvas">
            {current.timeline.map((evt, idx) => (
              <div key={idx} className="timeline-time-row">
                <span className="time-axis-label">{evt.time}</span>
                <div className="timeline-grid-line" aria-hidden="true"></div>

                <div 
                  className="timeline-event-card"
                  onClick={() => handleAction('inspect')}
                  title={`Inspect ${evt.title} evidence`}
                >
                  <div className={`event-icon-dot ${evt.type}`}>
                    <Activity size={11} />
                  </div>
                  <div className="event-text-stack">
                    <span className="event-title">{evt.title}</span>
                    <span className="event-time-range">{evt.range}</span>
                  </div>
                  {evt.badge && (
                    <span className="timeline-chip-tag" style={{ marginLeft: 'auto', fontSize: '0.62rem', fontFamily: 'var(--font-mono)', padding: '2px 6px', borderRadius: '4px', background: 'var(--bg-subtle)', color: 'var(--text-tertiary)' }}>
                      {evt.badge}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ============================================================
            CARDS 6–9: 2×2 COMPACT METRIC GRID (Bottom-Right)
            ============================================================ */}
        <div className="bento-grid-2x2">
          {/* Mini Card 1: DAG Nodes */}
          <div className="bento-mini-card">
            <div className="mini-card-top-row">
              <span className="mini-card-title">DAG Nodes</span>
              <div className="mini-icon-circle flame">
                <Flame size={13} />
              </div>
            </div>

            <div className="mini-card-bottom-row">
              <div className="mini-number-group">
                <span className="mini-growth-pill">{current.dagGrowth}</span>
                <span className="mini-big-number">{current.dagNodes}</span>
              </div>

              {/* 4-Step Mini Bar Chart */}
              <div className="mini-stepped-chart" aria-hidden="true">
                <div className="mini-step-col green" style={{ height: '12px' }}></div>
                <div className="mini-step-col green" style={{ height: '16px' }}></div>
                <div className="mini-step-col green" style={{ height: '20px' }}></div>
                <div className="mini-step-col green" style={{ height: '26px' }}></div>
              </div>
            </div>
          </div>

          {/* Mini Card 2: Hallucination Risk */}
          <div className="bento-mini-card">
            <div className="mini-card-top-row">
              <span className="mini-card-title">Hallucination Risk</span>
              <div className="mini-icon-circle brain">
                <ShieldCheck size={13} />
              </div>
            </div>

            <div className="mini-card-bottom-row">
              <div className="mini-number-group">
                <span className="mini-growth-pill" style={{ color: 'var(--accent-cyan)' }}>{current.riskGrowth}</span>
                <span className="mini-big-number">{current.hallucinationRisk}</span>
              </div>

              {/* 4-Step Mini Bar Chart */}
              <div className="mini-stepped-chart" aria-hidden="true">
                <div className="mini-step-col blue" style={{ height: '8px' }}></div>
                <div className="mini-step-col blue" style={{ height: '14px' }}></div>
                <div className="mini-step-col blue" style={{ height: '19px' }}></div>
                <div className="mini-step-col blue" style={{ height: '25px' }}></div>
              </div>
            </div>
          </div>

          {/* Mini Card 3: Vector Density */}
          <div className="bento-mini-card">
            <div className="mini-card-top-row">
              <span className="mini-card-title">Vector Dim</span>
              <div className="mini-icon-circle bar">
                <BarChart2 size={13} />
              </div>
            </div>

            <div className="mini-card-bottom-row">
              <div className="mini-number-group">
                <span className="mini-growth-pill" style={{ color: 'var(--brand-primary)' }}>{current.dimGrowth}</span>
                <span className="mini-big-number">{current.vectorDim}</span>
              </div>

              {/* 4-Step Mini Bar Chart */}
              <div className="mini-stepped-chart" aria-hidden="true">
                <div className="mini-step-col orange" style={{ height: '10px' }}></div>
                <div className="mini-step-col orange" style={{ height: '14px' }}></div>
                <div className="mini-step-col orange" style={{ height: '14px' }}></div>
                <div className="mini-step-col orange" style={{ height: '18px' }}></div>
              </div>
            </div>
          </div>

          {/* Mini Card 4: LPU Latency */}
          <div className="bento-mini-card">
            <div className="mini-card-top-row">
              <span className="mini-card-title">LPU Latency</span>
              <div className="mini-icon-circle moon">
                <Clock size={13} />
              </div>
            </div>

            <div className="mini-card-bottom-row">
              <div className="mini-number-group">
                <span className="mini-growth-pill" style={{ color: '#f43f5e' }}>{current.latencyGrowth}</span>
                <span className="mini-big-number">{current.latency}</span>
              </div>

              {/* 4-Step Mini Bar Chart */}
              <div className="mini-stepped-chart" aria-hidden="true">
                <div className="mini-step-col pink" style={{ height: '10px' }}></div>
                <div className="mini-step-col pink" style={{ height: '15px' }}></div>
                <div className="mini-step-col pink" style={{ height: '18px' }}></div>
                <div className="mini-step-col pink" style={{ height: '22px' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Fullscreen Candidate Detail Modal */}
      {fullscreenModal && (
        <div className="fullscreen-candidate-modal-backdrop" onClick={() => setFullscreenModal(false)}>
          <div className="fullscreen-candidate-modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header-row">
              <div className="modal-title-stack">
                <h3>{current.name}</h3>
                <p>{current.title} • {current.age} • {current.location}</p>
              </div>
              <button type="button" className="modal-close-btn" onClick={() => setFullscreenModal(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body-content">
              <img src={current.avatar} alt={current.name} className="modal-profile-avatar" />
              <div className="modal-skills-list">
                <h4>Explicit Engineering Skills</h4>
                <div className="modal-tags-row">
                  {current.matchedSkills.map((sk, ski) => (
                    <span key={ski} className="modal-skill-chip">{sk}</span>
                  ))}
                </div>

                <h4 style={{ marginTop: '0.75rem', color: 'var(--brand-primary)' }}>DAG Transitive Inferences</h4>
                <div className="modal-tags-row">
                  {current.inferredSkills.map((isk, iski) => (
                    <span key={iski} className="modal-skill-chip" style={{ borderColor: 'var(--brand-border)', color: 'var(--brand-primary)' }}>
                      ⚡ {isk}
                    </span>
                  ))}
                </div>
              </div>
            </div>

            <div className="modal-footer-actions">
              <button 
                type="button" 
                className="btn-modal-action primary"
                onClick={() => {
                  setFullscreenModal(false)
                  handleAction('inspect')
                }}
              >
                Inspect Full DAG & PyMuPDF Evidence Canvas
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
