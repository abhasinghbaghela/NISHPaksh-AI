import crypto from 'crypto';

const makeSampleSvg = (label, color) => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23F1F5F9"/><circle cx="160" cy="120" r="55" fill="${encodeURIComponent(color)}" stroke="%230B3C8C" stroke-width="4"/><text x="160" y="30" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="%230F172A">${encodeURIComponent(label)}</text><text x="160" y="215" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%2364748B">NDPS Section 52A Sealed Evidence</text></svg>`;

const makeRefCardSvg = () => `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="320" height="240"><rect width="320" height="240" fill="%23FFFFFF"/><rect x="20" y="20" width="40" height="35" fill="%23735244"/><rect x="70" y="20" width="40" height="35" fill="%23C29682"/><rect x="120" y="20" width="40" height="35" fill="%23627A9D"/><rect x="170" y="20" width="40" height="35" fill="%23576C43"/><rect x="220" y="20" width="40" height="35" fill="%238580B1"/><rect x="270" y="20" width="35" height="35" fill="%2367BDAB"/><rect x="20" y="65" width="40" height="35" fill="%23D96831"/><rect x="70" y="65" width="40" height="35" fill="%2349549F"/><rect x="120" y="65" width="40" height="35" fill="%23C15A63"/><rect x="170" y="65" width="40" height="35" fill="%235E3C6C"/><rect x="220" y="65" width="40" height="35" fill="%239DBC40"/><rect x="270" y="65" width="35" height="35" fill="%23E0A32E"/><text x="160" y="145" font-family="sans-serif" font-size="12" font-weight="bold" text-anchor="middle" fill="%230B3C8C">COLOR REFERENCE TARGET CR-1</text><text x="160" y="165" font-family="sans-serif" font-size="10" text-anchor="middle" fill="%23D97706">Standard Reference Channel Baseline</text></svg>`;

// In-memory case store seeded with initial reference cases
export const cases = [
  {
    id: "NDPS-2026-001234",
    evidenceId: "EVD-2026-881294",
    date: "14 Nov 2026",
    time: "10:24 AM",
    timestamp: "2026-11-14T10:24:00.000Z",
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
    },
    calibration: {
      status: "Calibrated",
      referenceBaseline: { r: 242, g: 240, b: 238, luminance: 240 },
      colorDeviation: "Normal Daylight Balanced"
    },
    custodyChain: [
      { step: "Field Seizure", actor: "Insp. Rajesh Kumar", time: "14 Nov 2026, 10:24 AM", status: "Completed" },
      { step: "Evidence Sealing", actor: "Insp. Rajesh Kumar", time: "14 Nov 2026, 10:28 AM", status: "Completed" },
      { step: "FSL Transmission", actor: "MHA Secure Courier", time: "14 Nov 2026, 01:15 PM", status: "Completed" },
      { step: "FSL Verification", actor: "Dr. Sunita Sharma (Regional FSL)", time: "14 Nov 2026, 04:30 PM", status: "Verified" }
    ]
  },
  {
    id: "NDPS-2026-001233",
    evidenceId: "EVD-2026-749103",
    date: "13 Nov 2026",
    time: "01:12 PM",
    timestamp: "2026-11-13T13:12:00.000Z",
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
    referenceCardImage: null,
    calibration: {
      status: "Calibrated",
      referenceBaseline: { r: 235, g: 232, b: 230, luminance: 232 },
      colorDeviation: "Slight Under-exposure Detected"
    },
    custodyChain: [
      { step: "Field Seizure", actor: "Insp. Rajesh Kumar", time: "13 Nov 2026, 01:12 PM", status: "Completed" },
      { step: "Evidence Sealing", actor: "Insp. Rajesh Kumar", time: "13 Nov 2026, 01:20 PM", status: "Completed" },
      { step: "FSL Transmission", actor: "Pending Dispatch", time: "13 Nov 2026, 03:00 PM", status: "In Transit" }
    ]
  },
  {
    id: "NDPS-2026-001232",
    evidenceId: "EVD-2026-619284",
    date: "12 Nov 2026",
    time: "11:30 AM",
    timestamp: "2026-11-12T11:30:00.000Z",
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
    referenceCardImage: null,
    calibration: {
      status: "Calibrated",
      referenceBaseline: { r: 245, g: 245, b: 240, luminance: 243 },
      colorDeviation: "Normal Daylight Balanced"
    },
    custodyChain: [
      { step: "Field Seizure", actor: "Insp. Rajesh Kumar", time: "12 Nov 2026, 11:30 AM", status: "Completed" },
      { step: "Evidence Sealing", actor: "Insp. Rajesh Kumar", time: "12 Nov 2026, 11:40 AM", status: "Completed" },
      { step: "FSL Transmission", actor: "Regional FSL Courier", time: "12 Nov 2026, 02:00 PM", status: "Completed" },
      { step: "FSL Verification", actor: "Dr. Sunita Sharma (Regional FSL)", time: "12 Nov 2026, 05:15 PM", status: "Verified" }
    ]
  }
];

export function getAllCases() {
  return cases;
}

export function getCaseById(id) {
  return cases.find(c => c.id.toLowerCase() === id.toLowerCase() || c.evidenceId.toLowerCase() === id.toLowerCase());
}

export function addCase(caseData) {
  // Compute digital seal hash if not present
  if (!caseData.digitalSeal) {
    const hash = crypto.createHash('sha256')
      .update(JSON.stringify({
        id: caseData.id,
        evidenceId: caseData.evidenceId,
        timestamp: caseData.timestamp || new Date().toISOString(),
        officer: caseData.officer,
        location: caseData.location,
        sampleImagesCount: (caseData.sampleImages || []).length,
        hasReferenceCard: !!caseData.referenceCardImage
      }))
      .digest('hex');
    caseData.digitalSeal = `SHA256:${hash}`;
  }

  // Prepend to cases list
  cases.unshift(caseData);
  return caseData;
}

export function updateCase(id, updateData) {
  const index = cases.findIndex(c => c.id.toLowerCase() === id.toLowerCase());
  if (index === -1) return null;
  cases[index] = { ...cases[index], ...updateData };
  return cases[index];
}
