import React, { useState, useEffect } from 'react';
import FullMap from './FullMap';
import ControlPanel from './DistanceBottomSheet';
import { CourseManager } from '../logic/courseManager';
import { generateCourseDescription } from '../logic/courseDescription';

const MainPage = ({ runMode = 'roundTrip', onBack }) => {
    const [courseData, setCourseData] = useState({
        startPoint: null,
        turnaroundPoint: null,
        routePath: []
    });
    const [isLoading, setIsLoading] = useState(false);
    const [courseDescription, setCourseDescription] = useState(null);
    const [lastDistance, setLastDistance] = useState(0);

    // Default to 'custom' (Map Selection)
    const [startMode, setStartMode] = useState('custom'); // 'current' | 'custom'
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
            courseManager.gps.getCurrentPosition().then(setGpsLocation).catch(e => {
                alert("GPS 위치 정보를 가져올 수 없습니다. 권한을 확인해주세요.");
            });
        }
    };

    const handleCenterChange = (latlng) => {
        setCurrentMapCenter(latlng);
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
                result = await courseManager.generateOneWayCourse(start, targetDistance);
            } else {
                result = await courseManager.generateCourseFromPoint(start, targetDistance);
            }

            const endPoint = result.turnaroundPoint || result.endPoint;

            setCourseData({
                startPoint: result.startPoint,
                turnaroundPoint: endPoint,
                routePath: result.routePath
            });

            setLastDistance(targetDistance);

            // Generate course description (async, non-blocking)
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
            alert("경로 생성에 실패했습니다.\n\n가능한 원인:\n1. OSRM 서버 응답 지연 (잠시 후 다시 시도)\n2. 시작점 주변에 인식 가능한 도로 없음\n3. 네트워크 연결 불안정");
        } finally {
            setIsLoading(false);
        }
    };

    const isReady = startMode === 'custom' || (startMode === 'current' && !!gpsLocation);

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

            {/* Course Description Card */}
            {courseDescription && (
                <div
                    style={{
                        position: 'absolute',
                        top: '100px',
                        left: '16px',
                        right: '16px',
                        zIndex: 1500,
                        borderRadius: '16px',
                        padding: '16px 20px',
                        background: 'rgba(18,18,18,0.85)',
                        backdropFilter: 'blur(16px)',
                        border: '1px solid rgba(255,255,255,0.08)',
                        boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
                        animation: 'slideDown 0.4s ease-out'
                    }}
                >
                    <div style={{
                        fontSize: '1.05rem',
                        fontWeight: '800',
                        color: '#fff',
                        marginBottom: '6px',
                        lineHeight: '1.4'
                    }}>
                        {courseDescription.title}
                    </div>
                    <div style={{
                        fontSize: '0.8rem',
                        color: 'rgba(255,255,255,0.55)',
                        marginBottom: '10px',
                        lineHeight: '1.4'
                    }}>
                        {courseDescription.subtitle}
                    </div>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                        {courseDescription.tags.map((tag, i) => (
                            <span key={i} style={{
                                fontSize: '0.7rem',
                                fontWeight: '600',
                                padding: '4px 10px',
                                borderRadius: '10px',
                                background: runMode === 'oneWay'
                                    ? 'rgba(255,158,0,0.15)'
                                    : 'rgba(0,243,255,0.15)',
                                color: runMode === 'oneWay' ? '#ff9e00' : '#00f3ff',
                                letterSpacing: '0.5px'
                            }}>
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            )}

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
            />

            {/* Bottom Control Panel */}
            <ControlPanel
                onStart={handleCreateCourse}
                isLoading={isLoading}
                isReady={isReady}
                startMode={startMode}
                runMode={runMode}
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
