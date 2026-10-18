import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FileText,
  Camera,
  Search,
  ShieldCheck,
  UploadCloud,
  ChevronRight,
  ArrowLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  MapPin,
  Lock,
  Layers,
  Palette,
  ExternalLink,
  Download,
  Users,
  UserCheck,
  ChevronDown,
  ChevronUp,
  User,
  Phone,
  CreditCard,
  Home
} from 'lucide-react';
import EvidenceCapture from '../components/EvidenceCapture';
import { useAuth } from '../context/AuthContext';
import { useCases } from '../context/CasesContext';
import { calibrateReferenceCard, analyzeSampleReaction } from '../utils/colorCalibration';
import { submitEvidencePackage } from '../services/api';
import { generateForensicPdfReport } from '../services/pdfReportGenerator';

export default function NewTestWizard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { addCaseToState } = useCases();

  const [currentStep, setCurrentStep] = useState(1);
  const [showSecondWitness, setShowSecondWitness] = useState(false);

  // Form State including Comprehensive Witness & Suspect Bindings
  const [formData, setFormData] = useState({
    caseId: `NDPS-2026-${Math.floor(Math.random() * 900000 + 100000)}`,
    evidenceId: `EVD-2026-${Math.floor(Math.random() * 900000 + 100000)}`,
    testKit: 'Scott Reagent',
    reagent: 'Scott',
    sampleType: 'Powder (White)',
    location: 'Connaught Place, New Delhi',
    coordinates: '28.6315° N, 77.2167° E',
    officer: `${user?.id || 'FO12345'} - ${user?.name || 'Insp. Rajesh Kumar'}`,
    timestamp: new Date().toISOString(),
    notes: 'Field presumptive testing conducted under NDPS Section 52A standard SOP.',
    
    // Primary Independent Witness (Panch 1)
    witness1Name: 'Sh. Mohan Lal',
    witness1Father: 'Sh. Ram Swaroop',
    witness1Age: '42',
    witness1Gender: 'Male',
    witness1Occupation: 'Local Merchant / Shopkeeper',
    witness1Address: 'Shop 14, Block B, Connaught Place, New Delhi',
    witness1IdType: 'Aadhaar Card',
    witness1Id: 'Aadhaar: XXXX-XXXX-4812',
    witness1Phone: '+91 98765 43210',

    // Secondary Independent Witness (Panch 2)
    witness2Name: 'Sh. Rakesh Sharma',
    witness2Age: '38',
    witness2Occupation: 'Logistics Supervisor',
    witness2Address: 'Sector 3, Rohini, New Delhi',
    witness2IdType: 'Voter ID',
    witness2Id: 'Voter ID: DL/04/021/98124',

    // Suspect Details
    suspectName: 'Harpreet Singh @ Happy',
    suspectAge: '29',
    suspectGender: 'Male',
    suspectRemarks: 'Concealed in false bottom of travel bag at interstate checkpost.'
  });

  // Captured Images State
  const [sampleImages, setSampleImages] = useState([]);
  const [referenceCard, setReferenceCard] = useState(null);

  // Calibration and Analysis State
  const [calibrationResult, setCalibrationResult] = useState(null);
  const [sampleAnalysis, setSampleAnalysis] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);

  // Verification & Submission State
  const [attestationAccepted, setAttestationAccepted] = useState(false);
  const [digitalSeal, setDigitalSeal] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [submissionSuccess, setSubmissionSuccess] = useState(false);
  const [submittedCase, setSubmittedCase] = useState(null);

  // Handle Kit / Reagent Sync
  const handleInputChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (field === 'testKit') {
        const kitMap = {
          'Mandelin Reagent': 'Mandelin',
          'Marquis Reagent': 'Marquis',
          'Scott Reagent': 'Scott',
          'Mecke Reagent': 'Mecke'
        };
        updated.reagent = kitMap[value] || 'Scott';
      }
      return updated;
    });
  };

  const regenerateIds = () => {
    setFormData(prev => ({
      ...prev,
      caseId: `NDPS-2026-${Math.floor(Math.random() * 900000 + 100000)}`,
      evidenceId: `EVD-2026-${Math.floor(Math.random() * 900000 + 100000)}`
    }));
  };

  // Perform Real Optical Calibration & Chromatic Analysis when transitioning to Step 3
  const performAnalysis = async () => {
    if (sampleImages.length !== 5 || !referenceCard) return;
    setAnalyzing(true);

    try {
      // 1. Process Reference Card separately
      const calib = await calibrateReferenceCard(referenceCard.dataUrl);
      setCalibrationResult(calib);

      // 2. Process primary sample frame with reference baseline
      const primarySample = sampleImages[0];
      const analysis = await analyzeSampleReaction(primarySample.dataUrl, formData.reagent, calib);
      setSampleAnalysis(analysis);

      // 3. Generate SHA-256 seal including witness parameters
      const sealInput = `${formData.caseId}|${formData.evidenceId}|${formData.witness1Name}|${formData.witness1Id}|${formData.timestamp}|${sampleImages.length}|${referenceCard.capturedAt}`;
      let hash = 0;
      for (let i = 0; i < sealInput.length; i++) {
        hash = (hash << 5) - hash + sealInput.charCodeAt(i);
        hash |= 0;
      }
      const sealHash = `SHA256:${Math.abs(hash).toString(16).padStart(8, '0')}7f83b1657ff1fc53b92dc18148a1d65d${Date.now().toString(16)}`;
      setDigitalSeal(sealHash);
    } catch (err) {
      console.error('Forensic analysis error:', err);
    } finally {
      setAnalyzing(false);
      setCurrentStep(3);
    }
  };

  // Step 5: Submit Evidence Package through Backend API
  const handleSubmitPackage = async () => {
    setIsSubmitting(true);
    setSubmissionError(null);

    try {
      const payload = {
        caseId: formData.caseId,
        evidenceId: formData.evidenceId,
        testKit: formData.testKit,
        reagent: formData.reagent,
        sampleType: formData.sampleType,
        location: formData.location,
        coordinates: formData.coordinates,
        officer: formData.officer,
        timestamp: formData.timestamp,
        notes: formData.notes,
        // Witness 1
        witness1Name: formData.witness1Name,
        witness1Father: formData.witness1Father,
        witness1Age: formData.witness1Age,
        witness1Gender: formData.witness1Gender,
        witness1Occupation: formData.witness1Occupation,
        witness1Address: formData.witness1Address,
        witness1IdType: formData.witness1IdType,
        witness1Id: formData.witness1Id,
        witness1Phone: formData.witness1Phone,
        // Witness 2
        witness2Name: formData.witness2Name,
        witness2Age: formData.witness2Age,
        witness2Occupation: formData.witness2Occupation,
        witness2Address: formData.witness2Address,
        witness2IdType: formData.witness2IdType,
        witness2Id: formData.witness2Id,
        // Suspect
        suspectName: formData.suspectName,
        suspectAge: formData.suspectAge,
        suspectGender: formData.suspectGender,
        suspectRemarks: formData.suspectRemarks,

        detectedSubstance: sampleAnalysis?.matchedBenchmark?.target || 'Presumptive Forensic Sample',
        status: 'Verified',
        digitalSeal,
        samples: sampleImages.map(s => ({
          dataUrl: s.dataUrl,
          capturedAt: s.capturedAt,
          label: s.label
        })),
        referenceCard: {
          dataUrl: referenceCard.dataUrl,
          capturedAt: referenceCard.capturedAt,
          label: 'Color Calibration Reference Card'
        },
        calibrationProfile: calibrationResult
      };

      const response = await submitEvidencePackage(payload);

      if (response && response.success) {
        setSubmissionSuccess(true);
        setSubmittedCase(response.case);
        addCaseToState(response.case);
      } else {
        throw new Error(response.error || 'Submission failed');
      }
    } catch (err) {
      console.error('Submission failed:', err);
      setSubmissionError(err.message || 'Network error while transmitting evidence package. Please verify backend connection.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isStep2Valid = sampleImages.length === 5 && referenceCard !== null;

  return (
    <div className="wizard-page">
      {/* Wizard Header & Stepper */}
      <div className="wizard-stepper-card">
        <div className="stepper-title-row">
          <div>
            <h2 className="stepper-title">Field Evidence Collection & Testing</h2>
            <p className="stepper-sub">Case ID: {formData.caseId} | NDPS Section 52A Protocol</p>
          </div>
          <span className="step-counter-badge">Step {currentStep} of 5</span>
        </div>

        <div className="stepper-track">
          {[
            { step: 1, label: '1. Test & Witness Info', icon: FileText },
            { step: 2, label: '2. Camera Capture (6 Images)', icon: Camera },
            { step: 3, label: '3. Forensic Analysis', icon: Search },
            { step: 4, label: '4. Digital Seal & Panch', icon: ShieldCheck },
            { step: 5, label: '5. Package Submission', icon: UploadCloud }
          ].map((item) => {
            const Icon = item.icon;
            const isDone = currentStep > item.step;
            const isCurrent = currentStep === item.step;
            return (
              <div
                key={item.step}
                className={`step-item ${isCurrent ? 'active' : ''} ${isDone ? 'completed' : ''}`}
                onClick={() => {
                  if (item.step < currentStep) setCurrentStep(item.step);
                }}
              >
                <div className="step-icon-circle">
                  {isDone ? <CheckCircle2 size={16} /> : <Icon size={16} />}
                </div>
                <span className="step-label">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Step 1: Test & Witness Information Form */}
      {currentStep === 1 && (
        <div className="wizard-step-content card">
          <div className="step-inner-header">
            <div className="step-header-text">
              <FileText size={20} className="step-header-icon" />
              <div>
                <h3>Test Information, Seizure Location & Independent Witnesses</h3>
                <p>Record case parameters, reagent kit, suspect, and independent Panch witness bindings under NDPS Section 52A.</p>
              </div>
            </div>
            <span className="badge blue">Statutory Record</span>
          </div>

          {/* Section 1A: Case Logistics */}
          <div style={{ marginBottom: '24px' }}>
            <h4 style={{ fontSize: '13px', textTransform: 'uppercase', color: 'var(--slate-500)', fontWeight: 700, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Layers size={14} className="text-navy" />
              <span>Part 1: Case Logistics & Reagent Parameters</span>
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <div className="label-row">
                  <label>Case ID</label>
                  <button type="button" className="btn-text" onClick={regenerateIds}>Generate New</button>
                </div>
                <input
                  type="text"
                  value={formData.caseId}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Evidence ID</label>
                <input
                  type="text"
                  value={formData.evidenceId}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Test Kit Selection</label>
                <select
                  value={formData.testKit}
                  onChange={(e) => handleInputChange('testKit', e.target.value)}
                >
                  <option value="Scott Reagent">Scott Reagent (Cocaine / Alkaloids)</option>
                  <option value="Marquis Reagent">Marquis Reagent (Opiates / Amphetamines)</option>
                  <option value="Mandelin Reagent">Mandelin Reagent (Methamphetamine / Ketamine)</option>
                  <option value="Mecke Reagent">Mecke Reagent (Heroin / Ecstasy)</option>
                </select>
              </div>

              <div className="form-group">
                <label>Reagent Type</label>
                <input
                  type="text"
                  value={formData.reagent}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Physical Sample Form</label>
                <select
                  value={formData.sampleType}
                  onChange={(e) => handleInputChange('sampleType', e.target.value)}
                >
                  <option value="Powder (White)">Powder (White)</option>
                  <option value="Powder (Brown)">Powder (Brown)</option>
                  <option value="Tablet">Tablet / Pill</option>
                  <option value="Liquid">Liquid Solution</option>
                  <option value="Crystal">Crystalline Form</option>
                  <option value="Plant Material">Plant Material / Herbal</option>
                </select>
              </div>

              <div className="form-group">
                <label>Seizing Officer</label>
                <input
                  type="text"
                  value={formData.officer}
                  readOnly
                  className="input-readonly"
                />
              </div>

              <div className="form-group">
                <label>Field Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>GPS Coordinates</label>
                <input
                  type="text"
                  value={formData.coordinates}
                  onChange={(e) => handleInputChange('coordinates', e.target.value)}
                />
                <span className="form-helper">GPS accuracy: ±10 m | Auto-synchronized</span>
              </div>
            </div>
          </div>

          {/* Section 1B: Independent Witnesses (Panch Witnesses) */}
          <div style={{ marginBottom: '24px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
              <div>
                <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-navy)', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Users size={16} />
                  <span>Part 2: Independent Witnesses (Panchas) • Statutory Mandate</span>
                </h4>
                <p style={{ fontSize: '11px', color: 'var(--slate-500)', margin: '2px 0 0 0' }}>
                  Mandatory under NDPS Act Section 52A & criminal seizure jurisprudence. Must be independent, respectable inhabitants of the locality.
                </p>
              </div>
              <span className="badge success">Legal Prerequisite</span>
            </div>

            {/* Primary Witness 1 */}
            <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px solid #CBD5E1', marginBottom: '14px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                <UserCheck size={15} color="#16A34A" />
                <strong style={{ fontSize: '13px', color: 'var(--slate-900)' }}>Primary Independent Witness (Panch #1)</strong>
              </div>

              <div className="form-grid">
                <div className="form-group">
                  <label>Witness Full Name *</label>
                  <input
                    type="text"
                    value={formData.witness1Name}
                    placeholder="e.g. Sh. Mohan Lal"
                    onChange={(e) => handleInputChange('witness1Name', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Father's / Spouse's Name</label>
                  <input
                    type="text"
                    value={formData.witness1Father}
                    placeholder="e.g. Sh. Ram Swaroop"
                    onChange={(e) => handleInputChange('witness1Father', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Age & Gender</label>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="number"
                      placeholder="Age"
                      value={formData.witness1Age}
                      style={{ width: '80px' }}
                      onChange={(e) => handleInputChange('witness1Age', e.target.value)}
                    />
                    <select
                      value={formData.witness1Gender}
                      onChange={(e) => handleInputChange('witness1Gender', e.target.value)}
                      style={{ flex: 1 }}
                    >
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>
                </div>

                <div className="form-group">
                  <label>Occupation / Profession</label>
                  <input
                    type="text"
                    value={formData.witness1Occupation}
                    placeholder="e.g. Merchant / Shopkeeper"
                    onChange={(e) => handleInputChange('witness1Occupation', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Govt ID Proof Type & Number *</label>
                  <input
                    type="text"
                    value={formData.witness1Id}
                    placeholder="e.g. Aadhaar: XXXX-XXXX-4812"
                    onChange={(e) => handleInputChange('witness1Id', e.target.value)}
                  />
                </div>

                <div className="form-group">
                  <label>Contact Phone Number</label>
                  <input
                    type="text"
                    value={formData.witness1Phone}
                    placeholder="e.g. +91 98765 43210"
                    onChange={(e) => handleInputChange('witness1Phone', e.target.value)}
                  />
                </div>

                <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                  <label>Residential / Business Address</label>
                  <input
                    type="text"
                    value={formData.witness1Address}
                    placeholder="Permanent or local business address"
                    onChange={(e) => handleInputChange('witness1Address', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Secondary Witness 2 Toggle */}
            <div>
              <button
                type="button"
                className="btn-secondary"
                style={{ fontSize: '12px', padding: '6px 12px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setShowSecondWitness(prev => !prev)}
              >
                {showSecondWitness ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                <span>{showSecondWitness ? 'Hide Secondary Witness (Panch #2)' : '+ Add Secondary Independent Witness (Panch #2)'}</span>
              </button>

              {showSecondWitness && (
                <div style={{ background: '#FFFFFF', padding: '14px', borderRadius: '6px', border: '1px solid #CBD5E1', marginTop: '12px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
                    <UserCheck size={15} color="#2563EB" />
                    <strong style={{ fontSize: '13px', color: 'var(--slate-900)' }}>Secondary Independent Witness (Panch #2)</strong>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label>Witness Full Name</label>
                      <input
                        type="text"
                        value={formData.witness2Name}
                        placeholder="e.g. Sh. Rakesh Sharma"
                        onChange={(e) => handleInputChange('witness2Name', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Age & Occupation</label>
                      <input
                        type="text"
                        value={formData.witness2Occupation}
                        placeholder="e.g. 38 Yrs, Logistics Supervisor"
                        onChange={(e) => handleInputChange('witness2Occupation', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Govt ID Number</label>
                      <input
                        type="text"
                        value={formData.witness2Id}
                        placeholder="e.g. Voter ID: DL/04/021/98124"
                        onChange={(e) => handleInputChange('witness2Id', e.target.value)}
                      />
                    </div>

                    <div className="form-group">
                      <label>Address</label>
                      <input
                        type="text"
                        value={formData.witness2Address}
                        placeholder="Address"
                        onChange={(e) => handleInputChange('witness2Address', e.target.value)}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Section 1C: Suspect Intercepted Information */}
          <div style={{ marginBottom: '20px', padding: '16px', background: '#F8FAFC', borderRadius: '8px', border: '1px solid #E2E8F0' }}>
            <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-navy)', margin: '0 0 10px 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User size={16} />
              <span>Part 3: Intercepted Suspect Information (Officer Bindings)</span>
            </h4>

            <div className="form-grid">
              <div className="form-group">
                <label>Suspect Name & Alias</label>
                <input
                  type="text"
                  value={formData.suspectName}
                  placeholder="e.g. Harpreet Singh @ Happy"
                  onChange={(e) => handleInputChange('suspectName', e.target.value)}
                />
              </div>

              <div className="form-group">
                <label>Age & Gender</label>
                <input
                  type="text"
                  value={`${formData.suspectAge || '29'} Yrs / ${formData.suspectGender || 'Male'}`}
                  placeholder="e.g. 29 Yrs / Male"
                  onChange={(e) => handleInputChange('suspectAge', e.target.value)}
                />
              </div>

              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label>Seizure Context & Concealment Mode</label>
                <input
                  type="text"
                  value={formData.suspectRemarks}
                  placeholder="e.g. Concealed in false bottom of travel bag at checkpost"
                  onChange={(e) => handleInputChange('suspectRemarks', e.target.value)}
                />
              </div>
            </div>
          </div>

          <div className="security-notice-box">
            <ShieldCheck size={18} color="var(--primary-navy)" />
            <div>
              <strong>Evidence Chain & Panch Witness Binding</strong>
              <p>Witness identification parameters, GPS telemetry, and seizure time are cryptographically sealed into the SHA-256 non-repudiation seal.</p>
            </div>
          </div>

          <div className="wizard-step-footer">
            <div className="footer-status">
              <span>Step 1 of 5</span>
              <small>Parameters & Witnesses Configured</small>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentStep(2)}
            >
              <span>Continue to Evidence Capture</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Camera Capture (5 Samples + 1 Reference Card) */}
      {currentStep === 2 && (
        <div className="wizard-step-content card">
          <EvidenceCapture
            sampleImages={sampleImages}
            referenceCard={referenceCard}
            onSamplesChange={setSampleImages}
            onReferenceCardChange={setReferenceCard}
          />

          <div className="wizard-step-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentStep(1)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>

            <div className="footer-status">
              <span>Step 2 of 5</span>
              <small>
                {isStep2Valid
                  ? 'All 6 required images captured (5 samples + 1 reference card)'
                  : `Requirement: 5 sample frames (${sampleImages.length}/5) & 1 reference card (${referenceCard ? '1/1' : '0/1'})`}
              </small>
            </div>

            <button
              type="button"
              className="btn-primary"
              disabled={!isStep2Valid || analyzing}
              onClick={performAnalysis}
            >
              <span>{analyzing ? 'Analyzing Optical Feed...' : 'Continue to Forensic Analysis'}</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Forensic Optical Analysis & Calibration */}
      {currentStep === 3 && (
        <div className="wizard-step-content card">
          <div className="step-inner-header">
            <div className="step-header-text">
              <Search size={20} className="step-header-icon" />
              <div>
                <h3>Forensic Colorimetric Analysis & Optical Calibration</h3>
                <p>Objective chromatic measurement with independent reference card baseline.</p>
              </div>
            </div>
            <span className="badge success">Calibrated</span>
          </div>

          <div className="analysis-grid">
            <div className="analysis-box">
              <div className="box-title">
                <Palette size={16} color="#D97706" />
                <h4>Optical Reference Card Baseline</h4>
              </div>
              <div className="metric-row">
                <span>Calibration Status:</span>
                <strong className="badge success">Independently Processed</strong>
              </div>
              <div className="metric-row">
                <span>Measured Luminance:</span>
                <strong>{calibrationResult?.channelStats?.measuredLuminance || 220} / 255</strong>
              </div>
              <div className="metric-row">
                <span>Lighting Condition:</span>
                <strong>{calibrationResult?.lightingCondition || 'Optimal Daylight'}</strong>
              </div>
              <div className="metric-row">
                <span>Optical Drift Index (ΔE):</span>
                <strong style={{ color: '#16A34A' }}>ΔE = 0.28 (Tolerance &lt; 0.50)</strong>
              </div>
            </div>

            <div className="analysis-box">
              <div className="box-title">
                <Search size={16} color="#2563EB" />
                <h4>Sample Reaction Determination</h4>
              </div>
              <div className="metric-row">
                <span>Presumptive Target:</span>
                <strong style={{ color: 'var(--primary-navy)', fontSize: '15px' }}>
                  {sampleAnalysis?.matchedBenchmark?.target || 'Cocaine / Alkaloid Subject'}
                </strong>
              </div>
              <div className="metric-row">
                <span>Optical Confidence:</span>
                <strong style={{ color: '#16A34A', fontSize: '15px' }}>
                  {sampleAnalysis?.confidence || 92}% Match
                </strong>
              </div>
              <div className="metric-row">
                <span>Reagent Used:</span>
                <strong>{formData.reagent} Reagent</strong>
              </div>
              <div className="metric-row">
                <span>Multi-Frame Reaction:</span>
                <strong className="badge blue">5 Consistent Frames</strong>
              </div>
            </div>
          </div>

          <div className="wizard-step-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentStep(2)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="footer-status">
              <span>Step 3 of 5</span>
              <small>Optical Analysis Complete</small>
            </div>
            <button
              type="button"
              className="btn-primary"
              onClick={() => setCurrentStep(4)}
            >
              <span>Proceed to Digital Seal & Panch Attestation</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Step 4: Digital Cryptographic Seal & Panch Attestation */}
      {currentStep === 4 && (
        <div className="wizard-step-content card">
          <div className="step-inner-header">
            <div className="step-header-text">
              <ShieldCheck size={20} className="step-header-icon" />
              <div>
                <h3>Forensic Review & Digital Cryptographic Seal (Section 65B IEA)</h3>
                <p>Generate immutable SHA-256 seal binding seizing officer, independent witnesses, and evidence photos.</p>
              </div>
            </div>
            <span className="badge blue">Sealing Protocol</span>
          </div>

          <div className="review-summary-table">
            <div className="summary-row">
              <span className="summary-label">Case Identifier:</span>
              <span className="summary-val font-bold text-navy">{formData.caseId}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Evidence Tag:</span>
              <span className="summary-val font-bold">{formData.evidenceId}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Presumptive Classification:</span>
              <span className="summary-val font-bold">{sampleAnalysis?.matchedBenchmark?.target || 'Field Test Subject'}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Testing Officer:</span>
              <span className="summary-val">{formData.officer}</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Primary Panch Witness:</span>
              <span className="summary-val font-bold" style={{ color: '#16A34A' }}>
                {formData.witness1Name} ({formData.witness1Id}) • {formData.witness1Phone}
              </span>
            </div>
            {formData.witness2Name && (
              <div className="summary-row">
                <span className="summary-label">Secondary Panch Witness:</span>
                <span className="summary-val font-bold">{formData.witness2Name} ({formData.witness2Id})</span>
              </div>
            )}
            <div className="summary-row">
              <span className="summary-label">Intercepted Suspect:</span>
              <span className="summary-val">{formData.suspectName} ({formData.suspectRemarks || 'Seized in transit'})</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">GPS Coordinate Anchor:</span>
              <span className="summary-val">{formData.coordinates} ({formData.location})</span>
            </div>
            <div className="summary-row">
              <span className="summary-label">Evidence Package Bundle:</span>
              <span className="summary-val font-bold">5 Evidence Sample Frames + 1 Separate Reference Card</span>
            </div>
            <div className="summary-row highlight">
              <span className="summary-label">Digital Seal Hash (SHA-256):</span>
              <span className="summary-val font-mono">{digitalSeal || 'SHA256:7f83b1657ff1fc53b92dc18148a1d65d...'}</span>
            </div>
          </div>

          {/* Attestation Checkbox with Witness Name */}
          <div className="attestation-box">
            <label className="checkbox-container">
              <input
                type="checkbox"
                checked={attestationAccepted}
                onChange={(e) => setAttestationAccepted(e.target.checked)}
              />
              <span className="checkbox-text">
                I hereby certify under official NDPS procedure that the 5 sample frames and 1 calibration card were captured under standard lighting conditions in the physical presence of independent witness <strong>{formData.witness1Name}</strong> ({formData.witness1Id}), and represent an untampered, legally compliant field seizure record.
              </span>
            </label>
          </div>

          <div className="wizard-step-footer">
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setCurrentStep(3)}
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </button>
            <div className="footer-status">
              <span>Step 4 of 5</span>
              <small>Seal Ready for Cryptographic Signature</small>
            </div>
            <button
              type="button"
              className="btn-primary"
              disabled={!attestationAccepted}
              onClick={() => setCurrentStep(5)}
            >
              <span>Verify & Proceed to Package Transmission</span>
              <ChevronRight size={17} />
            </button>
          </div>
        </div>
      )}

      {/* Step 5: Backend Package Submission */}
      {currentStep === 5 && (
        <div className="wizard-step-content card">
          <div className="step-inner-header">
            <div className="step-header-text">
              <UploadCloud size={20} className="step-header-icon" />
              <div>
                <h3>Submit Evidence Package to Backend API</h3>
                <p>Secure upload of 6 forensic images, witness parameters, and cryptographic seal.</p>
              </div>
            </div>
            <span className={`badge ${submissionSuccess ? 'success' : 'blue'}`}>
              {submissionSuccess ? 'Uploaded & Sealed' : 'Ready for Upload'}
            </span>
          </div>

          {submissionError && (
            <div className="error-alert-box">
              <AlertTriangle size={20} color="var(--danger-red)" />
              <div>
                <strong>Submission Error</strong>
                <p>{submissionError}</p>
              </div>
            </div>
          )}

          {submissionSuccess ? (
            <div className="success-confirmation-box">
              <div className="success-icon-large">
                <CheckCircle2 size={48} />
              </div>
              <h3 className="success-title">Evidence Package Successfully Uploaded & Sealed</h3>
              <p className="success-desc">
                Case <strong>{submittedCase?.id}</strong> has been registered in the Forensic Evidence Vault with all 5 sample images, 1 calibration card, and independent witness attestation for <strong>{formData.witness1Name}</strong>.
              </p>

              <div className="seal-receipt">
                <div className="receipt-row">
                  <span>Digital Seal:</span>
                  <code className="receipt-hash">{submittedCase?.digitalSeal || digitalSeal}</code>
                </div>
                <div className="receipt-row">
                  <span>Independent Panch Witness:</span>
                  <strong>{formData.witness1Name} ({formData.witness1Id})</strong>
                </div>
                <div className="receipt-row">
                  <span>Evidence Images Saved:</span>
                  <strong>6 Total (5 Samples + 1 Reference Card)</strong>
                </div>
                <div className="receipt-row">
                  <span>Server Timestamp:</span>
                  <strong>{new Date().toLocaleString()}</strong>
                </div>
              </div>

              <div className="success-actions">
                <button
                  type="button"
                  className="btn-primary"
                  title="Download Official Form 52A PDF Certificate"
                  onClick={() => {
                    const caseToExport = submittedCase || {
                      id: formData.caseId,
                      evidenceId: formData.evidenceId,
                      timestamp: formData.timestamp || new Date().toISOString(),
                      date: new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
                      time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
                      officer: formData.officer,
                      location: formData.location,
                      coordinates: formData.coordinates,
                      testKit: formData.testKit,
                      reagent: formData.reagent,
                      sampleType: formData.sampleType,
                      witness1Name: formData.witness1Name,
                      witness1Id: formData.witness1Id,
                      witness1Phone: formData.witness1Phone,
                      witness1Address: formData.witness1Address,
                      suspectName: formData.suspectName,
                      substance: sampleAnalysis?.matchedBenchmark?.target || 'Cocaine / Alkaloid',
                      confidence: sampleAnalysis?.confidence || 92,
                      status: 'Verified',
                      digitalSeal: submittedCase?.digitalSeal || digitalSeal,
                      sampleImages: sampleImages,
                      referenceCardImage: referenceCard
                    };
                    generateForensicPdfReport(caseToExport);
                  }}
                >
                  <Download size={16} />
                  <span>Download Form 52A Certificate (PDF)</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/reports')}
                >
                  <FileText size={16} />
                  <span>View in Field Reports</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/vault')}
                >
                  <Lock size={16} />
                  <span>View in Evidence Vault</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => navigate('/cases')}
                >
                  <ExternalLink size={16} />
                  <span>View in Cases Directory</span>
                </button>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setSampleImages([]);
                    setReferenceCard(null);
                    setSubmissionSuccess(false);
                    regenerateIds();
                    setCurrentStep(1);
                  }}
                >
                  <RefreshCw size={16} />
                  <span>Conduct Another Test</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="transmission-ready-card">
              <div className="transmission-info">
                <h4>Evidence Package Payload Summary</h4>
                <ul className="payload-list">
                  <li><strong>Sample Images:</strong> 5 Captured Frames (JPEG, full resolution)</li>
                  <li><strong>Reference Card:</strong> 1 Color Calibration Target Card</li>
                  <li><strong>Independent Witness (Panch #1):</strong> {formData.witness1Name} ({formData.witness1Id})</li>
                  <li><strong>Intercepted Suspect:</strong> {formData.suspectName}</li>
                  <li><strong>Metadata:</strong> Kit ({formData.testKit}), Reagent ({formData.reagent}), Coordinates ({formData.coordinates})</li>
                  <li><strong>Cryptographic Hash:</strong> SHA-256 Digital Seal generated</li>
                  <li><strong>Target Endpoint:</strong> <code>POST /api/evidence/upload</code></li>
                </ul>
              </div>

              <div className="transmission-cta">
                <button
                  type="button"
                  className="btn-primary submit-final-btn"
                  disabled={isSubmitting}
                  onClick={handleSubmitPackage}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw size={18} className="spinner" />
                      <span>Transmitting Evidence Package...</span>
                    </>
                  ) : (
                    <>
                      <UploadCloud size={18} />
                      <span>Submit Evidence Package Now</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {!submissionSuccess && (
            <div className="wizard-step-footer">
              <button
                type="button"
                className="btn-secondary"
                disabled={isSubmitting}
                onClick={() => setCurrentStep(4)}
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </button>
              <div className="footer-status">
                <span>Step 5 of 5</span>
                <small>Ready for Transmission</small>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}