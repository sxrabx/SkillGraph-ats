import { useState } from 'react'
import './App.css'
import PdfViewer from './components/PdfViewer'

const API_URL = "http://127.0.0.1:8000"

function App() {
  const [jdFile, setJdFile] = useState(null)
  const [resumeFiles, setResumeFiles] = useState([])
  const [matchData, setMatchData] = useState(null)
  const [isLoading, setIsLoading] = useState(false)

  // View & Inspector State
  const [activeTab, setActiveTab] = useState("preview") // 'preview' | 'chat'
  const [isModalOpen, setIsModalOpen] = useState(false)

  // GraphRAG Chat State
  const [selectedCandidate, setSelectedCandidate] = useState("")
  const [chatMessages, setChatMessages] = useState([])
  const [chatInput, setChatInput] = useState("")
  const [isChatting, setIsChatting] = useState(false)

  const handleMatch = async (e) => {
    e.preventDefault()
    if (!jdFile || resumeFiles.length === 0) return alert("Please select a Job Description and at least one Resume")
    
    setIsLoading(true)
    const formData = new FormData()
    formData.append("jd_file", jdFile)
    Array.from(resumeFiles).forEach(file => formData.append("resume_files", file))

    try {
      const res = await fetch(`${API_URL}/api/match`, {
        method: "POST",
        body: formData
      })
      const data = await res.json()
      setMatchData(data)
      setChatMessages([])
      if (data.rankings && data.rankings.length > 0) {
        setSelectedCandidate(data.rankings[0].name)
      }
      setActiveTab("preview")
    } catch (err) {
      console.error(err)
      alert("Failed to connect to backend server. Please verify port 8000 is online.")
    }
    setIsLoading(false)
  }

  const handleChat = async (e) => {
    e.preventDefault()
    if (!chatInput.trim() || !selectedCandidate) return

    const userMsg = { role: "user", content: chatInput }
    setChatMessages(prev => [...prev, userMsg])
    setChatInput("")
    setIsChatting(true)

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
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error connecting to GraphRAG engine." }])
    }
    setIsChatting(false)
  }

  const currentCandidate = matchData?.rankings?.find(c => c.name === selectedCandidate) || matchData?.rankings?.[0]

  return (
    <div className="container">
      {/* 1. TOP BRAND HEADER */}
      <header className="app-header">
        <div className="header-brand">
          <div className="brand-logo-wrap">
            <span className="brand-logo-icon">⚡</span>
          </div>
          <div>
            <div className="brand-title-wrap">
              <h1>SkillGraph ATS</h1>
              <span className="brand-version-pill">GraphRAG v2.0</span>
            </div>
            <p className="brand-subtitle">AI Resume Intelligence, Directed Graph Ontology & Latent Skill Matching</p>
          </div>
        </div>

        {matchData && (
          <div className="header-status-strip">
            <div className="status-pill role-pill">
              <span className="status-label">Target Role</span>
              <strong className="status-val">{matchData.jd_title}</strong>
            </div>
            <div className="status-pill count-pill">
              <span className="status-label">Pipeline Ingestion</span>
              <strong className="status-val">{matchData.total_resumes_processed} Candidates Scored</strong>
            </div>
          </div>
        )}
      </header>

      {/* 2. MAIN TWO-COLUMN WORKSPACE */}
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
                          setActiveTab('preview')
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
                          setActiveTab('chat')
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
              className={`tab-btn ${activeTab === 'preview' ? 'active' : ''}`}
              onClick={() => setActiveTab('preview')}
            >
              <span>📄</span> Highlighted Resume Inspector
            </button>
            <button 
              className={`tab-btn ${activeTab === 'chat' ? 'active' : ''}`}
              onClick={() => setActiveTab('chat')}
            >
              <span>💬</span> GraphRAG AI Assistant
            </button>
          </div>

          {!matchData ? (
            <div className="placeholder-box">
              <span className="placeholder-icon">📋</span>
              <h3>No Candidate Loaded Yet</h3>
              <p>Upload a Job Description and candidate resumes on the left, then click <strong>"Calculate Match Scores"</strong> to unlock real-time highlighted resume inspection and explainable GraphRAG evaluation.</p>
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
                      setChatMessages([])
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
              {activeTab === 'preview' && (
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
                    <div className="placeholder-box">
                      <p>Annotated PDF not available for this candidate.</p>
                    </div>
                  )}

                  {/* Projects Extracted Drawer */}
                  {currentCandidate?.projects && currentCandidate.projects.length > 0 && (
                    <div className="projects-section">
                      <h4 className="projects-heading">
                        🚀 Extracted Candidate Projects ({currentCandidate.projects.length})
                      </h4>
                      <div className="project-grid">
                        {currentCandidate.projects.map((p, idx) => (
                          <div key={idx} className="project-badge-card">
                            <span className="project-title">{p.title || `Project #${idx + 1}`}</span>
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

              {/* TAB 2: GRAPHRAG CHAT */}
              {activeTab === 'chat' && (
                <div className="chat-interface">
                  <div className="chat-window">
                    <div className="message assistant">
                      <strong>SkillGraph AI Assistant: </strong>
                      Hello! I have loaded the Knowledge Graph profile for <strong>{selectedCandidate}</strong> against the <strong>{matchData.jd_title}</strong> role. Ask me anything about their qualifications, project depth, missing skills, or match rationale!
                    </div>

                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`message ${msg.role}`}>
                        <strong>{msg.role === "user" ? "You" : "SkillGraph AI"}: </strong>
                        {msg.content}
                      </div>
                    ))}
                    {isChatting && (
                      <div className="message assistant">
                        <em>Analyzing Skill Graph Ontology & Candidate Nodes...</em>
                      </div>
                    )}
                  </div>

                  <form onSubmit={handleChat} className="chat-input">
                    <input 
                      type="text" 
                      placeholder={`Ask why ${selectedCandidate} scored this way, or ask for skill gaps...`} 
                      value={chatInput}
                      onChange={e => setChatInput(e.target.value)}
                    />
                    <button type="submit" disabled={isChatting} className="btn-send">
                      Send Query
                    </button>
                  </form>
                </div>
              )}
            </div>
          )}
        </div>
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
              <PdfViewer
                url={`${API_URL}${currentCandidate.annotated_pdf_url}`}
                title={`Fullscreen Resume Inspector: ${currentCandidate.name}`}
                onClose={() => setIsModalOpen(false)}
                isFullscreen={true}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default App
