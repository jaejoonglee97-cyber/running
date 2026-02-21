import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Pressable, Text } from 'react-native';
import { router } from 'expo-router';
import MapView from '../components/MapView';
import DistanceBottomSheet from '../components/DistanceBottomSheet';
import SaveCourseModal from '../components/SaveCourseModal';
import SharedCoursesPanel from '../components/SharedCoursesPanel';
import { CourseManager } from '../logic/courseManager';
import { generateCourseDescription } from '../logic/courseDescription';
import { saveCourse } from '../logic/sheetsApi';
import type { RunMode } from '../types/course';
import type { LatLng } from '../types/course';
import type { CourseDescription } from '../types/course';

interface MainScreenProps {
  runMode: RunMode;
}

export default function MainScreen({ runMode }: MainScreenProps) {
  const [courseData, setCourseData] = useState<{ startPoint: LatLng | null; turnaroundPoint: LatLng | null; routePath: LatLng[] }>({
    startPoint: null,
    turnaroundPoint: null,
    routePath: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [courseDescription, setCourseDescription] = useState<CourseDescription | null>(null);
  const [lastDistance, setLastDistance] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSharedCourses, setShowSharedCourses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [startMode, setStartMode] = useState<'custom' | 'current'>('custom');
  const [currentMapCenter, setCurrentMapCenter] = useState<LatLng | null>(null);
  const [gpsLocation, setGpsLocation] = useState<LatLng | null>(null);
  const [waypoints, setWaypoints] = useState<LatLng[]>([]);
  const [waypointMode, setWaypointMode] = useState(false);

  const courseManager = new CourseManager();

  useEffect(() => {
    courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(() => {});
  }, []);

  const handleCreateCourse = async (targetDistance: number) => {
    setIsLoading(true);
    setCourseDescription(null);
    try {
      let start: LatLng;
      if (startMode === 'current') {
        start = gpsLocation ?? (await courseManager.gps.getCurrentPosition());
        if (!gpsLocation) setGpsLocation(start);
      } else {
        if (!currentMapCenter) {
          alert('지도를 움직여 시작 위치를 설정해주세요.');
          setIsLoading(false);
          return;
        }
        start = currentMapCenter;
      }
      const result =
        runMode === 'oneWay'
          ? await courseManager.generateOneWayCourse(start, targetDistance, waypoints)
          : await courseManager.generateCourseFromPoint(start, targetDistance, waypoints);
      const endPoint = result.turnaroundPoint;
      setCourseData({
        startPoint: result.startPoint,
        turnaroundPoint: endPoint,
        routePath: result.routePath,
      });
      setLastDistance(targetDistance);
      setWaypoints([]);
      setWaypointMode(false);
      generateCourseDescription({
        startPoint: result.startPoint,
        endPoint,
        routePath: result.routePath,
        runMode,
        distanceMeters: targetDistance,
      })
        .then(setCourseDescription)
        .catch(() => {});
    } catch (err) {
      console.error(err);
      alert('경로 생성에 실패했습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async ({ courseName, authorName }: { courseName: string; authorName: string }) => {
    setIsSaving(true);
    try {
      const endPoint = courseData.turnaroundPoint!;
      await saveCourse({
        courseName,
        runMode,
        distanceKm: (lastDistance / 1000).toFixed(1),
        startLat: courseData.startPoint!.lat,
        startLng: courseData.startPoint!.lng,
        endLat: endPoint.lat,
        endLng: endPoint.lng,
        routePath: courseData.routePath.map((p) => [p.lat, p.lng]),
        title: courseDescription?.title ?? '',
        subtitle: courseDescription?.subtitle ?? '',
        tags: courseDescription?.tags ?? [],
        authorName,
      });
      setShowSaveModal(false);
    } catch (err) {
      alert('저장에 실패했습니다.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSharedCourse = (course: {
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
  }) => {
    const routePath = Array.isArray(course.routePath)
      ? course.routePath
      : (JSON.parse(course.routePath as string) as [number, number][]).map(([lat, lng]) => ({ lat, lng }));
    setCourseData({
      startPoint: { lat: Number(course.startLat), lng: Number(course.startLng) },
      turnaroundPoint: { lat: Number(course.endLat), lng: Number(course.endLng) },
      routePath,
    });
    setCourseDescription({
      title: course.courseName ?? course.title ?? '',
      subtitle: course.subtitle ?? '',
      tags: typeof course.tags === 'string' ? course.tags.split(',') : course.tags ?? [],
    });
    setLastDistance((course.distanceKm ?? 0) * 1000);
  };

  const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);
  const hasDescription = courseData.routePath.length > 0 && courseDescription;

  return (
    <View style={styles.container}>
      <Pressable style={styles.backBtn} onPress={() => router.back()}>
        <Text style={styles.backBtnText}>←</Text>
      </Pressable>

      <View style={styles.badge}>
        <Text style={styles.badgeText}>{runMode === 'oneWay' ? '➡️ 편도' : '🔄 왕복'}</Text>
      </View>

      <Pressable
        style={styles.topRightBtn}
        onPress={() => setStartMode(startMode === 'current' ? 'custom' : 'current')}
      >
        <Text style={styles.topRightBtnText}>{startMode === 'current' ? '📍 현위치' : '🔍 직접설정'}</Text>
      </Pressable>

      {courseDescription && (
        <View style={styles.descCard}>
          <Text style={styles.descTitle}>{courseDescription.title}</Text>
          <Text style={styles.descSubtitle}>{courseDescription.subtitle}</Text>
        </View>
      )}

      <View style={styles.rightButtons}>
        <Pressable style={styles.iconBtn} onPress={() => setWaypointMode(!waypointMode)}>
          <Text style={styles.iconBtnText}>📍 경유지{waypoints.length ? ` (${waypoints.length})` : ''}</Text>
        </Pressable>
        {hasDescription && (
          <Pressable style={styles.iconBtn} onPress={() => setShowSaveModal(true)}>
            <Text style={styles.iconBtnText}>📌 코스 저장</Text>
          </Pressable>
        )}
        <Pressable style={styles.iconBtn} onPress={() => setShowSharedCourses(true)}>
          <Text style={styles.iconBtnText}>🔥 추천 코스</Text>
        </Pressable>
      </View>

      <MapView
        startPoint={courseData.startPoint}
        turnaroundPoint={courseData.turnaroundPoint}
        routePath={courseData.routePath}
        isLoading={isLoading}
        isCustomMode={startMode === 'custom'}
        onCenterChange={setCurrentMapCenter}
        runMode={runMode}
        waypoints={waypoints}
        waypointMode={waypointMode}
        onWaypointAdd={(p) => setWaypoints((prev) => (prev.length >= 3 ? prev : [...prev, p]))}
        onWaypointRemove={(i) => setWaypoints((prev) => prev.filter((_, idx) => idx !== i))}
      />

      <DistanceBottomSheet
        onStart={handleCreateCourse}
        isLoading={isLoading}
        isReady={isReady}
        startMode={startMode}
        runMode={runMode}
      />

      <SaveCourseModal
        visible={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveCourse}
        courseDescription={courseDescription}
        isLoading={isSaving}
      />

      <SharedCoursesPanel
        visible={showSharedCourses}
        onClose={() => setShowSharedCourses(false)}
        onLoadCourse={handleLoadSharedCourse}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#121212',
  },
  backBtn: {
    position: 'absolute',
    top: 50,
    left: 16,
    zIndex: 1600,
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,20,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  backBtnText: { fontSize: 24, color: '#fff' },
  badge: {
    position: 'absolute',
    top: 52,
    left: '50%',
    marginLeft: -60,
    zIndex: 1600,
    paddingHorizontal: 18,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: 'rgba(20,20,20,0.8)',
  },
  badgeText: { fontSize: 14, fontWeight: '700', color: '#00f3ff' },
  topRightBtn: {
    position: 'absolute',
    top: 50,
    right: 16,
    zIndex: 1600,
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,20,0.8)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  topRightBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  descCard: {
    position: 'absolute',
    top: 100,
    left: 16,
    right: 80,
    zIndex: 1500,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(18,18,18,0.9)',
  },
  descTitle: { fontSize: 16, fontWeight: '800', color: '#fff', marginBottom: 4 },
  descSubtitle: { fontSize: 12, color: 'rgba(255,255,255,0.55)' },
  rightButtons: {
    position: 'absolute',
    top: 100,
    right: 16,
    zIndex: 1600,
    gap: 8,
  },
  iconBtn: {
    height: 44,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: 'rgba(20,20,20,0.8)',
    justifyContent: 'center',
  },
  iconBtnText: { fontSize: 13, fontWeight: '700', color: '#fff' },
});
