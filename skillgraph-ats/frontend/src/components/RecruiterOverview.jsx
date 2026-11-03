import React, { useState } from 'react'
import { 
  Briefcase, 
  Users, 
  BarChart3, 
  Calendar, 
  MoreVertical, 
  TrendingUp, 
  Filter, 
  Sparkles,
  ArrowRight,
  ExternalLink,
  CheckCircle2
} from 'lucide-react'

export default function RecruiterOverview({ onSelectCandidate, onNavigateToMatcher, onNavigateToChat }) {
  const [timeframe, setTimeframe] = useState('week') // 'week' | 'month'

  const candidates = [
    {
      id: 'c1',
      name: 'Rohan Sahu',
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=120&h=120&q=80',
      role: 'SDE II',
      roleType: 'sde',
      score: 95,
      competencies: 'Kubernetes, Docker, Terraform',
      date: 'Jun 21',
      details: {
        experience: '4.5 Years',
        matched: ['Kubernetes', 'Docker', 'Terraform', 'Container Orchestration', 'Microservices'],
        adjacent: ['Helm', 'Prometheus', 'AWS ECS'],
        summary: 'Deep architectural experience building resilient multi-cloud container pipelines.'
      }
    },
    {
      id: 'c2',
      name: 'Aditi Pradhan',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=120&h=120&q=80',
      role: 'Platform Engineer',
      roleType: 'platform',
      score: 92,
      competencies: 'AWS, CI/CD, IaC',
      date: 'Jun 1',
      details: {
        experience: '5.0 Years',
        matched: ['AWS CloudFormation', 'Terraform', 'GitHub Actions', 'ArgoCD'],
        adjacent: ['Security Hardening', 'VPC Peering'],
        summary: 'Platform automation specialist with high expertise in infrastructure as code and declarative deployments.'
      }
    },
    {
      id: 'c3',
      name: 'Sumit Kar',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=120&h=120&q=80',
      role: 'DevOps Engineer',
      roleType: 'devops',
      score: 89,
      competencies: 'Kubernetes, Helm, Linux',
      date: 'May 16',
      details: {
        experience: '3.8 Years',
        matched: ['Kubernetes', 'Helm Charts', 'Linux Kernel Tuning', 'Bash', 'Prometheus'],
        adjacent: ['eBPF', 'Kafka'],
        summary: 'Production reliability engineer focused on Linux systems internals and Kubernetes observability.'
      }
    },
    {
      id: 'c4',
      name: 'Mehul Das',
      avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=120&h=120&q=80',
      role: 'SDE II',
      roleType: 'sde',
      score: 88,
      competencies: 'GCP, Docker, Observability',
      date: 'May 2',
      details: {
        experience: '4.0 Years',
        matched: ['Google Cloud Platform', 'Docker', 'OpenTelemetry', 'Jaeger', 'Golang'],
        adjacent: ['Distributed Tracing', 'Istio'],
        summary: 'Full-stack systems developer with proven track record in microservices telemetry and distributed tracing.'
      }
    }
  ]

  const petals = [
    { name: 'Cloud', score: 92, color: '#22c55e', bg: 'rgba(34, 197, 94, 0.12)' },
    { name: 'DevOps', score: 89, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
    { name: 'Backend', score: 87, color: '#8b5cf6', bg: 'rgba(139, 92, 246, 0.12)' },
    { name: 'Security', score: 74, color: '#7c3aed', bg: 'rgba(124, 58, 237, 0.12)' },
    { name: 'Data', score: 68, color: '#6366f1', bg: 'rgba(99, 102, 241, 0.12)' },
    { name: 'AI/ML', score: 61, color: '#a855f7', bg: 'rgba(168, 85, 247, 0.12)' },
  ]

  return (
    <div className="recruiter-overview-page">
      {/* Top Section: Pool KPI & Match Target */}
      <div className="overview-kpi-row">
        {/* Left Big Card: Talent Pool */}
        <div className="talent-pool-card">
          <div className="talent-pool-count">1,248</div>
          <div className="talent-pool-label">candidates in your talent pool</div>
        </div>

        {/* Right Card: Average Skill Match Progress Bar */}
        <div className="skill-match-target-card">
          <div className="target-card-header">
            <div className="target-stat-left">
              <span className="target-percent">86.7%</span>
              <span className="target-label">average skill match</span>
            </div>
            <div className="target-badge-pill">
              <TrendingUp size={14} /> 12.4% closer to your hiring target
            </div>
          </div>

          <div className="target-progress-wrapper">
            <div className="target-progress-track">
              <div className="target-progress-fill" style={{ width: '86.7%' }}>
                <span className="target-progress-val">86.7%</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Middle Metric Cards (Active Jobs, Shortlisted, Interview Conversion) */}
      <div className="metrics-triad-row">
        {/* Metric 1 */}
        <div className="triad-metric-card">
          <div className="triad-card-inner">
            <span className="triad-label">Active jobs</span>
            <div className="triad-content-row">
              <div className="triad-icon-box box-purple">
                <Briefcase size={20} />
              </div>
              <div className="triad-number">12</div>
              <div className="triad-growth-pill">+3 this month</div>
            </div>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="triad-metric-card">
          <div className="triad-card-inner">
            <span className="triad-label">Shortlisted</span>
            <div className="triad-content-row">
              <div className="triad-icon-box box-purple">
                <Users size={20} />
              </div>
              <div className="triad-number">128</div>
              <div className="triad-growth-pill">+18% this week</div>
            </div>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="triad-metric-card">
          <div className="triad-card-inner">
            <span className="triad-label">Interview conversion</span>
            <div className="triad-content-row">
              <div className="triad-icon-box box-purple">
                <BarChart3 size={20} />
              </div>
              <div className="triad-number">65%</div>
              <div className="triad-growth-pill">+8% this month</div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Section: Top Candidate Matches + Skill Coverage */}
      <div className="overview-split-row">
        {/* Left Column: Top candidate matches Table */}
        <div className="candidate-matches-card">
          <div className="matches-card-header">
            <div className="matches-heading-wrap">
              <h3 className="matches-title">Top candidate matches</h3>
              <span className="matches-sub-count">128 shortlisted candidates</span>
            </div>

            <div className="matches-tabs">
              <button 
                type="button" 
                className={`matches-tab-btn ${timeframe === 'week' ? 'active' : ''}`}
                onClick={() => setTimeframe('week')}
              >
                Week
              </button>
              <button 
                type="button" 
                className={`matches-tab-btn ${timeframe === 'month' ? 'active' : ''}`}
                onClick={() => setTimeframe('month')}
              >
                Month
              </button>
            </div>
          </div>

          {/* Table */}
          <div className="matches-table-wrapper">
            <table className="matches-table">
              <thead>
                <tr>
                  <th>Candidate</th>
                  <th>Role / Applied For</th>
                  <th>Skill Match</th>
                  <th>Key Competencies</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {candidates.map((cand) => {
                  // Circular stroke calculation for radial percent
                  const r = 16
                  const circ = 2 * Math.PI * r
                  const strokeOffset = circ - (cand.score / 100) * circ

                  return (
                    <tr 
                      key={cand.id} 
                      className="candidate-row"
                      onClick={() => onSelectCandidate && onSelectCandidate(cand)}
                      title="Click to view candidate evidence & inspect"
                    >
                      <td className="cand-info-cell">
                        <img src={cand.avatar} alt={cand.name} className="cand-table-avatar" />
                        <span className="cand-table-name">{cand.name}</span>
                      </td>

                      <td>
                        <span className={`role-tag-pill tag-${cand.roleType}`}>
                          {cand.role}
                        </span>
                      </td>

                      <td className="score-cell">
                        <div className="radial-score-wrap">
                          <svg width="40" height="40" viewBox="0 0 40 40" className="radial-score-svg">
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="rgba(168, 85, 247, 0.15)"
                              strokeWidth="3.5"
                            />
                            <circle
                              cx="20"
                              cy="20"
                              r={r}
                              fill="transparent"
                              stroke="#8b5cf6"
                              strokeWidth="3.5"
                              strokeDasharray={circ}
                              strokeDashoffset={strokeOffset}
                              strokeLinecap="round"
                              transform="rotate(-90 20 20)"
                            />
                          </svg>
                          <span className="radial-score-text">{cand.score}%</span>
                        </div>
                      </td>

                      <td className="competencies-cell">
                        <span className="competencies-text">{cand.competencies}</span>
                      </td>

                      <td className="date-cell">
                        <span className="date-wrap">
                          <Calendar size={13} /> {cand.date}
                        </span>
                      </td>

                      <td className="actions-cell">
                        <button 
                          type="button" 
                          className="btn-row-action"
                          onClick={(e) => {
                            e.stopPropagation()
                            if (onNavigateToMatcher) onNavigateToMatcher(cand)
                          }}
                          title="Open in In-App PDF Matcher"
                        >
                          <MoreVertical size={16} />
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div className="matches-card-footer">
            <span className="purple-note-annotation">
              ✍️ Candidates ranked by competencies, not keywords
            </span>
            <button 
              type="button" 
              onClick={() => onNavigateToMatcher && onNavigateToMatcher()} 
              className="btn-view-all-matcher"
            >
              Open ATS Match Engine <ArrowRight size={14} />
            </button>
          </div>
        </div>

        {/* Right Column: Skill Coverage Petal Chart */}
        <div className="skill-coverage-card">
          <div className="coverage-card-header">
            <h3 className="coverage-title">Skill coverage</h3>
            <button type="button" className="btn-coverage-filter">
              <Filter size={13} /> Filter
            </button>
          </div>

          <div className="coverage-chart-container">
            {/* Flower / Petals Radial Visualization matching image */}
            <div className="petals-flower-wrap">
              {/* Central Equalizer Icon Node */}
              <div className="flower-center-hub">
                <div className="center-hub-icon">
                  <span className="hub-bar h-1"></span>
                  <span className="hub-bar h-2"></span>
                  <span className="hub-bar h-3"></span>
                </div>
              </div>

              {/* 6 Radial Petals matching image */}
              <div className="petal petal-top">
                <span className="petal-percent">92%</span>
                <span className="petal-name">Cloud</span>
              </div>

              <div className="petal petal-top-right">
                <span className="petal-percent">89%</span>
                <span className="petal-name">DevOps</span>
              </div>

              <div className="petal petal-bottom-right">
                <span className="petal-percent">87%</span>
                <span className="petal-name">Backend</span>
              </div>

              <div className="petal petal-bottom">
                <span className="petal-percent">74%</span>
                <span className="petal-name">Security</span>
              </div>

              <div className="petal petal-bottom-left">
                <span className="petal-percent">68%</span>
                <span className="petal-name">Data</span>
              </div>

              <div className="petal petal-top-left">
                <span className="petal-percent">61%</span>
                <span className="petal-name">AI/ML</span>
              </div>
            </div>
          </div>

          <div className="coverage-card-footer">
            <span className="purple-note-annotation">
              ✍️ Knowledge graph reveals adjacent skills
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}

