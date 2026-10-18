import React, { useState, useEffect, useRef } from 'react';
import {
  MapPin,
  Layers,
  Search,
  Filter,
  ExternalLink,
  Shield,
  Key,
  Maximize2,
  AlertTriangle,
  CheckCircle2,
  Navigation,
  Crosshair,
  Info
} from 'lucide-react';
import { useCases } from '../context/CasesContext';
import { Link } from 'react-router-dom';

// Parse strings like "28.6139° N, 77.2090° E" or "28.6139, 77.2090"
export function parseCoordinates(coordStr) {
  if (!coordStr) return { lat: 28.6139, lng: 77.2090 };
  try {
    const clean = coordStr.replace(/[°NSEW\s]/gi, ' ').trim();
    const parts = clean.split(/[,\s]+/).filter(Boolean);
    if (parts.length >= 2) {
      const lat = parseFloat(parts[0]);
      const lng = parseFloat(parts[1]);
      if (!isNaN(lat) && !isNaN(lng)) {
        return { lat, lng };
      }
    }
  } catch (e) {
    // ignore
  }
  return { lat: 28.6139, lng: 77.2090 };
}

// Substance color tokens for forensic mapping
export const SUBSTANCE_COLORS = {
  Cocaine: '#2563EB',        // Blue
  Heroin: '#DC2626',         // Red
  Methamphetamine: '#9333EA',// Purple
  Cannabis: '#16A34A',       // Green
  MDMA: '#D97706',           // Amber
  Inconclusive: '#64748B'    // Slate
};

