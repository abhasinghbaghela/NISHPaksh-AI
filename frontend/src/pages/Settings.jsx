import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Camera,
  Shield,
  Bell,
  HardDrive,
  Check,
  LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Settings() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [settings, setSettings] = useState({
    highResCamera: true,
    autoTorchAssist: false,
    strictReferenceCardValidation: true,
    offlineAutoSync: true,
    notificationsEnabled: true
  });
  const [savedMsg, setSavedMsg] = useState(false);

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">System & Device Settings</h2>
          <p className="page-subtitle">Configure camera constraints, optical calibration parameters, and network sync.</p>
        </div>
        {savedMsg && (
          <span className="badge success" style={{ padding: '6px 14px' }}>
            <Check size={14} /> Preferences Saved
          </span>
        )}
      </header>

      <div className="card" style={{ padding: '24px', maxWidth: '800px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '20px' }}>Camera & Optical Capture Configuration</h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--slate-100)' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block' }}>High Resolution Forensic Capture</strong>
              <small style={{ color: 'var(--slate-500)' }}>Capture sample frames at maximum available camera resolution (up to 1080p).</small>
            </div>
            <input
              type="checkbox"
              checked={settings.highResCamera}
              onChange={() => toggle('highResCamera')}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--slate-100)' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block' }}>Mandatory Calibration Card Enforcement</strong>
              <small style={{ color: 'var(--slate-500)' }}>Block submission if optical reference card is missing or incomplete.</small>
            </div>
            <input
              type="checkbox"
              checked={settings.strictReferenceCardValidation}
              onChange={() => toggle('strictReferenceCardValidation')}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: '14px', borderBottom: '1px solid var(--slate-100)' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block' }}>Auto Torch Assist in Low Light</strong>
              <small style={{ color: 'var(--slate-500)' }}>Automatically request camera flash/torch when luminance drops below 110/255.</small>
            </div>
            <input
              type="checkbox"
              checked={settings.autoTorchAssist}
              onChange={() => toggle('autoTorchAssist')}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div>
              <strong style={{ fontSize: '13px', display: 'block' }}>Opportunistic Cloud Synchronization</strong>
              <small style={{ color: 'var(--slate-500)' }}>Automatically sync offline cached evidence packages when network connectivity returns.</small>
            </div>
            <input
              type="checkbox"
              checked={settings.offlineAutoSync}
              onChange={() => toggle('offlineAutoSync')}
              style={{ width: '18px', height: '18px', cursor: 'pointer' }}
            />
          </div>
        </div>
      </div>

      <div className="card" style={{ padding: '24px', maxWidth: '800px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: 'var(--slate-900)' }}>
          Active Officer Session & Authentication
        </h3>
        <p style={{ fontSize: '13px', color: 'var(--slate-500)', marginBottom: '18px' }}>
          Terminate your active field session and lock this terminal. You will be redirected to the secure government authentication portal.
        </p>
        <button
          type="button"
          onClick={() => {
            logout();
            navigate('/login');
          }}
          className="btn-danger"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            padding: '10px 18px',
            background: 'var(--danger-red)',
            color: 'white',
            border: 'none',
            borderRadius: 'var(--radius-md)',
            fontWeight: 700,
            fontSize: '13px'
          }}
        >
          <LogOut size={16} />
          <span>Sign Out / Lock Session</span>
        </button>
      </div>
    </div>
  );
}