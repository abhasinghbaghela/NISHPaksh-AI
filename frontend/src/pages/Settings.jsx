import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  Camera,
  Shield,
  Bell,
  HardDrive,
  Check,
  LogOut,
  Cloud,
  CheckCircle2,
  AlertTriangle,
  Key,
  Database,
  RefreshCw
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { isFirebaseReady, getStoredFirebaseConfig, saveFirebaseConfig } from '../services/firebase';

export default function Settings() {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const [settings, setSettings] = useState({
    highResCamera: true,
    autoTorchAssist: false,
    strictReferenceCardValidation: true,
    offlineAutoSync: true,
    notificationsEnabled: true
  });
  const [savedMsg, setSavedMsg] = useState(false);

  // Firebase Cloud State
  const initialFb = getStoredFirebaseConfig();
  const [firebaseConnected, setFirebaseConnected] = useState(isFirebaseReady());
  const [firebaseJsonInput, setFirebaseJsonInput] = useState('');
  const [firebaseStatusMsg, setFirebaseStatusMsg] = useState(null);

  const toggle = (key) => {
    setSettings(prev => ({ ...prev, [key]: !prev[key] }));
    setSavedMsg(true);
    setTimeout(() => setSavedMsg(false), 2000);
  };

  const handleConnectFirebase = () => {
    setFirebaseStatusMsg(null);
    try {
      let configObj = null;
      const clean = firebaseJsonInput.trim();

      // Check if user pasted a JS/JSON snippet
      if (clean.startsWith('{') && clean.endsWith('}')) {
        configObj = JSON.parse(clean);
      } else {
        // Match const firebaseConfig = { ... }
        const match = clean.match(/\{[\s\S]*\}/);
        if (match) {
          // Replace unquoted keys
          const jsonStr = match[0]
            .replace(/([a-zA-Z0-9_]+)\s*:/g, '"$1":')
            .replace(/'/g, '"')
            .replace(/,\s*\}/g, '}');
          configObj = JSON.parse(jsonStr);
        }
      }

      if (!configObj || !configObj.apiKey || !configObj.projectId) {
        throw new Error('Config must contain at least "apiKey" and "projectId".');
      }

      const success = saveFirebaseConfig(configObj);
      if (success) {
        setFirebaseConnected(true);
        setFirebaseStatusMsg({ type: 'success', text: `Connected successfully to Firebase Project "${configObj.projectId}". Real-time multi-device sync is now active!` });
      } else {
        throw new Error('Failed to initialize Firebase with the provided credentials.');
      }
    } catch (err) {
      setFirebaseStatusMsg({ type: 'error', text: `Invalid Firebase config format: ${err.message}` });
    }
  };

  return (
    <div className="settings-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">System & Cloud Sync Settings</h2>
          <p className="page-subtitle">Configure camera constraints, Firebase cloud database, and multi-device synchronization.</p>
        </div>
        {savedMsg && (
          <span className="badge success" style={{ padding: '6px 14px' }}>
            <Check size={14} /> Preferences Saved
          </span>
        )}
      </header>

      {/* 1. Firebase Cloud Database & Real-Time Sync Configuration */}
      <div className="card" style={{ padding: '24px', maxWidth: '800px', marginBottom: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Database size={20} className="text-navy" />
            <h3 style={{ fontSize: '16px', fontWeight: 800, margin: 0 }}>Firebase Cloud Database (Live Multi-Device Sync)</h3>
          </div>
          {firebaseConnected ? (
            <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> Cloud Real-Time Active
            </span>
          ) : (
            <span className="badge neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <HardDrive size={13} /> Local Offline Vault Mode
            </span>
          )}
        </div>

        <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginBottom: '16px' }}>
          When Firebase is connected, any evidence package saved by a Field Officer on their phone or laptop is <strong>instantly synchronized across all devices</strong> and visible live to FSL Analysts, Zonal HQ, and Court.
        </p>

        {firebaseStatusMsg && (
          <div style={{
            padding: '10px 14px',
            borderRadius: '6px',
            fontSize: '12px',
            marginBottom: '16px',
            backgroundColor: firebaseStatusMsg.type === 'success' ? '#ECFDF5' : '#FEF2F2',
            color: firebaseStatusMsg.type === 'success' ? '#065F46' : '#B91C1C',
            border: `1px solid ${firebaseStatusMsg.type === 'success' ? '#A7F3D0' : '#FCA5A5'}`
          }}>
            {firebaseStatusMsg.text}
          </div>
        )}

        <div style={{ background: 'var(--slate-50)', padding: '16px', borderRadius: '8px', border: '1px solid var(--slate-200)', marginBottom: '16px' }}>
          <label style={{ fontSize: '12px', fontWeight: 700, display: 'block', marginBottom: '6px', color: 'var(--slate-800)' }}>
            Paste Firebase Web App Configuration
          </label>
          <textarea
            rows={4}
            value={firebaseJsonInput}
            onChange={(e) => setFirebaseJsonInput(e.target.value)}
            placeholder={`{\n  "apiKey": "AIzaSy...",\n  "authDomain": "my-project.firebaseapp.com",\n  "projectId": "my-project",\n  "storageBucket": "my-project.appspot.com"\n}`}
            style={{ width: '100%', fontFamily: 'monospace', fontSize: '12px', padding: '10px', borderRadius: '6px', border: '1px solid var(--slate-300)' }}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)' }}>
              From Firebase Console → Project Settings → Web App Config
            </span>
            <button
              type="button"
              className="btn-primary"
              onClick={handleConnectFirebase}
              style={{ fontSize: '12px', padding: '6px 14px' }}
            >
              <Cloud size={14} />
              <span>Connect Firebase Cloud</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Camera & Optical Capture Configuration */}
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

      {/* 3. Officer Session & Lock Terminal */}
      <div className="card" style={{ padding: '24px', maxWidth: '800px', marginTop: '20px' }}>
        <h3 style={{ fontSize: '16px', fontWeight: 800, marginBottom: '12px', color: 'var(--slate-900)' }}>
          Active Officer Session: {user?.name || 'Authorized Officer'}
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
          <span>Sign Out / Change Role</span>
        </button>
      </div>
    </div>
  );
}