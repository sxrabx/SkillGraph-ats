import React from 'react'
import Logo from './Logo'
import { Shield, Heart } from 'lucide-react'

export default function Footer({ onOpenDemo, onOpenAuth }) {
  return (
    <footer className="landing-footer">
      <div className="footer-inner">
        {/* Top Grid */}
        <div className="footer-grid">
          {/* Col 1: Brand & Mission */}
          <div className="footer-col footer-col-brand">
            <Logo height={32} />
            <p className="footer-mission-text">
              SkillGraph ATS replaces naive keyword matching with directed acyclic knowledge graphs, 
              2048-dimensional NVIDIA cloud embeddings, and verifiable in-app PDF evidence highlighting.
            </p>
            <div className="footer-badge-strip">
              <span className="footer-pill">
                <Shield size={12} /> Enterprise SOC2 Type II
              </span>
              <span className="footer-pill">
                ⚡ NVIDIA Inception Partner
              </span>
            </div>
          </div>

          {/* Col 2: Product */}
          <div className="footer-col">
            <h4 className="footer-col-title">Product</h4>
            <ul className="footer-link-list">
              <li><a href="#product">DAG Ontology Engine</a></li>
              <li><a href="#technology">2048-dim Embeddings</a></li>
              <li><a href="#product">PyMuPDF Highlighting</a></li>
              <li><a href="#product">GraphRAG Recruiter Chat</a></li>
              <li><button type="button" onClick={onOpenDemo} className="footer-action-link">Request Enterprise Demo</button></li>
            </ul>
          </div>

          {/* Col 3: Technology */}
          <div className="footer-col">
            <h4 className="footer-col-title">Technology</h4>
            <ul className="footer-link-list">
              <li><a href="#technology">NVIDIA Nemotron-3 NIM</a></li>
              <li><a href="#technology">Groq LPU (Qwen 3.8 27B)</a></li>
              <li><a href="#technology">NetworkX Directed Graph</a></li>
              <li><a href="#technology">Deterministic Pydantic</a></li>
              <li><a href="http://127.0.0.1:8000/docs" target="_blank" rel="noreferrer">FastAPI Swagger API ↗</a></li>
            </ul>
          </div>

          {/* Col 4: Portals & Access */}
          <div className="footer-col">
            <h4 className="footer-col-title">Portals & Access</h4>
            <ul className="footer-link-list">
              <li><button type="button" onClick={() => onOpenAuth('login')} className="footer-action-link">Recruiter Portal Login</button></li>
              <li><button type="button" onClick={() => onOpenAuth('login')} className="footer-action-link">Admin Security Console</button></li>
              <li><button type="button" onClick={() => onOpenAuth('signup')} className="footer-action-link">Register New Workspace</button></li>
              <li><a href="#pricing">Pricing & Tiers</a></li>
              <li><a href="#cookie-policy" onClick={(e) => { e.preventDefault(); alert("SkillGraph Security: All uploaded resumes are encrypted in memory and never used for public model training."); }}>Privacy & GDPR</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="footer-bottom-bar">
          <div className="footer-copyright">
            © {new Date().getFullYear()} SkillGraph ATS, Inc. All rights reserved. Built for engineering teams.
          </div>
          <div className="footer-social-links">
            <a href="https://github.com" target="_blank" rel="noreferrer" aria-label="GitHub">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
              </svg>
            </a>
            <a href="https://linkedin.com" target="_blank" rel="noreferrer" aria-label="LinkedIn">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 8.76a1.53 1.53 0 0 0 0-3.06 1.53 1.53 0 0 0 0 3.06m1.39 9.74v-8.37H5.07v8.37h2.78z"/>
              </svg>
            </a>
            <a href="https://x.com" target="_blank" rel="noreferrer" aria-label="X (Twitter)">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
