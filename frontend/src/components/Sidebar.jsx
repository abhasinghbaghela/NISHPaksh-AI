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
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const NAV_ITEMS = [
  { icon: LayoutDashboard, label: 'Dashboard', path: '/dashboard' },
  { icon: PlusCircle, label: 'New Test', path: '/new-test' },
  { icon: FolderArchive, label: 'Cases', path: '/cases' },
  { icon: ShieldCheck, label: 'Evidence Vault', path: '/vault' },
  { icon: GitCommit, label: 'Chain of Custody', path: '/custody' },
  { icon: FlaskConical, label: 'FSL Verification', path: '/fsl' },
  { icon: FileText, label: 'Reports', path: '/reports' },
  { icon: BarChart3, label: 'Analytics', path: '/analytics' },
  { icon: RefreshCw, label: 'Sync & Offline', path: '/sync', status: 'online' },
  { icon: Bell, label: 'Notifications', path: '/notifications', badge: 3 },
  { icon: HelpCircle, label: 'Help & SOPs', path: '/help' },
  { icon: Settings, label: 'Settings', path: '/settings' }
];

export default function Sidebar({ onItemClick }) {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    if (onItemClick) onItemClick();
    navigate('/login');
  };

  return (
    <aside className="sidebar">
      <nav className="nav-list custom-scrollbar">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
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