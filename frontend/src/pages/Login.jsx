import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, AlertTriangle, Key, CheckCircle2, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { loginWithCredentials, officialCredentials } = useAuth();

  const [officerId, setOfficerId] = useState('FO12345');
  const [password, setPassword] = useState('Field@2026');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    const result = loginWithCredentials(officerId, password);
    setLoading(false);

    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
  };

  const handleQuickFill = (cred) => {
    setOfficerId(cred.officerId);
    setPassword(cred.password);
    setError(null);
  };

  return (
    <div className="login-root">
      <div className="login-card card" style={{ maxWidth: '480px', width: '100%' }}>
        {/* Gov Emblem & Title */}
        <div className="login-header">
          <img
            src="/emblem.svg"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"; }}
            alt="Government of India Emblem"
            className="login-emblem"
          />
          <span className="login-govt-title">Government of India</span>
          <span className="login-ministry-title">Ministry of Home Affairs | Narcotics Control Bureau</span>
          <h2 className="login-app-title">NISHPaksh AI</h2>
          <span className="login-badge">Role-Based Digital Chain of Custody</span>
        </div>

        {error && (
          <div style={{ padding: '10px 14px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px', color: '#B91C1C', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <AlertTriangle size={16} style={{ flexShrink: 0 }} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Officer ID / Service Identifier</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                type="text"
                placeholder="e.g. FO12345 or FSL412"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Security Password</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                placeholder="Enter password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn" disabled={loading}>
            <span>{loading ? 'Authenticating...' : 'Sign In to Designated Role'}</span>
            <ArrowRight size={16} />
          </button>
        </form>

        {/* Official Authorized Credentials Directory (Quick-Fill for Evaluators/Testing) */}
        <div style={{ marginTop: '24px', borderTop: '1px solid var(--slate-200)', paddingTop: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
            <Key size={14} className="text-navy" />
            <span style={{ fontSize: '11px', fontWeight: 700, textTransform: 'uppercase', color: 'var(--slate-500)' }}>
              Authorized Credentials Directory
            </span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
            {officialCredentials.map((cred) => (
              <div
                key={cred.roleKey}
                onClick={() => handleQuickFill(cred)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '8px 10px',
                  borderRadius: '6px',
                  background: officerId === cred.officerId ? 'var(--primary-light)' : 'var(--slate-50)',
                  border: `1px solid ${officerId === cred.officerId ? 'var(--primary-navy)' : 'var(--slate-200)'}`,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease'
                }}
                title="Click to fill credentials"
              >
                <div>
                  <div style={{ fontSize: '12px', fontWeight: 700, color: 'var(--slate-900)' }}>
                    {cred.title}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--slate-600)', fontFamily: 'monospace' }}>
                    ID: <strong>{cred.officerId}</strong> • Pass: <code>{cred.password}</code>
                  </div>
                </div>
                <button
                  type="button"
                  className="btn-text"
                  style={{ fontSize: '11px', color: 'var(--primary-navy)', display: 'flex', alignItems: 'center', gap: '2px' }}
                >
                  <span>Select</span>
                  <ChevronRight size={12} />
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="login-footer" style={{ marginTop: '20px' }}>
          <small>Version 1.0.0 | Secure Forensic Authentication Enclave</small>
          <small>Complies with NDPS Act Section 52A & Indian Evidence Act Section 65B</small>
        </div>
      </div>
    </div>
  );
}
