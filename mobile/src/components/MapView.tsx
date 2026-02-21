import React, { useState, useRef } from 'react';
import { View, StyleSheet, Text } from 'react-native';
import MapViewRN, { Marker, Polyline } from 'react-native-maps';
import type { LatLng } from '../types/course';
import type { RunMode } from '../types/course';

interface MapViewProps {
  startPoint: LatLng | null;
  turnaroundPoint: LatLng | null;
  routePath: LatLng[];
  isLoading: boolean;
  isCustomMode: boolean;
  onCenterChange: (center: LatLng) => void;
  runMode: RunMode;
  waypoints: LatLng[];
  waypointMode: boolean;
  onWaypointAdd: (point: LatLng) => void;
  onWaypointRemove: (index: number) => void;
}

const SEOUL_REGION = { latitude: 37.5665, longitude: 126.978 };

export default function MapView({
  startPoint,
  turnaroundPoint,
  routePath,
  isLoading,
  isCustomMode,
  onCenterChange,
  runMode,
  waypoints,
  waypointMode,
  onWaypointAdd,
  onWaypointRemove,
}: MapViewProps) {
  const [region, setRegion] = useState({
    ...SEOUL_REGION,
    latitudeDelta: 0.01,
    longitudeDelta: 0.01,
  });
  const mapRef = useRef<MapViewRN>(null);

  const routeCoords = routePath.map((p) => ({ latitude: p.lat, longitude: p.lng }));
  const lineColor = runMode === 'oneWay' ? '#ff9e00' : '#00f3ff';

  return (
    <View style={StyleSheet.absoluteFill}>
      <MapViewRN
        ref={mapRef}
        style={StyleSheet.absoluteFill}
        initialRegion={{ ...SEOUL_REGION, latitudeDelta: 0.02, longitudeDelta: 0.02 }}
        onRegionChangeComplete={(r) => onCenterChange({ lat: r.latitude, lng: r.longitude })}
        onPress={(e) => waypointMode && onWaypointAdd({ lat: e.nativeEvent.coordinate.latitude, lng: e.nativeEvent.coordinate.longitude })}
        mapType="standard"
        showsUserLocation
      >
        {startPoint && !isCustomMode && (
          <Marker
            coordinate={{ latitude: startPoint.lat, longitude: startPoint.lng }}
            pinColor="#00f3ff"
            title="출발지"
          />
        )}
        {waypoints.map((wp, i) => (
          <Marker
            key={`wp-${i}`}
            coordinate={{ latitude: wp.lat, longitude: wp.lng }}
            pinColor="#a855f7"
            title={`경유지 ${i + 1}`}
            onCalloutPress={() => onWaypointRemove(i)}
          />
        ))}
        {turnaroundPoint && (
          <Marker
            coordinate={{ latitude: turnaroundPoint.lat, longitude: turnaroundPoint.lng }}
            pinColor="#ff9e00"
            title={runMode === 'oneWay' ? '도착지' : '반환점'}
          />
        )}
        {routeCoords.length > 1 && (
          <Polyline coordinates={routeCoords} strokeColor={lineColor} strokeWidth={4} />
        )}
      </MapViewRN>

      {isCustomMode && (
        <View style={styles.crosshair} pointerEvents="none">
          <View style={styles.crosshairCircle} />
          <Text style={styles.crosshairLabel}>출발지 설정</Text>
        </View>
      )}

      {waypointMode && (
        <View style={styles.waypointHint} pointerEvents="none">
          <Text style={styles.waypointHintText}>🗺️ 지도를 탭하여 경유지 추가</Text>
        </View>
      )}

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <Text style={styles.loadingText}>
            {runMode === 'oneWay' ? '편도 경로 생성 중...' : '왕복 경로 생성 중...'}
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  crosshair: {
    ...StyleSheet.absoluteFillObject,
    alignItems: 'center',
    justifyContent: 'center',
  },
  crosshairCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    borderWidth: 3,
    borderColor: '#00f3ff',
    backgroundColor: 'rgba(0,243,255,0.1)',
  },
  crosshairLabel: {
    marginTop: 8,
    fontSize: 12,
    fontWeight: '600',
    color: 'rgba(0,243,255,0.9)',
  },
  waypointHint: {
    position: 'absolute',
    bottom: 120,
    alignSelf: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: 'rgba(168,85,247,0.2)',
  },
  waypointHintText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#a855f7',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#00f3ff',
  },
});
