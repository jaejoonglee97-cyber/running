import React, { useState, useEffect } from 'react';
import FullMap from './FullMap';
import ControlPanel from './DistanceBottomSheet';
import SaveCourseModal from './SaveCourseModal';
import SharedCoursesPanel from './SharedCoursesPanel';
import { CourseManager } from '../logic/courseManager';
import { generateCourseDescription } from '../logic/courseDescription';
import { saveCourse } from '../logic/sheetsApi';

const MainPage = ({ runMode = 'roundTrip', onBack }) => {
    const [courseData, setCourseData] = useState({
        startPoint: null,
        turnaroundPoint: null,
        routePath: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [courseDescription, setCourseDescription] = useState(null);
    const [lastDistance, setLastDistance] = useState(0);

    // 코스 공유 관련 state
    const [showSaveModal, setShowSaveModal] = useState(false);
    const [showSharedCourses, setShowSharedCourses] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [saveSuccess, setSaveSuccess] = useState(false);

    // 경유지 관련 state
    const [waypoints, setWaypoints] = useState([]);
    const [waypointMode, setWaypointMode] = useState(false);

    // Default to 'custom' (Map Selection)
    const [startMode, setStartMode] = useState('custom');
    const [currentMapCenter, setCurrentMapCenter] = useState(null);
    const [gpsLocation, setGpsLocation] = useState(null);

    const courseManager = new CourseManager();

    // Initialize GPS
    useEffect(() => {
        const initGps = async () => {
            try {
                const pos = await courseManager.gps.getCurrentPosition();
                setGpsLocation(pos);
                console.log("GPS Initialized:", pos);
            } catch (e) {
                console.warn("GPS Initialization failed (passive):", e);
            }
        };
        initGps();
    }, []);

    const handleModeChange = (mode) => {
        setStartMode(mode);
        if (mode === 'current' && !gpsLocation) {
            courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(() => {
                alert("GPS 위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
            });
        }
    };

    const handleCenterChange = (latlng) => {
        setCurrentMapCenter(latlng);
    };

    // === 경유지 추가/제거 ===
    const handleAddWaypoint = (point) => {
        if (waypoints.length >= 3) {
            alert("경유지는 최대 3개까지 추가할 수 있습니다.");
            return;
        }
        setWaypoints(prev => [...prev, point]);
        // 자동으로 경유지 모드 해제 (하나 추가 후)
        setWaypointMode(false);
    };

    const handleRemoveWaypoint = (index) => {
        setWaypoints(prev => prev.filter((_, i) => i !== index));
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
                    alert("지도를 움직여 시작 위치를 설정해주세요.");
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
                routePath: result.routePath
            });

            setLastDistance(targetDistance);

            // 코스 생성 성공 후 경유지 초기화 (이전 경유지가 다음 생성에 간섭하지 않도록)
            setWaypoints([]);
            setWaypointMode(false);

            // Generate course description
            generateCourseDescription({
                startPoint: result.startPoint,
                endPoint: endPoint,
                routePath: result.routePath,
                runMode: runMode,
                distanceMeters: targetDistance
            }).then(desc => {
                setCourseDescription(desc);
            }).catch(err => {
                console.warn("Course description generation failed:", err);
            });

        } catch (error) {
            console.error("Failed to generate course:", error);
            alert("경로 생성에 실패했습니다.\n(자동 재시도 후에도 실패)\n\n💡 해결 방법:\n1. 10초 후 다시 시도해 주세요\n2. 시작점을 도로 근처로 이동해 보세요\n3. Wi-Fi/데이터 연결을 확인해 주세요");
        } finally {
            setIsLoading(false);
        }
    };

    // === 코스 저장 핸들러 ===
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
                authorName
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

    // === 공유 코스 불러오기 ===
    const handleLoadSharedCourse = (course) => {
        const routePath = Array.isArray(course.routePath)
            ? course.routePath
            : (typeof course.routePath === 'string' ? JSON.parse(course.routePath) : []);

        setCourseData({
            startPoint: { lat: Number(course.startLat), lng: Number(course.startLng) },
            turnaroundPoint: { lat: Number(course.endLat), lng: Number(course.endLng) },
            routePath
        });
        setCourseDescription({
            title: course.courseName || course.title,
            subtitle: course.subtitle || '',
            tags: typeof course.tags === 'string' ? course.tags.split(',') : (course.tags || [])
        });
        setLastDistance(Number(course.distanceKm) * 1000);
    };

    const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);

    // 우측 버튼 위치 계산
    const hasDescription = courseData.routePath.length > 0 && courseDescription;
    let rightBtnTop = 100;

    return (
        <div style={{ position: 'relative', width: '100vw', height: '100vh', overflow: 'hidden', background: '#121212' }}>
            {/* Back Button */}
            <button
                onClick={onBack}
                style={{
                    position: 'absolute',
                    top: '50px',
                    left: '16px',
                    zIndex: 1600,
                    width: '44px',
                    height: '44px',
                    borderRadius: '14px',
                    background: 'rgba(20,20,20,0.7)',
                    backdropFilter: 'blur(12px)',
                    color: 'white',
                    fontSize: '1.3rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                    border: '1px solid rgba(255,255,255,0.1)'
                }}
            >
                ←
            </button>

            {/* Mode Badge (shows current run type) */}
            <div style={{
                position: 'absolute',
                top: '52px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1600,
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '20px',
                background: 'rgba(20,20,20,0.7)',
                backdropFilter: 'blur(12px)',
                border: '1px solid rgba(255,255,255,0.1)',
                boxShadow: '0 2px 10px rgba(0,0,0,0.3)'
            }}>
                <span style={{ fontSize: '1rem' }}>
                    {runMode === 'oneWay' ? '➡️' : '🔄'}
                </span>
                <span style={{
                    fontSize: '0.85rem',
                    fontWeight: '700',
                    color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                    letterSpacing: '1px'
                }}>
                    {runMode === 'oneWay' ? '편도' : '왕복'}
                </span>
            </div>

            {/* GPS / Map Select Toggle */}
            <button
                onClick={() => handleModeChange(startMode === 'current' ? 'custom' : 'current')}
                style={{
                    position: 'absolute',
                    top: '50px',
                    right: '16px',
                    zIndex: 1600,
                    height: '44px',
                    borderRadius: '14px',
                    background: startMode === 'current'
                        ? 'rgba(0,243,255,0.2)'
                        : 'rgba(20,20,20,0.7)',
                    backdropFilter: 'blur(12px)',
                    color: 'white',
                    fontSize: '0.8rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '0 14px',
                    boxShadow: startMode === 'current'
                        ? '0 0 15px rgba(0,243,255,0.3)'
                        : '0 2px 10px rgba(0,0,0,0.3)',
                    border: startMode === 'current'
                        ? '1px solid rgba(0,243,255,0.4)'
                        : '1px solid rgba(255,255,255,0.1)',
                    transition: 'all 0.3s ease'
                }}
            >
                <span style={{ fontSize: '1.1rem' }}>
                    {startMode === 'current' ? '📍' : '🔍'}
                </span>
                {startMode === 'current' ? '현위치' : '직접설정'}
            </button>

            {/* Course Description Card */}
            {courseDescription && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100px',
                        left: '16px',
                        right: '80px',
                        zIndex: 1500,
                        borderRadius: '16px',
                        padding: '14px 18px',
                        background: 'rgba(18,18,18,0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        animation: 'slideDown 0.4s ease-out'
                    }}
                >
                    <div style={{
                        fontSize: '1rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginBottom: '4px',
                        lineHeight: '1.4'
                    }}>
                        {courseDescription.title}
                    </div>
                    <div style={{
                        fontSize: '0.75rem',
                        color: 'rgba(255,255,255,0.55)',
                        marginBottom: '8px',
                        lineHeight: '1.4'
                    }}>
                        {courseDescription.subtitle}
                    </div>
                    <div style={{ display: 'flex', gap: '5px', flexWrap: 'wrap' }}>
                        {courseDescription.tags.map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '0.65rem',
                                fontWeight: '600',
                                padding: '3px 8px',
                                borderRadius: '8px',
                                background: runMode === 'oneWay'
                                    ? 'rgba(255,158,0,0.15)'
                                    : 'rgba(0,243,255,0.15)',
                                color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Right side action buttons */}
            <div style={{
                position: 'absolute',
                top: '100px',
                right: '16px',
                zIndex: 1600,
                display: 'flex',
                flexDirection: 'column',
                gap: '8px'
            }}>
                {/* Waypoint Toggle Button */}
                <button
                    onClick={() => setWaypointMode(!waypointMode)}
                    style={{
                        height: '44px',
                        borderRadius: '14px',
                        background: waypointMode
                            ? 'rgba(168,85,247,0.25)'
                            : 'rgba(20,20,20,0.7)',
                        backdropFilter: 'blur(12px)',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 14px',
                        border: waypointMode
                            ? '1px solid rgba(168,85,247,0.5)'
                            : '1px solid rgba(255,255,255,0.1)',
                        boxShadow: waypointMode
                            ? '0 0 15px rgba(168,85,247,0.3)'
                            : '0 2px 10px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span style={{ fontSize: '1rem' }}>📍</span>
                    경유지{waypoints.length > 0 ? ` (${waypoints.length})` : ''}
                </button>

                {/* Clear Waypoints - only show when waypoints exist */}
                {waypoints.length > 0 && (
                    <button
                        onClick={handleClearWaypoints}
                        style={{
                            height: '36px',
                            borderRadius: '12px',
                            background: 'rgba(255,80,80,0.15)',
                            backdropFilter: 'blur(12px)',
                            color: '#ff5050',
                            fontSize: '0.7rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '4px',
                            padding: '0 12px',
                            border: '1px solid rgba(255,80,80,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        ✕ 초기화
                    </button>
                )}

                {/* Save Course Button */}
                {hasDescription && (
                    <button
                        onClick={() => setShowSaveModal(true)}
                        style={{
                            height: '44px',
                            borderRadius: '14px',
                            background: saveSuccess
                                ? 'rgba(0,200,100,0.25)'
                                : 'rgba(255,158,0,0.2)',
                            backdropFilter: 'blur(12px)',
                            color: 'white',
                            fontSize: '0.8rem',
                            fontWeight: '700',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            padding: '0 14px',
                            border: saveSuccess
                                ? '1px solid rgba(0,200,100,0.4)'
                                : '1px solid rgba(255,158,0,0.4)',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                            transition: 'all 0.3s ease'
                        }}
                    >
                        <span style={{ fontSize: '1rem' }}>
                            {saveSuccess ? '✅' : '📌'}
                        </span>
                        {saveSuccess ? '저장됨!' : '코스 저장'}
                    </button>
                )}

                {/* Browse Shared Courses Button */}
                <button
                    onClick={() => setShowSharedCourses(true)}
                    style={{
                        height: '44px',
                        borderRadius: '14px',
                        background: 'rgba(20,20,20,0.7)',
                        backdropFilter: 'blur(12px)',
                        color: 'white',
                        fontSize: '0.8rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        padding: '0 14px',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.3)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    <span style={{ fontSize: '1rem' }}>🔥</span>
                    추천 코스
                </button>
            </div>

            {/* Map Component */}
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

            {/* Bottom Control Panel */}
            <ControlPanel
                onStart={handleCreateCourse}
                isLoading={isLoading}
                isReady={isReady}
                startMode={startMode}
                runMode={runMode}
            />

            {/* Save Course Modal */}
            <SaveCourseModal
                isOpen={showSaveModal}
                onClose={() => setShowSaveModal(false)}
                onSave={handleSaveCourse}
                courseDescription={courseDescription}
                isLoading={isSaving}
            />

            {/* Shared Courses Panel */}
            <SharedCoursesPanel
                isOpen={showSharedCourses}
                onClose={() => setShowSharedCourses(false)}
                onLoadCourse={handleLoadSharedCourse}
            />

            <style>
                {`
                    @keyframes slideDown {
                        from { opacity: 0; transform: translateY(-15px); }
                        to { opacity: 1; transform: translateY(0); }
                    }
                `}
            </style>
        </div>
    );
};

export default MainPage;
