import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShieldCheck, Lock, User, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Login() {
  const navigate = useNavigate();
  const { login, roles } = useAuth();
  const [selectedRole, setSelectedRole] = useState('FIELD_OFFICER');
  const [officerId, setOfficerId] = useState('FO12345');
  const [password, setPassword] = useState('••••••••••••');

  const handleRoleChange = (roleKey) => {
    setSelectedRole(roleKey);
    setOfficerId(roles[roleKey]?.id || 'FO12345');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    login(selectedRole);
    navigate('/dashboard');
  };

  return (
    <div className="login-root">
      <div className="login-card card">
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
          <span className="login-badge">Authorized Personnel Only</span>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label>Designated Role</label>
            <select
              value={selectedRole}
              onChange={(e) => handleRoleChange(e.target.value)}
              className="login-select"
            >
              <option value="FIELD_OFFICER">Field Officer (Insp. Rajesh Kumar)</option>
              <option value="FSL_LAB">FSL Lab Analyst (Dr. Sunita Sharma)</option>
              <option value="ZONAL_HQ">Zonal HQ Admin (Comm. Vikram Singh)</option>
              <option value="COURT">Special Judge NDPS (Justice Amitabh Kant)</option>
            </select>
          </div>

          <div className="form-group">
            <label>Officer ID / Employee ID</label>
            <div className="input-with-icon">
              <User size={16} className="field-icon" />
              <input
                type="text"
                value={officerId}
                onChange={(e) => setOfficerId(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label>Secure Credential</label>
            <div className="input-with-icon">
              <Lock size={16} className="field-icon" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn-primary login-btn">
            <span>Sign In to Forensic Environment</span>
            <ArrowRight size={16} />
          </button>

          <button
            type="button"
            className="btn-secondary sso-btn"
            onClick={() => {
              login(selectedRole);
              navigate('/dashboard');
            }}
          >
            <ShieldCheck size={16} color="var(--primary-navy)" />
            <span>Sign in with Government SSO (Parichay)</span>
          </button>
        </form>

        <div className="login-footer">
          <small>Version 1.0.0 | Secure forensic environment</small>
          <small>Compliant with NDPS Act Section 52A & Indian Evidence Act 65B</small>
        </div>
      </div>

      <style>{`
        .login-root {
          min-height: 100vh;
          display: flex;
          align-items: center;
          justify-content: center;
          background: #F1F5F9;
          padding: 20px;
        }

        .login-card {
          max-width: 460px;
          width: 100%;
          padding: 36px 32px;
          display: flex;
          flex-direction: column;
          box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.1);
        }

        .login-header {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          margin-bottom: 24px;
        }

        .login-emblem {
          height: 60px;
          margin-bottom: 12px;
        }

        .login-govt-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--primary-navy);
          letter-spacing: 0.5px;
        }

        .login-ministry-title {
          font-size: 11px;
          color: var(--slate-500);
          margin-bottom: 8px;
        }

        .login-app-title {
          font-size: 24px;
          font-weight: 800;
          color: var(--primary-navy);
          letter-spacing: 0.5px;
        }

        .login-badge {
          display: inline-block;
          margin-top: 6px;
          padding: 3px 10px;
          background: var(--primary-light);
          color: var(--primary-navy);
          border-radius: 999px;
          font-size: 11px;
          font-weight: 700;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .login-select {
          padding: 10px 14px;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-md);
          font-size: 13px;
          background: white;
        }

        .input-with-icon {
          position: relative;
          display: flex;
          align-items: center;
        }

        .field-icon {
          position: absolute;
          left: 12px;
          color: var(--slate-400);
        }

        .input-with-icon input {
          width: 100%;
          padding: 10px 14px 10px 36px;
          border: 1px solid var(--slate-300);
          border-radius: var(--radius-md);
          font-size: 13px;
        }

        .login-btn {
          width: 100%;
          justify-content: center;
          padding: 12px;
          font-size: 14px;
          margin-top: 6px;
        }

        .sso-btn {
          width: 100%;
          justify-content: center;
          padding: 11px;
          font-size: 13px;
        }

        .login-footer {
          margin-top: 24px;
          padding-top: 16px;
          border-top: 1px solid var(--slate-200);
          text-align: center;
          display: flex;
          flex-direction: column;
          gap: 4px;
          color: var(--slate-400);
          font-size: 11px;
        }
      `}</style>
    </div>
  );
}
