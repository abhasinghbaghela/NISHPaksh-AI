import React, { useState } from 'react';
import {
  MapPin,
  Crosshair,
  Filter,
  Layers,
  ShieldCheck,
  AlertTriangle,
  Download,
  Share2,
  Calendar,
  Search
} from 'lucide-react';
import CrimeMap, { SUBSTANCE_COLORS } from '../components/CrimeMap';
import { useCases } from '../context/CasesContext';

export default function CrimeMapPage() {
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedZone, setSelectedZone] = useState('All');

  // Stats
  const totalSeizures = cases.length;
  const highRiskCount = cases.filter(c => c.confidence > 80).length;
  const pendingCount = cases.filter(c => c.status === 'Pending FSL').length;

  return (
    <div className="crime-map-page-container">
      {/* Page Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Crosshair size={22} className="text-navy" />
            <h2 className="page-title">NDPS Geo-Intelligence & Crime Map</h2>
          </div>
          <p className="page-subtitle">
            Geospatial tracking of narcotic seizures, transit corridor analytics, and field interception telemetry under Section 52A.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-secondary"
            onClick={() => window.print()}
            style={{ fontSize: '12px' }}
          >
            <Download size={14} />
            <span>Export Map Brief</span>
          </button>
        </div>
      </header>

      {/* KPI Stats Bar */}
      <div className="grid-responsive dashboard-stats" style={{ marginBottom: '20px' }}>
        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <MapPin size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Geotagged Seizures</span>
            <strong className="stat-value">{totalSeizures} Active</strong>
            <span className="stat-trend positive">100% GPS Locked</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <ShieldCheck size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">High-Confidence Interceptions</span>
            <strong className="stat-value">{highRiskCount} Verified</strong>
            <span className="stat-trend positive">Calibrated optical match</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <AlertTriangle size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Pending FSL Confirmatory</span>
            <strong className="stat-value">{pendingCount} Samples</strong>
            <span className="stat-trend neutral">Under lab pipeline</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <Layers size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Monitored Corridors</span>
            <strong className="stat-value">5 Sectors</strong>
            <span className="stat-trend positive">NH-44 & Border Checkposts</span>
          </div>
        </div>
      </div>

      {/* Interactive Crime Map Component */}
      <CrimeMap height="580px" showFilters={true} showKeyModal={true} />

      {/* Corridor Intelligence & Hotspot Summary */}
      <div className="content-responsive dashboard-content-grid" style={{ marginTop: '24px' }}>
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Interstate Transit Corridor Insights</h3>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px', marginTop: '12px' }}>
            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--slate-900)' }}>Northern Trunk Line (NH-44)</strong>
                <span className="badge danger">High Risk</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)', marginBottom: '8px' }}>
                Consecutive heroin & methamphetamine seizures intercepted between Punjab border checkpost and Outer Ring Road Delhi.
              </p>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                Telemetry: 28.6139° N, 77.2090° E • 3 Seizures
              </div>
            </div>

            <div style={{ padding: '14px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                <strong style={{ fontSize: '13px', color: 'var(--slate-900)' }}>Western Highway Checkpost (NH-48)</strong>
                <span className="badge warning">Moderate Risk</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)', marginBottom: '8px' }}>
                Synthetics and cocaine consignments flagged via Mandelin reagent testing at Jaipur and Udaipur logistics hubs.
              </p>
              <div style={{ fontSize: '11px', color: 'var(--slate-500)', fontFamily: 'monospace' }}>
                Telemetry: 26.9124° N, 75.7873° E • 2 Seizures
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Substance Color Legend</h3>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginTop: '12px' }}>
            {Object.entries(SUBSTANCE_COLORS).map(([name, color]) => (
              <div key={name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: color }} />
                  <span style={{ fontWeight: 600 }}>{name}</span>
                </div>
                <span style={{ color: 'var(--slate-500)', fontSize: '11px' }}>
                  {cases.filter(c => (c.substance || '').toLowerCase() === name.toLowerCase()).length} Cases
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
