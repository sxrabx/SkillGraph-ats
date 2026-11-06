import React, { useState } from 'react'
import PdfViewer from './PdfViewer'
import Logo from './Logo'
import SpringHeading from './SpringHeading'
import AdminBar from './AdminBar'
import ThemeToggle from './ThemeToggle'
import RecruiterOverview from './RecruiterOverview'
import GraphRagChat from './ai/GraphRagChat'
import FolderReveal from './FolderReveal'
import { sampleMatchData, getDemoChatReply } from '../data/demoMockData'
import { 
  Home, 
  Briefcase, 
  Users, 
  Network, 
  FileText, 
  BarChart2, 
  MessageSquare, 
  Settings, 
  Search, 
  Bell, 
  HelpCircle, 
  Sparkles, 
  LogOut, 
  Shield, 
  User, 
  ArrowLeft,
  ChevronDown,
  Layers,
  Send,
  Calendar,
  X,
  Maximize2,
  Eye,
  Filter,
  CheckCircle2,
  Code,
  Cpu,
  Clock,
  Activity,
  Zap,
  ArrowRight,
  Check,
  Flame,
  ShieldCheck
} from 'lucide-react'

const API_URL = "http://127.0.0.1:8000"

export default function Dashboard({ user, onLogout, onGoToLanding }) {
  // Navigation tabs:
  // 'overview' (1:1 Bento Dashboard) | 'jobs' (Active Requisitions) | 'candidates' (Talent Pool Directory)
  // 'matcher' (Core ATS Engine) | 'documents' (Repository) | 'analytics' (Telemetry) | 'chat' (GraphRAG) | 'profile' (Settings)
  const [activeNav, setActiveNav] = useState('overview')
  
  // Real Project ATS Matcher State
  const [jdFile, setJdFile] = useState(null)
  const [resumeFiles, setResumeFiles] = useState([])
  const [matchData, setMatchData] = useState(sampleMatchData) // Default with rich demo walkthrough!
  const [isLoading, setIsLoading] = useState(false)
  const [isDemoMode, setIsDemoMode] = useState(true)

  // ATS Inspector & GraphRAG State
  const [activeInspectorTab, setActiveInspectorTab] = useState("preview") // 'preview' | 'chat'
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedCandidate, setSelectedCandidate] = useState(sampleMatchData.rankings[0].name)
  const [chatMessages, setChatMessages] = useState([
    {
      role: 'assistant',
      content: `Hello ${user?.name?.split(' ')[0] || 'Recruiter'}! I have loaded the Knowledge Graph profile for ${sampleMatchData.rankings[0].name} against the ${sampleMatchData.jd_title} role. Ask me anything about their qualifications, project depth, missing skills, or match rationale!`
    }
  ])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)

  // Talent Pool Directory Filters & State
  const [talentSearchQuery, setTalentSearchQuery] = useState("")
  const [talentFilter, setTalentFilter] = useState("all") // 'all' | 'top' | 'cloud' | 'devops'

  // Notifications State
  const [showNotifications, setShowNotifications] = useState(false)
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      title: "Batch Ingestion Finished",
      desc: "asyncio.gather parallel parser completed 4 candidate resumes in 1.4s (~65% faster).",
      time: "2 mins ago",
      type: "green",
      unread: true
    },
    {
      id: 2,
      title: "NVIDIA NIM 2048-D Cached",
      desc: "Computed in-memory embeddings for 'Cloud Infrastructure' (0.974 cos θ with Kubernetes).",
      time: "18 mins ago",
      type: "orange",
      unread: true
    },
    {
      id: 3,
      title: "PyMuPDF Visual Overlays Ready",
      desc: "12 bounding box evidence markers generated on Sarah Lin's resume at 150 DPI.",
      time: "1 hr ago",
      type: "cyan",
      unread: false
    },
    {
      id: 4,
      title: "GraphRAG Session Ready",
      desc: "Multi-turn streaming assistant active with transitive closure reasoning.",
      time: "3 hrs ago",
      type: "purple",
      unread: false
    }
  ])

  const unreadCount = notifications.filter(n => n.unread).length

  const handleMarkAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })))
  }

  const handleNotificationClick = (item) => {
    setNotifications(prev => prev.map(n => n.id === item.id ? { ...n, unread: false } : n))
    setShowNotifications(false)
    if (item.type === 'green' || item.type === 'cyan') {
      setActiveNav('matcher')
      setActiveInspectorTab('preview')
    } else if (item.type === 'orange') {
      setActiveNav('analytics')
    } else if (item.type === 'purple') {
      setActiveNav('chat')
    }
  }

  // Bright, theme-resilient colors for candidate folders (visible in both light & dark themes)
  const BRIGHT_FOLDER_PALETTES = ['brand', 'blue', 'green', 'amber', 'rose', 'violet', 'cyan', 'pink']

  const getCandidateBrightColor = (name, index) => {
    if (!name) return BRIGHT_FOLDER_PALETTES[index % BRIGHT_FOLDER_PALETTES.length]
    let hash = 0
    for (let i = 0; i < name.length; i++) {
      hash = name.charCodeAt(i) + ((hash << 5) - hash)
    }
    const colorIndex = (Math.abs(hash) + index) % BRIGHT_FOLDER_PALETTES.length
    return BRIGHT_FOLDER_PALETTES[colorIndex]
  }

  // Realistic uploaded candidate documents (not simple text)
  const getCandidateDocuments = (cand) => {
    const scoreVal = cand.match_score > 1 ? Number(cand.match_score) : Number(cand.match_score) * 100
    return [
      {
        id: `resume-${cand.name}`,
        name: `${cand.name.replace(/\s+/g, '_')}_Resume_Annotated.pdf`,
        type: 'PyMuPDF Bounding Boxes (3 Pages)',
        size: '1.4 MB',
        docType: 'pdf',
        action: 'preview',
        content: (
          <div className="folder-doc-card">
            <div className="folder-doc-card-top">
              <span className="folder-doc-badge-pill doc-badge-pdf">
                <FileText size={11} /> PDF
              </span>
              <span className="folder-doc-verified-pill">✓ PyMuPDF</span>
            </div>
            <div className="folder-doc-body">
              <div className="folder-doc-title" title={`${cand.name}_Resume.pdf`}>
                {cand.name.replace(/\s+/g, '_')}_Resume.pdf
              </div>
              <div className="folder-doc-sub">3 Pages • Visual Highlights</div>
              <div className="folder-doc-lines-preview">
                <span className="doc-line l-1"></span>
                <span className="doc-line l-2"></span>
                <span className="doc-line l-3"></span>
              </div>
            </div>
            <div className="folder-doc-footer">
              <span className="folder-doc-size">1.4 MB</span>
              <span className="folder-doc-inspect-link">
                Inspect <Eye size={10} />
              </span>
            </div>
          </div>
        )
      },
      {
        id: `dag-${cand.name}`,
        name: `Competency_Ontology_Inferences.json`,
        type: 'Neuro-symbolic DAG Reasoning (2048-dim)',
        size: '184 KB',
        docType: 'json',
        action: 'evidence',
        content: (
          <div className="folder-doc-card">
            <div className="folder-doc-card-top">
              <span className="folder-doc-badge-pill doc-badge-json">
                <Code size={11} /> JSON
              </span>
              <span className="folder-doc-verified-pill">✓ DAG Map</span>
            </div>
            <div className="folder-doc-body">
              <div className="folder-doc-title">Competency_DAG.json</div>
              <div className="folder-doc-sub">{cand.explicit_skills?.length || 8} Inferred Competencies</div>
              <div className="folder-doc-code-snippet">
                <code>{`{ "skills": ${cand.explicit_skills?.length || 8}, "match": ${scoreVal.toFixed(0)}% }`}</code>
              </div>
            </div>
            <div className="folder-doc-footer">
              <span className="folder-doc-size">184 KB</span>
              <span className="folder-doc-inspect-link">
                Graph <Network size={10} />
              </span>
            </div>
          </div>
        )
      },
      {
        id: `projects-${cand.name}`,
        name: `${cand.projects?.[0]?.title ? cand.projects[0].title.slice(0, 18).replace(/\s+/g, '_') : 'Systems'}_Dossier.pdf`,
        type: `${cand.projects?.length || 2} Production Systems Projects`,
        size: '890 KB',
        docType: 'project',
        action: 'projects',
        content: (
          <div className="folder-doc-card">
            <div className="folder-doc-card-top">
              <span className="folder-doc-badge-pill doc-badge-project">
                <Briefcase size={11} /> CASE
              </span>
              <span className="folder-doc-verified-pill">✓ Codebase</span>
            </div>
            <div className="folder-doc-body">
              <div className="folder-doc-title">Project_Dossier.pdf</div>
              <div className="folder-doc-sub">{cand.projects?.[0]?.title || 'Cloud Architecture'}</div>
              <div className="folder-doc-tech-chips">
                {cand.projects?.[0]?.technologies?.slice(0, 2).map((t, ti) => (
                  <span key={ti} className="mini-tech-chip">{t}</span>
                ))}
              </div>
            </div>
            <div className="folder-doc-footer">
              <span className="folder-doc-size">890 KB</span>
              <span className="folder-doc-inspect-link">
                Evidence <Eye size={10} />
              </span>
            </div>
          </div>
        )
      },
      {
        id: `eval-${cand.name}`,
        name: `SkillGraph_Match_Brief.pdf`,
        type: `${scoreVal.toFixed(1)}% LLM Grounded Assessment`,
        size: '340 KB',
        docType: 'brief',
        action: 'chat',
        content: (
          <div className="folder-doc-card">
            <div className="folder-doc-card-top">
              <span className="folder-doc-badge-pill doc-badge-brief">
                <Sparkles size={11} /> EVAL
              </span>
              <span className="folder-doc-verified-pill">✓ GraphRAG</span>
            </div>
            <div className="folder-doc-body">
              <div className="folder-doc-title">AI_Match_Brief.pdf</div>
              <div className="folder-doc-sub">{scoreVal.toFixed(1)}% Match Rating</div>
              <div className="folder-doc-eval-rating">
                <span className="eval-score-text">Rating: {scoreVal >= 90 ? 'Tier 1 Elite Hire' : 'Shortlisted Profile'}</span>
              </div>
            </div>
            <div className="folder-doc-footer">
              <span className="folder-doc-size">340 KB</span>
              <span className="folder-doc-inspect-link">
                Ask AI <MessageSquare size={10} />
              </span>
            </div>
          </div>
        )
      }
    ]
  }

  const handleCandidateDocClick = (cand, item) => {
    setSelectedCandidate(cand.name)
    if (item.action === 'preview') {
      setActiveNav('matcher')
      setActiveInspectorTab('preview')
    } else if (item.action === 'chat') {
      setActiveNav('chat')
    } else if (item.action === 'evidence' || item.action === 'projects') {
      setActiveNav('matcher')
      setActiveInspectorTab('preview')
    }
  }

  const filteredCandidates = (matchData?.rankings || []).filter(cand => {
    const q = talentSearchQuery.toLowerCase().trim()
    const matchesSearch = !q || 
      cand.name.toLowerCase().includes(q) || 
      cand.role?.toLowerCase().includes(q) || 
      cand.explicit_skills?.some(s => s.toLowerCase().includes(q))
    
    if (!matchesSearch) return false

    const score = cand.match_score > 1 ? Number(cand.match_score) : Number(cand.match_score) * 100
    if (talentFilter === 'top') return score >= 90
    if (talentFilter === 'cloud') return cand.role?.toLowerCase().includes('cloud') || cand.explicit_skills?.includes('AWS')
    if (talentFilter === 'devops') return cand.role?.toLowerCase().includes('devops') || cand.role?.toLowerCase().includes('platform') || cand.explicit_skills?.includes('Kubernetes')
    return true
  })

  // Real Backend Match Handler (with fallback to Demo Walkthrough if backend is offline)
  const handleMatch = async (e) => {
    if (e) e.preventDefault()
    if (!jdFile || resumeFiles.length === 0) {
      alert("Please select a Job Description and at least one Resume, or click 'Load Demo Walkthrough'")
      return
    }
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append("jd_file", jdFile)
    Array.from(resumeFiles).forEach(file => formData.append("resume_files", file))

    try {
      const res = await fetch(`${API_URL}/api/match`, {
        method: "POST",
        body: formData
      })
      if (!res.ok) throw new Error("Backend response error")
      const data = await res.json()
      setMatchData(data)
      setIsDemoMode(false)
      setChatMessages([])
      if (data.rankings && data.rankings.length > 0) {
        setSelectedCandidate(data.rankings[0].name)
      }
      setActiveInspectorTab("preview")
    } catch (err) {
      console.warn("Backend offline, switching to demo walkthrough mode:", err)
      alert("Backend server (port 8000) is currently offline. Loading interactive Demo Walkthrough with 4 analyzed candidates!")
      loadDemoData()
    }
    setIsLoading(false)
  }

  // Demo Walkthrough Loader
  const loadDemoData = () => {
    setMatchData(sampleMatchData)
    setIsDemoMode(true)
    setSelectedCandidate(sampleMatchData.rankings[0].name)
    setChatMessages([
      {
        role: 'assistant',
        content: `Demo Mode Active: Knowledge Graph profile loaded for ${sampleMatchData.rankings[0].name}. You can evaluate candidate skills, view extracted project evidence, or ask questions below without starting the backend!`
      }
    ])
  }

  // Real or Demo GraphRAG Chat Handler
  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedCandidate) return

    const userMsg = { role: "user", content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    const promptText = chatInput
    setChatInput("")
    setIsChatting(true)

    // If Demo Mode or backend offline, generate intelligent mock response
    if (isDemoMode) {
      setTimeout(() => {
        const reply = getDemoChatReply(selectedCandidate, promptText)
        setChatMessages(prev => [...prev, { role: "assistant", content: reply }])
        setIsChatting(false)
      }, 450)
      return
    }

    // Otherwise query real FastAPI backend
    const formData = new FormData()
    formData.append("candidate_name", selectedCandidate)
    formData.append("question", userMsg.content)

    try {
      const res = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      setChatMessages(prev => [...prev, { role: "assistant", content: data.reply }])
    } catch (err) {
      // Graceful fallback to demo response if backend drops
      const fallbackReply = getDemoChatReply(selectedCandidate, promptText)
      setChatMessages(prev => [...prev, { role: "assistant", content: fallbackReply }])
    }
    setIsChatting(false)
  }

  const currentCandidate = matchData?.rankings?.find(c => c.name === selectedCandidate) || matchData?.rankings?.[0]

  return (
    <div className="modern-dashboard-layout">
      {/* 1. SLIM VERTICAL SIDEBAR (Each option has a unique key, preventing duplicate selection) */}
      <aside className="dashboard-vertical-sidebar">
        {/* Top Logo */}
        <div className="sidebar-brand-top" onClick={onGoToLanding} title="SkillGraph Homepage">
          <div className="sidebar-brand-icon">
            <span className="s-bar b-1"></span>
            <span className="s-bar b-2"></span>
            <span className="s-bar b-3"></span>
          </div>
          <span className="sidebar-brand-text">SkillGraph</span>
        </div>

        {/* Navigation Icon Stack */}
        <nav className="sidebar-nav-stack">
          {/* 1. Overview Dashboard */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveNav('overview')}
            title="Recruiter Overview Dashboard"
          >
            <Home size={19} />
          </button>

          {/* 2. Active Jobs / Requisitions */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveNav('jobs')}
            title="Active Requisitions (4 Engineering Roles)"
          >
            <Briefcase size={19} />
          </button>

          {/* 3. Talent Pool Candidates */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveNav('candidates')}
            title="Talent Pool & Dossiers"
          >
            <Users size={19} />
          </button>

          {/* 4. ATS Knowledge Graph Matcher */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'matcher' ? 'active' : ''}`}
            onClick={() => setActiveNav('matcher')}
            title="ATS Knowledge Graph Matcher (Ingestion & Highlight Engine)"
          >
            <Network size={19} />
          </button>

          {/* 5. Documents / Ingestion Repository */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'documents' ? 'active' : ''}`}
            onClick={() => setActiveNav('documents')}
            title="Resume Documents & Ingestion Repository"
          >
            <FileText size={19} />
          </button>

          {/* 6. Competency Analytics & Telemetry */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'analytics' ? 'active' : ''}`}
            onClick={() => setActiveNav('analytics')}
            title="Competency Analytics & Telemetry"
          >
            <BarChart2 size={19} />
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-bottom-stack">
          {/* 7. GraphRAG Recruiter Chat */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveNav('chat')}
            title="GraphRAG AI Assistant"
          >
            <MessageSquare size={19} />
          </button>

          {/* 8. Recruiter Profile & Settings */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'profile' ? 'active' : ''}`}
            onClick={() => setActiveNav('profile')}
            title="Recruiter Profile & System Settings"
          >
            <User size={19} />
          </button>

          {/* Return to Website */}
          <button 
            type="button" 
            className="sidebar-nav-btn"
            onClick={onGoToLanding}
            title="Return to Website"
          >
            <ArrowLeft size={19} />
          </button>

          {/* Log Out */}
          <button 
            type="button" 
            className="sidebar-nav-btn logout-btn"
            onClick={onLogout}
            title="Log Out"
          >
            <LogOut size={19} />
          </button>
        </div>
      </aside>

      {/* 2. MAIN DASHBOARD CONTENT AREA */}
      <div className="dashboard-main-wrapper">
        {/* Optional Admin Diagnostics strip */}
        <AdminBar user={user} />

        {/* Top Navbar Header */}
        <header className="dashboard-top-navbar">
          <div className="top-nav-left">
            <SpringHeading tag="h1" align="left" className="dashboard-page-title" key={activeNav}>
              {activeNav === 'overview' && 'Recruiter Overview Dashboard'}
              {activeNav === 'jobs' && 'Active Engineering Requisitions'}
              {activeNav === 'candidates' && 'Talent Pool & Engineering Dossiers'}
              {activeNav === 'matcher' && 'ATS Knowledge Graph Matcher'}
              {activeNav === 'documents' && 'Document Ingestion & Vector Storage'}
              {activeNav === 'analytics' && 'Competency Matrix & Telemetry'}
              {activeNav === 'chat' && 'GraphRAG Streaming Recruiter Assistant'}
              {activeNav === 'profile' && 'Recruiter Profile & System Telemetry'}
            </SpringHeading>
          </div>

          {/* Center Search Bar */}
          <div className="dashboard-search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search competencies, candidates, requisitions..." 
              className="dashboard-search-input"
            />
          </div>

          {/* Right Header Actions */}
          <div className="top-nav-right">
            {/* Theme Toggle Pill Variant */}
            <ThemeToggle variant="pill" size="sm" />

            {/* Demo Walkthrough Badge / Toggle */}
            <button 
              type="button" 
              onClick={loadDemoData}
              className={`btn-demo-walkthrough ${isDemoMode ? 'active' : ''}`}
              title="Click to reload interactive demo data without backend"
            >
              <Sparkles size={13} /> {isDemoMode ? 'Demo Mode Active' : 'Load Demo Data'}
            </button>

            {/* Notification Bell with Pop-Out Drawer */}
            <div className="notification-popout-anchor">
              <button 
                type="button" 
                className={`btn-icon-circle ${showNotifications ? 'active' : ''}`} 
                onClick={() => setShowNotifications(prev => !prev)}
                title="Notifications"
                aria-label="Toggle notifications"
              >
                <Bell size={17} />
                {unreadCount > 0 && <span className="notification-dot"></span>}
              </button>

              {showNotifications && (
                <div className="dashboard-notification-popout">
                  <div className="popout-header">
                    <div className="popout-title-row">
                      <span className="popout-title">System Notifications</span>
                      {unreadCount > 0 && (
                        <span className="popout-badge">{unreadCount} New</span>
                      )}
                    </div>
                    <button 
                      type="button" 
                      className="popout-clear-btn"
                      onClick={handleMarkAllRead}
                    >
                      Mark all as read
                    </button>
                  </div>

                  <div className="popout-list">
                    {notifications.map((n) => (
                      <div 
                        key={n.id} 
                        className={`popout-item ${n.unread ? 'unread' : ''}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div className={`popout-item-icon ${n.type}`}>
                          {n.type === 'green' && <CheckCircle2 size={16} />}
                          {n.type === 'orange' && <Cpu size={16} />}
                          {n.type === 'cyan' && <FileText size={16} />}
                          {n.type === 'purple' && <Sparkles size={16} />}
                        </div>
                        <div className="popout-item-content">
                          <span className="popout-item-title">{n.title}</span>
                          <span className="popout-item-desc">{n.desc}</span>
                          <span className="popout-item-time">{n.time}</span>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="popout-footer">
                    <button 
                      type="button" 
                      className="popout-footer-btn"
                      onClick={() => setShowNotifications(false)}
                    >
                      Close Notifications
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Help / Docs */}
            <a 
              href="http://127.0.0.1:8000/docs" 
              target="_blank" 
              rel="noreferrer" 
              className="btn-icon-circle" 
              title="FastAPI Swagger Documentation"
            >
              <HelpCircle size={17} />
            </a>

            {/* Upgrade Plan Button */}
            <button type="button" className="btn-upgrade-plan" onClick={() => alert("Enterprise ATS: Plan active with unlimited parses and 2048-dim cloud embeddings.")}>
              Upgrade plan
            </button>

            {/* User Profile Avatar */}
            <div 
              className="user-profile-badge" 
              onClick={() => setActiveNav('profile')}
              title="Recruiter Profile & System Telemetry"
              role="button"
              tabIndex={0}
            >
              <img 
                src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=80&h=80&q=80" 
                alt="Profile" 
                className="user-profile-img"
              />
              <ChevronDown size={14} className="user-chevron" />
            </div>
          </div>
        </header>

        {/* 3. DYNAMIC CONTENT PAGES */}
        <main className="dashboard-content-scroll">
          {/* PAGE 1: RECRUITER OVERVIEW (The 1:1 Bento Dashboard UI) */}
          {activeNav === 'overview' && (
            <RecruiterOverview 
              onSelectCandidate={(cand) => {
                setSelectedCandidate(cand.name)
                setActiveNav('matcher')
                setActiveInspectorTab('preview')
              }}
              onNavigateToMatcher={() => setActiveNav('matcher')}
              onNavigateToChat={() => setActiveNav('chat')}
            />
          )}

          {/* PAGE 2: ACTIVE REQUISITIONS */}
          {activeNav === 'jobs' && (
            <div className="jobs-page-wrapper">
              <div className="talent-pool-header-strip">
                <div className="talent-pool-title-group">
                  <div className="talent-pool-badge-chip">
                    <Briefcase size={14} /> 4 Active Requisitions // Engineering & Platform
                  </div>
                  <SpringHeading tag="h2" align="left">Active Engineering Requisitions</SpringHeading>
                  <p>
                    Requisitions evaluated in real-time through the SkillGraph neuro-symbolic DAG pipeline.
                  </p>
                </div>

                <div className="talent-pool-actions-group">
                  <button 
                    type="button" 
                    className="btn-primary talent-upload-btn"
                    onClick={() => setActiveNav('matcher')}
                  >
                    <span>⚡</span> Run Batch Matcher
                  </button>
                </div>
              </div>

              {/* Jobs Grid */}
              <div className="jobs-grid">
                {[
                  {
                    id: 'req-1',
                    code: 'REQ-2026-ENG-9042',
                    title: 'Staff Distributed Systems Engineer',
                    dept: 'Core Infrastructure',
                    loc: 'San Francisco, CA (Hybrid)',
                    priority: 'P0 / CRITICAL',
                    applicants: 28,
                    ranked: 4,
                    topScore: '94% (Sarah Lin)',
                    skills: ['Kubernetes Orchestration', 'Raft Consensus', 'Golang', '2048-D Dense Vectors']
                  },
                  {
                    id: 'req-2',
                    code: 'REQ-2026-ENG-8821',
                    title: 'Lead Cloud & Platform Architect',
                    dept: 'Platform Engineering',
                    loc: 'Bengaluru, IN / Remote',
                    priority: 'URGENT',
                    applicants: 42,
                    ranked: 7,
                    topScore: '91% (Rohan Sahu)',
                    skills: ['AWS CloudFormation', 'Multi-Region K8s', 'Docker Swarm', 'Prometheus']
                  },
                  {
                    id: 'req-3',
                    code: 'REQ-2026-ENG-7640',
                    title: 'Principal Site Reliability Engineer',
                    dept: 'SRE & Systems',
                    loc: 'Austin, TX (Hybrid)',
                    priority: 'HIGH PRIORITY',
                    applicants: 19,
                    ranked: 5,
                    topScore: '86% (Sumit Kar)',
                    skills: ['Linux Kernel Tuning', 'eBPF Profiling', 'Prometheus/Thanos', 'Helm']
                  },
                  {
                    id: 'req-4',
                    code: 'REQ-2026-ENG-6120',
                    title: 'Principal Platform Automation Specialist',
                    dept: 'DevOps & Tooling',
                    loc: 'Seattle, WA / Remote',
                    priority: 'ACTIVE',
                    applicants: 15,
                    ranked: 3,
                    topScore: '89% (Aditi Pradhan)',
                    skills: ['Terraform Modules', 'ArgoCD GitOps', 'GitHub Actions', 'IaC']
                  }
                ].map(job => (
                  <div key={job.id} className="job-card">
                    <div className="job-card-top-row">
                      <div>
                        <h3 className="job-role-title">{job.title}</h3>
                        <div className="job-role-meta">
                          {job.code} • {job.dept} • {job.loc}
                        </div>
                      </div>
                      <span className="job-priority-pill">{job.priority}</span>
                    </div>

                    <div className="job-pipeline-stats">
                      <div className="pipeline-stat-box">
                        <span className="stat-box-val">{job.applicants}</span>
                        <span className="stat-box-lbl">Ingested</span>
                      </div>
                      <div className="pipeline-stat-box">
                        <span className="stat-box-val" style={{ color: 'var(--brand-primary)' }}>{job.ranked}</span>
                        <span className="stat-box-lbl">Graph Ranked</span>
                      </div>
                      <div className="pipeline-stat-box">
                        <span className="stat-box-val" style={{ color: '#10b981', fontSize: '0.95rem' }}>{job.topScore}</span>
                        <span className="stat-box-lbl">Top Match</span>
                      </div>
                    </div>

                    <div className="job-skills-strip">
                      <span className="competencies-label">Target Competencies:</span>
                      <div className="competencies-tags">
                        {job.skills.map((s, si) => (
                          <span key={si} className="competency-tag">{s}</span>
                        ))}
                      </div>
                    </div>

                    <div className="job-actions-row">
                      <button 
                        type="button" 
                        className="btn-talent-inspect"
                        onClick={() => setActiveNav('candidates')}
                      >
                        <Users size={14} /> Review Candidates ({job.ranked})
                      </button>
                      <button 
                        type="button" 
                        className="btn-talent-chat"
                        onClick={() => setActiveNav('matcher')}
                      >
                        <Network size={14} /> Match Pipeline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 3: TALENT POOL DIRECTORY (POWERED BY ANIMATED FOLDER REVEAL) */}
          {activeNav === 'candidates' && (
            <div className="talent-pool-page">
              {/* Header and Filter Controls */}
              <div className="talent-pool-header-strip">
                <div className="talent-pool-title-group">
                  <div className="talent-pool-badge-chip">
                    <Users size={14} /> 1,248 Candidates in Directory
                  </div>
                  <SpringHeading tag="h2" align="left">Talent Pool Directory</SpringHeading>
                  <p>
                    Interactive animated candidate dossiers. Hover or click any candidate's folder to fan out and inspect their verified ATS artifacts.
                  </p>
                </div>

                <div className="talent-pool-actions-group">
                  <div className="talent-pool-search-box">
                    <Search size={14} className="talent-search-icon" />
                    <input
                      type="text"
                      placeholder="Filter by name, skill, or role..."
                      value={talentSearchQuery}
                      onChange={(e) => setTalentSearchQuery(e.target.value)}
                      className="talent-search-input"
                    />
                    {talentSearchQuery && (
                      <button
                        type="button"
                        onClick={() => setTalentSearchQuery('')}
                        className="talent-search-clear"
                        title="Clear search"
                      >
                        ✕
                      </button>
                    )}
                  </div>

                  <div className="talent-filter-pills">
                    <button
                      type="button"
                      className={`filter-pill ${talentFilter === 'all' ? 'active' : ''}`}
                      onClick={() => setTalentFilter('all')}
                    >
                      All ({matchData?.rankings?.length || 0})
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${talentFilter === 'top' ? 'active' : ''}`}
                      onClick={() => setTalentFilter('top')}
                    >
                      Top 90%+
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${talentFilter === 'cloud' ? 'active' : ''}`}
                      onClick={() => setTalentFilter('cloud')}
                    >
                      Cloud / SDE
                    </button>
                    <button
                      type="button"
                      className={`filter-pill ${talentFilter === 'devops' ? 'active' : ''}`}
                      onClick={() => setTalentFilter('devops')}
                    >
                      Platform / DevOps
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveNav('matcher')}
                    className="btn-primary talent-upload-btn"
                  >
                    <span>⚡</span> Upload New Batch
                  </button>
                </div>
              </div>

              {/* Grid of Animated Folder Reveal Dossiers */}
              <div className="talent-folders-grid">
                {filteredCandidates.map((cand, i) => {
                  const scoreValue = cand.match_score > 1 ? Number(cand.match_score) : Number(cand.match_score) * 100
                  const folderColor = getCandidateBrightColor(cand.name, i)
                  const docs = getCandidateDocuments(cand)

                  return (
                    <div key={cand.name || i} className="talent-folder-card">
                      {/* Top Header Strip with Candidate Rank & Quick Meta */}
                      <div className="talent-folder-card-header">
                        <div className="talent-header-left">
                          <span className="talent-rank-badge">#{i + 1}</span>
                          <div className="talent-candidate-identity">
                            <SpringHeading tag="h3" align="left" className="talent-candidate-name">{cand.name}</SpringHeading>
                            <span className="talent-candidate-role">{cand.role || 'Software Engineer'}</span>
                          </div>
                        </div>
                        <div className="talent-header-right">
                          <span className={`talent-score-badge ${scoreValue >= 90 ? 'score-elite' : 'score-good'}`}>
                            <Sparkles size={12} /> {scoreValue.toFixed(1)}% Match
                          </span>
                        </div>
                      </div>

                      {/* Hero Interactive Folder Reveal Stage */}
                      <div className="talent-folder-reveal-stage">
                        <FolderReveal
                          label={cand.name}
                          items={docs}
                          color={folderColor}
                          size={290}
                          trigger="hover"
                          badge={`${scoreValue.toFixed(0)}% Match`}
                          onItemClick={(item) => handleCandidateDocClick(cand, item)}
                        />
                        <div className="talent-folder-hint">
                          <span>Hover or click folder to reveal documents</span>
                        </div>
                      </div>

                      {/* Candidate Dossier Summary & Extracted Skills */}
                      <div className="talent-folder-dossier-meta">
                        <p className="talent-folder-summary">{cand.summary}</p>

                        <div className="talent-folder-competencies">
                          <span className="competencies-label">Verified Competencies:</span>
                          <div className="competencies-tags">
                            {cand.explicit_skills?.slice(0, 6).map((skill, si) => (
                              <span key={si} className="competency-tag">
                                {skill}
                              </span>
                            ))}
                            {cand.explicit_skills?.length > 6 && (
                              <span className="competency-tag-more">
                                +{cand.explicit_skills.length - 6} more
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Bottom Actions Row */}
                      <div className="talent-folder-card-footer">
                        <button
                          type="button"
                          className="btn-talent-inspect"
                          onClick={() => {
                            setSelectedCandidate(cand.name)
                            setActiveNav('matcher')
                            setActiveInspectorTab('preview')
                          }}
                        >
                          <Eye size={14} /> Inspect Evidence
                        </button>
                        <button
                          type="button"
                          className="btn-talent-chat"
                          onClick={() => {
                            setSelectedCandidate(cand.name)
                            setActiveNav('chat')
                          }}
                        >
                          <MessageSquare size={14} /> Ask AI Chat
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>

              {filteredCandidates.length === 0 && (
                <div className="talent-empty-search">
                  <p>No candidates match your filter or search query "{talentSearchQuery}".</p>
                  <button
                    type="button"
                    onClick={() => { setTalentSearchQuery(''); setTalentFilter('all'); }}
                    className="btn-card-ghost"
                  >
                    Reset Filters
                  </button>
                </div>
              )}
            </div>
          )}

          {/* PAGE 4: ATS MATCH ENGINE (The real project preserved & polished) */}
          {activeNav === 'matcher' && (
            <div className="matcher-workspace-view">
              <div className="matcher-banner-strip">
                <div className="matcher-banner-text">
                  <SpringHeading tag="h3" align="left">⚡ Real Project Matcher & Visual Annotation Canvas</SpringHeading>
                  <p>
                    Connects to your FastAPI server (<code>POST /api/match</code>). Upload real Job Descriptions and candidate resumes to compute 2048-dim embeddings, DAG ontology reasoning, and color-coded PyMuPDF bounding boxes.
                  </p>
                </div>
                <div className="matcher-banner-actions">
                  <button type="button" onClick={loadDemoData} className="btn-banner-demo">
                    <Sparkles size={14} /> Quick-Load Demo Walkthrough
                  </button>
                </div>
              </div>

              {/* TWO COLUMN MATCH ENGINE */}
              <div className="layout">
                {/* LEFT COLUMN: UPLOADS & RANKINGS */}
                <div className="panel match-panel">
                  <div className="panel-header-wrap">
                    <SpringHeading tag="h2" align="left" className="panel-title">
                      <span>📥</span> 1. Ingestion Pipeline
                    </SpringHeading>
                    <span className="panel-badge">Groq + NVIDIA Cloud</span>
                  </div>

                  <form onSubmit={handleMatch} className="upload-form">
                    {/* Job Description Dropzone */}
                    <div className="dropzone-group">
                      <span className="dropzone-label">
                        Job Description (PDF)
                        {jdFile && <span className="dropzone-file-badge">✓ Loaded</span>}
                      </span>
                      <div className={`dropzone-box ${jdFile ? 'has-file' : ''}`}>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          onChange={e => setJdFile(e.target.files[0])} 
                          className="dropzone-file-input"
                        />
                        <span className="dropzone-icon">{jdFile ? '📄' : '📤'}</span>
                        <span className="dropzone-text">
                          {jdFile ? jdFile.name : "Click or drag Job Description PDF"}
                        </span>
                      </div>
                    </div>

                    {/* Candidate Resumes Dropzone */}
                    <div className="dropzone-group">
                      <span className="dropzone-label">
                        Candidate Resumes (PDFs)
                        {resumeFiles.length > 0 && (
                          <span className="dropzone-file-badge">✓ {resumeFiles.length} Selected</span>
                        )}
                      </span>
                      <div className={`dropzone-box ${resumeFiles.length > 0 ? 'has-file' : ''}`}>
                        <input 
                          type="file" 
                          accept=".pdf" 
                          multiple 
                          onChange={e => setResumeFiles(e.target.files)} 
                          className="dropzone-file-input"
                        />
                        <span className="dropzone-icon">{resumeFiles.length > 0 ? '📑' : '📂'}</span>
                        <span className="dropzone-text">
                          {resumeFiles.length > 0 
                            ? `${resumeFiles.length} resume file(s) selected` 
                            : "Click or drag Candidate Resumes"}
                        </span>
                      </div>
                    </div>

                    <button type="submit" disabled={isLoading} className="btn-primary">
                      {isLoading ? (
                        <>
                          <div className="pdf-spinner" style={{ width: 18, height: 18, borderWidth: 2 }}></div>
                          Extracting Graph & Highlighting...
                        </>
                      ) : (
                        <>
                          <span>⚡</span> Calculate Match Scores
                        </>
                      )}
                    </button>
                  </form>

                  {/* Candidate Rankings List */}
                  {matchData && (
                    <div className="results">
                      <div className="results-heading">
                        <span>Ranked Candidates</span>
                        <span className="panel-badge">{matchData.rankings.length} Total</span>
                      </div>

                      {matchData.rankings.map((cand, idx) => {
                        const scoreValue = cand.match_score > 1 ? Number(cand.match_score) : Number(cand.match_score) * 100
                        const isSelected = cand.name === selectedCandidate
                        const scoreClass = scoreValue >= 70 ? 'score-high' : scoreValue >= 50 ? 'score-mid' : 'score-low'
                        const fillClass = scoreValue >= 70 ? 'fill-high' : scoreValue >= 50 ? 'fill-mid' : 'fill-low'

                        return (
                          <div key={idx} className={`candidate-card ${isSelected ? 'selected' : ''}`}>
                            <div className="card-top">
                              <div className="candidate-name-wrap">
                                <span className={`rank-badge ${idx === 0 ? 'top-1' : ''}`}>#{idx + 1}</span>
                                <SpringHeading tag="h4" align="left">{cand.name}</SpringHeading>
                              </div>
                              <span className={`score-badge ${scoreClass}`}>
                                {scoreValue.toFixed(1)}% Match
                              </span>
                            </div>

                            {/* Score Bar */}
                            <div className="match-bar-track">
                              <div 
                                className={`match-bar-fill ${fillClass}`} 
                                style={{ width: `${Math.min(100, Math.max(8, scoreValue))}%` }}
                              ></div>
                            </div>

                            <div className="card-summary-row">
                              <span className="summary-chip chip-matched">
                                🟢 {cand.matched_requirements?.length || 0} Matched Skills
                              </span>
                              <span className="summary-chip chip-extracted">
                                🔵 {cand.explicit_skills?.length || 0} Profile Skills
                              </span>
                            </div>

                            <div className="card-actions">
                              <button 
                                type="button" 
                                className="btn-card-action btn-card-primary"
                                onClick={() => {
                                  setSelectedCandidate(cand.name)
                                  setActiveInspectorTab('preview')
                                }}
                              >
                                📄 View Highlights
                              </button>
                              <button 
                                type="button" 
                                className="btn-card-action"
                                onClick={() => {
                                  setSelectedCandidate(cand.name)
                                  setIsModalOpen(true)
                                }}
                              >
                                ⛶ Fullscreen
                              </button>
                              <button 
                                type="button" 
                                className="btn-card-action"
                                onClick={() => {
                                  setSelectedCandidate(cand.name)
                                  setActiveInspectorTab('chat')
                                }}
                              >
                                💬 Chat
                              </button>
                            </div>
                          </div>
                        )
                      })}
                    </div>
                  )}
                </div>

                {/* RIGHT COLUMN: WORKBENCH (TABBED PDF INSPECTOR & CHAT) */}
                <div className="panel inspector-panel">
                  <div className="panel-tab-header">
                    <button 
                      className={`tab-btn ${activeInspectorTab === 'preview' ? 'active' : ''}`}
                      onClick={() => setActiveInspectorTab('preview')}
                    >
                      <span>📄</span> Highlighted Resume Inspector
                    </button>
                    <button 
                      className={`tab-btn ${activeInspectorTab === 'chat' ? 'active' : ''}`}
                      onClick={() => setActiveInspectorTab('chat')}
                    >
                      <span>💬</span> GraphRAG AI Assistant
                    </button>
                  </div>

                  {!matchData ? (
                    <div className="placeholder-box">
                      <span className="placeholder-icon">📋</span>
                      <SpringHeading tag="h3" align="center" className="justify-center">No Candidate Loaded Yet</SpringHeading>
                      <p>Upload a Job Description and candidate resumes on the left to calculate match scores.</p>
                    </div>
                  ) : (
                    <div className="tab-body">
                      {/* Controls bar */}
                      <div className="workbench-controls">
                        <div className="cand-selector">
                          <label>Inspecting Candidate:</label>
                          <select 
                            className="styled-select"
                            value={selectedCandidate} 
                            onChange={e => {
                              setSelectedCandidate(e.target.value)
                            }}
                          >
                            {matchData.rankings.map((c, i) => (
                              <option key={i} value={c.name}>
                                #{i + 1} {c.name} ({Number(c.match_score).toFixed(1)}%)
                              </option>
                            ))}
                          </select>
                        </div>

                        <button 
                          className="btn-tool" 
                          onClick={() => setIsModalOpen(true)}
                          title="Expand to Fullscreen Modal Inspector"
                        >
                          ⛶ Fullscreen Inspector
                        </button>
                      </div>

                      {/* TAB 1: HIGHLIGHTED PDF PREVIEW */}
                      {activeInspectorTab === 'preview' && (
                        <div className="preview-container">
                          {/* Color Legend */}
                          <div className="legend-strip">
                            <span className="legend-chip green">
                              <span className="dot dot-green"></span> 🟢 Matched Skills ({currentCandidate?.matched_requirements?.length || 0})
                            </span>
                            <span className="legend-chip orange">
                              <span className="dot dot-orange"></span> 🟠 Projects & Tech ({currentCandidate?.projects?.length || 0})
                            </span>
                            <span className="legend-chip blue">
                              <span className="dot dot-blue"></span> 🔵 Extracted Skills ({currentCandidate?.explicit_skills?.length || 0})
                            </span>
                          </div>

                          {/* Interactive Resume Viewer */}
                          {currentCandidate?.annotated_pdf_url ? (
                            <div className="pdf-viewer-wrapper">
                              <PdfViewer
                                url={`${API_URL}${currentCandidate.annotated_pdf_url}`}
                                title={`Annotated Resume: ${currentCandidate.name}`}
                              />
                            </div>
                          ) : (
                            /* Simulated Interactive Resume Canvas for Demo Walkthrough */
                            <div className="demo-resume-preview-card">
                              <div className="demo-resume-header">
                                <div>
                                  <SpringHeading tag="h3" align="left" key={currentCandidate?.name}>
                                    {currentCandidate?.name}
                                  </SpringHeading>
                                  <span className="demo-resume-role">{currentCandidate?.role || 'Senior Cloud Engineer'}</span>
                                </div>
                                <span className="demo-badge-highlight">
                                  ✓ PyMuPDF Visual Evidence Ready
                                </span>
                              </div>

                              <div className="demo-resume-section">
                                <SpringHeading tag="h4" align="left">Executive Summary (Ontology Grounded)</SpringHeading>
                                <p>{currentCandidate?.summary || 'Demonstrates deep systems architecture expertise across multiple cloud platforms.'}</p>
                              </div>

                              <div className="demo-resume-section">
                                <SpringHeading tag="h4" align="left">Verified Competencies & Evidence Highlights</SpringHeading>
                                <div className="skills-badge-wrap">
                                  {currentCandidate?.explicit_skills?.map((skill, si) => (
                                    <span key={si} className="skill-evidence-chip green">
                                      🟢 {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>

                              {currentCandidate?.projects && (
                                <div className="demo-resume-section">
                                  <SpringHeading tag="h4" align="left">Documented Engineering Projects</SpringHeading>
                                  <div className="project-grid">
                                    {currentCandidate.projects.map((p, idx) => (
                                      <div key={idx} className="project-badge-card">
                                        <span className="project-title">{p.title}</span>
                                        <div className="tech-pills">
                                          {p.technologies?.map((tech, ti) => (
                                            <span key={ti} className="tech-pill">{tech}</span>
                                          ))}
                                        </div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      )}

                      {/* TAB 2: GRAPHRAG CHAT (POWERED BY SMOOTHUI SUITE) */}
                      {activeInspectorTab === 'chat' && (
                        <div style={{ height: '620px', width: '100%' }}>
                          <GraphRagChat 
                            selectedCandidate={selectedCandidate}
                            candidates={matchData?.rankings || []}
                            onSelectCandidate={setSelectedCandidate}
                            isCompact={true}
                            user={user}
                          />
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* PAGE 5: DOCUMENTS & INGESTION REPOSITORY */}
          {activeNav === 'documents' && (
            <div className="documents-page-wrapper">
              <div className="documents-header-strip">
                <div className="talent-pool-title-group">
                  <div className="talent-pool-badge-chip">
                    <FileText size={14} /> High-Throughput Parallel Ingestion Repository
                  </div>
                  <SpringHeading tag="h2" align="left">Document Ingestion & Vector Storage</SpringHeading>
                  <p>
                    Parallelized multi-resume parsing via Python's <code>asyncio.gather</code> and server-side PyMuPDF 150 DPI page streaming.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-primary talent-upload-btn"
                  onClick={() => setActiveNav('matcher')}
                >
                  <span>⚡</span> Ingest New Document Batch
                </button>
              </div>

              {/* Stats Row */}
              <div className="documents-pipeline-stats">
                <div className="doc-stat-card">
                  <div className="doc-stat-icon-wrap orange">
                    <Cpu size={22} />
                  </div>
                  <div className="doc-stat-info">
                    <span className="doc-stat-value">2048-D</span>
                    <span className="doc-stat-label">NVIDIA NIM In-Memory Vectors</span>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="doc-stat-icon-wrap green">
                    <Zap size={22} />
                  </div>
                  <div className="doc-stat-info">
                    <span className="doc-stat-value">~65% Faster</span>
                    <span className="doc-stat-label">asyncio.gather Parallel Parsing</span>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="doc-stat-icon-wrap blue">
                    <FileText size={22} />
                  </div>
                  <div className="doc-stat-info">
                    <span className="doc-stat-value">150 DPI</span>
                    <span className="doc-stat-label">Zero-CORS PyMuPDF Streaming</span>
                  </div>
                </div>

                <div className="doc-stat-card">
                  <div className="doc-stat-icon-wrap purple">
                    <ShieldCheck size={22} />
                  </div>
                  <div className="doc-stat-info">
                    <span className="doc-stat-value">100% Pydantic</span>
                    <span className="doc-stat-label">Deterministic Schema Validation</span>
                  </div>
                </div>
              </div>

              {/* Documents Table */}
              <div className="documents-table-card">
                <table className="documents-table">
                  <thead>
                    <tr>
                      <th>Document Name</th>
                      <th>Artifact Type</th>
                      <th>Pages</th>
                      <th>Visual Evidence</th>
                      <th>Vector Embedding</th>
                      <th>Status</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {[
                      { name: 'Staff_Distributed_Systems_JD.pdf', type: 'Job Description', ext: 'pdf', pages: '2 Pages', evidence: 'Target Ontology Root', vector: 'Precomputed 2048-D', status: 'Cached' },
                      { name: 'Sarah_Lin_Resume_Annotated.pdf', type: 'Candidate Resume', ext: 'pdf', pages: '3 Pages', evidence: '12 Bounding Boxes', vector: '0.974 Cosine', status: 'Verified' },
                      { name: 'Rohan_Sahu_Resume_Annotated.pdf', type: 'Candidate Resume', ext: 'pdf', pages: '2 Pages', evidence: '9 Bounding Boxes', vector: '0.952 Cosine', status: 'Verified' },
                      { name: 'Aditi_Pradhan_Resume_Annotated.pdf', type: 'Candidate Resume', ext: 'pdf', pages: '3 Pages', evidence: '11 Bounding Boxes', vector: '0.938 Cosine', status: 'Verified' },
                      { name: 'Sumit_Kar_Resume_Annotated.pdf', type: 'Candidate Resume', ext: 'pdf', pages: '2 Pages', evidence: '8 Bounding Boxes', vector: '0.915 Cosine', status: 'Verified' },
                      { name: 'Competency_Ontology_DAG.json', type: 'Symbolic Graph', ext: 'json', pages: '124 Nodes', evidence: 'Transitive Closure A➔B', vector: 'Symbolic Rules', status: 'Deterministic' }
                    ].map((doc, idx) => (
                      <tr key={idx}>
                        <td className="doc-name-cell">
                          <span className={`doc-badge-pill ${doc.ext}`}>{doc.ext.toUpperCase()}</span>
                          <span>{doc.name}</span>
                        </td>
                        <td>{doc.type}</td>
                        <td>{doc.pages}</td>
                        <td>
                          <span style={{ color: '#10b981', fontWeight: 600 }}>{doc.evidence}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.78rem' }}>{doc.vector}</span>
                        </td>
                        <td>
                          <span className="api-status-pill">{doc.status}</span>
                        </td>
                        <td>
                          <button 
                            type="button" 
                            className="btn-card-action"
                            style={{ padding: '0.35rem 0.65rem', fontSize: '0.75rem' }}
                            onClick={() => {
                              setActiveNav('matcher')
                              setActiveInspectorTab('preview')
                            }}
                          >
                            Inspect <Eye size={12} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* PAGE 6: SKILL ANALYTICS & TELEMETRY */}
          {activeNav === 'analytics' && (
            <div className="analytics-page-wrapper">
              <div className="analytics-header-strip">
                <div className="talent-pool-title-group">
                  <div className="talent-pool-badge-chip">
                    <BarChart2 size={14} /> Real-Time Telemetry & Grounded Deductions
                  </div>
                  <SpringHeading tag="h2" align="left">Skill Coverage & System Telemetry</SpringHeading>
                  <p>
                    Benchmarked across 2048-dimensional NVIDIA NIM dense embeddings and symbolic NetworkX transitive closure.
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-banner-demo"
                  onClick={() => setActiveNav('chat')}
                >
                  <MessageSquare size={14} /> Open GraphRAG Explainer
                </button>
              </div>

              {/* 4 Stat Hero Cards */}
              <div className="analytics-hero-grid">
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Symbolic Deduction</span>
                    <Flame size={16} color="var(--brand-primary)" />
                  </div>
                  <div className="analytics-big-stat">
                    100% <span className="sub-tag">Deterministic</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    DAG ontology closure deduces implicit competencies (e.g. Kubernetes ➔ Container Orchestration) with 0.0% hallucination risk.
                  </p>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Parallel Ingestion</span>
                    <Zap size={16} color="#10b981" />
                  </div>
                  <div className="analytics-big-stat">
                    65% <span className="sub-tag">Time Saved</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    Python <code>asyncio.gather</code> and background thread workers parse multi-page candidate PDFs concurrently.
                  </p>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">Dense Vector Space</span>
                    <Cpu size={16} color="#1e70e8" />
                  </div>
                  <div className="analytics-big-stat">
                    2048-D <span className="sub-tag">NVIDIA NIM</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    nvidia/nemotron-3-embed-1b projections cached in-memory. Eliminates cloud latency on repeated concept lookups.
                  </p>
                </div>

                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <span className="analytics-card-title">GraphRAG TTFT</span>
                    <Clock size={16} color="#8b5cf6" />
                  </div>
                  <div className="analytics-big-stat">
                    &lt;200ms <span className="sub-tag">Live Stream</span>
                  </div>
                  <p style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', margin: 0 }}>
                    FastAPI HTTP chunked transfer (StreamingResponse) streams tokens live without raw markdown punctuation clutter.
                  </p>
                </div>
              </div>

              {/* Competency Coverage Matrix */}
              <div className="competency-matrix-card">
                <SpringHeading tag="h3" align="left" style={{ marginBottom: '1.25rem' }}>
                  Candidate Competency Coverage Against Requisition
                </SpringHeading>

                {[
                  { skill: 'Kubernetes & Container Orchestration', pct: 98, verified: '4/4 Candidates Verified', type: 'Symbolic DAG Inferred' },
                  { skill: 'Raft Distributed Consensus & Storage', pct: 92, verified: '3/4 Candidates Verified', type: 'NVIDIA Vector Cosine 0.974' },
                  { skill: 'Terraform & Declarative IaC', pct: 88, verified: '4/4 Candidates Verified', type: 'PyMuPDF Evidence P1:L14' },
                  { skill: 'High-Throughput Golang Systems', pct: 85, verified: '3/4 Candidates Verified', type: 'Extracted Profile Skill' },
                  { skill: 'Linux Kernel Tuning & eBPF Tracing', pct: 81, verified: '2/4 Candidates Verified', type: 'Pydantic Schema Match' },
                  { skill: 'Multi-Region Cloud Networking', pct: 79, verified: '3/4 Candidates Verified', type: 'Direct Semantic Match' }
                ].map((item, idx) => (
                  <div key={idx} className="matrix-row">
                    <div>
                      <div className="matrix-skill-name">{item.skill}</div>
                      <div className="matrix-skill-meta">{item.verified} • {item.type}</div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      <div className="matrix-bar-wrap">
                        <div className="matrix-bar-fill" style={{ width: `${item.pct}%` }}></div>
                      </div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', fontWeight: 700, width: '40px', textAlign: 'right' }}>
                        {item.pct}%
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* PAGE 7: DEDICATED GRAPHRAG CHAT PAGE */}
          {activeNav === 'chat' && (
            <div className="fullscreen-chat-page" style={{ height: 'calc(100vh - 120px)', padding: '0 0.5rem 1rem 0.5rem' }}>
              <GraphRagChat 
                selectedCandidate={selectedCandidate}
                candidates={matchData?.rankings || []}
                onSelectCandidate={setSelectedCandidate}
                isCompact={false}
                user={user}
              />
            </div>
          )}

          {/* PAGE 8: RECRUITER PROFILE & SYSTEM TELEMETRY */}
          {activeNav === 'profile' && (
            <div className="profile-page-wrapper">
              <div className="profile-card">
                <div className="profile-hero-row">
                  <img 
                    src="https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=180&h=180&q=80" 
                    alt="Sarah Jenkins" 
                    className="profile-avatar-large"
                  />
                  <div className="profile-name-stack">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
                      <h2>{user?.name || 'Sarah Jenkins'}</h2>
                      <span className="job-priority-pill">ENTERPRISE ADMIN</span>
                    </div>
                    <p>{user?.email || 'sarah.jenkins@infrastructure-talent.io'} • Principal Systems Recruiter</p>
                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.75rem' }}>
                      <span className="competency-tag">Tenant: sg-prod-8840</span>
                      <span className="competency-tag">Seats: 12 Active Recruiters</span>
                      <span className="competency-tag" style={{ color: '#10b981', borderColor: 'rgba(16, 185, 129, 0.3)' }}>✓ License Active</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem' }}>
                  <SpringHeading tag="h3" align="left" style={{ marginBottom: '0.75rem' }}>
                    Connected Subsystem Pipelines & Hardware Inference
                  </SpringHeading>

                  <div className="profile-api-grid">
                    <div className="api-status-box">
                      <div className="api-box-header">
                        <span className="api-title">Groq LPU Hardware</span>
                        <span className="api-status-pill">Active // 42ms</span>
                      </div>
                      <span className="api-detail-mono">openai/gpt-oss-20b + qwen/qwen3.8-27b</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Automatic failover & exponential backoff active.</span>
                    </div>

                    <div className="api-status-box">
                      <div className="api-box-header">
                        <span className="api-title">NVIDIA NIM Cloud API</span>
                        <span className="api-status-pill">Active // 2048-D</span>
                      </div>
                      <span className="api-detail-mono">nvidia/nemotron-3-embed-1b</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>In-memory dictionary cache eliminating cloud round-trips.</span>
                    </div>

                    <div className="api-status-box">
                      <div className="api-box-header">
                        <span className="api-title">PyMuPDF Highlighting Engine</span>
                        <span className="api-status-pill">Active // 150 DPI</span>
                      </div>
                      <span className="api-detail-mono">Server-side Canvas Stream</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>Zero-CORS in-app rendering with color-coded bounding boxes.</span>
                    </div>

                    <div className="api-status-box">
                      <div className="api-box-header">
                        <span className="api-title">NetworkX Symbolic DAG</span>
                        <span className="api-status-pill">Active // Depth 2</span>
                      </div>
                      <span className="api-detail-mono">Transitive Closure A➔B</span>
                      <span style={{ fontSize: '0.72rem', color: 'var(--text-secondary)' }}>0.0% hallucination rate with deterministic deductions.</span>
                    </div>
                  </div>
                </div>

                <div style={{ marginTop: '1.75rem', paddingTop: '1.5rem', borderTop: '1px solid var(--border-light)' }}>
                  <SpringHeading tag="h4" align="left">Recruiter Preferences & Security</SpringHeading>
                  <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap' }}>
                    <button 
                      type="button" 
                      className="btn-card-action btn-card-primary"
                      onClick={() => alert("Settings saved: Theme and notifications synced.")}
                    >
                      Save Preferences
                    </button>
                    <button 
                      type="button" 
                      className="btn-card-action"
                      onClick={onLogout}
                    >
                      Sign Out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* FULLSCREEN POP-OUT MODAL */}
      {isModalOpen && currentCandidate && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <SpringHeading tag="h3" align="left">Candidate Resume Inspector: {currentCandidate.name}</SpringHeading>
                <span className="modal-score-pill">
                  {Number(currentCandidate.match_score).toFixed(1)}% Match Score
                </span>
              </div>
              <div className="modal-actions">
                <button className="btn-close" onClick={() => setIsModalOpen(false)} title="Close Fullscreen">✕</button>
              </div>
            </div>

            <div className="modal-legend-strip">
              <span className="legend-chip green">
                <span className="dot dot-green"></span> 🟢 Matched Skills (Green)
              </span>
              <span className="legend-chip orange">
                <span className="dot dot-orange"></span> 🟠 Projects & Technologies (Orange)
              </span>
              <span className="legend-chip blue">
                <span className="dot dot-blue"></span> 🔵 Profile Skills (Blue)
              </span>
            </div>

            <div className="modal-body">
              {currentCandidate.annotated_pdf_url ? (
                <PdfViewer
                  url={`${API_URL}${currentCandidate.annotated_pdf_url}`}
                  title={`Fullscreen Resume Inspector: ${currentCandidate.name}`}
                  onClose={() => setIsModalOpen(false)}
                  isFullscreen={true}
                />
              ) : (
                <div style={{ padding: '2rem' }}>
                  <SpringHeading tag="h4" align="left">Interactive Evidence Preview</SpringHeading>
                  <p>{currentCandidate.summary}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
