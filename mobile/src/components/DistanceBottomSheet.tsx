import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import type { RunMode } from '../types/course';

interface DistanceBottomSheetProps {
  onStart: (distanceMeters: number) => void;
  isLoading: boolean;
  isReady: boolean;
  startMode: string;
  runMode: RunMode;
}

export default function DistanceBottomSheet({ onStart, isLoading, isReady, runMode }: DistanceBottomSheetProps) {
  const [distanceKm, setDistanceKm] = useState(5);

  const adjust = (delta: number) => {
    setDistanceKm((prev) => Math.max(1, Math.min(42, Math.round((prev + delta) * 10) / 10)));
  };

  const isOneWay = runMode === 'oneWay';
  const accent = isOneWay ? '#ff9e00' : '#00f3ff';

  return (
    <View style={styles.panel}>
      <View style={styles.row}>
        <Text style={styles.label}>{isOneWay ? '편도' : '왕복'}</Text>
        <Pressable style={styles.roundBtn} onPress={() => adjust(-0.5)} disabled={isLoading}>
          <Text style={styles.roundBtnText}>−</Text>
        </Pressable>
        <View style={styles.distanceWrap}>
          <Text style={[styles.distance, { color: accent }]}>
            {distanceKm.toFixed(1)} <Text style={styles.unit}>KM</Text>
          </Text>
        </View>
        <Pressable style={styles.roundBtn} onPress={() => adjust(0.5)} disabled={isLoading}>
          <Text style={styles.roundBtnText}>+</Text>
        </Pressable>
      </View>
      <View style={styles.actions}>
        <Pressable
          style={[styles.primaryBtn, { backgroundColor: isOneWay ? '#ff9e00' : '#0072FF' }]}
          onPress={() => onStart(distanceKm * 1000)}
          disabled={isLoading || !isReady}
        >
          <Text style={styles.primaryBtnText}>
            {isLoading ? '경로 생성 중...' : !isReady ? 'GPS 대기 중...' : isOneWay ? '편도 코스 생성' : '왕복 코스 생성'}
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  panel: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    borderRadius: 20,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: 'rgba(20,20,20,0.85)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    zIndex: 1000,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 14,
    marginBottom: 10,
  },
  label: {
    fontSize: 12,
    color: '#aaa',
  },
  roundBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roundBtnText: {
    fontSize: 20,
    color: '#fff',
  },
  distanceWrap: { minWidth: 100, alignItems: 'center' },
  distance: { fontSize: 28, fontWeight: '800' },
  unit: { fontSize: 12, color: '#888', fontWeight: 'normal' },
  actions: { flexDirection: 'row', gap: 8 },
  primaryBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  primaryBtnText: {
    fontSize: 16,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
});
