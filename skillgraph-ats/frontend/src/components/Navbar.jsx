import React, { useState, useEffect } from 'react'
import { Menu, X, ArrowRight } from 'lucide-react'
import ThemeToggle from './ThemeToggle'

// 4-Point Concave Star Icon matching the user's reference image
function AlvorStarIcon({ size = 20, className = '' }) {
  return (
    <svg 
      width={size} 
      height={size} 
      viewBox="0 0 24 24" 
      fill="none" 
      stroke="currentColor" 
      strokeWidth="1.8" 
      strokeLinecap="round" 
      className={className}
      aria-hidden="true"
    >
      <path d="M10 3.5C10 7.8 7.8 10 3.5 10" />
      <path d="M14 3.5C14 7.8 16.2 10 20.5 10" />
      <path d="M10 20.5C10 16.2 7.8 14 3.5 14" />
      <path d="M14 20.5C14 16.2 16.2 14 20.5 14" />
    </svg>
  )
}

export default function Navbar({ onOpenDemo, onOpenAuth, user, onGoToDashboard, onLogout }) {
  const [scrolled, setScrolled] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const scrollToSection = (id) => {
    setMobileMenuOpen(false)
    const el = document.getElementById(id)
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <header className={`landing-navbar-floating-wrapper ${scrolled ? 'is-scrolled' : ''}`}>
      <div className="landing-navbar landing-navbar-alvor">
        {/* LEFT CLUSTER: Star Icon + Brand Name + Nav Links directly next to it */}
        <div className="nav-alvor-left-cluster">
          <div 
            className="nav-alvor-brand" 
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            role="button"
            tabIndex={0}
            title="SkillGraph ATS"
          >
            <AlvorStarIcon size={20} className="nav-alvor-star-icon" />
            <span className="nav-alvor-brand-text">SKILLGRAPH</span>
          </div>

          <nav className="nav-alvor-links" aria-label="Main Navigation">
            <button type="button" onClick={() => scrollToSection('product')} className="nav-alvor-link">
              Product
            </button>
            <button type="button" onClick={() => scrollToSection('technology')} className="nav-alvor-link">
              Technology
            </button>
            <button type="button" onClick={() => scrollToSection('demo-comparison')} className="nav-alvor-link">
              Comparison
            </button>
            <button type="button" onClick={() => scrollToSection('pricing')} className="nav-alvor-link">
              Pricing
            </button>
          </nav>
        </div>

        {/* RIGHT CLUSTER: 01 / THE GRAPH + ThemeToggle + Pill Button */}
        <div className="nav-alvor-right-cluster">
          <span className="nav-alvor-tag">01 / THE GRAPH</span>

          <ThemeToggle variant="sun-moon" size="sm" />

          {user ? (
            <div className="nav-user-logged">
              <button 
                type="button" 
                onClick={onGoToDashboard} 
                className="nav-alvor-pill-btn"
              >
                <span>Enter Workspace</span>
                <ArrowRight size={13} />
                <span className="alvor-btn-glow"></span>
              </button>
              <button type="button" onClick={onLogout} className="nav-link-logout">
                Log Out
              </button>
            </div>
          ) : (
            <div className="nav-alvor-actions">
              <button 
                type="button" 
                onClick={() => onOpenAuth('login')} 
                className="nav-alvor-ghost-link"
              >
                Sign In
              </button>
              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="nav-alvor-pill-btn"
              >
                <span>Request Demo</span>
                <span className="alvor-btn-glow"></span>
              </button>
            </div>
          )}

          {/* Mobile Menu Toggle */}
          <button 
            type="button" 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(prev => !prev)}
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <button type="button" onClick={() => scrollToSection('product')} className="mobile-nav-link">
            Product Architecture
          </button>
          <button type="button" onClick={() => scrollToSection('technology')} className="mobile-nav-link">
            Technology Matrix
          </button>
          <button type="button" onClick={() => scrollToSection('demo-comparison')} className="mobile-nav-link">
            Comparison
          </button>
          <button type="button" onClick={() => scrollToSection('pricing')} className="mobile-nav-link">
            Pricing Plans
          </button>

          <div className="mobile-drawer-divider"></div>

          <div className="mobile-auth-stack">
            {user ? (
              <button 
                type="button" 
                onClick={() => { setMobileMenuOpen(false); onGoToDashboard(); }} 
                className="nav-alvor-pill-btn"
                style={{ width: '100%' }}
              >
                <span>Enter Workspace</span>
              </button>
            ) : (
              <>
                <button 
                  type="button" 
                  onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }} 
                  className="nav-alvor-ghost-link"
                  style={{ textAlign: 'center' }}
                >
                  Sign In
                </button>
                <button 
                  type="button" 
                  onClick={() => { setMobileMenuOpen(false); onOpenDemo(); }} 
                  className="nav-alvor-pill-btn"
                  style={{ width: '100%' }}
                >
                  <span>Request Demo</span>
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
