import React, { useState, useEffect } from 'react';
import FullMap from './FullMap';
import ControlPanel from './DistanceBottomSheet';
import SaveCourseModal from './SaveCourseModal';
import SharedCoursesPanel from './SharedCoursesPanel';
import { CourseManager } from '../logic/courseManager';
import { generateCourseDescription } from '../logic/courseDescription';
import { saveCourse } from '../logic/sheetsApi';
import { Button } from '@/components/ui/button';

const MainPage = ({ runMode = 'roundTrip', onBack }) => {
  const [courseData, setCourseData] = useState({
    startPoint: null,
    turnaroundPoint: null,
    routePath: [],
  });
  const [isLoading, setIsLoading] = useState(false);
  const [courseDescription, setCourseDescription] = useState(null);
  const [lastDistance, setLastDistance] = useState(0);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showSharedCourses, setShowSharedCourses] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [waypoints, setWaypoints] = useState([]);
  const [waypointMode, setWaypointMode] = useState(false);
  const [startMode, setStartMode] = useState('custom');
  const [currentMapCenter, setCurrentMapCenter] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);

  const courseManager = new CourseManager();

  useEffect(() => {
    const initGps = async () => {
      try {
        const pos = await courseManager.gps.getCurrentPosition();
        setGpsLocation(pos);
      } catch (e) {
        console.warn('GPS Initialization failed (passive):', e);
      }
    };
    initGps();
  }, []);

  const handleModeChange = (mode) => {
    setStartMode(mode);
    if (mode === 'current' && !gpsLocation) {
      courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(() => {
        alert('GPS 위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.');
      });
    }
  };

  const handleCenterChange = (latlng) => setCurrentMapCenter(latlng);

  const handleAddWaypoint = (point) => {
    if (waypoints.length >= 3) {
      alert('경유지는 최대 3개까지 추가할 수 있습니다.');
      return;
    }
    setWaypoints((prev) => [...prev, point]);
    setWaypointMode(false);
  };

  const handleRemoveWaypoint = (index) => {
    setWaypoints((prev) => prev.filter((_, i) => i !== index));
  };

  const handleClearWaypoints = () => {
    setWaypoints([]);
    setWaypointMode(false);
  };

  const handleCreateCourse = async (targetDistance) => {
    setIsLoading(true);
    setCourseDescription(null);
    try {
      let start;
      if (startMode === 'current') {
        start = gpsLocation;
        if (!start) {
          start = await courseManager.gps.getCurrentPosition();
          setGpsLocation(start);
        }
      } else {
        if (!currentMapCenter) {
          alert('지도를 움직여 시작 위치를 설정해주세요.');
          setIsLoading(false);
          return;
        }
        start = { lat: currentMapCenter.lat, lng: currentMapCenter.lng };
      }
      let result;
      if (runMode === 'oneWay') {
        result = await courseManager.generateOneWayCourse(start, targetDistance, waypoints);
      } else {
        result = await courseManager.generateCourseFromPoint(start, targetDistance, waypoints);
      }
      const endPoint = result.turnaroundPoint || result.endPoint;
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
        .catch((err) => console.warn('Course description generation failed:', err));
    } catch (error) {
      console.error('Failed to generate course:', error);
      alert('경로 생성에 실패했습니다.\n(자동 재시도 후에도 실패)\n\n💡 해결 방법:\n1. 10초 후 다시 시도해 주세요\n2. 시작점을 도로 근처로 이동해 보세요\n3. Wi-Fi/데이터 연결을 확인해 주세요');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async ({ courseName, authorName }) => {
    setIsSaving(true);
    try {
      const endPoint = courseData.turnaroundPoint;
      await saveCourse({
        courseName,
        runMode,
        distanceKm: (lastDistance / 1000).toFixed(1),
        startLat: courseData.startPoint?.lat || 0,
        startLng: courseData.startPoint?.lng || 0,
        endLat: endPoint?.lat || 0,
        endLng: endPoint?.lng || 0,
        routePath: courseData.routePath,
        title: courseDescription?.title || '',
        subtitle: courseDescription?.subtitle || '',
        tags: courseDescription?.tags || [],
        authorName,
      });
      setShowSaveModal(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('코스 저장 실패:', err);
      alert('코스 저장에 실패했습니다. 다시 시도해주세요.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadSharedCourse = (course) => {
    const routePath = Array.isArray(course.routePath)
      ? course.routePath
      : typeof course.routePath === 'string'
        ? JSON.parse(course.routePath)
        : [];
    setCourseData({
      startPoint: { lat: Number(course.startLat), lng: Number(course.startLng) },
      turnaroundPoint: { lat: Number(course.endLat), lng: Number(course.endLng) },
      routePath,
    });
    setCourseDescription({
      title: course.courseName || course.title,
      subtitle: course.subtitle || '',
      tags: typeof course.tags === 'string' ? course.tags.split(',') : course.tags || [],
    });
    setLastDistance(Number(course.distanceKm) * 1000);
  };

  const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);
  const hasDescription = courseData.routePath.length > 0 && courseDescription;

  return (
    <div className="relative h-screen w-screen overflow-hidden bg-deep-bg">
      <Button
        variant="glass"
        size="icon"
        onClick={onBack}
        className="absolute left-4 top-[50px] z-[1600] h-11 w-11 rounded-[14px] text-[1.3rem] shadow-[0_2px_10px_rgba(0,0,0,0.3)]"
      >
        ←
      </Button>

      <div className="absolute left-1/2 top-[52px] z-[1600] flex -translate-x-1/2 items-center gap-2 rounded-[20px] border border-white/10 bg-[rgba(20,20,20,0.7)] px-[18px] py-2 shadow-[0_2px_10px_rgba(0,0,0,0.3)] backdrop-blur-xl">
        <span className="text-base">{runMode === 'oneWay' ? '➡️' : '🔄'}</span>
        <span
          className="text-[0.85rem] font-bold tracking-wide"
          style={{ color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff' }}
        >
          {runMode === 'oneWay' ? '편도' : '왕복'}
        </span>
      </div>

      <Button
        variant={startMode === 'current' ? 'default' : 'glass'}
        size="sm"
        onClick={() => handleModeChange(startMode === 'current' ? 'custom' : 'current')}
        className="absolute right-4 top-[50px] z-[1600] h-11 gap-1.5 rounded-[14px] px-3.5 text-[0.8rem] font-bold"
        style={{
          background: startMode === 'current' ? 'rgba(0,243,255,0.2)' : undefined,
          boxShadow: startMode === 'current' ? '0 0 15px rgba(0,243,255,0.3)' : undefined,
          borderColor: startMode === 'current' ? 'rgba(0,243,255,0.4)' : undefined,
        }}
      >
        <span className="text-[1.1rem]">{startMode === 'current' ? '📍' : '🔍'}</span>
        {startMode === 'current' ? '현위치' : '직접설정'}
      </Button>

      {courseDescription && (
        <div
          className="absolute left-4 right-20 top-[100px] z-[1500] rounded-2xl border border-white/10 bg-[rgba(18,18,18,0.85)] px-[18px] py-3.5 shadow-[0_8px_32px_rgba(0,0,0,0.4)] backdrop-blur-[16px] animate-[slideDown_0.4s_ease-out]"
        >
          <div className="mb-1 text-base font-extrabold leading-snug text-white">{courseDescription.title}</div>
          <div className="mb-2 text-[0.75rem] leading-snug text-white/55">{courseDescription.subtitle}</div>
          <div className="flex flex-wrap gap-1">
            {courseDescription.tags.map((tag, i) => (
              <span
                key={i}
                className="rounded-lg px-2 py-0.5 text-[0.65rem] font-semibold"
                style={{
                  background: runMode === 'oneWay' ? 'rgba(255,158,0,0.15)' : 'rgba(0,243,255,0.15)',
                  color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="absolute right-4 top-[100px] z-[1600] flex flex-col gap-2">
        <Button
          variant="glass"
          size="sm"
          onClick={() => setWaypointMode(!waypointMode)}
          className="h-11 gap-1.5 rounded-[14px] px-3.5 text-[0.8rem] font-bold"
          style={{
            background: waypointMode ? 'rgba(168,85,247,0.25)' : undefined,
            borderColor: waypointMode ? 'rgba(168,85,247,0.5)' : undefined,
            boxShadow: waypointMode ? '0 0 15px rgba(168,85,247,0.3)' : undefined,
          }}
        >
          <span className="text-base">📍</span>
          경유지{waypoints.length > 0 ? ` (${waypoints.length})` : ''}
        </Button>
        {waypoints.length > 0 && (
          <Button
            variant="destructive"
            size="sm"
            onClick={handleClearWaypoints}
            className="h-9 rounded-xl px-3 text-[0.7rem] font-bold"
          >
            ✕ 초기화
          </Button>
        )}
        {hasDescription && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowSaveModal(true)}
            className="h-11 gap-1.5 rounded-[14px] px-3.5 text-[0.8rem] font-bold"
            style={{
              background: saveSuccess ? 'rgba(0,200,100,0.25)' : 'rgba(255,158,0,0.2)',
              borderColor: saveSuccess ? 'rgba(0,200,100,0.4)' : 'rgba(255,158,0,0.4)',
            }}
          >
            <span className="text-base">{saveSuccess ? '✅' : '📌'}</span>
            {saveSuccess ? '저장됨!' : '코스 저장'}
          </Button>
        )}
        <Button
          variant="glass"
          size="sm"
          onClick={() => setShowSharedCourses(true)}
          className="h-11 gap-1.5 rounded-[14px] px-3.5 text-[0.8rem] font-bold"
        >
          <span className="text-base">🔥</span>
          추천 코스
        </Button>
      </div>

      <FullMap
        startPoint={courseData.startPoint}
        turnaroundPoint={courseData.turnaroundPoint}
        routePath={courseData.routePath}
        isLoading={isLoading}
        isCustomMode={startMode === 'custom'}
        onModeChange={handleModeChange}
        onCenterChange={handleCenterChange}
        runMode={runMode}
        waypoints={waypoints}
        waypointMode={waypointMode}
        onWaypointAdd={handleAddWaypoint}
        onWaypointRemove={handleRemoveWaypoint}
      />

      <ControlPanel
        onStart={handleCreateCourse}
        isLoading={isLoading}
        isReady={isReady}
        startMode={startMode}
        runMode={runMode}
      />

      <SaveCourseModal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        onSave={handleSaveCourse}
        courseDescription={courseDescription}
        isLoading={isSaving}
      />

      <SharedCoursesPanel
        isOpen={showSharedCourses}
        onClose={() => setShowSharedCourses(false)}
        onLoadCourse={handleLoadSharedCourse}
      />
    </div>
  );
};

export default MainPage;
