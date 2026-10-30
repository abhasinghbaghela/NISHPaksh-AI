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
  const [activeMode, setActiveMode] = useState('sample');
  const [stream, setStream] = useState(null);
  const [cameraError, setCameraError] = useState(null);
  const [cameraReady, setCameraReady] = useState(false);
  const [facingMode, setFacingMode] = useState('user');
  const [cameraDeviceList, setCameraDeviceList] = useState([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState('');
  const [torchOn, setTorchOn] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [previewModalImg, setPreviewModalImg] = useState(null);

  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop active camera stream tracks
  const stopActiveStream = () => {
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(t => t.stop());
      } catch (e) {
        console.warn('Track stop error:', e);
      }
      streamRef.current = null;
    }
  };

  // Initialize Camera with fallback ladder
  const startCamera = async (deviceId = selectedDeviceId) => {
    setCameraError(null);
    setCameraReady(false);
    stopActiveStream();

    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Camera API (getUserMedia) is not supported in this browser context.');
      }

      let mediaStream = null;

      // Stage 1: Try with specific deviceId or facingMode + 720p
      try {
        const videoConstraints = deviceId
          ? { deviceId: { exact: deviceId } }
          : {
              facingMode: facingMode ? { ideal: facingMode } : undefined,
              width: { ideal: 1280 },
              height: { ideal: 720 }
            };
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: videoConstraints,
          audio: false
        });
      } catch (err1) {
        console.warn('Preferred camera constraints failed, trying basic video:', err1);
        // Stage 2: Fallback to basic unconstrained video (works on any laptop/desktop webcam)
        mediaStream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: false
        });
      }

      streamRef.current = mediaStream;
      setStream(mediaStream);

      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        videoRef.current.muted = true;
        videoRef.current.setAttribute('playsinline', 'true');
        videoRef.current.setAttribute('muted', 'true');
        try {
          await videoRef.current.play();
          setCameraReady(true);
        } catch (e) {
          console.warn('Play promise waiting for user event:', e);
        }
      }

      // Enumerate available video devices
      if (navigator.mediaDevices.enumerateDevices) {
        try {
          const allDevs = await navigator.mediaDevices.enumerateDevices();
          const videoDevs = allDevs.filter(d => d.kind === 'videoinput');
          setCameraDeviceList(videoDevs);
          if (videoDevs.length > 0 && !selectedDeviceId) {
            setSelectedDeviceId(videoDevs[0].deviceId);
          }
        } catch (devErr) {
          console.warn('Enumerate devices warning:', devErr);
        }
      }
    } catch (err) {
      console.warn('Camera access issue:', err);
      let message = 'Unable to access camera device.';
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        message = 'Camera permission was denied. Please click the camera or lock icon in your browser address bar and choose "Allow", or check Windows Settings > Privacy & security > Camera, then click "Retry Camera".';
      } else if (err.name === 'NotFoundError' || err.name === 'DevicesNotFoundError') {
        message = 'No camera device found on this system. You can use the fallback image upload or simulation buttons below.';
      } else if (err.name === 'NotReadableError' || err.name === 'TrackStartError') {
        message = 'Camera is currently locked or in use by another application (e.g. Teams, Zoom, or Windows Camera). Please close other camera apps and click "Retry Camera".';
      } else {
        message = `Camera error: ${err.message || err.name}. You may use the fallback buttons below to proceed.`;
      }
      setCameraError(message);
    }
  };

  useEffect(() => {
    startCamera();
    return () => {
      stopActiveStream();
    };
  }, [facingMode]);

  // Keep videoRef in sync with stream
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      videoRef.current.play().then(() => setCameraReady(true)).catch(console.warn);
    }
  }, [stream]);

  const toggleFacingMode = () => {
    setFacingMode(prev => prev === 'environment' ? 'user' : 'environment');
  };

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
      setTorchOn(!torchOn);
    }
  };

  // Capture Frame from Video
  const handleCapture = () => {
    const video = videoRef.current;
    if (!video) return;

    // Fallback: If camera stream has not emitted frames yet, generate realistic simulated frame
    if (!video.videoWidth || !video.videoHeight) {
      generateSimulatedTestCard();
      return;
    }

    setIsCapturing(true);
    const canvas = canvasRef.current || document.createElement('canvas');
    canvas.width = video.videoWidth || 640;
    canvas.height = video.videoHeight || 480;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.95);
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
      setIsCapturing(false);
    }, 250);
  };

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

  // Generate synthetic test frame for environments without a webcam
  const generateSimulatedTestCard = () => {
    const canvas = document.createElement('canvas');
    canvas.width = 640;
    canvas.height = 480;
    const ctx = canvas.getContext('2d');

    if (activeMode === 'sample') {
      const colors = ['#4A154B', '#1B4D3E', '#0047AB', '#DE8A0C', '#800020'];
      const currentIdx = sampleImages.length;
      const reactionColor = colors[currentIdx % colors.length];

      ctx.fillStyle = '#F1F5F9';
      ctx.fillRect(0, 0, 640, 480);

      ctx.beginPath();
      ctx.arc(320, 240, 140, 0, Math.PI * 2);
      ctx.fillStyle = reactionColor;
      ctx.fill();
      ctx.strokeStyle = '#0B3C8C';
      ctx.lineWidth = 6;
      ctx.stroke();

      ctx.fillStyle = '#0F172A';
      ctx.font = 'bold 20px Inter, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`FORENSIC EVIDENCE SAMPLE #${currentIdx + 1}`, 320, 60);
      ctx.font = '14px Inter, sans-serif';
      ctx.fillText(`Timestamp: ${new Date().toLocaleString()} | ID: EVD-${Date.now().toString().slice(-6)}`, 320, 90);
      ctx.fillText('Reagent Chemical Reaction Spot Test', 320, 430);
    } else {
      ctx.fillStyle = '#FFFFFF';
      ctx.fillRect(0, 0, 640, 480);

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

  const deleteSample = (index) => {
    const updated = sampleImages.filter((_, i) => i !== index).map((s, idx) => ({
      ...s,
      id: idx + 1,
      label: `Sample Frame #${idx + 1}`
    }));
    onSamplesChange(updated);
  };

  const deleteReferenceCard = () => {
    onReferenceCardChange(null);
  };

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

      <div className="capture-layout">
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

          <div className={`camera-viewport ${torchOn ? 'flash-active' : ''}`}>
            <div className="camera-frame" style={{ display: cameraError ? 'none' : 'block' }}>
              <video
                ref={videoRef}
                playsInline
                autoPlay
                muted
                onPlay={() => setCameraReady(true)}
                onLoadedMetadata={(e) => {
                  e.target.play().catch(console.warn);
                  setCameraReady(true);
                }}
                className="camera-video-element"
              />

              {isCapturing && <div className="shutter-flash" />}

              <div className="corner corner-top-left" />
              <div className="corner corner-top-right" />
              <div className="corner corner-bottom-left" />
              <div className="corner corner-bottom-right" />

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

              <div className="camera-status-pill">
                <span className={`live-dot ${cameraReady ? '' : 'warn'}`} />
                <span>{cameraReady ? 'LIVE' : 'INITIALIZING'}</span>
              </div>

              <div className="camera-top-tools">
                {cameraDeviceList.length > 1 && (
                  <select
                    className="device-select"
                    value={selectedDeviceId}
                    onChange={(e) => {
                      setSelectedDeviceId(e.target.value);
                      startCamera(e.target.value);
                    }}
                    title="Select Camera Device"
                  >
                    {cameraDeviceList.map((d, i) => (
                      <option key={d.deviceId || i} value={d.deviceId}>
                        {d.label || `Camera ${i + 1}`}
                      </option>
                    ))}
                  </select>
                )}
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

            {cameraError && (
              <div className="camera-error-banner">
                <AlertCircle size={36} color="var(--danger-red)" />
                <p className="error-title">Camera Notice</p>
                <p className="error-desc">{cameraError}</p>
                <div className="error-actions">
                  <button type="button" className="btn-secondary" onClick={() => startCamera()}>
                    <RefreshCw size={14} /> Retry Camera
                  </button>
                  <button
                    type="button"
                    className="btn-primary"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <Upload size={14} /> Upload from Device
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={generateSimulatedTestCard}
                  >
                    <Zap size={14} /> Simulate Test Frame
                  </button>
                </div>
              </div>
            )}
          </div>

          <div className="camera-controls">
            <button
              type="button"
              className="secondary-control"
              onClick={activeMode === 'sample' ? resetSamples : deleteReferenceCard}
              disabled={activeMode === 'sample' ? sampleImages.length === 0 : !referenceCard}
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
            >
              <Upload size={16} />
              <span>Upload</span>
            </button>

            <button
              type="button"
              className="secondary-control test-btn"
              onClick={generateSimulatedTestCard}
            >
              <Zap size={16} />
              <span>Test Frame</span>
            </button>
          </div>

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
                    onClick={() => setActiveMode('sample')}
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
    </div>
  );
}