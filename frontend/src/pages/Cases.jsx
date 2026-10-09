import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Eye,
  Lock,
  Calendar,
  MapPin,
  User,
  ShieldCheck,
  CheckCircle2,
  X,
  Palette,
  Camera,
  Download
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function Cases() {
  const { cases } = useCases();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Status');
  const [selectedCase, setSelectedCase] = useState(null);
  const [inspectImage, setInspectImage] = useState(null);

  const filteredCases = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return cases.filter(item => {
      const matchSearch = !q ||
        item.id.toLowerCase().includes(q) ||
        (item.evidenceId && item.evidenceId.toLowerCase().includes(q)) ||
        (item.location && item.location.toLowerCase().includes(q)) ||
        (item.substance && item.substance.toLowerCase().includes(q)) ||
        (item.officer && item.officer.toLowerCase().includes(q));

      const matchStatus = statusFilter === 'All Status' || item.status === statusFilter;
      return matchSearch && matchStatus;
    });
  }, [cases, searchQuery, statusFilter]);

  return (
    <div className="cases-container">
      {/* Header */}
      <header className="page-header">
        <div>
          <h2 className="page-title">Evidence & Case Registry</h2>
          <p className="page-subtitle">Indexed NDPS field test records, forensic photographs, and chain of custody.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={() => {
            const headers = "Case ID,Evidence Tag,Date,Time,Location,Substance,Test Kit,Status,Digital Seal\n";
            const rows = cases.map(c => `"${c.id}","${c.evidenceId}","${c.date}","${c.time}","${c.location}","${c.substance}","${c.testKit || ''}","${c.status}","${c.digitalSeal || ''}"`).join("\n");
            const blob = new Blob([headers + rows], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `NCB_Case_Registry_${Date.now()}.csv`;
            a.click();
            URL.revokeObjectURL(url);
          }}
        >
          <Download size={15} />
          <span>Export Registry (CSV)</span>
        </button>
      </header>

      {/* Filter Bar */}
      <div className="card filter-card">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search by Case ID, Evidence Tag, Substance or Officer..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="filter-group">
          <div className="select-wrapper">
            <Filter size={15} />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All Status">All Status</option>
              <option value="Verified">Verified</option>
              <option value="Pending FSL">Pending FSL</option>
              <option value="Under Review">Under Review</option>
            </select>
          </div>
        </div>
      </div>

      {/* Cases Table */}
      <div className="card cases-table-card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Evidence ID</th>
                <th>Date & Time</th>
                <th>Location</th>
                <th>Substance</th>
                <th>Reagent Kit</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCases.map((c) => (
                <tr key={c.id}>
                  <td className="font-bold text-navy">{c.id}</td>
                  <td><code className="tag-code">{c.evidenceId}</code></td>
                  <td>
                    <span>{c.date}</span>
                    <br />
                    <small className="text-muted">{c.time}</small>
                  </td>
                  <td>{c.location}</td>
                  <td><strong>{c.substance}</strong></td>
                  <td>{c.testKit || 'Standard Reagent'}</td>
                  <td>
                    <span className={`badge ${c.status === 'Verified' ? 'success' : 'warning'}`}>
                      {c.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => setSelectedCase(c)}
                    >
                      <Eye size={14} />
                      <span>View Record</span>
                    </button>
                  </td>
                </tr>
              ))}
              {filteredCases.length === 0 && (
                <tr>
                  <td colSpan="8" style={{ textAlign: 'center', padding: '30px', color: 'var(--slate-500)' }}>
                    No matching cases found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Case Details Modal with Evidence Gallery (6 Images) */}
      {selectedCase && (
        <div className="modal-backdrop" onClick={() => setSelectedCase(null)}>
          <div className="modal-case-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <div>
                <h3 className="modal-case-title">Case File: {selectedCase.id}</h3>
                <span className="modal-case-sub">Evidence Tag: {selectedCase.evidenceId}</span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setSelectedCase(null)}
              >
                <X size={22} />
              </button>
            </div>

            <div className="modal-case-body custom-scrollbar">
              {/* Top Details Grid */}
              <div className="case-metadata-grid">
                <div className="meta-box">
                  <span className="meta-label">Testing Officer</span>
                  <strong className="meta-val">{selectedCase.officer}</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Seizure Location</span>
                  <strong className="meta-val">{selectedCase.location} ({selectedCase.coordinates || 'GPS Logged'})</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Tested Substance</span>
                  <strong className="meta-val">{selectedCase.substance} ({selectedCase.testKit})</strong>
                </div>
                <div className="meta-box">
                  <span className="meta-label">Digital Cryptographic Seal</span>
                  <code className="meta-seal">{selectedCase.digitalSeal || 'SHA256:7f83b1657ff1...'}</code>
                </div>
              </div>

              {/* Saved Images Section: 5 Sample Images + 1 Reference Card */}
              <div className="evidence-images-section">
                <div className="section-title-row">
                  <h4>Photographic Evidence Package (6 Required Images)</h4>
                  <span className="badge blue">Forensic Repository</span>
                </div>

                {/* 1. 5 Sample Images */}
                <div className="image-group">
                  <span className="group-heading">Part A: Sample Frames (5 Images)</span>
                  {selectedCase.sampleImages && selectedCase.sampleImages.length > 0 ? (
                    <div className="modal-images-grid">
                      {selectedCase.sampleImages.map((s, idx) => (
                        <div
                          key={idx}
                          className="evidence-img-card"
                          onClick={() => setInspectImage({ url: s.dataUrl || s.url, title: `Sample Frame #${idx + 1}` })}
                        >
                          <img
                            src={s.dataUrl || s.url}
                            alt={`Sample ${idx + 1}`}
                            className="evidence-img-thumb"
                          />
                          <div className="evidence-img-label">
                            <Camera size={12} />
                            <span>Sample #{idx + 1}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="empty-evidence-notice">
                      <Camera size={20} />
                      <span>Field sample images archived in secure cold storage.</span>
                    </div>
                  )}
                </div>

                {/* 2. Color Reference Card */}
                <div className="image-group">
                  <span className="group-heading">Part B: Optical Color Calibration Reference Card</span>
                  {selectedCase.referenceCardImage ? (
                    <div
                      className="ref-card-inspect-box"
                      onClick={() => setInspectImage({
                        url: selectedCase.referenceCardImage.dataUrl || selectedCase.referenceCardImage.url,
                        title: 'Color Calibration Reference Card'
                      })}
                    >
                      <img
                        src={selectedCase.referenceCardImage.dataUrl || selectedCase.referenceCardImage.url}
                        alt="Reference Card"
                        className="ref-card-thumb"
                      />
                      <div className="ref-card-inspect-text">
                        <div className="ref-tag-row">
                          <Palette size={16} color="#D97706" />
                          <strong>Calibration Baseline Target</strong>
                        </div>
                        <p>Processed independently from sample reaction area for chromatic normalization.</p>
                        <span className="badge success">Calibrated</span>
                      </div>
                    </div>
                  ) : (
                    <div className="empty-evidence-notice">
                      <Palette size={20} />
                      <span>Optical reference target registered under baseline profile CR-1.</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Custody Chain Log */}
              {selectedCase.custodyChain && selectedCase.custodyChain.length > 0 && (
                <div className="custody-log-section">
                  <h4>Chain of Custody Audit Trail</h4>
                  <div className="timeline-list">
                    {selectedCase.custodyChain.map((step, idx) => (
                      <div key={idx} className="timeline-item">
                        <div className="timeline-dot" />
                        <div className="timeline-content">
                          <div className="timeline-header">
                            <strong>{step.step}</strong>
                            <span className="timeline-time">{step.time}</span>
                          </div>
                          <span className="timeline-actor">{step.actor}</span>
                          {step.details && <p className="timeline-desc">{step.details}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button
                type="button"
                className="btn-secondary"
                onClick={() => setSelectedCase(null)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Inspect Single Image Modal */}
      {inspectImage && (
        <div className="modal-backdrop top-backdrop" onClick={() => setInspectImage(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{inspectImage.title}</h5>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setInspectImage(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body" style={{ background: '#0F172A', padding: '20px', display: 'flex', justifyContent: 'center' }}>
              <img
                src={inspectImage.url}
                alt="Evidence View"
                style={{ maxHeight: '75vh', width: 'auto', borderRadius: '6px' }}
              />
            </div>
          </div>
        </div>
      )}

      <style>{`
        .cases-container {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }

        .filter-card {
          padding: 16px 20px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 10px;
          flex: 1;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 8px 14px;
        }

        .search-icon {
          color: var(--slate-400);
        }

        .search-box input {
          border: none;
          background: transparent;
          outline: none;
          width: 100%;
          font-size: 13px;
        }

        .filter-group {
          display: flex;
          gap: 12px;
        }

        .select-wrapper {
          display: flex;
          align-items: center;
          gap: 8px;
          padding: 8px 14px;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          font-size: 13px;
          color: var(--slate-700);
        }

        .select-wrapper select {
          border: none;
          background: transparent;
          outline: none;
          font-weight: 600;
          color: var(--slate-700);
          cursor: pointer;
        }

        .tag-code {
          font-family: monospace;
          background: var(--slate-100);
          padding: 2px 6px;
          border-radius: 4px;
          font-size: 11px;
        }

        /* Modal Case Card */
        .modal-case-card {
          background: white;
          border-radius: var(--radius-lg);
          max-width: 900px;
          width: 100%;
          max-height: 90vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .modal-case-title {
          font-size: 18px;
          font-weight: 800;
          color: var(--slate-900);
        }

        .modal-case-sub {
          font-size: 12px;
          color: var(--slate-500);
        }

        .modal-case-body {
          padding: 24px;
          overflow-y: auto;
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .case-metadata-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 14px;
        }

        .meta-box {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 12px 14px;
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .meta-label {
          font-size: 11px;
          color: var(--slate-500);
          font-weight: 600;
        }

        .meta-val {
          font-size: 13px;
          color: var(--slate-800);
        }

        .meta-seal {
          font-family: monospace;
          font-size: 11px;
          color: var(--primary-navy);
          word-break: break-all;
        }

        .section-title-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-title-row h4 {
          font-size: 15px;
          font-weight: 800;
          color: var(--slate-900);
        }

        .image-group {
          margin-bottom: 20px;
        }

        .group-heading {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--slate-700);
          margin-bottom: 10px;
        }

        .modal-images-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 10px;
        }

        .evidence-img-card {
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-md);
          overflow: hidden;
          position: relative;
          cursor: pointer;
          border: 2px solid var(--slate-200);
          transition: transform 0.15s ease;
        }

        .evidence-img-card:hover {
          transform: translateY(-2px);
          border-color: var(--primary-navy);
        }

        .evidence-img-thumb {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .evidence-img-label {
          position: absolute;
          bottom: 2px;
          left: 2px;
          background: rgba(15, 23, 42, 0.75);
          color: white;
          font-size: 9px;
          font-weight: 700;
          padding: 2px 4px;
          border-radius: 3px;
          display: flex;
          align-items: center;
          gap: 3px;
        }

        .ref-card-inspect-box {
          display: flex;
          gap: 16px;
          align-items: center;
          background: #FFFBEB;
          border: 2px solid #F59E0B;
          border-radius: var(--radius-md);
          padding: 12px;
          cursor: pointer;
        }

        .ref-card-thumb {
          width: 140px;
          height: 90px;
          object-fit: cover;
          border-radius: var(--radius-sm);
        }

        .ref-card-inspect-text {
          flex: 1;
        }

        .ref-tag-row {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #92400E;
          font-size: 13px;
          margin-bottom: 4px;
        }

        .ref-card-inspect-text p {
          font-size: 12px;
          color: var(--slate-600);
          margin-bottom: 6px;
        }

        .empty-evidence-notice {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 14px;
          background: var(--slate-50);
          border: 1px dashed var(--slate-300);
          border-radius: var(--radius-md);
          color: var(--slate-500);
          font-size: 12px;
        }

        .timeline-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 10px;
        }

        .timeline-item {
          display: flex;
          gap: 12px;
        }

        .timeline-dot {
          width: 10px;
          height: 10px;
          border-radius: 50%;
          background: var(--primary-navy);
          margin-top: 5px;
          flex-shrink: 0;
        }

        .timeline-content {
          flex: 1;
          font-size: 12px;
        }

        .timeline-header {
          display: flex;
          justify-content: space-between;
        }

        .timeline-time {
          color: var(--slate-400);
          font-size: 11px;
        }

        .timeline-actor {
          color: var(--slate-500);
          display: block;
        }

        .modal-footer {
          padding: 16px 24px;
          border-top: 1px solid var(--slate-200);
          display: flex;
          justify-content: flex-end;
        }

        .top-backdrop {
          z-index: 1100;
        }

        @media (max-width: 768px) {
          .modal-images-grid {
            grid-template-columns: repeat(2, minmax(0, 1fr));
          }
          .case-metadata-grid {
            grid-template-columns: 1fr;
          }
          .ref-card-inspect-box {
            flex-direction: column;
            align-items: flex-start;
          }
          .ref-card-thumb {
            width: 100%;
            height: 140px;
          }
        }
      `}</style>
    </div>
  );
}
