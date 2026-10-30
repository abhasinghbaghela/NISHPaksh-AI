import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  PlusCircle,
  FolderArchive,
  ShieldCheck,
  GitCommit,
  FlaskConical,
  FileText,
  BarChart3,
  RefreshCw,
  Bell,
  HelpCircle,
  Settings,
  LogOut,
  Crosshair,
  Sliders,
  Gavel,
  Network,
  Flame,
  Send
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export function getRoleNavItems(roleKey) {
  switch (roleKey) {
    case 'FSL_LAB':
      return [
        { icon: LayoutDashboard, label: 'FSL Dashboard', path: '/dashboard' },
        { icon: FlaskConical, label: 'Lab Report Validation', path: '/fsl' },
        { icon: Sliders, label: 'Set Calibration', path: '/fsl-calibration' },
        { icon: ShieldCheck, label: 'Evidence Vault', path: '/vault' },
        { icon: GitCommit, label: 'Chain of Custody', path: '/custody' },
        { icon: FileText, label: 'Reports & COA', path: '/reports' },
        { icon: RefreshCw, label: 'Sync & Offline', path: '/sync', status: 'online' },
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
        { icon: HelpCircle, label: 'Help & SOPs', path: '/help' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      ];

    case 'ZONAL_HQ':
      return [
        { icon: LayoutDashboard, label: 'Zonal HQ Dashboard', path: '/dashboard' },
        { icon: Crosshair, label: 'NDPS Crime Map (Google)', path: '/crime-map' },
        { icon: Network, label: 'Inquiry & Intelligence', path: '/inquiry' },
        { icon: FolderArchive, label: 'Decisions & Registry', path: '/cases' },
        { icon: Send, label: 'Push Case to Court', path: '/inquiry' },
        { icon: ShieldCheck, label: 'Evidence Vault', path: '/vault' },
        { icon: BarChart3, label: 'Zone Analytics', path: '/analytics' },
        { icon: FileText, label: 'Reports', path: '/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
        { icon: HelpCircle, label: 'Help & SOPs', path: '/help' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      ];

    case 'COURT':
      return [
        { icon: LayoutDashboard, label: 'Judicial Dashboard', path: '/dashboard' },
        { icon: Gavel, label: 'Pre-Trial Docket', path: '/court-docket' },
        { icon: Flame, label: 'Sec 52A Disposal Orders', path: '/court-docket' },
        { icon: FolderArchive, label: 'Case Registry', path: '/cases' },
        { icon: ShieldCheck, label: 'Evidence Vault', path: '/vault' },
        { icon: GitCommit, label: 'Chain of Custody', path: '/custody' },
        { icon: FileText, label: 'Certified Reports', path: '/reports' },
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
        { icon: HelpCircle, label: 'Help & SOPs', path: '/help' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      ];

    case 'FIELD_OFFICER':
    default:
      return [
        { icon: LayoutDashboard, label: 'Field Dashboard', path: '/dashboard' },
        { icon: PlusCircle, label: 'New Test', path: '/new-test' },
        { icon: FolderArchive, label: 'Field Cases', path: '/cases' },
        { icon: ShieldCheck, label: 'Evidence Vault', path: '/vault' },
        { icon: GitCommit, label: 'Chain of Custody', path: '/custody' },
        { icon: FileText, label: 'Reports (Form 52A)', path: '/reports' },
        { icon: RefreshCw, label: 'Sync & Offline', path: '/sync', status: 'online' },
        { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
        { icon: HelpCircle, label: 'Help & SOPs', path: '/help' },
        { icon: Settings, label: 'Settings', path: '/settings' }
      ];
  }
}

export default function Sidebar({ onItemClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onItemClick) onItemClick();
    navigate('/login');
  };

  const navItems = getRoleNavItems(user?.roleKey);

  const getRoleBadge = (roleKey) => {
    switch (roleKey) {
      case 'FSL_LAB':
        return { label: 'Forensic Lab', color: '#D97706', bg: '#FEF3C7' };
      case 'ZONAL_HQ':
        return { label: 'Zonal Command', color: '#2563EB', bg: '#EFF6FF' };
      case 'COURT':
        return { label: 'Judicial Bench', color: '#7C3AED', bg: '#F3E8FF' };
      case 'FIELD_OFFICER':
      default:
        return { label: 'Field Officer', color: '#16A34A', bg: '#DCFCE7' };
    }
  };

  const badge = getRoleBadge(user?.roleKey);

  return (
    <aside className="sidebar">
      {/* Role Indicator Banner */}
      <div style={{ padding: '12px 16px 8px 16px', borderBottom: '1px solid var(--slate-200)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700 }}>
            Active Role
          </span>
          <span
            style={{
              fontSize: '11px',
              fontWeight: 700,
              padding: '2px 8px',
              borderRadius: '12px',
              color: badge.color,
              backgroundColor: badge.bg
            }}
          >
            {badge.label}
          </span>
        </div>
      </div>

      <nav className="nav-list custom-scrollbar">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.label}
              to={item.path}
              onClick={onItemClick}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
            >
              <Icon size={18} strokeWidth={2.2} />
              <span className="nav-label">{item.label}</span>
              {item.status === 'online' && <div className="status-dot" />}
              {item.badge && <span className="nav-badge">{item.badge}</span>}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <button
          type="button"
          className="sidebar-logout-btn"
          onClick={handleLogout}
          title="Sign Out / Lock Session"
        >
          <LogOut size={16} />
          <span>Sign Out / Lock Session</span>
        </button>

        <div className="branding-grid">
          <div className="govt-seal-text">
            <strong>Narcotics Control Bureau</strong>
            <span>Secure Forensic Protocol v1.0.0</span>
          </div>
        </div>
      </div>
    </aside>
  );
}