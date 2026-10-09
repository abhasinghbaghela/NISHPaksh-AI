import React, { createContext, useContext, useState, useEffect } from 'react';
import { fetchCases } from '../services/api.js';
import { saveCaseToVault, getAllVaultCases } from '../services/vaultDb.js';

const makeSampleSvg = (label, color) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23F1F5F9"/><circle cx="160" cy="120" r="55" fill="${encodeURIComponent(color)}" stroke="%230B3C8C" stroke-width="4"/><text x="160" y="30" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="%230F172A">${encodeURIComponent(label)}</text><text x="160" y="215" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%2364748B">NDPS Section 52A Sealed Evidence</text></svg>`;

const makeRefCardSvg = () => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23FFFFFF"/><rect x="20" y="20" width="40" height="35" fill="%23735244"/><rect x="70" y="20" width="40" height="35" fill="%23C29682"/><rect x="120" y="20" width="40" height="35" fill="%23627A9D"/><rect x="170" y="20" width="40" height="35" fill="%23576C43"/><rect x="220" y="20" width="40" height="35" fill="%238580B1"/><rect x="270" y="20" width="35" height="35" fill="%2367BDAB"/><rect x="20" y="65" width="40" height="35" fill="%23D96831"/><rect x="70" y="65" width="40" height="35" fill="%2349549F"/><rect x="120" y="65" width="40" height="35" fill="%23C15A63"/><rect x="170" y="65" width="40" height="35" fill="%235E3C6C"/><rect x="220" y="65" width="40" height="35" fill="%239DBC40"/><rect x="270" y="65" width="35" height="35" fill="%23E0A32E"/><text x="160" y="145" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="%230B3C8C">COLOR REFERENCE TARGET CR-1</text><text x="160" y="165" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%23D97706">Standard Reference Channel Baseline</text></svg>`;

export const INITIAL_DEMO_CASES = [
  {
    id: "NDPS-2026-001234",
    evidenceId: "EVD-2026-881294",
    date: "14 Nov 2026",
    time: "10:24 AM",
    location: "New Delhi",
    coordinates: "28.6139° N, 77.2090° E",
    officer: "FO12345 - Insp. Rajesh Kumar",
    station: "Connaught Place PS, Delhi",
    substance: "Cocaine",
    testKit: "Scott Reagent",
    reagent: "Scott",
    sampleType: "Powder (White)",
    confidence: 92,
    status: "Verified",
    digitalSeal: "SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069",
    sampleImages: [
      { id: 1, label: "Sample Frame #1", url: makeSampleSvg("Sample #1 - Reagent Spot", "#0047AB"), dataUrl: makeSampleSvg("Sample #1 - Reagent Spot", "#0047AB") },
      { id: 2, label: "Sample Frame #2", url: makeSampleSvg("Sample #2 - Vial Reaction", "#0047AB"), dataUrl: makeSampleSvg("Sample #2 - Vial Reaction", "#0047AB") },
      { id: 3, label: "Sample Frame #3", url: makeSampleSvg("Sample #3 - Precipitate Close-up", "#003380"), dataUrl: makeSampleSvg("Sample #3 - Precipitate Close-up", "#003380") },
      { id: 4, label: "Sample Frame #4", url: makeSampleSvg("Sample #4 - Side Angle", "#0047AB"), dataUrl: makeSampleSvg("Sample #4 - Side Angle", "#0047AB") },
      { id: 5, label: "Sample Frame #5", url: makeSampleSvg("Sample #5 - Two-phase Reaction", "#002B66"), dataUrl: makeSampleSvg("Sample #5 - Two-phase Reaction", "#002B66") }
    ],
    referenceCardImage: {
      id: "ref-card",
      label: "Color Calibration Reference Card",
      url: makeRefCardSvg(),
      dataUrl: makeRefCardSvg()
    }
  },
  {
    id: "NDPS-2026-001233",
    evidenceId: "EVD-2026-749103",
    date: "13 Nov 2026",
    time: "01:12 PM",
    location: "Jaipur",
    coordinates: "26.9124° N, 75.7873° E",
    officer: "FO12345 - Insp. Rajesh Kumar",
    station: "Jaipur Central Station",
    substance: "Inconclusive",
    testKit: "Marquis Reagent",
    reagent: "Marquis",
    sampleType: "Powder (Brown)",
    confidence: 45,
    status: "Pending FSL",
    digitalSeal: "SHA256:3a42d881ef25879a95781a7b69c4d9b9d3b482329b3524b06a236cd0a3b2b512",
    sampleImages: [],
    referenceCardImage: null
  },
  {
    id: "NDPS-2026-001232",
    evidenceId: "EVD-2026-619284",
    date: "12 Nov 2026",
    time: "11:30 AM",
    location: "Udaipur",
    coordinates: "24.5854° N, 73.7125° E",
    officer: "FO12345 - Insp. Rajesh Kumar",
    station: "Udaipur City Checkpost",
    substance: "Methamphetamine",
    testKit: "Mandelin Reagent",
    reagent: "Mandelin",
    sampleType: "Crystal",
    confidence: 87,
    status: "Verified",
    digitalSeal: "SHA256:5e884898da28047151d0e56f8dc6292773603d0d6aabbdd62a11ef721d1542d8",
    sampleImages: [],
    referenceCardImage: null
  }
];

