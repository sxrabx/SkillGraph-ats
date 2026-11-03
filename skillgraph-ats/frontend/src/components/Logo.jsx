import React from 'react'
import { useTheme } from '../context/ThemeContext'

export default function Logo({ className = '', height = 44, forceTheme = null }) {
  const { theme } = useTheme()
  const activeTheme = forceTheme || theme || 'light'

  const logoSrc = activeTheme === 'dark' 
    ? '/skillgraph-logo-white.png' 
    : '/skillgraph-logo.png'

  return (
    <div 
      className={`skillgraph-logo-container ${className}`} 
      style={{ display: 'inline-flex', alignItems: 'center', cursor: 'pointer', textDecoration: 'none' }}
    >
      <img 
        src={logoSrc} 
        alt="SkillGraph Logo" 
        style={{ height: `${height}px`, width: 'auto', objectFit: 'contain' }}
        onError={(e) => {
          // Fallback if image fails
          e.target.style.display = 'none'
          if (e.target.nextSibling) {
            e.target.nextSibling.style.display = 'inline-flex'
          }
        }}
      />
      {/* SVG Fallback */}
      <span 
        className="logo-svg-fallback" 
        style={{ 
          display: 'none', 
          alignItems: 'center', 
          gap: '0.2rem', 
          fontWeight: 800, 
          fontSize: `${height * 0.55}px`, 
          color: activeTheme === 'dark' ? '#ffffff' : '#0f172a' 
        }}
      >
        <span>Skill</span>
        <span style={{ 
          background: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          position: 'relative'
        }}>
          Graph
        </span>
      </span>
    </div>
  )
}
