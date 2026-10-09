import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  PlusCircle,
  ShieldCheck,
  Clock,
  AlertTriangle,
  Users,
  CheckCircle2,
  Camera,
  Navigation,
  Wifi,
  HardDrive
} from 'lucide-react';
import { useCases } from '../context/CasesContext';
import { fetchDashboardStats } from '../services/api';

export default function Dashboard() {
  const { cases } = useCases();
  const [stats, setStats] = useState({
    testsConducted: 128,
    verifiedCases: 114,
    pendingReview: 14,
    activeOfficers: 42
  });

  useEffect(() => {
    fetchDashboardStats().then(data => {
      if (data && data.stats) setStats(data.stats);
    });
  }, []);

  return (
    <div className="dashboard-container">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <h2 className="page-title">Field Officer Dashboard</h2>
          <p className="page-subtitle">Monitor field drug testing, evidence custody and case records.</p>
        </div>
        <Link to="/new-test" className="btn-primary">
          <PlusCircle size={18} />
          <span>Start New Test</span>
        </Link>
      </header>

      {/* 4 Stat Cards */}
      <div className="grid-responsive dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Tests Conducted</span>
            <strong className="stat-value">{stats.testsConducted}</strong>
            <span className="stat-trend positive">+8 this week</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Verified Cases</span>
            <strong className="stat-value">{stats.verifiedCases}</strong>
            <span className="stat-trend positive">91.2% verified</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Review</span>
            <strong className="stat-value">{stats.pendingReview}</strong>
            <span className="stat-trend neutral">FSL pipeline</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Field Units</span>
            <strong className="stat-value">{stats.activeOfficers}</strong>
            <span className="stat-trend positive">All online</span>
          </div>
        </div>
      </div>

      {/* Main Content: Recent Tests Table + System Status */}
      <div className="content-responsive dashboard-content-grid">
        {/* Left: Recent Tests Table */}
        <section className="card recent-tests-section">
          <div className="section-header">
            <h3 className="section-title">Recent Field Tests</h3>
            <Link to="/cases" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              View All Cases
            </Link>
          </div>

          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Date & Time</th>
                  <th>Location</th>
                  <th>Substance</th>
                  <th>Confidence</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to={`/cases`} className="font-bold text-navy hover-link">
                        {item.id}
                      </Link>
                    </td>
                    <td>
                      <span>{item.date}</span>
                      <br />
                      <small className="text-muted">{item.time}</small>
                    </td>
                    <td>{item.location}</td>
                    <td><strong>{item.substance}</strong></td>
                    <td>
                      <span className="font-bold">{item.confidence || 92}%</span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Right: System Status Card */}
        <aside className="card system-status-card">
          <div className="section-header">
            <h3 className="section-title">System Status</h3>
          </div>

          <div className="status-item-list">
            <div className="sys-status-row">
              <div className="sys-status-left">
                <HardDrive size={16} color="var(--primary-navy)" />
                <span>Forensic Device</span>
              </div>
              <span className="badge success">Ready</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Camera size={16} color="var(--primary-navy)" />
                <span>Camera Pipeline</span>
              </div>
              <span className="badge success">Connected</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Navigation size={16} color="var(--primary-navy)" />
                <span>GPS Telemetry</span>
              </div>
              <span className="badge success">Available</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Wifi size={16} color="var(--primary-navy)" />
                <span>MHA Network</span>
              </div>
              <span className="badge success">Online</span>
            </div>
          </div>

          <div className="encryption-banner">
            <ShieldCheck size={18} color="var(--success-green)" />
            <div>
              <strong>Digital Seal Engine Active</strong>
              <p>All photos signed with SHA-256 for non-repudiation in court.</p>
            </div>
          </div>
        </aside>
      </div>

      <style>{`
        .dashboard-container {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }

        .dashboard-stats {
          margin-bottom: 24px;
        }

        .stat-card {
          padding: 20px;
          display: flex;
          align-items: center;
          gap: 16px;
        }

        .stat-icon-wrapper {
          width: 48px;
          height: 48px;
          border-radius: var(--radius-md);
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .stat-icon-wrapper.blue { background: #EFF6FF; color: #2563EB; }
        .stat-icon-wrapper.green { background: #ECFDF5; color: #059669; }
        .stat-icon-wrapper.amber { background: #FFFBEB; color: #D97706; }
        .stat-icon-wrapper.navy { background: #E7EFFB; color: #0B3C8C; }

        .stat-content {
          display: flex;
          flex-direction: column;
        }

        .stat-label {
          font-size: 12px;
          font-weight: 600;
          color: var(--slate-500);
        }

        .stat-value {
          font-size: 24px;
          font-weight: 800;
          color: var(--slate-900);
          line-height: 1.2;
          margin: 2px 0;
        }

        .stat-trend {
          font-size: 11px;
          font-weight: 600;
        }

        .stat-trend.positive { color: var(--success-green); }
        .stat-trend.neutral { color: var(--slate-500); }

        .dashboard-content-grid {
          margin-top: 10px;
        }

        .recent-tests-section {
          padding: 24px;
        }

        .section-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 20px;
        }

        .section-title {
          font-size: 16px;
          font-weight: 800;
          color: var(--slate-900);
        }

        .system-status-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 18px;
        }

        .status-item-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .sys-status-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 14px;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
        }

        .sys-status-left {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          font-weight: 600;
          color: var(--slate-700);
        }

        .encryption-banner {
          display: flex;
          gap: 10px;
          background: var(--success-bg);
          border: 1px solid #BBF7D0;
          border-radius: var(--radius-md);
          padding: 14px;
          font-size: 12px;
          color: #166534;
        }

        .encryption-banner strong {
          display: block;
          margin-bottom: 2px;
        }

        .hover-link:hover {
          text-decoration: underline;
        }
      `}</style>
    </div>
  );
}
