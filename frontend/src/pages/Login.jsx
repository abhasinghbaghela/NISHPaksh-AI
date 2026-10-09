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
    </div>
  );
}
