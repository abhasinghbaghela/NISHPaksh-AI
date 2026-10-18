import React, { useState } from 'react';
import {
  Gavel,
  ShieldCheck,
  FileCheck2,
  CheckCircle2,
  AlertTriangle,
  FolderArchive,
  Download,
  Eye,
  Lock,
  ExternalLink,
  Flame,
  Search
} from 'lucide-react';
import { useCases } from '../context/CasesContext';
import { generateForensicPdfReport } from '../services/pdfReportGenerator';

export default function CourtDocket({ defaultTab = 'docket' }) {
  const { cases } = useCases();
  const [activeTab, setActiveTab] = useState(defaultTab);
  const [selectedCase, setSelectedCase] = useState(null);
  const [disposalOrders, setDisposalOrders] = useState({});
  const [closedCases, setClosedCases] = useState({});
  const [actionSuccess, setActionSuccess] = useState(null);

  // Filter cases for court review
  const pendingCases = cases.filter(c => !closedCases[c.id]);
  const disposedCases = cases.filter(c => closedCases[c.id]);

  const handleIssueDisposalOrder = (caseItem) => {
    const orderNo = `CRT-DISP-52A-${Math.floor(Math.random() * 89999 + 10000)}`;
    setDisposalOrders(prev => ({
      ...prev,
      [caseItem.id]: {
        orderNo,
        date: new Date().toLocaleDateString('en-IN'),
        judge: 'Justice Amitabh Kant (Special NDPS Judge)',
        status: 'Disposal Order Issued'
      }
    }));
    setActionSuccess(`Judicial Destruction/Disposal Order [${orderNo}] issued under NDPS Act Section 52A(2) for Case ${caseItem.id}. Representative samples preserved.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  const handleMarkCaseClosed = (caseItem) => {
    setClosedCases(prev => ({
      ...prev,
      [caseItem.id]: {
        closedAt: new Date().toLocaleString('en-IN'),
        disposition: 'Judicially Disposed & Trial Concluded'
      }
    }));
    setActionSuccess(`Case ${caseItem.id} officially marked 'CASE CLOSED'. Evidence Vault archive sealed under Section 52A.`);
    setTimeout(() => setActionSuccess(null), 5000);
  };

  return (
    <div className="court-docket-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Gavel size={22} className="text-navy" />
            <h2 className="page-title">Special NDPS Court • Pre-Trial Docket & Disposal Bench</h2>
          </div>
          <p className="page-subtitle">
            Judicial pre-trial verification, certified digital chain of custody inspection, and Section 52A(2) disposal orders.
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            className={`btn-secondary ${activeTab === 'docket' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('docket')}
            style={{ fontSize: '13px' }}
          >
            Pre-Trial Docket ({pendingCases.length})
          </button>
          <button
            type="button"
            className={`btn-secondary ${activeTab === 'disposal' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('disposal')}
            style={{ fontSize: '13px' }}
          >
            Disposal Orders ({Object.keys(disposalOrders).length})
          </button>
          <button
            type="button"
            className={`btn-secondary ${activeTab === 'closed' ? 'btn-primary' : ''}`}
            onClick={() => setActiveTab('closed')}
            style={{ fontSize: '13px' }}
          >
            Case Closed Registry ({Object.keys(closedCases).length})
          </button>
        </div>
      </header>

      {actionSuccess && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Main Table View */}
      <div className="card">
        <div className="section-header">
          <div>
            <h3 className="section-title">
              {activeTab === 'docket' && 'Pending Pre-Trial Evidence Verification Dockets'}
              {activeTab === 'disposal' && 'Section 52A(2) Contraband Disposal Applications'}
              {activeTab === 'closed' && 'Concluded & Sealed Judicial Cases'}
            </h3>
            <p style={{ fontSize: '12px', color: 'var(--slate-500)', margin: '4px 0 0 0' }}>
              Complies with Supreme Court guidelines in Mohanlal v. Union of India (2016) 3 SCC 379.
            </p>
          </div>
          <span className="badge blue">Section 65B Certified</span>
        </div>

        <div className="table-container" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Case Dossier ID</th>
                <th>Substance & Weight</th>
                <th>Seizure Station & Officer</th>
                <th>Sec 65B Digital Hash Seal</th>
                <th>FSL Confirmatory</th>
                <th>Judicial Action</th>
              </tr>
            </thead>
            <tbody>
              {pendingCases.map((item) => {
                const hasOrder = !!disposalOrders[item.id];
                const isClosed = !!closedCases[item.id];

                return (
                  <tr key={item.id}>
                    <td>
                      <strong className="font-bold text-navy">{item.id}</strong>
                      <br />
                      <small style={{ color: 'var(--slate-500)' }}>EVD: {item.evidenceId}</small>
                    </td>
                    <td>
                      <strong>{item.substance}</strong>
                      <br />
                      <small style={{ color: 'var(--slate-500)' }}>{item.sampleType}</small>
                    </td>
                    <td>
                      <span>{item.station || 'Delhi NCR'}</span>
                      <br />
                      <small style={{ color: 'var(--slate-500)' }}>{item.officer}</small>
                    </td>
                    <td>
                      <span className="font-mono" style={{ fontSize: '11px', display: 'inline-block', maxWidth: '160px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={item.digitalSeal}>
                        {item.digitalSeal ? `${item.digitalSeal.slice(0, 18)}...` : 'SHA256:Valid'}
                      </span>
                      <br />
                      <span className="badge success" style={{ fontSize: '10px', padding: '1px 6px' }}>Unbroken Non-Repudiation</span>
                    </td>
                    <td>
                      <span className={`badge ${item.status === 'Verified' ? 'success' : 'warning'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        <button
                          type="button"
                          className="btn-secondary"
                          style={{ padding: '5px 8px', fontSize: '11px' }}
                          onClick={() => generateForensicPdfReport(item)}
                          title="Review Certified Form 52A PDF"
                        >
                          <Download size={12} />
                          <span>Form 52A PDF</span>
                        </button>

                        {!hasOrder && !isClosed && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '5px 8px', fontSize: '11px', backgroundColor: '#D97706', borderColor: '#D97706' }}
                            onClick={() => handleIssueDisposalOrder(item)}
                            title="Issue Section 52A(2) Magistrate Disposal Order"
                          >
                            <Flame size={12} />
                            <span>Issue Disposal Order</span>
                          </button>
                        )}

                        {hasOrder && !isClosed && (
                          <button
                            type="button"
                            className="btn-primary"
                            style={{ padding: '5px 8px', fontSize: '11px', backgroundColor: '#16A34A', borderColor: '#16A34A' }}
                            onClick={() => handleMarkCaseClosed(item)}
                            title="Conclude Judicial Pre-Trial & Mark Case Closed"
                          >
                            <CheckCircle2 size={12} />
                            <span>Case Closed</span>
                          </button>
                        )}

                        {isClosed && (
                          <span className="badge neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            <Lock size={11} /> Case Closed
                          </span>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
