import React, { useState, useEffect } from 'react'

export default function CookieBanner() {
  const [isVisible, setIsVisible] = useState(false)

  useEffect(() => {
    const consent = localStorage.getItem('skillgraph_cookie_consent')
    if (!consent) {
      // Exactly 5 seconds delay as requested by user
      const timer = setTimeout(() => {
        setIsVisible(true)
      }, 5000)
      return () => clearTimeout(timer)
    }
  }, [])

  const handleAccept = () => {
    localStorage.setItem('skillgraph_cookie_consent', 'accepted')
    setIsVisible(false)
  }

  const handleDecline = () => {
    localStorage.setItem('skillgraph_cookie_consent', 'declined')
    setIsVisible(false)
  }

  if (!isVisible) return null

  return (
    <div className="cookie-banner-wrap">
      <div className="cookie-banner-content">
        <p className="cookie-banner-text">
          We use cookies to improve your experience, analyze usage, and deliver personalized content. 
          By clicking &ldquo;Accept&rdquo;, you agree to our use of cookies. Read more in our{' '}
          <a 
            href="#cookie-policy" 
            onClick={(e) => { 
              e.preventDefault(); 
              alert("SkillGraph Cookie Policy: We store session tokens and UI preferences securely in your local browser sandbox.") 
            }} 
            className="cookie-link"
          >
            Cookie Policy
          </a>.
        </p>
        <div className="cookie-banner-actions">
          <button type="button" onClick={handleDecline} className="cookie-btn cookie-btn-decline">
            Decline
          </button>
          <button type="button" onClick={handleAccept} className="cookie-btn cookie-btn-accept">
            Accept
          </button>
        </div>
      </div>
    </div>
  )
}
