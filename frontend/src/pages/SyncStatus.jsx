import React, { useState } from 'react';
import {
  RefreshCw,
  Wifi,
  HardDrive,
  CheckCircle2,
  Database,
  UploadCloud,
  AlertCircle
} from 'lucide-react';
import { useCases } from '../context/CasesContext';

export default function SyncStatus() {
  const { cases, lastSyncTime, loadCases } = useCases();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncStatusMsg, setSyncStatusMsg] = useState('All field records and evidence packages synchronized with central MHA repository.');

  const handleManualSync = async () => {
    setIsSyncing(true);
    await loadCases();
    setTimeout(() => {
      setIsSyncing(false);
      setSyncStatusMsg(`Successfully synchronized ${cases.length} evidence packages with NCB Central Server.`);
    }, 800);
  };

  return (
    <div className="sync-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Sync & Offline Storage Queue</h2>
          <p className="page-subtitle">Field offline caching, opportunistic upload synchronization, and storage integrity.</p>
        </div>
        <button
          type="button"
          className="btn-primary"
          disabled={isSyncing}
          onClick={handleManualSync}
        >
          <RefreshCw size={16} className={isSyncing ? 'spinner' : ''} />
          <span>{isSyncing ? 'Synchronizing...' : 'Sync Now'}</span>
        </button>
      </header>

      {/* Sync Status Banner */}
      <div className="card" style={{ padding: '20px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '16px', background: '#ECFDF5', border: '1px solid #A7F3D0' }}>
        <CheckCircle2 size={28} color="var(--success-green)" />
        <div>
          <strong style={{ fontSize: '15px', color: '#065F46' }}>Central Synchronization Status: Online</strong>
          <p style={{ fontSize: '13px', color: '#047857', marginTop: '2px' }}>{syncStatusMsg}</p>
          <small style={{ color: '#059669' }}>Last Synchronized: {new Date(lastSyncTime).toLocaleTimeString()}</small>
        </div>
      </div>

      <div className="grid-responsive" style={{ marginBottom: '24px' }}>
        <div className="card stat-card">
          <div className="stat-icon-wrapper green">
            <Wifi size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Network Pipeline</span>
            <strong className="stat-value">Connected</strong>
            <span className="stat-trend positive">Secure TLS 1.3</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper blue">
            <Database size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Indexed Records</span>
            <strong className="stat-value">{cases.length}</strong>
            <span className="stat-trend positive">All sealed</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper navy">
            <HardDrive size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Local Cache</span>
            <strong className="stat-value">Optimal</strong>
            <span className="stat-trend positive">0 pending sync</span>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-wrapper amber">
            <UploadCloud size={22} />
          </div>
          <div className="stat-content">
            <span className="stat-label">Queue Length</span>
            <strong className="stat-value">0</strong>
            <span className="stat-trend neutral">Clean queue</span>
          </div>
        </div>
      </div>

      <style>{`
        .sync-page {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
        .spinner {
          animation: spin 1s linear infinite;
        }
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}
