
import React, { useEffect, useState } from 'react';
// Note: You need to install 'leaflet' and 'react-leaflet' 
// npm install leaflet react-leaflet
import { MapContainer, TileLayer, Marker, Popup, Polyline } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import '../assets/marker_placeholder.png'; // Placeholder strictly as requested

const FullMap = ({ startPoint, turnaroundPoint, routePath, isLoading }) => {
    const [mapCenter, setMapCenter] = useState([37.5665, 126.9780]); // Default: Seoul City Hall

    useEffect(() => {
        if (startPoint) {
            setMapCenter([startPoint.lat, startPoint.lng]);
        }
    }, [startPoint]);

    return (
        <div style={{ height: '100vh', width: '100vw', position: 'absolute', top: 0, left: 0, zIndex: 0 }}>
            <MapContainer
                center={mapCenter}
                zoom={14}
                style={{ height: '100%', width: '100%' }}
                zoomControl={false} // Hide default zoom for clean UI
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                {startPoint && (
                    <Marker position={[startPoint.lat, startPoint.lng]}>
                        <Popup>출발지 (Start)</Popup>
                    </Marker>
                )}

                {turnaroundPoint && (
                    <Marker position={[turnaroundPoint.lat, turnaroundPoint.lng]}>
                        <Popup>반환점 (Turnaround)</Popup>
                    </Marker>
                )}

                {routePath && (
                    <Polyline positions={routePath} color="blue" />
                )}
            </MapContainer>

            {/* Loading Overlay */}
            {isLoading && (
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    backgroundColor: 'rgba(0,0,0,0.5)',
                    zIndex: 2000,
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                    color: 'white',
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    backdropFilter: 'blur(3px)'
                }}>
                    코스를 계산 중입니다...
                </div>
            )}

            {/* Guide Text for Placeholder */}
            <div style={{ position: 'absolute', top: '10px', left: '10px', background: 'rgba(255,255,255,0.7)', padding: '5px', zIndex: 1000, fontSize: '0.8rem' }}>
                * 지도 마커 이미지는 /src/assets 폴더에 추가하여 커스터마이징 가능합니다.
            </div>
        </div>
    );
};

export default FullMap;