function getSynchronousInitialCases() {
  try {
    const stored = localStorage.getItem('nishpaksh_local_cases_meta');
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed) && parsed.length > 0) {
        const merged = [...parsed];
        INITIAL_DEMO_CASES.forEach(demo => {
          if (!merged.find(m => m.id === demo.id)) {
            merged.push(demo);
          }
        });
        return merged;
      }
    }
  } catch (e) {
    // ignore
  }
  return INITIAL_DEMO_CASES;
}

const CasesContext = createContext(null);

export function CasesProvider({ children }) {
  const [cases, setCases] = useState(getSynchronousInitialCases);
  const [loading, setLoading] = useState(false);
  const [lastSyncTime, setLastSyncTime] = useState(new Date().toISOString());

  const loadCases = async () => {
    setLoading(true);
    try {
      // 1. First retrieve all stored cases from IndexedDB vault (handles high-res images)
      let vaultRecords = [];
      try {
        vaultRecords = await getAllVaultCases();
      } catch (dbErr) {
        console.warn('IndexedDB retrieval warning:', dbErr);
      }

      // 2. Fetch from backend API
      let backendCases = [];
      try {
        const data = await fetchCases();
        if (data && data.cases && Array.isArray(data.cases)) {
          backendCases = data.cases;
        }
      } catch (apiErr) {
        console.warn('Backend fetch warning, running offline vault mode:', apiErr);
      }

      // 3. Intelligently merge all sources (Backend + IndexedDB Vault + Demo Cases)
      setCases(prev => {
        const map = new Map();

        // Seed with demo cases
        INITIAL_DEMO_CASES.forEach(c => map.set(c.id, c));

        // Merge existing state
        prev.forEach(c => map.set(c.id, { ...(map.get(c.id) || {}), ...c }));

        // Merge IndexedDB records (has full images and complete forensic objects)
        vaultRecords.forEach(c => map.set(c.id, { ...(map.get(c.id) || {}), ...c }));

        // Merge backend records
        backendCases.forEach(c => map.set(c.id, { ...(map.get(c.id) || {}), ...c }));

        const mergedList = Array.from(map.values());

        // Sort descending by timestamp or date
        return mergedList.sort((a, b) => {
          const tA = a.timestamp ? new Date(a.timestamp).getTime() : 0;
          const tB = b.timestamp ? new Date(b.timestamp).getTime() : 0;
          return tB - tA;
        });
      });

      setLastSyncTime(new Date().toISOString());
    } catch (err) {
      console.warn('Could not fully sync cases store:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCases();
  }, []);

  const addCaseToState = (newCase) => {
    if (!newCase || !newCase.id) return;

    // 1. Immediately update React state (top of list)
    setCases(prev => [newCase, ...prev.filter(c => c.id !== newCase.id)]);

    // 2. Persist full case with images into IndexedDB vault
    saveCaseToVault(newCase).catch(err => {
      console.warn('Failed saving to IndexedDB vault:', err);
    });

    // 3. Persist lightweight metadata in localStorage for synchronous fast boot
    try {
      const meta = {
        id: newCase.id,
        evidenceId: newCase.evidenceId,
        date: newCase.date,
        time: newCase.time,
        timestamp: newCase.timestamp || new Date().toISOString(),
        location: newCase.location,
        coordinates: newCase.coordinates,
        officer: newCase.officer,
        station: newCase.station,
        substance: newCase.substance,
        testKit: newCase.testKit,
        reagent: newCase.reagent,
        sampleType: newCase.sampleType,
        confidence: newCase.confidence || 92,
        status: newCase.status || 'Verified',
        digitalSeal: newCase.digitalSeal,
        sampleImagesCount: (newCase.sampleImages || []).length,
        hasReferenceCard: !!newCase.referenceCardImage
      };
      const stored = localStorage.getItem('nishpaksh_local_cases_meta');
      const existing = stored ? JSON.parse(stored) : [];
      localStorage.setItem(
        'nishpaksh_local_cases_meta',
        JSON.stringify([meta, ...existing.filter(c => c.id !== meta.id)])
      );
    } catch (storageErr) {
      console.warn('LocalStorage metadata write warning:', storageErr);
    }
  };

  const getCaseById = (id) => {
    if (!id) return null;
    return cases.find(
      c => (c.id && c.id.toLowerCase() === id.toLowerCase()) ||
           (c.evidenceId && c.evidenceId.toLowerCase() === id.toLowerCase())
    );
  };

  return (
    <CasesContext.Provider value={{
      cases,
      loading,
      lastSyncTime,
      loadCases,
      addCaseToState,
      getCaseById
    }}>
      {children}
    </CasesContext.Provider>
  );
}

export function useCases() {
  const ctx = useContext(CasesContext);
  if (!ctx) throw new Error('useCases must be used within CasesProvider');
  return ctx;
}
