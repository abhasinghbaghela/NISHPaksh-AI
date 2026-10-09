import React, { useState } from 'react';
import {
  Bell,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Info,
  Trash2,
  Check
} from 'lucide-react';

export default function Notifications() {
  const [notifications, setNotifications] = useState([
    {
      id: 1,
      type: 'success',
      title: 'FSL Verification Approved',
      message: 'Case NDPS-2026-001234 (Cocaine seizure) confirmed by Regional FSL Rohini. GC-MS report attached.',
      time: '10 minutes ago',
      unread: true
    },
    {
      id: 2,
      type: 'warning',
      title: 'Calibration Card Reminder',
      message: 'Ensure reference card CR-1 is captured flat under identical ambient lighting for accurate optical normalization.',
      time: '2 hours ago',
      unread: true
    },
    {
      id: 3,
      type: 'info',
      title: 'SOP Update: NDPS Section 52A',
      message: 'New advisory issued on mandatory 5 sample frames and 1 calibration card protocol for all field units.',
      time: '1 day ago',
      unread: false
    }
  ]);

  const markAllRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, unread: false })));
  };

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  return (
    <div className="notifications-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Operational Notifications</h2>
          <p className="page-subtitle">Alerts, FSL lab docket confirmations, and protocol notices.</p>
        </div>
        <button
          type="button"
          className="btn-secondary"
          onClick={markAllRead}
        >
          <Check size={16} />
          <span>Mark All Read</span>
        </button>
      </header>

      <div className="card" style={{ padding: '16px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{
                display: 'flex',
                alignItems: 'flex-start',
                justifyContent: 'space-between',
                padding: '14px 18px',
                borderRadius: '8px',
                background: n.unread ? 'var(--primary-light)' : 'var(--slate-50)',
                border: '1px solid var(--slate-200)'
              }}
            >
              <div style={{ display: 'flex', gap: '14px' }}>
                {n.type === 'success' && <CheckCircle2 size={20} color="var(--success-green)" />}
                {n.type === 'warning' && <AlertTriangle size={20} color="var(--warning-amber)" />}
                {n.type === 'info' && <Info size={20} color="var(--info-blue)" />}
                <div>
                  <strong style={{ fontSize: '14px', color: 'var(--slate-900)' }}>{n.title}</strong>
                  <p style={{ fontSize: '13px', color: 'var(--slate-600)', margin: '4px 0' }}>{n.message}</p>
                  <small style={{ color: 'var(--slate-400)' }}>{n.time}</small>
                </div>
              </div>
              <button
                type="button"
                onClick={() => deleteNotification(n.id)}
                style={{ background: 'none', border: 'none', color: 'var(--slate-400)', cursor: 'pointer' }}
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          {notifications.length === 0 && (
            <p style={{ textAlign: 'center', padding: '20px', color: 'var(--slate-500)' }}>No notifications.</p>
          )}
        </div>
      </div>

      <style>{`
        .notifications-page {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
