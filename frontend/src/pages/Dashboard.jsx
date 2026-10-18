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
  HardDrive,
  FlaskConical,
  Gavel,
  Network,
  Crosshair,
  Sliders,
  Download,
  FileCheck2,
  ExternalLink,
  Flame,
  Send,
  Lock,
  Layers,
  Activity,
  AlertOctagon,
  Eye
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../context/CasesContext';
import { fetchDashboardStats } from '../services/api';
import CrimeMap from '../components/CrimeMap';
import { generateForensicPdfReport } from '../services/pdfReportGenerator';

// ==========================================
// 1. FIELD OFFICER DASHBOARD
// ==========================================
function FieldOfficerDashboard({ stats, cases }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge success" style={{ padding: '4px 10px', fontSize: '12px' }}>Field Terminal Active</span>
            <h2 className="page-title">Field Officer Dashboard</h2>
          </div>
          <p className="page-subtitle">
            Officer {user?.name || 'Insp. Rajesh Kumar'} ({user?.badge || 'NCB-8821'}) • {user?.station || 'Connaught Place PS, Delhi'}
          </p>
        </div>
        <Link to="/new-test" className="btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          <PlusCircle size={18} />
          <span>Start New Test (Camera)</span>
        </Link>
      </header>

      {/* Real-time Adulterant Safety Alert Banner */}
      <div style={{ padding: '14px 18px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '10px', marginBottom: '20px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <AlertOctagon size={20} color="#DC2626" style={{ marginTop: '2px', flexShrink: 0 }} />
        <div style={{ flex: 1 }}>
          <strong style={{ color: '#991B1B', fontSize: '13px' }}>
            Real-Time Adulterant Safety Alert: Fentanyl & Synthetic Opioid Spike
          </strong>
          <p style={{ color: '#7F1D1D', fontSize: '12px', margin: '4px 0 0 0' }}>
            Surveillance intelligence reports potent synthetic cutting agents (Fentanyl / Levamisole) in recent North Delhi and NCR seizures. Officers must utilize nitrile PPE gloves, avoid aerosol dispersion, and double-seal all 6 camera sample vials.
          </p>
        </div>
        <span className="badge danger" style={{ alignSelf: 'center' }}>Immediate SOP Priority</span>
      </div>

      {/* 4 KPI Stats Cards */}
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
            <Activity size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Optical Accuracy Meter</span>
            <strong className="stat-value">98.4%</strong>
            <span className="stat-trend positive">6 Ref Cards Calibrated</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <Clock size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending FSL Confirmatory</span>
            <strong className="stat-value">{stats.pendingReview}</strong>
            <span className="stat-trend neutral">Section 52A Pipeline</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <Users size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Field Units</span>
            <strong className="stat-value">{stats.activeOfficers}</strong>
            <span className="stat-trend positive">All units online</span>
          </div>
        </div>
      </div>

      {/* Accuracy Board & Officer Bindings Row */}
      <div className="content-responsive dashboard-content-grid" style={{ marginBottom: '24px' }}>
        {/* Accuracy Board & Trust Meter */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Accuracy Board & Optical Trust Meter</h3>
            <span className="badge success">Calibrated</span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px', marginTop: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Ambient Light Sensor</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>420 LUX (Optimal)</div>
              <div style={{ fontSize: '11px', color: '#16A34A' }}>Uniform Daylight Diffusion</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Reference Card Delta</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>ΔE = 0.28</div>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Tolerance Limit &lt; 0.50</div>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '8px', border: '1px solid var(--slate-200)' }}>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Multi-Frame Analysis</div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>5 Frames + Ref Card</div>
              <div style={{ fontSize: '11px', color: '#16A34A' }}>Reaction curve matched</div>
            </div>
          </div>
        </div>

        {/* Officer Bindings & Non-Repudiation */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Officer Bindings (NDPS Sec 52A)</h3>
            <span className="badge blue">Legally Bound</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '12px', fontSize: '12px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Officer Identifier:</span>
              <strong>{user?.id || 'FO12345'} ({user?.name || 'Insp. Rajesh Kumar'})</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
              <span style={{ color: 'var(--slate-500)' }}>GPS Telemetry:</span>
              <strong className="font-mono">28.6139° N, 77.2090° E (Locked)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid var(--slate-100)' }}>
              <span style={{ color: 'var(--slate-500)' }}>Independent Witness:</span>
              <strong style={{ color: '#16A34A' }}>Sh. Mohan Lal (Panch Witness Verified)</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
              <span style={{ color: 'var(--slate-500)' }}>SHA-256 Digital Seal:</span>
              <span className="badge success" style={{ fontSize: '10px' }}>Active Non-Repudiation Engine</span>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Field Tests Table + System Status */}
      <div className="content-responsive dashboard-content-grid">
        <section className="card recent-tests-section">
          <div className="section-header">
            <h3 className="section-title">Recent Field Seizure Tests</h3>
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
                  <th>Form 52A PDF</th>
                </tr>
              </thead>
              <tbody>
                {cases.slice(0, 5).map((item) => (
                  <tr key={item.id}>
                    <td>
                      <Link to="/cases" className="font-bold text-navy hover-link">
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
                      <span className="font-bold text-success">{item.confidence || 92}%</span>
                    </td>
                    <td>
                      <button
                        type="button"
                        className="btn-secondary"
                        style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                        onClick={() => generateForensicPdfReport(item)}
                      >
                        <Download size={12} />
                        <span>PDF 52A</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* System Status Aside */}
        <aside className="card system-status-card">
          <div className="section-header">
            <h3 className="section-title">Field Hardware Status</h3>
          </div>

          <div className="status-item-list">
            <div className="sys-status-row">
              <div className="sys-status-left">
                <HardDrive size={16} color="var(--primary-navy)" />
                <span>Forensic Enclave</span>
              </div>
              <span className="badge success">Ready</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Camera size={16} color="var(--primary-navy)" />
                <span>Camera Pipeline</span>
              </div>
              <span className="badge success">6-Frames Active</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Navigation size={16} color="var(--primary-navy)" />
                <span>GPS Telemetry</span>
              </div>
              <span className="badge success">Precision Locked</span>
            </div>

            <div className="sys-status-row">
              <div className="sys-status-left">
                <Wifi size={16} color="var(--primary-navy)" />
                <span>MHA Relay</span>
              </div>
              <span className="badge success">Online (Encrypted)</span>
            </div>
          </div>

          <div className="encryption-banner">
            <ShieldCheck size={18} color="var(--success-green)" />
            <div>
              <strong>Legal Form 52A Auto-Generator</strong>
              <p>Certified Section 52A PDF with Section 65B tamper-proof SHA-256 seal.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// 2. FORENSIC SCIENCE LABORATORY (FSL) DASHBOARD
// ==========================================
function FslDashboard({ cases }) {
  const { user } = useAuth();
  const [approvedCases, setApprovedCases] = useState({});

  const handleApprove = (caseId) => {
    setApprovedCases(prev => ({ ...prev, [caseId]: true }));
  };

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge warning" style={{ padding: '4px 10px', fontSize: '12px' }}>FSL Analytical Division</span>
            <h2 className="page-title">Forensic Science Laboratory (FSL) Command</h2>
          </div>
          <p className="page-subtitle">
            Analyst: {user?.name || 'Dr. Sunita Sharma'} ({user?.badge || 'FSL-412'}) • {user?.lab || 'Regional FSL, Rohini'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/fsl-calibration" className="btn-secondary" style={{ fontSize: '13px' }}>
            <Sliders size={14} />
            <span>Set Calibration</span>
          </Link>
          <Link to="/fsl" className="btn-primary" style={{ fontSize: '13px' }}>
            <FlaskConical size={14} />
            <span>Lab Verification Queue</span>
          </Link>
        </div>
      </header>

      {/* 4 FSL Stat Cards */}
      <div className="grid-responsive dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <FlaskConical size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending Lab Confirmatory</span>
            <strong className="stat-value">14 Samples</strong>
            <span className="stat-trend neutral">GC-MS / HPLC Queue</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Completed Confirmatory</span>
            <strong className="stat-value">114 Verified</strong>
            <span className="stat-trend positive">99.2% Field Concordance</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <Sliders size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Reagent Calibration Delta</span>
            <strong className="stat-value">ΔE = 0.28</strong>
            <span className="stat-trend positive">ISO/IEC 17025 Standard</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Digital Approvals Issued</span>
            <strong className="stat-value">96 Signed</strong>
            <span className="stat-trend positive">Sec 293 CrPC Validated</span>
          </div>
        </div>
      </div>

      {/* Main Content: Lab Report Validation Queue + Set Calibration Matrix */}
      <div className="content-responsive dashboard-content-grid">
        {/* Lab Report Validation Queue */}
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Lab Report Validation Queue (Confirmatory vs Presumptive)</h3>
              <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: '4px 0 0 0' }}>
                Comparison of field reagent chromatic reaction with confirmatory GC-MS spectral profiles.
              </p>
            </div>
            <Link to="/fsl" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Full Lab Queue
            </Link>
          </div>

          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Field Presumptive Result</th>
                  <th>Reagent Kit</th>
                  <th>Confirmatory GC-MS Profile</th>
                  <th>Purity & Adulterant</th>
                  <th>Digital Approval</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((c) => {
                  const isApproved = !!approvedCases[c.id];
                  return (
                    <tr key={c.id}>
                      <td className="font-bold text-navy">{c.id}</td>
                      <td>
                        <strong>{c.substance}</strong>
                        <br />
                        <small style={{ color: '#16A34A' }}>Confidence: {c.confidence || 92}%</small>
                      </td>
                      <td>{c.testKit || 'Scott Reagent'}</td>
                      <td>
                        <span className="badge blue" style={{ fontSize: '11px' }}>
                          GC-MS: {c.substance === 'Inconclusive' ? 'Analyzing Run #4' : `${c.substance} Base`}
                        </span>
                      </td>
                      <td>
                        <span style={{ fontSize: '12px', fontWeight: 600 }}>91.4% Purity</span>
                        <br />
                        <small style={{ color: 'var(--slate-500)' }}>Cutting: Levamisole (8.6%)</small>
                      </td>
                      <td>
                        {isApproved ? (
                          <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle2 size={12} /> Approved
                          </span>
                        ) : (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '5px 10px', fontSize: '11px', backgroundColor: '#D97706', borderColor: '#D97706' }}
                            onClick={() => handleApprove(c.id)}
                          >
                            <FileCheck2 size={12} />
                            <span>Digital Sign-Off</span>
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

        {/* Reagent QC & Calibration Aside */}
        <aside className="card">
          <div className="section-header">
            <h3 className="section-title">Reagent Sensitivity & Batch QC</h3>
            <Link to="/fsl-calibration" className="btn-text" style={{ fontSize: '12px' }}>Configure</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>Scott Reagent Lot #SC-88</strong>
                <span className="badge success">Active</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '4px' }}>
                Expiry: 28 Dec 2026 • Sensitivity: 99.2% • ΔE: 0.24
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>Marquis Reagent Lot #MQ-41</strong>
                <span className="badge success">Active</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '4px' }}>
                Expiry: 15 Jan 2027 • Sensitivity: 98.6% • ΔE: 0.31
              </div>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <strong style={{ fontSize: '12px' }}>Mandelin Reagent Lot #MD-19</strong>
                <span className="badge success">Active</span>
              </div>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '4px' }}>
                Expiry: 04 Nov 2026 • Sensitivity: 97.9% • ΔE: 0.38
              </div>
            </div>
          </div>

          <div className="encryption-banner" style={{ marginTop: '16px' }}>
            <ShieldCheck size={18} color="#D97706" />
            <div>
              <strong>Digital Signature Key Active</strong>
              <p>FSL digital signature stamp complies with Section 293 CrPC evidentiary standards.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// 3. ZONAL POLICE / HQ DASHBOARD
// ==========================================
function ZonalHqDashboard({ cases }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge blue" style={{ padding: '4px 10px', fontSize: '12px' }}>Zonal Command HQ</span>
            <h2 className="page-title">Zonal Police Headquarters • Strategic NDPS Command</h2>
          </div>
          <p className="page-subtitle">
            Commander: {user?.name || 'Comm. Vikram Singh'} ({user?.badge || 'HQ-087'}) • {user?.zone || 'Northern Zone'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/crime-map" className="btn-secondary" style={{ fontSize: '13px' }}>
            <Crosshair size={14} />
            <span>Fullscreen Crime Map</span>
          </Link>
          <Link to="/inquiry" className="btn-primary" style={{ fontSize: '13px' }}>
            <Send size={14} />
            <span>Push Cases to Court</span>
          </Link>
        </div>
      </header>

      {/* 4 HQ Stat Cards */}
      <div className="grid-responsive dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <Crosshair size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Active Zonal Interceptions</span>
            <strong className="stat-value">{cases.length} Seizures</strong>
            <span className="stat-trend positive">100% Geotagged</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Contraband Intercepted</span>
            <strong className="stat-value">184.6 kg</strong>
            <span className="stat-trend positive">Est. Value ₹84.2 Cr</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <Network size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Syndicate Corridors Tracked</span>
            <strong className="stat-value">5 Corridors</strong>
            <span className="stat-trend neutral">NH-44 / NH-48 Active</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <Gavel size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Ready for Court Docket</span>
            <strong className="stat-value">6 Cases</strong>
            <span className="stat-trend positive">Sec 52A Form Complete</span>
          </div>
        </div>
      </div>

      {/* EMBEDDED GOOGLE MAPS / CRIME MAP INTEGRATION */}
      <div style={{ marginBottom: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: 700, margin: 0, color: 'var(--slate-900)' }}>
              Zonal NDPS Seizure Crime Map (Google Maps Enabled)
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
              Live telemetry and GPS coordinates of all field seizures across Northern & Western jurisdictions.
            </p>
          </div>
          <Link to="/crime-map" className="btn-secondary" style={{ fontSize: '12px', padding: '6px 12px' }}>
            <ExternalLink size={12} />
            <span>Open Expanded Map</span>
          </Link>
        </div>

        <CrimeMap height="420px" showFilters={true} showKeyModal={true} />
      </div>

      {/* Inquiry Intelligence + Decision & Push to Court */}
      <div className="content-responsive dashboard-content-grid">
        <section className="card">
          <div className="section-header">
            <h3 className="section-title">Inquiry & Cross-Case Intelligence Feed</h3>
            <Link to="/inquiry" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Investigate
            </Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '14px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px' }}>Correlated Transit Match #TR-8812</strong>
                <span className="badge danger">High Risk</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)' }}>
                Seizure #NDPS-2026-001234 (Connaught Place, Cocaine) shares chemical adulterant signature with Western Zone consignment.
              </p>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                <strong style={{ fontSize: '13px' }}>Synthetic Precursor Cluster #SYN-UDAIPUR</strong>
                <span className="badge warning">Moderate Risk</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)' }}>
                Methamphetamine crystallization signature flagged at Udaipur checkpost matched to interstate pharmaceutical leakage.
              </p>
            </div>
          </div>
        </section>

        {/* Decision & Court Push Queue */}
        <section className="card">
          <div className="section-header">
            <h3 className="section-title">Section 52A Decision & Court Transmission</h3>
            <Link to="/inquiry" className="btn-text" style={{ fontSize: '12px' }}>View Queue</Link>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '14px' }}>
            {cases.slice(0, 3).map((item) => (
              <div key={item.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 12px', borderRadius: '6px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                <div>
                  <strong style={{ fontSize: '13px', color: 'var(--primary-navy)' }}>{item.id}</strong>
                  <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{item.substance} • {item.location}</div>
                </div>
                <Link
                  to="/inquiry"
                  className="btn-primary"
                  style={{ padding: '4px 8px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <Send size={11} />
                  <span>Push to Court</span>
                </Link>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

// ==========================================
// 4. COURT / JUDICIARY DASHBOARD
// ==========================================
function CourtDashboard({ cases }) {
  const { user } = useAuth();

  return (
    <div className="dashboard-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span className="badge purple" style={{ padding: '4px 10px', fontSize: '12px', backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
              Special NDPS Judicial Bench
            </span>
            <h2 className="page-title">Special NDPS Court • Pre-Trial Evidence Bench</h2>
          </div>
          <p className="page-subtitle">
            Judge: {user?.name || 'Justice Amitabh Kant'} ({user?.badge || 'JDG-021'}) • {user?.court || 'Special Court No. 4, Delhi'}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <Link to="/court-docket" className="btn-secondary" style={{ fontSize: '13px' }}>
            <Flame size={14} />
            <span>Disposal Orders (52A)</span>
          </Link>
          <Link to="/court-docket" className="btn-primary" style={{ fontSize: '13px', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}>
            <Gavel size={14} />
            <span>Pre-Trial Docket</span>
          </Link>
        </div>
      </header>

      {/* 4 Judicial Stat Cards */}
      <div className="grid-responsive dashboard-stats">
        <div className="card stat-card">
          <div className="stat-icon-wrapper purple" style={{ backgroundColor: '#F3E8FF', color: '#7C3AED' }}>
            <Gavel size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Cases on Active Docket</span>
            <strong className="stat-value">18 Trials</strong>
            <span className="stat-trend positive">Pre-trial stage</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <Flame size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Sec 52A Disposal Applications</span>
            <strong className="stat-value">7 Pending</strong>
            <span className="stat-trend neutral">Representative Samples Preserved</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Digital Hash Authenticated</span>
            <strong className="stat-value">100%</strong>
            <span className="stat-trend positive">Sec 65B Indian Evidence Act</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <CheckCircle2 size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Judicially Disposed Contraband</span>
            <strong className="stat-value">142.8 kg</strong>
            <span className="stat-trend positive">Certified Destruction</span>
          </div>
        </div>
      </div>

      {/* Main Judicial Docket & Section 52A Pre-Trial Review */}
      <div className="content-responsive dashboard-content-grid">
        <section className="card">
          <div className="section-header">
            <div>
              <h3 className="section-title">Pre-Trial Certified Evidence Dossiers</h3>
              <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: '4px 0 0 0' }}>
                Form 52A Seizure Inventory, Section 65B Digital Certificates, and Chain of Custody.
              </p>
            </div>
            <Link to="/court-docket" className="btn-secondary" style={{ padding: '6px 12px', fontSize: '12px' }}>
              Full Court Docket
            </Link>
          </div>

          <div className="table-container" style={{ marginTop: '16px' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Case ID</th>
                  <th>Substance</th>
                  <th>Seizure Station</th>
                  <th>Section 65B Seal</th>
                  <th>Legal Status</th>
                  <th>Judicial Review</th>
                </tr>
              </thead>
              <tbody>
                {cases.map((item) => (
                  <tr key={item.id}>
                    <td className="font-bold text-navy">{item.id}</td>
                    <td><strong>{item.substance}</strong></td>
                    <td>{item.station || item.location}</td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '11px' }}>
                        {item.digitalSeal ? `${item.digitalSeal.slice(0, 16)}...` : 'SHA256:Valid'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '4px 8px', fontSize: '11px' }}
                          onClick={() => generateForensicPdfReport(item)}
                        >
                          <Download size={11} />
                          <span>Form 52A</span>
                        </button>
                        <Link
                          to="/court-docket"
                          className="btn-primary"
                          style={{ padding: '4px 8px', fontSize: '11px', backgroundColor: '#7C3AED', borderColor: '#7C3AED' }}
                        >
                          <Gavel size={11} />
                          <span>Adjudicate</span>
                        </Link>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 52A Judicial Mandate Info Aside */}
        <aside className="card">
          <div className="section-header">
            <h3 className="section-title">Section 52A Judicial Mandate</h3>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px', fontSize: '12px', color: 'var(--slate-700)' }}>
            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <strong style={{ color: 'var(--slate-900)' }}>1. Inventory Certification:</strong>
              <p style={{ margin: '4px 0 0 0', color: 'var(--slate-600)' }}>
                Magistrate certifies the correctness of the inventory prepared under Section 52A(2)(a).
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <strong style={{ color: 'var(--slate-900)' }}>2. Representative Samples:</strong>
              <p style={{ margin: '4px 0 0 0', color: 'var(--slate-600)' }}>
                Representative samples drawn in the presence of the Magistrate and certified under Section 52A(2)(b).
              </p>
            </div>

            <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
              <strong style={{ color: 'var(--slate-900)' }}>3. Certified Primary Evidence:</strong>
              <p style={{ margin: '4px 0 0 0', color: 'var(--slate-600)' }}>
                Certified inventory and photographs treated as primary evidence in trial under Section 52A(4).
              </p>
            </div>
          </div>

          <div className="encryption-banner" style={{ marginTop: '16px' }}>
            <Lock size={18} color="#7C3AED" />
            <div>
              <strong>Judicial Evidence Vault Locked</strong>
              <p>Tamper-proof digital seal guarantees non-repudiation during trial proceedings.</p>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

// ==========================================
// MAIN DASHBOARD COMPONENT (DYNAMIC ROUTER)
// ==========================================
export default function Dashboard() {
  const { user } = useAuth();
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

  // Dynamically mount dedicated role dashboard
  switch (user?.roleKey) {
    case 'FSL_LAB':
      return <FslDashboard cases={cases} />;
    case 'ZONAL_HQ':
      return <ZonalHqDashboard cases={cases} />;
    case 'COURT':
      return <CourtDashboard cases={cases} />;
    case 'FIELD_OFFICER':
    default:
      return <FieldOfficerDashboard stats={stats} cases={cases} />;
  }
}
