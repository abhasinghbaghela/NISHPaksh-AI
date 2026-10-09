import React from 'react';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  ShieldAlert,
  Activity
} from 'lucide-react';

export default function Analytics() {
  const substanceBreakdown = [
    { name: 'Cocaine / Alkaloids (Scott Test)', count: 48, percent: 37.5, color: '#0B3C8C' },
    { name: 'Methamphetamine (Mandelin Test)', count: 36, percent: 28.1, color: '#138808' },
    { name: 'Opiates / Heroin (Marquis Test)', count: 28, percent: 21.8, color: '#7C3AED' },
    { name: 'Synthetic Cannabinoids / Others', count: 16, percent: 12.6, color: '#F59E0B' }
  ];

  const regionalData = [
    { zone: 'Northern Zone (Delhi / NCR)', tests: 54, verified: 51 },
    { zone: 'Western Zone (Mumbai / Goa)', tests: 42, verified: 38 },
    { zone: 'Southern Zone (Chennai / Bangalore)', tests: 32, verified: 30 }
  ];

  return (
    <div className="analytics-container">
      <header className="page-header">
        <div>
          <h2 className="page-title">Forensic Field Intelligence & Analytics</h2>
          <p className="page-subtitle">Aggregate data on narcotics field detection, reagent efficacy, and regional trends.</p>
        </div>
      </header>

      {/* Overview Cards */}
      <div className="grid-responsive" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <Activity size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Total Field Tests</span>
            <strong className="stat-value">128</strong>
            <span className="stat-trend positive">+14% this month</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <TrendingUp size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Reagent Specificity</span>
            <strong className="stat-value">98.4%</strong>
            <span className="stat-trend positive">Calibrated</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <ShieldAlert size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">High-Risk Seizures</span>
            <strong className="stat-value">24</strong>
            <span className="stat-trend neutral">Commercial quantity</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <PieChart size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Reference Card Compliance</span>
            <strong className="stat-value">100%</strong>
            <span className="stat-trend positive">Optical baseline active</span>
          </div>
        </div>
      </div>

      {/* Breakdown Grids */}
      <div className="content-responsive">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Substance Presumption Distribution</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {substanceBreakdown.map((s, i) => (
              <div key={i}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '6px' }}>
                  <strong>{s.name}</strong>
                  <span>{s.count} cases ({s.percent}%)</span>
                </div>
                <div style={{ height: '8px', background: 'var(--slate-200)', borderRadius: '999px', overflow: 'hidden' }}>
                  <div style={{ height: '100%', width: `${s.percent}%`, background: s.color, borderRadius: '999px' }} />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Zonal Verification Rates</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {regionalData.map((r, i) => (
              <div key={i} style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                <strong style={{ fontSize: '13px', display: 'block', marginBottom: '4px' }}>{r.zone}</strong>
                <span style={{ fontSize: '12px', color: 'var(--slate-600)' }}>
                  {r.verified} of {r.tests} verified by FSL ({Math.round(r.verified / r.tests * 100)}%)
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-container {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