export default function CrimeMap({
  height = '500px',
  customCases = null,
  showFilters = true,
  showKeyModal = true,
  selectedCaseId = null
}) {
  const { cases: contextCases } = useCases();
  const cases = customCases || contextCases || [];

  const mapContainerRef = useRef(null);
  const googleMapInstanceRef = useRef(null);
  const markersRef = useRef([]);

  // Google Maps State
  const [apiKey, setApiKey] = useState(() => {
    return localStorage.getItem('nishpaksh_google_maps_api_key') ||
      (import.meta.env?.VITE_GOOGLE_MAPS_API_KEY || '');
  });
  const [isGoogleLoaded, setIsGoogleLoaded] = useState(false);
  const [googleLoadError, setGoogleLoadError] = useState(null);
  const [showConfigModal, setShowConfigModal] = useState(false);
  const [tempApiKey, setTempApiKey] = useState(apiKey);

  // Map Filter State
  const [selectedSubstance, setSelectedSubstance] = useState('All');
  const [activePin, setActivePin] = useState(null);
  const [mapMode, setMapMode] = useState('roadmap'); // 'roadmap' | 'satellite' | 'tactical'

  // Filtered cases
  const filteredCases = cases.filter(c => {
    if (selectedSubstance === 'All') return true;
    return (c.substance || '').toLowerCase() === selectedSubstance.toLowerCase();
  });

  // Attempt to load Google Maps script if API key is present
  useEffect(() => {
    if (!apiKey) {
      setIsGoogleLoaded(false);
      return;
    }

    // Check if already in window
    if (window.google && window.google.maps) {
      setIsGoogleLoaded(true);
      return;
    }

    const scriptId = 'google-maps-script';
    let script = document.getElementById(scriptId);

    if (!script) {
      script = document.createElement('script');
      script.id = scriptId;
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places,visualization`;
      script.async = true;
      script.defer = true;
      script.onload = () => {
        setIsGoogleLoaded(true);
        setGoogleLoadError(null);
      };
      script.onerror = () => {
        setGoogleLoadError('Failed to load Google Maps API script. Please check your API key and network.');
        setIsGoogleLoaded(false);
      };
      document.head.appendChild(script);
    } else {
      setIsGoogleLoaded(true);
    }
  }, [apiKey]);

  // Initialize or update Google Map when script is loaded
  useEffect(() => {
    if (!isGoogleLoaded || !window.google || !window.google.maps || !mapContainerRef.current) {
      return;
    }

    try {
      if (!googleMapInstanceRef.current) {
        // Centered around northern/central India
        const center = { lat: 28.6139, lng: 77.2090 };
        googleMapInstanceRef.current = new window.google.maps.Map(mapContainerRef.current, {
          center,
          zoom: 6,
          mapTypeId: mapMode === 'satellite' ? 'satellite' : 'roadmap',
          streetViewControl: false,
          mapTypeControl: true,
          fullscreenControl: true,
          styles: [
            {
              featureType: 'all',
              elementType: 'labels.text.fill',
              stylers: [{ color: '#1e293b' }]
            },
            {
              featureType: 'administrative.country',
              elementType: 'geometry.stroke',
              stylers: [{ color: '#0B3C8C' }, { weight: 1.5 }]
            }
          ]
        });
      } else {
        googleMapInstanceRef.current.setMapTypeId(
          mapMode === 'satellite' ? 'satellite' : 'roadmap'
        );
      }

      // Clear old markers
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      // Add markers for filtered cases
      const bounds = new window.google.maps.LatLngBounds();

      filteredCases.forEach((item) => {
        const coords = parseCoordinates(item.coordinates);
        const pinColor = SUBSTANCE_COLORS[item.substance] || '#0B3C8C';

        const marker = new window.google.maps.Marker({
          position: coords,
          map: googleMapInstanceRef.current,
          title: `${item.id} - ${item.substance}`,
          icon: {
            path: window.google.maps.SymbolPath.CIRCLE,
            fillColor: pinColor,
            fillOpacity: 0.9,
            strokeColor: '#FFFFFF',
            strokeWeight: 2,
            scale: 9
          }
        });

        const infoWindow = new window.google.maps.InfoWindow({
          content: `
            <div style="padding: 8px; font-family: sans-serif; color: #0F172A; max-width: 240px;">
              <div style="font-size: 11px; font-weight: bold; color: #0B3C8C; text-transform: uppercase;">NDPS Section 52A Case</div>
              <div style="font-size: 14px; font-weight: 700; margin: 2px 0;">${item.id}</div>
              <div style="font-size: 12px; margin-bottom: 4px;">
                <strong>Substance:</strong> <span style="color: ${pinColor}; font-weight: bold;">${item.substance || 'Unspecified'}</span>
              </div>
              <div style="font-size: 11px; color: #475569;"><strong>Location:</strong> ${item.location || 'Unknown'}</div>
              <div style="font-size: 11px; color: #475569;"><strong>Officer:</strong> ${item.officer || 'NCB Field Unit'}</div>
              <div style="font-size: 11px; color: #16a34a; font-weight: 600; margin-top: 4px;">Confidence: ${item.confidence || 92}%</div>
            </div>
          `
        });

        marker.addListener('click', () => {
          infoWindow.open(googleMapInstanceRef.current, marker);
          setActivePin(item);
        });

        bounds.extend(coords);
        markersRef.current.push(marker);
      });

      if (filteredCases.length > 0 && !bounds.isEmpty()) {
        googleMapInstanceRef.current.fitBounds(bounds);
        // Don't zoom in excessively if only 1 item
        const listener = window.google.maps.event.addListener(
          googleMapInstanceRef.current,
          'idle',
          () => {
            if (googleMapInstanceRef.current.getZoom() > 12) {
              googleMapInstanceRef.current.setZoom(11);
            }
            window.google.maps.event.removeListener(listener);
          }
        );
      }
    } catch (err) {
      console.warn('Google Maps render error:', err);
    }
  }, [isGoogleLoaded, filteredCases, mapMode]);

  // Set active pin on load if selectedCaseId provided
  useEffect(() => {
    if (selectedCaseId) {
      const match = cases.find(c => c.id === selectedCaseId);
      if (match) setActivePin(match);
    } else if (cases.length > 0 && !activePin) {
      setActivePin(cases[0]);
    }
  }, [selectedCaseId, cases]);

  const handleSaveApiKey = () => {
    const trimmed = tempApiKey.trim();
    setApiKey(trimmed);
    localStorage.setItem('nishpaksh_google_maps_api_key', trimmed);
    setShowConfigModal(false);
  };

  const substances = ['All', 'Cocaine', 'Heroin', 'Methamphetamine', 'Cannabis'];

  return (
    <div className="crime-map-wrapper card" style={{ padding: '0', overflow: 'hidden' }}>
      {/* Top Map Control Bar */}
      <div className="crime-map-toolbar">
        <div className="map-toolbar-left">
          <div className="map-title-badge">
            <Crosshair size={16} className="text-navy" />
            <span className="font-bold">NDPS Hotspot & Seizure Crime Map</span>
          </div>
          {isGoogleLoaded ? (
            <span className="badge success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={12} /> Google Maps API Active
            </span>
          ) : (
            <span className="badge neutral" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <Navigation size={12} /> Tactical GIS Grid Mode
            </span>
          )}
        </div>

        <div className="map-toolbar-right">
          {/* Substance Filter */}
          {showFilters && (
            <div className="substance-filter-group hide-mobile">
              {substances.map(sub => (
                <button
                  key={sub}
                  type="button"
                  className={`substance-filter-btn ${selectedSubstance === sub ? 'active' : ''}`}
                  onClick={() => setSelectedSubstance(sub)}
                >
                  {sub}
                </button>
              ))}
            </div>
          )}

          {/* Map Layer Mode Toggle */}
          <div className="map-mode-toggle">
            <button
              type="button"
              className={`mode-btn ${mapMode === 'roadmap' ? 'active' : ''}`}
              onClick={() => setMapMode('roadmap')}
              title="Standard Roadmap View"
            >
              Roads
            </button>
            <button
              type="button"
              className={`mode-btn ${mapMode === 'satellite' ? 'active' : ''}`}
              onClick={() => setMapMode('satellite')}
              title="Satellite Recon View"
            >
              Satellite
            </button>
            <button
              type="button"
              className={`mode-btn ${mapMode === 'tactical' ? 'active' : ''}`}
              onClick={() => setMapMode('tactical')}
              title="Tactical Grid View"
            >
              Tactical
            </button>
          </div>

          {/* Google Maps API Key Config Button */}
          {showKeyModal && (
            <button
              type="button"
              className="btn-secondary"
              style={{ padding: '6px 10px', fontSize: '11px', display: 'flex', alignItems: 'center', gap: '4px' }}
              onClick={() => setShowConfigModal(true)}
              title="Configure Google Maps API Key"
            >
              <Key size={13} />
              <span className="hide-mobile">API Key</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Map View Area */}
      <div style={{ position: 'relative', width: '100%', height }}>
        {/* If Google Maps is loaded and not in pure tactical mode */}
        {isGoogleLoaded && mapMode !== 'tactical' ? (
          <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />
        ) : (
          /* High-Fidelity Tactical GIS Grid Fallback */
          <div className="tactical-map-container" style={{ width: '100%', height: '100%', position: 'relative', background: '#0F172A', overflow: 'hidden' }}>
            {/* Coordinate Grid Lines Background */}
            <svg
              className="tactical-grid-svg"
              width="100%"
              height="100%"
              style={{ position: 'absolute', top: 0, left: 0, opacity: 0.25, pointerEvents: 'none' }}
            >
              <defs>
                <pattern id="grid" width="60" height="60" patternUnits="userSpaceOnUse">
                  <path d="M 60 0 L 0 0 0 60" fill="none" stroke="#38BDF8" strokeWidth="0.75" />
                </pattern>
                <pattern id="radarRings" width="240" height="240" patternUnits="userSpaceOnUse">
                  <circle cx="120" cy="120" r="100" fill="none" stroke="#0284C7" strokeWidth="0.5" strokeDasharray="3 3" />
                  <circle cx="120" cy="120" r="60" fill="none" stroke="#0284C7" strokeWidth="0.5" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#grid)" />
              <rect width="100%" height="100%" fill="url(#radarRings)" />
            </svg>

            {/* Tactical Compass Overlay */}
            <div style={{ position: 'absolute', top: '16px', right: '16px', color: '#38BDF8', fontSize: '10px', fontFamily: 'monospace', pointerEvents: 'none' }}>
              GRID REF: ZONAL-NDPS-MHA<br />
              SECTOR: NORTH-WEST HIGHWAYS<br />
              PULSE: LIVE GPS TELEMETRY
            </div>

            {/* Simulated Geographic Seizure Pins Plotted on Canvas */}
            <div className="tactical-pins-layer" style={{ width: '100%', height: '100%', position: 'relative' }}>
              {filteredCases.map((item, idx) => {
                const coords = parseCoordinates(item.coordinates);
                // Project latitude (approx 8° to 35° N) and longitude (approx 68° to 97° E) to percentage
                const xPercent = Math.max(15, Math.min(85, ((coords.lng - 68) / (92 - 68)) * 75 + 15));
                const yPercent = Math.max(15, Math.min(85, 100 - (((coords.lat - 12) / (34 - 12)) * 75 + 15)));

                const isSelected = activePin?.id === item.id;
                const pinColor = SUBSTANCE_COLORS[item.substance] || '#38BDF8';

                return (
                  <div
                    key={item.id}
                    className={`tactical-pin ${isSelected ? 'active' : ''}`}
                    style={{
                      position: 'absolute',
                      left: `${xPercent}%`,
                      top: `${yPercent}%`,
                      transform: 'translate(-50%, -50%)',
                      cursor: 'pointer',
                      zIndex: isSelected ? 20 : 10
                    }}
                    onClick={() => setActivePin(item)}
                  >
                    {/* Pulsing Sonar Ring */}
                    <div
                      className="radar-pulse"
                      style={{
                        borderColor: pinColor,
                        background: `${pinColor}22`
                      }}
                    />
                    {/* Core Pin Dot */}
                    <div
                      className="radar-core"
                      style={{
                        backgroundColor: pinColor,
                        boxShadow: `0 0 12px ${pinColor}`
                      }}
                    >
                      <MapPin size={12} color="#FFFFFF" />
                    </div>
                    {/* Small Label */}
                    <div className="pin-tooltip-label">
                      {item.location.split(',')[0]}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* API Key Banner Prompt when Google Maps not configured */}
            {!apiKey && (
              <div className="gmaps-api-prompt">
                <Info size={16} color="#38BDF8" />
                <div style={{ flex: 1, fontSize: '12px', color: '#E2E8F0' }}>
                  <strong>Google Maps API Ready:</strong> Connect your Google Maps key to unlock live satellite imagery and street overlays.
                </div>
                <button
                  type="button"
                  className="btn-primary"
                  style={{ padding: '4px 10px', fontSize: '11px', whiteSpace: 'nowrap' }}
                  onClick={() => setShowConfigModal(true)}
                >
                  Connect API Key
                </button>
              </div>
            )}
          </div>
        )}

        {/* Floating Active Seizure Inspector Card (Bottom-Left) */}
        {activePin && (
          <div className="map-floating-inspector">
            <div className="inspector-header">
              <div>
                <span className="inspector-case-id font-bold">{activePin.id}</span>
                <span className="inspector-date">{activePin.date} • {activePin.time}</span>
              </div>
              <span
                className="badge"
                style={{
                  backgroundColor: `${SUBSTANCE_COLORS[activePin.substance] || '#0B3C8C'}20`,
                  color: SUBSTANCE_COLORS[activePin.substance] || '#0B3C8C',
                  fontWeight: 700
                }}
              >
                {activePin.substance}
              </span>
            </div>

            <div className="inspector-body">
              <div className="inspector-row">
                <span className="inspector-label">Seizure Location:</span>
                <span className="inspector-val">{activePin.location}</span>
              </div>
              <div className="inspector-row">
                <span className="inspector-label">GPS Telemetry:</span>
                <span className="inspector-val font-mono">{activePin.coordinates}</span>
              </div>
              <div className="inspector-row">
                <span className="inspector-label">Field Officer:</span>
                <span className="inspector-val">{activePin.officer}</span>
              </div>
              <div className="inspector-row">
                <span className="inspector-label">Reagent & Kit:</span>
                <span className="inspector-val">{activePin.testKit}</span>
              </div>
            </div>

            <div className="inspector-actions">
              <Link
                to={`/cases`}
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px', flex: 1, justifyContent: 'center' }}
              >
                View Case File
              </Link>
              <a
                href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                  activePin.coordinates.replace(/[°NSEW]/gi, '')
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ fontSize: '11px', padding: '5px 10px' }}
                title="Open in Google Maps web"
              >
                <ExternalLink size={13} />
              </a>
            </div>
          </div>
        )}
      </div>

      {/* Modal: Google Maps API Key Setup */}
      {showConfigModal && (
        <div className="modal-overlay" onClick={() => setShowConfigModal(false)}>
          <div className="modal-content card" style={{ maxWidth: '480px', width: '90%' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Key size={18} className="text-navy" />
                <h4 style={{ margin: 0 }}>Configure Google Maps API</h4>
              </div>
              <button
                type="button"
                className="btn-text"
                onClick={() => setShowConfigModal(false)}
                style={{ fontSize: '18px', lineHeight: 1 }}
              >
                ×
              </button>
            </div>

            <div className="modal-body" style={{ background: 'transparent', padding: 0 }}>
              <p style={{ fontSize: '13px', color: 'var(--slate-600)', marginBottom: '14px' }}>
                Enter your Google Maps JavaScript API key. The key is securely saved to your local browser storage and loaded instantly for Crime Map & route surveillance.
              </p>

              <div className="form-group" style={{ marginBottom: '14px' }}>
                <label style={{ fontSize: '12px', fontWeight: 600, display: 'block', marginBottom: '6px' }}>
                  Google Maps API Key
                </label>
                <input
                  type="text"
                  placeholder="AIzaSy..."
                  value={tempApiKey}
                  onChange={(e) => setTempApiKey(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--slate-300)' }}
                />
              </div>

              {googleLoadError && (
                <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', fontSize: '12px', color: '#DC2626', marginBottom: '14px' }}>
                  {googleLoadError}
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setShowConfigModal(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="btn-primary"
                  onClick={handleSaveApiKey}
                >
                  Save & Connect Map
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
