import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet default marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Custom neon markers
const startIcon = new L.DivIcon({
    className: '',
    html: `<div style="
        width: 20px; height: 20px;
        background: #00f3ff;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 12px rgba(0,243,255,0.8), 0 0 24px rgba(0,243,255,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

const endIcon = new L.DivIcon({
    className: '',
    html: `<div style="
        width: 20px; height: 20px;
        background: #ff9e00;
        border-radius: 50%;
        border: 3px solid white;
        box-shadow: 0 0 12px rgba(255,158,0,0.8), 0 0 24px rgba(255,158,0,0.4);
    "></div>`,
    iconSize: [20, 20],
    iconAnchor: [10, 10],
});

// Component to track map center movements
const MapCenterTracker = ({ onCenterChange, isTracking }) => {
    const map = useMapEvents({
        moveend: () => {
            if (isTracking && onCenterChange) {
                onCenterChange(map.getCenter());
            }
        },
        load: () => {
            if (isTracking && onCenterChange) onCenterChange(map.getCenter());
        }
    });
    return null;
};

const FullMap = ({ startPoint, turnaroundPoint, routePath, isLoading, isCustomMode, onCenterChange, runMode }) => {
    const [mapCenter, setMapCenter] = useState([37.5665, 126.9780]); // Default: Seoul
    const [isMapTilesLoaded, setIsMapTilesLoaded] = useState(false);

    const VWORLD_API_KEY = "C472C587-78DE-3BB8-8939-F86C181BE19A";

    useEffect(() => {
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

                <MapCenterTracker isTracking={isCustomMode} onCenterChange={onCenterChange} />

                {/* Start Marker */}
                {startPoint && !isCustomMode && (
                    <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
                        <Popup>출발지</Popup>
                    </Marker>
                )}

                {/* End/Turnaround Marker */}
                {turnaroundPoint && (
                    <Marker position={[turnaroundPoint.lat, turnaroundPoint.lng]} icon={endIcon}>
                        <Popup>{runMode === 'oneWay' ? '도착지' : '반환점'}</Popup>
                    </Marker>
                )}

                {/* Glowing Path Effect */}
                {routePath && routePath.length > 0 && (
                    <>
                        {/* Outer Glow */}
                        <Polyline
                            positions={routePath}
                            pathOptions={{
                                color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                                weight: 12,
                                opacity: 0.4,
                                lineCap: 'round'
                            }}
                        />
                        {/* Inner Core */}
                        <Polyline
                            positions={routePath}
                            pathOptions={{ color: '#ffffff', weight: 4, opacity: 1 }}
                        />
                    </>
                )}
            </MapContainer>

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
                    <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        border: '3px solid #00f3ff',
                        boxShadow: '0 0 20px rgba(0,243,255,0.5), inset 0 0 20px rgba(0,243,255,0.1)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        background: 'rgba(0,243,255,0.08)'
                    }}>
                        <div style={{
                            width: '8px',
                            height: '8px',
                            borderRadius: '50%',
                            background: '#00f3ff',
                            boxShadow: '0 0 10px rgba(0,243,255,0.8)'
                        }} />
                    </div>
                    <div style={{
                        textAlign: 'center',
                        marginTop: '8px',
                        fontSize: '0.7rem',
                        color: 'rgba(0,243,255,0.8)',
                        fontWeight: '600',
                        letterSpacing: '1px',
                        textShadow: '0 0 10px rgba(0,243,255,0.5)'
                    }}>
                        출발지 설정
                    </div>
                </div>
            )}

            {/* Map Loading Overlay */}
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
                    color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                    backdropFilter: 'blur(5px)'
                }}>
                    <div style={{
                        width: '50px',
                        height: '50px',
                        border: `5px solid ${runMode === 'oneWay' ? 'rgba(255,158,0,0.3)' : 'rgba(0,243,255,0.3)'}`,
                        borderTopColor: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                        borderRadius: '50%',
                        animation: 'spin 1s linear infinite',
                        marginBottom: '20px'
                    }}></div>
                    <div style={{ fontSize: '1.2rem', fontWeight: 'bold' }}>
                        {runMode === 'oneWay' ? '편도 경로 생성 중...' : '왕복 경로 생성 중...'}
                    </div>
                </div>
            )}

            <style>
                {`@keyframes spin { to { transform: rotate(360deg); } }`}
            </style>
        </div>
    );
};

export default FullMap;
