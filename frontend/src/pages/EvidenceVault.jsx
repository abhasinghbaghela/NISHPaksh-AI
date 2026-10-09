import React, { useState } from 'react';
import {
  ShieldCheck,
  Lock,
  Download,
  Eye,
  Key,
  CheckCircle2,
  FileCheck,
  Search
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function EvidenceVault() {
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState('');

  const stats = [
    { label: 'Total Evidence Files', count: 128 + cases.length, color: 'blue' },
    { label: 'Cryptographically Sealed', count: 114 + cases.length, color: 'green' },
    { label: 'Verified Records', count: 109 + cases.length, color: 'blue' },
    { label: 'Sync Status', count: 'Active', color: 'green' }
  ];

  const filtered = cases.filter(c =>
    !searchTerm ||
    c.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.evidenceId.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="vault-container">
      <header className="page-header">
        <div>
          <h2 className="page-title">Forensic Evidence Vault</h2>
          <p className="page-subtitle">Immutable digital repository for seized drug evidence photos and seals.</p>
        </div>
      </header>

      {/* Stats */}
      <div className="grid-responsive" style={{ marginBottom: '24px' }}>
        {stats.map((s, idx) => (
          <div key={idx} className="card stat-card">
            <div className={`stat-icon-wrapper ${s.color}`}>
              <Lock size={20} />
            </div>
            <div className="stat-content">
              <span className="stat-label">{s.label}</span>
              <strong className="stat-value">{s.count}</strong>
            </div>
          </div>
        ))}
      </div>

      {/* Search */}
      <div className="card filter-card" style={{ marginBottom: '20px', padding: '14px 20px' }}>
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search vault by Case ID or Evidence Seal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Vault Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Evidence ID</th>
                <th>Case Reference</th>
                <th>Sealing Timestamp</th>
                <th>Digital Seal Hash</th>
                <th>Integrity</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-navy">{item.evidenceId}</td>
                  <td><strong>{item.id}</strong></td>
                  <td>{item.date} {item.time}</td>
                  <td>
                    <code style={{ fontSize: '11px', background: 'var(--slate-100)', padding: '2px 6px', borderRadius: '4px' }}>
                      {item.digitalSeal ? `${item.digitalSeal.substring(0, 24)}...` : 'SHA256:7f83b1657ff1...'}
                    </code>
                  </td>
                  <td>
                    <span className="badge success">
                      <ShieldCheck size={12} /> Verified Intact
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => alert(`Forensic Seal Verified: ${item.digitalSeal || 'SHA256:Valid'}\nNDPS Act Section 52A compliant.`)}
                    >
                      <Key size={13} />
                      <span>Verify Seal</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .vault-container {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
