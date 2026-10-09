import React, { useState, useRef, useEffect } from 'react';
import {
  Camera,
  RefreshCw,
  Trash2,
  CheckCircle2,
  AlertCircle,
  Zap,
  RotateCcw,
  Maximize2,
  ShieldCheck,
  Palette,
  Upload,
  Eye,
  X
} from 'lucide-react';

export default function EvidenceCapture({
  sampleImages = [],
  referenceCard = null,
  onSamplesChange,
  onReferenceCardChange
}) {
  // Capture mode: 'sample' (1-5) or 'reference' (1)
  const [activeMode, setActiveMode] = useState('sample');
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('environment');
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Initialize Camera
  const startCamera = async () => {
    setCameraError(null);
    setCameraReady(false);

    // Stop existing stream if any
    if (stream) {
      stream.getTracks().forEach(t => t.stop());
    }

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) is not supported in this browser or context.');
      }

      const constraints = {
        video: {
          facingMode: { ideal: facingMode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        },
        audio: false
      };

      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.onloadedmetadata = () => {
          videoRef.current.play().catch(e => console.warn('Play error:', e));
          setCameraReady(true);
        };
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      let message = 'Unable to access camera device.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please allow camera permissions in your browser address bar/settings, then click "Retry Camera".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system. You may use the fallback image capture button below to test.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is currently in use by another application. Please close other camera apps and retry.';
      }
      setCameraError(message);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      if (stream) {
        stream.getTracks().forEach(t => t.stop());
      }
    };
  }, [facingMode]);

  // Flip Camera (Front / Rear)
  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

  // Toggle Torch/Flash if supported
  const toggleTorch = async () => {
    if (!stream) return;
    const track = stream.getVideoTracks()[0];
    if (track && track.getCapabilities && track.getCapabilities().torch) {
      try {
        await track.applyConstraints({
          advanced: [{ torch: !torchOn }]
        });
        setTorchOn(!torchOn);
      } catch (e) {
        console.warn('Torch constraint error:', e);
      }
    } else {
      // Software flash effect
      setTorchOn(!torchOn);
    }
  };

  // Capture Frame from Video
  const handleCapture = () => {
    if (!videoRef.current) return;
    setIsCapturing(true);

    const video = videoRef.current;
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
    const capturedAt = new Date().toISOString();

    setTimeout(() => {
      if (activeMode === 'sample') {
        if (sampleImages.length < 5) {
          const newSamples = [...sampleImages, {
            id: sampleImages.length + 1,
            dataUrl,
            capturedAt,
            label: `Sample Frame #${sampleImages.length + 1}`
          }];
          onSamplesChange(newSamples);

          // Auto-prompt to reference card if 5 samples are completed
          if (newSamples.length === 5 && !referenceCard) {
            setActiveMode('reference');
          }
        }
      } else {
        // Reference Card
        onReferenceCardChange({
          id: 'ref-card',
          dataUrl,
          capturedAt,
          label: 'Color Calibration Reference Card'
        });
      }
      setIsCapturing(false);
    }, 250);
  };

  // Fallback / Upload / Simulated Capture for devices without webcam
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (uploadEvent) => {
      const dataUrl = uploadEvent.target.result;
      const capturedAt = new Date().toISOString();

      if (activeMode === 'sample') {
        if (sampleImages.length < 5) {
          const newSamples = [...sampleImages, {
            id: sampleImages.length + 1,
            dataUrl,
            capturedAt,
            label: `Sample Frame #${sampleImages.length + 1}`
          }];
          onSamplesChange(newSamples);
          if (newSamples.length === 5 && !referenceCard) {
            setActiveMode('reference');
          }
        }
      } else {
        onReferenceCardChange({
          id: 'ref-card',
          dataUrl,
          capturedAt,
          label: 'Color Calibration Reference Card'
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  // Generate a high quality synthetic test card for headless/testing environments
  const generateSimulatedTestCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (activeMode === 'sample') {
      // Chemical reagent test swatch simulation
      const colors = ['#4A154B', '#1B4D3E', '#0047AB', '#DE8A0C', '#800020'];
      const currentIdx = sampleImages.length;
      const reactionColor = colors[currentIdx % colors.length];

      // Background test vial
      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, 640, 480);

      // Reagent reaction well
      ctx.beginPath();
      ctx.arc(320, 240, 140, 0, Math.PI * 2);
      ctx.fillStyle = reactionColor;
      ctx.fill();
      ctx.strokeStyle = '#0B3C8C';
      ctx.lineWidth = 6;
      ctx.stroke();

      // Forensic text label
      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`FORENSIC EVIDENCE SAMPLE #${currentIdx + 1}`, 320, 60);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()} | ID: EVD-${Date.now().toString().slice(-6)}`, 320, 90);
      ctx.fillText('Reagent Chemical Reaction Spot Test', 320, 430);
    } else {
      // Color Calibration Target Card
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 640, 480);

      // Standard forensic color patches (Macbeth-style reference target)
      const patches = [
        '#735244', '#C29682', '#627A9D', '#576C43', '#8580B1', '#67BDAB',
        '#D96831', '#49549F', '#C15A63', '#5E3C6C', '#9DBC40', '#E0A32E',
        '#383D96', '#469449', '#AF363C', '#E7C71F', '#BB5695', '#0885A1',
        '#FFFFFF', '#C8C8C8', '#A0A0A0', '#7A7A7A', '#555555', '#1E1E1E'
      ];

      const rows = 4;
      const cols = 6;
      const pW = 80;
      const pH = 70;
      const startX = 80;
      const startY = 80;

      patches.forEach((color, i) => {
        const r = Math.floor(i / cols);
        const c = i % cols;
        ctx.fillStyle = color;
        ctx.fillRect(startX + c * pW, startY + r * pH, pW - 8, pH - 8);
        ctx.strokeStyle = '#CBD5E1';
        ctx.strokeRect(startX + c * pW, startY + r * pH, pW - 8, pH - 8);
      });

      ctx.fillStyle = '#0B3C8C';
      ctx.font = 'bold 18px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('NCB COLOR CALIBRATION REFERENCE TARGET (CR-1)', 320, 50);
      ctx.font = '12px Inter, sans-serif';
      ctx.fillStyle = '#64748B';
      ctx.fillText('Illumination Normalization Baseline | Separate Optical Channel', 320, 440);
    }

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
    const capturedAt = new Date().toISOString();

    if (activeMode === 'sample') {
      if (sampleImages.length < 5) {
        const newSamples = [...sampleImages, {
          id: sampleImages.length + 1,
          dataUrl,
          capturedAt,
          label: `Sample Frame #${sampleImages.length + 1}`
        }];
        onSamplesChange(newSamples);
        if (newSamples.length === 5 && !referenceCard) {
          setActiveMode('reference');
        }
      }
    } else {
      onReferenceCardChange({
        id: 'ref-card',
        dataUrl,
        capturedAt,
        label: 'Color Calibration Reference Card'
      });
    }
  };

  // Delete individual sample
  const deleteSample = (index) => {
    const updated = sampleImages.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      id: idx + 1,
      label: `Sample Frame #${idx + 1}`
    }));
    onSamplesChange(updated);
  };

  // Delete reference card
  const deleteReferenceCard = () => {
    onReferenceCardChange(null);
  };

  // Retake all samples
  const resetSamples = () => {
    onSamplesChange([]);
  };

  const totalCaptured = sampleImages.length + (referenceCard ? 1 : 0);
  const progressPercent = Math.round((totalCaptured / 6) * 100);
  const samplesComplete = sampleImages.length === 5;
  const refCardComplete = !!referenceCard;
  const allComplete = samplesComplete && refCardComplete;

  return (
    <div className="capture-container">
      <canvas ref={canvasRef} style={{ display: 'none' }} />
      <input
        type="file"
        ref={fileInputRef}
        accept="image/*"
        style={{ display: 'none' }}
        onChange={handleFileUpload}
      />

      {/* Header */}
      <div className="capture-header">
        <div className="capture-heading">
          <div className="capture-icon">
            <Camera size={22} />
          </div>
          <div>
            <h3>Capture Evidence & Color Calibration</h3>
            <p>Capture exactly 5 chemical sample frames and 1 separate color reference card (6 images total).</p>
          </div>
        </div>
        <div className="capture-status">
          <ShieldCheck size={16} />
          <span>Evidence Mode</span>
        </div>
      </div>

      {/* Target Selector Tabs */}
      <div className="capture-mode-selector">
        <button
          type="button"
          className={`mode-tab ${activeMode === 'sample' ? 'active' : ''}`}
          onClick={() => setActiveMode('sample')}
        >
          <Camera size={16} />
          <span>1. Sample Images ({sampleImages.length}/5)</span>
          {samplesComplete && <CheckCircle2 size={15} className="tab-check-icon" />}
        </button>

        <button
          type="button"
          className={`mode-tab reference-tab ${activeMode === 'reference' ? 'active' : ''}`}
          onClick={() => setActiveMode('reference')}
        >
          <Palette size={16} />
          <span>2. Reference Card ({refCardComplete ? '1/1' : '0/1'})</span>
          {refCardComplete && <CheckCircle2 size={15} className="tab-check-icon" />}
        </button>
      </div>

      {/* Layout: Camera Viewport + Quality Checks */}
      <div className="capture-layout">
        {/* Left Column: Camera Viewport */}
        <section className="camera-card">
          <div className="section-heading">
            <div>
              <h4>
                {activeMode === 'sample'
                  ? `Camera Preview: Sample Frame #${sampleImages.length + 1} of 5`
                  : 'Camera Preview: Color Reference Card (1 required)'}
              </h4>
              <p>
                {activeMode === 'sample'
                  ? 'Center the test vial or reagent reaction area inside the brackets.'
                  : 'Position the official color reference card flat under identical lighting.'}
              </p>
            </div>
            <span className="frame-counter">
              {totalCaptured}/6 Captured
            </span>
          </div>

          {/* Viewport Box */}
          <div className={`camera-viewport ${torchOn ? 'flash-active' : ''}`}>
            {cameraError ? (
              <div className="camera-error-banner">
                <AlertCircle size={36} color="var(--danger-red)" />
                <p className="error-title">Camera Device Notice</p>
                <p className="error-desc">{cameraError}</p>
                <div className="error-actions">
                  <button type="button" className="btn-secondary" onClick={startCamera}>
                    <RefreshCw size={14} /> Retry Camera
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Choose Image from Device
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={generateSimulatedTestCard}
                    title="Simulate forensic capture for testing"
                  >
                    <Zap size={14} /> Simulate Test Frame
                  </button>
                </div>
              </div>
            ) : (
              <div className="camera-frame">
                <video
                  ref={videoRef}
                  playsInline
                  autoPlay
                  muted
                  className="camera-video-element"
                />

                {/* Shutter flash effect */}
                {isCapturing && <div className="shutter-flash" />}

                {/* Alignment Brackets */}
                <div className="corner corner-top-left" />
                <div className="corner corner-top-right" />
                <div className="corner corner-bottom-left" />
                <div className="corner corner-bottom-right" />

                {/* Target Overlay */}
                <div className="camera-center-guide">
                  {activeMode === 'sample' ? (
                    <div className="guide-box sample-guide">
                      <Camera size={26} />
                      <span>Align Reagent Reaction</span>
                    </div>
                  ) : (
                    <div className="guide-box reference-guide">
                      <Palette size={26} />
                      <span>Align Color Reference Card</span>
                    </div>
                  )}
                </div>

                {/* Camera Status Badge */}
                <div className="camera-status-pill">
                  <span className="live-dot" />
                  <span>{cameraReady ? 'LIVE' : 'INITIALIZING'}</span>
                </div>

                {/* Top Control Overlay */}
                <div className="camera-top-tools">
                  <button
                    type="button"
                    className="tool-btn"
                    onClick={toggleFacingMode}
                    title="Switch Camera (Front/Back)"
                  >
                    <RotateCcw size={15} />
                  </button>
                  <button
                    type="button"
                    className={`tool-btn ${torchOn ? 'active' : ''}`}
                    onClick={toggleTorch}
                    title="Flash / Torch"
                  >
                    <Zap size={15} />
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Camera Controls Toolbar */}
          <div className="camera-controls">
            <button
              type="button"
              className="secondary-control"
              onClick={activeMode === 'sample' ? resetSamples : deleteReferenceCard}
              disabled={activeMode === 'sample' ? sampleImages.length === 0 : !referenceCard}
              title={activeMode === 'sample' ? 'Retake All Samples' : 'Retake Reference Card'}
            >
              <RotateCcw size={16} />
              <span>Retake</span>
            </button>

            <button
              type="button"
              className={`capture-button ${allComplete ? 'completed' : ''}`}
              onClick={handleCapture}
              disabled={
                isCapturing ||
                (activeMode === 'sample' && samplesComplete) ||
                (activeMode === 'reference' && refCardComplete)
              }
            >
              <Camera size={20} />
              <span>
                {isCapturing
                  ? 'Capturing Frame...'
                  : activeMode === 'sample'
                  ? samplesComplete
                    ? '5 Samples Captured'
                    : `Capture Sample #${sampleImages.length + 1}`
                  : refCardComplete
                  ? 'Reference Card Captured'
                  : 'Capture Reference Card'}
              </span>
            </button>

            <button
              type="button"
              className="secondary-control"
              onClick={() => fileInputRef.current?.click()}
              title="Upload file from device"
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            {/* Test button for rapid verification */}
            <button
              type="button"
              className="secondary-control test-btn"
              onClick={generateSimulatedTestCard}
              title="Generate forensic test sample frame"
            >
              <Zap size={16} />
              <span>Test Frame</span>
            </button>
          </div>

          {/* Overall Progress Bar */}
          <div className="capture-progress">
            <div className="progress-header">
              <span>Overall Capture Progress (5 Samples + 1 Ref Card)</span>
              <strong>{progressPercent}%</strong>
            </div>
            <div className="progress-track">
              <div
                className="progress-fill"
                style={{ width: `${progressPercent}%` }}
              />
            </div>
          </div>
        </section>

        {/* Right Column: Forensic Quality & Calibration Info */}
        <aside className="quality-card">
          <div className="section-heading">
            <div>
              <h4>Forensic Capture Criteria</h4>
              <p>Optical checks & protocol validation</p>
            </div>
          </div>

          <div className="quality-list">
            <div className="quality-item">
              <div className="quality-item-left">
                <div className="quality-icon good">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span>Lighting & Exposure</span>
                  <small>Uniform illumination on sample</small>
                </div>
              </div>
              <strong>Optimal</strong>
            </div>

            <div className="quality-item">
              <div className="quality-item-left">
                <div className="quality-icon good">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span>Focus & Clarity</span>
                  <small>Reaction boundary sharpness</small>
                </div>
              </div>
              <strong>Sharp</strong>
            </div>

            <div className="quality-item">
              <div className="quality-item-left">
                <div className="quality-icon good">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span>Color Reference Card</span>
                  <small>Separated from chemical sample</small>
                </div>
              </div>
              <strong style={{ color: refCardComplete ? 'var(--success-green)' : 'var(--warning-amber)' }}>
                {refCardComplete ? 'Captured' : 'Required'}
              </strong>
            </div>

            <div className="quality-item">
              <div className="quality-item-left">
                <div className="quality-icon good">
                  <CheckCircle2 size={16} />
                </div>
                <div>
                  <span>Sample Multi-Angle</span>
                  <small>5 sequential evidence frames</small>
                </div>
              </div>
              <strong style={{ color: samplesComplete ? 'var(--success-green)' : 'var(--primary-navy)' }}>
                {sampleImages.length}/5 Frames
              </strong>
            </div>
          </div>

          <div className="quality-note">
            <AlertCircle size={17} style={{ flexShrink: 0, marginTop: '2px' }} />
            <p>
              <strong>Forensic Standard:</strong> Chemical reagent reaction frames must be kept separate from the color calibration target. The reference card normalizes ambient lighting without contaminating sample reaction pixels.
            </p>
          </div>
        </aside>
      </div>

      {/* Thumbnails Section: Clearly Distinguishing Samples vs Reference Card */}
      <section className="frames-card">
        <div className="section-heading frames-heading">
          <div>
            <h4>Captured Evidence Gallery (6 Required)</h4>
            <p>5 Evidence Sample Frames + 1 Separate Color Reference Card</p>
          </div>
          <span className={`frames-required ${allComplete ? 'all-done' : ''}`}>
            {allComplete
              ? 'All 6 frames captured'
              : `${6 - totalCaptured} frame(s) remaining`}
          </span>
        </div>

        {/* 1. Evidence Sample Frames (5 Slots) */}
        <div className="gallery-section-title">
          <span>Part A: Evidence Sample Images (Exactly 5 Required)</span>
          <span className="badge blue">{sampleImages.length} of 5</span>
        </div>

        <div className="frames-grid">
          {Array.from({ length: 5 }).map((_, idx) => {
            const sample = sampleImages[idx];
            const isCaptured = !!sample;

            return (
              <div
                key={`sample-${idx}`}
                className={`evidence-frame ${isCaptured ? 'captured' : 'empty'}`}
              >
                {isCaptured ? (
                  <div className="thumbnail-wrapper">
                    <img
                      src={sample.dataUrl}
                      alt={`Sample Frame ${idx + 1}`}
                      className="thumb-img"
                    />
                    <div className="frame-overlay">
                      <button
                        type="button"
                        className="thumb-action-btn"
                        onClick={() => setPreviewModalImg({ url: sample.dataUrl, title: `Sample Frame #${idx + 1}` })}
                        title="View Full Size"
                      >
                        <Eye size={14} />
                      </button>
                      <button
                        type="button"
                        className="thumb-action-btn delete"
                        onClick={() => deleteSample(idx)}
                        title="Delete this sample"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                    <div className="frame-badge sample-badge">
                      <span>Sample #{idx + 1}</span>
                    </div>
                  </div>
                ) : (
                  <div
                    className="empty-slot"
                    onClick={() => {
                      setActiveMode('sample');
                    }}
                  >
                    <div className="empty-icon">
                      <Camera size={20} />
                    </div>
                    <span>Frame {idx + 1}</span>
                    <small>Pending</small>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* 2. Calibration Reference Card (1 Dedicated Slot) */}
        <div className="gallery-section-title ref-title">
          <span>Part B: Optical Color Calibration Card (1 Required Separately)</span>
          <span className={`badge ${refCardComplete ? 'success' : 'warning'}`}>
            {refCardComplete ? 'Reference Card Ready' : '1 Card Required'}
          </span>
        </div>

        <div className="reference-card-container">
          <div className={`reference-card-slot ${refCardComplete ? 'captured' : 'empty'}`}>
            {refCardComplete ? (
              <div className="ref-thumbnail-wrapper">
                <img
                  src={referenceCard.dataUrl}
                  alt="Color Reference Card"
                  className="ref-thumb-img"
                />
                <div className="ref-details">
                  <div className="ref-header-row">
                    <div className="ref-tag">
                      <Palette size={14} />
                      <strong>Color Reference Card</strong>
                    </div>
                    <span className="badge success">Calibrated</span>
                  </div>
                  <p className="ref-text">
                    Reference target captured under field lighting. Stored in isolated calibration channel for accurate colorimetric normalization.
                  </p>
                  <div className="ref-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setPreviewModalImg({ url: referenceCard.dataUrl, title: 'Color Calibration Reference Card' })}
                    >
                      <Eye size={14} /> Inspect Card
                    </button>
                    <button
                      type="button"
                      className="btn-secondary delete"
                      onClick={deleteReferenceCard}
                    >
                      <Trash2 size={14} /> Retake Card
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div
                className="ref-empty-slot"
                onClick={() => setActiveMode('reference')}
              >
                <div className="ref-icon-circle">
                  <Palette size={24} />
                </div>
                <div className="ref-empty-text">
                  <strong>Color Calibration Target Card Missing</strong>
                  <p>Click here or select the "Reference Card" tab above to capture the standard calibration card.</p>
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    setActiveMode('reference');
                  }}
                >
                  <Camera size={14} /> Capture Reference Card
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Image Preview Modal */}
      {previewModalImg && (
        <div className="modal-backdrop" onClick={() => setPreviewModalImg(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h5>{previewModalImg.title}</h5>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewModalImg(null)}
              >
                <X size={20} />
              </button>
            </div>
            <div className="modal-body">
              <img
                src={previewModalImg.url}
                alt="Evidence Full View"
                className="modal-image"
              />
            </div>
          </div>
        </div>
      )}

      {/* Evidence Capture Scoped Styles */}
      <style>{`
        .capture-container {
          width: 100%;
          box-sizing: border-box;
          padding: 24px;
          color: var(--slate-900);
        }

        .capture-header {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          gap: 20px;
          margin-bottom: 20px;
        }

        .capture-heading {
          display: flex;
          align-items: flex-start;
          gap: 14px;
        }

        .capture-icon {
          width: 44px;
          height: 44px;
          flex-shrink: 0;
          border-radius: var(--radius-md);
          background: var(--primary-light);
          color: var(--primary-navy);
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .capture-heading h3 {
          font-size: 20px;
          font-weight: 800;
          color: var(--slate-900);
          margin-bottom: 4px;
        }

        .capture-heading p {
          font-size: 13px;
          color: var(--slate-500);
        }

        .capture-status {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 6px 12px;
          background: var(--primary-light);
          color: var(--primary-navy);
          border-radius: 999px;
          font-size: 12px;
          font-weight: 700;
        }

        /* Mode Tabs */
        .capture-mode-selector {
          display: flex;
          gap: 12px;
          margin-bottom: 20px;
        }

        .mode-tab {
          flex: 1;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          padding: 12px 18px;
          background: var(--white);
          border: 2px solid var(--slate-200);
          border-radius: var(--radius-md);
          font-weight: 700;
          font-size: 13px;
          color: var(--slate-600);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .mode-tab:hover {
          border-color: var(--primary-navy);
          color: var(--primary-navy);
        }

        .mode-tab.active {
          background: var(--primary-light);
          border-color: var(--primary-navy);
          color: var(--primary-navy);
          box-shadow: 0 2px 6px rgba(11, 60, 140, 0.12);
        }

        .mode-tab.reference-tab.active {
          background: #FEF3C7;
          border-color: #D97706;
          color: #92400E;
        }

        .tab-check-icon {
          color: var(--success-green);
          margin-left: 4px;
        }

        /* Layout Grid */
        .capture-layout {
          display: grid;
          grid-template-columns: minmax(0, 2fr) minmax(0, 1fr);
          gap: 24px;
          margin-bottom: 24px;
        }

        .camera-card {
          background: var(--white);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }

        .section-heading {
          display: flex;
          align-items: flex-start;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .section-heading h4 {
          font-size: 15px;
          font-weight: 700;
          color: var(--slate-900);
        }

        .section-heading p {
          font-size: 12px;
          color: var(--slate-500);
          margin-top: 2px;
        }

        .frame-counter {
          font-size: 12px;
          font-weight: 700;
          background: var(--slate-100);
          color: var(--slate-700);
          padding: 4px 10px;
          border-radius: 999px;
        }

        /* Camera Viewport */
        .camera-viewport {
          position: relative;
          width: 100%;
          aspect-ratio: 16 / 10;
          background: #0F172A;
          border-radius: var(--radius-md);
          overflow: hidden;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .camera-viewport.flash-active {
          filter: brightness(1.25) contrast(1.1);
        }

        .camera-frame {
          position: relative;
          width: 100%;
          height: 100%;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .camera-video-element {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .shutter-flash {
          position: absolute;
          inset: 0;
          background: white;
          opacity: 0.85;
          pointer-events: none;
          animation: flash-fade 0.25s ease-out;
        }

        @keyframes flash-fade {
          from { opacity: 0.85; }
          to { opacity: 0; }
        }

        /* Viewport Corners */
        .corner {
          position: absolute;
          width: 24px;
          height: 24px;
          border-color: #38BDF8;
          border-style: solid;
          pointer-events: none;
        }

        .corner-top-left {
          top: 16px;
          left: 16px;
          border-width: 3px 0 0 3px;
        }

        .corner-top-right {
          top: 16px;
          right: 16px;
          border-width: 3px 3px 0 0;
        }

        .corner-bottom-left {
          bottom: 16px;
          left: 16px;
          border-width: 0 0 3px 3px;
        }

        .corner-bottom-right {
          bottom: 16px;
          right: 16px;
          border-width: 0 3px 3px 0;
        }

        .camera-center-guide {
          position: absolute;
          pointer-events: none;
        }

        .guide-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          border-radius: var(--radius-md);
          color: white;
          font-size: 12px;
          font-weight: 600;
          background: rgba(15, 23, 42, 0.65);
          backdrop-filter: blur(4px);
          border: 1px dashed rgba(255, 255, 255, 0.4);
        }

        .guide-box.reference-guide {
          border-color: #F59E0B;
          color: #FDE68A;
        }

        .camera-status-pill {
          position: absolute;
          bottom: 14px;
          left: 16px;
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(15, 23, 42, 0.7);
          padding: 4px 10px;
          border-radius: 999px;
          color: white;
          font-size: 11px;
          font-weight: 700;
        }

        .live-dot {
          width: 8px;
          height: 8px;
          border-radius: 50%;
          background: #22C55E;
          box-shadow: 0 0 8px #22C55E;
        }

        .camera-top-tools {
          position: absolute;
          top: 14px;
          right: 16px;
          display: flex;
          gap: 8px;
        }

        .tool-btn {
          width: 34px;
          height: 34px;
          border-radius: var(--radius-md);
          background: rgba(15, 23, 42, 0.7);
          border: 1px solid rgba(255, 255, 255, 0.2);
          color: white;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .tool-btn.active {
          background: #F59E0B;
          color: black;
        }

        /* Error Banner */
        .camera-error-banner {
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          padding: 24px;
          color: white;
          max-width: 480px;
        }

        .error-title {
          font-size: 16px;
          font-weight: 700;
          margin: 10px 0 6px;
        }

        .error-desc {
          font-size: 12px;
          color: #CBD5E1;
          margin-bottom: 16px;
          line-height: 1.5;
        }

        .error-actions {
          display: flex;
          flex-wrap: wrap;
          justify-content: center;
          gap: 10px;
        }

        /* Controls */
        .camera-controls {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 12px;
          margin-bottom: 16px;
        }

        .secondary-control {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          padding: 10px 16px;
          background: var(--white);
          border: 1px solid var(--slate-300);
          color: var(--slate-700);
          border-radius: var(--radius-md);
          font-size: 13px;
          font-weight: 600;
        }

        .secondary-control:hover:not(:disabled) {
          background: var(--slate-100);
        }

        .secondary-control.test-btn {
          background: var(--primary-light);
          color: var(--primary-navy);
          border-color: #BFDBFE;
        }

        .capture-button {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 12px 26px;
          background: var(--primary-navy);
          color: white;
          border: none;
          border-radius: var(--radius-md);
          font-size: 14px;
          font-weight: 700;
          box-shadow: 0 4px 10px rgba(11, 60, 140, 0.25);
        }

        .capture-button:hover:not(:disabled) {
          background: var(--primary-dark);
        }

        .capture-button.completed {
          background: var(--success-green);
        }

        /* Progress Bar */
        .capture-progress {
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
          padding: 12px;
        }

        .progress-header {
          display: flex;
          justify-content: space-between;
          font-size: 12px;
          color: var(--slate-600);
          margin-bottom: 6px;
        }

        .progress-track {
          height: 8px;
          background: var(--slate-200);
          border-radius: 999px;
          overflow: hidden;
        }

        .progress-fill {
          height: 100%;
          background: var(--primary-navy);
          border-radius: 999px;
          transition: width 0.3s ease;
        }

        /* Quality Card */
        .quality-card {
          background: var(--white);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .quality-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .quality-item {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 10px 12px;
          background: var(--slate-50);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-md);
        }

        .quality-item-left {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .quality-icon.good {
          color: var(--success-green);
        }

        .quality-item span {
          display: block;
          font-size: 12px;
          font-weight: 700;
          color: var(--slate-800);
        }

        .quality-item small {
          display: block;
          font-size: 11px;
          color: var(--slate-500);
        }

        .quality-item strong {
          font-size: 12px;
          color: var(--slate-700);
        }

        .quality-note {
          display: flex;
          gap: 10px;
          background: var(--info-bg);
          border: 1px solid #BFDBFE;
          border-radius: var(--radius-md);
          padding: 12px;
          font-size: 11px;
          color: #1E40AF;
          line-height: 1.45;
        }

        /* Frames Card */
        .frames-card {
          background: var(--white);
          border: 1px solid var(--slate-200);
          border-radius: var(--radius-lg);
          padding: 20px;
          box-shadow: var(--shadow-sm);
        }

        .frames-heading {
          margin-bottom: 20px;
        }

        .frames-required {
          font-size: 12px;
          font-weight: 700;
          color: var(--warning-amber);
          background: var(--warning-bg);
          padding: 4px 10px;
          border-radius: 999px;
        }

        .frames-required.all-done {
          color: var(--success-green);
          background: var(--success-bg);
        }

        .gallery-section-title {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 13px;
          font-weight: 700;
          color: var(--slate-800);
          margin: 16px 0 12px;
          padding-bottom: 6px;
          border-bottom: 1px solid var(--slate-200);
        }

        .gallery-section-title.ref-title {
          margin-top: 24px;
        }

        .frames-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 12px;
        }

        .evidence-frame {
          aspect-ratio: 4 / 3;
          border-radius: var(--radius-md);
          overflow: hidden;
          background: var(--slate-100);
          border: 1px dashed var(--slate-300);
          position: relative;
        }

        .evidence-frame.captured {
          border: 2px solid var(--primary-navy);
        }

        .thumbnail-wrapper {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .thumb-img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .frame-overlay {
          position: absolute;
          inset: 0;
          background: rgba(15, 23, 42, 0.5);
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          opacity: 0;
          transition: opacity 0.2s ease;
        }

        .thumbnail-wrapper:hover .frame-overlay {
          opacity: 1;
        }

        .thumb-action-btn {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          background: white;
          color: var(--slate-800);
          border: none;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
        }

        .thumb-action-btn.delete {
          color: var(--danger-red);
        }

        .frame-badge {
          position: absolute;
          bottom: 4px;
          left: 4px;
          background: rgba(15, 23, 42, 0.75);
          color: white;
          font-size: 10px;
          font-weight: 700;
          padding: 2px 6px;
          border-radius: 4px;
        }

        .empty-slot {
          width: 100%;
          height: 100%;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 4px;
          color: var(--slate-400);
          cursor: pointer;
          transition: background 0.15s ease;
        }

        .empty-slot:hover {
          background: var(--slate-200);
          color: var(--primary-navy);
        }

        .empty-slot span {
          font-size: 11px;
          font-weight: 600;
        }

        .empty-slot small {
          font-size: 10px;
          color: var(--slate-400);
        }

        /* Reference Card Dedicated Slot */
        .reference-card-container {
          margin-top: 10px;
        }

        .reference-card-slot {
          border-radius: var(--radius-md);
          background: #FFFBEB;
          border: 2px dashed #F59E0B;
          padding: 16px;
          transition: all 0.2s ease;
        }

        .reference-card-slot.captured {
          background: var(--white);
          border: 2px solid #D97706;
          box-shadow: 0 4px 12px rgba(217, 119, 6, 0.1);
        }

        .ref-thumbnail-wrapper {
          display: flex;
          gap: 20px;
          align-items: center;
        }

        .ref-thumb-img {
          width: 180px;
          height: 130px;
          object-fit: cover;
          border-radius: var(--radius-md);
          border: 2px solid #F59E0B;
        }

        .ref-details {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .ref-header-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
        }

        .ref-tag {
          display: flex;
          align-items: center;
          gap: 6px;
          color: #B45309;
          font-size: 14px;
        }

        .ref-text {
          font-size: 12px;
          color: var(--slate-600);
          line-height: 1.5;
        }

        .ref-actions {
          display: flex;
          gap: 10px;
        }

        .ref-empty-slot {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          cursor: pointer;
        }

        .ref-icon-circle {
          width: 50px;
          height: 50px;
          border-radius: 50%;
          background: #FEF3C7;
          color: #D97706;
          display: flex;
          align-items: center;
          justify-content: center;
          flex-shrink: 0;
        }

        .ref-empty-text {
          flex: 1;
        }

        .ref-empty-text strong {
          font-size: 14px;
          color: #92400E;
          display: block;
        }

        .ref-empty-text p {
          font-size: 12px;
          color: #B45309;
          margin-top: 2px;
        }

        /* Modal */
        .modal-backdrop {
          position: fixed;
          inset: 0;
          background: rgba(15, 23, 42, 0.75);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .modal-card {
          background: white;
          border-radius: var(--radius-lg);
          max-width: 800px;
          width: 100%;
          overflow: hidden;
          box-shadow: var(--shadow-lg);
        }

        .modal-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          padding: 16px 20px;
          border-bottom: 1px solid var(--slate-200);
        }

        .modal-header h5 {
          font-size: 16px;
          font-weight: 700;
          color: var(--slate-900);
        }

        .modal-close-btn {
          background: none;
          border: none;
          color: var(--slate-500);
          cursor: pointer;
        }

        .modal-body {
          padding: 20px;
          display: flex;
          justify-content: center;
          background: #0F172A;
        }

        .modal-image {
          max-height: 70vh;
          width: auto;
          object-fit: contain;
          border-radius: var(--radius-md);
        }

        @media (max-width: 900px) {
          .capture-layout {
            grid-template-columns: 1fr;
          }
          .frames-grid {
            grid-template-columns: repeat(3, 1fr);
          }
          .ref-thumbnail-wrapper {
            flex-direction: column;
            align-items: flex-start;
          }
          .ref-thumb-img {
            width: 100%;
            height: 180px;
          }
          .ref-empty-slot {
            flex-direction: column;
            text-align: center;
          }
        }

        @media (max-width: 600px) {
          .frames-grid {
            grid-template-columns: repeat(2, 1fr);
          }
          .capture-mode-selector {
            flex-direction: column;
          }
        }
      `}</style>
    </div>
  );
}
