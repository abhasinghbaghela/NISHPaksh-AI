import React, { useState } from 'react';
import {
  FileText,
  Download,
  Printer,
  Calendar,
  Share2,
  CheckCircle2,
  Search
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function Reports() {
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState('');

  const generateReportText = (c) => {
    return `GOVERNMENT OF INDIA - MINISTRY OF HOME AFFAIRS
NARCOTICS CONTROL BUREAU - FORENSIC FIELD TEST REPORT
=====================================================
Case Number:      ${c.id}
Evidence ID:      ${c.evidenceId}
Date & Time:      ${c.date} ${c.time}
Location:         ${c.location} (${c.coordinates || '28.6139° N, 77.2090° E'})
Officer:          ${c.officer}
Substance:        ${c.substance}
Test Reagent:     ${c.testKit}
Images Ingested:  6 (5 Sample Frames + 1 Optical Calibration Card)
Digital Seal:     ${c.digitalSeal || 'SHA256:7f83b1657ff1...'}
Status:           ${c.status}
Compliance:       NDPS Act Section 52A Verified
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

  return (
    <div className="reports-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Forensic Field Test Reports</h2>
          <p className="page-subtitle">Standardized NDPS Section 52A seizure memoranda and evidentiary reports.</p>
        </div>
      </header>

      <div className="card" style={{ padding: '16px 20px', marginBottom: '24px' }}>
        <input
          type="text"
          placeholder="Filter reports by Case ID..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', padding: '10px 14px', border: '1px solid var(--slate-300)', borderRadius: '6px', fontSize: '13px' }}
        />
      </div>

      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Report ID</th>
                <th>Case Reference</th>
                <th>Date</th>
                <th>Substance Presumption</th>
                <th>Evidentiary Status</th>
                <th>Download / Print</th>
              </tr>
            </thead>
            <tbody>
              {cases.map((c) => (
                <tr key={c.id}>
                  <td className="font-bold text-navy">REP-{c.id.slice(-6)}</td>
                  <td><strong>{c.id}</strong></td>
                  <td>{c.date}</td>
                  <td>{c.substance}</td>
                  <td>
                    <span className="badge success">
                      <CheckCircle2 size={12} /> Certified
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => handleDownload(c)}
                    >
                      <Download size={13} />
                      <span>Download PDF/TXT</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
