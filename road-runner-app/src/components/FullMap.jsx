import React, { useEffect, useState } from 'react';
// Note: You need to install 'leaflet' and 'react-leaflet' 
// npm install leaflet react-leaflet
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
// import '../assets/marker_placeholder.png'; // Commented out to prevent build error until file exists

// Component to track map center movements
const MapCenterTracker = ({ onCenterChange, isTracking }) => {
    const map = useMapEvents({
        moveend: () => {
            if (isTracking && onCenterChange) {
                onCenterChange(map.getCenter());
            }
        },
        // Also fire on load/move to init
        load: () => {
            if (isTracking && onCenterChange) onCenterChange(map.getCenter());
        }
    });
    return null;
};

const FullMap = ({ startPoint, turnaroundPoint, routePath, isLoading, isCustomMode, onModeChange, onCenterChange }) => {
    const [mapCenter, setMapCenter] = useState([37.5665, 126.9780]); // Default: Seoul City Hall
    const [isMapTilesLoaded, setIsMapTilesLoaded] = useState(false);

    // VWorld API Key Configuration
    const VWORLD_API_KEY = "C472C587-78DE-3BB8-8939-F86C181BE19A";

    useEffect(() => {
        // Only update map center from props if we strictly need to force it (e.g. GPS found)
        // In custom mode, we let the user drag.
        if (startPoint && !isCustomMode) {
            setMapCenter([startPoint.lat, startPoint.lng]);
        }
    }, [startPoint, isCustomMode]);

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0, background: '#121212' }}>
            <MapContainer
                center={mapCenter}
                zoom={16}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false}
            >
                <TileLayer
                    className="dark-map-tiles"
                    attribution='&copy; <a href="https://map.vworld.kr">VWORLD</a>'
                    url={`https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`}
                    eventHandlers={{
                        tileload: () => {
                            if (!isMapTilesLoaded) setIsMapTilesLoaded(true);
                        }
                    }}
                />

                {/* Tracker for Custom Mode */}
                <MapCenterTracker isTracking={isCustomMode} onCenterChange={onCenterChange} />

                {/* Markers */}
                {startPoint && !isCustomMode && (
                    <Marker position={[startPoint.lat, startPoint.lng]}>
                        <Popup>My Location</Popup>
                    </Marker>
                )}

                {turnaroundPoint && (
                    <Marker position={[turnaroundPoint.lat, turnaroundPoint.lng]}>
                        <Popup>Turnaround Point</Popup>
                    </Marker>
                )}

                {/* Glowing Path Effect */}
                {routePath && routePath.length > 0 && (
                    <>
                        {/* Outer Glow */}
                        <Polyline
                            positions={routePath}
                            pathOptions={{ color: '#00f3ff', weight: 12, opacity: 0.4, lineCap: 'round' }}
                        />
                        {/* Inner Core */}
                        <Polyline
                            positions={routePath}
                            pathOptions={{ color: '#ffffff', weight: 4, opacity: 1 }}
                        />
                    </>
                )}
            </MapContainer>

            {/* Top Floating Header (Mode Switch) */}
            <div className="glass-panel" style={{
                position: 'absolute',
                top: '50px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1500,
                borderRadius: '30px',
                padding: '5px',
                display: 'flex',
                gap: '5px'
            }}>
                <button
                    onClick={() => onModeChange('current')}
                    style={{
                        background: !isCustomMode ? 'rgba(255,255,255,0.2)' : 'transparent',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '25px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.3s'
                    }}
                >
                    📍 현 위치
                </button>
                <button
                    onClick={() => onModeChange('custom')}
                    style={{
                        background: isCustomMode ? 'rgba(255,255,255,0.2)' : 'transparent',
                        border: 'none',
                        color: 'white',
                        padding: '10px 20px',
                        borderRadius: '25px',
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: '0.3s'
                    }}
                >
                    🔍 직접 설정
                </button>
            </div>

            {/* Center Crosshair for Custom Mode */}
            {isCustomMode && (
                <div style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1400,
                    pointerEvents: 'none'
                }}>
                    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00f3ff" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" />
                        <line x1="12" y1="8" x2="12" y2="16" />
                        <line x1="8" y1="12" x2="16" y2="12" />
                    </svg>
                </div>
            )}

            {/* Map Auth / Loading Status Overlay */}
            {!isMapTilesLoaded && (
                <div className="glass-panel" style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    zIndex: 1500,
                    padding: '15px 30px',
                    borderRadius: '20px',
                    fontSize: '0.9rem',
                    color: '#fff',
                }}>
                    지도 로딩 중...
                </div>
            )}

            {/* Loading Overlay (Course Calculation) */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    flexDirection: 'column',
                    color: '#00f3ff',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div className="spinner" style={{
                        width: '50px',
                        height: '50px',
                        border: '5px solid rgba(0,243,255,0.3)',
                        borderTopColor: '#00f3ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>COURSING...</div>
                </div>
            )}

            <style>
                {`
                    @keyframes spin { to { transform: rotate(360deg); } }
                `}
            </style>
        </div>
    );
};

export default FullMap;
