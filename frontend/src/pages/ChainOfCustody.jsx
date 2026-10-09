import React, { useState } from 'react';
import {
  GitCommit,
  ShieldCheck,
  UserCheck,
  FileCheck,
  Building2,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function ChainOfCustody() {
  const { cases } = useCases();
  const [selectedCaseId, setSelectedCaseId] = useState(cases[0]?.id || 'NDPS-2026-001234');

  const selectedCase = cases.find(c => c.id === selectedCaseId) || cases[0];

  const stages = [
    { icon: UserCheck, title: 'Field Seizure', actor: selectedCase?.officer || 'Insp. Rajesh Kumar', status: 'Completed', time: `${selectedCase?.date}, 10:24 AM` },
    { icon: ShieldCheck, title: 'Evidence Sealing', actor: 'NISHPaksh Digital Vault', status: 'Completed', time: `${selectedCase?.date}, 10:28 AM` },
    { icon: FileCheck, title: 'Secure Dispatch', actor: 'MHA Secure Transit', status: 'Completed', time: `${selectedCase?.date}, 01:15 PM` },
    { icon: Building2, title: 'FSL Laboratory', actor: 'Regional FSL Rohini', status: selectedCase?.status === 'Verified' ? 'Completed' : 'Pending', time: selectedCase?.status === 'Verified' ? `${selectedCase?.date}, 04:30 PM` : 'Awaiting confirmation' },
    { icon: Scale, title: 'Court Admissibility', actor: 'Special NDPS Court', status: selectedCase?.status === 'Verified' ? 'Ready' : 'Pending FSL', time: 'Docket ready' }
  ];

  return (
    <div className="custody-container">
      <header className="page-header">
        <div>
          <h2 className="page-title">Chain of Custody & Audit Ledger</h2>
          <p className="page-subtitle">Continuous, tamper-evident audit trail from field seizure to court presentation.</p>
        </div>
      </header>

      {/* Case Selector */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '14px' }}>
        <strong style={{ fontSize: '13px', color: 'var(--slate-700)' }}>Select Case to Inspect:</strong>
        <select
          value={selectedCaseId}
          onChange={(e) => setSelectedCaseId(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid var(--slate-300)', borderRadius: '6px', fontSize: '13px' }}
        >
          {cases.map(c => (
            <option key={c.id} value={c.id}>{c.id} - {c.substance} ({c.location})</option>
          ))}
        </select>
      </div>

      {/* Custody Stages Track */}
      <div className="card" style={{ padding: '24px', marginBottom: '24px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Custody Progression Timeline</h3>
        <div className="custody-stage-track">
          {stages.map((st, i) => {
            const Icon = st.icon;
            const isDone = st.status === 'Completed' || st.status === 'Ready';
            return (
              <div key={i} className={`custody-stage-step ${isDone ? 'done' : 'pending'}`}>
                <div className="step-circle">
                  <Icon size={18} />
                </div>
                <div className="step-text">
                  <strong>{st.title}</strong>
                  <span className="step-actor">{st.actor}</span>
                  <small className="step-time">{st.time}</small>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Security Details */}
      <div className="content-responsive">
        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Digital Seal Verification</h3>
          <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginBottom: '14px' }}>
            The evidence package containing exactly 5 sample images and 1 color calibration card was cryptographically sealed upon collection:
          </p>
          <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', padding: '12px', borderRadius: '6px' }}>
            <code style={{ fontSize: '12px', color: 'var(--primary-navy)', wordBreak: 'break-all' }}>
              {selectedCase?.digitalSeal || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
            </code>
          </div>
        </div>

        <div className="card" style={{ padding: '24px' }}>
          <h3 style={{ fontSize: '15px', fontWeight: 800, marginBottom: '14px' }}>Legal Compliance</h3>
          <ul style={{ fontSize: '13px', color: 'var(--slate-600)', display: 'flex', flexDirection: 'column', gap: '8px', paddingLeft: '16px' }}>
            <li>Section 52A, Narcotics Drugs & Psychotropic Substances Act</li>
            <li>Indian Evidence Act Section 65B Electronic Records Certification</li>
            <li>Colorimetric Optical Normalization Reference Card Protocol</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
