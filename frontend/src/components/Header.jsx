import React from 'react';
import { Menu, Bell, Shield, User, ChevronDown } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function Header({ onMenuClick, isOnline = true }) {
  const { user, switchRole, roles } = useAuth();

  return (
    <header className="header">
      <div className="header-left">
        <button
          type="button"
          className="mobile-menu-btn"
          onClick={onMenuClick}
          aria-label="Open Navigation Menu"
        >
          <Menu size={22} />
        </button>

        <div className="govt-branding">
          <img
            src="/emblem.svg"
            onError={(e) => { e.target.onerror = null; e.target.src = "https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg"; }}
            alt="Emblem of India"
            className="emblem-img"
          />
          <div className="branding-text hide-mobile">
            <span className="dept-name">Government of India</span>
            <span className="ministry-name">Ministry of Home Affairs | NCB</span>
          </div>
        </div>

        <div className="v-divider hide-mobile" />

        <div className="app-branding">
          <Link to="/dashboard">
            <h1 className="app-title">NISHPaksh AI</h1>
            <span className="app-tagline hide-mobile">Digital Companion for Field Drug Testing</span>
          </Link>
        </div>
      </div>

      <div className="header-right">
        <div className="status-badge-online">
          <span className="status-indicator-dot" />
          <span className="hide-mobile">Online / Field Mode</span>
        </div>

        <Link to="/notifications" className="header-action-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="header-badge-count">3</span>
        </Link>

        <div className="officer-profile">
          <div className="officer-avatar">
            {user?.name ? user.name.charAt(0) : 'O'}
          </div>
          <div className="officer-details hide-mobile">
            <span className="officer-name">{user?.name || 'Field Officer'}</span>
            <span className="officer-role">{user?.role || 'NCB Field Division'}</span>
          </div>
          <select
            value={user?.roleKey || 'FIELD_OFFICER'}
            onChange={(e) => switchRole(e.target.value)}
            style={{
              border: 'none',
              background: 'transparent',
              fontSize: '11px',
              color: 'var(--slate-500)',
              cursor: 'pointer',
              outline: 'none',
              marginLeft: '2px'
            }}
            title="Switch User Role"
          >
            <option value="FIELD_OFFICER">Field Officer</option>
            <option value="FSL_LAB">FSL Lab Analyst</option>
            <option value="ZONAL_HQ">Zonal HQ Admin</option>
            <option value="COURT">Special Judge (NDPS)</option>
          </select>
        </div>
      </div>
    </header>
  );
}
