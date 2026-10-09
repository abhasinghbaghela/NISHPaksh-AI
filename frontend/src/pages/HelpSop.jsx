import React from 'react';
import {
  HelpCircle,
  BookOpen,
  ShieldCheck,
  Camera,
  CheckCircle2,
  FileText
} from 'lucide-react';

export default function HelpSop() {
  const sops = [
    {
      title: 'Standard Operating Procedure: 6-Image Evidence Protocol',
      desc: 'Under the revised NCB field guidelines, testing officers must capture exactly 5 sample evidence frames and 1 separate color calibration reference card. The reference card must never be placed inside the chemical reaction well.',
      steps: [
        '1. Ensure device is steady on a flat surface.',
        '2. Switch to Sample Capture mode and capture 5 clear frames showing sample morphology, reagent introduction, and reaction color.',
        '3. Switch to Reference Card mode and capture the calibration card flat under ambient lighting.',
        '4. Review image gallery to confirm all 6 images are sharp before proceeding.'
      ]
    },
    {
      title: 'Reagent Spot Test Color Interpretation',
      desc: 'Presumptive test kits display characteristic chemical color shifts:',
      steps: [
        'Scott Reagent: Produces cobalt blue precipitate with Cocaine HCl.',
        'Marquis Reagent: Yields deep purple/violet with opiates (Morphine/Heroin).',
        'Mandelin Reagent: Yields dark green with amphetamines and methamphetamines.',
        'Mecke Reagent: Turns deep green to blue-green with heroin.'
      ]
    },
    {
      title: 'Legal Admissibility under NDPS Act Section 52A',
      desc: 'All digital records created via NISHPaksh AI are sealed with SHA-256 cryptographic signatures and embedded GPS telemetry, compliant with the Indian Evidence Act Section 65B.',
      steps: [
        'Sealing hashes are generated prior to cloud synchronization.',
        'Any modification of pixels invalidates the digital seal signature.',
        'FSL confirmation dockets are linked automatically upon lab verification.'
      ]
    }
  ];

  return (
    <div className="help-page">
      <header className="page-header">
        <div>
          <h2 className="page-title">Forensic SOPs & Officer Handbook</h2>
          <p className="page-subtitle">Standard operating procedures, colorimetric benchmarks, and legal guidelines.</p>
        </div>
      </header>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {sops.map((sop, idx) => (
          <div key={idx} className="card" style={{ padding: '24px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '12px' }}>
              <BookOpen size={20} color="var(--primary-navy)" />
              <h3 style={{ fontSize: '16px', fontWeight: 800, color: 'var(--slate-900)' }}>{sop.title}</h3>
            </div>
            <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginBottom: '16px', lineHeight: 1.5 }}>{sop.desc}</p>
            <div style={{ background: 'var(--slate-50)', border: '1px solid var(--slate-200)', borderRadius: '6px', padding: '14px' }}>
              <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {sop.steps.map((st, i) => (
                  <li key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--slate-700)' }}>
                    <CheckCircle2 size={14} color="var(--success-green)" />
                    <span>{st}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .help-page {
          padding: 28px;
          max-width: var(--content-max-width);
          margin: 0 auto;
        }
      `}</style>
    </div>
  );
}
