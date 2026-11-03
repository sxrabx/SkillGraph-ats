import { useState } from 'react'
import './App.css'
import './landing.css'

import { ThemeProvider, useTheme } from './context/ThemeContext'
import ShaderRevealStripesTransition from './components/ShaderRevealStripesTransition'
import FullScreenLoader from './components/FullScreenLoader'
import Navbar from './components/Navbar'
import LandingPage from './components/LandingPage'
import Footer from './components/Footer'
import CookieBanner from './components/CookieBanner'
import AuthPage from './components/AuthPage'
import RequestDemoModal from './components/RequestDemoModal'
import Dashboard from './components/Dashboard'

function AppContent() {
  const { theme } = useTheme()

  // Full-screen initial loader
  const [showLoader, setShowLoader] = useState(true)

  // Authentication State
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('skillgraph_user')
      return stored ? JSON.parse(stored) : null
    } catch {
      return null
    }
  })

  // View state: 'landing' | 'auth' | 'dashboard'
  const [view, setView] = useState(() => {
    try {
      const stored = localStorage.getItem('skillgraph_user')
      return stored ? 'dashboard' : 'landing'
    } catch {
      return 'landing'
    }
  })

  const [authMode, setAuthMode] = useState('login') // 'login' | 'signup'
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false)

  const handleOpenAuth = (mode = 'login') => {
    setAuthMode(mode)
    setView('auth')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleOpenDemo = () => {
    setIsDemoModalOpen(true)
  }

  const handleLoginSuccess = (userData) => {
    setUser(userData)
    setView('dashboard')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleLogout = () => {
    localStorage.removeItem('skillgraph_user')
    setUser(null)
    setView('landing')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  const handleGoToDashboard = () => {
    if (user) {
      setView('dashboard')
      window.scrollTo({ top: 0, behavior: 'instant' })
    } else {
      handleOpenAuth('login')
    }
  }

  const handleGoToLanding = () => {
    setView('landing')
    window.scrollTo({ top: 0, behavior: 'instant' })
  }

  return (
    <ShaderRevealStripesTransition transitionKey={theme} duration={650}>
      <div className={`app-root-container ${theme}-theme`} data-theme={theme}>
        {/* 0. FULLSCREEN LOADER WITH LOGO, 9PX STROKE & FLY-UPWARDS EXIT */}
        {showLoader && (
          <FullScreenLoader onFinish={() => setShowLoader(false)} />
        )}

        {/* 1. LANDING PAGE VIEW */}
        {view === 'landing' && (
          <>
            <Navbar 
              user={user}
              onOpenDemo={handleOpenDemo}
              onOpenAuth={handleOpenAuth}
              onGoToDashboard={handleGoToDashboard}
              onLogout={handleLogout}
            />

            <main>
              <LandingPage 
                user={user}
                onOpenDemo={handleOpenDemo}
                onOpenAuth={handleOpenAuth}
                onEnterWorkspace={handleGoToDashboard}
              />
            </main>

            <Footer 
              onOpenDemo={handleOpenDemo}
              onOpenAuth={handleOpenAuth}
            />

            <CookieBanner />
          </>
        )}

        {/* 2. FULLSCREEN AUTHENTICATION PAGE (Sign In / Sign Up) */}
        {view === 'auth' && (
          <AuthPage 
            initialMode={authMode}
            onLoginSuccess={handleLoginSuccess}
            onGoToLanding={handleGoToLanding}
          />
        )}

        {/* 3. RECRUITER WORKSPACE DASHBOARD (Locked behind login) */}
        {view === 'dashboard' && (
          user ? (
            <Dashboard 
              user={user}
              onLogout={handleLogout}
              onGoToLanding={handleGoToLanding}
            />
          ) : (
            /* Enforce login wall if not logged in */
            <AuthPage 
              initialMode="login"
              onLoginSuccess={handleLoginSuccess}
              onGoToLanding={handleGoToLanding}
            />
          )
        )}

        {/* Global Interactive Request Demo Modal */}
        <RequestDemoModal 
          isOpen={isDemoModalOpen}
          onClose={() => setIsDemoModalOpen(false)}
        />
      </div>
    </ShaderRevealStripesTransition>
  )
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  )
}
