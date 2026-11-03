import React, { useState } from 'react'
import PdfViewer from './PdfViewer'
import Logo from './Logo'
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
  Code
} from 'lucide-react'

const API_URL = "http://127.0.0.1:8000"

export default function Dashboard({ user, onLogout, onGoToLanding }) {
  // Navigation tabs: 'overview' (the new UI) | 'matcher' (the original ATS core) | 'candidates' | 'chat'
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
      {/* 1. SLIM VERTICAL SIDEBAR (Matches uploaded design) */}
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
          {/* Overview Dashboard (The uploaded design) */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveNav('overview')}
            title="Recruiter Overview Dashboard"
          >
            <Home size={19} />
          </button>

          {/* Active Jobs */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'jobs' ? 'active' : ''}`}
            onClick={() => setActiveNav('overview')}
            title="Active Requisitions (12)"
          >
            <Briefcase size={19} />
          </button>

          {/* Talent Pool */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'candidates' ? 'active' : ''}`}
            onClick={() => setActiveNav('candidates')}
            title="Talent Pool (1,248 Candidates)"
          >
            <Users size={19} />
          </button>

          {/* ATS Real Match Engine (Original project core) */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'matcher' ? 'active' : ''}`}
            onClick={() => setActiveNav('matcher')}
            title="ATS Knowledge Graph Matcher (Ingestion & Highlight Engine)"
          >
            <Network size={19} />
          </button>

          {/* Documents / Resumes */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'matcher' ? 'active' : ''}`}
            onClick={() => setActiveNav('matcher')}
            title="Resume Documents & Ingestion"
          >
            <FileText size={19} />
          </button>

          {/* Analytics / Skill Coverage */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'overview' ? 'active' : ''}`}
            onClick={() => setActiveNav('overview')}
            title="Skill Analytics"
          >
            <BarChart2 size={19} />
          </button>
        </nav>

        {/* Bottom Actions */}
        <div className="sidebar-bottom-stack">
          {/* GraphRAG Recruiter Chat */}
          <button 
            type="button" 
            className={`sidebar-nav-btn ${activeNav === 'chat' ? 'active' : ''}`}
            onClick={() => setActiveNav('chat')}
            title="GraphRAG AI Assistant"
          >
            <MessageSquare size={19} />
          </button>

          {/* Settings / Return */}
          <button 
            type="button" 
            className="sidebar-nav-btn"
            onClick={onGoToLanding}
            title="Return to Website"
          >
            <ArrowLeft size={19} />
          </button>

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

        {/* Top Navbar Header (Matches uploaded design) */}
        <header className="dashboard-top-navbar">
          <div className="top-nav-left">
            <h1 className="dashboard-page-title">
              {activeNav === 'overview' && 'Recruiter dashboard'}
              {activeNav === 'matcher' && 'ATS Knowledge Graph Matcher'}
              {activeNav === 'candidates' && 'Talent Pool & Candidates'}
              {activeNav === 'chat' && 'GraphRAG AI Assistant'}
            </h1>
          </div>

          {/* Center Search Bar */}
          <div className="dashboard-search-wrap">
            <Search size={16} className="search-icon" />
            <input 
              type="text" 
              placeholder="Search candidates, jobs, skills..." 
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

            {/* Notification Bell */}
            <button type="button" className="btn-icon-circle" title="Notifications">
              <Bell size={17} />
              <span className="notification-dot"></span>
            </button>

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

            {/* User Profile Avatar with dropdown */}
            <div className="user-profile-badge" onClick={() => alert(`Logged in as: ${user?.name || 'Sarah Jenkins'} (${user?.role || 'Recruiter'})`)}>
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
          {/* PAGE A: RECRUITER OVERVIEW (The new uploaded dashboard UI) */}
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

          {/* PAGE B: ATS MATCH ENGINE (The real project preserved & polished) */}
          {activeNav === 'matcher' && (
            <div className="matcher-workspace-view">
              <div className="matcher-banner-strip">
                <div className="matcher-banner-text">
                  <h3>⚡ Real Project Matcher & Visual Annotation Canvas</h3>
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
                    <h2 className="panel-title">
                      <span>📥</span> 1. Ingestion Pipeline
                    </h2>
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
                                <h4>{cand.name}</h4>
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
                      <h3>No Candidate Loaded Yet</h3>
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
                            <span className="legend-chip purple">
                              <span className="dot dot-purple"></span> 🟣 Projects & Tech ({currentCandidate?.projects?.length || 0})
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
                                  <h3>{currentCandidate?.name}</h3>
                                  <span className="demo-resume-role">{currentCandidate?.role || 'Senior Cloud Engineer'}</span>
                                </div>
                                <span className="demo-badge-highlight">
                                  ✓ PyMuPDF Visual Evidence Ready
                                </span>
                              </div>

                              <div className="demo-resume-section">
                                <h4>Executive Summary (Ontology Grounded)</h4>
                                <p>{currentCandidate?.summary || 'Demonstrates deep systems architecture expertise across multiple cloud platforms.'}</p>
                              </div>

                              <div className="demo-resume-section">
                                <h4>Verified Competencies & Evidence Highlights</h4>
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
                                  <h4>Documented Engineering Projects</h4>
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

          {/* PAGE C: TALENT POOL DIRECTORY (POWERED BY ANIMATED FOLDER REVEAL) */}
          {activeNav === 'candidates' && (
            <div className="talent-pool-page">
              {/* Header and Filter Controls */}
              <div className="talent-pool-header-strip">
                <div className="talent-pool-title-group">
                  <div className="talent-pool-badge-chip">
                    <Users size={14} /> 1,248 Candidates in Directory
                  </div>
                  <h2>Talent Pool Directory</h2>
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
                            <h3 className="talent-candidate-name">{cand.name}</h3>
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

          {/* PAGE D: DEDICATED GRAPHRAG CHAT PAGE (POWERED BY SMOOTHUI SUITE) */}
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
        </main>
      </div>

      {/* FULLSCREEN POP-OUT MODAL */}
      {isModalOpen && currentCandidate && (
        <div className="modal-overlay" onClick={() => setIsModalOpen(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-title-wrap">
                <h3>Candidate Resume Inspector: {currentCandidate.name}</h3>
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
              <span className="legend-chip purple">
                <span className="dot dot-purple"></span> 🟣 Projects & Technologies (Purple)
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
                  <h4>Interactive Evidence Preview</h4>
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
