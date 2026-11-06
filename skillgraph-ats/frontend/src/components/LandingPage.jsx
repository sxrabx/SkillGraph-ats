import React, { useState, useEffect, useRef } from 'react'
import gsap from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import Lenis from 'lenis'
import SpringHeading from './SpringHeading'
import NeuronParticleField from './NeuronParticleField'
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  X, 
  Cpu, 
  Network, 
  FileSearch, 
  MessageSquare, 
  Zap, 
  CornerDownRight, 
  ChevronRight,
  ShieldCheck,
  Terminal,
  Activity,
  Layers,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GitBranch,
  Target,
  FileText
} from 'lucide-react'

// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger)

export default function LandingPage({ 
  onOpenDemo, 
  onOpenAuth, 
  onEnterWorkspace, 
  user, 
  isLoaderExiting, 
  showLoader,
  loaderExited = false
}) {
  const [activeDemoTab, setActiveDemoTab] = useState('cloud')
  const rootRef = useRef(null)
  const heroRef = useRef(null)
  const hasEntranceAnimatedRef = useRef(false)

  // Start landing text animations right after the loader smoothly exits (or immediately if no loader)
  const isEntranceReady = loaderExited || !showLoader

  // 1. Lenis Smooth Scroll Setup with GSAP Ticker synchronization
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      smoothWheel: true,
      orientation: 'vertical',
      gestureOrientation: 'vertical'
    })

    lenis.on('scroll', ScrollTrigger.update)

    const tickerCallback = (time) => {
      lenis.raf(time * 1000)
    }

    gsap.ticker.add(tickerCallback)
    gsap.ticker.lagSmoothing(0)

    return () => {
      gsap.ticker.remove(tickerCallback)
      lenis.destroy()
    }
  }, [])

  // 2. GSAP Entrance Timeline: Hero Blur Text Reveal triggers after loader smoothly exits
  useEffect(() => {
    if (isEntranceReady) {
      if (hasEntranceAnimatedRef.current) return
      hasEntranceAnimatedRef.current = true

      const ctx = gsap.context(() => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

        // Helper: only animate if target elements exist in DOM
        const safeAnimate = (selector, fromVars, toVars, position) => {
          if (!heroRef.current) return
          const el = heroRef.current.querySelector(selector)
          if (el) {
            tl.fromTo(el, fromVars, toVars, position)
          }
        }

        // 1. Floating Alvor Navbar slide & blur reveal
        const navEl = document.querySelector('.landing-navbar-floating-wrapper') || document.querySelector('.landing-navbar-wrapper')
        if (navEl) {
          tl.fromTo(
            navEl,
            { y: -30, opacity: 0, filter: 'blur(12px)' },
            { y: 0, opacity: 1, filter: 'blur(0px)', duration: 0.85, ease: 'power2.out' },
            0.05
          )
        }

        // 2. Top Swiss HUD
        safeAnimate(
          '.hero-top-hud',
          { opacity: 0, y: -14 },
          { opacity: 1, y: 0, duration: 0.65 },
          0.1
        )

        // 3. Swiss section system stamp
        safeAnimate(
          '.hero-sys-stamp',
          { opacity: 0, y: 20, filter: 'blur(12px)' },
          { opacity: 1, y: 0, filter: 'blur(0px)', duration: 0.75 },
          0.15
        )

        // 4. Hero Subtitle blur reveal
        safeAnimate(
          '.hero-reveal-sub',
          { opacity: 0, filter: 'blur(14px)', y: 24 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.85 },
          0.35
        )

        // 5. Wireframe CTA button with tactile spring pop
        safeAnimate(
          '.hero-reveal-cta',
          { opacity: 0, filter: 'blur(10px)', y: 20, scale: 0.94 },
          { opacity: 1, filter: 'blur(0px)', y: 0, scale: 1, duration: 0.85, ease: 'back.out(1.6)' },
          0.55
        )

        // 6. Handwriting annotation pop
        safeAnimate(
          '.hero-reveal-handwriting',
          { opacity: 0, scale: 0.7, rotate: -8 },
          { opacity: 1, scale: 1, rotate: -3, duration: 0.75, ease: 'back.out(2)' },
          0.7
        )

        // 7. Right Column: Telemetry card / Specimen reveal with tactile slide
        safeAnimate(
          '.hero-reveal-telemetry',
          { opacity: 0, y: 36, scale: 0.96, filter: 'blur(14px)' },
          { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)', duration: 0.95, ease: 'power2.out' },
          0.25
        )

        // 8. Swiss technical metadata strip reveal
        safeAnimate(
          '.hero-reveal-strip',
          { opacity: 0, filter: 'blur(10px)', y: 16 },
          { opacity: 1, filter: 'blur(0px)', y: 0, duration: 0.8 },
          0.75
        )
      }, heroRef)

      return () => ctx.revert()
    }
  }, [isEntranceReady])

  // 3. GSAP ScrollTrigger for Scroll Reveals on all Swiss Sections
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Helper: safe scroll animation only if elements & trigger exist
      const safeScroll = (selector, triggerSelector, fromVars, toVars) => {
        const els = gsap.utils.toArray(selector)
        const trg = document.querySelector(triggerSelector)
        if (els.length > 0 && trg) {
          gsap.fromTo(els, fromVars, {
            ...toVars,
            scrollTrigger: {
              trigger: trg,
              ...toVars.scrollTrigger
            }
          })
        }
      }

      // Reveal each section header with smooth blur reveal
      const sectionHeaders = gsap.utils.toArray('.scroll-reveal-header')
      sectionHeaders.forEach((header) => {
        gsap.fromTo(
          header,
          { opacity: 0, y: 35, filter: 'blur(14px)' },
          {
            opacity: 1,
            y: 0,
            filter: 'blur(0px)',
            duration: 0.9,
            ease: 'power2.out',
            scrollTrigger: {
              trigger: header,
              start: 'top 85%',
              toggleActions: 'play none none none'
            }
          }
        )
      })

      // Section 01: Comparison Cards
      safeScroll(
        '.comparison-card',
        '.comparison-cards-grid',
        { opacity: 0, y: 45, filter: 'blur(12px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.15,
          ease: 'power2.out',
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Section 02: 4 Swiss Architecture Pillars
      safeScroll(
        '.swiss-feature-card',
        '.features-grid',
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.8,
          stagger: 0.12,
          ease: 'power2.out',
          scrollTrigger: {
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Section 03: Swiss Performance Metrics
      safeScroll(
        '.metric-box',
        '.metrics-grid',
        { opacity: 0, y: 30, scale: 0.96, filter: 'blur(8px)' },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          filter: 'blur(0px)',
          duration: 0.75,
          stagger: 0.1,
          ease: 'power2.out',
          scrollTrigger: {
            start: 'top 85%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Section 04: Benchmark Table Rows
      safeScroll(
        '.matrix-table tbody tr',
        '.matrix-table-wrap',
        { opacity: 0, x: -20 },
        {
          opacity: 1,
          x: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: 'power2.out',
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Section 05: Pricing Cards
      safeScroll(
        '.swiss-pricing-card',
        '.pricing-grid',
        { opacity: 0, y: 40, filter: 'blur(10px)' },
        {
          opacity: 1,
          y: 0,
          filter: 'blur(0px)',
          duration: 0.85,
          stagger: 0.14,
          ease: 'power2.out',
          scrollTrigger: {
            start: 'top 80%',
            toggleActions: 'play none none none'
          }
        }
      )

      // Section 06: Final Deployment CTA Box
      safeScroll(
        '.swiss-cta-box',
        '.section-bottom-cta',
        { opacity: 0, scale: 0.95, filter: 'blur(16px)' },
        {
          opacity: 1,
          scale: 1,
          filter: 'blur(0px)',
          duration: 1,
          ease: 'power3.out',
          scrollTrigger: {
            start: 'top 82%',
            toggleActions: 'play none none none'
          }
        }
      )
    }, rootRef)

    return () => ctx.revert()
  }, [])

  // Interactive ATS Demo Scenarios
  const demoExamples = {
    cloud: {
      req: 'Cloud Infrastructure & Container Orchestration',
      resumeText: 'Docker, Helm Charts, Terraform, AWS ECS, Prometheus, Grafana',
      legacyResult: {
        score: '0% Match',
        verdict: 'Disqualified ❌',
        reason: 'Missing exact literal string "Container Orchestration"'
      },
      skillgraphResult: {
        score: '96.4% Match',
        verdict: 'Top Tier Candidate 🟢',
        reason: 'DAG Ontology traversed: Docker + Helm + AWS ECS deduces Container Orchestration. 2048-dim NVIDIA cosine similarity 0.94.',
        evidenceCount: '6 Evidence Highlights'
      }
    },
    backend: {
      req: 'High-Throughput Distributed Microservices',
      resumeText: 'Kafka, gRPC, Redis Pub/Sub, Golang, PostgreSQL connection pooling',
      legacyResult: {
        score: '12% Match',
        verdict: 'Filtered Out ❌',
        reason: 'Only matched literal word "Microservices", missed architectural depth'
      },
      skillgraphResult: {
        score: '94.8% Match',
        verdict: 'Strong Recommendation 🟢',
        reason: 'Kafka + gRPC + Redis confirms distributed async messaging patterns with high algorithmic concurrency.',
        evidenceCount: '5 Evidence Highlights'
      }
    },
    ml: {
      req: 'Generative AI & LLM Systems Engineering',
      resumeText: 'PyTorch, HuggingFace Transformers, LangChain, FAISS, LoRA fine-tuning',
      legacyResult: {
        score: '0% Match',
        verdict: 'Rejected ❌',
        reason: 'Job description queried "Generative AI", candidate specified exact implementation frameworks'
      },
      skillgraphResult: {
        score: '98.2% Match',
        verdict: 'Rank #1 Candidate 🟢',
        reason: 'Transformers + LoRA + FAISS maps with 100% DAG ontological certainty to LLM Fine-Tuning & Vector Retrieval.',
        evidenceCount: '7 Evidence Highlights'
      }
    }
  }

  const currentExample = demoExamples[activeDemoTab]

  return (
    <div className={`landing-page-root ${!isEntranceReady ? 'is-loader-active' : ''}`} ref={rootRef}>
      {/* ============================================================
          1. HERO SECTION (SWISS ASYMMETRIC GRID + DUAL ZONE COCKPIT)
          ============================================================ */}
      <section className="hero-fullscreen-section" ref={heroRef}>
        {/* Subtle architectural grid pattern & orange ambient underlay */}
        <div className="hero-grid-pattern" aria-hidden="true"></div>
        <div className="hero-glow-underlay" aria-hidden="true"></div>

        {/* Top Swiss Telemetry HUD */}
        <div className="hero-top-hud">
          <div className="hud-corner top-left">+</div>
          <div className="hud-corner top-right">+</div>
          <div className="hud-metric-cell">
            <span className="hud-label">CALIBRATION</span>
            <span className="hud-val">LAT 47.3769° N // LON 8.5417° E</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-label">STATUS</span>
            <span className="hud-val text-orange">● SYS.ACTIVE // 2048-D VECTORS</span>
          </div>
          <div className="hud-metric-cell">
            <span className="hud-label">FALSE-NEG DROP</span>
            <span className="hud-val">&lt; 2.8% [MATHEMATICALLY VERIFIED]</span>
          </div>
        </div>

        {/* 2-Column Asymmetric Swiss Cockpit Grid */}
        <div className="hero-swiss-grid">
          {/* LEFT COLUMN: EDITORIAL, TYPOGRAPHY & COMMAND */}
          <div className="hero-editorial-col">
            {/* Swiss System Badges with Iconography */}
            <div className="hero-sys-stamp">
              <span className="swiss-tag">
                <Network size={12} className="inline-icon" /> [ SYS.00 // AI RESUME INTELLIGENCE ]
              </span>
              <span className="swiss-tag-accent">
                <Cpu size={12} className="inline-icon" /> NEURO-SYMBOLIC ATS
              </span>
            </div>

            {/* Differentiated Headline with Spring-Text-Engine Blur In Animation (triggers after loader exit) */}
            <div className="hero-headline-wrap">
              <SpringHeading 
                key={isEntranceReady ? 'hero-active' : 'hero-waiting'}
                enabled={isEntranceReady}
                delayIn={80}
                tag="h1" 
                align="left"
                className="hero-headline justify-start" 
                aria-label="Hiring that understands skills, not keywords."
              >
                Hiring that understands <span className="hero-brand-highlight">skills,</span> not <span className="hero-strike-mono">keywords.</span>
              </SpringHeading>

              {/* Hybrid Handwriting Annotation */}
              <div className="hero-handwriting-bubble hero-reveal-handwriting">
                <span className="handwriting-text">✦ zero keyword games!</span>
                <svg className="handwriting-arrow-svg" width="34" height="24" viewBox="0 0 34 24" fill="none">
                  <path d="M2 18C10 21 22 19 30 5M30 5L24 4M30 5L29 11" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
            </div>

            {/* Hero Subtitle */}
            <div className="hero-subtitle hero-reveal-sub">
              <span className="hero-mono-lead">// DAG ONTOLOGY REASONING</span>
              <p>
                An AI-native ATS that replaces naive string matching with directed acyclic knowledge graphs and 2048-dimensional NVIDIA embeddings. Deterministic, auditable, and mathematically grounded.
              </p>
            </div>

            {/* Hero Actions: Wireframe Buttons with Hover Press & Orange Glow */}
            <div className="hero-actions-container hero-reveal-cta">
              <div className="hero-wireframe-btn-wrapper">
                <button 
                  type="button" 
                  onClick={onOpenDemo} 
                  className="btn-wireframe btn-wireframe-primary btn-wireframe-lg"
                >
                  <span className="wireframe-btn-inner">
                    <span className="wireframe-corner-mark top-left">+</span>
                    <span className="wireframe-corner-mark top-right">+</span>
                    <span className="wireframe-corner-mark bottom-left">+</span>
                    <span className="wireframe-corner-mark bottom-right">+</span>
                    <Sparkles size={16} className="btn-sparkle-icon" />
                    <span className="wireframe-btn-text">Request Live Demo</span>
                    <ArrowRight size={16} className="btn-arrow-icon" />
                  </span>
                  <span className="wireframe-glow-layer"></span>
                </button>

                <span className="cta-handwriting-note">takes 30 seconds ➔</span>
              </div>

              {user ? (
                <button 
                  type="button" 
                  onClick={onEnterWorkspace} 
                  className="btn-wireframe btn-wireframe-outline btn-wireframe-lg"
                >
                  <span className="wireframe-btn-inner">
                    <span className="wireframe-corner-mark top-left">+</span>
                    <span className="wireframe-corner-mark top-right">+</span>
                    <span className="wireframe-corner-mark bottom-left">+</span>
                    <span className="wireframe-corner-mark bottom-right">+</span>
                    <span>Enter Workspace</span>
                    <ChevronRight size={16} />
                  </span>
                  <span className="wireframe-glow-layer"></span>
                </button>
              ) : (
                <button 
                  type="button" 
                  onClick={() => {
                    const el = document.getElementById('demo-comparison')
                    if (el) el.scrollIntoView({ behavior: 'smooth' })
                  }} 
                  className="btn-wireframe btn-wireframe-outline btn-wireframe-lg"
                >
                  <span className="wireframe-btn-inner">
                    <span className="wireframe-corner-mark top-left">+</span>
                    <span className="wireframe-corner-mark top-right">+</span>
                    <span className="wireframe-corner-mark bottom-left">+</span>
                    <span className="wireframe-corner-mark bottom-right">+</span>
                    <FileSearch size={15} />
                    <span>See Live Proof</span>
                    <CornerDownRight size={15} />
                  </span>
                  <span className="wireframe-glow-layer"></span>
                </button>
              )}
            </div>

            {/* Swiss Technical Micro-Badges with Iconography */}
            <div className="hero-micro-badges-row hero-reveal-strip">
              <div className="micro-badge-item">
                <ShieldCheck size={13} className="text-orange" />
                <span>100% Explainable</span>
              </div>
              <div className="micro-badge-sep">•</div>
              <div className="micro-badge-item">
                <Zap size={13} className="text-orange" />
                <span>&lt;45ms Groq LPU</span>
              </div>
              <div className="micro-badge-sep">•</div>
              <div className="micro-badge-item">
                <Network size={13} className="text-orange" />
                <span>4,820 DAG Nodes</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: 3D GPU NEURON PARTICLE FIELD SPECIMEN */}
          <div className="hero-telemetry-col hero-reveal-telemetry">
            <NeuronParticleField />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. SECTION 01: EMPIRICAL COMPARISON (INTERACTIVE DEMO)
          ============================================================ */}
      <section className="section-interactive-demo" id="demo-comparison">
        <div className="landing-content-container">
          {/* Swiss Section Header */}
          <div className="swiss-section-header scroll-reveal-header">
            <div className="swiss-tag-row">
              <span className="swiss-tag">[ 01 // EMPIRICAL COMPARISON ]</span>
              <span className="swiss-handwriting-tag">← see the difference in action</span>
            </div>
            <SpringHeading tag="h2" align="left" className="section-title">
              Why Keyword ATS Disqualifies Your Best Engineers
            </SpringHeading>
            <p className="section-desc">
              When an engineer writes <em>&ldquo;Kubernetes, Docker, and Helm&rdquo;</em>, naive string-matching filters score them 0% for <em>&ldquo;Container Orchestration&rdquo;</em>. 
              SkillGraph traverses the ontology graph to deduce competencies deterministically.
            </p>
          </div>

          {/* Interactive Tab Switcher */}
          <div className="demo-tabs-wrap">
            <button 
              type="button" 
              className={`demo-tab-chip ${activeDemoTab === 'cloud' ? 'active' : ''}`}
              onClick={() => setActiveDemoTab('cloud')}
            >
              ☁️ Cloud & Infrastructure
            </button>
            <button 
              type="button" 
              className={`demo-tab-chip ${activeDemoTab === 'backend' ? 'active' : ''}`}
              onClick={() => setActiveDemoTab('backend')}
            >
              ⚙️ Distributed Systems
            </button>
            <button 
              type="button" 
              className={`demo-tab-chip ${activeDemoTab === 'ml' ? 'active' : ''}`}
              onClick={() => setActiveDemoTab('ml')}
            >
              🧠 Generative AI & LLMs
            </button>
          </div>

          {/* Side-by-Side Swiss Brutalist Comparison Cards */}
          <div className="comparison-cards-grid">
            {/* Legacy ATS Card */}
            <div className="comparison-card legacy-card">
              <div className="card-swiss-index">
                <span className="card-tag tag-legacy">
                  <X size={14} /> Legacy Keyword ATS
                </span>
                <span className="card-coord">FIG. 01-A</span>
              </div>

              <div className="card-inner-block">
                <span className="spec-label">Target Role Requirement</span>
                <p className="spec-val-req">&ldquo;{currentExample.req}&rdquo;</p>

                <span className="spec-label" style={{ marginTop: '1.25rem' }}>Candidate Resume Experience</span>
                <p className="spec-val-resume">{currentExample.resumeText}</p>
              </div>

              <div className="card-result-footer result-negative">
                <div className="res-score-col">
                  <span className="res-num">{currentExample.legacyResult.score}</span>
                  <span className="res-badge-negative">{currentExample.legacyResult.verdict}</span>
                </div>
                <p className="res-explanation">{currentExample.legacyResult.reason}</p>
              </div>
            </div>

            {/* SkillGraph ATS Card */}
            <div className="comparison-card skillgraph-card">
              <div className="card-swiss-index">
                <span className="card-tag tag-skillgraph">
                  <Sparkles size={14} /> SkillGraph ATS (Neuro-Symbolic)
                </span>
                <span className="card-coord">FIG. 01-B</span>
              </div>

              <div className="card-inner-block">
                <div className="spec-header-with-handwriting">
                  <span className="spec-label">Ontological DAG Traversal</span>
                  <span className="card-handwriting-note">✓ 100% implied certainty</span>
                </div>

                <div className="ontology-tree-preview">
                  <span className="tree-node">Docker</span>
                  <span className="tree-arrow">➔</span>
                  <span className="tree-node">Helm</span>
                  <span className="tree-arrow">➔</span>
                  <span className="tree-node node-success">{currentExample.req}</span>
                </div>

                <span className="spec-label" style={{ marginTop: '1.25rem' }}>NVIDIA Cloud GPU Alignment (2048-D)</span>
                <div className="vector-cosine-bar">
                  <div className="vector-fill" style={{ width: '96%' }}></div>
                </div>
              </div>

              <div className="card-result-footer result-positive">
                <div className="res-score-col">
                  <span className="res-num-positive">{currentExample.skillgraphResult.score}</span>
                  <span className="res-badge-positive">{currentExample.skillgraphResult.verdict}</span>
                </div>
                <p className="res-explanation-positive">{currentExample.skillgraphResult.reason}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. SECTION 02: SWISS 4-PILLAR ARCHITECTURE
          ============================================================ */}
      <section className="section-product-features" id="product">
        <div className="landing-content-container">
          <div className="swiss-section-header scroll-reveal-header">
            <div className="swiss-tag-row">
              <span className="swiss-tag">[ 02 // ARCHITECTURE PILLARS ]</span>
              <span className="swiss-handwriting-tag">* mathematical proof, zero hallucinations</span>
            </div>
            <SpringHeading tag="h2" align="left" className="section-title">
              Engineered for Verifiable Proof
            </SpringHeading>
            <p className="section-desc">
              Every candidate score is mathematically grounded in verified resume text and visually highlighted on the original document.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card swiss-feature-card">
              <div className="feature-card-header">
                <span className="swiss-numeral">01</span>
                <div className="feature-icon-wrap icon-orange">
                  <Network size={22} />
                </div>
              </div>
              <SpringHeading tag="h3" align="left">Symbolic DAG Ontology</SpringHeading>
              <p>
                A directed acyclic graph in NetworkX traverses parent, child, and synergistic abilities. Deduces unstated competencies with mathematical certainty.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Traverses A ➔ B implied skills</li>
                <li><Check size={14} /> 100% explainable deduction logic</li>
                <li><Check size={14} /> Zero false-negative keyword dropouts</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card swiss-feature-card">
              <div className="feature-card-header">
                <span className="swiss-numeral">02</span>
                <div className="feature-icon-wrap icon-orange">
                  <Cpu size={22} />
                </div>
              </div>
              <SpringHeading tag="h3" align="left">2048-dim NVIDIA Embeddings</SpringHeading>
              <p>
                Dense representation vectors powered by the NVIDIA NIM Cloud API (<code>nemotron-3-embed-1b</code>). Captures nuanced technical overlap at lightning speed.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Ultra-dense 2048-dimensional vectors</li>
                <li><Check size={14} /> Cosine similarity scoring</li>
                <li><Check size={14} /> Cloud GPU acceleration via NVIDIA NIM</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card swiss-feature-card">
              <div className="feature-card-header">
                <span className="swiss-numeral">03</span>
                <div className="feature-icon-wrap icon-orange">
                  <FileSearch size={22} />
                </div>
              </div>
              <SpringHeading tag="h3" align="left">PyMuPDF Visual Annotator</SpringHeading>
              <p>
                In-app evidence highlighter renders color-coded bounding boxes directly over the original PDF without browser sandboxing errors.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> 🟢 Green: Matched requirements</li>
                <li><Check size={14} /> 🟠 Orange: Architecture & projects</li>
                <li><Check size={14} /> 🔵 Cyan: Extracted competencies</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="feature-card swiss-feature-card">
              <div className="feature-card-header">
                <span className="swiss-numeral">04</span>
                <div className="feature-icon-wrap icon-orange">
                  <MessageSquare size={22} />
                </div>
              </div>
              <SpringHeading tag="h3" align="left">Guardrailed GraphRAG Chat</SpringHeading>
              <p>
                Query candidate profiles directly via Groq LPU inference (<code>qwen/qwen3.8-27b</code>) strictly isolated to verified candidate facts.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Hallucination-free candidate drill-down</li>
                <li><Check size={14} /> Knowledge graph node inspection</li>
                <li><Check size={14} /> Recruiter FAQ & interview question generator</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. SWISS METRICS STRIP
          ============================================================ */}
      <section className="section-swiss-metrics" aria-label="System Performance Metrics">
        <div className="landing-content-container">
          <div className="metrics-grid">
            <div className="metric-box">
              <span className="metric-corner top-left">+</span>
              <span className="metric-corner top-right">+</span>
              <span className="metric-tag">
                <Target size={13} className="inline-icon text-orange" /> [ ACCURACY ]
              </span>
              <span className="metric-number">98.4%</span>
              <span className="metric-label">Cosine Semantic Precision</span>
            </div>
            <div className="metric-box">
              <span className="metric-corner top-left">+</span>
              <span className="metric-corner top-right">+</span>
              <span className="metric-tag">
                <ShieldCheck size={13} className="inline-icon text-orange" /> [ DISQUALIFICATION ]
              </span>
              <span className="metric-number">&lt; 2.8%</span>
              <span className="metric-label">False-Negative Drop Rate</span>
            </div>
            <div className="metric-box">
              <span className="metric-corner top-left">+</span>
              <span className="metric-corner top-right">+</span>
              <span className="metric-tag">
                <Cpu size={13} className="inline-icon text-orange" /> [ VECTORS ]
              </span>
              <span className="metric-number">2048-D</span>
              <span className="metric-label">Dense NVIDIA Nemotron NIM</span>
            </div>
            <div className="metric-box">
              <span className="metric-corner top-left">+</span>
              <span className="metric-corner top-right">+</span>
              <span className="metric-tag">
                <Zap size={13} className="inline-icon text-orange" /> [ LATENCY ]
              </span>
              <span className="metric-number">&lt; 45ms</span>
              <span className="metric-label">Groq LPU Processing Time</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. SECTION 03: TECHNOLOGY MATRIX
          ============================================================ */}
      <section className="section-tech-matrix" id="technology">
        <div className="landing-content-container">
          <div className="swiss-section-header scroll-reveal-header">
            <div className="swiss-tag-row">
              <span className="swiss-tag">[ 03 // BENCHMARK MATRIX ]</span>
            </div>
            <SpringHeading tag="h2" align="left" className="section-title">
              Architectural Comparison
            </SpringHeading>
            <p className="section-desc">
              How SkillGraph&apos;s Neuro-Symbolic stack compares to legacy string-matching ATS and generic wrapper tools.
            </p>
          </div>

          <div className="matrix-table-wrap">
            <table className="matrix-table">
              <thead>
                <tr>
                  <th>Platform Capability</th>
                  <th>Legacy ATS (Workday, Taleo)</th>
                  <th>Generic LLM Wrappers</th>
                  <th className="highlighted-col">SkillGraph ATS (2.0)</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><strong>Skill Matching Paradigm</strong></td>
                  <td>Literal string grep matching</td>
                  <td>Unbounded text generation</td>
                  <td className="highlighted-col"><strong>Symbolic DAG + Cosine Vectors</strong></td>
                </tr>
                <tr>
                  <td><strong>False-Negative Rejection Rate</strong></td>
                  <td>High (60% - 75%)</td>
                  <td>Unpredictable (drift)</td>
                  <td className="highlighted-col"><strong>&lt; 3% (Mathematically Verified)</strong></td>
                </tr>
                <tr>
                  <td><strong>Auditability & Evidence</strong></td>
                  <td>Black box score (0 - 100)</td>
                  <td>Hallucinated summaries</td>
                  <td className="highlighted-col"><strong>PyMuPDF Visual Bounding Boxes</strong></td>
                </tr>
                <tr>
                  <td><strong>Embedding Dimensionality</strong></td>
                  <td>None (Keyword only)</td>
                  <td>768 / 1536 dim</td>
                  <td className="highlighted-col"><strong>2048-dim NVIDIA NIM Cloud</strong></td>
                </tr>
                <tr>
                  <td><strong>Inference Engine</strong></td>
                  <td>SQL Database Queries</td>
                  <td>Standard Cloud API</td>
                  <td className="highlighted-col"><strong>Groq Ultra-Fast LPU Inference</strong></td>
                </tr>
                <tr>
                  <td><strong>Recruiter Chat Grounding</strong></td>
                  <td>Unavailable</td>
                  <td>Prone to hallucination</td>
                  <td className="highlighted-col"><strong>Strict GraphRAG Fact Isolation</strong></td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. SECTION 04: TRANSPARENT PRICING
          ============================================================ */}
      <section className="section-pricing" id="pricing">
        <div className="landing-content-container">
          <div className="swiss-section-header scroll-reveal-header">
            <div className="swiss-tag-row">
              <span className="swiss-tag">[ 04 // COMMERCIAL TIERS ]</span>
              <span className="swiss-handwriting-tag">transparent, no lock-in</span>
            </div>
            <SpringHeading tag="h2" align="left" className="section-title">
              Predictable Pricing for High-Volume Recruiting
            </SpringHeading>
          </div>

          <div className="pricing-grid">
            {/* Starter Tier */}
            <div className="pricing-card swiss-pricing-card">
              <div className="pricing-tier-title">Starter & Evaluation</div>
              <div className="pricing-price">
                <span className="price-amount">$0</span>
                <span className="price-term">/ free tier</span>
              </div>
              <p className="pricing-sub">Full access to test all features with immediate test credentials.</p>
              
              <ul className="pricing-feature-list">
                <li><Check size={15} /> 25 Resumes / Month</li>
                <li><Check size={15} /> Directed Acyclic Graph Reasoning</li>
                <li><Check size={15} /> 2048-dim NVIDIA GPU Embeddings</li>
                <li><Check size={15} /> In-App Visual PDF Evidence Viewer</li>
                <li><Check size={15} /> GraphRAG Recruiter Assistant Chat</li>
              </ul>

              <button 
                type="button" 
                onClick={() => onOpenAuth('signup')} 
                className="btn-wireframe btn-wireframe-outline"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <span className="wireframe-btn-inner">
                  <span className="wireframe-corner-mark top-left">+</span>
                  <span className="wireframe-corner-mark top-right">+</span>
                  <span className="wireframe-corner-mark bottom-left">+</span>
                  <span className="wireframe-corner-mark bottom-right">+</span>
                  <span>Start Free Trial</span>
                </span>
                <span className="wireframe-glow-layer"></span>
              </button>
            </div>

            {/* Pro Recruiter (Featured) */}
            <div className="pricing-card swiss-pricing-card featured-pricing-card">
              <div className="pricing-featured-badge">MOST POPULAR</div>
              <div className="pricing-handwriting-badge">loved by tech recruiters ⚡</div>
              
              <div className="pricing-tier-title">Pro Recruiter</div>
              <div className="pricing-price">
                <span className="price-amount">$99</span>
                <span className="price-term">/ recruiter / mo</span>
              </div>
              <p className="pricing-sub">Designed for active talent teams and agency recruitment partners.</p>

              <ul className="pricing-feature-list">
                <li><Check size={15} /> Unlimited Candidate Ingestion</li>
                <li><Check size={15} /> Batch Uploads & Parallel Ranking</li>
                <li><Check size={15} /> In-App Annotated PDF Inspector</li>
                <li><Check size={15} /> High-Speed Groq LPU Inference</li>
                <li><Check size={15} /> Priority API Throughput</li>
                <li><Check size={15} /> Dedicated Recruiter Support</li>
              </ul>

              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="btn-wireframe btn-wireframe-primary"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <span className="wireframe-btn-inner">
                  <span className="wireframe-corner-mark top-left">+</span>
                  <span className="wireframe-corner-mark top-right">+</span>
                  <span className="wireframe-corner-mark bottom-left">+</span>
                  <span className="wireframe-corner-mark bottom-right">+</span>
                  <Sparkles size={14} className="btn-sparkle-icon" />
                  <span>Request Live Demo</span>
                </span>
                <span className="wireframe-glow-layer"></span>
              </button>
            </div>

            {/* Enterprise */}
            <div className="pricing-card swiss-pricing-card">
              <div className="pricing-tier-title">Enterprise ATS</div>
              <div className="pricing-price">
                <span className="price-amount">Custom</span>
                <span className="price-term">/ SLA</span>
              </div>
              <p className="pricing-sub">Custom domain ontologies, on-prem VPC hosting, and ATS connectors.</p>

              <ul className="pricing-feature-list">
                <li><Check size={15} /> Custom Internal Skill Graph Ontologies</li>
                <li><Check size={15} /> Workday / Greenhouse Connectors</li>
                <li><Check size={15} /> SAML 2.0 / Okta SSO & Security Controls</li>
                <li><Check size={15} /> Dedicated On-Premises or Private Cloud</li>
                <li><Check size={15} /> 99.99% Uptime Guarantee</li>
              </ul>

              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="btn-wireframe btn-wireframe-outline"
                style={{ width: '100%', marginTop: 'auto' }}
              >
                <span className="wireframe-btn-inner">
                  <span className="wireframe-corner-mark top-left">+</span>
                  <span className="wireframe-corner-mark top-right">+</span>
                  <span className="wireframe-corner-mark bottom-left">+</span>
                  <span className="wireframe-corner-mark bottom-right">+</span>
                  <span>Contact Enterprise Sales</span>
                </span>
                <span className="wireframe-glow-layer"></span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. SECTION 05: FINAL DEPLOYMENT CTA
          ============================================================ */}
      <section className="section-bottom-cta">
        <div className="bottom-cta-box swiss-cta-box">
          <div className="cta-glow-element" aria-hidden="true"></div>
          
          <div className="swiss-tag-row" style={{ justifyContent: 'center' }}>
            <span className="swiss-tag">[ 05 // SYSTEM READY ]</span>
          </div>
          
          <SpringHeading tag="h2" align="center" className="justify-center">
            Ready to experience skill-first recruiting?
          </SpringHeading>
          <p>
            Replace keyword blindness with knowledge graph comprehension. Objective, auditable, and mathematically verified.
          </p>

          <div className="bottom-cta-actions">
            <button 
              type="button" 
              onClick={onOpenDemo} 
              className="btn-wireframe btn-wireframe-primary btn-wireframe-lg"
            >
              <span className="wireframe-btn-inner">
                <span className="wireframe-corner-mark top-left">+</span>
                <span className="wireframe-corner-mark top-right">+</span>
                <span className="wireframe-corner-mark bottom-left">+</span>
                <span className="wireframe-corner-mark bottom-right">+</span>
                <Sparkles size={16} className="btn-sparkle-icon" />
                <span>Request a Live Demo</span>
              </span>
              <span className="wireframe-glow-layer"></span>
            </button>

            <button 
              type="button" 
              onClick={user ? onEnterWorkspace : () => onOpenAuth('login')} 
              className="btn-wireframe btn-wireframe-outline btn-wireframe-lg"
            >
              <span className="wireframe-btn-inner">
                <span className="wireframe-corner-mark top-left">+</span>
                <span className="wireframe-corner-mark top-right">+</span>
                <span className="wireframe-corner-mark bottom-left">+</span>
                <span className="wireframe-corner-mark bottom-right">+</span>
                <span>Launch ATS Workspace →</span>
              </span>
              <span className="wireframe-glow-layer"></span>
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
