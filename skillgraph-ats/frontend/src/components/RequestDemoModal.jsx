import React, { useState } from 'react'
import { X, CheckCircle, Sparkles, Building, Mail, User, Briefcase } from 'lucide-react'

export default function RequestDemoModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    hiringVolume: '10-50 hires/yr',
    notes: ''
  })
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(false)

  if (!isOpen) return null

  const handleSubmit = (e) => {
    e.preventDefault()
    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubmitted(true)
    }, 600)
  }

  const handleReset = () => {
    setSubmitted(false)
    setFormData({ name: '', email: '', company: '', hiringVolume: '10-50 hires/yr', notes: '' })
    onClose()
  }

  return (
    <div className="landing-modal-overlay" onClick={onClose}>
      <div className="landing-modal-box" onClick={(e) => e.stopPropagation()}>
        <button className="landing-modal-close" onClick={onClose}>
          <X size={20} />
        </button>

        {!submitted ? (
          <>
            <div className="landing-modal-header">
              <div className="modal-badge">
                <Sparkles size={14} /> Enterprise Demo Walkthrough
              </div>
              <h2>See SkillGraph In Action</h2>
              <p>Experience how neuro-symbolic DAG ontology replaces keyword blindness with real engineering competency mapping.</p>
            </div>

            <form onSubmit={handleSubmit} className="modal-form">
              <div className="form-group">
                <label><User size={14} /> Full Name</label>
                <input 
                  type="text" 
                  required 
                  placeholder="e.g. Alex Rivera" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label><Mail size={14} /> Work Email</label>
                <input 
                  type="email" 
                  required 
                  placeholder="alex@company.com" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label><Building size={14} /> Company</label>
                  <input 
                    type="text" 
                    required 
                    placeholder="e.g. Stripe, OpenAI" 
                    value={formData.company}
                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                  />
                </div>

                <div className="form-group">
                  <label><Briefcase size={14} /> Annual Hiring Volume</label>
                  <select 
                    value={formData.hiringVolume}
                    onChange={(e) => setFormData({ ...formData, hiringVolume: e.target.value })}
                  >
                    <option value="1-10 hires/yr">1 - 10 hires / yr</option>
                    <option value="10-50 hires/yr">10 - 50 hires / yr</option>
                    <option value="50-200 hires/yr">50 - 200 hires / yr</option>
                    <option value="200+ hires/yr">200+ hires / yr (Enterprise)</option>
                  </select>
                </div>
              </div>

              <div className="form-group">
                <label>Technical Screening Challenges (Optional)</label>
                <textarea 
                  rows={2} 
                  placeholder="e.g. Resumes slip through keyword filters, need visual evidence scoring..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                ></textarea>
              </div>

              <button type="submit" disabled={loading} className="btn-modal-submit">
                {loading ? 'Submitting Request...' : 'Schedule Live Walkthrough →'}
              </button>
            </form>
          </>
        ) : (
          <div className="modal-success">
            <CheckCircle size={56} className="success-icon" />
            <h2>Demo Request Received!</h2>
            <p>
              Thank you, <strong>{formData.name}</strong>. Our enterprise solutions team at SkillGraph will connect with you at <strong>{formData.email}</strong> within 1 business day.
            </p>
            <div className="success-callout">
              <span>💡 In a rush?</span> You can test the platform right now using the <strong>Quick Demo Login</strong> on the sign-in page!
            </div>
            <button onClick={handleReset} className="btn-modal-submit">
              Got it, close
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

