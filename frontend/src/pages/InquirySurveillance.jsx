import React, { useState } from 'react';
import {
  Search,
  Network,
  Share2,
  AlertTriangle,
  ShieldCheck,
  Send,
  FileCheck2,
  Users,
  MapPin,
  CheckCircle2
} from 'lucide-react';
import { useCases } from '../context/CasesContext';
import { Link } from 'react-router-dom';

export default function InquirySurveillance() {
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCase, setSelectedCase] = useState(cases[0] || null);
  const [pushedToCourt, setPushedToCourt] = useState({});
  const [alertNotice, setAlertNotice] = useState(null);

  const handlePushToCourt = (caseItem) => {
    setPushedToCourt(prev => ({
      ...prev,
      [caseItem.id]: true
    }));
    setAlertNotice(`Case ${caseItem.id} has been cryptographically signed and transmitted to Special NDPS Court Docket No. 4.`);
    setTimeout(() => setAlertNotice(null), 5000);
  };

  return (
    <div className="inquiry-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Network size={22} className="text-navy" />
            <h2 className="page-title">Zonal Intelligence & Syndicate Inquiry</h2>
          </div>
          <p className="page-subtitle">
            Cross-case forensic matching, distribution network analysis, and Section 52A court dispatch.
          </p>
        </div>

        <Link to="/crime-map" className="btn-primary" style={{ fontSize: '13px' }}>
          <MapPin size={14} />
          <span>Open Live Crime Map</span>
        </Link>
      </header>

      {alertNotice && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{alertNotice}</span>
        </div>
      )}

      {/* Grid: Correlated Intelligence Feed + Decision Action */}
      <div className="content-responsive dashboard-content-grid">
        {/* Left: Intelligence Network Matches */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Automated Cross-Case Chemical Correlation</h3>
            <span className="badge blue">AI Forensic Linking</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px' }}>
            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--slate-900)' }}>Synthetic Cluster #SYN-DELHI-09</strong>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Matched Reagent Profile: Mandelin / Crystal Matrix</div>
                </div>
                <span className="badge danger">High Correlation (96%)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)', marginBottom: '10px' }}>
                Spectral signature identical between Seizure NDPS-2026-001232 (Udaipur City Checkpost) and New Delhi Railway Cargo consignments.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge neutral" style={{ fontSize: '10px' }}>Common Carrier: Intercity Logistics</span>
                <span className="badge neutral" style={{ fontSize: '10px' }}>Purity: 87.4%</span>
              </div>
            </div>

            <div style={{ padding: '16px', borderRadius: '8px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--slate-900)' }}>Cocaine Adulterant Profile #COC-NCR-04</strong>
                  <div style={{ fontSize: '12px', color: 'var(--slate-500)' }}>Matched Reagent Profile: Scott Reagent + Levamisole Marker</div>
                </div>
                <span className="badge warning">Moderate Correlation (84%)</span>
              </div>
              <p style={{ fontSize: '12px', color: 'var(--slate-600)', marginBottom: '10px' }}>
                Secondary chromatic precipitate matches imported high-grade cocaine batches seized at Connaught Place jurisdiction.
              </p>
              <div style={{ display: 'flex', gap: '8px' }}>
                <span className="badge neutral" style={{ fontSize: '10px' }}>Transit: Air Cargo Terminal 3</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Decision & Push Case to Court */}
        <div className="card">
          <div className="section-header">
            <h3 className="section-title">Push Case to Special Court (Section 52A)</h3>
          </div>
          <p style={{ fontSize: '12px', color: 'var(--slate-600)', marginBottom: '16px' }}>
            Authorize Section 52A pre-trial dossier transmission. Endorsement transfers certified digital chain of custody to the Judiciary.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {cases.map((c) => {
              const isPushed = !!pushedToCourt[c.id];
              return (
                <div key={c.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderRadius: '6px', background: 'var(--slate-50)', border: '1px solid var(--slate-200)' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: 'var(--primary-navy)' }}>{c.id}</strong>
                    <div style={{ fontSize: '11px', color: 'var(--slate-600)' }}>
                      {c.substance} • {c.location}
                    </div>
                  </div>

                  {isPushed ? (
                    <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <CheckCircle2 size={12} /> Transmitted
                    </span>
                  ) : (
                    <button
                      type="button"
                      className="btn-primary"
                      style={{ padding: '5px 10px', fontSize: '11px' }}
                      onClick={() => handlePushToCourt(c)}
                    >
                      <Send size={12} />
                      <span>Push to Court</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
