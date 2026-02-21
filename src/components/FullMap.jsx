import React, { useEffect, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Polyline, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

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

const waypointIcon = new L.DivIcon({
  className: '',
  html: `<div style="
    width: 18px; height: 18px;
    background: #a855f7;
    border-radius: 50%;
    border: 3px solid white;
    box-shadow: 0 0 12px rgba(168,85,247,0.8), 0 0 24px rgba(168,85,247,0.4);
  "></div>`,
  iconSize: [18, 18],
  iconAnchor: [9, 9],
});

const MapInteraction = ({ onCenterChange, isTracking, waypointMode, onWaypointAdd }) => {
  const map = useMapEvents({
    moveend: () => {
      if (isTracking && onCenterChange) onCenterChange(map.getCenter());
    },
    load: () => {
      if (isTracking && onCenterChange) onCenterChange(map.getCenter());
    },
    click: (e) => {
      if (waypointMode && onWaypointAdd) onWaypointAdd({ lat: e.latlng.lat, lng: e.latlng.lng });
    },
  });
  return null;
};

const FullMap = ({
  startPoint,
  turnaroundPoint,
  routePath,
  isLoading,
  isCustomMode,
  onCenterChange,
  runMode,
  waypoints = [],
  waypointMode = false,
  onWaypointAdd,
  onWaypointRemove,
}) => {
  const [mapCenter, setMapCenter] = useState([37.5665, 126.978]);
  const [isMapTilesLoaded, setIsMapTilesLoaded] = useState(false);
  const VWORLD_API_KEY = 'C472C587-78DE-3BB8-8939-F86C181BE19A';

  useEffect(() => {
    if (startPoint && !isCustomMode) {
      setMapCenter([startPoint.lat, startPoint.lng]);
    }
  }, [startPoint, isCustomMode]);

  return (
    <div className="absolute left-0 top-0 z-0 h-screen w-screen bg-deep-bg">
      <MapContainer
        center={mapCenter}
        zoom={16}
        className="h-full w-full"
        zoomControl={false}
      >
        <TileLayer
          className="dark-map-tiles"
          attribution='&copy; <a href="https://map.vworld.kr">VWORLD</a>'
          url={`https://api.vworld.kr/req/wmts/1.0.0/${VWORLD_API_KEY}/Base/{z}/{y}/{x}.png`}
          eventHandlers={{
            tileload: () => {
              if (!isMapTilesLoaded) setIsMapTilesLoaded(true);
            },
          }}
        />
        <MapInteraction
          isTracking={isCustomMode}
          onCenterChange={onCenterChange}
          waypointMode={waypointMode}
          onWaypointAdd={onWaypointAdd}
        />
        {startPoint && !isCustomMode && (
          <Marker position={[startPoint.lat, startPoint.lng]} icon={startIcon}>
            <Popup>출발지</Popup>
          </Marker>
        )}
        {waypoints.map((wp, idx) => (
          <Marker
            key={`wp-${idx}`}
            position={[wp.lat, wp.lng]}
            icon={waypointIcon}
            eventHandlers={{
              click: () => onWaypointRemove && onWaypointRemove(idx),
            }}
          >
            <Popup>
              경유지 {idx + 1}
              <br />
              <span
                className="cursor-pointer text-[0.7rem] text-[#ff5050]"
                onClick={() => onWaypointRemove && onWaypointRemove(idx)}
                onKeyDown={(e) => e.key === 'Enter' && onWaypointRemove && onWaypointRemove(idx)}
                role="button"
                tabIndex={0}
              >
                삭제
              </span>
            </Popup>
          </Marker>
        ))}
        {turnaroundPoint && (
          <Marker position={[turnaroundPoint.lat, turnaroundPoint.lng]} icon={endIcon}>
            <Popup>{runMode === 'oneWay' ? '도착지' : '반환점'}</Popup>
          </Marker>
        )}
        {routePath && routePath.length > 0 && (
          <>
            <Polyline
              positions={routePath}
              pathOptions={{
                color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                weight: 12,
                opacity: 0.4,
                lineCap: 'round',
              }}
            />
            <Polyline
              positions={routePath}
              pathOptions={{ color: '#ffffff', weight: 4, opacity: 1 }}
            />
          </>
        )}
      </MapContainer>

      {isCustomMode && (
        <div className="absolute left-1/2 top-1/2 z-[1400] -translate-x-1/2 -translate-y-1/2 pointer-events-none">
          <div className="flex h-12 w-12 items-center justify-center rounded-full border-[3px] border-neon-blue bg-neon-blue/10 shadow-[0_0_20px_rgba(0,243,255,0.5),inset_0_0_20px_rgba(0,243,255,0.1)]">
            <div className="h-2 w-2 rounded-full bg-neon-blue shadow-[0_0_10px_rgba(0,243,255,0.8)]" />
          </div>
          <div className="mt-2 text-center text-[0.7rem] font-semibold tracking-wide text-neon-blue/80 shadow-[0_0_10px_rgba(0,243,255,0.5)]">
            출발지 설정
          </div>
        </div>
      )}

      {waypointMode && (
        <div className="absolute left-1/2 top-1/2 z-[1400] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
          <div className="rounded-xl border border-[rgba(168,85,247,0.3)] bg-[rgba(168,85,247,0.15)] px-4 py-2 text-[0.8rem] font-bold text-[#a855f7] backdrop-blur-sm animate-pulse">
            🗺️ 지도를 탭하여 경유지 추가
          </div>
        </div>
      )}

      {!isMapTilesLoaded && (
        <div className="glass-panel absolute left-1/2 top-1/2 z-[1500] -translate-x-1/2 -translate-y-1/2 rounded-[20px] px-8 py-4 text-[0.9rem] text-white">
          지도 로딩 중...
        </div>
      )}

      {isLoading && (
        <div
          className="absolute inset-0 z-[2000] flex flex-col items-center justify-center bg-black/60 text-center backdrop-blur-sm"
          style={{ color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff' }}
        >
          <div
            className="mb-5 h-[50px] w-[50px] rounded-full border-[5px] animate-spin"
            style={{
              borderColor: runMode === 'oneWay' ? 'rgba(255,158,0,0.3)' : 'rgba(0,243,255,0.3)',
              borderTopColor: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
            }}
          />
          <div className="text-[1.2rem] font-bold">
            {runMode === 'oneWay' ? '편도 경로 생성 중...' : '왕복 경로 생성 중...'}
          </div>
        </div>
      )}
    </div>
  );
};

export default FullMap;
