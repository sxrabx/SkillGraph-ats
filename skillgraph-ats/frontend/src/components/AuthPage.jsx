import React, { useState } from 'react'
import { ArrowLeft, Lock, Mail, User, Shield, Briefcase, ArrowRight, Sparkles, KeyRound, CheckCircle2 } from 'lucide-react'
import Logo from './Logo'

export default function AuthPage({ initialMode = 'login', onLoginSuccess, onGoToLanding }) {
  const [mode, setMode] = useState(initialMode) // 'login' | 'signup'
  const [role, setRole] = useState('user') // 'user' | 'admin'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')
  const [company, setCompany] = useState('')
  const [adminKey, setAdminKey] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

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
    }, 350)
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    setError('')

    if (!email || !password) {
      setError('Please fill in all required fields.')
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
        name: name || (role === 'admin' ? 'System Administrator' : email.split('@')[0]),
        email: email,
        role: role,
        title: role === 'admin' ? 'System Administrator' : 'Technical Recruiter',
        company: company || (role === 'admin' ? 'SkillGraph Ops' : 'Global Talent Org'),
        avatar: role === 'admin' ? '🛡️' : '👤'
      }

      localStorage.setItem('skillgraph_user', JSON.stringify(userData))
      onLoginSuccess(userData)
    }, 450)
  }

  return (
    <div className="auth-fullscreen-page">
      {/* Background ambient lighting */}
      <div className="auth-fullscreen-glow"></div>

      {/* Top Navigation */}
      <header className="auth-fullscreen-header">
        <div className="auth-fullscreen-nav-inner">
          <div onClick={onGoToLanding} className="auth-nav-logo-wrap" title="Return to Homepage">
            <Logo height={48} />
          </div>
          <button type="button" onClick={onGoToLanding} className="btn-auth-back">
            <ArrowLeft size={16} /> Back to Homepage
          </button>
        </div>
      </header>

      {/* Main Full-Screen Center Card */}
      <main className="auth-fullscreen-main">
        <div className="auth-fullscreen-card">
          {/* Card Brand Header */}
          <div className="auth-card-top">
            <div className="auth-brand-badge">
              <Sparkles size={14} /> Neuro-Symbolic Recruiting Engine
            </div>
            <h1 className="auth-card-title">
              {mode === 'login' 
                ? (role === 'admin' ? 'Admin Security Console' : 'Recruiter Sign In') 
                : 'Create Recruiter Account'}
            </h1>
            <p className="auth-card-subtitle">
              {mode === 'login' 
                ? 'Sign in to access real-time GraphRAG candidate evaluation and highlighted resume inspections.' 
                : 'Join the next generation of explainable, neuro-symbolic hiring intelligence.'}
            </p>
          </div>

          {/* Mode Switcher: Sign In vs Sign Up */}
          <div className="auth-mode-toggle">
            <button 
              type="button" 
              className={`auth-mode-btn ${mode === 'login' ? 'active' : ''}`}
              onClick={() => { setMode('login'); setError('') }}
            >
              Sign In
            </button>
            <button 
              type="button" 
              className={`auth-mode-btn ${mode === 'signup' ? 'active' : ''}`}
              onClick={() => { setMode('signup'); setError('') }}
            >
              Sign Up
            </button>
          </div>

          {/* If Sign In, Role Toggle: Recruiter vs Admin */}
          {mode === 'login' && (
            <div className="auth-role-toggle">
              <button
                type="button"
                className={`auth-role-btn ${role === 'user' ? 'active' : ''}`}
                onClick={() => { setRole('user'); setError('') }}
              >
                <User size={15} /> Recruiter Access
              </button>
              <button
                type="button"
                className={`auth-role-btn ${role === 'admin' ? 'active' : ''}`}
                onClick={() => { setRole('admin'); setError('') }}
              >
                <Shield size={15} /> Admin Console
              </button>
            </div>
          )}

          {/* 1-Click Fast Evaluation Buttons */}
          <div className="auth-quick-demo-box">
            <span className="auth-quick-demo-title">
              <Sparkles size={13} /> 1-Click Fast Evaluation
            </span>
            <div className="auth-quick-demo-actions">
              <button 
                type="button"
                className="auth-demo-btn user-demo-btn"
                onClick={() => handleQuickLogin('user')}
                disabled={loading}
              >
                👩‍💼 Test as Recruiter (Sarah)
              </button>
              <button 
                type="button"
                className="auth-demo-btn admin-demo-btn"
                onClick={() => handleQuickLogin('admin')}
                disabled={loading}
              >
                🛡️ Test as Admin (Marcus)
              </button>
            </div>
          </div>

          {error && <div className="auth-error-alert">{error}</div>}

          {/* Form */}
          <form onSubmit={handleSubmit} className="auth-fullscreen-form">
            {mode === 'signup' && (
              <>
                <div className="auth-form-field">
                  <label><User size={14} /> Full Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Sarah Jenkins"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                  />
                </div>

                <div className="auth-form-field">
                  <label><Briefcase size={14} /> Company Name</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Stripe, Acme Corp"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                  />
                </div>
              </>
            )}

            <div className="auth-form-field">
              <label><Mail size={14} /> {role === 'admin' && mode === 'login' ? 'Admin Email' : 'Work Email'}</label>
              <input 
                type="email" 
                required 
                placeholder={role === 'admin' && mode === 'login' ? 'admin@skillgraph.ai' : 'recruiter@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="auth-form-field">
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
              <div className="auth-form-field">
                <label><KeyRound size={14} /> Admin Security Passkey (Optional for Demo)</label>
                <input 
                  type="password" 
                  placeholder="Enter 'admin123' or leave blank"
                  value={adminKey}
                  onChange={(e) => setAdminKey(e.target.value)}
                />
              </div>
            )}

            <button type="submit" disabled={loading} className="btn-auth-fullscreen-submit">
              {loading ? (
                'Verifying Credentials...'
              ) : mode === 'login' ? (
                <>Sign In to ATS Workspace <ArrowRight size={17} /></>
              ) : (
                <>Create Recruiter Account <ArrowRight size={17} /></>
              )}
            </button>
          </form>

          {/* Footer prompt */}
          <div className="auth-card-footer">
            {mode === 'login' ? (
              <span>
                Don&apos;t have an account yet?{' '}
                <button type="button" onClick={() => { setMode('signup'); setError('') }} className="auth-switch-link">
                  Sign Up
                </button>
              </span>
            ) : (
              <span>
                Already have an account?{' '}
                <button type="button" onClick={() => { setMode('login'); setError('') }} className="auth-switch-link">
                  Sign In
                </button>
              </span>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

