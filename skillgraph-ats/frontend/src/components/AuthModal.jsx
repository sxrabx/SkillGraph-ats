import React, { useState } from 'react'
import { X, Lock, Mail, User, Shield, Briefcase, ArrowRight, CheckCircle2, Sparkles, KeyRound } from 'lucide-react'
import Logo from './Logo'

export default function AuthModal({ isOpen, onClose, initialMode = 'login', onLoginSuccess }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [role, setRole] = useState('user') // 'user' | 'admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleQuickLogin = (demoRole) => {
    setLoading(true)
    setError('')
    setTimeout(() => {
      const userData = demoRole === 'admin' 
        ? {
            id: 'adm-01',
            name: 'Marcus Vance',
            email: 'admin@skillgraph.ai',
            role: 'admin',
            title: 'System Administrator',
            company: 'SkillGraph Core Team',
            avatar: '🛡️'
          }
        : {
            id: 'rec-01',
            name: 'Sarah Jenkins',
            email: 'sarah.jenkins@talentflow.io',
            role: 'user',
            title: 'Lead Technical Recruiter',
            company: 'TalentFlow Tech Partners',
            avatar: '👩‍💼'
          }
      
      localStorage.setItem('skillgraph_user', JSON.stringify(userData))
      setLoading(false)
      onLoginSuccess(userData)
    }, 400)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all required credentials.')
      return
    }

    if (mode === 'login' && role === 'admin' && adminKey && adminKey !== 'admin123' && adminKey !== 'root') {
      setError('Invalid Admin Security Key. (Hint: use demo button or enter "admin123")')
      return
    }

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      const userData = {
        id: `usr-${Date.now()}`,
        name: name || (role === 'admin' ? 'Administrator' : email.split('@')[0]),
        email: email,
        role: role,
        title: role === 'admin' ? 'System Administrator' : 'Technical Recruiter',
        company: company || (role === 'admin' ? 'SkillGraph Ops' : 'Global Talent Org'),
        avatar: role === 'admin' ? '🛡️' : '👤'
      }

      localStorage.setItem('skillgraph_user', JSON.stringify(userData))
      onLoginSuccess(userData)
    }, 500)
  }

  return (
    <div className="landing-modal-overlay" onClick={onClose}>
      <div className="auth-modal-card" onClick={(e) => e.stopPropagation()}>
        {onClose && (
          <button className="landing-modal-close" onClick={onClose} title="Close window">
            <X size={18} />
          </button>
        )}

        {/* Brand Header */}
        <div className="auth-header">
          <Logo height={32} />
          <h2 className="auth-title">
            {mode === 'login' ? 'Sign in to SkillGraph' : 'Create Recruiter Account'}
          </h2>
          <p className="auth-subtitle">
            {mode === 'login' 
              ? 'Access real-time GraphRAG candidate evaluation and highlighted resume inspections.' 
              : 'Join the next generation of explainable, neuro-symbolic hiring intelligence.'}
          </p>
        </div>

        {/* Mode Selector (Sign In vs Sign Up) */}
        <div className="auth-tabs">
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'login' ? 'active' : ''}`}
            onClick={() => { setMode('login'); setError('') }}
          >
            Sign In
          </button>
          <button 
            type="button" 
            className={`auth-tab-btn ${mode === 'signup' ? 'active' : ''}`}
            onClick={() => { setMode('signup'); setError('') }}
          >
            Sign Up
          </button>
        </div>

        {/* If Sign In, Role Toggle: Recruiter vs Admin */}
        {mode === 'login' && (
          <div className="role-selector-pill-group">
            <button
              type="button"
              className={`role-pill-btn ${role === 'user' ? 'active' : ''}`}
              onClick={() => { setRole('user'); setError('') }}
            >
              <User size={15} /> Recruiter Access
            </button>
            <button
              type="button"
              className={`role-pill-btn ${role === 'admin' ? 'active' : ''}`}
              onClick={() => { setRole('admin'); setError('') }}
            >
              <Shield size={15} /> Admin Console
            </button>
          </div>
        )}

        {/* 1-Click Demo Buttons for Fast Evaluation */}
        <div className="quick-demo-banner">
          <span className="quick-demo-label">
            <Sparkles size={13} /> 1-Click Fast Evaluation:
          </span>
          <div className="quick-demo-btn-group">
            <button 
              type="button"
              className="quick-demo-chip user-chip"
              onClick={() => handleQuickLogin('user')}
              disabled={loading}
              title="Instant login as Recruiter Sarah Jenkins"
            >
              👩‍💼 Test as Recruiter
            </button>
            <button 
              type="button"
              className="quick-demo-chip admin-chip"
              onClick={() => handleQuickLogin('admin')}
              disabled={loading}
              title="Instant login as System Admin"
            >
              🛡️ Test as Admin
            </button>
          </div>
        </div>

        {error && <div className="auth-error-banner">{error}</div>}

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <>
              <div className="form-group">
                <label><User size={14} /> Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Sarah Jenkins"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label><Briefcase size={14} /> Company Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Acme Tech Corp"
                  value={company}
                  onChange={(e) => setCompany(e.target.value)}
                />
              </div>
            </>
          )}

          <div className="form-group">
            <label><Mail size={14} /> {role === 'admin' ? 'Admin Email' : 'Work Email'}</label>
            <input 
              type="email" 
              required 
              placeholder={role === 'admin' ? 'admin@skillgraph.ai' : 'recruiter@company.com'}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label><Lock size={14} /> Password</label>
            <input 
              type="password" 
              required 
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {mode === 'login' && role === 'admin' && (
            <div className="form-group">
              <label><KeyRound size={14} /> Admin Security Passkey (Optional for Demo)</label>
              <input 
                type="password" 
                placeholder="Enter 'admin123' or leave blank"
                value={adminKey}
                onChange={(e) => setAdminKey(e.target.value)}
              />
            </div>
          )}

          <button type="submit" disabled={loading} className="btn-auth-primary">
            {loading ? (
              'Authenticating...'
            ) : mode === 'login' ? (
              <>Sign In to Workspace <ArrowRight size={16} /></>
            ) : (
              <>Create Account & Enter <ArrowRight size={16} /></>
            )}
          </button>
        </form>

        <div className="auth-footer-prompt">
          {mode === 'login' ? (
            <span>
              Don&apos;t have an account yet?{' '}
              <button type="button" onClick={() => { setMode('signup'); setError('') }} className="text-link">
                Sign Up
              </button>
            </span>
          ) : (
            <span>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setError('') }} className="text-link">
                Sign In
              </button>
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

