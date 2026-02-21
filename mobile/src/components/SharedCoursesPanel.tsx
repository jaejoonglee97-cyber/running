import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Modal,
  Pressable,
  FlatList,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { fetchSharedCourses, fetchCourseDetail, likeCourse } from '../logic/sheetsApi';
import { PRESET_AREAS, PRESET_COURSES } from '../logic/presetCourses';
import { CourseManager } from '../logic/courseManager';
import type { SharedCourseListItem } from '../types/sheets';
import type { LatLng } from '../types/course';
import type { PresetCourse } from '../types/course';

interface SharedCoursesPanelProps {
  visible: boolean;
  onClose: () => void;
  onLoadCourse: (course: {
    startLat: number;
    startLng: number;
    endLat: number;
    endLng: number;
    routePath: LatLng[] | string;
    courseName?: string;
    title?: string;
    subtitle?: string;
    tags?: string[] | string;
    distanceKm?: number;
    runMode?: string;
  }) => void;
}

export default function SharedCoursesPanel({ visible, onClose, onLoadCourse }: SharedCoursesPanelProps) {
  const [activeTab, setActiveTab] = useState<'preset' | 'shared'>('preset');
  const [selectedArea, setSelectedArea] = useState('gangbuk');
  const [courses, setCourses] = useState<SharedCourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const courseManager = new CourseManager();

  useEffect(() => {
    if (visible && activeTab === 'shared') {
      setIsLoading(true);
      fetchSharedCourses().then(setCourses).finally(() => setIsLoading(false));
    }
  }, [visible, activeTab]);

  const handleLoadPreset = async (preset: PresetCourse) => {
    setLoadingId(preset.id);
    try {
      const result = await courseManager.generatePresetCourse(preset);
      onLoadCourse({
        startLat: result.startPoint.lat,
        startLng: result.startPoint.lng,
        endLat: result.turnaroundPoint.lat,
        endLng: result.turnaroundPoint.lng,
        routePath: result.routePath,
        courseName: preset.courseName,
        title: preset.courseName,
        subtitle: preset.subtitle,
        tags: preset.tags,
        distanceKm: Number(preset.distanceKm),
      });
      onClose();
    } catch (err) {
      alert('경로 생성에 실패했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const handleLoadShared = async (id: string) => {
    setLoadingId(id);
    try {
      const detail = await fetchCourseDetail(id);
      if (detail) {
        const routePath = typeof detail.routePath === 'string' ? JSON.parse(detail.routePath) : detail.routePath;
        onLoadCourse({
          startLat: detail.startLat ?? 0,
          startLng: detail.startLng ?? 0,
          endLat: detail.endLat ?? 0,
          endLng: detail.endLng ?? 0,
          routePath: Array.isArray(routePath) ? routePath.map(([lat, lng]: [number, number]) => ({ lat, lng })) : [],
          courseName: detail.courseName,
          title: detail.title,
          subtitle: detail.subtitle,
          tags: detail.tags,
          distanceKm: Number(detail.distanceKm) || 0,
        });
        onClose();
      }
    } catch {
      alert('코스를 불러오는데 실패했습니다.');
    } finally {
      setLoadingId(null);
    }
  };

  const filteredPresets = PRESET_COURSES.filter((c) => c.area === selectedArea);
  const currentArea = PRESET_AREAS.find((a) => a.id === selectedArea);

  return (
    <Modal visible={visible} transparent animationType="slide">
      <Pressable style={styles.overlay} onPress={onClose}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text style={styles.sheetTitle}>러닝 코스 🔥</Text>
          <Text style={styles.sheetSubtitle}>서울 인기 코스를 달려보세요</Text>

          <View style={styles.tabs}>
            <Pressable
              style={[styles.tab, activeTab === 'preset' && styles.tabActive]}
              onPress={() => setActiveTab('preset')}
            >
              <Text style={[styles.tabText, activeTab === 'preset' && styles.tabTextActive]}>📍 추천 코스</Text>
            </Pressable>
            <Pressable
              style={[styles.tab, activeTab === 'shared' && styles.tabActiveOrange]}
              onPress={() => setActiveTab('shared')}
            >
              <Text style={[styles.tabText, activeTab === 'shared' && { color: '#ff9e00' }]}>🏃 공유 코스</Text>
            </Pressable>
          </View>

          {activeTab === 'preset' ? (
            <>
              <View style={styles.areaRow}>
                {PRESET_AREAS.map((area) => (
                  <Pressable
                    key={area.id}
                    style={[styles.areaChip, selectedArea === area.id && styles.areaChipActive]}
                    onPress={() => setSelectedArea(area.id)}
                  >
                    <Text style={[styles.areaChipText, selectedArea === area.id && styles.areaChipTextActive]}>
                      {area.emoji} {area.name}
                    </Text>
                  </Pressable>
                ))}
              </View>
              <Text style={styles.areaDesc}>
                {currentArea?.emoji} {currentArea?.name} · {filteredPresets.length}개 코스
              </Text>
              <FlatList
                data={filteredPresets}
                keyExtractor={(item) => item.id}
                renderItem={({ item }) => (
                  <Pressable
                    style={styles.courseCard}
                    onPress={() => handleLoadPreset(item)}
                    disabled={!!loadingId}
                  >
                    <Text style={styles.courseName}>{item.courseName}</Text>
                    <Text style={styles.courseSubtitle}>{item.subtitle}</Text>
                    {loadingId === item.id ? (
                      <ActivityIndicator color="#00f3ff" style={{ marginTop: 8 }} />
                    ) : null}
                  </Pressable>
                )}
              />
            </>
          ) : (
            <>
              {isLoading && courses.length === 0 ? (
                <ActivityIndicator color="#00f3ff" size="large" style={{ marginTop: 40 }} />
              ) : courses.length === 0 ? (
                <Text style={styles.emptyText}>아직 공유된 코스가 없어요{'\n'}첫 번째 코스를 공유해 보세요!</Text>
              ) : (
                <FlatList
                  data={courses}
                  keyExtractor={(item) => String(item.id)}
                  renderItem={({ item }) => (
                    <Pressable
                      style={styles.courseCard}
                      onPress={() => handleLoadShared(String(item.id))}
                      disabled={!!loadingId}
                    >
                      <Text style={styles.courseName}>{item.courseName ?? item.title}</Text>
                      <Text style={styles.courseSubtitle}>{item.title ?? item.subtitle}</Text>
                      {loadingId === String(item.id) ? (
                        <ActivityIndicator color="#00f3ff" style={{ marginTop: 8 }} />
                      ) : null}
                    </Pressable>
                  )}
                />
              )}
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#1a1a2e',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingBottom: 24,
    maxHeight: '85%',
  },
  handle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255,255,255,0.2)',
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  sheetTitle: { fontSize: 22, fontWeight: '800', color: '#fff', marginBottom: 4 },
  sheetSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.4)', marginBottom: 12 },
  tabs: { flexDirection: 'row', gap: 4, marginBottom: 12 },
  tab: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(255,255,255,0.04)',
    alignItems: 'center',
  },
  tabActive: { backgroundColor: 'rgba(0,243,255,0.15)' },
  tabActiveOrange: { backgroundColor: 'rgba(255,158,0,0.15)' },
  tabText: { fontSize: 14, fontWeight: '700', color: 'rgba(255,255,255,0.4)' },
  tabTextActive: { color: '#00f3ff' },
  areaRow: { flexDirection: 'row', gap: 6, marginBottom: 8 },
  areaChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.04)',
  },
  areaChipActive: { backgroundColor: 'rgba(0,243,255,0.12)' },
  areaChipText: { fontSize: 13, fontWeight: '700', color: 'rgba(255,255,255,0.5)' },
  areaChipTextActive: { color: '#00f3ff' },
  areaDesc: { fontSize: 12, color: 'rgba(255,255,255,0.35)', marginBottom: 10 },
  courseCard: {
    padding: 16,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.04)',
    marginBottom: 10,
  },
  courseName: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  courseSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.4)' },
  emptyText: {
    textAlign: 'center',
    color: 'rgba(255,255,255,0.4)',
    marginTop: 40,
    lineHeight: 22,
  },
});
