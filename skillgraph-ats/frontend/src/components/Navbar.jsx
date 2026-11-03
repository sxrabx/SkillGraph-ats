import React, { useState, useEffect } from 'react'
import { ExternalLink, Menu, X, ArrowRight } from 'lucide-react'
import Logo from './Logo'
import ThemeToggle from './ThemeToggle'

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
    <header className={`landing-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner">
        {/* Left: Brand Logo */}
        <div className="navbar-brand" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <Logo height={44} />
        </div>

        {/* Center: Nav links */}
        <nav className="navbar-nav-links">
          <button type="button" onClick={() => scrollToSection('product')} className="nav-link">
            Product
          </button>
          <button type="button" onClick={() => scrollToSection('technology')} className="nav-link">
            Technology
          </button>
          <button type="button" onClick={() => scrollToSection('use-cases')} className="nav-link">
            Use Cases
          </button>
          <button type="button" onClick={() => scrollToSection('pricing')} className="nav-link">
            Pricing
          </button>
        </nav>

        {/* Right: Actions */}
        <div className="navbar-actions">
          {/* Sun Moon Theme Toggle replacing secondary Request Demo button as specified */}
          <ThemeToggle variant="sun-moon" size="md" />

          {user ? (
            <div className="nav-user-logged">
              <button 
                type="button" 
                onClick={onGoToDashboard} 
                className="btn-nav-dashboard"
              >
                <span>{user.role === 'admin' ? '🛡️' : '👩‍💼'} Enter Workspace</span>
                <ArrowRight size={15} />
              </button>
              <button type="button" onClick={onLogout} className="nav-link-logout">
                Log Out
              </button>
            </div>
          ) : (
            <>
              <button 
                type="button" 
                onClick={() => scrollToSection('for-recruiters')} 
                className="nav-link-external"
              >
                For Recruiters <ExternalLink size={13} style={{ marginLeft: 3 }} />
              </button>

              <button 
                type="button" 
                onClick={() => onOpenAuth('login')} 
                className="btn-nav-ghost"
              >
                Sign In
              </button>

              <button 
                type="button" 
                onClick={() => onOpenAuth('signup')} 
                className="btn-nav-primary"
              >
                Sign Up
              </button>
            </>
          )}

          {/* Mobile Hamburger Toggle */}
          <button 
            type="button" 
            className="mobile-menu-btn"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="navbar-mobile-drawer">
          <button type="button" onClick={() => scrollToSection('product')} className="mobile-nav-link">
            Product
          </button>
          <button type="button" onClick={() => scrollToSection('technology')} className="mobile-nav-link">
            Technology
          </button>
          <button type="button" onClick={() => scrollToSection('use-cases')} className="mobile-nav-link">
            Use Cases
          </button>
          <button type="button" onClick={() => scrollToSection('pricing')} className="mobile-nav-link">
            Pricing
          </button>
          <div className="mobile-drawer-divider"></div>
          {user ? (
            <>
              <button type="button" onClick={onGoToDashboard} className="btn-nav-primary" style={{ width: '100%', justifyContent: 'center' }}>
                Open ATS Workspace
              </button>
              <button type="button" onClick={onLogout} className="mobile-nav-link">
                Log Out ({user.name})
              </button>
            </>
          ) : (
            <div className="mobile-auth-stack">
              <button type="button" onClick={() => { setMobileMenuOpen(false); onOpenAuth('login'); }} className="btn-nav-ghost" style={{ width: '100%' }}>
                Sign In
              </button>
              <button type="button" onClick={() => { setMobileMenuOpen(false); onOpenAuth('signup'); }} className="btn-nav-primary" style={{ width: '100%' }}>
                Sign Up
              </button>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
