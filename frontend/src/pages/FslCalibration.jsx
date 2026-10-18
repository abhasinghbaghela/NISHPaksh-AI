import React, { useState } from 'react';
import {
  Sliders,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  FlaskConical,
  ShieldCheck,
  Palette,
  FileCheck2,
  Calendar,
  Layers
} from 'lucide-react';

export default function FslCalibration() {
  const [reagents, setReagents] = useState([
    {
      id: 'RG-SCOTT-01',
      name: 'Scott Reagent (Cobalt Thiocyanate)',
      lot: 'LOT-2026-SC88',
      expiry: '28 Dec 2026',
      target: 'Cocaine HCl',
      sensitivity: 99.2,
      deltaE: 0.24,
      status: 'Calibrated'
    },
    {
      id: 'RG-MARQUIS-02',
      name: 'Marquis Reagent (Formalin-Sulfuric)',
      lot: 'LOT-2026-MQ41',
      expiry: '15 Jan 2027',
      target: 'Opiates / Amphetamines',
      sensitivity: 98.6,
      deltaE: 0.31,
      status: 'Calibrated'
    },
    {
      id: 'RG-MANDELIN-03',
      name: 'Mandelin Reagent (Metavanadate)',
      lot: 'LOT-2026-MD19',
      expiry: '04 Nov 2026',
      target: 'Methamphetamine / MDMA',
      sensitivity: 97.9,
      deltaE: 0.38,
      status: 'Calibrated'
    },
    {
      id: 'RG-MECKE-04',
      name: 'Mecke Reagent (Selenious Acid)',
      lot: 'LOT-2026-MK05',
      expiry: '20 Oct 2026',
      target: 'Heroin / Morphine',
      sensitivity: 98.1,
      deltaE: 0.29,
      status: 'Calibrated'
    }
  ]);

  const [referenceCardConfig, setReferenceCardConfig] = useState({
    cardId: 'CR-1-STD-2026',
    whitePoint: 'D65 (6504 K)',
    luminanceTolerance: '± 4.5%',
    deltaEMax: 0.50,
    currentDeltaE: 0.28,
    lastCalibrated: '18 Oct 2026, 09:30 AM',
    calibratedBy: 'Dr. Sunita Sharma (Analyst FSL-412)'
  });

  const [isCalibrating, setIsCalibrating] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleRunCalibration = () => {
    setIsCalibrating(true);
    setSaveSuccess(false);

    setTimeout(() => {
      setIsCalibrating(false);
      setSaveSuccess(true);
      setReferenceCardConfig(prev => ({
        ...prev,
        currentDeltaE: parseFloat((0.20 + Math.random() * 0.15).toFixed(2)),
        lastCalibrated: new Date().toLocaleString('en-IN')
      }));
    }, 1200);
  };

  return (
    <div className="fsl-calibration-page">
      {/* Header */}
      <header className="page-header">
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sliders size={22} className="text-navy" />
            <h2 className="page-title">Forensic Reagent & Optical Calibration</h2>
          </div>
          <p className="page-subtitle">
            Configure laboratory sensitivity tolerances, optical reference card baseline ΔE, and reagent batch QC under ISO/IEC 17025.
          </p>
        </div>

        <button
          type="button"
          className="btn-primary"
          onClick={handleRunCalibration}
          disabled={isCalibrating}
          style={{ fontSize: '13px' }}
        >
          <RefreshCw size={14} className={isCalibrating ? 'spin-anim' : ''} />
          <span>{isCalibrating ? 'Recalibrating Baselines...' : 'Run Auto-Calibration Check'}</span>
        </button>
      </header>

      {saveSuccess && (
        <div style={{ padding: '12px 16px', background: '#ECFDF5', border: '1px solid #A7F3D0', borderRadius: '8px', color: '#065F46', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px' }}>
          <CheckCircle2 size={16} />
          <span>Optical calibration baseline re-aligned successfully. ΔE tolerance verified at {referenceCardConfig.currentDeltaE} across all 6 reference color channels.</span>
        </div>
      )}

      {/* Optical Reference Card Benchmark Card */}
      <div className="card" style={{ marginBottom: '24px' }}>
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Palette size={18} className="text-navy" />
            <h3 className="section-title">Optical Reference Card (CR-1) Master Benchmark</h3>
          </div>
          <span className="badge success">ISO/IEC 17025 Compliant</span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginTop: '16px' }}>
          <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Standard Reference Target</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>{referenceCardConfig.cardId}</div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>6 Spectrally Verified Swatches</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Standard Illuminant</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>{referenceCardConfig.whitePoint}</div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Daylight Normalized</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Optical Drift Index (ΔE)</span>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#16A34A', marginTop: '4px' }}>
              ΔE = {referenceCardConfig.currentDeltaE} (Max {referenceCardConfig.deltaEMax})
            </div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>Optimal Chromatic Accuracy</div>
          </div>

          <div style={{ padding: '12px', background: 'var(--slate-50)', borderRadius: '6px', border: '1px solid var(--slate-200)' }}>
            <span style={{ fontSize: '11px', color: 'var(--slate-500)', textTransform: 'uppercase', fontWeight: 600 }}>Last Calibration Verified</span>
            <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--slate-900)', marginTop: '4px' }}>{referenceCardConfig.lastCalibrated}</div>
            <div style={{ fontSize: '11px', color: 'var(--slate-500)' }}>{referenceCardConfig.calibratedBy}</div>
          </div>
        </div>
      </div>

      {/* Reagent Batch Matrix */}
      <div className="card">
        <div className="section-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FlaskConical size={18} className="text-navy" />
            <h3 className="section-title">Field Reagent Batch Sensitivity Registry</h3>
          </div>
          <span className="badge blue">Section 52A Presumptive Protocol</span>
        </div>

        <div className="table-container" style={{ marginTop: '16px' }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Reagent Chemical Name</th>
                <th>Lot / Batch #</th>
                <th>Target Substance</th>
                <th>Batch Expiry</th>
                <th>Sensitivity Index</th>
                <th>Optical Tolerance (ΔE)</th>
                <th>QC Status</th>
              </tr>
            </thead>
            <tbody>
              {reagents.map((r) => (
                <tr key={r.id}>
                  <td>
                    <strong>{r.name}</strong>
                    <br />
                    <small style={{ color: 'var(--slate-500)' }}>{r.id}</small>
                  </td>
                  <td className="font-mono">{r.lot}</td>
                  <td><strong>{r.target}</strong></td>
                  <td>{r.expiry}</td>
                  <td>
                    <span style={{ fontWeight: 700, color: '#16A34A' }}>{r.sensitivity}%</span>
                  </td>
                  <td className="font-mono">ΔE {r.deltaE}</td>
                  <td>
                    <span className="badge success">{r.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
