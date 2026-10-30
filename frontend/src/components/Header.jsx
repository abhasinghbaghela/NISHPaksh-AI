import React from 'react';
import { Menu, Bell, Shield, User, LogOut } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

export default function Header({ onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const getRoleBadgeStyle = (roleKey) => {
    switch (roleKey) {
      case 'FSL_LAB':
        return { label: 'FSL Lab Analyst', bg: '#FEF3C7', color: '#B45309', border: '#FDE68A' };
      case 'ZONAL_HQ':
        return { label: 'Zonal Command HQ', bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' };
      case 'COURT':
        return { label: 'Special Judge (NDPS)', bg: '#F3E8FF', color: '#6D28D9', border: '#DDD6FE' };
      case 'FIELD_OFFICER':
      default:
        return { label: 'Field Officer', bg: '#DCFCE7', color: '#15803D', border: '#BBF7D0' };
    }
  };

  const badgeStyle = getRoleBadgeStyle(user?.roleKey);

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
          <span className="hide-mobile">Secure Session</span>
        </div>

        <Link to="/notifications" className="header-action-btn" aria-label="Notifications">
          <Bell size={18} />
          <span className="header-badge-count">3</span>
        </Link>

        {/* Authenticated Officer Profile (Role is locked to authenticated identity) */}
        <div className="officer-profile" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div className="officer-avatar">
            {user?.name ? user.name.charAt(0) : 'O'}
          </div>
          <div className="officer-details hide-mobile">
            <span className="officer-name">{user?.name || 'Authorized Officer'}</span>
            <span className="officer-role">{user?.role || 'NCB Enforcement Division'}</span>
          </div>
          {/* Static security badge - Cannot switch roles without logging out and entering password */}
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              backgroundColor: badgeStyle.bg,
              color: badgeStyle.color,
              border: `1px solid ${badgeStyle.border}`,
              whiteSpace: 'nowrap'
            }}
          >
            {user?.badge || badgeStyle.label}
          </span>
        </div>

        {/* Sign Out Button to switch roles securely */}
        <button
          type="button"
          className="header-logout-btn"
          onClick={handleLogout}
          title="Sign Out / Change Role"
          aria-label="Log Out"
        >
          <LogOut size={16} />
          <span className="hide-mobile">Log Out</span>
        </button>
      </div>
    </header>
  );
}