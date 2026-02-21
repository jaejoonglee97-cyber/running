import React, { useState } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { router } from 'expo-router';
import type { RunMode } from '../types/course';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0a0a1a',
    paddingTop: 70,
    paddingBottom: 30,
    paddingHorizontal: 24,
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: '900',
    color: '#00f3ff',
    marginBottom: 12,
    letterSpacing: 2,
  },
  subtitle: {
    fontSize: 14,
    color: 'rgba(255,255,255,0.55)',
    marginBottom: 24,
  },
  card: {
    width: '100%',
    maxWidth: 360,
    paddingVertical: 28,
    paddingHorizontal: 24,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginBottom: 16,
  },
  cardSelected: {
    borderColor: 'rgba(0,243,255,0.8)',
    borderWidth: 2,
    backgroundColor: 'rgba(0,243,255,0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#fff',
    marginBottom: 4,
  },
  cardDesc: {
    fontSize: 13,
    color: 'rgba(255,255,255,0.5)',
  },
  startBtn: {
    marginTop: 20,
    width: '100%',
    maxWidth: 360,
    paddingVertical: 20,
    borderRadius: 18,
    backgroundColor: '#0072FF',
    alignItems: 'center',
  },
  startBtnDisabled: {
    opacity: 0.5,
  },
  startBtnText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 2,
  },
});

export default function StartScreen() {
  const [selectedMode, setSelectedMode] = useState<RunMode | null>(null);

  const handleStart = () => {
    if (selectedMode) {
      router.push({ pathname: '/map', params: { runMode: selectedMode } });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>달려라 하니</Text>
      <Text style={styles.subtitle}>✨ 그 시절 하니도 추천 받은 코스</Text>

      <Pressable
        style={[styles.card, selectedMode === 'roundTrip' && styles.cardSelected]}
        onPress={() => setSelectedMode('roundTrip')}
      >
        <Text style={styles.cardTitle}>🔄 왕복 코스</Text>
        <Text style={styles.cardDesc}>출발 → 반환점 → 출발지로 돌아오기</Text>
      </Pressable>

      <Pressable
        style={[styles.card, selectedMode === 'oneWay' && styles.cardSelected]}
        onPress={() => setSelectedMode('oneWay')}
      >
        <Text style={[styles.cardTitle, selectedMode === 'oneWay' && { color: '#ff9e00' }]}>➡️ 편도 코스</Text>
        <Text style={styles.cardDesc}>출발 → 목적지까지 한 방향으로</Text>
      </Pressable>

      <Pressable
        style={[styles.startBtn, !selectedMode && styles.startBtnDisabled]}
        onPress={handleStart}
        disabled={!selectedMode}
      >
        <Text style={styles.startBtnText}>{selectedMode ? '코스 설정하기 →' : '모드를 선택하세요'}</Text>
      </Pressable>
    </View>
  );
}
