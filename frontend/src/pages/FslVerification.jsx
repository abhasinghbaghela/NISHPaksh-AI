import React, { useState } from 'react';
import {
  FlaskConical,
  CheckCircle2,
  AlertCircle,
  FileCheck2,
  Clock,
  ShieldCheck,
  Search
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function FslVerification() {
  const { cases } = useCases();
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('All');

  const filtered = cases.filter(c => {
    const matchesSearch = !searchTerm || c.id.toLowerCase().includes(searchTerm.toLowerCase()) || c.substance.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesTab = activeTab === 'All' || (activeTab === 'Pending' && c.status === 'Pending FSL') || (activeTab === 'Verified' && c.status === 'Verified');
    return matchesSearch && matchesTab;
  });

  return (
    <div className="fsl-container">
      <header className="page-header">
        <div>
          <h2 className="page-title">FSL Laboratory Verification Portal</h2>
          <p className="page-subtitle">Confirmatory GC-MS & HPLC laboratory testing for field-submitted evidence.</p>
        </div>
      </header>

      {/* Tabs */}
      <div className="card" style={{ padding: '14px 20px', marginBottom: '24px', display: 'flex', gap: '12px' }}>
        {['All', 'Pending', 'Verified'].map((tab) => (
          <button
            key={tab}
            type="button"
            className={`btn-secondary ${activeTab === tab ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab(tab)}
            style={{ fontSize: '13px' }}
          >
            {tab} Queue
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="card">
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th>Case ID</th>
                <th>Field Test Result</th>
                <th>Reagent Kit</th>
                <th>Date Received</th>
                <th>FSL Status</th>
                <th>Laboratory Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item) => (
                <tr key={item.id}>
                  <td className="font-bold text-navy">{item.id}</td>
                  <td><strong>{item.substance}</strong></td>
                  <td>{item.testKit}</td>
                  <td>{item.date}</td>
                  <td>
                    <span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>
                      {item.status}
                    </span>
                  </td>
                  <td>
                    <button
                      type="button"
                      className="btn-secondary"
                      style={{ padding: '6px 12px', fontSize: '12px' }}
                      onClick={() => alert(`FSL Lab Docket for ${item.id}\nAnalyst: Dr. Sunita Sharma\nMethod: Confirmatory Gas Chromatography\nStatus: ${item.status}`)}
                    >
                      <FileCheck2 size={13} />
                      <span>Lab Docket</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <style>{`
        .fsl-container {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
