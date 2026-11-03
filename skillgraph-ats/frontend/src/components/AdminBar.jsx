import React, { useState, useEffect } from 'react'
import { Shield, Activity, Cpu, Database, Server, RefreshCw, CheckCircle, AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react'

export default function AdminBar({ user }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [backendStatus, setBackendStatus] = useState({ online: false, checking: true, data: null })

  const checkHealth = async () => {
    setBackendStatus(prev => ({ ...prev, checking: true }))
    try {
      const res = await fetch("http://127.0.0.1:8000/health")
      if (res.ok) {
        const data = await res.json()
        setBackendStatus({ online: true, checking: false, data })
      } else {
        setBackendStatus({ online: false, checking: false, data: null })
      }
    } catch (e) {
      setBackendStatus({ online: false, checking: false, data: null })
    }
  }

  useEffect(() => {
    checkHealth()
    const interval = setInterval(checkHealth, 4000)
    return () => clearInterval(interval)
  }, [])

  if (user?.role !== 'admin') return null

  return (
    <div className="admin-status-bar">
      <div className="admin-bar-summary">
        <div className="admin-bar-left">
          <span className="admin-badge-icon">
            <Shield size={15} />
          </span>
          <span className="admin-bar-title">Admin Management Mode</span>
          <span className="admin-user-pill">Active: {user.name} ({user.email})</span>
        </div>

        <div className="admin-bar-center">
          <span className={`admin-service-dot ${backendStatus.online ? 'dot-online' : 'dot-offline'}`}></span>
          <span className="admin-service-text">
            Backend API: {backendStatus.online ? 'Online (Port 8000)' : 'Offline / Checking'}
          </span>
        </div>

        <div className="admin-bar-actions">
          <button 
            type="button" 
            onClick={checkHealth} 
            className="btn-admin-pill"
            title="Refresh status"
          >
            <RefreshCw size={13} className={backendStatus.checking ? 'spin' : ''} /> Check
          </button>
          <button 
            type="button" 
            onClick={() => setIsExpanded(!isExpanded)} 
            className="btn-admin-pill"
          >
            {isExpanded ? <>Collapse <ChevronUp size={13} /></> : <>Diagnostics <ChevronDown size={13} /></>}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div className="admin-diagnostics-expanded">
          <div className="diag-grid">
            <div className="diag-card">
              <div className="diag-card-title"><Server size={14} /> FastAPI Server</div>
              <div className="diag-card-val">{backendStatus.online ? '200 OK — Ready' : 'Connection Standby'}</div>
              <div className="diag-card-sub">http://127.0.0.1:8000/docs</div>
            </div>

            <div className="diag-card">
              <div className="diag-card-title"><Cpu size={14} /> NVIDIA NIM Cloud</div>
              <div className="diag-card-val">nemotron-3-embed-1b</div>
              <div className="diag-card-sub">2048-dim Dense Embeddings</div>
            </div>

            <div className="diag-card">
              <div className="diag-card-title"><Activity size={14} /> Groq LPU Engine</div>
              <div className="diag-card-val">qwen/qwen3.8-27b</div>
              <div className="diag-card-sub">GraphRAG & Pydantic Extraction</div>
            </div>

            <div className="diag-card">
              <div className="diag-card-title"><Database size={14} /> Skill Graph Ontology</div>
              <div className="diag-card-val">Active DAG Model</div>
              <div className="diag-card-sub">Parent-Child Domain Inferences</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

