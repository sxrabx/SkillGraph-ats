import React, { useState } from 'react'
import DepthParallaxWords from './DepthParallaxWords'
import { 
  ArrowRight, 
  Sparkles, 
  Check, 
  X, 
  Shield, 
  Cpu, 
  Network, 
  FileSearch, 
  MessageSquare, 
  Layers, 
  Zap, 
  BarChart3, 
  CheckCircle2, 
  TrendingUp,
  BrainCircuit
} from 'lucide-react'

export default function LandingPage({ onOpenDemo, onOpenAuth, onEnterWorkspace, user }) {
  const [activeDemoTab, setActiveDemoTab] = useState('cloud') // 'cloud' | 'backend' | 'ml'

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
    <div className="landing-page-root">
      {/* ============================================================
          1. HERO SECTION (FULL SCREEN HEIGHT 100VH)
          Matches user's screenshot pixel-by-pixel
          ============================================================ */}
      <section className="hero-fullscreen-section">
        <div className="hero-glow-underlay"></div>

        <div className="hero-fullscreen-content">
          {/* Main Headline with Depth Parallax Words */}
          <h1 className="hero-headline" aria-label="Hiring that understands skills, not keywords.">
            <DepthParallaxWords 
              text="Hiring that" 
              className="hero-line-block"
              wordClassName="hero-line-muted"
              delay={0.06}
              stagger={0.08}
            />
            <br />
            <DepthParallaxWords 
              text="understands" 
              className="hero-line-block"
              wordClassName="hero-line-muted"
              delay={0.22}
              stagger={0.08}
            />
            <br />
            <div className="hero-line-skills-wrap">
              <DepthParallaxWords 
                text="skills," 
                className="hero-line-block"
                wordClassName="hero-line-white"
                delay={0.34}
                stagger={0.08}
              />
              <span className="hero-equalizer-wrap" aria-hidden="true" title="Skill Graph Metrics">
                <span className="hero-bar bar-1"></span>
                <span className="hero-bar bar-2"></span>
                <span className="hero-bar bar-3"></span>
              </span>
              <DepthParallaxWords 
                text="not keywords." 
                className="hero-line-block"
                wordClassName="hero-line-white"
                delay={0.44}
                stagger={0.08}
              />
            </div>
          </h1>

          {/* Hero Subtitle with Depth Parallax Words */}
          <div className="hero-subtitle">
            <DepthParallaxWords
              text="An AI-native ATS that maps, infers, and verifies real engineering competencies using knowledge graphs and LLMs."
              className="hero-sub-parallax-wrap"
              wordClassName="hero-sub-word"
              delay={0.65}
              stagger={0.035}
            />
          </div>

          {/* Hero CTA Button with Depth Parallax entrance and ambient purple glow */}
          <DepthParallaxWords delay={0.95} className="hero-cta-box-wrapper">
            <div className="hero-cta-box">
              <div className="hero-btn-ambient-glow"></div>
              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="btn-hero-primary"
              >
                Request a Demo
              </button>
            </div>
          </DepthParallaxWords>
        </div>
      </section>

      {/* ============================================================
          2. INTERACTIVE DEMO: KEYWORD ATS VS SKILLGRAPH
          ============================================================ */}
      <section className="section-interactive-demo" id="demo-comparison">
        <div className="landing-content-container">
          <div className="section-header-centered">
            <div className="section-pill">
              <BrainCircuit size={14} /> The Neuro-Symbolic Difference
            </div>
            <h2 className="section-title">See why legacy ATS filters fail your best engineers</h2>
            <p className="section-desc">
              When an engineer writes <em>&quot;Kubernetes, Docker, and Terraform&quot;</em>, string-matching ATS scores them at 0% for <em>&quot;Cloud Infrastructure&quot;</em>. 
              SkillGraph traverses the ontology to deduce implicit competencies automatically.
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

          {/* Comparative Cards */}
          <div className="comparison-cards-grid">
            {/* Legacy ATS Card */}
            <div className="comparison-card legacy-card">
              <div className="card-tag tag-legacy">
                <X size={14} /> Legacy ATS (String Matching)
              </div>
              <div className="card-inner-block">
                <span className="spec-label">Target Role Requirement</span>
                <p className="spec-val-req">&ldquo;{currentExample.req}&rdquo;</p>

                <span className="spec-label" style={{ marginTop: '1rem' }}>Candidate Resume Experience</span>
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
              <div className="card-tag tag-skillgraph">
                <Sparkles size={14} /> SkillGraph ATS (GraphRAG + Embeddings)
              </div>
              <div className="card-inner-block">
                <span className="spec-label">Ontological DAG Deduction</span>
                <div className="ontology-tree-preview">
                  <span className="tree-node">Docker</span>
                  <span className="tree-arrow">➔</span>
                  <span className="tree-node">Helm</span>
                  <span className="tree-arrow">➔</span>
                  <span className="tree-node node-success">{currentExample.req} (100% Implied)</span>
                </div>

                <span className="spec-label" style={{ marginTop: '1rem' }}>NVIDIA Cloud GPU Alignment</span>
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
          3. CORE PRODUCT PILLARS
          ============================================================ */}
      <section className="section-product-features" id="product">
        <div className="landing-content-container">
          <div className="section-header-centered">
            <div className="section-pill">
              <Layers size={14} /> Modular Neuro-Symbolic Engine
            </div>
            <h2 className="section-title">Built for recruiters who demand proof, not hallucinations</h2>
            <p className="section-desc">
              Every score produced by SkillGraph is mathematically verifiable, grounded in candidate resume text, 
              and visually mapped to PDF coordinates.
            </p>
          </div>

          <div className="features-grid">
            {/* Feature 1 */}
            <div className="feature-card">
              <div className="feature-icon-wrap icon-purple">
                <Network size={24} />
              </div>
              <h3>1. Symbolic DAG Ontology</h3>
              <p>
                A directed acyclic graph built in NetworkX traverses parent, child, and synergistic engineering competencies. 
                It deduces unstated abilities with deterministic mathematical rigor.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Traverses A ➔ B implied skills</li>
                <li><Check size={14} /> 100% explainable deduction logic</li>
                <li><Check size={14} /> Zero false-negative keyword dropouts</li>
              </ul>
            </div>

            {/* Feature 2 */}
            <div className="feature-card">
              <div className="feature-icon-wrap icon-blue">
                <Cpu size={24} />
              </div>
              <h3>2. 2048-dim NVIDIA GPU Embeddings</h3>
              <p>
                Dense representation vectors powered by the <strong>NVIDIA NIM Cloud API</strong> (<code>nemotron-3-embed-1b</code>). 
                Captures nuanced technical synonyms and semantic engineering overlap at lightning speed.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Ultra-dense 2048-dimensional vectors</li>
                <li><Check size={14} /> Cosine similarity mathematical scoring</li>
                <li><Check size={14} /> Cloud GPU acceleration via NVIDIA NIM</li>
              </ul>
            </div>

            {/* Feature 3 */}
            <div className="feature-card">
              <div className="feature-icon-wrap icon-green">
                <FileSearch size={24} />
              </div>
              <h3>3. PyMuPDF In-App Visual Annotator</h3>
              <p>
                No more guessing why a candidate received a score. Our server-side PyMuPDF engine renders 
                color-coded evidence bounding boxes directly over the original PDF with zero browser sandboxing errors.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> 🟢 Green: Matched requirements</li>
                <li><Check size={14} /> 🟣 Purple: Projects & architecture</li>
                <li><Check size={14} /> 🔵 Blue: Extracted competencies</li>
              </ul>
            </div>

            {/* Feature 4 */}
            <div className="feature-card">
              <div className="feature-icon-wrap icon-amber">
                <MessageSquare size={24} />
              </div>
              <h3>4. Guardrailed GraphRAG Recruiter Chat</h3>
              <p>
                Chat with candidate profiles directly. Built with Groq LPU inference (<code>qwen/qwen3.8-27b</code>) 
                strictly constrained to candidate facts. Ask why they scored a match or where their skill gaps lie.
              </p>
              <ul className="feature-check-list">
                <li><Check size={14} /> Hallucination-free candidate drill-down</li>
                <li><Check size={14} /> Real-time knowledge graph node inspection</li>
                <li><Check size={14} /> Recruiter FAQ & interview question generator</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. TECHNOLOGY COMPARISON MATRIX
          ============================================================ */}
      <section className="section-tech-matrix" id="technology">
        <div className="landing-content-container">
          <div className="section-header-centered">
            <div className="section-pill">
              <BarChart3 size={14} /> Technology Matrix
            </div>
            <h2 className="section-title">How SkillGraph Compares to the Industry</h2>
            <p className="section-desc">
              Compare architectural capabilities between legacy ATS tools, generic generative wrappers, and SkillGraph&apos;s Neuro-Symbolic stack.
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
                  <td className="highlighted-col"><strong>Symbolic DAG Ontology + Cosine Vectors</strong></td>
                </tr>
                <tr>
                  <td><strong>False-Negative Rejection Rate</strong></td>
                  <td>High (60% - 75%)</td>
                  <td>Unpredictable (drift)</td>
                  <td className="highlighted-col"><strong>&lt; 3% (Verified)</strong></td>
                </tr>
                <tr>
                  <td><strong>Auditability & Evidence</strong></td>
                  <td>Black box score (0 - 100)</td>
                  <td>Hallucinated summaries</td>
                  <td className="highlighted-col"><strong>Visual In-App PDF Bounding Boxes</strong></td>
                </tr>
                <tr>
                  <td><strong>Embedding Dimensionality</strong></td>
                  <td>None (Keyword only)</td>
                  <td>768 / 1536 dim</td>
                  <td className="highlighted-col"><strong>2048-dim NVIDIA Nemotron NIM</strong></td>
                </tr>
                <tr>
                  <td><strong>Inference Engine</strong></td>
                  <td>SQL Database Queries</td>
                  <td>Standard Cloud API</td>
                  <td className="highlighted-col"><strong>Groq Ultra-Fast LPU + Cloud GPU</strong></td>
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
          5. USE CASES
          ============================================================ */}
      <section className="section-use-cases" id="use-cases">
        <div className="landing-content-container">
          <div className="section-header-centered">
            <div className="section-pill">
              <Zap size={14} /> Engineered for Scale
            </div>
            <h2 className="section-title">Empowering Every Tier of Technical Talent</h2>
          </div>

          <div className="use-cases-grid" id="for-recruiters">
            <div className="use-case-card">
              <div className="use-case-badge">Tech Unicorns & Startups</div>
              <h3>Fast-Moving Engineering Teams</h3>
              <p>
                Hire the top 1% without reading 500 resumes by hand. Surface high-potential candidates whose resumes 
                demonstrate deep architectural chops even if they did not match exact recruiter buzzwords.
              </p>
            </div>

            <div className="use-case-card">
              <div className="use-case-badge">Enterprise Talent Org</div>
              <h3>Corporate Talent Acquisition</h3>
              <p>
                Standardize evaluation criteria across hiring managers. Provide objective, auditable highlighted PDF evidence 
                that eliminates unconscious bias and accelerates interview pipelines.
              </p>
            </div>

            <div className="use-case-card">
              <div className="use-case-badge">Technical Headhunters</div>
              <h3>Executive & Boutique Recruiters</h3>
              <p>
                Query candidate capabilities via GraphRAG chat in seconds. Pitch qualified leaders with precision skill metrics 
                backed by verified project citations.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          6. PRICING & TIERS
          ============================================================ */}
      <section className="section-pricing" id="pricing">
        <div className="landing-content-container">
          <div className="section-header-centered">
            <div className="section-pill">
              <TrendingUp size={14} /> Transparent Pricing
            </div>
            <h2 className="section-title">Start screening candidates in minutes</h2>
            <p className="section-desc">Predictable pricing designed for ambitious technical teams.</p>
          </div>

          <div className="pricing-grid">
            {/* Tier 1 */}
            <div className="pricing-card">
              <div className="pricing-tier-title">Starter & Evaluation</div>
              <div className="pricing-price">
                <span className="price-amount">$0</span>
                <span className="price-term">/ free demo</span>
              </div>
              <p className="pricing-sub">Full access to test all features with immediate test credentials.</p>
              
              <ul className="pricing-feature-list">
                <li><Check size={15} /> Up to 25 Resume Parses / Month</li>
                <li><Check size={15} /> Directed Acyclic Graph Reasoning</li>
                <li><Check size={15} /> 2048-dim NVIDIA GPU Embeddings</li>
                <li><Check size={15} /> In-App Visual PDF Evidence Viewer</li>
                <li><Check size={15} /> GraphRAG Recruiter Assistant Chat</li>
              </ul>

              <button 
                type="button" 
                onClick={() => onOpenAuth('signup')} 
                className="btn-pricing-outline"
              >
                Start Free Trial
              </button>
            </div>

            {/* Tier 2 (Highlighted) */}
            <div className="pricing-card featured-pricing-card">
              <div className="pricing-featured-badge">MOST POPULAR</div>
              <div className="pricing-tier-title">Pro Recruiter</div>
              <div className="pricing-price">
                <span className="price-amount">$99</span>
                <span className="price-term">/ recruiter / mo</span>
              </div>
              <p className="pricing-sub">Designed for active talent teams and agency recruitment partners.</p>

              <ul className="pricing-feature-list">
                <li><Check size={15} /> Unlimited Candidate Ingestion</li>
                <li><Check size={15} /> Batch Uploads & Instant Parallel Ranking</li>
                <li><Check size={15} /> Fullscreen Annotated Resume Inspector</li>
                <li><Check size={15} /> High-Speed Groq LPU Inference</li>
                <li><Check size={15} /> Priority API Throughput</li>
                <li><Check size={15} /> Dedicated Recruiter Support</li>
              </ul>

              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="btn-pricing-primary"
              >
                Schedule Demo Walkthrough
              </button>
            </div>

            {/* Tier 3 */}
            <div className="pricing-card">
              <div className="pricing-tier-title">Enterprise ATS</div>
              <div className="pricing-price">
                <span className="price-amount">Custom</span>
                <span className="price-term">/ enterprise SLA</span>
              </div>
              <p className="pricing-sub">Custom domain ontologies, on-prem VPC hosting, and ATS connectors.</p>

              <ul className="pricing-feature-list">
                <li><Check size={15} /> Custom Internal Skill Graph Ontologies</li>
                <li><Check size={15} /> Workday / Greenhouse / Lever Connectors</li>
                <li><Check size={15} /> SAML 2.0 / Okta SSO & Admin Controls</li>
                <li><Check size={15} /> Dedicated On-Premises or Private Cloud</li>
                <li><Check size={15} /> 99.99% Uptime Guarantee</li>
              </ul>

              <button 
                type="button" 
                onClick={onOpenDemo} 
                className="btn-pricing-outline"
              >
                Contact Enterprise Sales
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          7. BOTTOM CTA STRIP
          ============================================================ */}
      <section className="section-bottom-cta">
        <div className="bottom-cta-box">
          <div className="cta-glow-element"></div>
          <h2>Ready to experience skill-first recruiting?</h2>
          <p>
            Lock in objective, explainable recruitment. Replace keyword blindness with real engineering comprehension today.
          </p>
          <div className="bottom-cta-actions">
            <button type="button" onClick={onOpenDemo} className="btn-hero-primary">
              Request a Live Demo
            </button>
            <button 
              type="button" 
              onClick={user ? onEnterWorkspace : () => onOpenAuth('login')} 
              className="btn-hero-secondary"
            >
              Launch ATS Workspace →
            </button>
          </div>
        </div>
      </section>
    </div>
  )
}
