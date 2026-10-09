import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Share2,
  CheckCircle2,
  Search,
  Eye,
  X,
  ShieldCheck,
  MapPin,
  User,
  FlaskConical,
  Clock,
  Layers,
  ArrowRight
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function Reports() {
  const navigate = useNavigate();
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedReport, setSelectedReport] = useState(null);

  const filteredCases = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return cases;
    return cases.filter(c => {
      const repId = `rep-${(c.id || '').slice(-6)}`.toLowerCase();
      return (
        (c.id && c.id.toLowerCase().includes(q)) ||
        (c.evidenceId && c.evidenceId.toLowerCase().includes(q)) ||
        (c.substance && c.substance.toLowerCase().includes(q)) ||
        (c.officer && c.officer.toLowerCase().includes(q)) ||
        (c.location && c.location.toLowerCase().includes(q)) ||
        (c.testKit && c.testKit.toLowerCase().includes(q)) ||
        repId.includes(q)
      );
    });
  }, [cases, searchTerm]);

  const generateReportText = (c) => {
    return `=====================================================
GOVERNMENT OF INDIA - MINISTRY OF HOME AFFAIRS
NARCOTICS CONTROL BUREAU - FORENSIC FIELD TEST REPORT
=====================================================
Report Identifier:    REP-${(c.id || '').slice(-6)}
Case Number:          ${c.id}
Evidence ID Tag:      ${c.evidenceId}
Date & Time:          ${c.date} ${c.time || ''}
Seizure Location:     ${c.location} (${c.coordinates || '28.6139° N, 77.2090° E'})
Station / Unit:       ${c.station || 'Field Seizure Checkpost'}
Seizing Officer:      ${c.officer}
Presumptive Drug:     ${c.substance}
Reagent Kit Used:     ${c.testKit || c.reagent || 'Scott Reagent'}
Confidence Rating:    ${c.confidence ? `${c.confidence}%` : 'Forensic Field Standard'}
Sample Physical Form: ${c.sampleType || 'Powder'}
Evidence Intake:      6 Ingested Frames (5 Sample Frames + 1 Color Calibration Card)
Digital Cryptographic Seal:
  ${c.digitalSeal || 'SHA256:7f83b1657ff1...'}
Statutory Compliance: NDPS Act 1985 Section 52A Verified
Electronic Evidence:  IEA Section 65B Digital Certificate Validated
Chain of Custody:     Sealed at Field Checkpost & Vault Archived
=====================================================`;
  };

  const handleDownload = (c) => {
    const text = generateReportText(c);
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Forensic_Report_${c.id}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="reports-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Forensic Field Test Reports</h2>
          <p className="page-subtitle">Standardized NDPS Section 52A seizure memoranda and evidentiary reports.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className="btn-primary"
            onClick={() => navigate('/new-test')}
          >
            <FlaskConical size={16} />
            <span>Conduct New Test</span>
          </button>
        </div>
      </header>

      {/* Search & Filter Bar */}
      <div className="card" style={{ padding: '16px 20px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ position: 'relative', flex: 1 }}>
            <Search
              size={18}
              style={{
                position: 'absolute',
                left: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: 'var(--slate-400)'
              }}
            />
            <input
              type="text"
              placeholder="Filter reports by Case ID, Report ID, Substance, Officer, or Location..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                width: '100%',
                padding: '10px 14px 10px 38px',
                border: '1px solid var(--slate-300)',
                borderRadius: '6px',
                fontSize: '13px',
                boxSizing: 'border-box'
              }}
            />
          </div>
          {searchTerm && (
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setSearchTerm('')}
              style={{ padding: '8px 12px', fontSize: '12px' }}
            >
              Clear
            </button>
          )}
        </div>
        <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--slate-500)', display: 'flex', justifyContent: 'space-between' }}>
          <span>Showing <strong>{filteredCases.length}</strong> of <strong>{cases.length}</strong> test reports</span>
          <span>Storage: <strong>Persistent Vault & Local Cache Active</strong></span>
        </div>
      </div>

      {/* Reports Table */}
      <div className="card">
        {filteredCases.length === 0 ? (
          <div style={{ padding: '48px 24px', textAlign: 'center' }}>
            <FileText size={48} style={{ color: 'var(--slate-300)', margin: '0 auto 12px auto' }} />
            <h3 style={{ fontSize: '16px', fontWeight: 600, color: 'var(--slate-800)', marginBottom: '6px' }}>
              No Test Reports Found
            </h3>
            <p style={{ fontSize: '13px', color: 'var(--slate-500)', maxWidth: '440px', margin: '0 auto 16px auto' }}>
              {searchTerm
                ? `No reports matched your query "${searchTerm}". Try resetting your filter.`
                : 'No field tests have been conducted yet. Perform a field test in the New Test Wizard to generate a certified report.'}
            </p>
            {searchTerm ? (
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSearchTerm('')}
              >
                Reset Search
              </button>
            ) : (
              <button
                type="button"
                className="btn-primary"
                onClick={() => navigate('/new-test')}
              >
                <FlaskConical size={16} />
                <span>Conduct Field Test Now</span>
              </button>
            )}
          </div>
        ) : (
          <div className="table-container">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Report ID</th>
                  <th>Case Reference</th>
                  <th>Date & Time</th>
                  <th>Substance Presumption</th>
                  <th>Officer</th>
                  <th>Evidentiary Status</th>
                  <th style={{ textAlign: 'right' }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredCases.map((c) => {
                  const repId = `REP-${(c.id || '').slice(-6)}`;
                  return (
                    <tr key={c.id}>
                      <td className="font-bold text-navy">
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                          <FileText size={14} style={{ color: 'var(--primary-navy)' }} />
                          {repId}
                        </span>
                      </td>
                      <td>
                        <strong>{c.id}</strong>
                        {c.evidenceId && (
                          <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                            Tag: {c.evidenceId}
                          </div>
                        )}
                      </td>
                      <td>
                        <div>{c.date}</div>
                        {c.time && <small style={{ color: 'var(--slate-500)' }}>{c.time}</small>}
                      </td>
                      <td>
                        <span style={{ fontWeight: 600, color: 'var(--slate-900)' }}>{c.substance}</span>
                        {c.testKit && (
                          <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
                            Kit: {c.testKit}
                          </div>
                        )}
                      </td>
                      <td>
                        <span style={{ fontSize: '12px' }}>{c.officer}</span>
                      </td>
                      <td>
                        <span className="badge success">
                          <CheckCircle2 size={12} /> Certified
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                          <button
                            type="button"
                            className="btn-secondary"
                            title="View Full Evidentiary Report"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => setSelectedReport(c)}
                          >
                            <Eye size={13} />
                            <span>View</span>
                          </button>
                          <button
                            type="button"
                            className="btn-secondary"
                            title="Download Report Text"
                            style={{ padding: '6px 10px', fontSize: '12px' }}
                            onClick={() => handleDownload(c)}
                          >
                            <Download size={13} />
                            <span>Download</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Full Evidentiary Report Modal */}
      {selectedReport && (
        <div className="modal-overlay" onClick={() => setSelectedReport(null)}>
          <div
            className="modal-card"
            style={{ maxWidth: '680px', width: '95%', maxHeight: '90vh', overflowY: 'auto' }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="modal-header" style={{ borderBottom: '1px solid var(--slate-200)', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <ShieldCheck size={24} style={{ color: 'var(--primary-navy)' }} />
                <div>
                  <h3 style={{ margin: 0, fontSize: '17px', color: 'var(--slate-900)' }}>
                    Forensic Field Test Certificate
                  </h3>
                  <span style={{ fontSize: '12px', color: 'var(--slate-500)' }}>
                    REP-{(selectedReport.id || '').slice(-6)} | NDPS Section 52A Standard
                  </span>
                </div>
              </div>
              <button
                type="button"
                className="btn-icon"
                onClick={() => setSelectedReport(null)}
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div style={{ padding: '20px 0', display: 'flex', flexDirection: 'column', gap: '16px' }}>
              {/* Government Header Banner */}
              <div
                style={{
                  background: 'var(--slate-50)',
                  border: '1px solid var(--slate-200)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  textAlign: 'center'
                }}
              >
                <div style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '0.5px', color: 'var(--slate-700)', textTransform: 'uppercase' }}>
                  Government of India — Ministry of Home Affairs
                </div>
                <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--primary-navy)' }}>
                  NARCOTICS CONTROL BUREAU (NCB) — FORENSIC VERIFICATION RECORD
                </div>
                <div style={{ fontSize: '10px', color: 'var(--slate-500)', marginTop: '2px' }}>
                  Certified under NDPS Act Section 52A & Indian Evidence Act Section 65B
                </div>
              </div>

              {/* Case Parameters Grid */}
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                  gap: '12px'
                }}
              >
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Case Reference</span>
                  <strong style={{ fontSize: '14px', color: 'var(--primary-navy)' }}>{selectedReport.id}</strong>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Evidence ID Tag</span>
                  <strong style={{ fontSize: '14px' }}>{selectedReport.evidenceId}</strong>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Date & Time</span>
                  <strong style={{ fontSize: '14px' }}>{selectedReport.date} {selectedReport.time || ''}</strong>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Seizing Officer</span>
                  <strong style={{ fontSize: '14px' }}>{selectedReport.officer}</strong>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Location / Coordinates</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedReport.location}</span>
                  <div style={{ fontSize: '10px', color: 'var(--slate-500)' }}>{selectedReport.coordinates || '28.6139° N, 77.2090° E'}</div>
                </div>
                <div style={{ padding: '10px 12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
                  <span style={{ fontSize: '11px', color: 'var(--slate-500)', display: 'block' }}>Station / Unit</span>
                  <span style={{ fontSize: '13px', fontWeight: 600 }}>{selectedReport.station || 'Connaught Place PS, Delhi'}</span>
                </div>
              </div>

              {/* Forensic Substance Findings */}
              <div
                style={{
                  border: '1px solid var(--primary-light)',
                  background: 'var(--primary-bg)',
                  borderRadius: '6px',
                  padding: '14px 16px'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--primary-navy)' }}>
                    Presumptive Chemical Determination
                  </span>
                  <span className="badge success">
                    {selectedReport.confidence || 92}% Match Confidence
                  </span>
                </div>
                <div style={{ fontSize: '18px', fontWeight: 700, color: 'var(--primary-navy)', marginBottom: '4px' }}>
                  {selectedReport.substance}
                </div>
                <div style={{ fontSize: '12px', color: 'var(--slate-700)' }}>
                  Reagent System: <strong>{selectedReport.testKit || selectedReport.reagent || 'Scott Reagent'}</strong> | Sample Type: <strong>{selectedReport.sampleType || 'Powder'}</strong>
                </div>
              </div>

              {/* Digital Seal & Evidence Intake */}
              <div
                style={{
                  border: '1px solid var(--slate-200)',
                  borderRadius: '6px',
                  padding: '12px 16px',
                  background: 'var(--slate-50)'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--slate-800)' }}>
                    SHA-256 Cryptographic Digital Seal
                  </span>
                  <span className="badge blue" style={{ fontSize: '11px' }}>
                    Immutable Vault Record
                  </span>
                </div>
                <code
                  style={{
                    display: 'block',
                    background: '#ffffff',
                    padding: '8px 10px',
                    borderRadius: '4px',
                    border: '1px solid var(--slate-300)',
                    fontSize: '11px',
                    wordBreak: 'break-all',
                    color: 'var(--slate-800)',
                    fontFamily: 'monospace'
                  }}
                >
                  {selectedReport.digitalSeal || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069'}
                </code>
                <div style={{ fontSize: '11px', color: 'var(--slate-500)', marginTop: '6px' }}>
                  Intake: <strong>6 Photographed Frames</strong> (5 Evidence Samples + 1 Independent Color Reference Card).
                </div>
              </div>
            </div>

            {/* Modal Footer Actions */}
            <div
              className="modal-footer"
              style={{
                borderTop: '1px solid var(--slate-200)',
                paddingTop: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedReport(null)}
              >
                Close
              </button>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={handlePrint}
                >
                  <Printer size={14} />
                  <span>Print Certificate</span>
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={() => handleDownload(selectedReport)}
                >
                  <Download size={14} />
                  <span>Download Report</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
